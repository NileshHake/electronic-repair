// src/auth/Middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../user_model.js"; 
import dotenv from "dotenv";
dotenv.config();

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; 
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // ✅ Find the current user
    const currentUser = await User.findOne({
      where: { user_id: decoded.user_id },
      attributes: { exclude: ["user_password"] },
    });

    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    req.currentUser = currentUser.toJSON();
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    res.status(401).json({ message: "Invalid or expired token." });
  }
};
