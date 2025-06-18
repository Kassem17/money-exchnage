import jwt from "jsonwebtoken";

const protectRoute = async (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Please Login to access" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.id, role: decoded.role }; // Assuming the token includes a role
    next();
  } catch (error) {
    console.log(error); // Log for debugging in development
    res.status(401).json({ message: "Please Login to access" });
  }
};

export default protectRoute;
