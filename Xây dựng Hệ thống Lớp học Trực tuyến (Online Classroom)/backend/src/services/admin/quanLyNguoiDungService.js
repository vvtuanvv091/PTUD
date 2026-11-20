const User = require('../../models/NguoiDung');
const Course = require('../../models/KhoaHoc');
const Enrollment = require('../../models/GhiDanh');
const { LoiUngDung } = require('../../middleware/errorMiddleware');

const layDanhSachNguoiDung = async ({ search, role, status }) => {
  const filter = {};
  if (role && ['admin', 'teacher', 'student'].includes(role)) filter.role = role;
  if (status && ['active', 'locked'].includes(status)) filter.status = status;

  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { fullName: regex },
      { email: regex },
      { studentCode: regex },
      { department: regex },
    ];
  }

  const [users, demLopDay, demLopHoc] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).lean(),
    Course.aggregate([{ $group: { _id: '$teacher', count: { $sum: 1 } } }]),
    Enrollment.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$student', count: { $sum: 1 } } },
    ]),
  ]);

  const mapDay = new Map(demLopDay.map((i) => [String(i._id), i.count]));
  const mapHoc = new Map(demLopHoc.map((i) => [String(i._id), i.count]));

  return users.map((u) => ({
    ...u,
    courseCount:
      u.role === 'teacher'
        ? mapDay.get(String(u._id)) || 0
        : u.role === 'student'
        ? mapHoc.get(String(u._id)) || 0
        : 0,
  }));
};

const taoNguoiDungMoi = async ({ fullName, email, password, role, studentCode, department }) => {
  if (!fullName || !email || !password) {
    throw new LoiUngDung('Vui lòng nhập đầy đủ họ tên, email và mật khẩu', 400);
  }
  const vaiTro = ['admin', 'teacher', 'student'].includes(role) ? role : 'student';

  const user = await User.create({
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    password,
    role: vaiTro,
    studentCode: (studentCode || '').trim(),
    department: (department || 'Công nghệ thông tin').trim(),
  });

  const ketQua = user.toObject();
  delete ketQua.password;
  return ketQua;
};

const doiTrangThaiTaiKhoan = async (targetUserId, currentAdminId, statusYeuCau) => {
  if (String(targetUserId) === String(currentAdminId)) {
    throw new LoiUngDung('Không thể tự khóa tài khoản quản trị đang đăng nhập', 400);
  }

  const user = await User.findById(targetUserId);
  if (!user) throw new LoiUngDung('Không tìm thấy người dùng', 404);

  const trangThaiMoi =
    statusYeuCau && ['active', 'locked'].includes(statusYeuCau)
      ? statusYeuCau
      : user.status === 'active'
      ? 'locked'
      : 'active';

  user.status = trangThaiMoi;
  await user.save();
  return user;
};

const doiVaiTroNguoiDung = async (targetUserId, currentAdminId, roleMoi) => {
  if (!['admin', 'teacher', 'student'].includes(roleMoi)) {
    throw new LoiUngDung('Vai trò không hợp lệ', 400);
  }
  if (String(targetUserId) === String(currentAdminId)) {
    throw new LoiUngDung('Không thể tự hạ vai trò tài khoản đang đăng nhập', 400);
  }

  const user = await User.findById(targetUserId);
  if (!user) throw new LoiUngDung('Không tìm thấy người dùng', 404);

  user.role = roleMoi;
  await user.save();
  return user;
};

module.exports = {
  layDanhSachNguoiDung,
  taoNguoiDungMoi,
  doiTrangThaiTaiKhoan,
  doiVaiTroNguoiDung,
};
