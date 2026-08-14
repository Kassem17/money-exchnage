import jwt from "jsonwebtoken";

const protectRoute = async (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Please Login to access" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("JWT verify error:", error.message);
    }
    return res.status(401).json({ success: false, message: "Please Login to access" });
  }
};

export default protectRoute;
