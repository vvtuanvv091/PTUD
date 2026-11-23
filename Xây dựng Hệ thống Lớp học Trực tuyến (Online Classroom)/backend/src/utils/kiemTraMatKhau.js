const { LoiUngDung } = require('../middleware/errorMiddleware');

const MAT_KHAU_YEU_PHO_BIEN = new Set([
  '123456',
  '12345678',
  '123456789',
  '1234567890',
  'password',
  'password123',
  'qwerty123',
  'admin123',
  'admin@123',
  'abc12345',
  '00000000',
  '11111111',
]);

const kiemTraDoManhMatKhau = (matKhau, { email = '' } = {}) => {
  if (!matKhau || typeof matKhau !== 'string') {
    throw new LoiUngDung('Vui lòng nhập mật khẩu', 400);
  }
  if (/\s/.test(matKhau)) {
    throw new LoiUngDung('Mật khẩu không được chứa khoảng trắng', 400);
  }
  if (matKhau.length < 8) {
    throw new LoiUngDung('Mật khẩu phải có ít nhất 8 ký tự', 400);
  }
  if (MAT_KHAU_YEU_PHO_BIEN.has(matKhau.toLowerCase())) {
    throw new LoiUngDung('Mật khẩu quá phổ biến và dễ đoán, vui lòng chọn mật khẩu mạnh hơn', 400);
  }
  if (!/[A-Z]/.test(matKhau)) {
    throw new LoiUngDung('Mật khẩu cần có ít nhất 1 chữ cái in hoa (A-Z)', 400);
  }
  if (!/[a-z]/.test(matKhau)) {
    throw new LoiUngDung('Mật khẩu cần có ít nhất 1 chữ cái thường (a-z)', 400);
  }
  if (!/[0-9]/.test(matKhau)) {
    throw new LoiUngDung('Mật khẩu cần có ít nhất 1 chữ số (0-9)', 400);
  }
  if (!/[^A-Za-z0-9]/.test(matKhau)) {
    throw new LoiUngDung('Mật khẩu cần có ít nhất 1 ký tự đặc biệt (VD: @, #, $, !, ...)', 400);
  }
  const phanTenEmail = email ? email.trim().toLowerCase().split('@')[0] : '';
  if (phanTenEmail && phanTenEmail.length >= 4 && matKhau.toLowerCase().includes(phanTenEmail)) {
    throw new LoiUngDung('Mật khẩu không được chứa tên tài khoản email của bạn', 400);
  }
};

module.exports = { kiemTraDoManhMatKhau };
