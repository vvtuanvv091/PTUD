const mongoose = require('mongoose');

const taoSlug = (vanBan) =>
  String(vanBan || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const danhMucSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên danh mục'],
      unique: true,
      trim: true,
      maxlength: [80, 'Tên danh mục tối đa 80 ký tự'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    accentColor: {
      type: String,
      default: '#DB303A',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NguoiDung',
    },
  },
  { timestamps: true, collection: 'danhmuc' }
);

danhMucSchema.pre('validate', function ganSlug(next) {
  if (this.name && (!this.slug || this.isModified('name'))) {
    this.slug = taoSlug(this.name);
  }
  next();
});

const DanhMuc = mongoose.models.DanhMuc || mongoose.model('DanhMuc', danhMucSchema, 'danhmuc');
module.exports = DanhMuc;
