const express = require('express');
const authController = require('../controllers/auth/authController');
const { yeuCauDangNhap } = require('../middleware/authMiddleware');
const { taiTepAvatar } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/register', authController.dangKy);
router.post('/login', authController.dangNhap);
router.get('/me', yeuCauDangNhap, authController.layHoSoCuaToi);
router.put('/me', yeuCauDangNhap, authController.capNhatHoSo);
router.post('/avatar', yeuCauDangNhap, taiTepAvatar.single('avatar'), authController.taiLenAvatar);
router.put('/change-password', yeuCauDangNhap, authController.doiMatKhau);

module.exports = router;
