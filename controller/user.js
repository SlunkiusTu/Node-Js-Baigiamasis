import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

import UserModel from "../models/user.js";

const GET_USERS = (req, res) => {
  UserModel.find().then((response) => {
    return res.json({ users: response });
  });
};

const GET_USER = (req, res) => {
  UserModel.findById(req.params.id).then((response) => {
    console.log(response);
    return res.json({ user: response });
  });
};

const GET_USER_TICKETS = (req, res) => {
  UserModel.aggregate([
    {
      $lookup: {
        from: "tickets",
        localField: "bought_tickets",
        foreignField: "_id",
        as: "bought_tickets",
      },
    },
    { $match: { _id: new ObjectId(req.params.id) } },
  ])
    .exec()
    .then((response) => {
      return res.json({ user: response });
    });
};

const GET_USERS_WITH_TICKETS = (req, res) => {
  UserModel.aggregate([
    {
      $lookup: {
        from: "tickets",
        localField: "bought_tickets",
        foreignField: "_id",
        as: "user_bought_tickets",
      },
    },
  ])
    .exec()
    .then((response) => {
      return res.json({ user: response });
    });
};

const SING_UP = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email.includes("@")) {
      return res.status(400).json({ message: "Email address must contain @" });
    }

    const capitalizedLetter = name.charAt(0).toUpperCase() + name.slice(1);

    if (password.length < 6 || !/\d/.test(password)) {
      return res
        .status(400)
        .json({ message: "Password does not meet the requirements" });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const user = new UserModel({
      name: capitalizedLetter,
      email,
      password: hash,
    });

    try {
      const dbResponse = await user.save();
      const token = jwt.sign({ userId: dbResponse._id }, "secret_key", {
        expiresIn: "2h",
      });
      const refreshToken = jwt.sign({ userId: dbResponse._id }, "refresh_key", {
        expiresIn: "1d",
      });
      return res
        .status(201)
        .json({ response: "User was added", token, refreshToken });
    } catch (err) {
      console.log("ERROR: ", err);
      res.status(500).json({ response: "Something went wrong" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ response: "Something went wrong" });
  }
};

const LOGIN = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ response: "Invalid login credentials" });
    }

    bcrypt.compare(req.body.password, user.password, (err, isPasswordMatch) => {
      if (!isPasswordMatch || err) {
        return res.status(401).json({ response: "Invalid login credentials" });
      }

      const token = jwt.sign(
        {
          email: user.email,
          userId: user._id,
        },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );

      const refreshToken = jwt.sign(
        {
          email: user.email,
          userId: user._id,
        },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "1d" }
      );

      return res.status(201).json({ jwt: token, jwt_refresh: refreshToken });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ response: "Something went wrong" });
  }
};

const NEW_TOKEN = (req, res) => {
  const { jwt_refresh_token } = req.body;

  if (!jwt_refresh_token) {
    return res.status(400).json({ message: "No JWT refresh token provided" });
  }

  jwt.verify(
    jwt_refresh_token,
    process.env.JWT_REFRESH_SECRET,
    (err, decoded) => {
      if (err) {
        return res.status(400).json({
          message: "JWT refresh token is invalid or has expired",
        });
      }

      const token = jwt.sign(
        {
          email: decoded.email,
          userId: decoded.userId,
        },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );

      res.status(200).json({ jwt: token, jwt_refresh: jwt_refresh_token });
    }
  );
};

const ADD_MONEY_TO_USER = async (req, res) => {
  const userId = req.params.id;
  const amount = req.body.amount;

  try {
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.money_balance += amount;

    await user.save();

    return res
      .status(200)
      .json({ message: "Successfully added to money_balance" });
  } catch (error) {
    return res.status(500).json({ message: "Error adding to money_balance" });
  }
};

export {
  SING_UP,
  LOGIN,
  NEW_TOKEN,
  GET_USERS,
  GET_USER,
  GET_USERS_WITH_TICKETS,
  GET_USER_TICKETS,
  ADD_MONEY_TO_USER,
};
