const asyncHandler = require('../../utils/asyncHandler');
const authService = require('../../services/auth/authService');
const { LoiUngDung } = require('../../middleware/errorMiddleware');

const dangKy = asyncHandler(async (req, res) => {
  const ketQua = await authService.dangKyTaiKhoan(req.body);
  res.status(201).json({
    success: true,
    message: 'Đăng ký tài khoản thành công',
    data: ketQua,
  });
});

const dangNhap = asyncHandler(async (req, res) => {
  const ketQua = await authService.dangNhapTaiKhoan(req.body);
  res.json({
    success: true,
    message: 'Đăng nhập thành công',
    data: ketQua,
  });
});

const layHoSoCuaToi = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: authService.chuanHoaNguoiDung(req.user),
  });
});

const capNhatHoSo = asyncHandler(async (req, res) => {
  const user = await authService.capNhatHoSoCaNhan(req.user._id, req.body);
  res.json({
    success: true,
    message: 'Đã cập nhật hồ sơ cá nhân',
    data: user,
  });
});

const taiLenAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new LoiUngDung('Vui lòng chọn tệp ảnh đại diện', 400);
  }
  const avatarUrl = `/uploads/avatars/${req.file.filename}`;
  const user = await authService.capNhatHoSoCaNhan(req.user._id, { avatarUrl });
  res.json({
    success: true,
    message: 'Đã cập nhật ảnh đại diện thành công',
    data: user,
  });
});

const doiMatKhau = asyncHandler(async (req, res) => {
  await authService.doiMatKhauCaNhan(req.user._id, req.body);
  res.json({
    success: true,
    message: 'Đổi mật khẩu thành công',
  });
});

module.exports = {
  dangKy,
  dangNhap,
  layHoSoCuaToi,
  capNhatHoSo,
  taiLenAvatar,
  doiMatKhau,
};
