import nodemailer from "nodemailer";
import User from "../models/User.js";
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
 * POST /api/notifications/reward-claim
 * Send confirmation email for reward redemption
 */
export const sendRewardClaimNotification = async (req, res) => {
  try {
    const { email, productName , pointsUsed } = req.body;

    if (!email || !pointsUsed)
      return res
        .status(400)
        .json({ message: "Email and points are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `${productName} - Reward Claimed Successfully 🎉`,
      html: `
        <h2>Congratulations ${user.name}!</h2>
        <p>You successfully redeemed <b>${pointsUsed}</b> reward points.</p>
        <p>Keep using the app to earn more rewards!</p>
      `,
    });

    res.status(200).json({ message: "Reward claim email sent" });
  } catch (err) {
    console.error("sendRewardClaimNotification error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
