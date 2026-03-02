const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { verifyToken, isAdmin } = require('../middleware/auth');
import type { AuthRequest } from '../middleware/auth';

import type { Request, Response } from 'express';

const router = express.Router();

// --------------------- Types ---------------------
interface CreateEmployeeBody {
  name?: string;
  email: string;
  password: string;
}

// --------------------- List Employees (Admin only) ---------------------
router.get(
  '/',
  verifyToken,
  isAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const employees = await User.find({
        companyId: req.user!.companyId,
        role: 'employee',
      }).select('_id name email role');

      res.json(employees);
    } catch (error) {
      res.status(500).json({ error: 'Failed to list employees' });
    }
  }
);

// --------------------- Create Employee (Admin only) ---------------------
router.post(
  '/',
  verifyToken,
  isAdmin,
  async (req: Request<{}, {}, CreateEmployeeBody>, res: Response) => {
    const { name, email, password } = req.body;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const employee = await User.create({
        name: name || '',
        email,
        password: hashedPassword,
        role: 'employee',
        companyId: (req as AuthRequest).user!.companyId,
      });

      res.status(201).json({
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create employee' });
    }
  }
);

module.exports = router;