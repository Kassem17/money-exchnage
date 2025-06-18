// import mongoose from "mongoose";

import mongoose from "mongoose";

// const connectToMongoDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI);
//     console.log("Connected to MongoDB");
//   } catch (error) {
//     console.error("Error connecting to MongoDB:", error);
//   }
// };

// export default connectToMongoDB;

const connectToMongoDB = async () => {
  mongoose
    .connect("mongodb://127.0.0.1:27017/money-exchange-company")

    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));
};

export default connectToMongoDB;
