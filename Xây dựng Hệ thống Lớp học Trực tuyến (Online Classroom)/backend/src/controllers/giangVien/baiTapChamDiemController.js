const asyncHandler = require('../../utils/asyncHandler');
const baiTapChamDiemService = require('../../services/giangVien/baiTapChamDiemService');

const taoBaiTap = asyncHandler(async (req, res) => {
  const data = await baiTapChamDiemService.taoBaiTap(
    req.params.courseId,
    req.body,
    req.file,
    req.user
  );
  res.status(201).json({
    success: true,
    message: 'Đã giao bài tập mới cho lớp',
    data,
  });
});

const capNhatBaiTap = asyncHandler(async (req, res) => {
  const data = await baiTapChamDiemService.capNhatBaiTap(
    req.params.id,
    req.body,
    req.file,
    req.user
  );
  res.json({
    success: true,
    message: 'Đã cập nhật thông tin bài tập',
    data,
  });
});

const xoaBaiTap = asyncHandler(async (req, res) => {
  await baiTapChamDiemService.xoaBaiTap(req.params.id, req.user);
  res.json({
    success: true,
    message: 'Đã xóa bài tập và toàn bộ bài nộp liên quan',
  });
});

const layDanhSachBaiNop = asyncHandler(async (req, res) => {
  const data = await baiTapChamDiemService.layBaiNopTheoBaiTap(
    req.params.assignmentId,
    req.query,
    req.user
  );
  res.json({ success: true, data });
});

const chamDiem = asyncHandler(async (req, res) => {
  const data = await baiTapChamDiemService.chamDiemBaiNop(
    req.params.id,
    req.body,
    req.user
  );
  res.json({
    success: true,
    message: 'Đã lưu điểm và nhận xét cho sinh viên',
    data,
  });
});

module.exports = {
  taoBaiTap,
  capNhatBaiTap,
  xoaBaiTap,
  layDanhSachBaiNop,
  chamDiem,
};
