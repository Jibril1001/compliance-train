const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Company= require('../models/Company');
const User = require('../models/User');

import type { Request, Response } from 'express';

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET!;

// --------------------- Types for Request Bodies ---------------------
interface RegisterBody {
  companyName: string;
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

// --------------------- Register Admin ---------------------
router.post(
  '/register',
  async (req: Request<{}, {}, RegisterBody>, res: Response) => {
    const { companyName, email, password } = req.body;

    try {

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      
      const company = await Company.create({ name: companyName });
      
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        email,
        password: hashedPassword,
        role: 'admin',
        companyId: company._id,
      });

      const token = jwt.sign(
        {
          userId: user._id,
          role: user.role,
          companyId: user.companyId,
        },
        SECRET_KEY,
        { expiresIn: '1h' }
      );

      res.status(201).json({
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

// --------------------- Login ---------------------
router.post('/login', async (req: Request<{}, {}, LoginBody>, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid Username or password' });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        companyId: user.companyId,
      },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;