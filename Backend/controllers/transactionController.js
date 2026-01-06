import mongoose from "mongoose";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

/**
 * senderEmail: string
 * recipientIdentifier: string (email OR name typed by user)
 * amount: number
 */
export const sendMoney = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { senderEmail, recipientIdentifier, amount } = req.body;
    if (!senderEmail || !recipientIdentifier || !amount) {
      await session.abortTransaction();
      return res.status(400).json({ error: "senderEmail, recipientIdentifier and amount are required" });
    }

    const sender = await User.findOne({ email: senderEmail }).session(session);
    const recipient = await User.findOne({
      $or: [{ email: recipientIdentifier }, { name: recipientIdentifier }]
    }).session(session);

    if (!sender) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Sender not found" });
    }

    if (!recipient) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Recipient not found" });
    }

    const amt = Number(amount);
    if (isNaN(amt) || amt <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ error: "Invalid amount" });
    }

    if (sender.balance < amt) {
      await session.abortTransaction();
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Update balances
    sender.balance -= amt;
    recipient.balance += amt;
    await sender.save({ session });
    await recipient.save({ session });

    const sendTx = new Transaction({
      ownerEmail: sender.email,
      type: "send",
      amount: amt,
      peerEmail: recipient.email,
      date: new Date(),
      status: "completed"
    });
    const receiveTx = new Transaction({
      ownerEmail: recipient.email,
      type: "receive",
      amount: amt,
      peerEmail: sender.email,
      date: new Date(),
      status: "completed"
    });

    await sendTx.save({ session });
    await receiveTx.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.json({
      message: "Transfer completed",
      sendTx,
      receiveTx,
      sender: { email: sender.email, balance: sender.balance },
      recipient: { email: recipient.email, balance: recipient.balance },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("sendMoney error:", err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * Receiver initiates: { receiverEmail, amount }
 * Server finds the other user (only two users) and creates reciprocal records.
 */
export const receiveMoney = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { receiverEmail, amount } = req.body;
    if (!receiverEmail || !amount) {
      await session.abortTransaction();
      return res.status(400).json({ error: "receiverEmail and amount required" });
    }

    const receiver = await User.findOne({ email: receiverEmail }).session(session);
    if (!receiver) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Receiver (current user) not found" });
    }

    // Find other user (since demo will have only two)
    const other = await User.findOne({ email: { $ne: receiverEmail } }).session(session);
    if (!other) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Other user not found" });
    }

    const amt = Number(amount);
    if (isNaN(amt) || amt <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ error: "Invalid amount" });
    }

    // check that the other user (who will be sending) has enough balance
    if (other.balance < amt) {
      await session.abortTransaction();
      return res.status(400).json({ error: "Other user has insufficient balance" });
    }

    other.balance -= amt;
    receiver.balance += amt;
    await other.save({ session });
    await receiver.save({ session });

    const receiveTx = new Transaction({
      ownerEmail: receiver.email,
      type: "receive",
      amount: amt,
      peerEmail: other.email,
      date: new Date(),
      status: "completed"
    });

    const sendTx = new Transaction({
      ownerEmail: other.email,
      type: "send",
      amount: amt,
      peerEmail: receiver.email,
      date: new Date(),
      status: "completed"
    });

    await receiveTx.save({ session });
    await sendTx.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.json({
      message: "Receive request completed",
      receiveTx,
      sendTx,
      receiver: { email: receiver.email, balance: receiver.balance },
      other: { email: other.email, balance: other.balance }
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("receiveMoney error:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const getTransactionsByEmail = async (req, res) => {
  try {
    const email = req.params.email;
    const txs = await Transaction.find({ ownerEmail: email }).sort({ date: -1 });
    res.json(txs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
