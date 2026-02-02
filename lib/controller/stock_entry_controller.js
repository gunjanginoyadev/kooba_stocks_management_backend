import ApiResponse from "../helper/ApiResponse.js";
import { StockModel, SubStockModel } from "../models/Stock.js";
import { StockEntriesModel } from "../models/StockEntries.js";
import { UserModel } from "../models/User.js";
import mongoose from "mongoose";

class StockEntryController {
  static getAllStockEntries = async (req, res) => {
    try {
      const { page, limit } = req.query || {};
      const currentPage = Number(page) || 1;
      const currentLimit = Number(limit) || 10;
      const totalEntries = await StockEntriesModel.countDocuments();
      const totalPage = Math.ceil(totalEntries / currentLimit);

      const data = await StockEntriesModel.find()
        .skip((currentPage - 1) * currentLimit)
        .limit(currentLimit)
        .exec();

      return ApiResponse.success(res, "All stock entries fetched", {
        stockEntries: data,
        pagination: {
          totalEntries,
          currentPage,
          currentLimit,
          totalPage,
        },
      });
    } catch (error) {
      console.log(error);
      return ApiResponse.error(res);
    }
  };

  static addStockEntry = async (req, res) => {
    try {
      const { stockId, stockType, quantity, type, usage } = req.body || {};
      const userId = req.user.id;
      const user = await UserModel.findById(userId);

      let stock;
      if (stockType === "normal") {
        stock = await StockModel.findById(stockId);
      } else {
        stock = await SubStockModel.findById(stockId);
      }

      if (!stock) {
        return ApiResponse.invalidRequestError(res, "Stock does not exist");
      }

      if (type === "use" && quantity > stock.quantity) {
        return ApiResponse.invalidRequestError(
          res,
          "Quantity exceeds stock quantity",
        );
      }

      if (type === "in") {
        await StockModel.findByIdAndUpdate(stockId, {
          quantity: Number(stock.quantity) + Number(quantity),
        });
      } else {
        await StockModel.findByIdAndUpdate(stockId, {
          quantity: Number(stock.quantity) - Number(quantity),
        });
      }

      const data = await StockEntriesModel.create({
        stockId,
        stockName: stock.name,
        stockType,
        quantity,
        type,
        usage: usage || "",
        userId,
        userName: user.name,
      });

      return ApiResponse.success(res, "Stock entry added", data);
    } catch (error) {
      console.log(error);
      return ApiResponse.error(res);
    }
  };

