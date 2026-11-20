const Category = require('../../models/DanhMuc');
const Course = require('../../models/KhoaHoc');
const { LoiUngDung } = require('../../middleware/errorMiddleware');

const layDanhSachDanhMuc = async ({ includeInactive, userRole }) => {
  const filter = {};
  if (includeInactive !== 'true' || userRole !== 'admin') {
    filter.isActive = true;
  }

  const [danhSach, demKhoaHoc] = await Promise.all([
    Category.find(filter).sort({ name: 1 }).lean(),
    Course.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
  ]);

  const mapDem = new Map(demKhoaHoc.map((i) => [String(i._id), i.count]));
  return danhSach.map((dm) => ({
    ...dm,
    courseCount: mapDem.get(String(dm._id)) || 0,
  }));
};

const taoDanhMucMoi = async ({ name, description, accentColor, isActive }, adminId) => {
  if (!name || !name.trim()) {
    throw new LoiUngDung('Vui lòng nhập tên danh mục khóa học', 400);
  }

  return Category.create({
    name: name.trim(),
    description: (description || '').trim(),
    accentColor: accentColor || '#DB303A',
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    createdBy: adminId,
  });
};

const capNhatDanhMuc = async (id, { name, description, accentColor, isActive }) => {
  const dm = await Category.findById(id);
  if (!dm) throw new LoiUngDung('Không tìm thấy danh mục', 404);

  if (name !== undefined && name.trim()) dm.name = name.trim();
  if (description !== undefined) dm.description = description.trim();
  if (accentColor !== undefined) dm.accentColor = accentColor;
  if (isActive !== undefined) dm.isActive = Boolean(isActive);

  await dm.save();
  return dm;
};

const xoaDanhMuc = async (id) => {
  const dm = await Category.findById(id);
  if (!dm) throw new LoiUngDung('Không tìm thấy danh mục', 404);

  const soLopDangDung = await Course.countDocuments({ category: dm._id });
  if (soLopDangDung > 0) {
    throw new LoiUngDung(
      `Không thể xóa danh mục "${dm.name}" vì đang có ${soLopDangDung} khóa học sử dụng`,
      400
    );
  }

  await dm.deleteOne();
};

module.exports = {
  layDanhSachDanhMuc,
  taoDanhMucMoi,
  capNhatDanhMuc,
  xoaDanhMuc,
};
