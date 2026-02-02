import express from "express";
import { auth } from "../middleware/auth.js";
import {
  addStockEntryDataValidationSchema,
  deleteStockEntryDataValidationSchema,
  updateStockEntryDataValidationSchema,
} from "../validator/stock_entry_validation_schema..js";
import {
  validatePaginationSchema,
  validateSchema,
  validateSchemaWithQuery,
  validateSchemaWithQueryAndBody,
} from "../validator/validate_schema.js";
import StockEntryController from "../controller/stock_entry_controller.js";

const router = express.Router();

// Get all stock entries
router.get(
  "/",
  auth,
  validatePaginationSchema,
  StockEntryController.getAllStockEntries,
);

// Add Stock Entry
router.post(
  "/",
  auth,
  validateSchema(addStockEntryDataValidationSchema),
  StockEntryController.addStockEntry,
);

// Update Stock Entry
router.put(
  "/",
  auth,
  validateSchemaWithQueryAndBody(updateStockEntryDataValidationSchema),
  StockEntryController.updateStockEntry,
);

// Delete Stock Entry
router.delete(
  "/",
  auth,
  validateSchemaWithQuery(deleteStockEntryDataValidationSchema),
  StockEntryController.deleteStockEntry,
);
export default router;
