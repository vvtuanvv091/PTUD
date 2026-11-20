import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { NhaCungCapGiaoDien } from './context/NguCanhGiaoDien';
import { NhaCungCapXacThuc, suDungXacThuc } from './context/NguCanhXacThuc';
import { NhaCungCapThongBao } from './context/NguCanhThongBao';
import { TuyenBaoVe } from './components/TuyenBaoVe';
import { KhungCongKhai } from './components/KhungCongKhai';
import { KhungLamViec } from './components/KhungLamViec';

import { TrangChu } from './pages/TrangChu';
import { TrangKhongGian } from './pages/TrangKhongGian';
import { TrangLoTrinh } from './pages/TrangLoTrinh';
import { TrangQuanLyDatabase } from './pages/TrangQuanLyDatabase';
import { TrangDangNhap } from './pages/TrangDangNhap';
import { TrangDangKy } from './pages/TrangDangKy';
import { TrangTongQuan } from './pages/TrangTongQuan';
import { TrangKhamPhaKhoaHoc } from './pages/TrangKhamPhaKhoaHoc';
import { TrangLopCuaToi } from './pages/TrangLopCuaToi';
import { TrangHanNopBaiTap } from './pages/TrangHanNopBaiTap';
import { TrangBangDiemCaNhan } from './pages/TrangBangDiemCaNhan';
import { TrangQuanLyLopGiangVien } from './pages/TrangQuanLyLopGiangVien';
import { TrangChiTietKhoaHoc } from './pages/TrangChiTietKhoaHoc';
import { TrangQuanLyNguoiDung } from './pages/TrangQuanLyNguoiDung';
import { TrangQuanLyDanhMuc } from './pages/TrangQuanLyDanhMuc';
import { TrangGiamSatKhoaHoc } from './pages/TrangGiamSatKhoaHoc';
import { TrangHoSo } from './pages/TrangHoSo';

function TuyenChiCongKhai({ children }) {
  const { daDangNhap, dangTai } = suDungXacThuc();
  if (dangTai) return null;
  if (daDangNhap) return <Navigate to="/dashboard" replace />;
  return children;
}

function TuyenKhamPhaLinhHoat() {
  const { daDangNhap } = suDungXacThuc();
  if (daDangNhap) return <KhungLamViec />;
  return (
    <KhungCongKhai>
      <TrangKhamPhaKhoaHoc />
    </KhungCongKhai>
  );
}

export default function App() {
  return (
    <NhaCungCapGiaoDien>
      <NhaCungCapThongBao>
        <NhaCungCapXacThuc>
          <BrowserRouter>
            <Routes>
              {/* Cac trang danh cho khach chua dang nhap — moi menu la 1 trang rieng */}
              <Route element={<KhungCongKhai />}>
                <Route path="/" element={<TrangChu />} />
                <Route path="/khong-gian" element={<TrangKhongGian />} />
                <Route path="/lo-trinh" element={<TrangLoTrinh />} />
                <Route
                  path="/login"
                  element={
                    <TuyenChiCongKhai>
                      <TrangDangNhap />
                    </TuyenChiCongKhai>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <TuyenChiCongKhai>
                      <TrangDangKy />
                    </TuyenChiCongKhai>
                  }
                />
              </Route>

              {/* Kham pha khoa hoc: Khach dung KhungCongKhai, Da dang nhap dung KhungLamViec + Sidebar */}
              <Route path="/explore" element={<TuyenKhamPhaLinhHoat />}>
                <Route index element={<TrangKhamPhaKhoaHoc />} />
              </Route>

              {/* Khu lam viec bao ve theo vai tro (Header gon + Thanh ben trai) */}
              <Route
                element={
                  <TuyenBaoVe>
                    <KhungLamViec />
                  </TuyenBaoVe>
                }
              >
                <Route path="/dashboard" element={<TrangTongQuan />} />
                <Route path="/courses/:id" element={<TrangChiTietKhoaHoc />} />
                <Route path="/profile" element={<TrangHoSo />} />

                {/* Luong Sinh vien */}
                <Route
                  path="/my-courses"
                  element={
                    <TuyenBaoVe cacVaiTro={['student']}>
                      <TrangLopCuaToi />
                    </TuyenBaoVe>
                  }
                />
                <Route
                  path="/my-assignments"
                  element={
                    <TuyenBaoVe cacVaiTro={['student']}>
                      <TrangHanNopBaiTap />
                    </TuyenBaoVe>
                  }
                />
                <Route
                  path="/my-grades"
                  element={
                    <TuyenBaoVe cacVaiTro={['student']}>
                      <TrangBangDiemCaNhan />
                    </TuyenBaoVe>
                  }
                />

                {/* Luong Giang vien */}
                <Route
                  path="/teacher/courses"
                  element={
                    <TuyenBaoVe cacVaiTro={['teacher']}>
                      <TrangQuanLyLopGiangVien />
                    </TuyenBaoVe>
                  }
                />

                {/* Luong Quan tri vien */}
                <Route
                  path="/admin/users"
                  element={
                    <TuyenBaoVe cacVaiTro={['admin']}>
                      <TrangQuanLyNguoiDung />
                    </TuyenBaoVe>
                  }
                />
                <Route
                  path="/admin/categories"
                  element={
                    <TuyenBaoVe cacVaiTro={['admin']}>
                      <TrangQuanLyDanhMuc />
                    </TuyenBaoVe>
                  }
                />
                <Route
                  path="/admin/courses"
                  element={
                    <TuyenBaoVe cacVaiTro={['admin']}>
                      <TrangGiamSatKhoaHoc />
                    </TuyenBaoVe>
                  }
                />
                <Route
                  path="/admin/database"
                  element={
                    <TuyenBaoVe cacVaiTro={['admin']}>
                      <TrangQuanLyDatabase />
                    </TuyenBaoVe>
                  }
                />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </NhaCungCapXacThuc>
      </NhaCungCapThongBao>
    </NhaCungCapGiaoDien>
  );
}
