const asyncHandler = require('../../utils/asyncHandler');
const thongKeService = require('../../services/chung/thongKeService');

const layThongKeCongKhai = asyncHandler(async (_req, res) => {
  const data = await thongKeService.layThongKeCongKhai();
  res.json({ success: true, data });
});

const layThongKeTongQuan = asyncHandler(async (req, res) => {
  const data = await thongKeService.layThongKeTheoVaiTro(req.user);
  res.json({ success: true, data });
});

module.exports = {
  layThongKeCongKhai,
  layThongKeTongQuan,
};
