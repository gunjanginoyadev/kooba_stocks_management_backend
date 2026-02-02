import express from "express";
import { auth } from "../middleware/auth.js";
import StocksController from "../controller/stocks_controller.js";
import {
  validateSchema,
  validateSchemaWithQueryAndBody,
  validateSchemaWithQuery,
} from "../validator/validate_schema.js";
import {
  addStocksDataValidationSchema,
  deleteStocksDataValidationSchema,
  updateStocksDataValidationSchema,
  getStocksDataValidationSchema,
} from "../validator/stocks_validation_schema.js";

const router = express.Router();

// Get all normal stocks list
router.get(
  "/normal",
  auth,
  validateSchemaWithQuery(getStocksDataValidationSchema, true),
  StocksController.getAllNormalStocks,
);

// Get all special stocks list
router.get(
  "/special",
  auth,
  validateSchemaWithQuery(getStocksDataValidationSchema, true),
  StocksController.getAllSpecialStocks,
);

// Add Stock
router.post(
  "/",
  auth,
  validateSchema(addStocksDataValidationSchema),
  StocksController.addStocks,
);

// Update Stock
router.put(
  "/",
  auth,
  validateSchemaWithQueryAndBody(updateStocksDataValidationSchema),
  StocksController.updateStocks,
);

// Delete Stock
router.delete(
  "/",
  auth,
  validateSchemaWithQuery(deleteStocksDataValidationSchema),
  StocksController.delateStocks,
);

export default router;
