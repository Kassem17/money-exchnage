import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  addEmployee,
  changeEmployeeState,
  createCompany,
  deleteEmployee,
  getAllEmployees,
  getCompany,
  getEmployeeById,
  setAdmin,
  setPermissions,
  updateCompany,
} from "../controllers/adminController.js";

const adminRouter = express.Router();
adminRouter.post("/create", protectRoute, createCompany);
adminRouter.post("/create-employee", protectRoute, addEmployee);
adminRouter.post("/change-availability", protectRoute, changeEmployeeState);

adminRouter.get("/get-company", getCompany);

adminRouter.put("/update", protectRoute, updateCompany);

adminRouter.get("/get-data", protectRoute, getEmployeeById);

adminRouter.get("/get-employee", protectRoute, getAllEmployees);

adminRouter.post("/set-as-admin", protectRoute, setAdmin);

adminRouter.post("/set-permissions", protectRoute, setPermissions);

adminRouter.delete("/delete-employee/:id", protectRoute, deleteEmployee);

export default adminRouter;
