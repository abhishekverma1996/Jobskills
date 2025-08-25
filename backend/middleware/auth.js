const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Check if JWT_SECRET is configured
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET not configured");
    return res.status(500).json({ message: "Server configuration error" });
  }

  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.userId) {
      console.error("JWT token missing userId:", decoded);
      return res.status(400).json({ message: "Invalid token format" });
    }
    
    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    res.status(400).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
