import mongoose from "mongoose";

mongoose.set('strictQuery', true);

const connectDB = async () => {
    try {
        // mongoDB connection string
        const con = await mongoose.connect(process.env.mongoUrl, {
        });
        console.log(`MongoDB connected :${con.connection.host}`.gray.bold);
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    }
}


export default connectDB;
