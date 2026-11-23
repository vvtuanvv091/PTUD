const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const nguoiDungSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Vui lòng nhập họ và tên'],
      trim: true,
      maxlength: [100, 'Họ tên tối đa 100 ký tự'],
    },
    email: {
      type: String,
      required: [true, 'Vui lòng nhập địa chỉ email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Địa chỉ email không hợp lệ'],
    },
    password: {
      type: String,
      required: [true, 'Vui lòng nhập mật khẩu'],
      minlength: [8, 'Mật khẩu cần tối thiểu 8 ký tự'],
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'teacher', 'student'],
      default: 'student',
    },
    status: {
      type: String,
      enum: ['active', 'locked'],
      default: 'active',
    },
    studentCode: {
      type: String,
      trim: true,
      default: '',
    },
    department: {
      type: String,
      trim: true,
      default: 'Công nghệ thông tin',
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [400, 'Giới thiệu tối đa 400 ký tự'],
      default: '',
    },
    avatarColor: {
      type: String,
      default: '#DB303A',
    },
    avatarUrl: {
      type: String,
      default: '',
    },
  },
  { timestamps: true, collection: 'nguoidung' }
);

nguoiDungSchema.pre('save', async function bamMatKhau(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

nguoiDungSchema.methods.kiemTraMatKhau = function kiemTraMatKhau(matKhauNhap) {
  return bcrypt.compare(matKhauNhap, this.password);
};

const NguoiDung = mongoose.models.NguoiDung || mongoose.model('NguoiDung', nguoiDungSchema, 'nguoidung');
module.exports = NguoiDung;
