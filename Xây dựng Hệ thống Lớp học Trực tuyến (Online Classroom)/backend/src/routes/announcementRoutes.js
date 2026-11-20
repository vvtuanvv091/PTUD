const express = require('express');
const thongBaoLopController = require('../controllers/chung/thongBaoLopController');
const { yeuCauDangNhap, phanQuyen } = require('../middleware/authMiddleware');

const router = express.Router();

router.patch('/:id/pin', yeuCauDangNhap, phanQuyen('teacher', 'admin'), thongBaoLopController.ghimThongBao);
router.delete('/:id', yeuCauDangNhap, phanQuyen('teacher', 'admin'), thongBaoLopController.xoaThongBao);
router.post('/:id/comments', yeuCauDangNhap, thongBaoLopController.themBinhLuan);
router.delete('/:id/comments/:commentId', yeuCauDangNhap, thongBaoLopController.xoaBinhLuan);

module.exports = router;
