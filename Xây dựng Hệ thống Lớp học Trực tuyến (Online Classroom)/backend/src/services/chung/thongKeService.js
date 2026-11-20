const User = require('../../models/NguoiDung');
const Category = require('../../models/DanhMuc');
const Course = require('../../models/KhoaHoc');
const Material = require('../../models/TaiLieu');
const Enrollment = require('../../models/GhiDanh');
const Assignment = require('../../models/BaiTap');
const Submission = require('../../models/BaiNop');
const { tinhTrangThaiHanNop } = require('../giangVien/baiTapChamDiemService');

const layThongKeCongKhai = async () => {
  const [soSv, soGv, soLopMo, soTaiLieu, dsDanhMuc, dsLopNoiBat, dsGiangVien] = await Promise.all([
    User.countDocuments({ role: 'student', status: 'active' }),
    User.countDocuments({ role: 'teacher', status: 'active' }),
    Course.countDocuments({ status: 'published' }),
    Material.countDocuments(),
    Category.find({ isActive: true }).sort({ name: 1 }).lean(),
    Course.find({ status: 'published' })
      .populate('category', 'name accentColor')
      .populate('teacher', 'fullName email department avatarColor avatarUrl bio')
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
    User.find({ role: 'teacher', status: 'active' })
      .select('fullName email department bio avatarColor avatarUrl')
      .sort({ createdAt: 1 })
      .limit(3)
      .lean(),
  ]);

  const mangId = dsLopNoiBat.map((c) => c._id);
  const [demSv, demTl] = await Promise.all([
    Enrollment.aggregate([
      { $match: { course: { $in: mangId }, status: 'active' } },
      { $group: { _id: '$course', count: { $sum: 1 } } },
    ]),
    Material.aggregate([
      { $match: { course: { $in: mangId } } },
      { $group: { _id: '$course', count: { $sum: 1 } } },
    ]),
  ]);

  const mapSv = new Map(demSv.map((i) => [String(i._id), i.count]));
  const mapTl = new Map(demTl.map((i) => [String(i._id), i.count]));

  return {
    counts: {
      studentCount: soSv,
      teacherCount: soGv,
      courseCount: soLopMo,
      materialCount: soTaiLieu,
      categoryCount: dsDanhMuc.length,
    },
    categories: dsDanhMuc,
    teachers: dsGiangVien,
    featuredCourses: dsLopNoiBat.map((lop) => ({
      ...lop,
      studentCount: mapSv.get(String(lop._id)) || 0,
      materialCount: mapTl.get(String(lop._id)) || 0,
    })),
  };
};

const layThongKeAdmin = async () => {
  const [
    theoVaiTro,
    biKhoa,
    tongDanhMuc,
    theoTrangThai,
    tongGhiDanh,
    tongBaiTap,
    tongBaiNop,
    daCham,
    nopTre,
    dsDanhMuc,
    lopTheoDm,
    nguoiDungMoi,
    ghiDanhMoi,
  ] = await Promise.all([
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    User.countDocuments({ status: 'locked' }),
    Category.countDocuments(),
    Course.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Enrollment.countDocuments({ status: 'active' }),
    Assignment.countDocuments(),
    Submission.countDocuments(),
    Submission.countDocuments({ status: 'graded' }),
    Submission.countDocuments({ isLate: true }),
    Category.find().select('name accentColor').lean(),
    Course.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    User.find().sort({ createdAt: -1 }).limit(6).lean(),
    Enrollment.find({ status: 'active' })
      .populate('student', 'fullName studentCode email')
      .populate('course', 'title code')
      .sort({ enrolledAt: -1 })
      .limit(6)
      .lean(),
  ]);

  const roleCount = { admin: 0, teacher: 0, student: 0 };
  theoVaiTro.forEach((r) => { roleCount[r._id] = r.count; });

  const courseStatusCount = { published: 0, draft: 0, archived: 0 };
  theoTrangThai.forEach((c) => { courseStatusCount[c._id] = c.count; });

  const mapDm = new Map(lopTheoDm.map((i) => [String(i._id), i.count]));

  return {
    role: 'admin',
    overview: {
      totalUsers: roleCount.admin + roleCount.teacher + roleCount.student,
      roleCount,
      lockedUsers: biKhoa,
      totalCategories: tongDanhMuc,
      totalCourses: courseStatusCount.published + courseStatusCount.draft + courseStatusCount.archived,
      courseStatusCount,
      totalEnrollments: tongGhiDanh,
      totalAssignments: tongBaiTap,
      totalSubmissions: tongBaiNop,
      gradedSubmissions: daCham,
      lateSubmissions: nopTre,
      gradingRate: tongBaiNop > 0 ? Math.round((daCham / tongBaiNop) * 100) : 0,
    },
    categoryBreakdown: dsDanhMuc.map((dm) => ({
      _id: dm._id,
      name: dm.name,
      accentColor: dm.accentColor,
      courseCount: mapDm.get(String(dm._id)) || 0,
    })),
    recentUsers: nguoiDungMoi,
    recentEnrollments: ghiDanhMoi,
  };
};

