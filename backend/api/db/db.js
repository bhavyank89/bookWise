import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL;

const connectToMongoose = async () => {
    try {
        await mongoose.connect(MONGODB_URL);
        console.log("✅ Connected to MongoDB: bookWise");
    } catch (e) {
        console.error("❌ Error connecting to MongoDB:", e.message);
    }
};

export default connectToMongoose;
