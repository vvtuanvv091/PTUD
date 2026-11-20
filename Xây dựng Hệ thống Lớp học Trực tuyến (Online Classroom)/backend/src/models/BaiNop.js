const mongoose = require('mongoose');

const baiNopSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BaiTap',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'KhoaHoc',
      required: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NguoiDung',
      required: true,
    },
    textContent: {
      type: String,
      trim: true,
      default: '',
    },
    fileUrl: { type: String, default: '' },
    fileName: { type: String, default: '' },
    fileSize: { type: Number, default: 0 },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    isLate: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['submitted', 'graded'],
      default: 'submitted',
    },
    score: {
      type: Number,
      default: null,
    },
    feedback: {
      type: String,
      trim: true,
      default: '',
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NguoiDung',
      default: null,
    },
    gradedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true, collection: 'bainop' }
);

baiNopSchema.index({ assignment: 1, student: 1 }, { unique: true });

const BaiNop = mongoose.models.BaiNop || mongoose.model('BaiNop', baiNopSchema, 'bainop');
module.exports = BaiNop;
