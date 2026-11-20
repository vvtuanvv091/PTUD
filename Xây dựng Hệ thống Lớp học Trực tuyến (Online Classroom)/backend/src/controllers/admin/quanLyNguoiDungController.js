const asyncHandler = require('../../utils/asyncHandler');
const quanLyNguoiDungService = require('../../services/admin/quanLyNguoiDungService');

const layDanhSachNguoiDung = asyncHandler(async (req, res) => {
  const data = await quanLyNguoiDungService.layDanhSachNguoiDung(req.query);
  res.json({ success: true, data });
});

const taoNguoiDung = asyncHandler(async (req, res) => {
  const data = await quanLyNguoiDungService.taoNguoiDungMoi(req.body);
  res.status(201).json({
    success: true,
    message: 'Đã tạo tài khoản người dùng mới',
    data,
  });
});

const doiTrangThaiTaiKhoan = asyncHandler(async (req, res) => {
  const user = await quanLyNguoiDungService.doiTrangThaiTaiKhoan(
    req.params.id,
    req.user._id,
    req.body?.status
  );
  res.json({
    success: true,
    message:
      user.status === 'locked'
        ? `Đã khóa tài khoản ${user.fullName}`
        : `Đã mở khóa tài khoản ${user.fullName}`,
    data: user,
  });
});

const doiVaiTro = asyncHandler(async (req, res) => {
  const user = await quanLyNguoiDungService.doiVaiTroNguoiDung(
    req.params.id,
    req.user._id,
    req.body.role
  );
  res.json({
    success: true,
    message: `Đã cập nhật vai trò của ${user.fullName}`,
    data: user,
  });
});

module.exports = {
  layDanhSachNguoiDung,
  taoNguoiDung,
  doiTrangThaiTaiKhoan,
  doiVaiTro,
};
