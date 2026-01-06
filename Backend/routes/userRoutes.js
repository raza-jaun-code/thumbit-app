import express from "express";
import {
  registerUser,
  getAllUsers,
  getUserByEmail,
  updateUser,
  redeemRewardPoints,
} from "../controllers/userController.js";

const router = express.Router();

// existing
router.post("/register", registerUser);
router.get("/", getAllUsers);
router.get("/:email", getUserByEmail);

// new
router.patch("/update", updateUser);
router.post("/redeem", redeemRewardPoints);

export default router;
