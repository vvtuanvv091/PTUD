const Assignment = require('../../models/BaiTap');
const Submission = require('../../models/BaiNop');
const Course = require('../../models/KhoaHoc');
const Enrollment = require('../../models/GhiDanh');
const { LoiUngDung } = require('../../middleware/errorMiddleware');
const { kiemTraQuyenQuanLyLop } = require('./khoaHocGiangVienService');

const tinhTrangThaiHanNop = (baiTap, baiNop) => {
  if (baiNop?.status === 'graded') return 'graded';
  if (baiNop) return 'submitted';
  const conLaiMs = new Date(baiTap.dueDate).getTime() - Date.now();
  if (conLaiMs < 0) return 'overdue';
  if (conLaiMs <= 48 * 60 * 60 * 1000) return 'due_soon';
  return 'upcoming';
};

const taoBaiTap = async (courseId, body, file, user) => {
  const khoaHoc = await Course.findById(courseId);
  if (!khoaHoc) throw new LoiUngDung('Không tìm thấy khóa học', 404);
  kiemTraQuyenQuanLyLop(khoaHoc, user);

  const { title, description, dueDate, maxScore, allowLateSubmission } = body;
  if (!title || !description || !dueDate) {
    throw new LoiUngDung('Vui lòng nhập tiêu đề, yêu cầu và hạn nộp bài tập', 400);
  }

  return Assignment.create({
    course: khoaHoc._id,
    createdBy: user._id,
    title: title.trim(),
    description: description.trim(),
    dueDate: new Date(dueDate),
    maxScore: Number(maxScore) || 10,
    allowLateSubmission: allowLateSubmission === 'false' ? false : Boolean(allowLateSubmission ?? true),
    attachmentUrl: file ? `/uploads/assignments/${file.filename}` : '',
    attachmentName: file ? file.originalname : '',
  });
};

const capNhatBaiTap = async (assignmentId, body, file, user) => {
  const baiTap = await Assignment.findById(assignmentId);
  if (!baiTap) throw new LoiUngDung('Không tìm thấy bài tập', 404);

  const khoaHoc = await Course.findById(baiTap.course);
  if (!khoaHoc) throw new LoiUngDung('Không tìm thấy khóa học', 404);
  kiemTraQuyenQuanLyLop(khoaHoc, user);

  const { title, description, dueDate, maxScore, allowLateSubmission, status } = body;
  if (title !== undefined && title.trim()) baiTap.title = title.trim();
  if (description !== undefined && description.trim()) baiTap.description = description.trim();
  if (dueDate !== undefined) baiTap.dueDate = new Date(dueDate);
  if (maxScore !== undefined) baiTap.maxScore = Number(maxScore) || baiTap.maxScore;
  if (allowLateSubmission !== undefined) {
    baiTap.allowLateSubmission = allowLateSubmission === 'false' ? false : Boolean(allowLateSubmission);
  }
  if (status && ['open', 'closed'].includes(status)) baiTap.status = status;

  if (file) {
    baiTap.attachmentUrl = `/uploads/assignments/${file.filename}`;
    baiTap.attachmentName = file.originalname;
  }

  await baiTap.save();
  return baiTap;
};

const xoaBaiTap = async (assignmentId, user) => {
  const baiTap = await Assignment.findById(assignmentId);
  if (!baiTap) throw new LoiUngDung('Không tìm thấy bài tập', 404);

  const khoaHoc = await Course.findById(baiTap.course);
  if (khoaHoc) kiemTraQuyenQuanLyLop(khoaHoc, user);

  await Promise.all([
    Submission.deleteMany({ assignment: baiTap._id }),
    baiTap.deleteOne(),
  ]);
};

const layBaiNopTheoBaiTap = async (assignmentId, { status, late }, user) => {
  const baiTap = await Assignment.findById(assignmentId).populate('course', 'title code teacher');
  if (!baiTap) throw new LoiUngDung('Không tìm thấy bài tập', 404);

  kiemTraQuyenQuanLyLop(baiTap.course, user);

  const filter = { assignment: baiTap._id };
  if (status && ['submitted', 'graded'].includes(status)) filter.status = status;
  if (late === 'true') filter.isLate = true;

  const [submissions, tatCaBaiNop, dsGhiDanh] = await Promise.all([
    Submission.find(filter)
      .populate('student', 'fullName email studentCode department avatarColor')
      .populate('gradedBy', 'fullName')
      .sort({ submittedAt: -1 })
      .lean(),
    Submission.find({ assignment: baiTap._id }).select('student status isLate').lean(),
    Enrollment.find({ course: baiTap.course._id, status: 'active' })
      .populate('student', 'fullName email studentCode department avatarColor')
      .lean(),
  ]);

  const tapDaNop = new Set(tatCaBaiNop.map((s) => String(s.student)));
  const missingStudents = dsGhiDanh
    .filter((e) => e.student && !tapDaNop.has(String(e.student._id)))
    .map((e) => e.student);

  return {
    assignment: baiTap,
    submissions,
    missingStudents,
    summary: {
      enrolledCount: dsGhiDanh.length,
      submittedCount: tatCaBaiNop.length,
      gradedCount: tatCaBaiNop.filter((s) => s.status === 'graded').length,
      lateCount: tatCaBaiNop.filter((s) => s.isLate).length,
      missingCount: missingStudents.length,
    },
  };
};

const chamDiemBaiNop = async (submissionId, { score, feedback }, user) => {
  const baiNop = await Submission.findById(submissionId)
    .populate('assignment', 'title maxScore')
    .populate('course', 'title code teacher');

  if (!baiNop) throw new LoiUngDung('Không tìm thấy bài nộp', 404);
  kiemTraQuyenQuanLyLop(baiNop.course, user);

  const diemSo = Number(score);
  const diemToiDa = baiNop.assignment?.maxScore || 10;

  if (Number.isNaN(diemSo) || diemSo < 0 || diemSo > diemToiDa) {
    throw new LoiUngDung(`Điểm số phải nằm trong khoảng từ 0 đến ${diemToiDa}`, 400);
  }

  baiNop.score = Number(diemSo.toFixed(2));
  baiNop.feedback = (feedback || '').trim();
  baiNop.status = 'graded';
  baiNop.gradedBy = user._id;
  baiNop.gradedAt = new Date();
  await baiNop.save();

  return Submission.findById(baiNop._id)
    .populate('student', 'fullName email studentCode avatarColor')
    .populate('gradedBy', 'fullName');
};

module.exports = {
  tinhTrangThaiHanNop,
  taoBaiTap,
  capNhatBaiTap,
  xoaBaiTap,
  layBaiNopTheoBaiTap,
  chamDiemBaiNop,
};
