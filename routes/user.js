import express from "express";
import auth from "../middleware/auth.js";
const router = express.Router();

import {
  SING_UP,
  LOGIN,
  NEW_TOKEN,
  GET_USERS,
  GET_USER,
  GET_USERS_WITH_TICKETS,
  GET_USER_TICKETS,
  ADD_MONEY_TO_USER,
} from "../controller/user.js";

router.post("/register", SING_UP);
router.post("/login", LOGIN);
router.post("/token", NEW_TOKEN);
router.post("/addMoney/:id", auth, ADD_MONEY_TO_USER);
router.get("/all", auth, GET_USERS);
router.get("/tickets", auth, GET_USERS_WITH_TICKETS);
router.get("/:id/tickets", auth, GET_USER_TICKETS);
router.get("/:id", auth, GET_USER);
export default router;
