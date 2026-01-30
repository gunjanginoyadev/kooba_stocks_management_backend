import { validationErrorMessageCleaner } from "../helper/validator_error_message_cleaner.js";
import ApiResponse  from "../helper/ApiResponse.js";

export const validateSchema = (schema) => (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return ApiResponse.error(res, "Email and password are required", 400);
  }

  const data = schema.validate(req.body, {
    abortEarly: false,
  });

  console.log(`joi validator data: ${data}`);

  if (data.error) {
    const errors = data.error.details.map((err) =>
      validationErrorMessageCleaner(err.message),
    );

    return ApiResponse.error(res, "Validation failed", 400, errors);
  }

  next();
};
