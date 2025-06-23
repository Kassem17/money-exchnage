import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  processes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Process",
    },
  ],
  work: {
    type: String,
    default: "لا أعلم",
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  currentAddress: {
    country: {
      type: String,
    },
    district: {
      type: String,
    },
    building: {
      type: String,
    },
    street: {
      type: String,
    },
  },
  IDnumber: {
    type: String,

    sparse: true,
    default: "",
  },

  registrationNumber: {
    type: String,
  },
  nationality: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resident: {
    type: Boolean,
    default: false,
  },
  bornAddress: {
    country: {
      type: String,
    },
    district: {
      type: String,
    },
  },
  minimum: {
    type: Number,
    default: 2500,
  },
  maximum: {
    type: Number,
    default: 5000,
  },

  clientType: {
    type: String,
    enum: ["greater than 10000", "less than 10000"],
    required: true,
  },

  yearlyIncome: {
    type: Number,
  },

  financialStatus: {
    type: String,
    enum: ["good", "bad", "-"],
    default: "good",
  },

  banksDealingWith: [
    {
      bankName: {
        type: String,
      },
    },
  ],

  ownerOfEconomicActivity: {
    type: String,
    default: "",
  },
});

clientSchema.pre("save", function (next) {
  if (this.minimum == null) {
    this.minimum = 2500;
  }
  if (this.maximum == null) {
    this.maximum = 5000;
  }
  next();
});

const Client = mongoose.model("Client", clientSchema);
export default Client;
