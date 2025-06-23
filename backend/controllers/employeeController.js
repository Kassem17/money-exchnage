import mongoose from "mongoose";
import Client from "../models/Client.js";
import Process from "../models/Process.js";
import { io } from "../server.js";
import Currency from "../models/Currency.js";
import Employee from "../models/Employee.js";

// clients
export const createClient = async (req, res) => {
  try {
    const { userId } = req.user;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized access" });
    }

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

    return res.status(200).json({
      success: true,
      message: "Client added successfully",
      client: savedClient,
    });
  } catch (error) {
    console.error("Error adding client:", error);
    return res.status(500).json({
      success: false,
      message: "!يوجد عميل لديه نفس رقم الهاتف الرجاء التحقق منه",
      error: error.message || "Internal server error",
    });
  }
};

export const getAllClients = async (req, res) => {
  try {
    const { userId } = req.user;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Please Login to access",
      });
    }

    const clients = await Client.find()
      .populate("processes")
      .populate("employeeId");

    if (!clients || clients.length === 0) {
      return res.status(404).json({
        message: "No clients found ",
      });
    }

    res.status(200).json({
      success: true,
      message: "Clients fetched successfully",
      clients,
    });
  } catch (error) {
    console.log("Error fetching clients:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Client ID is required" });
    }

    const client = await Client.findById(id).populate("processes");

    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    res.status(200).json({
      success: true,
      message: "Client fetched successfully",
      client,
    });
  } catch (error) {
    log.error("Error fetching client by ID:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getClientlessThan10000 = async (req, res) => {
  try {
    const clients = await Client.find({
      clientType: "less than 10000",
    })
      .populate("processes")
      .populate("employeeId", "username");

    res.status(200).json({
      success: true,
      message:
        clients.length > 0
          ? "Clients with yearly income less than 10000 fetched successfully"
          : "No clients found with yearly income less than 10000",
      clients,
    });
  } catch (error) {
    console.error(
      "Error fetching clients with less than 10000 yearly income:",
      error
    );
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getClientGreaterThan10000 = async (req, res) => {
  try {
    const clients = await Client.find({
      clientType: "greater than 10000",
    })
      .populate("processes")
      .populate("employeeId", "username");

    // Always return success, even if no clients were found
    res.status(200).json({
      success: true,
      message:
        clients.length > 0
          ? "Clients with yearly income greater than 10000 fetched successfully"
          : "No clients found with yearly income greater than 10000",
      clients,
    });
  } catch (error) {
    console.error(
      "Error fetching clients with greater than 10000 yearly income:",
      error
    );
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const editClient = async (req, res) => {
  try {
    const { userId } = req.user;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized access" });
    }

    const clientId = req.params.id;
    if (!clientId) {
      return res
        .status(400)
        .json({ success: false, message: "Client ID is required" });
    }

    const updatedClient = await Client.findByIdAndUpdate(
      clientId,
      {
        ...req.body,
        employeeId: userId, // Optional: update the employee ID if necessary
      },
      { new: true }
    );

    if (!updatedClient) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    io.emit("client:updated", updatedClient);

    return res.status(200).json({
      success: true,
      message: "Client updated successfully",
      client: updatedClient,
    });
  } catch (error) {
    console.error("Error updating client:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message || "Internal server error",
    });
  }
};

export const deleteClient = async (req, res) => {
  try {
    const { userId } = req.user;

    const employee = await Employee.findById(userId);

    if (!employee.canDeleteClient) {
      return res.status(400).json({
        success: false,
        message: "ليس لديك هذه الصلاحية",
      });
    }

    const { id } = req.params;

    const client = await Client.findById(id);

    if (!client) {
      return res.status(404).json({
        success: true,
        message: "Client not found",
      });
    }

    // Step 1: Delete all related Process documents
    if (client.processes && client.processes.length > 0) {
      await Process.deleteMany({ _id: { $in: client.processes } });
    }

    // Step 2: Delete the client
    const deletedClient = await Client.findByIdAndDelete(id);
    io.emit("client:deleted", { _id: deletedClient._id });

    return res.status(200).json({
      success: true,
      message: "Client and related processes deleted successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// processes
export const getProcessById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Process ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Process ID format",
      });
    }

    // Populate clientName and only select specific fields (if needed)
    const process = await Process.findById(id).populate({
      path: "clientId", // populate the client reference
    });

    if (!process) {
      return res.status(404).json({
        success: false,
        message: "Process not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Process fetched successfully",
      data: process,
    });
  } catch (error) {
    console.error("Error fetching process by ID:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid Process ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const makeProcess = async (req, res) => {
  try {
    const { userId } = req.user;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized access" });
    }
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

    // Optionally, validate processType
    const validTypes = ["Buy", "Sell"];
    if (!validTypes.includes(processType)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid process type" });
    }

    const client = await Client.findById(clientId);
    if (!client) {
      return res
        .status(404)
        .json({ success: false, message: "Client not found" });
    }

    // Create process and explicitly link clientId and clientName
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
      fromCurrency,
      toCurrency,
    });

    const savedProcess = await newProcess.save();

    // Add process ID to client's processes array
    client.processes.push(savedProcess._id);
    await client.save();

    return res.status(201).json({
      success: true,
      message: "Process created and linked to client successfully",
      process: savedProcess,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getProcessByClientForReport = async (req, res) => {
  try {
    const { userId } = req.user;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { clientId, startDate, endDate } = req.body;

    if (!clientId || !startDate || !endDate) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    const processes = await Process.find({
      clientId: clientId,
      processDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
      processAmountBuy: { $lt: 10000 },
    }).populate("clientId employeeId");

    if (processes.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No processes found for the given criteria.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Processes fetched successfully.",
      processes,
    });
  } catch (error) {
    console.error("Error fetching processes for report:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

export const getProcessByClientForReportGreater = async (req, res) => {
  try {
    const { userId } = req.user;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { clientId, startDate, endDate } = req.body;

    if (!clientId || !startDate || !endDate) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    const processes = await Process.find({
      clientId: clientId,
      processDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
      processAmountBuy: { $gte: 10000 },
    }).populate("clientId employeeId");

    if (processes.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No processes found for the given criteria.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Processes fetched successfully.",
      processes,
    });
  } catch (error) {
    console.error("Error fetching processes for report:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

export const getAllProcesses = async (req, res) => {
  try {
    const { userId } = req.user;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    const processes = await Process.find({
      processDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    })
      .populate("clientId") // populate all client fields or adjust if needed
      .populate("employeeId", "username "); // only username and

    if (processes.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No processes found for the given criteria.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Processes fetched successfully.",
      processes,
    });
  } catch (error) {
    console.error("Error fetching processes for report:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

export const editProcess = async (req, res) => {
  try {
    const { userId } = req.user;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

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

    // Validate required fields
    if (
      !clientId ||
      !processAmountSell ||
      !processAmountBuy ||
      !exchangeRate ||
      !processType ||
      !toCurrency ||
      !fromCurrency
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const validTypes = ["Buy", "Sell"];
    if (!validTypes.includes(processType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid process type",
      });
    }

    const process = await Process.findById(processId);
    if (!process) {
      return res.status(404).json({
        success: false,
        message: "Process not found",
      });
    }

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Update process fields
    process.clientId = clientId;
    process.clientName = client.fullname;
    process.processAmountSell = processAmountSell;
    process.processAmountBuy = processAmountBuy;
    process.exchangeRate = exchangeRate;
    process.processType = processType;
    process.moneySource = moneySource;
    process.moneyDestination = moneyDestination;
    process.processDate = processDate ? new Date(processDate) : new Date();
    process.fromCurrency = fromCurrency;
    process.toCurrency = toCurrency;

    const updatedProcess = await process.save();

    io.emit("process:edited", updatedProcess);

    return res.status(200).json({
      success: true,
      message: "Process updated successfully",
      process: updatedProcess,
    });
  } catch (error) {
    console.error("Error updating process:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteProcess = async (req, res) => {
  try {
    const { userId } = req.user;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized access" });
    }

    const { processId } = req.params;

    if (!processId) {
      return res
        .status(400)
        .json({ success: false, message: "Process ID is required" });
    }

    const process = await Process.findById(processId);
    if (!process) {
      return res
        .status(404)
        .json({ success: false, message: "Process not found" });
    }

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

    // Emit to all connected clients or a specific room
    io.emit("processDeleted", {
      processId,
      clientId: process.clientId,
      employeeId: process.employeeId,
    });

    return res.status(200).json({
      success: true,
      message: "Process deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting process:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// currencies

export const addCurrency = async (req, res) => {
  try {
    const { name, code, symbol } = req.body;

    // Convert code to uppercase
    const upperCode = code.toUpperCase();

    const currencyExist = await Currency.findOne({
      $or: [{ symbol }, { code: upperCode }],
    });

    if (currencyExist) {
      return res.status(400).json({
        success: false,
        message: "Currency Already exists",
      });
    }

    const newCurrency = new Currency({
      name,
      symbol,
      code: upperCode, // Save as uppercase
    });

    await newCurrency.save();

    io.emit("Currency:Added", newCurrency);

    res.status(200).json({
      success: true,
      message: "Currency added successfully",
      currency: newCurrency,
    });
  } catch (error) {
    console.error("Error adding currency:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

export const getCurrencies = async (req, res) => {
  try {
    const currencies = await Currency.find();

    if (currencies.length === 0) {
      return res.status(200).json({ message: "no Currencies found" });
    }

    res.status(200).json({
      success: true,
      currencies,
    });
  } catch (error) {
    console.error("Error fetching Currencies for report:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

export const editCurrency = async (req, res) => {
  try {
    const { name, code, symbol } = req.body;

    if (!code) {
      return res
        .status(400)
        .json({ success: false, message: "Currency code is required." });
    }

    const updatedCurrency = await Currency.findOneAndUpdate(
      { code },
      { name, symbol },
      { new: true }
    );

    if (!updatedCurrency) {
      return res
        .status(404)
        .json({ success: false, message: "Currency not found." });
    }
    io.emit("currency:updated", updatedCurrency);
    res.status(200).json({ success: true, data: updatedCurrency });
  } catch (error) {
    console.error("Error updating currency:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};
