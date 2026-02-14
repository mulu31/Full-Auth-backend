import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authenticate = async (request, response, next) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      response.setHeader("WWW-Authenticate", "Bearer");
      return response.status(401).json({ message: "Unauthorized" });
    }

    const accessToken = authHeader.split(" ")[1];
    const payload = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);

    const user = await User.findById(payload.userId).select("-password");
    if (!user || !user.isActive) {
      return response.status(401).json({ message: "Account inactive" });
    }

    request.user = user;
    next();
  } catch {
    return response.status(401).json({ message: "Invalid or expired token" });
  }
};
