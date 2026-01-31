import express from "express";
import AuthController from "../controller/auth_controller.js";

import {
  changePasswordSchema,
  forgetPasswordSchema,
  loginUserSchema,
  registerUserSchema,
} from "../validator/auth_validation_schema.js";
import { validateSchema } from "../validator/validate_schema.js";

const router = express.Router();

// login-specific middleware then controller
router.post("/login", validateSchema(loginUserSchema), AuthController.login);
router.post(
  "/register",
  validateSchema(registerUserSchema),
  AuthController.register,
);
router.post(
  "/forget-password",
  validateSchema(forgetPasswordSchema),
  AuthController.forgetPassword,
);
router.post(
  "/change-password",
  validateSchema(changePasswordSchema),
  AuthController.changePassword,
);

export default router;
