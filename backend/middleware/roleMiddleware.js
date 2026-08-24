export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // 1. & 2. Ensure req.user exists (set by authenticateToken) and extract the role.
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Access denied. User role information is missing.' });
    }

    // 3. Check if the authenticated user's role is included in the allowed roles array.
    if (!allowedRoles.includes(req.user.role)) {
      // 4. If the role is not allowed, return HTTP 403 Forbidden.
      return res.status(403).json({ 
        message: `Access denied. Role '${req.user.role}' is not authorized to perform this action.` 
      });
    }

    // 5. If allowed, pass control to the next middleware or route handler.
    next();
  };
};
