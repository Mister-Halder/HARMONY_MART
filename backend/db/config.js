const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const mongoose = require('mongoose');

// Use MONGO_URI from environment variables for production (Render/Atlas), 
// with automatic seamless fallback to local database for development.
const atlasURI = process.env.MONGO_URI;
const localURI = "mongodb://127.0.0.1:27017/e-comm";

async function connectDatabase() {
    if (atlasURI) {
        try {
            console.log("Attempting to connect to MongoDB Atlas...");
            await mongoose.connect(atlasURI, { serverSelectionTimeoutMS: 3000 });
            console.log("Database connected successfully (MongoDB Atlas)");
            return;
        } catch (err) {
            console.warn(`MongoDB Atlas connection failed: ${err.message}`);
            console.log("Falling back to local MongoDB...");
        }
    }

    try {
        await mongoose.connect(localURI, { serverSelectionTimeoutMS: 3000 });
        console.log("Database connected successfully (Local MongoDB: mongodb://127.0.0.1:27017/e-comm)");
    } catch (localErr) {
        console.error("Local MongoDB connection error:", localErr.message);
        console.error("Please ensure MongoDB service is running locally or add your current IP to MongoDB Atlas Network Access whitelist.");
    }
}

connectDatabase();

module.exports = mongoose;
