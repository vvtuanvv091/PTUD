const express = require('express');
const ghiDanhSinhVienController = require('../controllers/sinhVien/ghiDanhSinhVienController');
const { yeuCauDangNhap, phanQuyen } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', yeuCauDangNhap, phanQuyen('student'), ghiDanhSinhVienController.ghiDanh);
router.get('/my', yeuCauDangNhap, phanQuyen('student'), ghiDanhSinhVienController.layLopCuaToi);
router.delete('/course/:courseId', yeuCauDangNhap, phanQuyen('student'), ghiDanhSinhVienController.roiLop);

module.exports = router;
