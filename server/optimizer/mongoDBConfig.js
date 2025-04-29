import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// Connect MongoDB
const mongodbUri = process.env.MONGODB_URI;
mongoose
  .connect(mongodbUri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err));

// Schema
const urlSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  url: { type: String, required: true },
});

const Url = mongoose.model("URL", urlSchema);

export { Url };
