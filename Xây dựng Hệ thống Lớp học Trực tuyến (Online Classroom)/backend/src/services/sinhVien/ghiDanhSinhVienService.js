const Enrollment = require('../../models/GhiDanh');
const Course = require('../../models/KhoaHoc');
const Material = require('../../models/TaiLieu');
const Assignment = require('../../models/BaiTap');
const Submission = require('../../models/BaiNop');
const { LoiUngDung } = require('../../middleware/errorMiddleware');

const ghiDanhKhoaHoc = async ({ courseId, joinCode }, studentId) => {
  let khoaHoc = null;

  if (courseId) {
    khoaHoc = await Course.findById(courseId);
  } else if (joinCode && joinCode.trim()) {
    khoaHoc = await Course.findOne({ joinCode: joinCode.trim().toUpperCase() });
  } else {
    throw new LoiUngDung('Vui lòng chọn khóa học hoặc nhập mã tham gia lớp', 400);
  }

  if (!khoaHoc) throw new LoiUngDung('Không tìm thấy khóa học tương ứng', 404);
  if (khoaHoc.status !== 'published') {
    throw new LoiUngDung('Khóa học này hiện không mở đăng ký ghi danh', 400);
  }

  const daTonTai = await Enrollment.findOne({ student: studentId, course: khoaHoc._id });
  if (daTonTai && daTonTai.status === 'active') {
    throw new LoiUngDung('Bạn đã ghi danh vào khóa học này trước đó rồi', 409);
  }

  const siSoHienTai = await Enrollment.countDocuments({ course: khoaHoc._id, status: 'active' });
  if (siSoHienTai >= khoaHoc.maxStudents) {
    throw new LoiUngDung('Lớp học đã đủ sĩ số tối đa', 400);
  }

  let ghiDanh;
  if (daTonTai) {
    daTonTai.status = 'active';
    daTonTai.enrolledAt = new Date();
    daTonTai.lastAccessedAt = new Date();
    ghiDanh = await daTonTai.save();
  } else {
    ghiDanh = await Enrollment.create({ student: studentId, course: khoaHoc._id });
  }

  return { khoaHoc, ghiDanh };
};

const layKhoaHocDaGhiDanh = async (studentId) => {
  const dsGhiDanh = await Enrollment.find({ student: studentId, status: 'active' })
    .populate({
      path: 'course',
      populate: [
        { path: 'category', select: 'name slug accentColor' },
        { path: 'teacher', select: 'fullName email department avatarColor avatarUrl' },
      ],
    })
    .sort({ lastAccessedAt: -1 })
    .lean();

  const hopLe = dsGhiDanh.filter((gd) => gd.course);
  const mangIdLop = hopLe.map((gd) => gd.course._id);

  const [demTaiLieu, dsBaiTap, dsBaiNop] = await Promise.all([
    Material.aggregate([
      { $match: { course: { $in: mangIdLop } } },
      { $group: { _id: '$course', count: { $sum: 1 } } },
    ]),
    Assignment.find({ course: { $in: mangIdLop } }).select('_id course maxScore dueDate').lean(),
    Submission.find({ student: studentId, course: { $in: mangIdLop } }).lean(),
  ]);

  const mapTaiLieu = new Map(demTaiLieu.map((i) => [String(i._id), i.count]));
  const mapBaiNop = new Map(dsBaiNop.map((bn) => [String(bn.assignment), bn]));

  return hopLe.map((gd) => {
    const idLop = String(gd.course._id);
    const baiTapLop = dsBaiTap.filter((bt) => String(bt.course) === idLop);
    const chuaNop = baiTapLop.filter((bt) => !mapBaiNop.has(String(bt._id))).length;

    const baiDaCham = baiTapLop
      .map((bt) => ({ bt, bn: mapBaiNop.get(String(bt._id)) }))
      .filter(({ bn }) => bn && bn.status === 'graded' && bn.score !== null);

    let diemTb = null;
    if (baiDaCham.length > 0) {
      const tong = baiDaCham.reduce((t, { bt, bn }) => t + (bn.score / (bt.maxScore || 10)) * 10, 0);
      diemTb = Number((tong / baiDaCham.length).toFixed(2));
    }

    return {
      ...gd,
      totalMaterials: mapTaiLieu.get(idLop) || 0,
      completedCount: gd.completedMaterials.length,
      totalAssignments: baiTapLop.length,
      pendingAssignmentsCount: chuaNop,
      averageScore: diemTb,
    };
  });
};

const roiKhoaHoc = async (courseId, studentId) => {
  const ghiDanh = await Enrollment.findOne({ student: studentId, course: courseId, status: 'active' });
  if (!ghiDanh) throw new LoiUngDung('Bạn chưa ghi danh vào khóa học này', 404);

  ghiDanh.status = 'dropped';
  await ghiDanh.save();
};

const danhDauHoanThanhTaiLieu = async (materialId, studentId) => {
  const taiLieu = await Material.findById(materialId);
  if (!taiLieu) throw new LoiUngDung('Không tìm thấy tài liệu', 404);

  const ghiDanh = await Enrollment.findOne({
    student: studentId,
    course: taiLieu.course,
    status: 'active',
  });
  if (!ghiDanh) {
    throw new LoiUngDung('Bạn cần ghi danh vào khóa học để đánh dấu tiến độ', 403);
  }

  const daHoanThanh = ghiDanh.completedMaterials.some((id) => String(id) === String(taiLieu._id));
  if (daHoanThanh) {
    ghiDanh.completedMaterials = ghiDanh.completedMaterials.filter(
      (id) => String(id) !== String(taiLieu._id)
    );
  } else {
    ghiDanh.completedMaterials.push(taiLieu._id);
  }

  const tongTaiLieu = await Material.countDocuments({ course: taiLieu.course });
  ghiDanh.progressPercent =
    tongTaiLieu > 0 ? Math.round((ghiDanh.completedMaterials.length / tongTaiLieu) * 100) : 0;
  ghiDanh.lastAccessedAt = new Date();
  await ghiDanh.save();

  return {
    materialId: taiLieu._id,
    completed: !daHoanThanh,
    completedCount: ghiDanh.completedMaterials.length,
    totalMaterials: tongTaiLieu,
    progressPercent: ghiDanh.progressPercent,
  };
};

module.exports = {
  ghiDanhKhoaHoc,
  layKhoaHocDaGhiDanh,
  roiKhoaHoc,
  danhDauHoanThanhTaiLieu,
};
