import Company from "../models/Company.js";
import Employee from "../models/Employee.js";
import bcrypt from "bcrypt";
import { io } from "../server.js";

export const createCompany = async (req, res) => {
  try {
    const existingCompany = await Company.findOne();
    if (existingCompany) {
      return res.status(400).json({
        success: false,
        error: "A company already exists. You can only update it.",
      });
    }

    const {
      name,
      phoneNumber,
      administratorName,
      exchangeCurrency,
      address,
      complianceUnitOfficer,
    } = req.body;

    const newCompany = new Company({
      name,
      phoneNumber,
      administratorName,
      exchangeCurrency,
      address,
      complianceUnitOfficer,
    });

    const savedCompany = await newCompany.save();
    io.emit("company:created", savedCompany);
    res.status(201).json({
      success: true,
      message: "Company created successfully ",
      company: savedCompany,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
};

export const getCompany = async (req, res) => {
  try {
    const company = await Company.findOne();
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company not found" });
    }
    res.status(200).json({ success: true, company });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const company = await Company.findOne();
    if (!company) {
      return res
        .status(404)
        .json({ success: false, error: "Company not found. Create it first." });
    }

    Object.assign(company, req.body);
    const updatedCompany = await company.save();

    io.emit("company:updated", updatedCompany);

    res.status(200).json({
      success: true,
      message: "Company updated successfully",
      company: updatedCompany,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const addEmployee = async (req, res) => {
  try {
    const { role: requesterRole } = req.user;
    const {
      username,
      password,
      role,
      phoneNumber,
      createClientGreater,
      createClientLess,
      createProcessGreater,
      createProcessLess,
      editClient,
      accessClientLess,
      accessClientGreater,
      editProcess,
      canDeleteClient,
      accessProcesses,
    } = req.body;

    if (requesterRole !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (password.length < 6) {
      return res.status(200).json({
        success: false,
        message: "كلمة المرور يجب أن تكون أكثر من 6 حروف",
      });
    }

    if (
      !username ||
      !password ||
      role === undefined ||
      createClientGreater === undefined ||
      createClientLess === undefined ||
      createProcessGreater === undefined ||
      createProcessLess === undefined ||
      editClient === undefined ||
      accessClientLess === undefined ||
      accessClientGreater === undefined ||
      canDeleteClient === undefined ||
      editProcess === undefined ||
      accessProcesses === undefined
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const existingEmployee = await Employee.findOne({ username });
    if (existingEmployee) {
      return res
        .status(200)
        .json({ success: false, message: "الرجاء تغيير إسم المستخدم" });
    }

    // const hashedPassword = await bcrypt.hash(password, 10);
    const sanitizedPhoneNumber =
      phoneNumber && phoneNumber.trim() !== "" ? phoneNumber : undefined;

    const newEmployee = new Employee({
      username,
      password,
      role,
      phoneNumber: sanitizedPhoneNumber,
      createClientGreater,
      createClientLess,
      createProcessGreater,
      createProcessLess,
      editClient,
      accessClientLess,
      accessClientGreater,
      canDeleteClient,
      editProcess,
      accessProcesses,
    });

    await newEmployee.save();
    io.emit("employee:created", newEmployee);

    res.status(201).json({
      success: true,
      message: "Employee added successfully",
      employee: {
        id: newEmployee._id,
        username: newEmployee.username,
        role: newEmployee.role,
        phoneNumber: newEmployee.phoneNumber,
      },
    });
  } catch (error) {
    console.error("Add Employee error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const { userId } = req.user;

    const employee = await Employee.findById(userId).select("-password");

    if (!employee) {
      return res
        .status(404)
        .json({ success: false, error: "Employee not found" });
    }
    res.status(200).json({ success: true, employee });
  } catch (error) {
    console.error("Error fetching employee by ID:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
export const getAllEmployees = async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const employees = await Employee.find({ role: "employee" }).select(
      "-password"
    );
    res.status(200).json({ success: true, employees });
  } catch (error) {
    console.error("Error fetching all employees:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { role } = req.user;

    if (role !== "admin") {
      return res.status(400).json({
        success: false,
        message: "Only admin can access",
      });
    }

    const employeeId = req.params.id; // Fixed parameter extraction

    const employee = await Employee.findByIdAndDelete(employeeId);
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, error: "Employee not found" });
    }

    // Make sure 'io' is properly imported/initialized
    io.emit("employee:deleted", employee._id);

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    console.error("Delete Employee error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
export const getEmployeeByUsername = async (req, res) => {
  try {
    const { username } = req.params;

    const employee = await Employee.find({ username }).select("-password");
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, error: "Employee not found" });
    }
    res.status(200).json({ success: true, employee });
  } catch (error) {
    console.error("Error fetching employee by username:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
export const changeEmployeeState = async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== "admin") {
      return res
        .status(400)
        .json({ success: false, message: "Only Admins can access" });
    }

    const { username } = req.body;
    const employee = await Employee.findOne({ username });

    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    employee.isActive = !employee.isActive;
    await employee.save();

    io.emit("employee:statusChanged", employee);

    res.status(200).json({
      success: true,
      message: "Employee status updated",
      isActive: employee.isActive,
    });
  } catch (error) {
    console.error("Error changing employee state:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const setAdmin = async (req, res) => {
  try {
    const { role } = req.user;

    if (role !== "admin") {
      // Note: removed extra space
      return res.status(400).json({
        success: false,
        message: "Only admin can access this",
      });
    }

    const { username } = req.body;
    const employee = await Employee.findOne({ username });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Set role to admin
    employee.role = "admin";

    // Set all permissions to true
    employee.createProcessGreater = true;
    employee.createProcessLess = true;
    employee.createClientGreater = true;
    employee.createClientLess = true;
    employee.accessClientGreater = true;
    employee.accessClientLess = true;
    employee.editClient = true;
    employee.editProcess = true;
    employee.canDeleteClient = true;
    employee.accessProcesses = true;

    await employee.save();

    io.emit("employee:adminSet", employee);

    res.status(200).json({
      success: true,
      message:
        "This employee has been promoted to admin with full permissions.",
      employee,
    });
  } catch (error) {
    console.error("Error in setAdmin:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getAdmins = async (req, res) => {
  try {
    const { role } = req.user;

    if (role !== "superAdmin") {
      return res.status(400).json({
        success: false,
        message: "Only administrator can access this ",
      });
    }

    const admins = Employee.find({ status: "admin" });

    if (admins.length < 0) {
      return res.status(400).json({
        success: true,
        message: "No admins found",
      });
    }
    res.status(200).json({
      success: true,
      message: "fetched successfully",
      admins,
    });
  } catch (error) {
    console.error("Error in setAdmin:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const setPermissions = async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== "admin") {
      return res.status(400).json({
        success: false,
        message: "only admin can give permissions",
      });
    }

    const { permissions, username } = req.body;

    const employee = await Employee.findOne({ username });

    if (!employee) {
      return res.status(400).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Apply permission values (set to true, rest will remain unchanged or can be reset)
    const allPermissions = [
      "createProcessGreater",
      "createProcessLess",
      "createClientGreater",
      "createClientLess",
      "accessClientGreater",
      "accessClientLess",
      "editClient",
      "editProcess",
      "canDeleteClient",
      "accessProcesses",
    ];

    allPermissions.forEach((perm) => {
      employee[perm] = permissions.includes(perm);
    });

    await employee.save();

    res.status(200).json({
      success: true,
      message: "Permissions updated successfully.",
    });
  } catch (error) {
    console.error("Error in setPermissions:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// export const updateEmployee = async (req, res) => {
//   try {
//     const { userId } = req.user;
//     const { username, role, phoneNumber, createClient, createProcess } =
//       req.body;

//     const employee = await Employee.findById(userId);
//     if (!employee) {
//       return res
//         .status(404)
//         .json({ success: false, error: "Employee not found" });
//     }

//     employee.username = username || employee.username;
//     employee.role = role || employee.role;
//     employee.phoneNumber = phoneNumber || employee.phoneNumber;
//     employee.createClientGreater =
//       createClientGreater !== undefined
//         ? createClientGreater
//         : employee.createClientGreater;

//     employee.createClientLess =
//       createClientLess !== undefined
//         ? createClientLess
//         : employee.createClientLess;

//     const updatedEmployee = await employee.save();
//     io.emit("employee:updated", updatedEmployee);

//     res.status(200).json({
//       success: true,
//       message: "Employee updated successfully",
//       employee: {
//         id: employee._id,
//         username: employee.username,
//         role: employee.role,
//         phoneNumber: employee.phoneNumber,
//       },
//     });
//   } catch (error) {
//     console.error("Update Employee error:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };
