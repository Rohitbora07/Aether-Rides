import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import cors from "cors"
import { Server } from "socket.io"
import http from "http"
import User from "./models/user.model.js"

dotenv.config()
const app = express()

const allowedOrigins = process.env.NEXT_BASE_URL
    ? [process.env.NEXT_BASE_URL, process.env.NEXT_BASE_URL.replace(/\/$/, "")]
    : "*"

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}))
app.use(express.json())

const port = process.env.PORT || 5000

const connectDB = async () => {
    try {
        if (!process.env.MONGO_DB_URI) {
            console.error("MONGO_DB_URI not configured in SocketServer")
            return
        }
        await mongoose.connect(process.env.MONGO_DB_URI)
        console.log("MongoDB connected in SocketServer")
    } catch (error) {
        console.error("MongoDB connection error in SocketServer:", error)
    }
}

const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
})

app.get("/", (req, res) => {
    res.status(200).json({ status: "Aether Rides Socket Server is Running", activeConnections: io.engine.clientsCount })
})

app.post("/emit", async (req, res) => {
    const { event, userId, data } = req.body
    try {
        console.log(`[SocketServer] Request to emit event: ${event} to user: ${userId}`)
        if (!userId) {
            return res.status(400).json({ message: "userId is required", success: false })
        }
        const user = await User.findById(userId)
        if (user && user.socketId) {
            io.to(user.socketId).emit(event, data)
            console.log(`[SocketServer] Emitted ${event} to socket ${user.socketId}`)
        } else {
            console.log(`[SocketServer] User ${userId} is currently offline or has no active socket`)
        }
        return res.status(200).json({ message: "Event emitted successfully", success: true })
    } catch (err) {
        console.error("[SocketServer] Error in /emit:", err)
        return res.status(500).json({ message: "Failed to emit event", success: false })
    }
})

io.on("connection", (socket) => {
    console.log("[SocketServer] Client connected:", socket.id)

    socket.on("identity", async (userId) => {
        try {
            if (!userId) return
            socket.userId = userId
            await User.findByIdAndUpdate(userId, {
                socketId: socket.id,
                isOnline: true
            })
            console.log(`[SocketServer] User ${userId} registered online with socket ${socket.id}`)
        } catch (err) {
            console.error("[SocketServer] Error setting user identity:", err)
        }
    })

    socket.on("updateLocation", async ({ userId, latitude, longitude }) => {
        try {
            if (!userId || latitude === undefined || longitude === undefined || isNaN(latitude) || isNaN(longitude)) return
            await User.findByIdAndUpdate(userId, {
                location: {
                    type: "Point",
                    coordinates: [Number(longitude), Number(latitude)]
                }
            })
        } catch (err) {
            console.error(`[SocketServer] Error updating location for ${userId}:`, err)
        }
    })

    socket.on("join-ride", (bookingId) => {
        try {
            if (!bookingId) return
            console.log(`[SocketServer] User ${socket.userId || socket.id} joining room: ride-${bookingId}`)
            socket.join(`ride-${bookingId}`)
        } catch (err) {
            console.error("[SocketServer] Error in join-ride:", err)
        }
    })

    socket.on("driver-location-update", ({ bookingId, latitude, longitude, status }) => {
        try {
            if (!bookingId || latitude === undefined || longitude === undefined) return
            io.to(`ride-${bookingId}`).emit("driver-location", {
                latitude: Number(latitude),
                longitude: Number(longitude),
                status
            })
        } catch (err) {
            console.error("[SocketServer] Error broadcasting driver location:", err)
        }
    })

    socket.on("chat-message", (data) => {
        try {
            if (!data?.bookingId) return
            io.to(`ride-${data.bookingId}`).emit("chat-message", data)
        } catch (err) {
            console.error("[SocketServer] Error broadcasting chat message:", err)
        }
    })

    socket.on("disconnect", async () => {
        try {
            console.log("[SocketServer] Client disconnected:", socket.id)
            if (!socket.userId) return
            await User.findByIdAndUpdate(socket.userId, {
                socketId: null,
                isOnline: false
            })
        } catch (err) {
            console.error("[SocketServer] Error handling disconnect:", err)
        }
    })
})

server.listen(port, () => {
    connectDB()
    console.log(`[SocketServer] Server is running on port ${port}`)
})
