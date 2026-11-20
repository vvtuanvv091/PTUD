const Course = require('../../models/KhoaHoc');
const Material = require('../../models/TaiLieu');
const Enrollment = require('../../models/GhiDanh');
const Assignment = require('../../models/BaiTap');
const Submission = require('../../models/BaiNop');
const Announcement = require('../../models/ThongBaoLop');
const { LoiUngDung } = require('../../middleware/errorMiddleware');
const { tinhTrangThaiHanNop } = require('../giangVien/baiTapChamDiemService');

const layDanhSachKhoaHoc = async ({ search, category, status, mine, semester }, user) => {
  const filter = {};

  if (mine === 'true' && user?.role === 'teacher') {
    filter.teacher = user._id;
    if (status && ['published', 'draft', 'archived'].includes(status)) filter.status = status;
  } else if (user?.role === 'admin') {
    if (status && ['published', 'draft', 'archived'].includes(status)) filter.status = status;
  } else {
    filter.status = 'published';
  }

  if (category) filter.category = category;
  if (semester) filter.semester = semester;

  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), 'i');
    filter.$or = [{ title: regex }, { code: regex }, { description: regex }, { joinCode: regex }];
  }

  const dsLop = await Course.find(filter)
    .populate('category', 'name slug accentColor')
    .populate('teacher', 'fullName email department avatarColor avatarUrl studentCode')
    .sort({ createdAt: -1 })
    .lean();

  const mangId = dsLop.map((lop) => lop._id);
  const [demSv, demTl, demBt, ghiDanhCuaToi] = await Promise.all([
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
    user?.role === 'student'
      ? Enrollment.find({ student: user._id, course: { $in: mangId }, status: 'active' }).lean()
      : Promise.resolve([]),
  ]);

  const mapSv = new Map(demSv.map((i) => [String(i._id), i.count]));
  const mapTl = new Map(demTl.map((i) => [String(i._id), i.count]));
  const mapBt = new Map(demBt.map((i) => [String(i._id), i.count]));
  const mapCuaToi = new Map(ghiDanhCuaToi.map((e) => [String(e.course), e]));

  return dsLop.map((lop) => {
    const id = String(lop._id);
    const gd = mapCuaToi.get(id) || null;
    return {
      ...lop,
      studentCount: mapSv.get(id) || 0,
      materialCount: mapTl.get(id) || 0,
      assignmentCount: mapBt.get(id) || 0,
      isEnrolled: Boolean(gd),
      myEnrollment: gd
        ? { _id: gd._id, progressPercent: gd.progressPercent, enrolledAt: gd.enrolledAt }
        : null,
    };
  });
};

const layChiTietKhoaHoc = async (courseId, user) => {
  const khoaHoc = await Course.findById(courseId)
    .populate('category', 'name slug accentColor')
    .populate('teacher', 'fullName email department bio avatarColor avatarUrl studentCode')
    .lean();

  if (!khoaHoc) throw new LoiUngDung('Không tìm thấy khóa học', 404);

  const laQuanLy =
    user &&
    (user.role === 'admin' ||
      (user.role === 'teacher' && String(khoaHoc.teacher._id) === String(user._id)));

  if (khoaHoc.status !== 'published' && !laQuanLy) {
    throw new LoiUngDung('Khóa học này hiện không công khai', 403);
  }

  const [soSv, soTl, soBt, soTb, ghiDanhCuaToi] = await Promise.all([
    Enrollment.countDocuments({ course: khoaHoc._id, status: 'active' }),
    Material.countDocuments({ course: khoaHoc._id }),
    Assignment.countDocuments({ course: khoaHoc._id }),
    Announcement.countDocuments({ course: khoaHoc._id }),
    user?.role === 'student'
      ? Enrollment.findOne({ student: user._id, course: khoaHoc._id, status: 'active' }).lean()
      : Promise.resolve(null),
  ]);

  return {
    ...khoaHoc,
    studentCount: soSv,
    materialCount: soTl,
    assignmentCount: soBt,
    announcementCount: soTb,
    isOwner: Boolean(laQuanLy),
    isEnrolled: Boolean(ghiDanhCuaToi),
    myEnrollment: ghiDanhCuaToi,
  };
};

