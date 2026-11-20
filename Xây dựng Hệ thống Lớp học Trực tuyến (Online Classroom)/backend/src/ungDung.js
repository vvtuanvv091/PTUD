const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./config/swagger');
const { khongTimThay, boXuLyLoi } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const courseRoutes = require('./routes/courseRoutes');
const materialRoutes = require('./routes/materialRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const ungDung = express();

ungDung.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
);

const danhSachOrigin = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .concat(['http://localhost:5173', 'http://127.0.0.1:5173']);

const bieuThucLocalDev = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

ungDung.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        danhSachOrigin.includes(origin) ||
        (process.env.NODE_ENV !== 'production' && bieuThucLocalDev.test(origin))
      ) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} không nằm trong danh sách CORS cho phép`));
    },
    credentials: true,
  })
);

ungDung.use(express.json({ limit: '5mb' }));
ungDung.use(express.urlencoded({ extended: true, limit: '5mb' }));

if (process.env.NODE_ENV !== 'test') {
  ungDung.use(morgan('dev'));
}

ungDung.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

ungDung.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'EduClass — Tài liệu RESTful API',
  })
);

ungDung.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    service: 'EduClass Backend API',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    dbName: mongoose.connection.name || 'HeThongLopHocTrucTuyen',
    timestamp: new Date().toISOString(),
  });
});

ungDung.use('/api/auth', authRoutes);
ungDung.use('/api/admin', adminRoutes);
ungDung.use('/api/categories', categoryRoutes);
ungDung.use('/api/courses', courseRoutes);
ungDung.use('/api/materials', materialRoutes);
ungDung.use('/api/enrollments', enrollmentRoutes);
ungDung.use('/api/assignments', assignmentRoutes);
ungDung.use('/api/submissions', submissionRoutes);
ungDung.use('/api/announcements', announcementRoutes);
ungDung.use('/api/dashboard', dashboardRoutes);

ungDung.use(khongTimThay);
ungDung.use(boXuLyLoi);

module.exports = ungDung;
