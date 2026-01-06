import mongoose from "mongoose";

const loanSchema = new mongoose.Schema(
  {
    email: { type: String, required: true }, // user requesting the loan
    amount: { type: Number, required: true },
    duration: { type: Number, required: true }, // in months or days
    purpose: { type: String },
    status: { type: String, default: "pending" }, // pending / approved / rejected
  },
  { timestamps: true }
);

export default mongoose.model("Loan", loanSchema);
