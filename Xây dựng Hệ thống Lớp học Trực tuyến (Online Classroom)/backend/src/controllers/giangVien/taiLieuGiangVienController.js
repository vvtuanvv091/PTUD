const asyncHandler = require('../../utils/asyncHandler');
const taiLieuGiangVienService = require('../../services/giangVien/taiLieuGiangVienService');

const taoTaiLieu = asyncHandler(async (req, res) => {
  const data = await taiLieuGiangVienService.taoTaiLieu(
    req.params.courseId,
    req.body,
    req.file,
    req.user
  );
  res.status(201).json({
    success: true,
    message: 'Đã đăng tải tài liệu vào khóa học',
    data,
  });
});

const capNhatTaiLieu = asyncHandler(async (req, res) => {
  const data = await taiLieuGiangVienService.capNhatTaiLieu(
    req.params.id,
    req.body,
    req.file,
    req.user
  );
  res.json({
    success: true,
    message: 'Đã cập nhật tài liệu học tập',
    data,
  });
});

const xoaTaiLieu = asyncHandler(async (req, res) => {
  await taiLieuGiangVienService.xoaTaiLieu(req.params.id, req.user);
  res.json({
    success: true,
    message: 'Đã xóa tài liệu khỏi khóa học',
  });
});

module.exports = {
  taoTaiLieu,
  capNhatTaiLieu,
  xoaTaiLieu,
};
