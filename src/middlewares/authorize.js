export const authorize =
  (...allowedRoles) =>
  (request, response, next) => {
    if (!allowedRoles.includes(request.user.role)) {
      return response.status(403).json({ message: "Forbidden" });
    }
    next();
  };
