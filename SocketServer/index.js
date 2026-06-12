import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import cors from "cors"
import { Server } from "socket.io"
import http from "http"
import User from "./models/user.model.js"

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())

const port = process.env.PORT || 5000
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_URI)
        console.log("MongoDB connected")
    } catch (error) {
        console.error("MongoDB connection error:", error)
        process.exit(1)
    }
}
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: process.env.NEXT_BASE_URL,
    }
})

io.on("connection",(socket) => {
    console.log("New client connected:", socket.id)
    socket.on("identity", async (userId) => {
        socket.userId = userId
        await User.findByIdAndUpdate( userId, {
            socketId: socket.id,
            isOnline: true
        })
    })

    socket.on("updateLocation", async ({userId, latitude, longitude}) => {
        console.log(`Updating location for user ${userId}: (${latitude}, ${longitude})`)
        await User.findByIdAndUpdate(userId, {
            location:{
                type: "Point",
                coordinates: [longitude, latitude]
            }
        })
    })

    socket.on("disconnect", async () => {
        if( !socket.userId ) return
        await User.findByIdAndUpdate( socket.userId, {
            socketId: null,
            isOnline: false
        })
    })
})

server.listen(port, () => {
    connectDB()
    console.log(`Server is running on port ${port}`)
})
