const asyncHandler = require('../../utils/asyncHandler');
const quanLyDatabaseService = require('../../services/admin/quanLyDatabaseService');

const layTongQuanDatabase = asyncHandler(async (_req, res) => {
  const data = await quanLyDatabaseService.layTongQuanDatabase();
  res.json({ success: true, data });
});

const layBanGhiCollection = asyncHandler(async (req, res) => {
  const data = await quanLyDatabaseService.layBanGhiCollection(req.params.ten, req.query);
  res.json({ success: true, data });
});

const xuatJsonCollection = asyncHandler(async (req, res) => {
  const { buffer, fileName } = await quanLyDatabaseService.xuatJsonCollection(req.params.ten);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.send(buffer);
});

module.exports = {
  layTongQuanDatabase,
  layBanGhiCollection,
  xuatJsonCollection,
};
