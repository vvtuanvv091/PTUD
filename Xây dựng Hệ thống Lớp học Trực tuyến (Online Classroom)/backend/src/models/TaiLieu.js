const mongoose = require('mongoose');

const taiLieuSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'KhoaHoc',
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NguoiDung',
      required: true,
    },
    moduleTitle: {
      type: String,
      trim: true,
      default: 'Chương 1: Tổng quan',
    },
    title: {
      type: String,
      required: [true, 'Vui lòng nhập tiêu đề tài liệu'],
      trim: true,
      maxlength: [180, 'Tiêu đề tài liệu tối đa 180 ký tự'],
    },
    type: {
      type: String,
      enum: ['pdf', 'video', 'reading'],
      required: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    fileUrl: { type: String, default: '' },
    fileName: { type: String, default: '' },
    fileSize: { type: Number, default: 0 },
    videoUrl: { type: String, trim: true, default: '' },
    content: { type: String, default: '' },
    durationMinutes: { type: Number, default: 15, min: 1 },
    order: { type: Number, default: 1 },
  },
  { timestamps: true, collection: 'tailieu' }
);

const TaiLieu = mongoose.models.TaiLieu || mongoose.model('TaiLieu', taiLieuSchema, 'tailieu');
module.exports = TaiLieu;
