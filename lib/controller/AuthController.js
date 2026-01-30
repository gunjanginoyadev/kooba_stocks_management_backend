import ApiResponse from "../helper/ApiResponse.js";
import { sendMail } from "../helper/mailer.js";
import {
  generateResetPasswordToken,
  generateAuthToken,
  verifyToken,
} from "../helper/token_generator.js";
import { resetPasswordEmailTemplate } from "../helper/email_template.js";
import { env } from "../config/env.js";
import { UserModel } from "../models/User.js";
import { encryptText } from "../helper/encrytor.js";

class AuthController {
  static login = async (req, res) => {
    try {
      const { email, password } = req.body || {};

      const user = await UserModel.findOne({ email: email }).exec();

      if (user == null) {
        return ApiResponse.error(res, "Invalid Credentials");
      }

      const isPasswordCorrect = await decryptMatch(password, user.password);
      if (isPasswordCorrect) {
        return ApiResponse.error(res, "Incorrect password");
      }

      const tokens = generateAuthToken(user.id, user.email);

      return ApiResponse.success(res, "Login API hit successfully", {
        email,
        password,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error) {
      return ApiResponse.error(res);
    }
  };

  static register = async (req, res) => {
    try {
      const { name, email, password, username } = req.body || {};

      // Check is the email is used or not
      const user = await UserModel.findOne({ email: email }).exec();
      console.log(`user with email: ${user}`);

      if (user != null) {
        return ApiResponse.error(res, "Email Already registered");
      }

      // check if username is already used or not
      const userWithUsername = await UserModel.findOne({
        username: username,
      }).exec();
      console.log(`user with username: ${userWithUsername}`);
      if (userWithUsername != null) {
        return ApiResponse.error(res, "Username already taken");
      }

      // register user
      const encryptedPassword = await encryptText(password);
      console.log(`encrypted password: ${encryptedPassword}`)
      
      const data = await UserModel.create({
        name,
        email,
        password: encryptedPassword,
        username,
      });

      return ApiResponse.success(res, "Registered successfully!", data);
    } catch (error) {
      console.log(error);
      return ApiResponse.error(res, error.toString());
    }
  };

  static forgetPassword = async (req, res) => {
    try {
      const { email } = req.body || {};

      const user = await UserModel.findOne({ email: email });
      if (user === null) {
        return ApiResponse.error(res, "Email is not registered");
      }

      const token = generateResetPasswordToken(email);
      const result = await sendMail({
        from: `"Stock Manager" <no-reply${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Reset Your Password",
        text: resetPasswordEmailTemplate(
          `${env.BASE_URL}/reset-password`,
          token,
        ),
      });

      if (result) {
        return ApiResponse.success(res, "Reset password link sent to email");
      }
      return ApiResponse.error(res, "Failed to send email password link");
    } catch (error) {
      return ApiResponse.error(res, error.toString());
    }
  };

  static changePassword = async (req, res) => {
    try {
      const { password, token } = req.body || {};

      const data = verifyToken(decodeURIComponent(token));
      const email = data.email;

      await UserModel.findOneAndUpdate(
        {
          email: email,
        },
        {
          password: password,
        },
      );

      return ApiResponse.success(res);
    } catch (error) {
      return ApiResponse.error(res, error.toString());
    }
  };
}

export default AuthController;
