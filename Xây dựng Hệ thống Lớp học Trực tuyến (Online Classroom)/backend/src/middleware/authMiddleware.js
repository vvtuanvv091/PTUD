const User = require('../models/NguoiDung');
const { giaiMaToken } = require('../utils/jwt');
const { LoiUngDung } = require('./errorMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const trichXuatToken = (req) => {
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return null;
};

// Bat buoc dang nhap & kiem tra trang thai khoa (locked) ngay tren moi request
const yeuCauDangNhap = asyncHandler(async (req, _res, next) => {
  const token = trichXuatToken(req);
  if (!token) {
    throw new LoiUngDung('Vui lòng đăng nhập để truy cập chức năng này', 401);
  }

  const payload = giaiMaToken(token);
  const user = await User.findById(payload.id).select('-password');

  if (!user) {
    throw new LoiUngDung('Tài khoản không còn tồn tại trong hệ thống', 401);
  }

  if (user.status === 'locked') {
    throw new LoiUngDung('Tài khoản của bạn đã bị quản trị viên khóa', 403);
  }

  req.user = user;
  next();
});

// Cho phep khach xem cong khai nhung neu co token hop le thi gan req.user
const xacThucTuyChon = asyncHandler(async (req, _res, next) => {
  const token = trichXuatToken(req);
  if (!token) return next();

  try {
    const payload = giaiMaToken(token);
    const user = await User.findById(payload.id).select('-password');
    if (user && user.status === 'active') {
      req.user = user;
    }
  } catch {
    // Bo qua token loi o route cong khai
  }
  return next();
});

const phanQuyen = (...cacVaiTro) => (req, _res, next) => {
  if (!req.user) {
    return next(new LoiUngDung('Chưa xác thực người dùng', 401));
  }
  if (!cacVaiTro.includes(req.user.role)) {
    return next(new LoiUngDung('Bạn không có quyền thực hiện thao tác này', 403));
  }
  return next();
};

module.exports = { yeuCauDangNhap, xacThucTuyChon, phanQuyen };
