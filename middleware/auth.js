import jwt from "jsonwebtoken";

const authValidator = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Neautorizuota" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Neautorizuota" });
    }

    req.userId = decoded.userId;
    return next();
  });
};

export default authValidator;
