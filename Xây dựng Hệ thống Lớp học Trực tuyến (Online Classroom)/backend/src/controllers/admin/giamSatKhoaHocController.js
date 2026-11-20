const asyncHandler = require('../../utils/asyncHandler');
const giamSatKhoaHocService = require('../../services/admin/giamSatKhoaHocService');

const layTatCaKhoaHoc = asyncHandler(async (req, res) => {
  const data = await giamSatKhoaHocService.layTatCaKhoaHocQuanTri(req.query);
  res.json({ success: true, data });
});

const doiTrangThaiKhoaHoc = asyncHandler(async (req, res) => {
  const data = await giamSatKhoaHocService.doiTrangThaiKhoaHoc(req.params.id, req.body.status);
  res.json({
    success: true,
    message: 'Đã cập nhật trạng thái khóa học',
    data,
  });
});

module.exports = {
  layTatCaKhoaHoc,
  doiTrangThaiKhoaHoc,
};
