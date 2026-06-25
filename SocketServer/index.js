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

app.post("/emit", async (req, res) => {
    const { event, userId, data } = req.body
    try{
        console.log("EVENT:", event)
        const user = await User.findById(userId)
        console.log("FOUND USER:", user?._id)
    console.log("SOCKET:", user?.socketId)
        if( user.socketId ){
            io.to(user.socketId).emit(event, data)
        }
        console.log(`Event ${event} emitted to user ${userId}`)
        res.status(200).json({ message: "Event emitted successfully", success: true })
    }catch(err){
        console.error("Error emitting event:", err)
        res.status(500).json({ message: "Failed to emit event", success: false })
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

    socket.on("join-ride", (bookingId) => {
        console.log(`User ${socket.userId} joining ride room: ${bookingId}`)
        socket.join(`ride-${bookingId}`)
    })

    socket.on("driver-location-update", ({bookingId, latitude, longitude, status}) => {
        console.log(`Driver location update for booking ${bookingId}: (${latitude}, ${longitude}), status: ${status}`)
        io.to(`ride-${bookingId}`).emit("driver-location",{
            latitude,
            longitude
        })

        console.log(`Emitted driver location to room ride-${bookingId}`)
    })

    socket.on("chat-message",(data) => {
        console.log(`Chat message for booking ${data.bookingId}:`, data)
        io.to(`ride-${data.bookingId}`).emit("chat-message", data)
    })

    socket.on("disconnect", async () => {
        if( !socket.userId ) return;
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