const layThongKeGiangVien = async (teacherId) => {
  const lopCuaToi = await Course.find({ teacher: teacherId })
    .populate('category', 'name accentColor')
    .sort({ createdAt: -1 })
    .lean();

  const mangId = lopCuaToi.map((c) => c._id);
  const [dsGd, dsTl, dsBt, dsBn] = await Promise.all([
    Enrollment.find({ course: { $in: mangId }, status: 'active' }).lean(),
    Material.find({ course: { $in: mangId } }).select('course').lean(),
    Assignment.find({ course: { $in: mangId } }).sort({ dueDate: 1 }).lean(),
    Submission.find({ course: { $in: mangId } })
      .populate('student', 'fullName studentCode email avatarColor')
      .populate('assignment', 'title maxScore dueDate')
      .populate('course', 'title code')
      .sort({ submittedAt: -1 })
      .lean(),
  ]);

  const choCham = dsBn.filter((s) => s.status === 'submitted');
  const daCham = dsBn.filter((s) => s.status === 'graded');

  const courseStats = lopCuaToi.map((lop) => {
    const id = String(lop._id);
    const gdLop = dsGd.filter((e) => String(e.course) === id);
    const tlLop = dsTl.filter((m) => String(m.course) === id);
    const btLop = dsBt.filter((a) => String(a.course) === id);
    const bnLop = dsBn.filter((s) => String(s.course?._id || s.course) === id);
    const avgProgress =
      gdLop.length > 0
        ? Math.round(gdLop.reduce((t, e) => t + e.progressPercent, 0) / gdLop.length)
        : 0;

    return {
      _id: lop._id,
      title: lop.title,
      code: lop.code,
      status: lop.status,
      joinCode: lop.joinCode,
      category: lop.category,
      studentCount: gdLop.length,
      maxStudents: lop.maxStudents,
      materialCount: tlLop.length,
      assignmentCount: btLop.length,
      pendingGradingCount: bnLop.filter((s) => s.status === 'submitted').length,
      avgProgress,
    };
  });

  return {
    role: 'teacher',
    overview: {
      totalCourses: lopCuaToi.length,
      publishedCourses: lopCuaToi.filter((c) => c.status === 'published').length,
      totalStudents: dsGd.length,
      totalMaterials: dsTl.length,
      totalAssignments: dsBt.length,
      totalSubmissions: dsBn.length,
      pendingGradingCount: choCham.length,
      gradedCount: daCham.length,
    },
    pendingQueue: choCham.slice(0, 8),
    courseStats,
  };
};

const layThongKeSinhVien = async (studentId) => {
  const dsGd = await Enrollment.find({ student: studentId, status: 'active' })
    .populate({
      path: 'course',
      populate: [
        { path: 'category', select: 'name accentColor' },
        { path: 'teacher', select: 'fullName' },
      ],
    })
    .sort({ lastAccessedAt: -1 })
    .lean();

  const hopLe = dsGd.filter((e) => e.course);
  const mangId = hopLe.map((e) => e.course._id);

  const [dsBt, dsNop, demTl] = await Promise.all([
    Assignment.find({ course: { $in: mangId } })
      .populate('course', 'title code bannerColor thumbnailUrl')
      .sort({ dueDate: 1 })
      .lean(),
    Submission.find({ student: studentId, course: { $in: mangId } })
      .populate('assignment', 'title maxScore dueDate')
      .populate('course', 'title code')
      .sort({ gradedAt: -1, submittedAt: -1 })
      .lean(),
    Material.aggregate([
      { $match: { course: { $in: mangId } } },
      { $group: { _id: '$course', count: { $sum: 1 } } },
    ]),
  ]);

  const mapTl = new Map(demTl.map((i) => [String(i._id), i.count]));
  const mapNop = new Map(dsNop.map((s) => [String(s.assignment?._id || s.assignment), s]));

  const baiCanLam = dsBt
    .map((bt) => {
      const mySubmission = mapNop.get(String(bt._id)) || null;
      return { ...bt, mySubmission, deadlineState: tinhTrangThaiHanNop(bt, mySubmission) };
    })
    .filter((bt) => ['overdue', 'due_soon', 'upcoming'].includes(bt.deadlineState));

  const daCham = dsNop.filter((s) => s.status === 'graded' && s.score !== null && s.assignment);
  let diemTb = null;
  if (daCham.length > 0) {
    const tong = daCham.reduce((c, s) => c + (s.score / (s.assignment.maxScore || 10)) * 10, 0);
    diemTb = Number((tong / daCham.length).toFixed(2));
  }

  return {
    role: 'student',
    overview: {
      enrolledCoursesCount: hopLe.length,
      avgProgress:
        hopLe.length > 0
          ? Math.round(hopLe.reduce((t, e) => t + e.progressPercent, 0) / hopLe.length)
          : 0,
      pendingAssignmentsCount: baiCanLam.length,
      overdueCount: baiCanLam.filter((a) => a.deadlineState === 'overdue').length,
      dueSoonCount: baiCanLam.filter((a) => a.deadlineState === 'due_soon').length,
      submittedCount: dsNop.length,
      gradedCount: daCham.length,
      averageScore: diemTb,
    },
    enrolledCourses: hopLe.map((e) => ({
      ...e,
      totalMaterials: mapTl.get(String(e.course._id)) || 0,
      completedCount: e.completedMaterials.length,
    })),
    upcomingAssignments: baiCanLam.slice(0, 10),
    recentGrades: daCham.slice(0, 5),
  };
};

const layThongKeTheoVaiTro = async (user) => {
  if (user.role === 'admin') return layThongKeAdmin();
  if (user.role === 'teacher') return layThongKeGiangVien(user._id);
  return layThongKeSinhVien(user._id);
};

module.exports = {
  layThongKeCongKhai,
  layThongKeTheoVaiTro,
};
