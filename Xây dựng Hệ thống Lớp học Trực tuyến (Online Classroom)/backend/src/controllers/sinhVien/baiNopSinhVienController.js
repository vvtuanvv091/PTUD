const asyncHandler = require('../../utils/asyncHandler');
const baiNopSinhVienService = require('../../services/sinhVien/baiNopSinhVienService');

const layHanNopSapToi = asyncHandler(async (req, res) => {
  const data = await baiNopSinhVienService.layBaiTapSapToi(req.user._id);
  res.json({ success: true, data });
});

const nopBai = asyncHandler(async (req, res) => {
  const { baiNop, biTreHan, laCapNhat } = await baiNopSinhVienService.nopBaiTap(
    req.params.assignmentId,
    req.body,
    req.file,
    req.user._id
  );
  res.status(laCapNhat ? 200 : 201).json({
    success: true,
    message: biTreHan ? 'Đã nộp bài (trạng thái nộp trễ hạn)' : 'Đã nộp bài tập thành công',
    data: baiNop,
  });
});

const layBangDiemCaNhan = asyncHandler(async (req, res) => {
  const data = await baiNopSinhVienService.layBangDiemCaNhan(req.user._id);
  res.json({ success: true, data });
});

module.exports = {
  layHanNopSapToi,
  nopBai,
  layBangDiemCaNhan,
};