  static updateStockEntry = async (req, res) => {
    try {
      const { id } = req.query;
      const {
        quantity: newQuantity,
        usage: newUsage,
        type: newType,
      } = req.body || {};

      const entry = await StockEntriesModel.findById(id);
      if (!entry) {
        return ApiResponse.invalidRequestError(
          res,
          "Stock entry does not exist",
        );
      }

      // 1️⃣ Allow update only for same month & year
      const entryDate = entry.createdAt;
      const now = new Date();
      if (
        entryDate.getMonth() !== now.getMonth() ||
        entryDate.getFullYear() !== now.getFullYear()
      ) {
        return ApiResponse.invalidRequestError(res, "Entry is too old");
      }

      const Stock = entry.stockType === "normal" ? StockModel : SubStockModel;

      // Check if nothing to update
      if (
        newQuantity === undefined &&
        newUsage === undefined &&
        newType === undefined
      ) {
        return ApiResponse.invalidRequestError(
          res,
          "No fields to update provided",
        );
      }

      // Validate new quantity if provided
      if (newQuantity !== undefined && (!newQuantity || newQuantity <= 0)) {
        return ApiResponse.invalidRequestError(
          res,
          "Invalid quantity provided",
        );
      }

      // Validate new type if provided
      if (newType !== undefined && !["in", "use"].includes(newType)) {
        return ApiResponse.invalidRequestError(
          res,
          "Invalid type provided. Must be 'in' or 'use'",
        );
      }

      const oldQuantity = entry.quantity;
      const oldType = entry.type;
      const finalQuantity =
        newQuantity !== undefined ? newQuantity : oldQuantity;
      const finalType = newType !== undefined ? newType : oldType;
      const finalUsage = newUsage !== undefined ? newUsage : entry.usage;

      // ===============================
      // CASE 1️⃣: Only usage update (no quantity or type change)
      // ===============================
      if (newQuantity === undefined && newType === undefined) {
        await StockEntriesModel.findByIdAndUpdate(id, { usage: finalUsage });
        return ApiResponse.success(res, "Entry usage updated successfully");
      }

      const stockDoc = await Stock.findById(entry.stockId);
      if (!stockDoc) {
        throw new Error("Stock not found");
      }

      // ===============================
      // CASE 2️⃣: TYPE CHANGE (in ↔ use)
      // ===============================
      if (newType !== undefined && newType !== oldType) {
        // Type is changing from "use" to "in" or vice versa

        if (oldType === "use" && newType === "in") {
          // Changing USE to IN
          // 1. Restore the old USE quantity back to stock
          // 2. Add the new IN quantity to stock
          const totalStockChange = oldQuantity + finalQuantity;

          // Check if we have any dependent USE entries for this new IN
          // (shouldn't exist yet, but safety check)
          const subsequentEntries = await StockEntriesModel.find({
            createdAt: { $gt: entry.createdAt },
            userId: entry.userId,
            stockId: entry.stockId,
          }).sort({ createdAt: 1 });

          let dependentUseEntries = [];
          for (const e of subsequentEntries) {
            if (e.type === "in") break;
            if (e.type === "use") {
              dependentUseEntries.push(e);
            }
          }

          const usedQuantity = dependentUseEntries.reduce(
            (sum, e) => sum + e.quantity,
            0,
          );

          // Check if new IN quantity covers dependent uses
          if (finalQuantity < usedQuantity) {
            return ApiResponse.invalidRequestError(
              res,
              `Cannot change to IN with quantity ${finalQuantity}. ` +
                `Dependent USE entries total ${usedQuantity}.`,
            );
          }

          await Stock.findByIdAndUpdate(entry.stockId, {
            $inc: { quantity: totalStockChange },
          });
        } else if (oldType === "in" && newType === "use") {
          // Changing IN to USE
          // 1. Remove the old IN quantity from stock
          // 2. Remove the new USE quantity from stock

          // First check dependent USE entries of the old IN
          const subsequentEntries = await StockEntriesModel.find({
            createdAt: { $gt: entry.createdAt },
            userId: entry.userId,
            stockId: entry.stockId,
          }).sort({ createdAt: 1 });

          let dependentUseEntries = [];
          for (const e of subsequentEntries) {
            if (e.type === "in") break;
            if (e.type === "use") {
              dependentUseEntries.push(e);
            }
          }

          if (dependentUseEntries.length > 0) {
            return ApiResponse.invalidRequestError(
              res,
              `Cannot change IN to USE. This entry has ${dependentUseEntries.length} dependent USE entries. ` +
                `Please delete them first.`,
            );
          }

          const totalStockChange = -oldQuantity - finalQuantity;

          // Check if we have enough stock
          if (stockDoc.quantity + totalStockChange < 0) {
            return ApiResponse.invalidRequestError(
              res,
              `Cannot change to USE: insufficient stock. ` +
                `Current: ${stockDoc.quantity}, Required: ${Math.abs(totalStockChange)}`,
            );
          }

          await Stock.findByIdAndUpdate(entry.stockId, {
            $inc: { quantity: totalStockChange },
          });
        }

        // Update the entry
        await StockEntriesModel.findByIdAndUpdate(id, {
          quantity: finalQuantity,
          type: finalType,
          usage: finalUsage,
        });

        return ApiResponse.success(
          res,
          `Entry type changed from ${oldType} to ${finalType} successfully`,
        );
      }

      // ===============================
      // CASE 3️⃣: QUANTITY CHANGE (same type)
      // ===============================
      const quantityDiff = finalQuantity - oldQuantity;

      // If quantity hasn't changed, just update usage
      if (quantityDiff === 0) {
        if (newUsage !== undefined) {
          await StockEntriesModel.findByIdAndUpdate(id, { usage: finalUsage });
        }
        return ApiResponse.success(res, "Entry updated successfully");
      }

      // ===============================
      // CASE 3A️⃣: UPDATE "USE" ENTRY QUANTITY
      // ===============================
      if (entry.type === "use") {
        // quantityDiff > 0 means increasing the use (taking more stock)
        // quantityDiff < 0 means decreasing the use (returning stock)

        if (quantityDiff > 0) {
          // Check if we have enough stock to cover the increase
          if (stockDoc.quantity < quantityDiff) {
            return ApiResponse.invalidRequestError(
              res,
              `Cannot update: insufficient stock. ` +
                `Current stock: ${stockDoc.quantity}, ` +
                `Additional needed: ${quantityDiff}, ` +
                `Trying to update from ${oldQuantity} to ${finalQuantity}`,
            );
          }
        }

        // Update stock
        await Stock.findByIdAndUpdate(entry.stockId, {
          $inc: { quantity: -quantityDiff },
        });

        // Update entry
        await StockEntriesModel.findByIdAndUpdate(id, {
          quantity: finalQuantity,
          usage: finalUsage,
        });

        return ApiResponse.success(res, "Use entry updated successfully");
      }

      // ===============================
      // CASE 3B️⃣: UPDATE "IN" ENTRY QUANTITY
      // ===============================

      // Find all entries after the one being updated
      const subsequentEntries = await StockEntriesModel.find({
        createdAt: { $gt: entry.createdAt },
        userId: entry.userId,
        stockId: entry.stockId,
      }).sort({ createdAt: 1 });

      let dependentUseEntries = [];

      // Collect all USE entries until the next IN entry
      for (const e of subsequentEntries) {
        if (e.type === "in") break;
        if (e.type === "use") {
          dependentUseEntries.push(e);
        }
      }

      const usedQuantity = dependentUseEntries.reduce(
        (sum, e) => sum + e.quantity,
        0,
      );

      // Safety check: ensure new quantity covers dependent uses
      if (finalQuantity < usedQuantity) {
        return ApiResponse.invalidRequestError(
          res,
          `Cannot reduce IN quantity to ${finalQuantity}. ` +
            `Dependent USE entries total ${usedQuantity}. ` +
            `Please delete dependent entries first or increase quantity.`,
        );
      }

      // Check if stock will go negative
      const stockWithoutOldIn = stockDoc.quantity - oldQuantity + usedQuantity;
      const newStockQty = stockWithoutOldIn + finalQuantity - usedQuantity;

      if (newStockQty < 0) {
        return ApiResponse.invalidRequestError(
          res,
          `Cannot update: stock would become negative (${newStockQty}). ` +
            `Current stock: ${stockDoc.quantity}, ` +
            `Dependent uses: ${usedQuantity}, ` +
            `New IN quantity: ${finalQuantity}`,
        );
      }

      // Apply stock correction
      await Stock.findByIdAndUpdate(entry.stockId, {
        $inc: { quantity: quantityDiff },
      });

      // Update the IN entry
      await StockEntriesModel.findByIdAndUpdate(id, {
        quantity: finalQuantity,
        usage: finalUsage,
      });

      const message =
        dependentUseEntries.length > 0
          ? `In entry updated successfully. Note: ${dependentUseEntries.length} dependent use entries exist.`
          : "In entry updated successfully";

      return ApiResponse.success(res, message);
    } catch (error) {
      console.error("Update stock entry error:", error);
      return ApiResponse.error(res, error.message);
    }
  };

