import ApiResponse from "../helper/ApiResponse.js";
import { verifyToken } from "../helper/token_generator.js";

export const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return ApiResponse.unauthorized(
        res,
        "Authorization token missing or invalid",
      );
    }

    const token = authHeader.split(" ")[1];

    const decoded = verifyToken(token);

    // Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (error) {
    return ApiResponse.unauthorized(res, "Invalid or expired token");
  }
};
