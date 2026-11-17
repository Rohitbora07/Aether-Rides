import mongoose from "mongoose";

const mongoUrl = process.env.MONGO_DB_URI;

if (!mongoUrl) {
    throw new Error("MONGO_DB_URI environment variable is missing.");
}

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    // eslint-disable-next-line no-var
    var mongooseConnection: MongooseCache | undefined;
}

let cached = global.mongooseConnection;

if (!cached) {
    cached = global.mongooseConnection = {
        conn: null,
        promise: null
    };
}

const connectDB = async () => {
    if (cached!.conn) {
        return cached!.conn;
    }

    if (!cached!.promise) {
        const opts = {
            bufferCommands: false,
        };
        cached!.promise = mongoose.connect(mongoUrl, opts).then((m) => m);
    }

    try {
        cached!.conn = await cached!.promise;
        return cached!.conn;
    } catch (error) {
        cached!.promise = null;
        console.error("MongoDB connection failed:", error);
        throw error;
    }
};

export default connectDB;
