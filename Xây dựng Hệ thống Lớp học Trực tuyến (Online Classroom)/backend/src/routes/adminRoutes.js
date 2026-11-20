const express = require('express');
const quanLyNguoiDungController = require('../controllers/admin/quanLyNguoiDungController');
const giamSatKhoaHocController = require('../controllers/admin/giamSatKhoaHocController');
const quanLyDatabaseController = require('../controllers/admin/quanLyDatabaseController');
const { yeuCauDangNhap, phanQuyen } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(yeuCauDangNhap, phanQuyen('admin'));

router.get('/users', quanLyNguoiDungController.layDanhSachNguoiDung);
router.post('/users', quanLyNguoiDungController.taoNguoiDung);
router.patch('/users/:id/status', quanLyNguoiDungController.doiTrangThaiTaiKhoan);
router.patch('/users/:id/role', quanLyNguoiDungController.doiVaiTro);

router.get('/courses', giamSatKhoaHocController.layTatCaKhoaHoc);
router.patch('/courses/:id/status', giamSatKhoaHocController.doiTrangThaiKhoaHoc);

// Quan ly CSDL MongoDB (chi doc + xuat JSON, khong cho sua/xoa tho de giu toan ven tham chieu)
router.get('/database', quanLyDatabaseController.layTongQuanDatabase);
router.get('/database/:ten/documents', quanLyDatabaseController.layBanGhiCollection);
router.get('/database/:ten/export', quanLyDatabaseController.xuatJsonCollection);

module.exports = router;
