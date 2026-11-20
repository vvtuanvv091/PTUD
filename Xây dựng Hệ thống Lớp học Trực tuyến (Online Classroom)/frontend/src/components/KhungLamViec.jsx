import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Award,
  BookOpen,
  ChevronLeft,
  ClipboardCheck,
  Compass,
  Database,
  ExternalLink,
  FolderKanban,
  LayoutDashboard,
  UserCircle2,
  Users,
} from 'lucide-react';
import { ThanhDauTrang } from './ThanhDauTrang';
import { ChanTrang } from './ChanTrang';
import { AnhDaiDien } from './ThanhPhanChung';
import { suDungXacThuc } from '../context/NguCanhXacThuc';
import { layNhanVaiTro } from '../utils/dinhDang';
import { DUONG_DAN_TAI_LEN } from '../services/goiApi';

const taoNhomDieuHuong = (vaiTro) => {
  if (vaiTro === 'admin') {
    return [
      {
        nhom: 'TỔNG QUAN',
        cacMuc: [{ to: '/dashboard', nhan: 'Bảng điều khiển', bieuTuong: LayoutDashboard }],
      },
      {
        nhom: 'QUẢN TRỊ HỆ THỐNG',
        cacMuc: [
          { to: '/admin/users', nhan: 'Quản lý người dùng', bieuTuong: Users },
          { to: '/admin/categories', nhan: 'Danh mục khóa học', bieuTuong: FolderKanban },
          { to: '/admin/courses', nhan: 'Giám sát lớp học', bieuTuong: BookOpen },
          { to: '/admin/database', nhan: 'Quản lý CSDL MongoDB', bieuTuong: Database },
        ],
      },
      {
        nhom: 'TÀI KHOẢN',
        cacMuc: [{ to: '/profile', nhan: 'Hồ sơ quản trị', bieuTuong: UserCircle2 }],
      },
    ];
  }

  if (vaiTro === 'teacher') {
    return [
      {
        nhom: 'TỔNG QUAN',
        cacMuc: [{ to: '/dashboard', nhan: 'Tổng quan giảng dạy', bieuTuong: LayoutDashboard }],
      },
      {
        nhom: 'GIẢNG DẠY',
        cacMuc: [
          { to: '/teacher/courses', nhan: 'Lớp đang phụ trách', bieuTuong: BookOpen },
          { to: '/explore', nhan: 'Danh mục khóa học', bieuTuong: Compass },
        ],
      },
      {
        nhom: 'TÀI KHOẢN',
        cacMuc: [{ to: '/profile', nhan: 'Hồ sơ giảng viên', bieuTuong: UserCircle2 }],
      },
    ];
  }

  return [
    {
      nhom: 'TỔNG QUAN',
      cacMuc: [{ to: '/dashboard', nhan: 'Tổng quan học tập', bieuTuong: LayoutDashboard }],
    },
    {
      nhom: 'HỌC TẬP',
      cacMuc: [
        { to: '/my-courses', nhan: 'Lớp học của tôi', bieuTuong: BookOpen },
        { to: '/explore', nhan: 'Khám phá khóa học', bieuTuong: Compass },
        { to: '/my-assignments', nhan: 'Hạn nộp bài tập', bieuTuong: ClipboardCheck },
        { to: '/my-grades', nhan: 'Bảng điểm cá nhân', bieuTuong: Award },
      ],
    },
    {
      nhom: 'TÀI KHOẢN',
      cacMuc: [{ to: '/profile', nhan: 'Hồ sơ sinh viên', bieuTuong: UserCircle2 }],
    },
  ];
};

