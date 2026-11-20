const Course = require('../../models/KhoaHoc');
const Category = require('../../models/DanhMuc');
const Material = require('../../models/TaiLieu');
const Enrollment = require('../../models/GhiDanh');
const Assignment = require('../../models/BaiTap');
const Submission = require('../../models/BaiNop');
const Announcement = require('../../models/ThongBaoLop');
const { LoiUngDung } = require('../../middleware/errorMiddleware');
const { taoBufferCsv } = require('../../utils/csvExport');

const kiemTraQuyenQuanLyLop = (khoaHoc, user) => {
  if (!user) throw new LoiUngDung('Chưa xác thực người dùng', 401);
  if (user.role === 'admin') return;
  if (
    user.role === 'teacher' &&
    String(khoaHoc.teacher._id || khoaHoc.teacher) === String(user._id)
  ) {
    return;
  }
  throw new LoiUngDung('Bạn không có quyền quản trị khóa học này', 403);
};

const taoKhoaHoc = async (body, file, user) => {
  const {
    title,
    code,
    description,
    syllabusSummary,
    category,
    semester,
    schedule,
    joinCode,
    bannerColor,
    thumbnailUrl,
    status,
    maxStudents,
  } = body;

  if (!title || !code || !description || !category) {
    throw new LoiUngDung('Vui lòng nhập đầy đủ tên khóa học, mã học phần, danh mục và mô tả', 400);
  }

  const danhMucDoc = await Category.findById(category);
  if (!danhMucDoc) {
    throw new LoiUngDung('Danh mục khóa học không tồn tại', 400);
  }

  const duLieuTao = {
    title: title.trim(),
    code: code.trim().toUpperCase(),
    description: description.trim(),
    syllabusSummary: (syllabusSummary || '').trim(),
    category: danhMucDoc._id,
    teacher: user._id,
    semester: (semester || 'HK1 2026 - 2027').trim(),
    schedule: (schedule || 'Thứ 3 & Thứ 5 • 18:30 - 20:30').trim(),
    bannerColor: bannerColor || danhMucDoc.accentColor || '#DB303A',
    thumbnailUrl: file ? `/uploads/courses/${file.filename}` : (thumbnailUrl || '').trim(),
    status: ['published', 'draft', 'archived'].includes(status) ? status : 'published',
    maxStudents: Number(maxStudents) || 60,
  };

  if (joinCode && joinCode.trim()) {
    duLieuTao.joinCode = joinCode.trim().toUpperCase();
  }

  const khoaHoc = await Course.create(duLieuTao);
  return Course.findById(khoaHoc._id)
    .populate('category', 'name slug accentColor')
    .populate('teacher', 'fullName email department avatarColor');
};

const capNhatKhoaHoc = async (courseId, body, file, user) => {
  const khoaHoc = await Course.findById(courseId);
  if (!khoaHoc) throw new LoiUngDung('Không tìm thấy khóa học', 404);

  kiemTraQuyenQuanLyLop(khoaHoc, user);

  const truongChoSua = [
    'title',
    'code',
    'description',
    'syllabusSummary',
    'category',
    'semester',
    'schedule',
    'joinCode',
    'bannerColor',
    'thumbnailUrl',
    'status',
    'maxStudents',
  ];

  truongChoSua.forEach((truong) => {
    if (body[truong] !== undefined) {
      if (truong === 'code' || truong === 'joinCode') {
        khoaHoc[truong] = String(body[truong]).trim().toUpperCase();
      } else if (truong === 'maxStudents') {
        khoaHoc[truong] = Number(body[truong]);
      } else {
        khoaHoc[truong] = body[truong];
      }
    }
  });

  if (file) {
    khoaHoc.thumbnailUrl = `/uploads/courses/${file.filename}`;
  }

  await khoaHoc.save();
  return Course.findById(khoaHoc._id)
    .populate('category', 'name slug accentColor')
    .populate('teacher', 'fullName email department avatarColor');
};

const xoaKhoaHoc = async (courseId, user) => {
  const khoaHoc = await Course.findById(courseId);
  if (!khoaHoc) throw new LoiUngDung('Không tìm thấy khóa học', 404);

  kiemTraQuyenQuanLyLop(khoaHoc, user);

  await Promise.all([
    Material.deleteMany({ course: khoaHoc._id }),
    Assignment.deleteMany({ course: khoaHoc._id }),
    Submission.deleteMany({ course: khoaHoc._id }),
    Enrollment.deleteMany({ course: khoaHoc._id }),
    Announcement.deleteMany({ course: khoaHoc._id }),
    khoaHoc.deleteOne(),
  ]);
};

