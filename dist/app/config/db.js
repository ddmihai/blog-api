"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGO_URI || "";
if (!MONGODB_URI) {
    console.warn("⚠️  MONGODB_URI is not set. Add it to your .env file.");
}
async function connectDB() {
    try {
        if (!MONGODB_URI) {
            throw new Error("MONGODB_URI is missing");
        }
        await mongoose_1.default.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");
        // Optional events
        mongoose_1.default.connection.on("disconnected", () => {
            console.warn("⚠️ MongoDB disconnected");
        });
        mongoose_1.default.connection.on("error", (err) => {
            console.error("MongoDB connection error:", err);
        });
    }
    catch (err) {
        console.error("❌ Failed to connect to MongoDB");
        console.error(err);
        process.exit(1); // stop the app if DB is critical
    }
}
