const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { LoiUngDung } = require('./errorMiddleware');

const THU_MUC_UPLOAD = path.join(__dirname, '..', '..', 'uploads');

const damBaoThuMuc = (duongDan) => {
  if (!fs.existsSync(duongDan)) {
    fs.mkdirSync(duongDan, { recursive: true });
  }
};

const lamSachTenTep = (tenGoc) => {
  const duoi = path.extname(tenGoc).toLowerCase();
  const ten = path
    .basename(tenGoc, duoi)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `${Date.now()}-${ten || 'file'}${duoi}`;
};

const taoBoUpload = ({ thuMucCon, duoiChoPhep, dungLuongToiDaMB = 15 }) => {
  const thuMucDich = path.join(THU_MUC_UPLOAD, thuMucCon);
  damBaoThuMuc(thuMucDich);

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      damBaoThuMuc(thuMucDich);
      cb(null, thuMucDich);
    },
    filename: (_req, file, cb) => {
      cb(null, lamSachTenTep(file.originalname));
    },
  });

  const fileFilter = (_req, file, cb) => {
    const duoi = path.extname(file.originalname).toLowerCase();
    if (!duoiChoPhep.includes(duoi)) {
      return cb(
        new LoiUngDung(
          `Định dạng tệp "${duoi}" không được hỗ trợ. Cho phép: ${duoiChoPhep.join(', ')}`,
          400
        )
      );
    }
    return cb(null, true);
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: dungLuongToiDaMB * 1024 * 1024 },
  });
};

const taiTepTaiLieu = taoBoUpload({
  thuMucCon: 'materials',
  duoiChoPhep: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt'],
  dungLuongToiDaMB: 15,
});

const taiTepDeBai = taoBoUpload({
  thuMucCon: 'assignments',
  duoiChoPhep: ['.pdf', '.doc', '.docx', '.zip', '.rar', '.txt', '.png', '.jpg', '.jpeg'],
  dungLuongToiDaMB: 15,
});

const taiTepBaiNop = taoBoUpload({
  thuMucCon: 'submissions',
  duoiChoPhep: [
    '.pdf', '.doc', '.docx', '.zip', '.rar', '.txt', '.png', '.jpg', '.jpeg', '.js', '.jsx', '.html', '.css',
  ],
  dungLuongToiDaMB: 15,
});

const taiTepAnhBia = taoBoUpload({
  thuMucCon: 'courses',
  duoiChoPhep: ['.png', '.jpg', '.jpeg', '.webp'],
  dungLuongToiDaMB: 5,
});

const taiTepAvatar = taoBoUpload({
  thuMucCon: 'avatars',
  duoiChoPhep: ['.png', '.jpg', '.jpeg', '.webp'],
  dungLuongToiDaMB: 5,
});

module.exports = { taiTepTaiLieu, taiTepDeBai, taiTepBaiNop, taiTepAnhBia, taiTepAvatar };
