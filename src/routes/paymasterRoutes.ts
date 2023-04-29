import express from "express";
import { getPaymasterAndData } from "../controllers/paymasterControllers";
const router = express.Router();

router.post("/sign", getPaymasterAndData);

module.exports = router;
