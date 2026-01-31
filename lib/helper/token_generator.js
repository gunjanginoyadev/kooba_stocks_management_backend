import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const generateAccessToken = (id, email) => {
  return jwt.sign({ id, email }, env.JWT_SECRET, {
    expiresIn: env.ACCESS_TOKEN_VALIDITY,
  });
};

export const generateRefreshToken = (id, email) => {
  return jwt.sign({ id, email }, env.JWT_SECRET, {
    expiresIn: env.REFRESH_TOKEN_VALIDITY,
  });
};

export const generateResetPasswordToken = (email) => {
  return jwt.sign({ email }, env.JWT_SECRET, {
    expiresIn: env.RESET_PASS_TOKEN_VALIDITY,
  });
};

export const generateAuthToken = (id, email) => {
  return {
    accessToken: generateAccessToken(id, email),
    refreshToken: generateRefreshToken(id, email),
  };
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};
