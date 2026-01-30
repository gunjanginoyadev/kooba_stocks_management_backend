import nodemailer from "nodemailer";
import { generateResetPasswordToken } from "./token_generator.js";
import { env } from "../config/env.js";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.MAILER_USER,
    pass: env.MAILER_PASS,
  },
});

export const sendMail = async (mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending reset password email:", error);
    return false;
  }
};
