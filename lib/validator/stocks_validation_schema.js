import joi from "joi";

export const addStocksDataValidationSchema = joi.object({
  name: joi.string().required().min(5),
  type: joi.string().required(),
});

export const updateStocksDataValidationSchema = joi.object({
  queryParams: joi
    .object({
      id: joi.string().required(),
    })
    .required(),

  body: joi
    .object({
      name: joi.string().min(5),
      type: joi.string().valid("normal", "special"),
    })
    .min(1)
    .required(),
});

export const deleteStocksDataValidationSchema = joi.object({
  queryParams: joi
    .object({
      id: joi.string().required(),
    })
    .required(),
});
