import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET,
  MAILER_USER: process.env.MAILER_USER,
  MAILER_PASS: process.env.MAILER_PASS,
  BASE_URL: process.env.BASE_URL,
  ACCESS_TOKEN_VALIDITY: process.env.ACCESS_TOKEN_VALIDITY,
  REFRESH_TOKEN_VALIDITY: process.env.REFRESH_TOKEN_VALIDITY,
  RESET_PASS_TOKEN_VALIDITY: process.env.RESET_PASS_TOKEN_VALIDITY,
  MONGO_DB_CONNECTION_URL: process.env.MONGO_DB_CONNECTION_URL,
  ENCRYPT_SALT: process.env.ENCRYPT_SALT,
};
