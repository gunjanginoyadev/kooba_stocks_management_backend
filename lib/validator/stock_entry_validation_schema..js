import Joi from "joi";

export const addStockEntryDataValidationSchema = Joi.object({
  stockId: Joi.string().required(),
  stockType: Joi.string().required(),
  quantity: Joi.number().required(),
  type: Joi.string().required(),
  usage: Joi.string().default(""),
});

export const deleteStockEntryDataValidationSchema = Joi.object({
  queryParams: Joi.object({
    id: Joi.string().required(),
  }),
});

export const updateStockEntryDataValidationSchema = Joi.object({
  queryParams: Joi.object({
    id: Joi.string().required(),
  }),
  body: Joi.object({
    quantity: Joi.number().positive().optional().messages({
      "number.base": "Quantity must be a number",
      "number.positive": "Quantity must be greater than 0",
    }),
    type: Joi.string().valid("in", "use").optional().messages({
      "string.base": "Type must be a string",
      "any.only": "Type must be either 'in' or 'use'",
    }),
    usage: Joi.string().optional().allow("").messages({
      "string.base": "Usage must be a string",
    }),
  })
    .min(1)
    .messages({
      "object.min": "At least one field must be provided for update",
    }),
});