const layDanhSachSinhVienLop = async (courseId, user) => {
  const khoaHoc = await Course.findById(courseId);
  if (!khoaHoc) throw new LoiUngDung('Không tìm thấy khóa học', 404);

  kiemTraQuyenQuanLyLop(khoaHoc, user);

  const [dsGhiDanh, tongTaiLieu, dsBaiTap, dsBaiNop] = await Promise.all([
    Enrollment.find({ course: khoaHoc._id, status: 'active' })
      .populate('student', 'fullName email studentCode department avatarColor status')
      .sort({ enrolledAt: -1 })
      .lean(),
    Material.countDocuments({ course: khoaHoc._id }),
    Assignment.find({ course: khoaHoc._id }).select('_id maxScore').lean(),
    Submission.find({ course: khoaHoc._id }).lean(),
  ]);

  const mapDiemMax = new Map(dsBaiTap.map((bt) => [String(bt._id), bt.maxScore || 10]));

  return dsGhiDanh
    .filter((gd) => gd.student)
    .map((gd) => {
      const idSv = String(gd.student._id);
      const baiNopSv = dsBaiNop.filter((bn) => String(bn.student) === idSv);
      const baiDaCham = baiNopSv.filter((bn) => bn.status === 'graded' && bn.score !== null);

      let diemTrungBinh = null;
      if (baiDaCham.length > 0) {
        const tongQuyDoi = baiDaCham.reduce((tong, bn) => {
          const diemMax = mapDiemMax.get(String(bn.assignment)) || 10;
          return tong + (bn.score / diemMax) * 10;
        }, 0);
        diemTrungBinh = Number((tongQuyDoi / baiDaCham.length).toFixed(2));
      }

      return {
        enrollmentId: gd._id,
        student: gd.student,
        enrolledAt: gd.enrolledAt,
        lastAccessedAt: gd.lastAccessedAt,
        completedCount: gd.completedMaterials.length,
        totalMaterials: tongTaiLieu,
        progressPercent: gd.progressPercent,
        submittedCount: baiNopSv.length,
        totalAssignments: dsBaiTap.length,
        gradedCount: baiDaCham.length,
        averageScore: diemTrungBinh,
      };
    });
};

const tongHopBangDiem = async (courseId) => {
  const [dsGhiDanh, dsBaiTap, dsBaiNop] = await Promise.all([
    Enrollment.find({ course: courseId, status: 'active' })
      .populate('student', 'fullName email studentCode department')
      .sort({ enrolledAt: 1 })
      .lean(),
    Assignment.find({ course: courseId }).sort({ dueDate: 1 }).lean(),
    Submission.find({ course: courseId }).lean(),
  ]);

  const taoKhoa = (idSv, idBt) => `${idSv}:${idBt}`;
  const mapNop = new Map(
    dsBaiNop.map((bn) => [taoKhoa(String(bn.student), String(bn.assignment)), bn])
  );

  const rows = dsGhiDanh
    .filter((gd) => gd.student)
    .map((gd) => {
      const idSv = String(gd.student._id);
      let tongQuyDoi = 0;
      let soBaiCham = 0;

      const scores = dsBaiTap.map((bt) => {
        const bn = mapNop.get(taoKhoa(idSv, String(bt._id)));
        if (bn && bn.status === 'graded' && bn.score !== null) {
          tongQuyDoi += (bn.score / (bt.maxScore || 10)) * 10;
          soBaiCham += 1;
        }
        return {
          assignmentId: bt._id,
          submissionId: bn?._id || null,
          status: bn ? bn.status : 'missing',
          isLate: Boolean(bn?.isLate),
          score: bn?.score ?? null,
          maxScore: bt.maxScore,
          feedback: bn?.feedback || '',
          submittedAt: bn?.submittedAt || null,
        };
      });

      return {
        student: gd.student,
        progressPercent: gd.progressPercent,
        scores,
        averageScore: soBaiCham > 0 ? Number((tongQuyDoi / soBaiCham).toFixed(2)) : null,
      };
    });

  return { assignments: dsBaiTap, rows };
};

const layBangDiemLop = async (courseId, user) => {
  const khoaHoc = await Course.findById(courseId);
  if (!khoaHoc) throw new LoiUngDung('Không tìm thấy khóa học', 404);
  kiemTraQuyenQuanLyLop(khoaHoc, user);

  const bangDiem = await tongHopBangDiem(khoaHoc._id);
  return {
    course: { _id: khoaHoc._id, title: khoaHoc.title, code: khoaHoc.code },
    ...bangDiem,
  };
};

const xuatCsvBangDiem = async (courseId, user) => {
  const khoaHoc = await Course.findById(courseId);
  if (!khoaHoc) throw new LoiUngDung('Không tìm thấy khóa học', 404);
  kiemTraQuyenQuanLyLop(khoaHoc, user);

  const { assignments, rows } = await tongHopBangDiem(khoaHoc._id);
  const tieuDeCot = [
    'MSSV',
    'Họ và tên',
    'Email',
    'Tiến độ bài học (%)',
    ...assignments.map((bt) => `${bt.title} (/${bt.maxScore})`),
    'Điểm TB (hệ 10)',
  ];

  const duLieuDong = rows.map((dong) => [
    dong.student.studentCode || '',
    dong.student.fullName,
    dong.student.email,
    `${dong.progressPercent}%`,
    ...dong.scores.map((o) => {
      if (o.status === 'missing') return 'Chưa nộp';
      if (o.status === 'submitted') return o.isLate ? 'Chờ chấm (Trễ)' : 'Chờ chấm';
      return o.isLate ? `${o.score} (Trễ)` : o.score;
    }),
    dong.averageScore !== null ? dong.averageScore : '—',
  ]);

  return {
    buffer: taoBufferCsv(tieuDeCot, duLieuDong),
    fileName: `bang-diem-${khoaHoc.code.replace(/[^a-zA-Z0-9-_]/g, '_')}.csv`,
  };
};

module.exports = {
  kiemTraQuyenQuanLyLop,
  taoKhoaHoc,
  capNhatKhoaHoc,
  xoaKhoaHoc,
  layDanhSachSinhVienLop,
  layBangDiemLop,
  xuatCsvBangDiem,
};
