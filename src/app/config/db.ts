import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();


const MONGODB_URI = process.env.MONGO_URI || "";

if (!MONGODB_URI) {
    console.warn("⚠️  MONGODB_URI is not set. Add it to your .env file.");
}

export async function connectDB() {
    try {
        if (!MONGODB_URI) {
            throw new Error("MONGODB_URI is missing");
        }

        await mongoose.connect(MONGODB_URI);

        console.log("✅ Connected to MongoDB");

        // Optional events
        mongoose.connection.on("disconnected", () => {
            console.warn("⚠️ MongoDB disconnected");
        });

        mongoose.connection.on("error", (err) => {
            console.error("MongoDB connection error:", err);
        });

    } catch (err) {
        console.error("❌ Failed to connect to MongoDB");
        console.error(err);
        process.exit(1); // stop the app if DB is critical
    }
}
