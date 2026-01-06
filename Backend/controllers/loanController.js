import Loan from "../models/Loan.js";
import User from "../models/User.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * POST /api/loans/request
 * Store loan request and email the user
 */
export const requestLoan = async (req, res) => {
  try {
    const { email, amount, duration, purpose } = req.body;

    if (!email || !amount || !duration)
      return res
        .status(400)
        .json({ message: "email, amount, and duration required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const loan = new Loan({ email, amount, duration, purpose });
    await loan.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Loan Request Submitted",
      html: `
        <h2>Loan Request Confirmation</h2>
        <p>Hello ${user.name},</p>
        <p>Your loan request has been received:</p>
        <ul>
          <li>Amount: <b>${amount}</b></li>
          <li>Duration: <b>${duration}</b></li>
          <li>Purpose: ${purpose || "N/A"}</li>
        </ul>
        <p>We’ll review it and notify you soon.</p>
      `,
    });

    res.status(201).json({ message: "Loan request submitted", loan });
  } catch (err) {
    console.error("requestLoan error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
