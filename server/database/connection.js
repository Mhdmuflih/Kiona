import mongoose from "mongoose";

mongoose.set('strictQuery', true);

const connectDB = async () => {
    try {
        // mongoDB connection string
        const con = await mongoose.connect("mongodb://127.0.0.1:27017/KIONA", {
        });
        console.log(`MongoDB connected :${con.connection.host}`);
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    }
}


export default connectDB;
