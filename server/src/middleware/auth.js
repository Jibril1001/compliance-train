"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/middleware/auth.ts
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: 'No token provided' });
        return;
    }
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    }
    catch {
        res.status(401).json({ error: 'Unauthorized' });
    }
};
const isAdmin = (req, res, next) => {
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
//# sourceMappingURL=auth.js.map