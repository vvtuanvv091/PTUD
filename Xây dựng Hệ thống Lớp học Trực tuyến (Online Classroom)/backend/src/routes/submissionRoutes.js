const express = require('express');
const baiNopSinhVienController = require('../controllers/sinhVien/baiNopSinhVienController');
const baiTapChamDiemController = require('../controllers/giangVien/baiTapChamDiemController');
const { yeuCauDangNhap, phanQuyen } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/my', yeuCauDangNhap, phanQuyen('student'), baiNopSinhVienController.layBangDiemCaNhan);
router.put('/:id/grade', yeuCauDangNhap, phanQuyen('teacher', 'admin'), baiTapChamDiemController.chamDiem);

module.exports = router;
