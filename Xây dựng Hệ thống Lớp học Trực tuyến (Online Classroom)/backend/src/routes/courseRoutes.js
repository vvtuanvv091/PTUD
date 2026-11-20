const express = require('express');
const khoaHocChungController = require('../controllers/chung/khoaHocChungController');
const thongBaoLopController = require('../controllers/chung/thongBaoLopController');
const khoaHocGiangVienController = require('../controllers/giangVien/khoaHocGiangVienController');
const taiLieuGiangVienController = require('../controllers/giangVien/taiLieuGiangVienController');
const baiTapChamDiemController = require('../controllers/giangVien/baiTapChamDiemController');
const { yeuCauDangNhap, xacThucTuyChon, phanQuyen } = require('../middleware/authMiddleware');
const { taiTepTaiLieu, taiTepDeBai, taiTepAnhBia } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Xem cong khai / theo phien dang nhap
router.get('/', xacThucTuyChon, khoaHocChungController.layDanhSachKhoaHoc);
router.get('/:id', xacThucTuyChon, khoaHocChungController.layChiTietKhoaHoc);

// CRUD khoa hoc + sinh vien + bang diem + xuat CSV (Giang vien / Admin)
router.post(
  '/',
  yeuCauDangNhap,
  phanQuyen('teacher', 'admin'),
  taiTepAnhBia.single('thumbnail'),
  khoaHocGiangVienController.taoKhoaHoc
);
router.put(
  '/:id',
  yeuCauDangNhap,
  phanQuyen('teacher', 'admin'),
  taiTepAnhBia.single('thumbnail'),
  khoaHocGiangVienController.capNhatKhoaHoc
);
router.delete('/:id', yeuCauDangNhap, phanQuyen('teacher', 'admin'), khoaHocGiangVienController.xoaKhoaHoc);

router.get('/:id/students', yeuCauDangNhap, phanQuyen('teacher', 'admin'), khoaHocGiangVienController.layDanhSachSinhVien);
router.get('/:id/gradebook', yeuCauDangNhap, phanQuyen('teacher', 'admin'), khoaHocGiangVienController.layBangDiem);
router.get('/:id/gradebook/export', yeuCauDangNhap, phanQuyen('teacher', 'admin'), khoaHocGiangVienController.xuatBangDiemCsv);

// Tai lieu lop hoc
router.get('/:courseId/materials', xacThucTuyChon, khoaHocChungController.layTaiLieuKhoaHoc);
router.post(
  '/:courseId/materials',
  yeuCauDangNhap,
  phanQuyen('teacher', 'admin'),
  taiTepTaiLieu.single('file'),
  taiLieuGiangVienController.taoTaiLieu
);

// Bai tap lop hoc
router.get('/:courseId/assignments', xacThucTuyChon, khoaHocChungController.layBaiTapKhoaHoc);
router.post(
  '/:courseId/assignments',
  yeuCauDangNhap,
  phanQuyen('teacher', 'admin'),
  taiTepDeBai.single('attachment'),
  baiTapChamDiemController.taoBaiTap
);

// Bang tin & Thao luan lop hoc
router.get('/:courseId/announcements', yeuCauDangNhap, thongBaoLopController.layThongBao);
router.post('/:courseId/announcements', yeuCauDangNhap, phanQuyen('teacher', 'admin'), thongBaoLopController.taoThongBao);

module.exports = router;
