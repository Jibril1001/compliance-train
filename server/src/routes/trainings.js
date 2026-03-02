"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const Training = require('../models/Training');
const { verifyToken, isAdmin } = require('../middleware/auth');
const router = express.Router();
// --------------------- List Trainings (Admin only) ---------------------
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const trainings = await Training.find({
            companyId: req.user.companyId,
            isDeleted: false,
        });
        res.json(trainings);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to list trainings' });
    }
});
// --------------------- Create Training (Admin only) ---------------------
router.post('/', verifyToken, isAdmin, async (req, res) => {
    const { title, description, date } = req.body;
    try {
        const training = await Training.create({
            title,
            description,
            date: date,
            companyId: req.user.companyId,
        });
        res.status(201).json({
            id: training._id,
            title: training.title,
            description: training.description,
            date: training.date,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create training' });
    }
});
// --------------------- Soft Delete Training (Admin only) ---------------------
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const training = await Training.findOneAndUpdate({ _id: id, companyId: req.user.companyId }, { isDeleted: true }, { new: true });
        if (!training)
            return res.status(404).json({ error: 'Training not found' });
        res.json({ message: 'Training deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete training' });
    }
});
module.exports = router;
//# sourceMappingURL=trainings.js.map