import express from "express";
import { sendRewardClaimNotification } from "../controllers/notificationController.js";

const router = express.Router();

router.post("/reward-claim", sendRewardClaimNotification);

export default router;
