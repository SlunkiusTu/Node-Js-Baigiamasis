import express from "express";
import auth from "../middleware/auth.js";
const router = express.Router();

import { BUY_TICKET, ADD_TICKET } from "../controller/ticket.js";

router.post("/add", ADD_TICKET);
router.post("/buy", auth, BUY_TICKET);

export default router;