const layTaiLieuLop = async (courseId, user) => {
  const khoaHoc = await Course.findById(courseId);
  if (!khoaHoc) throw new LoiUngDung('Không tìm thấy khóa học', 404);

  const laQuanLy =
    user &&
    (user.role === 'admin' ||
      (user.role === 'teacher' && String(khoaHoc.teacher) === String(user._id)));

  let ghiDanh = null;
  if (user?.role === 'student') {
    ghiDanh = await Enrollment.findOne({
      student: user._id,
      course: khoaHoc._id,
      status: 'active',
    }).lean();
  }

  const duocXemDayDu = Boolean(laQuanLy || ghiDanh);
  const tapHoanThanh = new Set((ghiDanh?.completedMaterials || []).map((id) => String(id)));

  const dsTaiLieu = await Material.find({ course: khoaHoc._id })
    .sort({ order: 1, createdAt: 1 })
    .lean();

  const data = dsTaiLieu.map((tl) => ({
    ...tl,
    isCompleted: tapHoanThanh.has(String(tl._id)),
    fileUrl: duocXemDayDu ? tl.fileUrl : '',
    videoUrl: duocXemDayDu ? tl.videoUrl : '',
    content: duocXemDayDu ? tl.content : '',
    locked: !duocXemDayDu,
  }));

  return {
    data,
    meta: {
      total: dsTaiLieu.length,
      completedCount: ghiDanh ? ghiDanh.completedMaterials.length : 0,
      progressPercent: ghiDanh ? ghiDanh.progressPercent : 0,
      canAccessFullContent: duocXemDayDu,
    },
  };
};

const layBaiTapLop = async (courseId, user) => {
  const khoaHoc = await Course.findById(courseId);
  if (!khoaHoc) throw new LoiUngDung('Không tìm thấy khóa học', 404);

  const dsBaiTap = await Assignment.find({ course: khoaHoc._id }).sort({ dueDate: 1 }).lean();
  const mangIdBt = dsBaiTap.map((bt) => bt._id);

  if (user?.role === 'student') {
    const dsNop = await Submission.find({
      student: user._id,
      assignment: { $in: mangIdBt },
    }).lean();
    const mapNop = new Map(dsNop.map((s) => [String(s.assignment), s]));

    return dsBaiTap.map((bt) => {
      const mySubmission = mapNop.get(String(bt._id)) || null;
      return {
        ...bt,
        mySubmission,
        deadlineState: tinhTrangThaiHanNop(bt, mySubmission),
      };
    });
  }

  const laQuanLy =
    user &&
    (user.role === 'admin' ||
      (user.role === 'teacher' && String(khoaHoc.teacher) === String(user._id)));

  if (laQuanLy) {
    const [thongKeNop, siSoLop] = await Promise.all([
      Submission.aggregate([
        { $match: { assignment: { $in: mangIdBt } } },
        {
          $group: {
            _id: '$assignment',
            totalSubmitted: { $sum: 1 },
            gradedCount: { $sum: { $cond: [{ $eq: ['$status', 'graded'] }, 1, 0] } },
            lateCount: { $sum: { $cond: ['$isLate', 1, 0] } },
          },
        },
      ]),
      Enrollment.countDocuments({ course: khoaHoc._id, status: 'active' }),
    ]);

    const mapTk = new Map(thongKeNop.map((i) => [String(i._id), i]));
    return dsBaiTap.map((bt) => {
      const tk = mapTk.get(String(bt._id)) || { totalSubmitted: 0, gradedCount: 0, lateCount: 0 };
      return {
        ...bt,
        stats: {
          enrolledCount: siSoLop,
          submittedCount: tk.totalSubmitted,
          gradedCount: tk.gradedCount,
          pendingGradingCount: tk.totalSubmitted - tk.gradedCount,
          lateCount: tk.lateCount,
        },
      };
    });
  }

  return dsBaiTap;
};

module.exports = {
  layDanhSachKhoaHoc,
  layChiTietKhoaHoc,
  layTaiLieuLop,
  layBaiTapLop,
};
