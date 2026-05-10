import { Request, Response } from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";

// REGISTER
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User exists" });

    const hash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hash
    });

    req.session.isLoggedIn = true;
    req.session.userId = newUser._id;

    return res.json({
      message: "Registered",
      user: newUser
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

// LOGIN
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid credentials" });

    req.session.isLoggedIn = true;
    req.session.userId = user._id;

    return res.json({
      message: "Login success",
      user
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

// VERIFY SESSION
export const verifyUser = async (req: Request, res: Response) => {
  try {
    const userId = req.session?.userId;

    if (!userId) return res.status(401).json({ user: null });

    const user = await User.findById(userId).select("-password");

    if (!user) return res.status(401).json({ user: null });

    return res.json({ user });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

// LOGOUT (FIXED)
export const logoutUser = async (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }

    res.clearCookie("connect.sid");

    return res.json({ message: "Logout success" });
  });
};
