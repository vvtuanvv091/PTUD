const MAT_KHAU_YEU = new Set([
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

export const layQuyTacMatKhau = (matKhau = '') => [
  { ma: 'doDai', nhan: 'Tối thiểu 8 ký tự', dat: matKhau.length >= 8 },
  { ma: 'chuHoa', nhan: 'Ít nhất 1 chữ hoa (A-Z)', dat: /[A-Z]/.test(matKhau) },
  { ma: 'chuThuong', nhan: 'Ít nhất 1 chữ thường (a-z)', dat: /[a-z]/.test(matKhau) },
  { ma: 'chuSo', nhan: 'Ít nhất 1 chữ số (0-9)', dat: /[0-9]/.test(matKhau) },
  { ma: 'kyTuDacBiet', nhan: 'Ít nhất 1 ký tự đặc biệt (@, #, $, !...)', dat: /[^A-Za-z0-9\s]/.test(matKhau) },
];

export const kiemTraMatKhauHopLe = (matKhau = '', email = '') => {
  if (!matKhau) return 'Vui lòng nhập mật khẩu';
  if (/\s/.test(matKhau)) return 'Mật khẩu không được chứa khoảng trắng';
  if (matKhau.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự';
  if (MAT_KHAU_YEU.has(matKhau.toLowerCase())) {
    return 'Mật khẩu quá phổ biến và dễ đoán, vui lòng chọn mật khẩu mạnh hơn';
  }
  if (!/[A-Z]/.test(matKhau)) return 'Mật khẩu cần có ít nhất 1 chữ cái in hoa (A-Z)';
  if (!/[a-z]/.test(matKhau)) return 'Mật khẩu cần có ít nhất 1 chữ cái thường (a-z)';
  if (!/[0-9]/.test(matKhau)) return 'Mật khẩu cần có ít nhất 1 chữ số (0-9)';
  if (!/[^A-Za-z0-9]/.test(matKhau)) {
    return 'Mật khẩu cần có ít nhất 1 ký tự đặc biệt (VD: @, #, $, !, ...)';
  }
  const phanTenEmail = email ? email.trim().toLowerCase().split('@')[0] : '';
  if (phanTenEmail && phanTenEmail.length >= 4 && matKhau.toLowerCase().includes(phanTenEmail)) {
    return 'Mật khẩu không được chứa tên tài khoản email của bạn';
  }
  return '';
};
