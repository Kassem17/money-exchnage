import mongoose from "mongoose";
import Client from "../models/Client.js";
import Process from "../models/Process.js";
import { io } from "../server.js";
import Currency from "../models/Currency.js";
import Employee from "../models/Employee.js";

// ---- CLIENTS ----

export const createClient = async (req, res) => {
  try {
    const { userId } = req.user;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized access" });

    const {
      fullname,
      phoneNumber,
      processes,
      work,
      dateOfBirth,
      currentAddress,
      IDnumber,
      nationality,
      resident,
      bornAddress,
      clientType,
      yearlyIncome,
      financialStatus,
      banksDealingWith,
      ownerOfEconomicActivity,
      registrationNumber,
      minimum,
      maximum,
    } = req.body;

    // Prevent duplicates
    const existing = await Client.findOne({ phoneNumber });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "يوجد عميل لديه نفس رقم الهاتف الرجاء التحقق منه",
      });
    }

    const newClient = new Client({
      employeeId: userId,
      fullname,
      phoneNumber,
      processes,
      work,
      dateOfBirth,
      currentAddress,
      IDnumber,
      nationality,
      resident,
      bornAddress,
      clientType,
      yearlyIncome,
      financialStatus,
      banksDealingWith,
      ownerOfEconomicActivity,
      registrationNumber,
      minimum,
      maximum,
    });

    const savedClient = await newClient.save();
    io.emit("client:created", savedClient);

    res.status(200).json({
      success: true,
      message: "Client added successfully",
      client: savedClient,
    });
  } catch (error) {
    console.error("Error adding client:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const getAllClients = async (req, res) => {
  try {
    const { userId } = req.user;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Please login to access" });

    const clients = await Client.find()
      .populate("processes")
      .populate("employeeId", "username")
      .lean();
    if (clients.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "No clients found" });

    res.status(200).json({
      success: true,
      message: "Clients fetched successfully",
      clients,
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "Client ID is required" });

    const client = await Client.findById(id).populate("processes");
    if (!client)
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });

    res
      .status(200)
      .json({ success: true, message: "Client fetched successfully", client });
  } catch (error) {
    console.error("Error fetching client by ID:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getClientlessThan10000 = async (req, res) => {
  try {
    const clients = await Client.find({ clientType: "less than 10000" })
      .populate("processes")
      .populate("employeeId", "username")
      .lean();

    const message =
      clients.length > 0
        ? "Clients with yearly income less than 10000 fetched successfully"
        : "No clients found with yearly income less than 10000";

    res.status(200).json({ success: true, message, clients });
  } catch (error) {
    console.error("Error fetching low-income clients:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getClientGreaterThan10000 = async (req, res) => {
  try {
    const clients = await Client.find({ clientType: "greater than 10000" })
      .populate("processes")
      .populate("employeeId", "username")
      .lean();

    const message =
      clients.length > 0
        ? "Clients with yearly income greater than 10000 fetched successfully"
        : "No clients found with yearly income greater than 10000";

    res.status(200).json({ success: true, message, clients });
  } catch (error) {
    console.error("Error fetching high-income clients:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const editClient = async (req, res) => {
  try {
    const { userId } = req.user;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized access" });

    const { id: clientId } = req.params;
    if (!clientId)
      return res
        .status(400)
        .json({ success: false, message: "Client ID is required" });

    // Update client
    await Client.findByIdAndUpdate(
      clientId,
      { ...req.body, employeeId: userId },
      { runValidators: true }
    );

    // Re-fetch with population
    const updatedClient = await Client.findById(clientId)
      .populate("employeeId")
      .populate("processes");

    if (!updatedClient)
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });

    io.emit("client:updated", updatedClient);
    res.status(200).json({
      success: true,
      message: "Client updated successfully",
      client: updatedClient,
    });
  } catch (error) {
    console.error("Error updating client:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const deleteClient = async (req, res) => {
  try {
    const { userId } = req.user;
    const employee = await Employee.findById(userId);
    if (!employee?.canDeleteClient) {
      return res
        .status(403)
        .json({ success: false, message: "ليس لديك هذه الصلاحية" });
    }

    const { id } = req.params;
    const client = await Client.findById(id);
    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    if (client.processes?.length) {
      await Process.deleteMany({ _id: { $in: client.processes } });
    }
    await Client.findByIdAndDelete(id);
    io.emit("client:deleted", { _id: client._id });

    res.status(200).json({
      success: true,
      message: "Client and related processes deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting client:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ---- PROCESSES ----

export const getProcessById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "Process ID is required" });
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Process ID format" });
    }

    const process = await Process.findById(id).populate("clientId");
    if (!process)
      return res
        .status(404)
        .json({ success: false, message: "Process not found" });

    res.status(200).json({
      success: true,
      message: "Process fetched successfully",
      data: process,
    });
  } catch (error) {
    console.error("Error fetching process by ID:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const makeProcess = async (req, res) => {
  try {
    const { userId } = req.user;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized access" });

    const {
      clientId,
      processAmountSell,
      processAmountBuy,
      exchangeRate,
      processType,
      moneySource,
      moneyDestination,
      processDate,
      toCurrency,
      fromCurrency,
    } = req.body;

    if (
      !clientId ||
      !processAmountSell ||
      !processAmountBuy ||
      !exchangeRate ||
      !processType ||
      !toCurrency ||
      !fromCurrency
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (!["Buy", "Sell"].includes(processType)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid process type" });
    }

    const client = await Client.findById(clientId);
    if (!client)
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });

    const newProcess = new Process({
      clientId,
      employeeId: userId,
      clientName: client.fullname,
      processAmountSell,
      processAmountBuy,
      exchangeRate,
      processType,
      moneySource,
      moneyDestination,
      processDate: processDate ? new Date(processDate) : new Date(),
      toCurrency,
      fromCurrency,
    });

    const savedProcess = await newProcess.save();
    client.processes.push(savedProcess._id);
    await client.save();

    res.status(201).json({
      success: true,
      message: "Process created successfully",
      process: savedProcess,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getProcessByClientForReport = async (req, res) => {
  try {
    const { userId } = req.user;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { clientId, startDate, endDate } = req.body;
    if (!clientId || !startDate || !endDate) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ success: false, message: "Invalid dates" });
    }

    const processes = await Process.find({
      clientId,
      processDate: { $gte: start, $lte: end },
      processAmountBuy: { $lt: 10000 },
    }).populate("clientId employeeId");

    if (processes.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No processes found for the given criteria",
      });
    }

    res.status(200).json({
      success: true,
      message: "Processes fetched successfully",
      processes,
    });
  } catch (error) {
    console.error("Error fetching processes for report:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getProcessByClientForReportGreater = async (req, res) => {
  try {
    const { userId } = req.user;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { clientId, startDate, endDate } = req.body;
    if (!clientId || !startDate || !endDate) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ success: false, message: "Invalid dates" });
    }

    const processes = await Process.find({
      clientId,
      processDate: { $gte: start, $lte: end },
      processAmountBuy: { $gte: 10000 },
    }).populate("clientId employeeId");

    if (processes.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No processes found for the given criteria",
      });
    }

    res.status(200).json({
      success: true,
      message: "Processes fetched successfully",
      processes,
    });
  } catch (error) {
    console.error("Error fetching high-value processes:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAllProcesses = async (req, res) => {
  try {
    const { userId } = req.user;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { startDate, endDate } = req.body;
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ success: false, message: "Invalid dates" });
    }

    const processes = await Process.find({
      processDate: { $gte: start, $lte: end },
    })
      .populate("clientId")
      .populate("employeeId", "username")
      .lean();

    if (processes.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No processes found for the given criteria",
      });
    }

    res.status(200).json({
      success: true,
      message: "Processes fetched successfully",
      processes,
    });
  } catch (error) {
    console.error("Error fetching processes for report:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const editProcess = async (req, res) => {
  try {
    const { userId } = req.user;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized access" });

    const { processId } = req.params;
    const {
      clientId,
      processAmountSell,
      processAmountBuy,
      exchangeRate,
      processType,
      moneySource,
      moneyDestination,
      processDate,
      toCurrency,
      fromCurrency,
    } = req.body;

    if (
      !clientId ||
      !processAmountSell ||
      !processAmountBuy ||
      !exchangeRate ||
      !processType ||
      !toCurrency ||
      !fromCurrency
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (!["Buy", "Sell"].includes(processType)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid process type" });
    }

    const process = await Process.findById(processId);
    if (!process)
      return res
        .status(404)
        .json({ success: false, message: "Process not found" });

    if (String(process.employeeId) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Not allowed to edit this process",
      });
    }

    const client = await Client.findById(clientId);
    if (!client)
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });

    Object.assign(process, {
      clientId,
      clientName: client.fullname,
      processAmountSell,
      processAmountBuy,
      exchangeRate,
      processType,
      moneySource,
      moneyDestination,
      processDate: processDate ? new Date(processDate) : process.processDate,
      toCurrency,
      fromCurrency,
    });

    const updatedProcess = await process.save();
    io.emit("process:edited", updatedProcess);

    res.status(200).json({
      success: true,
      message: "Process updated successfully",
      process: updatedProcess,
    });
  } catch (error) {
    console.error("Error updating process:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteProcess = async (req, res) => {
  try {
    const { userId } = req.user;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized access" });

    const { processId } = req.params;
    if (!processId)
      return res
        .status(400)
        .json({ success: false, message: "Process ID is required" });

    const process = await Process.findById(processId);
    if (!process)
      return res
        .status(404)
        .json({ success: false, message: "Process not found" });

    if (String(process.employeeId) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Not allowed to delete this process",
      });
    }

    await Client.findByIdAndUpdate(process.clientId, {
      $pull: { processes: process._id },
    });
    await Process.findByIdAndDelete(processId);

    io.emit("processDeleted", {
      processId,
      clientId: process.clientId,
      employeeId: process.employeeId,
    });

    res
      .status(200)
      .json({ success: true, message: "Process deleted successfully" });
  } catch (error) {
    console.error("Error deleting process:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ---- CURRENCIES ----

export const addCurrency = async (req, res) => {
  try {
    const { name, code, symbol } = req.body;
    if (!code || !symbol || !name) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const upperCode = code.toUpperCase();

    const exists = await Currency.findOne({
      $or: [{ symbol }, { code: upperCode }],
    });
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "Currency already exists" });
    }

    const newCurrency = new Currency({ name, symbol, code: upperCode });
    await newCurrency.save();

    io.emit("Currency:Added", newCurrency);
    res.status(200).json({
      success: true,
      message: "Currency added successfully",
      currency: newCurrency,
    });
  } catch (error) {
    console.error("Error adding currency:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getCurrencies = async (req, res) => {
  try {
    const currencies = await Currency.find().lean();
    if (currencies.length === 0)
      return res
        .status(200)
        .json({ success: true, message: "No currencies found", currencies });
    res.status(200).json({ success: true, currencies });
  } catch (error) {
    console.error("Error fetching currencies:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const editCurrency = async (req, res) => {
  try {
    const { name, code, symbol } = req.body;
    if (!code)
      return res
        .status(400)
        .json({ success: false, message: "Currency code is required" });

    const updated = await Currency.findOneAndUpdate(
      { code: code.toUpperCase() },
      { name, symbol },
      { new: true }
    );
    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Currency not found" });

    io.emit("currency:updated", updated);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating currency:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
