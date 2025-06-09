import mongoose from 'mongoose';

const connectToMongoose = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/bookWise');
        console.log("✅ Connected to MongoDB: bookWise");
    } catch (e) {
        console.error("❌ Error connecting to MongoDB:", e.message);
    }
};

export default connectToMongoose;
