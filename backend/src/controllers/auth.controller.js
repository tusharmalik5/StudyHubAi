import userModel from "../models/user.model.js";
import { sendEmail } from "../services/mail.service.js";
import jwt from "jsonwebtoken";

export async function Register(req, res) {
  const { username, email, password } = req.body;
  const isUserAlreadyRegistered = await userModel.findOne({
    $or: [{ email }, { username }],
  });
  if (isUserAlreadyRegistered) {
    return res.status(400).json({ message: "User already registered" });
  }

  const user = await userModel.create({ username, email, password });

  const tokenVerification = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  await sendEmail({
    to: email,
    subject: "Welcome to StudyHubAi!",
    html: `
                <p>Hi ${username},</p>
                <p>Thank you for registering at <strong>StudyHubAi</strong>. We're excited to have you on board!</p>
                  <p>Please verify your email address by clicking the link below:</p>
                <a href="http://localhost:5173/verify-email?token=${tokenVerification}">Verify Email</a>
                <p>If you did not create an account, please ignore this email.</p>
                <p>Best regards,<br>The StudyHubAi Team</p>
        `,
  });

  return res.status(201).json({
    message: "User registered successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

export async function Login(req, res) {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.cookie("token", token);

  return res.status(200).json({
    message: "Login successful",
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

export async function getMe(req, res) {
  const userId = req.user.userId;

  const user = await userModel.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json({
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

export async function verifyEmail(req, res) {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isverified = true;
    await user.save();

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }
}
