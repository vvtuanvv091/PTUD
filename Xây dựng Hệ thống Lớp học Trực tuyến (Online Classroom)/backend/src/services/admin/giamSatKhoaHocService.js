const Course = require('../../models/KhoaHoc');
const Enrollment = require('../../models/GhiDanh');
const Material = require('../../models/TaiLieu');
const Assignment = require('../../models/BaiTap');
const { LoiUngDung } = require('../../middleware/errorMiddleware');

const layTatCaKhoaHocQuanTri = async ({ search, status, category }) => {
  const filter = {};
  if (status && ['published', 'draft', 'archived'].includes(status)) filter.status = status;
  if (category) filter.category = category;
  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), 'i');
    filter.$or = [{ title: regex }, { code: regex }, { joinCode: regex }];
  }

  const dsLop = await Course.find(filter)
    .populate('category', 'name accentColor')
    .populate('teacher', 'fullName email department')
    .sort({ createdAt: -1 })
    .lean();

  const mangId = dsLop.map((c) => c._id);
  const [demSv, demTl, demBt] = await Promise.all([
    Enrollment.aggregate([
      { $match: { course: { $in: mangId }, status: 'active' } },
      { $group: { _id: '$course', count: { $sum: 1 } } },
    ]),
    Material.aggregate([
      { $match: { course: { $in: mangId } } },
      { $group: { _id: '$course', count: { $sum: 1 } } },
    ]),
    Assignment.aggregate([
      { $match: { course: { $in: mangId } } },
      { $group: { _id: '$course', count: { $sum: 1 } } },
    ]),
  ]);

  const mapSv = new Map(demSv.map((i) => [String(i._id), i.count]));
  const mapTl = new Map(demTl.map((i) => [String(i._id), i.count]));
  const mapBt = new Map(demBt.map((i) => [String(i._id), i.count]));

  return dsLop.map((lop) => ({
    ...lop,
    studentCount: mapSv.get(String(lop._id)) || 0,
    materialCount: mapTl.get(String(lop._id)) || 0,
    assignmentCount: mapBt.get(String(lop._id)) || 0,
  }));
};

const doiTrangThaiKhoaHoc = async (courseId, statusMoi) => {
  if (!['published', 'draft', 'archived'].includes(statusMoi)) {
    throw new LoiUngDung('Trạng thái khóa học không hợp lệ', 400);
  }
  const lop = await Course.findById(courseId);
  if (!lop) throw new LoiUngDung('Không tìm thấy khóa học', 404);

  lop.status = statusMoi;
  await lop.save();
  return lop;
};

module.exports = {
  layTatCaKhoaHocQuanTri,
  doiTrangThaiKhoaHoc,
};
