import Employee from "../models/Employee.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const employeeExists = await Employee.findOne({ username });
    if (!employeeExists) {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      employeeExists.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    if (!employeeExists.isActive) {
      return res.status(403).json({
        success: false,
        message: "You can't Login! You are Inactive",
      });
    }

    const token = jwt.sign(
      { id: employeeExists._id, role: employeeExists.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      employee: {
        id: employeeExists._id,
        username: employeeExists.username,
        role: employeeExists.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const username = req.body.username?.trim();
    const newPassword = req.body.newPassword;

    if (!username || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "اسم المستخدم وكلمة المرور الجديدة مطلوبان.",
      });
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل.",
      });
    }

    const employee = await Employee.findOne({ username });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "المستخدم غير موجود. تحقق من اسم المستخدم.",
      });
    }

    employee.password = newPassword;
    await employee.save();

    return res.status(200).json({
      success: true,
      message: "تم تغيير كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ في الخادم. حاول لاحقًا.",
    });
  }
};


export const register = async (req, res) => {
  try {
    const { username, password, phoneNumber } = req.body;

    // Basic validation
    if (!username || !password || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Create the employee
    const employee = await Employee.create({
      username,
      password,
      phoneNumber,
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: employee._id, role: employee.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        username: employee.username,
        phoneNumber: employee.phoneNumber,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
