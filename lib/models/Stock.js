import mongoose from "mongoose";

const stockSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: [true, "Stock already exist"],
    },

    type: {
      type: String,
      required: true,
      enum: ["normal", "special"],
    },

    quantity: {
      type: Number,
      required: false,
      validate: {
        validator: function (value) {
          if (this.type === "special") {
            return value === 0;
          }
          return true;
        },
        message: "Special stock cannot have quantity",
      },
    },
  },
  {
    timestamps: true,
  },
);

const subStockSchema = new mongoose.Schema(
  {
    parentStockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock",
      required: true,
    },

    name: {
      type: String,
      required: true,
      unique: [true, "Stock already exist"],
      trim: true,
    },
    quantity: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

export const StockModel = mongoose.model("Stock", stockSchema);
export const SubStockModel = mongoose.model("SubStock", subStockSchema);
