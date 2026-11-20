const Assignment = require('../../models/BaiTap');
const Submission = require('../../models/BaiNop');
const Enrollment = require('../../models/GhiDanh');
const { LoiUngDung } = require('../../middleware/errorMiddleware');
const { tinhTrangThaiHanNop } = require('../giangVien/baiTapChamDiemService');

const layBaiTapSapToi = async (studentId) => {
  const dsGhiDanh = await Enrollment.find({ student: studentId, status: 'active' })
    .select('course')
    .lean();
  const mangIdLop = dsGhiDanh.map((gd) => gd.course);

  const [dsBaiTap, dsBaiNop] = await Promise.all([
    Assignment.find({ course: { $in: mangIdLop } })
      .populate('course', 'title code bannerColor thumbnailUrl')
      .sort({ dueDate: 1 })
      .lean(),
    Submission.find({ student: studentId, course: { $in: mangIdLop } }).lean(),
  ]);

  const mapNop = new Map(dsBaiNop.map((bn) => [String(bn.assignment), bn]));
  return dsBaiTap.map((bt) => {
    const mySubmission = mapNop.get(String(bt._id)) || null;
    return {
      ...bt,
      mySubmission,
      deadlineState: tinhTrangThaiHanNop(bt, mySubmission),
    };
  });
};

const nopBaiTap = async (assignmentId, body, file, studentId) => {
  const baiTap = await Assignment.findById(assignmentId);
  if (!baiTap) throw new LoiUngDung('Không tìm thấy bài tập', 404);
  if (baiTap.status === 'closed') {
    throw new LoiUngDung('Bài tập này đã đóng, không nhận bài nộp mới', 400);
  }

  const ghiDanh = await Enrollment.findOne({
    student: studentId,
    course: baiTap.course,
    status: 'active',
  });
  if (!ghiDanh) {
    throw new LoiUngDung('Bạn chưa ghi danh vào lớp học chứa bài tập này', 403);
  }

  const textContent = (body.textContent || '').trim();
  const daNop = await Submission.findOne({ assignment: baiTap._id, student: studentId });

  if (!textContent && !file && !daNop?.fileUrl) {
    throw new LoiUngDung('Vui lòng nhập nội dung bài làm hoặc đính kèm tệp nộp bài', 400);
  }

  if (daNop && daNop.status === 'graded') {
    throw new LoiUngDung('Bài làm của bạn đã được giảng viên chấm điểm, không thể chỉnh sửa', 400);
  }

  const hienTai = new Date();
  const biTreHan = hienTai.getTime() > new Date(baiTap.dueDate).getTime();
  if (biTreHan && !baiTap.allowLateSubmission) {
    throw new LoiUngDung('Bài tập đã quá hạn và giảng viên không cho phép nộp trễ', 400);
  }

  const duLieuCapNhat = {
    course: baiTap.course,
    textContent,
    submittedAt: hienTai,
    isLate: biTreHan,
    status: 'submitted',
  };

  if (file) {
    duLieuCapNhat.fileUrl = `/uploads/submissions/${file.filename}`;
    duLieuCapNhat.fileName = file.originalname;
    duLieuCapNhat.fileSize = file.size;
  }

  let baiNop;
  if (daNop) {
    Object.assign(daNop, duLieuCapNhat);
    baiNop = await daNop.save();
  } else {
    baiNop = await Submission.create({
      assignment: baiTap._id,
      student: studentId,
      ...duLieuCapNhat,
    });
  }

  ghiDanh.lastAccessedAt = hienTai;
  await ghiDanh.save();

  return { baiNop, biTreHan, laCapNhat: Boolean(daNop) };
};

const layBangDiemCaNhan = async (studentId) => {
  const dsBaiNop = await Submission.find({ student: studentId })
    .populate('course', 'title code semester bannerColor')
    .populate('assignment', 'title dueDate maxScore')
    .populate('gradedBy', 'fullName')
    .sort({ submittedAt: -1 })
    .lean();

  const baiDaCham = dsBaiNop.filter((s) => s.status === 'graded' && s.score !== null && s.assignment);
  let diemTrungBinh = null;
  if (baiDaCham.length > 0) {
    const tong = baiDaCham.reduce(
      (cong, s) => cong + (s.score / (s.assignment.maxScore || 10)) * 10,
      0
    );
    diemTrungBinh = Number((tong / baiDaCham.length).toFixed(2));
  }

  return {
    summary: {
      totalSubmissions: dsBaiNop.length,
      gradedCount: baiDaCham.length,
      pendingCount: dsBaiNop.length - baiDaCham.length,
      lateCount: dsBaiNop.filter((s) => s.isLate).length,
      averageScore: diemTrungBinh,
    },
    submissions: dsBaiNop,
  };
};

module.exports = {
  layBaiTapSapToi,
  nopBaiTap,
  layBangDiemCaNhan,
};
