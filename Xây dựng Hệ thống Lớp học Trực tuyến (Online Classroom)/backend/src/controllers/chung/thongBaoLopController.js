const asyncHandler = require('../../utils/asyncHandler');
const thongBaoLopService = require('../../services/chung/thongBaoLopService');

const layThongBao = asyncHandler(async (req, res) => {
  const data = await thongBaoLopService.layThongBaoLop(req.params.courseId, req.user);
  res.json({ success: true, data });
});

const taoThongBao = asyncHandler(async (req, res) => {
  const data = await thongBaoLopService.taoThongBaoLop(req.params.courseId, req.body, req.user);
  res.status(201).json({
    success: true,
    message: 'Đã đăng thông báo lên bảng tin lớp',
    data,
  });
});

const ghimThongBao = asyncHandler(async (req, res) => {
  const data = await thongBaoLopService.ghimThongBao(req.params.id, req.user);
  res.json({
    success: true,
    message: data.isPinned ? 'Đã ghim thông báo lên đầu bảng tin' : 'Đã bỏ ghim thông báo',
    data,
  });
});

const xoaThongBao = asyncHandler(async (req, res) => {
  await thongBaoLopService.xoaThongBao(req.params.id, req.user);
  res.json({
    success: true,
    message: 'Đã xóa thông báo',
  });
});

const themBinhLuan = asyncHandler(async (req, res) => {
  const data = await thongBaoLopService.themBinhLuan(req.params.id, req.body.content, req.user);
  res.status(201).json({
    success: true,
    message: 'Đã gửi bình luận',
    data,
  });
});

const xoaBinhLuan = asyncHandler(async (req, res) => {
  await thongBaoLopService.xoaBinhLuan(req.params.id, req.params.commentId, req.user);
  res.json({
    success: true,
    message: 'Đã xóa bình luận',
  });
});

module.exports = {
  layThongBao,
  taoThongBao,
  ghimThongBao,
  xoaThongBao,
  themBinhLuan,
  xoaBinhLuan,
};
