import { useEffect, useState } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import { layChuCaiDau, layNhanVaiTro } from '../utils/dinhDang';
import { taoDuongDanTep } from '../services/goiApi';

export function DemSoDong({ giaTriMucTieu = 0, thoiGian = 1000 }) {
  const [soHienThi, datSoHienThi] = useState(0);

  useEffect(() => {
    const mucTieu = Number(giaTriMucTieu) || 0;
    if (mucTieu === 0) {
      datSoHienThi(0);
      return undefined;
    }

    let batDau = null;
    let khungHinh = null;

    const buocDem = (thoiDiem) => {
      if (!batDau) batDau = thoiDiem;
      const tienDo = Math.min((thoiDiem - batDau) / thoiGian, 1);
      const tyLe = 1 - (1 - tienDo) * (1 - tienDo);
      const hienTai = Math.round(tyLe * mucTieu);
      datSoHienThi(hienTai);

      if (tienDo < 1) {
        khungHinh = requestAnimationFrame(buocDem);
      } else {
        datSoHienThi(mucTieu);
      }
    };

    khungHinh = requestAnimationFrame(buocDem);
    return () => {
      if (khungHinh) cancelAnimationFrame(khungHinh);
    };
  }, [giaTriMucTieu, thoiGian]);

  return <>{String(soHienThi).padStart(2, '0')}</>;
}

export function AnhDaiDien({ ten, mauNen = '#DB303A', kichThuoc = 36, anh = '' }) {
  const [loiAnh, setLoiAnh] = useState(false);
  const src = anh ? taoDuongDanTep(anh) : '';

  if (src && !loiAnh) {
    return (
      <img
        src={src}
        alt={ten || 'Ảnh đại diện'}
        className="anh-dai-dien-hinh rounded-circle object-fit-cover shadow-sm flex-shrink-0"
        style={{
          width: kichThuoc,
          height: kichThuoc,
          border: '1.5px solid rgba(219, 48, 58, 0.25)',
        }}
        onError={() => setLoiAnh(true)}
      />
    );
  }

  return (
    <span
      className="anh-dai-dien flex-shrink-0"
      style={{
        width: kichThuoc,
        height: kichThuoc,
        backgroundColor: mauNen || '#DB303A',
        fontSize: Math.max(11, Math.round(kichThuoc * 0.38)),
      }}
    >
      {layChuCaiDau(ten)}
    </span>
  );
}

export function NhanVaiTro({ vaiTro }) {
  const lop =
    vaiTro === 'admin'
      ? 'nhan-chu-dao'
      : vaiTro === 'teacher'
      ? 'nhan-thong-tin'
      : 'nhan-thanh-cong';
  return <span className={`nhan-trang-thai ${lop}`}>{layNhanVaiTro(vaiTro)}</span>;
}

export function NhanHanNop({ trangThai }) {
  const cauHinh = {
    overdue: { nhan: 'Quá hạn', lop: 'nhan-nguy-hiem' },
    due_soon: { nhan: 'Sắp hết hạn', lop: 'nhan-canh-bao' },
    upcoming: { nhan: 'Đang mở', lop: 'nhan-thong-tin' },
    submitted: { nhan: 'Đã nộp — Chờ chấm', lop: 'nhan-canh-bao' },
    graded: { nhan: 'Đã chấm điểm', lop: 'nhan-thanh-cong' },
  }[trangThai] || { nhan: 'Đang mở', lop: 'nhan-trung-tinh' };

  return <span className={`nhan-trang-thai ${cauHinh.lop}`}>{cauHinh.nhan}</span>;
}

export function HopThoai({ hienThi, tieuDe, khiDong, kichCo = '', children }) {
  useEffect(() => {
    if (!hienThi) return undefined;
    const xuLyEsc = (e) => {
      if (e.key === 'Escape') khiDong?.();
    };
    document.addEventListener('keydown', xuLyEsc);
    return () => document.removeEventListener('keydown', xuLyEsc);
  }, [hienThi, khiDong]);

  if (!hienThi) return null;

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.56)', zIndex: 1080 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) khiDong?.();
      }}
    >
      <div className={`modal-dialog modal-dialog-centered modal-dialog-scrollable ${kichCo}`}>
        <div
          className="modal-content border-0 shadow-lg"
          style={{
            backgroundColor: 'var(--mau-be-mat)',
            color: 'var(--mau-chu-chinh)',
            borderRadius: 16,
          }}
        >
          <div className="modal-header border-bottom px-4 py-3">
            <h5 className="modal-title fw-bold h6 mb-0">{tieuDe}</h5>
            <button
              type="button"
              className="btn btn-link p-1 text-secondary"
              onClick={khiDong}
              aria-label="Đóng hộp thoại"
            >
              <X size={18} />
            </button>
          </div>
          <div className="modal-body px-4 py-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function KhungChoTai({ soDong = 3 }) {
  return (
    <div className="d-flex flex-column gap-3">
      {Array.from({ length: soDong }).map((_, i) => (
        <div key={i} className="the-bang-dieu-khien p-4">
          <div className="khung-cho-xuong mb-2" style={{ height: 18, width: '36%' }} />
          <div className="khung-cho-xuong mb-2" style={{ height: 13, width: '82%' }} />
          <div className="khung-cho-xuong" style={{ height: 13, width: '58%' }} />
        </div>
      ))}
    </div>
  );
}

export function TrangThaiTrong({ bieuTuong: BieuTuong, tieuDe, moTa, hanhDong }) {
  return (
    <div className="text-center py-5 px-3">
      {BieuTuong && (
        <div
          className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
          style={{
            width: 52,
            height: 52,
            backgroundColor: 'transparent',
            border: '1px solid var(--mau-vien)',
            color: 'var(--mau-chu-phu)',
          }}
        >
          <BieuTuong size={22} />
        </div>
      )}
      <h6 className="fw-bold mb-1">{tieuDe}</h6>
      {moTa && (
        <p className="small text-secondary mx-auto mb-3" style={{ maxWidth: 420 }}>
          {moTa}
        </p>
      )}
      {hanhDong}
    </div>
  );
}

export function ONhapMatKhau({ className = '', ...props }) {
  const [hienMatKhau, datHienMatKhau] = useState(false);

  return (
    <div className="position-relative">
      <input
        {...props}
        type={hienMatKhau ? 'text' : 'password'}
        className={`form-control pe-5 ${className}`.trim()}
      />
      <button
        type="button"
        className="nut-hien-mat-khau"
        onClick={() => datHienMatKhau((truoc) => !truoc)}
        aria-label={hienMatKhau ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        title={hienMatKhau ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
      >
        {hienMatKhau ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
}

