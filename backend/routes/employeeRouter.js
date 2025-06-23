import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  addCurrency,
  createClient,
  deleteClient,
  deleteProcess,
  editClient,
  editCurrency,
  editProcess,
  getAllClients,
  getAllProcesses,
  getClientById,
  getClientGreaterThan10000,
  getClientlessThan10000,
  getCurrencies,
  getProcessByClientForReport,
  getProcessByClientForReportGreater,
  getProcessById,
  makeProcess,
} from "../controllers/employeeController.js";

const employeeRouter = express.Router();

// clients
employeeRouter.post("/create-client", protectRoute, createClient);
employeeRouter.post("/create-process", protectRoute, makeProcess);

employeeRouter.get("/get-clients", protectRoute, getAllClients);
employeeRouter.get("/get-client/:id", getClientById);
employeeRouter.get("/client-less", getClientlessThan10000);
employeeRouter.get("/client-greater", getClientGreaterThan10000);

// processes
employeeRouter.put("/edit-process/:processId", protectRoute, editProcess);

employeeRouter.get("/get-process-by-id/:id", getProcessById);

employeeRouter.post("/get-processes", protectRoute, getAllProcesses);
employeeRouter.post(
  "/get-processes-for-report",
  protectRoute,
  getProcessByClientForReport
);
employeeRouter.post(
  "/get-processes-for-report-greater",
  protectRoute,
  getProcessByClientForReportGreater
);
employeeRouter.delete(
  "/delete-process/:processId",
  protectRoute,
  deleteProcess
);

// currency
employeeRouter.post("/add-currency", addCurrency);
employeeRouter.get("/get-currency", getCurrencies);
employeeRouter.post("/edit-currency", editCurrency);

employeeRouter.put("/edit-client/:id", protectRoute, editClient);
employeeRouter.delete("/delete-client/:id", protectRoute, deleteClient);

export default employeeRouter;
