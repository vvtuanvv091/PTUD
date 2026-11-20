const mongoose = require('mongoose');

const ghiDanhSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NguoiDung',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'KhoaHoc',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'dropped'],
      default: 'active',
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
    completedMaterials: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TaiLieu',
      },
    ],
    progressPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true, collection: 'ghidanh' }
);

// Chống sinh viên ghi danh trùng vào cùng 1 khóa học
ghiDanhSchema.index({ student: 1, course: 1 }, { unique: true });

const GhiDanh = mongoose.models.GhiDanh || mongoose.model('GhiDanh', ghiDanhSchema, 'ghidanh');
module.exports = GhiDanh;
