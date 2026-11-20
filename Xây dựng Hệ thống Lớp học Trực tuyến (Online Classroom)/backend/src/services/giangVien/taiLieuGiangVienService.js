const Material = require('../../models/TaiLieu');
const Course = require('../../models/KhoaHoc');
const Enrollment = require('../../models/GhiDanh');
const { LoiUngDung } = require('../../middleware/errorMiddleware');
const { kiemTraQuyenQuanLyLop } = require('./khoaHocGiangVienService');

const tinhLaiTienDoLop = async (courseId) => {
  const dsTaiLieu = await Material.find({ course: courseId }).select('_id').lean();
  const tapHopIdHopLe = new Set(dsTaiLieu.map((m) => String(m._id)));
  const tong = dsTaiLieu.length;

  const dsGhiDanh = await Enrollment.find({ course: courseId, status: 'active' });
  await Promise.all(
    dsGhiDanh.map(async (gd) => {
      gd.completedMaterials = gd.completedMaterials.filter((id) => tapHopIdHopLe.has(String(id)));
      gd.progressPercent = tong > 0 ? Math.round((gd.completedMaterials.length / tong) * 100) : 0;
      await gd.save();
    })
  );
};

const taoTaiLieu = async (courseId, body, file, user) => {
  const khoaHoc = await Course.findById(courseId);
  if (!khoaHoc) throw new LoiUngDung('Không tìm thấy khóa học', 404);
  kiemTraQuyenQuanLyLop(khoaHoc, user);

  const { moduleTitle, title, type, description, videoUrl, content, durationMinutes, order } = body;
  if (!title || !['pdf', 'video', 'reading'].includes(type)) {
    throw new LoiUngDung('Vui lòng nhập tiêu đề và chọn loại tài liệu hợp lệ (pdf, video, reading)', 400);
  }
  if (type === 'pdf' && !file) {
    throw new LoiUngDung('Vui lòng chọn tệp PDF / tài liệu để tải lên', 400);
  }
  if (type === 'video' && (!videoUrl || !videoUrl.trim())) {
    throw new LoiUngDung('Vui lòng dán đường dẫn video bài giảng', 400);
  }
  if (type === 'reading' && (!content || !content.trim())) {
    throw new LoiUngDung('Vui lòng nhập nội dung bài đọc', 400);
  }

  const soLuongHienTai = await Material.countDocuments({ course: khoaHoc._id });

  const taiLieu = await Material.create({
    course: khoaHoc._id,
    createdBy: user._id,
    moduleTitle: (moduleTitle || 'Chương 1: Tổng quan').trim(),
    title: title.trim(),
    type,
    description: (description || '').trim(),
    fileUrl: file ? `/uploads/materials/${file.filename}` : '',
    fileName: file ? file.originalname : '',
    fileSize: file ? file.size : 0,
    videoUrl: (videoUrl || '').trim(),
    content: (content || '').trim(),
    durationMinutes: Number(durationMinutes) || 15,
    order: Number(order) || soLuongHienTai + 1,
  });

  await tinhLaiTienDoLop(khoaHoc._id);
  return taiLieu;
};

const capNhatTaiLieu = async (materialId, body, file, user) => {
  const taiLieu = await Material.findById(materialId);
  if (!taiLieu) throw new LoiUngDung('Không tìm thấy tài liệu', 404);

  const khoaHoc = await Course.findById(taiLieu.course);
  if (!khoaHoc) throw new LoiUngDung('Không tìm thấy khóa học', 404);
  kiemTraQuyenQuanLyLop(khoaHoc, user);

  const { moduleTitle, title, description, videoUrl, content, durationMinutes, order } = body;
  if (moduleTitle !== undefined) taiLieu.moduleTitle = moduleTitle.trim();
  if (title !== undefined && title.trim()) taiLieu.title = title.trim();
  if (description !== undefined) taiLieu.description = description.trim();
  if (videoUrl !== undefined) taiLieu.videoUrl = videoUrl.trim();
  if (content !== undefined) taiLieu.content = content.trim();
  if (durationMinutes !== undefined) taiLieu.durationMinutes = Number(durationMinutes) || 15;
  if (order !== undefined) taiLieu.order = Number(order) || taiLieu.order;

  if (file) {
    taiLieu.fileUrl = `/uploads/materials/${file.filename}`;
    taiLieu.fileName = file.originalname;
    taiLieu.fileSize = file.size;
  }

  await taiLieu.save();
  return taiLieu;
};

const xoaTaiLieu = async (materialId, user) => {
  const taiLieu = await Material.findById(materialId);
  if (!taiLieu) throw new LoiUngDung('Không tìm thấy tài liệu', 404);

  const khoaHoc = await Course.findById(taiLieu.course);
  if (khoaHoc) kiemTraQuyenQuanLyLop(khoaHoc, user);

  const courseId = taiLieu.course;
  await taiLieu.deleteOne();
  await tinhLaiTienDoLop(courseId);
};

module.exports = {
  tinhLaiTienDoLop,
  taoTaiLieu,
  capNhatTaiLieu,
  xoaTaiLieu,
};
