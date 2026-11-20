const express = require('express');
const quanLyDanhMucController = require('../controllers/admin/quanLyDanhMucController');
const { yeuCauDangNhap, xacThucTuyChon, phanQuyen } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', xacThucTuyChon, quanLyDanhMucController.layDanhSachDanhMuc);
router.post('/', yeuCauDangNhap, phanQuyen('admin'), quanLyDanhMucController.taoDanhMuc);
router.put('/:id', yeuCauDangNhap, phanQuyen('admin'), quanLyDanhMucController.capNhatDanhMuc);
router.delete('/:id', yeuCauDangNhap, phanQuyen('admin'), quanLyDanhMucController.xoaDanhMuc);

module.exports = router;
