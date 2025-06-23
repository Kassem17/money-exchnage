import mongoose from "mongoose";
import bcrypt from "bcrypt";

const employeeSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    length: 6,
  },
  phoneNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  role: {
    type: String,
    enum: ["admin", "employee"],
    default: "employee",
  },

  // permissions
  createProcessGreater: {
    type: Boolean,
    default: true,
  },
  createProcessLess: {
    type: Boolean,
    default: true,
  },

  createClientGreater: {
    type: Boolean,
    default: true,
  },
  createClientLess: {
    type: Boolean,
    default: true,
  },
  accessClientGreater: {
    type: Boolean,
    default: true,
  },
  accessClientLess: {
    type: Boolean,
    default: true,
  },

  editClient: {
    type: Boolean,
    default: true,
  },
  editProcess: {
    type: Boolean,
    default: true,
  },
  canDeleteClient: {
    type: Boolean,
    default: true,
  },
  accessProcesses: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

employeeSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const Employee = mongoose.model("Employee", employeeSchema);
export default Employee;
