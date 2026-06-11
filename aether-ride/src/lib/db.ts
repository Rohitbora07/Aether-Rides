import mongoose from "mongoose"

const mongoUrl = process.env.MONGO_DB_URI

if(!mongoUrl){
    throw new Error("Db url not found")
}

let cached = global.mongooseConnection

if(!cached){
    cached = global.mongooseConnection = {
        conn: null,
        promise: null
    }
}

const connectDB = async () =>{
    if( cached.conn ) return cached.conn

    if( !cached.promise ){
        cached.promise = mongoose.connect(mongoUrl).then(c => c.connection)
    }

    try {
        const conn = await cached.promise
        return conn
    } catch (error) {
        console.log(error)
    }
}

export default connectDB