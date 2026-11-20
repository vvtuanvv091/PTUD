const mongoose = require('mongoose');

const baiTapSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: [true, 'Vui lòng nhập tiêu đề bài tập'],
      trim: true,
      maxlength: [180, 'Tiêu đề bài tập tối đa 180 ký tự'],
    },
    description: {
      type: String,
      required: [true, 'Vui lòng nhập yêu cầu bài tập'],
      trim: true,
    },
    attachmentUrl: { type: String, default: '' },
    attachmentName: { type: String, default: '' },
    dueDate: {
      type: Date,
      required: [true, 'Vui lòng chọn hạn nộp bài'],
    },
    maxScore: {
      type: Number,
      default: 10,
      min: [1, 'Điểm tối đa phải lớn hơn 0'],
      max: [100, 'Điểm tối đa không vượt quá 100'],
    },
    allowLateSubmission: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },
  },
  { timestamps: true, collection: 'baitap' }
);

const BaiTap = mongoose.models.BaiTap || mongoose.model('BaiTap', baiTapSchema, 'baitap');
module.exports = BaiTap;
