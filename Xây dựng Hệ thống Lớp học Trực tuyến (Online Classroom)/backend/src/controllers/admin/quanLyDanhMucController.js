const asyncHandler = require('../../utils/asyncHandler');
const quanLyDanhMucService = require('../../services/admin/quanLyDanhMucService');

const layDanhSachDanhMuc = asyncHandler(async (req, res) => {
  const data = await quanLyDanhMucService.layDanhSachDanhMuc({
    includeInactive: req.query.includeInactive,
    userRole: req.user?.role,
  });
  res.json({ success: true, data });
});

const taoDanhMuc = asyncHandler(async (req, res) => {
  const data = await quanLyDanhMucService.taoDanhMucMoi(req.body, req.user._id);
  res.status(201).json({
    success: true,
    message: 'Đã thêm danh mục khóa học mới',
    data,
  });
});

const capNhatDanhMuc = asyncHandler(async (req, res) => {
  const data = await quanLyDanhMucService.capNhatDanhMuc(req.params.id, req.body);
  res.json({
    success: true,
    message: 'Đã cập nhật danh mục khóa học',
    data,
  });
});

const xoaDanhMuc = asyncHandler(async (req, res) => {
  await quanLyDanhMucService.xoaDanhMuc(req.params.id);
  res.json({
    success: true,
    message: 'Đã xóa danh mục khóa học',
  });
});

module.exports = {
  layDanhSachDanhMuc,
  taoDanhMuc,
  capNhatDanhMuc,
  xoaDanhMuc,
};
