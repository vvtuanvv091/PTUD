const asyncHandler = require('../../utils/asyncHandler');
const ghiDanhSinhVienService = require('../../services/sinhVien/ghiDanhSinhVienService');

const ghiDanh = asyncHandler(async (req, res) => {
  const { khoaHoc, ghiDanh: banGhi } = await ghiDanhSinhVienService.ghiDanhKhoaHoc(
    req.body,
    req.user._id
  );
  res.status(201).json({
    success: true,
    message: `Ghi danh thành công vào lớp "${khoaHoc.title}"`,
    data: banGhi,
  });
});

const layLopCuaToi = asyncHandler(async (req, res) => {
  const data = await ghiDanhSinhVienService.layKhoaHocDaGhiDanh(req.user._id);
  res.json({ success: true, data });
});

const roiLop = asyncHandler(async (req, res) => {
  await ghiDanhSinhVienService.roiKhoaHoc(req.params.courseId, req.user._id);
  res.json({
    success: true,
    message: 'Đã rời khỏi khóa học',
  });
});

const danhDauHoanThanhTaiLieu = asyncHandler(async (req, res) => {
  const data = await ghiDanhSinhVienService.danhDauHoanThanhTaiLieu(
    req.params.id,
    req.user._id
  );
  res.json({
    success: true,
    message: data.completed ? 'Đã đánh dấu hoàn thành bài học' : 'Đã bỏ đánh dấu hoàn thành',
    data,
  });
});

module.exports = {
  ghiDanh,
  layLopCuaToi,
  roiLop,
  danhDauHoanThanhTaiLieu,
};
