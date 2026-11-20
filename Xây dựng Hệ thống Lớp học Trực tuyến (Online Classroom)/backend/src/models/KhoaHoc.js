const mongoose = require('mongoose');

const taoMaThamGiaNgauNhien = () => {
  const kyTu = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ma = '';
  for (let i = 0; i < 6; i += 1) {
    ma += kyTu[Math.floor(Math.random() * kyTu.length)];
  }
  return ma;
};

const khoaHocSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Vui lòng nhập tên khóa học'],
      trim: true,
      maxlength: [160, 'Tên khóa học tối đa 160 ký tự'],
    },
    code: {
      type: String,
      required: [true, 'Vui lòng nhập mã học phần'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [24, 'Mã học phần tối đa 24 ký tự'],
    },
    description: {
      type: String,
      required: [true, 'Vui lòng nhập mô tả khóa học'],
      trim: true,
    },
    syllabusSummary: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DanhMuc',
      required: [true, 'Vui lòng chọn danh mục khóa học'],
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NguoiDung',
      required: true,
      index: true,
    },
    semester: {
      type: String,
      trim: true,
      default: 'HK1 2026 - 2027',
    },
    schedule: {
      type: String,
      trim: true,
      default: 'Thứ 3 & Thứ 5 • 18:30 - 20:30',
    },
    joinCode: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
      default: taoMaThamGiaNgauNhien,
    },
    bannerColor: {
      type: String,
      default: '#DB303A',
    },
    thumbnailUrl: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['published', 'draft', 'archived'],
      default: 'published',
    },
    maxStudents: {
      type: Number,
      default: 60,
      min: [1, 'Sĩ số tối đa phải lớn hơn 0'],
    },
  },
  { timestamps: true, collection: 'khoahoc' }
);

khoaHocSchema.index({ title: 'text', code: 'text', description: 'text' });

const KhoaHoc = mongoose.models.KhoaHoc || mongoose.model('KhoaHoc', khoaHocSchema, 'khoahoc');
module.exports = KhoaHoc;