export function KhungLamViec() {
  const { nguoiDung } = suDungXacThuc();
  const viTri = useLocation();
  const thamChieuKhung = useRef(null);
  const [moThanhBen, datMoThanhBen] = useState(() => window.innerWidth >= 992);

  useEffect(() => {
    if (window.innerWidth < 992) {
      datMoThanhBen(false);
    }
  }, [viTri.pathname]);

  useEffect(() => {
    const xuLyDoiKichThuoc = () => {
      datMoThanhBen(window.innerWidth >= 992);
    };
    window.addEventListener('resize', xuLyDoiKichThuoc);
    return () => window.removeEventListener('resize', xuLyDoiKichThuoc);
  }, []);

  useEffect(() => {
    const dongBoChieuCao = () => {
      const dauTrang = document.getElementById('dauTrang');
      if (dauTrang && thamChieuKhung.current) {
        const chieuCao = Math.round(dauTrang.getBoundingClientRect().height || 64);
        thamChieuKhung.current.style.setProperty('--chieu-cao-dau-trang', `${chieuCao}px`);
      }
    };

    dongBoChieuCao();
    window.addEventListener('resize', dongBoChieuCao);
    const dauTrang = document.getElementById('dauTrang');
    const theoDoi = dauTrang && window.ResizeObserver ? new ResizeObserver(dongBoChieuCao) : null;
    theoDoi?.observe(dauTrang);

    return () => {
      window.removeEventListener('resize', dongBoChieuCao);
      theoDoi?.disconnect();
    };
  }, []);

  const cacNhomMenu = taoNhomDieuHuong(nguoiDung?.role);
  const lopKhung = `khung-lam-viec flex-grow-1 ${moThanhBen ? 'thanh-ben-mo' : 'thanh-ben-thu-gon'}`;

  return (
    <div className="d-flex flex-column min-vh-100">
      <ThanhDauTrang
        cheDoLamViec
        dangMoThanhBen={moThanhBen}
        khiChuyenThanhBen={() => datMoThanhBen((truoc) => !truoc)}
      />

      <div className={lopKhung} ref={thamChieuKhung}>
        <aside className="thanh-ben-trai" aria-label="Thanh điều hướng khu làm việc">
          <div className="nguoi-dung-thanh-ben">
            <div className="d-flex align-items-center gap-2 min-w-0">
              <AnhDaiDien
                ten={nguoiDung?.fullName}
                mauNen={nguoiDung?.avatarColor}
                kichThuoc={38}
                anh={nguoiDung?.avatarUrl}
              />
              <div className="min-w-0">
                <div className="fw-bold small text-truncate">{nguoiDung?.fullName}</div>
                <div className="text-secondary text-truncate" style={{ fontSize: '0.74rem' }}>
                  {layNhanVaiTro(nguoiDung?.role)}
                </div>
              </div>
            </div>
            <button
              type="button"
              className="nut-thu-gon-thanh-ben"
              onClick={() => datMoThanhBen(false)}
              title="Thu gọn thanh điều hướng"
              aria-label="Thu gọn thanh điều hướng"
            >
              <ChevronLeft size={16} />
            </button>
          </div>

          <nav>
            {cacNhomMenu.map((nhom) => (
              <div key={nhom.nhom}>
                <span className="tieu-de-nhom-menu">{nhom.nhom}</span>
                {nhom.cacMuc.map((muc) => {
                  const BieuTuong = muc.bieuTuong;
                  return (
                    <NavLink
                      key={muc.to}
                      to={muc.to}
                      className={({ isActive }) => `lien-ket-thanh-ben ${isActive ? 'active' : ''}`}
                    >
                      <BieuTuong size={17} />
                      <span>{muc.nhan}</span>
                    </NavLink>
                  );
                })}
              </div>
            ))}

            <span className="tieu-de-nhom-menu">KỸ THUẬT</span>
            <a
              href={`${DUONG_DAN_TAI_LEN}/api-docs`}
              target="_blank"
              rel="noreferrer"
              className="lien-ket-thanh-ben"
            >
              <ExternalLink size={16} />
              <span>Swagger API Docs</span>
            </a>
          </nav>
        </aside>

        <button
          type="button"
          className="lop-phu-thanh-ben"
          onClick={() => datMoThanhBen(false)}
          aria-label="Đóng thanh điều hướng"
        />

        <main className="noi-dung-lam-viec">
          <div key={viTri.pathname} className="vao-canh-lam-viec" style={{ maxWidth: 1320, margin: '0 auto' }}>
            <Outlet />
          </div>
        </main>
      </div>

      <ChanTrang />
    </div>
  );
}

