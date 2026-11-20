const asyncHandler = require('../../utils/asyncHandler');
const khoaHocGiangVienService = require('../../services/giangVien/khoaHocGiangVienService');

const taoKhoaHoc = asyncHandler(async (req, res) => {
  const data = await khoaHocGiangVienService.taoKhoaHoc(req.body, req.file, req.user);
  res.status(201).json({
    success: true,
    message: 'Đã tạo lớp học mới thành công',
    data,
  });
});

const capNhatKhoaHoc = asyncHandler(async (req, res) => {
  const data = await khoaHocGiangVienService.capNhatKhoaHoc(
    req.params.id,
    req.body,
    req.file,
    req.user
  );
  res.json({
    success: true,
    message: 'Đã cập nhật thông tin lớp học',
    data,
  });
});

const xoaKhoaHoc = asyncHandler(async (req, res) => {
  await khoaHocGiangVienService.xoaKhoaHoc(req.params.id, req.user);
  res.json({
    success: true,
    message: 'Đã xóa khóa học cùng toàn bộ tài liệu và bài tập liên quan',
  });
});

const layDanhSachSinhVien = asyncHandler(async (req, res) => {
  const data = await khoaHocGiangVienService.layDanhSachSinhVienLop(req.params.id, req.user);
  res.json({ success: true, data });
});

const layBangDiem = asyncHandler(async (req, res) => {
  const data = await khoaHocGiangVienService.layBangDiemLop(req.params.id, req.user);
  res.json({ success: true, data });
});

const xuatBangDiemCsv = asyncHandler(async (req, res) => {
  const { buffer, fileName } = await khoaHocGiangVienService.xuatCsvBangDiem(
    req.params.id,
    req.user
  );
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.send(buffer);
});

module.exports = {
  taoKhoaHoc,
  capNhatKhoaHoc,
  xoaKhoaHoc,
  layDanhSachSinhVien,
  layBangDiem,
  xuatBangDiemCsv,
};
