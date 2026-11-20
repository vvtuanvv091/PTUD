const User = require('../../models/NguoiDung');
const { kyToken } = require('../../utils/jwt');
const { LoiUngDung } = require('../../middleware/errorMiddleware');

const MAU_AVATAR = ['#DB303A', '#B7212B', '#0284C7', '#166534', '#7C3AED', '#D97706'];

const chuanHoaNguoiDung = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  status: user.status,
  studentCode: user.studentCode,
  department: user.department,
  bio: user.bio,
  avatarColor: user.avatarColor,
  avatarUrl: user.avatarUrl || '',
  createdAt: user.createdAt,
});

const dangKyTaiKhoan = async ({ fullName, email, password, role, studentCode, department }) => {
  if (!fullName || !email || !password) {
    throw new LoiUngDung('Vui lòng nhập đầy đủ họ tên, email và mật khẩu', 400);
  }
  if (password.length < 6) {
    throw new LoiUngDung('Mật khẩu phải có ít nhất 6 ký tự', 400);
  }

  // Tu dang ky chi cho phep Student hoac Teacher (khong tu tao Admin)
  const vaiTroHopLe = role === 'teacher' ? 'teacher' : 'student';
  const emailSach = email.trim().toLowerCase();

  const tonTai = await User.findOne({ email: emailSach });
  if (tonTai) {
    throw new LoiUngDung('Email này đã được đăng ký tài khoản', 409);
  }

  const user = await User.create({
    fullName: fullName.trim(),
    email: emailSach,
    password,
    role: vaiTroHopLe,
    studentCode: (studentCode || '').trim(),
    department: (department || 'Công nghệ thông tin').trim(),
    avatarColor: MAU_AVATAR[Math.floor(Math.random() * MAU_AVATAR.length)],
  });

  return {
    token: kyToken(user),
    user: chuanHoaNguoiDung(user),
  };
};

const dangNhapTaiKhoan = async ({ email, password }) => {
  if (!email || !password) {
    throw new LoiUngDung('Vui lòng nhập email và mật khẩu', 400);
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
  if (!user) {
    throw new LoiUngDung('Email hoặc mật khẩu không chính xác', 401);
  }

  const dungMatKhau = await user.kiemTraMatKhau(password);
  if (!dungMatKhau) {
    throw new LoiUngDung('Email hoặc mật khẩu không chính xác', 401);
  }

  if (user.status === 'locked') {
    throw new LoiUngDung(
      'Tài khoản của bạn đang bị quản trị viên khóa. Vui lòng liên hệ phòng đào tạo.',
      403
    );
  }

  return {
    token: kyToken(user),
    user: chuanHoaNguoiDung(user),
  };
};

const capNhatHoSoCaNhan = async (userId, { fullName, studentCode, department, bio, avatarUrl, avatarColor }) => {
  const user = await User.findById(userId);
  if (!user) throw new LoiUngDung('Không tìm thấy tài khoản', 404);

  if (fullName !== undefined && fullName.trim()) user.fullName = fullName.trim();
  if (studentCode !== undefined) user.studentCode = studentCode.trim();
  if (department !== undefined) user.department = department.trim();
  if (bio !== undefined) user.bio = bio.trim();
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl.trim();
  if (avatarColor !== undefined) user.avatarColor = avatarColor.trim();

  await user.save();
  return chuanHoaNguoiDung(user);
};

const doiMatKhauCaNhan = async (userId, { currentPassword, newPassword }) => {
  if (!currentPassword || !newPassword) {
    throw new LoiUngDung('Vui lòng nhập mật khẩu hiện tại và mật khẩu mới', 400);
  }
  if (newPassword.length < 6) {
    throw new LoiUngDung('Mật khẩu mới phải có tối thiểu 6 ký tự', 400);
  }

  const user = await User.findById(userId).select('+password');
  if (!user) throw new LoiUngDung('Không tìm thấy tài khoản', 404);

  const khopMatKhau = await user.kiemTraMatKhau(currentPassword);
  if (!khopMatKhau) {
    throw new LoiUngDung('Mật khẩu hiện tại không đúng', 400);
  }

  user.password = newPassword;
  await user.save();
};

module.exports = {
  chuanHoaNguoiDung,
  dangKyTaiKhoan,
  dangNhapTaiKhoan,
  capNhatHoSoCaNhan,
  doiMatKhauCaNhan,
};
