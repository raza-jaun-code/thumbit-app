import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  ownerEmail: { type: String, required: true }, // whose transaction record this is
  type: { type: String, enum: ["send", "receive"], required: true },
  amount: { type: Number, required: true },
  peerEmail: { type: String, required: true }, // the other party's email
  date: { type: Date, default: Date.now },
  status: { type: String, default: "completed" },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.model("Transaction", transactionSchema);
