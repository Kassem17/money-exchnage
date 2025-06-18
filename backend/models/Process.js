import mongoose from "mongoose";

const processSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  processDate: {
    type: Date,
    default: Date.now,
  },
  processAmountSell: {
    type: Number,
    required: true,
  },
  processAmountBuy: {
    type: Number,
    required: true,
  },
  exchangeRate: {
    type: Number,
    required: true,
  },
  processType: {
    type: String,
    enum: ["Sell", "Buy"],
    required: true,
  },
  moneySource: {
    type: String,
    default: "",
  },
  moneyDestination: {
    type: String,
    default: "",
  },
  toCurrency: {
    type: String,
    required: true,
  },
  fromCurrency: {
    type: String,
    required: true,
  },
});

const Process = mongoose.model("Process", processSchema);
export default Process;
