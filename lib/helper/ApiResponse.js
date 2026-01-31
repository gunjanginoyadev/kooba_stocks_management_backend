class ApiResponse {
  // Success response with data
  static success(res, message = "Success", data = null, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  // Success response with pagination / meta
  static successWithMeta(
    res,
    message = "Success",
    data = null,
    meta = {},
    statusCode = 200,
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      meta,
    });
  }

  // Error response (client or server)
  static error(
    res,
    message = "Something went wrong",
    statusCode = 500,
    errors = null,
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }

  // Validation error (422)
  static validationError(res, message = "Validation error", errors = {}) {
    return res.status(422).json({
      success: false,
      message,
      errors,
    });
  }

  // Invalid request
  static invalidRequestError(res, message = "Invalid Request", errors = {}) {
    return res.status(400).json({
      success: false,
      message,
      errors,
    });
  }

  // Unauthorized (401)
  static unauthorized(res, message = "Unauthorized access") {
    return res.status(401).json({
      success: false,
      message,
    });
  }

  // Forbidden (403)
  static forbidden(res, message = "Forbidden") {
    return res.status(403).json({
      success: false,
      message,
    });
  }

  // Not Found (404)
  static notFound(res, message = "Resource not found") {
    return res.status(404).json({
      success: false,
      message,
    });
  }
}

export default ApiResponse;
