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
    required: true,
    unique: true,
  },
  registrationNumber: {
    type: String,
    required: true,
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
    required: function () {
      return this.clientType === "greater than 10000";
    },
  },

  financialStatus: {
    type: String,
    enum: ["good", "bad"],
    default: "good",
    required: function () {
      return this.clientType === "greater than 10000";
    },
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

// Pre-validation hook to enforce conditional logic
// clientSchema.pre("validate", function (next) {
//   if (this.clientType === "greater than 10000") {
//     if (this.yearlyIncome == null) {
//       return next(
//         new Error(
//           "yearlyIncome is required for clients with clientType 'greater than 10000'"
//         )
//       );
//     }
//     if (!this.financialStatus) {
//       return next(
//         new Error(
//           "financialStatus is required for clients with clientType 'greater than 10000'"
//         )
//       );
//     }
//     if (!this.banksDealingWith || this.banksDealingWith.length === 0) {
//       return next(
//         new Error(
//           "At least one bank must be provided for clients with clientType 'greater than 10000'"
//         )
//       );
//     }
//   }
//   next();
// });

const Client = mongoose.model("Client", clientSchema);
export default Client;