  static deleteStockEntry = async (req, res) => {
    try {
      const { id } = req.query;

      const entry = await StockEntriesModel.findById(id);
      if (!entry) {
        return ApiResponse.invalidRequestError(
          res,
          "Stock entry does not exist",
        );
      }

      // 1️⃣ Allow delete only for same month & year
      const entryDate = entry.createdAt;
      const now = new Date();
      if (
        entryDate.getMonth() !== now.getMonth() ||
        entryDate.getFullYear() !== now.getFullYear()
      ) {
        return ApiResponse.invalidRequestError(res, "Entry is too old");
      }

      const Stock = entry.stockType === "normal" ? StockModel : SubStockModel;

      // ===============================
      // CASE 1️⃣ DELETE "USE" ENTRY
      // ===============================
      if (entry.type === "use") {
        await Stock.findByIdAndUpdate(entry.stockId, {
          $inc: { quantity: entry.quantity },
        });

        await StockEntriesModel.deleteOne({ _id: entry._id });

        return ApiResponse.success(res, "Use entry deleted successfully");
      }

      // ===============================
      // CASE 2️⃣ DELETE "IN" ENTRY
      // ===============================

      // Find all entries after the one being deleted
      const subsequentEntries = await StockEntriesModel.find({
        createdAt: { $gt: entry.createdAt },
        userId: entry.userId,
        stockId: entry.stockId,
      }).sort({ createdAt: 1 });

      let dependentUseEntries = [];

      // Collect all USE entries until the next IN entry
      for (const e of subsequentEntries) {
        if (e.type === "in") break;
        if (e.type === "use") {
          dependentUseEntries.push(e);
        }
      }

      const usedQuantity = dependentUseEntries.reduce(
        (sum, e) => sum + e.quantity,
        0,
      );

      // Get current stock
      const stockDoc = await Stock.findById(entry.stockId);
      if (!stockDoc) {
        throw new Error("Stock not found");
      }

      // 3️⃣ SAFETY CHECK: Ensure stock won't go negative
      const newStockQty = stockDoc.quantity - entry.quantity + usedQuantity;

      if (newStockQty < 0) {
        return ApiResponse.invalidRequestError(
          res,
          `Cannot delete entry: stock would become negative (${newStockQty}). ` +
            `Current: ${stockDoc.quantity}, Removing: ${entry.quantity}, ` +
            `Restoring: ${usedQuantity}`,
        );
      }

      // 4️⃣ Apply stock correction
      await Stock.findByIdAndUpdate(entry.stockId, {
        $inc: {
          quantity: -entry.quantity + usedQuantity,
        },
      });

      // 5️⃣ Delete dependent USE entries
      if (dependentUseEntries.length > 0) {
        await StockEntriesModel.deleteMany({
          _id: { $in: dependentUseEntries.map((e) => e._id) },
        });
      }

      // 6️⃣ Delete the IN entry
      await StockEntriesModel.deleteOne({ _id: entry._id });

      const message =
        dependentUseEntries.length > 0
          ? `In entry deleted. ${dependentUseEntries.length} dependent use entries also removed.`
          : "In entry deleted successfully";

      return ApiResponse.success(res, message);
    } catch (error) {
      console.error("Delete stock entry error:", error);
      return ApiResponse.error(res, error.message);
    }
  };
}

export default StockEntryController;
