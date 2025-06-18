import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  administratorName: {
    type: String,
    required: true,
  },
  exchangeCurrency: {
    type: String,
    required: true,
  },
  address: {
    city: {
      type: String,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
  },
  complianceUnitOfficer: {
    type: String,
    required: true,
  },
});

const Company = mongoose.model("Company", companySchema);
export default Company;
