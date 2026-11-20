const mongoose = require('mongoose');
const { LoiUngDung } = require('../../middleware/errorMiddleware');

// 8 collection chinh cua he thong bang tieng Viet + truong dung de tim kiem nhanh
const COLLECTION_HE_THONG = [
  { ten: 'nguoidung', moTa: 'Tài khoản Admin, Giảng viên, Sinh viên (mật khẩu đã băm bcrypt)', truongTim: ['fullName', 'email', 'studentCode', 'role'] },
  { ten: 'danhmuc', moTa: 'Danh mục học phần toàn hệ thống', truongTim: ['name', 'slug'] },
  { ten: 'khoahoc', moTa: 'Lớp học / khóa học do giảng viên tạo', truongTim: ['title', 'code', 'joinCode', 'status'] },
  { ten: 'tailieu', moTa: 'Học liệu PDF, Video, Bài đọc theo chương', truongTim: ['title', 'moduleTitle', 'type'] },
  { ten: 'ghidanh', moTa: 'Ghi danh của sinh viên & tiến độ hoàn thành', truongTim: ['status'] },
  { ten: 'baitap', moTa: 'Bài tập, hạn nộp và thang điểm', truongTim: ['title', 'status'] },
  { ten: 'bainop', moTa: 'Bài nộp, điểm số và nhận xét của giảng viên', truongTim: ['textContent', 'feedback', 'status'] },
  { ten: 'thongbaolop', moTa: 'Bảng tin lớp học & bình luận', truongTim: ['title', 'content'] },
  { ten: 'Online_Classroom', moTa: 'Tài liệu thông tin đồ án & hướng dẫn CSDL', truongTim: ['tenDuAn', 'congNghe'] },
];

// Khong bao gio tra mat khau da bam ra ngoai, ke ca voi Admin
const TRUONG_AN = { nguoidung: { password: 0 }, users: { password: 0 } };

const TEN_TRANG_THAI = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

const layDb = () => {
  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    throw new LoiUngDung('Máy chủ chưa kết nối được tới MongoDB', 503);
  }
  return mongoose.connection.db;
};

const layDanhSachTenCollection = async (db) => {
  const ds = await db.listCollections({}, { nameOnly: true }).toArray();
  return ds.map((c) => c.name).filter((ten) => !ten.startsWith('system.')).sort();
};

const thongKeMotCollection = async (db, ten) => {
  const col = db.collection(ten);
  const [soBanGhi, chiMuc] = await Promise.all([
    col.countDocuments({}),
    col.indexes().catch(() => []),
  ]);

  let kichThuoc = 0;
  let luuTru = 0;
  let kichThuocChiMuc = 0;
  try {
    const [s] = await col.aggregate([{ $collStats: { storageStats: {} } }]).toArray();
    kichThuoc = s?.storageStats?.size || 0;
    luuTru = s?.storageStats?.storageSize || 0;
    kichThuocChiMuc = s?.storageStats?.totalIndexSize || 0;
  } catch {
    // Mot so ban MongoDB/quyen han khong ho tro $collStats -> bo qua dung luong
  }

  return {
    ten,
    soBanGhi,
    kichThuoc,
    luuTru,
    kichThuocChiMuc,
    chiMuc: chiMuc.map((i) => ({
      ten: i.name,
      truong: Object.entries(i.key)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', '),
      duyNhat: Boolean(i.unique),
    })),
  };
};

const layTongQuanDatabase = async () => {
  const db = layDb();
  const ketNoi = mongoose.connection;
  const tenCacCollection = await layDanhSachTenCollection(db);
  const tapTen = new Set(tenCacCollection);
  const tenHeThong = new Set(COLLECTION_HE_THONG.map((c) => c.ten));

  const [thongKeDb, heThong, khac] = await Promise.all([
    db.stats().catch(() => ({})),
    Promise.all(
      COLLECTION_HE_THONG.map(async (c) => {
        if (!tapTen.has(c.ten)) {
          return { ten: c.ten, moTa: c.moTa, tonTai: false, soBanGhi: 0, kichThuoc: 0, luuTru: 0, kichThuocChiMuc: 0, chiMuc: [] };
        }
        const tk = await thongKeMotCollection(db, c.ten);
        return { ...tk, moTa: c.moTa, tonTai: true };
      })
    ),
    Promise.all(
      tenCacCollection
        .filter((ten) => !tenHeThong.has(ten))
        .map(async (ten) => ({ ...(await thongKeMotCollection(db, ten)), tonTai: true }))
    ),
  ]);

  return {
    ketNoi: {
      trangThai: TEN_TRANG_THAI[ketNoi.readyState] || 'unknown',
      host: ketNoi.host,
      port: ketNoi.port,
      tenDatabase: ketNoi.name,
      uri: `mongodb://${ketNoi.host}:${ketNoi.port}/${ketNoi.name}`,
    },
    thongKe: {
      soCollection: tenCacCollection.length,
      soBanGhi: thongKeDb.objects ?? heThong.reduce((t, c) => t + c.soBanGhi, 0),
      dungLuongDuLieu: thongKeDb.dataSize || 0,
      dungLuongLuuTru: thongKeDb.storageSize || 0,
      soChiMuc: thongKeDb.indexes || 0,
      dungLuongChiMuc: thongKeDb.indexSize || 0,
    },
    collectionHeThong: heThong,
    collectionKhac: khac,
  };
};

const kiemTraTenCollection = async (db, ten) => {
  const ds = await layDanhSachTenCollection(db);
  if (!ds.includes(ten)) {
    throw new LoiUngDung(`Không tìm thấy collection "${ten}" trong database`, 404);
  }
};

const taoBoLocTimKiem = (ten, tuKhoa) => {
  if (!tuKhoa || !String(tuKhoa).trim()) return {};
  const q = String(tuKhoa).trim();

  if (q.length === 24 && mongoose.Types.ObjectId.isValid(q)) {
    return { _id: new mongoose.Types.ObjectId(q) };
  }

  const cauHinh = COLLECTION_HE_THONG.find((c) => c.ten === ten);
  const cacTruong = cauHinh?.truongTim || ['name', 'title'];
  const bieuThuc = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  return { $or: cacTruong.map((truong) => ({ [truong]: bieuThuc })) };
};

const layBanGhiCollection = async (ten, { page = 1, limit = 10, search = '' } = {}) => {
  const db = layDb();
  await kiemTraTenCollection(db, ten);

  const trang = Math.max(1, parseInt(page, 10) || 1);
  const gioiHan = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const boLoc = taoBoLocTimKiem(ten, search);
  const col = db.collection(ten);

  const [tong, banGhi] = await Promise.all([
    col.countDocuments(boLoc),
    col
      .find(boLoc, { projection: TRUONG_AN[ten] || {} })
      .sort({ _id: -1 })
      .skip((trang - 1) * gioiHan)
      .limit(gioiHan)
      .toArray(),
  ]);

  return {
    ten,
    tong,
    trang,
    gioiHan,
    soTrang: Math.max(1, Math.ceil(tong / gioiHan)),
    banGhi,
  };
};

const xuatJsonCollection = async (ten) => {
  const db = layDb();
  await kiemTraTenCollection(db, ten);

  const banGhi = await db
    .collection(ten)
    .find({}, { projection: TRUONG_AN[ten] || {} })
    .sort({ _id: 1 })
    .toArray();

  return {
    buffer: Buffer.from(JSON.stringify(banGhi, null, 2), 'utf8'),
    fileName: `${mongoose.connection.name}-${ten}.json`,
  };
};

module.exports = {
  layTongQuanDatabase,
  layBanGhiCollection,
  xuatJsonCollection,
};
