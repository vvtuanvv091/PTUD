export const dinhDangNgay = (ngayIso) => {
  if (!ngayIso) return '—';
  const ngay = new Date(ngayIso);
  if (Number.isNaN(ngay.getTime())) return '—';
  return ngay.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const dinhDangNgayGio = (ngayIso) => {
  if (!ngayIso) return '—';
  const ngay = new Date(ngayIso);
  if (Number.isNaN(ngay.getTime())) return '—';
  return ngay.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const dinhDangHanNopTuongDoi = (hanNop) => {
  if (!hanNop) return '';
  const chenhLech = new Date(hanNop).getTime() - Date.now();
  const soGio = Math.round(Math.abs(chenhLech) / (1000 * 60 * 60));

  if (chenhLech < 0) {
    return soGio < 24 ? `Quá hạn ${soGio} giờ` : `Quá hạn ${Math.round(soGio / 24)} ngày`;
  }
  return soGio < 24 ? `Còn ${Math.max(1, soGio)} giờ` : `Còn ${Math.round(soGio / 24)} ngày`;
};

export const chuyenGiaTriNgayGioInput = (ngayIso) => {
  if (!ngayIso) return '';
  const d = new Date(ngayIso);
  if (Number.isNaN(d.getTime())) return '';
  const buKhong = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${buKhong(d.getMonth() + 1)}-${buKhong(d.getDate())}T${buKhong(
    d.getHours()
  )}:${buKhong(d.getMinutes())}`;
};

export const dinhDangDungLuong = (soByte) => {
  if (!soByte) return '';
  if (soByte < 1024) return `${soByte} B`;
  if (soByte < 1024 * 1024) return `${(soByte / 1024).toFixed(1)} KB`;
  return `${(soByte / (1024 * 1024)).toFixed(2)} MB`;
};

export const layChuCaiDau = (hoTen = '') => {
  const cacTu = hoTen.trim().split(/\s+/).filter(Boolean);
  if (cacTu.length === 0) return 'U';
  if (cacTu.length === 1) return cacTu[0].slice(0, 2).toUpperCase();
  return `${cacTu[0][0]}${cacTu[cacTu.length - 1][0]}`.toUpperCase();
};

export const layNhanVaiTro = (vaiTro) => {
  if (vaiTro === 'admin') return 'Quản trị viên';
  if (vaiTro === 'teacher') return 'Giảng viên';
  return 'Sinh viên';
};

export const layTrangThaiKhoaHoc = (trangThai) => {
  if (trangThai === 'published') return { nhan: 'Đang mở', lopCss: 'nhan-thanh-cong' };
  if (trangThai === 'draft') return { nhan: 'Bản nháp', lopCss: 'nhan-canh-bao' };
  return { nhan: 'Đã lưu trữ', lopCss: 'nhan-trung-tinh' };
};

export const taoLinkVideoNhung = (duongDan = '') => {
  if (!duongDan) return null;
  const khopYt = duongDan.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/
  );
  if (khopYt) return `https://www.youtube.com/embed/${khopYt[1]}`;
  const khopVimeo = duongDan.match(/vimeo\.com\/(\d+)/);
  if (khopVimeo) return `https://player.vimeo.com/video/${khopVimeo[1]}`;
  return null;
};

