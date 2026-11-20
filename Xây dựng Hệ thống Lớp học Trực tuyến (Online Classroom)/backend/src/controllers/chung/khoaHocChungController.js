const asyncHandler = require('../../utils/asyncHandler');
const khoaHocChungService = require('../../services/chung/khoaHocChungService');

const layDanhSachKhoaHoc = asyncHandler(async (req, res) => {
  const data = await khoaHocChungService.layDanhSachKhoaHoc(req.query, req.user);
  res.json({ success: true, data });
});

const layChiTietKhoaHoc = asyncHandler(async (req, res) => {
  const data = await khoaHocChungService.layChiTietKhoaHoc(req.params.id, req.user);
  res.json({ success: true, data });
});

const layTaiLieuKhoaHoc = asyncHandler(async (req, res) => {
  const { data, meta } = await khoaHocChungService.layTaiLieuLop(req.params.courseId, req.user);
  res.json({ success: true, data, meta });
});

const layBaiTapKhoaHoc = asyncHandler(async (req, res) => {
  const data = await khoaHocChungService.layBaiTapLop(req.params.courseId, req.user);
  res.json({ success: true, data });
});

module.exports = {
  layDanhSachKhoaHoc,
  layChiTietKhoaHoc,
  layTaiLieuKhoaHoc,
  layBaiTapKhoaHoc,
};
