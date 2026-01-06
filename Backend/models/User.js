import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  balance: { type: Number, default: 1000 },
  rewardPoints: { type: Number, default: 1200 },
  profileImage: { type: String }
}, { timestamps: true });

export default mongoose.model("User", userSchema);