import express from "express";
import { requestLoan } from "../controllers/loanController.js";

const router = express.Router();

router.post("/request", requestLoan);

export default router;
