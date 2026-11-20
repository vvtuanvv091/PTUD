const express = require('express');
const taiLieuGiangVienController = require('../controllers/giangVien/taiLieuGiangVienController');
const ghiDanhSinhVienController = require('../controllers/sinhVien/ghiDanhSinhVienController');
const { yeuCauDangNhap, phanQuyen } = require('../middleware/authMiddleware');
const { taiTepTaiLieu } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.put(
  '/:id',
  yeuCauDangNhap,
  phanQuyen('teacher', 'admin'),
  taiTepTaiLieu.single('file'),
  taiLieuGiangVienController.capNhatTaiLieu
);
router.delete('/:id', yeuCauDangNhap, phanQuyen('teacher', 'admin'), taiLieuGiangVienController.xoaTaiLieu);
router.post('/:id/toggle-complete', yeuCauDangNhap, phanQuyen('student'), ghiDanhSinhVienController.danhDauHoanThanhTaiLieu);

module.exports = router;
