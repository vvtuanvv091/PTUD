const Announcement = require('../../models/ThongBaoLop');
const Course = require('../../models/KhoaHoc');
const Enrollment = require('../../models/GhiDanh');
const { LoiUngDung } = require('../../middleware/errorMiddleware');
const { kiemTraQuyenQuanLyLop } = require('../giangVien/khoaHocGiangVienService');

const kiemTraThanhVienLop = async (courseId, user) => {
  const khoaHoc = await Course.findById(courseId);
  if (!khoaHoc) throw new LoiUngDung('Không tìm thấy khóa học', 404);

  if (
    user.role === 'admin' ||
    (user.role === 'teacher' && String(khoaHoc.teacher) === String(user._id))
  ) {
    return khoaHoc;
  }

  const ghiDanh = await Enrollment.findOne({
    student: user._id,
    course: khoaHoc._id,
    status: 'active',
  });
  if (!ghiDanh) {
    throw new LoiUngDung('Bạn cần ghi danh vào khóa học để xem hoặc thảo luận trên bảng tin', 403);
  }
  return khoaHoc;
};

const layThongBaoLop = async (courseId, user) => {
  await kiemTraThanhVienLop(courseId, user);
  return Announcement.find({ course: courseId })
    .populate('author', 'fullName role avatarColor avatarUrl')
    .populate('comments.author', 'fullName role avatarColor avatarUrl')
    .sort({ isPinned: -1, createdAt: -1 })
    .lean();
};

const taoThongBaoLop = async (courseId, { title, content, isPinned }, user) => {
  const khoaHoc = await Course.findById(courseId);
  if (!khoaHoc) throw new LoiUngDung('Không tìm thấy khóa học', 404);
  kiemTraQuyenQuanLyLop(khoaHoc, user);

  if (!title || !content) {
    throw new LoiUngDung('Vui lòng nhập tiêu đề và nội dung thông báo', 400);
  }

  const tb = await Announcement.create({
    course: khoaHoc._id,
    author: user._id,
    title: title.trim(),
    content: content.trim(),
    isPinned: Boolean(isPinned),
  });

  return Announcement.findById(tb._id).populate('author', 'fullName role avatarColor avatarUrl');
};

const ghimThongBao = async (id, user) => {
  const tb = await Announcement.findById(id);
  if (!tb) throw new LoiUngDung('Không tìm thấy thông báo', 404);

  const khoaHoc = await Course.findById(tb.course);
  if (khoaHoc) kiemTraQuyenQuanLyLop(khoaHoc, user);

  tb.isPinned = !tb.isPinned;
  await tb.save();
  return tb;
};

const xoaThongBao = async (id, user) => {
  const tb = await Announcement.findById(id);
  if (!tb) throw new LoiUngDung('Không tìm thấy thông báo', 404);

  const khoaHoc = await Course.findById(tb.course);
  if (khoaHoc) kiemTraQuyenQuanLyLop(khoaHoc, user);

  await tb.deleteOne();
};

const themBinhLuan = async (id, content, user) => {
  if (!content || !content.trim()) {
    throw new LoiUngDung('Vui lòng nhập nội dung bình luận', 400);
  }
  const tb = await Announcement.findById(id);
  if (!tb) throw new LoiUngDung('Không tìm thấy thông báo', 404);

  await kiemTraThanhVienLop(tb.course, user);

  tb.comments.push({ author: user._id, content: content.trim() });
  await tb.save();

  return Announcement.findById(tb._id)
    .populate('author', 'fullName role avatarColor')
    .populate('comments.author', 'fullName role avatarColor');
};

const xoaBinhLuan = async (announcementId, commentId, user) => {
  const tb = await Announcement.findById(announcementId);
  if (!tb) throw new LoiUngDung('Không tìm thấy thông báo', 404);

  const binhLuan = tb.comments.id(commentId);
  if (!binhLuan) throw new LoiUngDung('Không tìm thấy bình luận', 404);

  const khoaHoc = await Course.findById(tb.course);
  const laChuBinhLuan = String(binhLuan.author) === String(user._id);
  const laQuanLy =
    user.role === 'admin' ||
    (khoaHoc && user.role === 'teacher' && String(khoaHoc.teacher) === String(user._id));

  if (!laChuBinhLuan && !laQuanLy) {
    throw new LoiUngDung('Bạn không có quyền xóa bình luận này', 403);
  }

  binhLuan.deleteOne();
  await tb.save();
};

module.exports = {
  layThongBaoLop,
  taoThongBaoLop,
  ghimThongBao,
  xoaThongBao,
  themBinhLuan,
  xoaBinhLuan,
};
