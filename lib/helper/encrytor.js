import { env } from "../config/env.js";
import bcrypt from "bcrypt";

export const encryptText = async (value) => {
  try {
    const salt = await bcrypt.genSalt(Number(env.ENCRYPT_SALT));
    const hash = await bcrypt.hash(value, salt);
    return hash;
  } catch (error) {
    throw new Error(`Failed to encrypt text: ${error.message}`);
  }
};

export const decryptMatch = async (value, hash) => {
  try {
    const match = await bcrypt.compare(value, hash);
    return match;
  } catch (error) {
    throw Error("Failed to de crypt text");
  }
};
