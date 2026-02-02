import ApiResponse from "../helper/ApiResponse.js";
import { StockModel, SubStockModel } from "../models/Stock.js";
import mongoose from "mongoose";

class StocksController {
  static getAllNormalStocks = async (req, res) => {
    try {
      const { page, limit } = req.query || {};
      const currentPage = Number(page) || 1;
      const currentLimit = Number(limit) || 10;
      const totalStocks = await StockModel.countDocuments();
      const totalPage = Math.ceil(totalStocks / currentLimit);

      const data = await StockModel.find()
        .where({
          type: "normal",
        })
        .skip((currentPage - 1) * currentLimit)
        .limit(currentLimit)
        .exec();

      return ApiResponse.success(res, "All stocks fetched", {
        stocks: data,
        pagination: {
          totalStocks,
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

  static getAllSpecialStocks = async (req, res) => {
    try {
      const { page, limit } = req.query || {};
      const currentPage = page || 1;
      const currentLimit = limit || 10;
      const totalStocks = await StockModel.countDocuments();
      const totalPage = Math.ceil(totalStocks / currentLimit);

      const parentData = await StockModel.find()
        .where({
          type: "special",
        })
        .skip((currentPage - 1) * currentLimit)
        .limit(currentLimit)
        .exec();

      const data = [];
      for (const item of parentData) {
        const subStocks = await SubStockModel.find({
          parentStockId: item._id,
        });

        data.push({
          ...item.toObject(),
          subStocks: subStocks,
        });
      }

      return ApiResponse.success(res, "All stocks fetched", {
        stocks: data,
        pagination: {
          totalStocks,
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

  static addStocks = async (req, res) => {
    try {
      const { name, type, quantity, subStocks } = req.body || {};

      // check if the stock is the special or normal
      console.log(`stock type: ${type}`);

      if (type !== "normal" && type !== "special") {
        return ApiResponse.invalidRequestError(res, "Invalid stock type");
      }

      // check if stock already exist or not
      const exist = await StockModel.findOne({ name: name });
      if (exist) {
        return ApiResponse.invalidRequestError(res, "Stock Already exist");
      }
      let data;
      if (type === "normal") {
        data = await StockModel.create({
          name,
          type,
          quantity: quantity || 0,
        });
        return ApiResponse.success(res, "Stock item added", data);
      }

      if (subStocks.length > 0) {
        if (subStocks.some((stock) => stock.name === name)) {
          return ApiResponse.invalidRequestError(
            res,
            `Stock cannot be same as main stock`,
          );
        }

        const duplicates = subStocks
          .map((item) => item.name)
          .filter((name, index, arr) => arr.indexOf(name) !== index);

        if (duplicates.length > 0) {
          return ApiResponse.invalidRequestError(
            res,
            `Each stock name should be different`,
          );
        }

        const names = subStocks.map((s) => s.name);

        const existingSubStock = await SubStockModel.findOne({
          name: { $in: names },
        });

        if (existingSubStock) {
          return ApiResponse.invalidRequestError(
            res,
            `One or more stock already added`,
          );
        }

        const parentStock = await StockModel.create({
          name,
          type,
          quantity: quantity || 0,
        });

        const subStocksData = subStocks.map((subStock) => {
          return {
            parentStockId: parentStock._id,
            name: subStock.name,
            quantity: subStock.quantity || 0,
          };
        });

        const data = await SubStockModel.create(subStocksData);

        return ApiResponse.success(res, "Stock item added", {
          mainStock: parentStock,
          subStocks: data,
        });
      }

      const parentStock = await StockModel.create({
        name,
        type,
        quantity: quantity || 0,
      });

      return ApiResponse.success(res, "Stock item added", {
        mainStock: parentStock,
        subStocks: [],
      });
    } catch (error) {
      console.log(error);
      return ApiResponse.error(res);
    }
  };

  static updateStocks = async (req, res) => {
    try {
      const { name, type } = req.body || {};
      const id = req.query.id || {};

      if (!mongoose.isObjectIdOrHexString(id)) {
        return ApiResponse.error(res, "Invalid id");
      }

      // check if stock already exist or not
      const exist = await StockModel.findById(id);
      const existWithName = await StockModel.findOne({ name: name });

      if (!exist) {
        return ApiResponse.invalidRequestError(res, "Stock does not exist");
      }

      if (exist._id.equals(existWithName._id)) {
        return ApiResponse.error(res, "This stock already exist");
      }

      const data = await StockModel.findOneAndUpdate(
        { _id: id },
        {
          name,
          type,
        },
      );

      return ApiResponse.success(res, "Stock updated", data);
    } catch (error) {
      console.log(error);
      return ApiResponse.error(res);
    }
  };

  static delateStocks = async (req, res) => {
    try {
      const id = req.query.id || {};

      if (!mongoose.isObjectIdOrHexString(id)) {
        return ApiResponse.error(res, "Invalid id");
      }

      // check if stock already exist or not
      const exist = await StockModel.findById(id);
      if (!exist) {
        const existInSubStocks = await SubStockModel.findById(id);
        if (existInSubStocks) {
          const data = await SubStockModel.findByIdAndDelete(id);
          return ApiResponse.success(res, "Stock deleted", data);
        } else {
          return ApiResponse.invalidRequestError(res, "Stock does not exist");
        }
      }

      if (exist.type === "special") {
        await SubStockModel.deleteMany({ parentStockId: id });
      }

      const data = await StockModel.findByIdAndDelete(id);

      return ApiResponse.success(res, "Stock deleted", data);
    } catch (error) {
      console.log(error);
      return ApiResponse.error(res);
    }
  };
}

export default StocksController;
