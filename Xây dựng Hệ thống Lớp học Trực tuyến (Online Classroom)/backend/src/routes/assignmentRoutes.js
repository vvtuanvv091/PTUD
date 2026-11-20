const express = require('express');
const baiTapChamDiemController = require('../controllers/giangVien/baiTapChamDiemController');
const baiNopSinhVienController = require('../controllers/sinhVien/baiNopSinhVienController');
const { yeuCauDangNhap, phanQuyen } = require('../middleware/authMiddleware');
const { taiTepDeBai, taiTepBaiNop } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/my-upcoming', yeuCauDangNhap, phanQuyen('student'), baiNopSinhVienController.layHanNopSapToi);

router.put(
  '/:id',
  yeuCauDangNhap,
  phanQuyen('teacher', 'admin'),
  taiTepDeBai.single('attachment'),
  baiTapChamDiemController.capNhatBaiTap
);
router.delete('/:id', yeuCauDangNhap, phanQuyen('teacher', 'admin'), baiTapChamDiemController.xoaBaiTap);

router.post(
  '/:assignmentId/submit',
  yeuCauDangNhap,
  phanQuyen('student'),
  taiTepBaiNop.single('file'),
  baiNopSinhVienController.nopBai
);
router.get(
  '/:assignmentId/submissions',
  yeuCauDangNhap,
  phanQuyen('teacher', 'admin'),
  baiTapChamDiemController.layDanhSachBaiNop
);

module.exports = router;
