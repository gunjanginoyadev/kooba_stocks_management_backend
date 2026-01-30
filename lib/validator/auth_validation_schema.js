import Joi from "joi";

export const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
}).required();

export const registerUserSchema = Joi.object({
  name: Joi.string().required().min(3),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(8),
  username: Joi.string().required().min(3),
}).required();

export const forgetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const changePasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().required().min(8),
});

// export const loginUserValidator = (req, res, next) => {
//   if (!req.body || Object.keys(req.body).length === 0) {
//     return ApiResponse.error(res, "Email and password are required", 400);
//   }

//   const { error } = loginUserSchema.validate(req.body, {
//     abortEarly: false,
//   });

//   if (error) {
//     const errors = error.details.map((err) =>
//       validationErrorMessageCleaner(err.message),
//     );

//     return ApiResponse.error(res, "Validation failed", 400, errors);
//   }

//   next();
// };

// export const registerUserValidator = (req, res, next) => {
//   if (!req.body || Object.keys(req.body).length === 0) {
//     return ApiResponse.error(res, "Body is required", 400);
//   }

//   const { error } = registerUserSchema.validate(req.body, {
//     abortEarly: false,
//   });

//   if (error) {
//     const errors = error.details.map((err) =>
//       validationErrorMessageCleaner(err.message),
//     );

//     return ApiResponse.error(res, "Validation failed", 400, errors);
//   }

//   next();
// };

// export const forgetPasswordDataValidator = (req, res, next) => {
//   if (!req.body || Object.keys(req.body).length === 0) {
//     return ApiResponse.error(res, "Body is required", 400);
//   }

//   const { error } = forgetPasswordDataValidator.validate(req.body, {
//     abortEarly: false,
//   });

//   if (error) {
//     const errors = error.details.map((err) =>
//       validationErrorMessageCleaner(err.message),
//     );

//     return ApiResponse.error(res, "Validation failed", 400, errors);
//   }

//   next();
// };
