import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, require: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, require: true },
  bought_tickets: { type: [String], require: false },
  money_balance: { type: Number, default: 0 },
});

const User = mongoose.model("Users", userSchema);

export default User;
