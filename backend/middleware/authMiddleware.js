import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    // 3. If Authorization header is missing: return HTTP 401.
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header is missing.' });
    }

    // 4. If the format is invalid: return HTTP 401.
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Invalid Authorization header format. Expected Bearer token.' });
    }

    // 5. Extract the token.
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token not found.' });
    }

    // 6. Verify the token using process.env.JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 9. Attach authenticated user information to req.user
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };

    // 10. Call next() when authentication succeeds.
    next();
  } catch (error) {
    // 7. If token is expired or invalid: return HTTP 401.
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired.' });
    }
    return res.status(401).json({ message: 'Invalid token.' });
  }
};
