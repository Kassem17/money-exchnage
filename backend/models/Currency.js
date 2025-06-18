import mongoose from "mongoose";

const currencySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  symbol: {
    type: String,
    required: true,
  },
});

const Currency = mongoose.model("Currency", currencySchema);
export default Currency;
