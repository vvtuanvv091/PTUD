const mongoose = require('mongoose');

const binhLuanSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NguoiDung',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Nội dung bình luận không được để trống'],
      trim: true,
      maxlength: [1000, 'Bình luận tối đa 1000 ký tự'],
    },
  },
  { timestamps: true }
);

const thongBaoLopSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'KhoaHoc',
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NguoiDung',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Vui lòng nhập tiêu đề thông báo'],
      trim: true,
      maxlength: [180, 'Tiêu đề tối đa 180 ký tự'],
    },
    content: {
      type: String,
      required: [true, 'Vui lòng nhập nội dung thông báo'],
      trim: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    comments: [binhLuanSchema],
  },
  { timestamps: true, collection: 'thongbaolop' }
);

const ThongBaoLop = mongoose.models.ThongBaoLop || mongoose.model('ThongBaoLop', thongBaoLopSchema, 'thongbaolop');
module.exports = ThongBaoLop;
