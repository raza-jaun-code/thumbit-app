import express from "express";
import { sendMoney, receiveMoney, getTransactionsByEmail } from "../controllers/transactionController.js";

const router = express.Router();

router.post("/send", sendMoney);
router.post("/receive", receiveMoney);
router.get("/:email", getTransactionsByEmail);

export default router;
