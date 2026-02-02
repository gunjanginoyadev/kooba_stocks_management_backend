import mongoose from "mongoose";

const stockEntriesSchema = new mongoose.Schema(
  {
    stockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock",
      required: true,
    },
    stockName: {
      type: String,
      trim: true,
      required: true,
    },
    stockType: {
      type: String,
      trim: true,
      required: true,
      enum: ["normal", "special"],
    },
    quantity: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
      enum: ["in", "use"],
    },
    usage: {
      type: String,
      required: false,
      default: "",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      trim: true,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const StockEntriesModel = mongoose.model(
  "StockEntries",
  stockEntriesSchema,
);
