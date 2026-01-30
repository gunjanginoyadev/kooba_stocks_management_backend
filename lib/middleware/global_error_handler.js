import ApiResponse from "../helper/ApiResponse.js";

export const globalErrorHandler = (err, req, res, next) => {
  console.error("Global Error Handler Caught:", err);

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return ApiResponse.error(res, "Invalid JSON payload", 400);
  }

  return ApiResponse.error(res, "Internal Server Error", 500, err.message);
};
