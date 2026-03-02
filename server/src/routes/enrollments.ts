const express = require('express');
const Enrollment = require('../models/Enrollment');
const Training = require('../models/Training');
const User = require('../models/User');
const { verifyToken, isAdmin } = require('../middleware/auth');
import type { AuthRequest } from '../middleware/auth';
import type { Request, Response } from 'express';

const router = express.Router();

// --------------------- Types ---------------------
interface EnrollBody {
  userId: string;
  trainingId: string;
}

// --------------------- Enroll Employee (Admin only) ---------------------
router.post(
  '/enroll',
  verifyToken,
  isAdmin,
  async (req: Request<{}, {}, EnrollBody>, res: Response) => {
    const { userId, trainingId } = req.body;

    try {
      const existing = await Enrollment.findOne({ userId, trainingId });
      if (existing) return res.status(400).json({ error: 'Already enrolled' });

      const enrollment = await Enrollment.create({ userId, trainingId, status: 'assigned' });
      res.status(201).json(enrollment);
    } catch (error) {
      res.status(500).json({ error: 'Failed to enroll employee' });
    }
  }
);

// --------------------- List My Trainings (Employee only) ---------------------
router.get('/my-trainings', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const trainings = await Enrollment.find({ userId: req.user!.userId })
      .populate('trainingId')
      .exec();
    res.json(trainings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get trainings' });
  }
});

// --------------------- Mark as Complete (Employee only) ---------------------
router.post('/complete/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const enrollment = await Enrollment.findOneAndUpdate(
      { _id: id, userId: req.user!.userId },
      { status: 'completed', completedAt: new Date() },
      { new: true }
    );

    if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });

    res.json({ message: 'Training completed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete training' });
  }
});

// --------------------- Get Summary Stats (Admin only) ---------------------
router.get('/summary', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    // Get all active trainings for this company
    const companyTrainings = await Training.find({
      companyId: req.user!.companyId,
      isDeleted: false,
    });

    const trainingIds = companyTrainings.map((t: any) => t._id);

    // Get overall stats
    const totalEnrolled = await Enrollment.countDocuments({
      trainingId: { $in: trainingIds },
    });

    const totalCompleted = await Enrollment.countDocuments({
      trainingId: { $in: trainingIds },
      status: 'completed',
    });

    // Per-training breakdown
    const perTraining = await Promise.all(
      companyTrainings.map(async (training: any) => {
        const enrolled = await Enrollment.countDocuments({ trainingId: training._id });
        const completed = await Enrollment.countDocuments({
          trainingId: training._id,
          status: 'completed',
        });
        return {
          trainingId: training._id,
          title: training.title,
          enrolled,
          completed,
          completionRate: enrolled > 0 ? (completed / enrolled) * 100 : 0,
        };
      })
    );

    res.json({
      totalEnrolled,
      totalCompleted,
      completionRate: totalEnrolled > 0 ? (totalCompleted / totalEnrolled) * 100 : 0,
      perTraining,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get summary' });
  }
});

module.exports = router;