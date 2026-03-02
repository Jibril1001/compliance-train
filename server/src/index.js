"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Instead of `import ... from ...`
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./db');
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const trainingRoutes = require('./routes/trainings');
const enrollmentRoutes = require('./routes/enrollments');
const app = express();
const PORT = process.env.PORT;
async function startServer() {
    await connectDB();
    app.use(express.json());
    app.use(cookieParser());
    app.use(cors({
        origin: 'http://localhost:5173',
        credentials: true,
    }));
    app.use('/api/auth', authRoutes);
    app.use('/api/employees', employeeRoutes);
    app.use('/api/trainings', trainingRoutes);
    app.use('/api/enrollments', enrollmentRoutes);
    app.get('/api/health', (_req, res) => {
        res.json({ status: 'API running 🚀' });
    });
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}
startServer();
//# sourceMappingURL=index.js.map