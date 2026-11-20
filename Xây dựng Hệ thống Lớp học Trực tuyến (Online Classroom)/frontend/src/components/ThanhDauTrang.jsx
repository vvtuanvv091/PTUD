import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Award,
  BookOpen,
  ChevronDown,
  ExternalLink,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sun,
  UserCircle2,
  X,
} from 'lucide-react';
import { suDungXacThuc } from '../context/NguCanhXacThuc';
import { suDungGiaoDien } from '../context/NguCanhGiaoDien';
import { AnhDaiDien } from './ThanhPhanChung';
import { layNhanVaiTro } from '../utils/dinhDang';
import { DUONG_DAN_TAI_LEN } from '../services/goiApi';

// Moi muc menu la 1 trang rieng
const MENU_CONG_KHAI = [
  { to: '/', nhan: 'Trang chủ', end: true },
  { to: '/khong-gian', nhan: 'Không gian' },
  { to: '/explore', nhan: 'Khóa học' },
  { to: '/lo-trinh', nhan: 'Lộ trình' },
];

// Chi trang chu moi co hero banner noi dau trang -> header noi trong suot tren hero
const TRANG_CO_BANNER = ['/'];

export function ThanhDauTrang({
  cheDoLamViec = false,
  dangMoThanhBen = false,
  khiChuyenThanhBen,
}) {
  const { nguoiDung, daDangNhap, dangXuat, laSinhVien, laGiangVien } = suDungXacThuc();
  const { cheDoToi, chuyenCheDoGiaoDien } = suDungGiaoDien();
  const dieuHuong = useNavigate();
  const viTri = useLocation();

  const [moTrinhDonTaiKhoan, datMoTrinhDonTaiKhoan] = useState(false);
  const [moMenuDiDong, datMoMenuDiDong] = useState(false);
  const [daCuonXuong, datDaCuonXuong] = useState(false);
  const thamChieuMenu = useRef(null);

  const coBanner = !cheDoLamViec && TRANG_CO_BANNER.includes(viTri.pathname);

  useEffect(() => {
    datMoTrinhDonTaiKhoan(false);
    datMoMenuDiDong(false);
  }, [viTri.pathname]);

  useEffect(() => {
    if (!coBanner) {
      datDaCuonXuong(true);
      return undefined;
    }
    const xuLyCuon = () => datDaCuonXuong(window.scrollY > 56);
    xuLyCuon();
    window.addEventListener('scroll', xuLyCuon, { passive: true });
    return () => window.removeEventListener('scroll', xuLyCuon);
  }, [coBanner]);

  useEffect(() => {
    const xuLyBamBenNgoai = (suKien) => {
      if (thamChieuMenu.current && !thamChieuMenu.current.contains(suKien.target)) {
        datMoTrinhDonTaiKhoan(false);
      }
    };
    document.addEventListener('mousedown', xuLyBamBenNgoai);
    return () => document.removeEventListener('mousedown', xuLyBamBenNgoai);
  }, []);

  const xuLyDangXuat = () => {
    datMoTrinhDonTaiKhoan(false);
    dangXuat();
    dieuHuong('/', { replace: true });
  };

  const nutGiaoDien = (
    <button
      type="button"
      className="nut-vong-tron"
      onClick={chuyenCheDoGiaoDien}
      title={cheDoToi ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
      aria-label="Đổi chế độ giao diện"
    >
      {cheDoToi ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );

  const renderMenuTaiKhoan = () => (
    <div className="position-relative" ref={thamChieuMenu}>
      <button
        type="button"
        className="nut-tai-khoan-vien"
        onClick={() => datMoTrinhDonTaiKhoan((truoc) => !truoc)}
        aria-expanded={moTrinhDonTaiKhoan}
      >
        <AnhDaiDien
          ten={nguoiDung?.fullName}
          mauNen={nguoiDung?.avatarColor}
          kichThuoc={30}
          anh={nguoiDung?.avatarUrl}
        />
        <span className="ten-tai-khoan-ngan">{nguoiDung?.fullName}</span>
        <ChevronDown size={14} className="text-secondary" />
      </button>

      {moTrinhDonTaiKhoan && (
        <div className="trinh-don-tai-khoan">
          <div className="hop-tieu-de-menu">
            <div className="fw-bold small text-truncate">{nguoiDung?.fullName}</div>
            <div className="small text-secondary">{layNhanVaiTro(nguoiDung?.role)}</div>
          </div>
          <hr className="my-1" />

          <Link className="muc-trinh-don" to="/dashboard">
            <span className="d-inline-flex align-items-center gap-2">
              <LayoutDashboard size={16} className="text-danger" /> Bảng điều khiển
            </span>
          </Link>
          <Link className="muc-trinh-don" to="/profile">
            <span className="d-inline-flex align-items-center gap-2">
              <UserCircle2 size={16} className="text-danger" /> Hồ sơ tài khoản
            </span>
          </Link>

          {laSinhVien && (
            <Link className="muc-trinh-don" to="/my-grades">
              <span className="d-inline-flex align-items-center gap-2">
                <Award size={16} className="text-danger" /> Bảng điểm cá nhân
              </span>
            </Link>
          )}

          {laGiangVien && (
            <Link className="muc-trinh-don" to="/teacher/courses">
              <span className="d-inline-flex align-items-center gap-2">
                <BookOpen size={16} className="text-danger" /> Lớp đang phụ trách
              </span>
            </Link>
          )}

          <hr className="my-1" />

          <button type="button" className="muc-trinh-don" onClick={chuyenCheDoGiaoDien}>
            <span className="d-inline-flex align-items-center gap-2">
              {cheDoToi ? <Sun size={16} className="text-warning" /> : <Moon size={16} className="text-secondary" />}
              <span>Giao diện tối</span>
            </span>
            <div className="form-check form-switch m-0">
              <input className="form-check-input" type="checkbox" role="switch" checked={cheDoToi} readOnly />
            </div>
          </button>

          <hr className="my-1" />

          <button type="button" className="muc-trinh-don text-danger fw-semibold" onClick={xuLyDangXuat}>
            <span className="d-inline-flex align-items-center gap-2">
              <LogOut size={16} /> Đăng xuất
            </span>
          </button>
        </div>
      )}
    </div>
  );

  // 1. Khu lam viec sau dang nhap: header 1 tang gon, menu chinh nam o Sidebar trai
  if (cheDoLamViec && daDangNhap) {
    return (
      <header id="dauTrang" className="dau-trang dau-trang-lam-viec">
        <div className="container-fluid px-3 px-lg-4 d-flex align-items-center justify-content-between gap-2">
          <div className="d-flex align-items-center gap-2 gap-sm-3 min-w-0">
            {khiChuyenThanhBen && (
              <button
                type="button"
                className="nut-vong-tron flex-shrink-0"
                onClick={khiChuyenThanhBen}
                title={dangMoThanhBen ? 'Thu gọn thanh điều hướng trái' : 'Mở thanh điều hướng trái'}
                aria-label="Đóng mở thanh điều hướng trái"
              >
                <Menu size={17} />
              </button>
            )}

            <Link to="/dashboard" className="d-flex align-items-center gap-2 text-decoration-none min-w-0">
              <span className="bieu-tuong-thuong-hieu" style={{ width: 34, height: 34 }}>
                <GraduationCap size={19} />
              </span>
              <div className="min-w-0">
                <div className="ten-thuong-hieu" style={{ fontSize: '1.14rem' }}>EduClass</div>
                <div className="text-secondary d-none d-sm-block text-truncate" style={{ fontSize: '0.7rem' }}>
                  Không gian {layNhanVaiTro(nguoiDung?.role)}
                </div>
              </div>
            </Link>
          </div>

          <div className="d-flex align-items-center gap-2 flex-shrink-0">
            {nutGiaoDien}
            {renderMenuTaiKhoan()}
          </div>
        </div>
      </header>
    );
  }

  // 2. Cac trang cong khai: header toi gian, moi menu dan toi 1 trang rieng
  return (
    <header
      id="dauTrang"
      className={`dau-trang-dien-anh ${coBanner ? 'noi-tren-banner' : 'dinh-co-dinh'} ${daCuonXuong ? 'da-cuon' : ''}`}
    >
      <div className="container-fluid container-xl d-flex align-items-center justify-content-between gap-3">
        <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
          <span className="bieu-tuong-thuong-hieu" style={{ width: 34, height: 34 }}>
            <GraduationCap size={18} />
          </span>
          <span className="ten-thuong-hieu-dien-anh">EDUCLASS</span>
        </Link>

        <nav className="d-none d-lg-flex align-items-center gap-4">
          {MENU_CONG_KHAI.map((muc) => (
            <NavLink
              key={muc.to}
              to={muc.to}
              end={muc.end}
              className={({ isActive }) => `lien-ket-dien-anh ${isActive ? 'dang-chon' : ''}`}
            >
              {muc.nhan}
            </NavLink>
          ))}
          <a
            href={`${DUONG_DAN_TAI_LEN}/api-docs`}
            target="_blank"
            rel="noreferrer"
            className="lien-ket-dien-anh d-inline-flex align-items-center gap-1"
          >
            <span>API Docs</span>
            <ExternalLink size={12} />
          </a>
        </nav>

        <div className="d-flex align-items-center gap-2">
          {nutGiaoDien}
          {!daDangNhap ? (
            <>
              <Link to="/login" className="nut-dien-anh-vien d-none d-sm-inline-flex">
                Đăng nhập
              </Link>
              <Link to="/register" className="nut-dien-anh-chinh">
                Đăng ký
              </Link>
            </>
          ) : (
            <Link to="/dashboard" className="nut-dien-anh-chinh">
              Vào không gian học
            </Link>
          )}

          <button
            type="button"
            className="nut-menu-dien-anh d-lg-none"
            onClick={() => datMoMenuDiDong((truoc) => !truoc)}
            aria-label="Mở trình đơn"
          >
            {moMenuDiDong ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {moMenuDiDong && (
        <div className="container-fluid mt-2 pt-2 pb-2 d-lg-none menu-di-dong-dien-anh">
          <div className="d-flex flex-column gap-2 px-2">
            {MENU_CONG_KHAI.map((muc) => (
              <NavLink
                key={muc.to}
                to={muc.to}
                end={muc.end}
                className={({ isActive }) => `lien-ket-dien-anh py-1 ${isActive ? 'dang-chon' : ''}`}
              >
                {muc.nhan}
              </NavLink>
            ))}
            {!daDangNhap && <Link to="/login" className="lien-ket-dien-anh py-1">Đăng nhập</Link>}
          </div>
        </div>
      )}
    </header>
  );
}
