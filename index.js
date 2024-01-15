import express from "express";
import mongoose from "mongoose";
import "dotenv/config";

const app = express();
import userRoute from "./routes/user.js";
import ticketRoute from "./routes/ticket.js";

mongoose
  .connect(process.env.DB_CONNECTION)
  .then(() => console.log("Connected"))
  .catch((err) => {
    console.log(err);
  });

app.use(express.json());

app.use("/user", userRoute);
app.use("/ticket", ticketRoute);

app.listen(process.env.PORT, () => {
  console.log(`All good port = ${process.env.PORT}`);
});
