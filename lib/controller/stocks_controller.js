import ApiResponse from "../helper/ApiResponse.js";
import { StockModel } from "../models/Stock.js";
import mongoose from "mongoose";

class StocksController {
  static getAllStocks = async (req, res) => {
    try {
      const data = await StockModel.find();
      return ApiResponse.success(res, "All stocks fetched", data);
    } catch (error) {
      console.log(error);
      return ApiResponse.error(res);
    }
  };

  static addStocks = async (req, res) => {
    try {
      const { name, type } = req.body || {};

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

      const data = await StockModel.create({
        name,
        type,
      });

      return ApiResponse.success(res, "Stock item added", data);
    } catch (error) {
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
        return ApiResponse.invalidRequestError(res, "Stock does not exist");
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
