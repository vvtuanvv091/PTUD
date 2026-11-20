const express = require('express');
const thongKeController = require('../controllers/chung/thongKeController');
const { yeuCauDangNhap } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/public-summary', thongKeController.layThongKeCongKhai);
router.get('/stats', yeuCauDangNhap, thongKeController.layThongKeTongQuan);

module.exports = router;
