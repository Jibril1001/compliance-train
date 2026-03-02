// src/middleware/auth.ts
const jwt = require('jsonwebtoken');
import type { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user: {
    userId: string;
    role: string;
    companyId: string;
  } | undefined;
}

const SECRET_KEY = process.env.JWT_SECRET as string;

const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as AuthRequest['user'];
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

const isAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
};

// ✅ Export runtime values with module.exports
module.exports = {
  verifyToken,
  isAdmin,
};