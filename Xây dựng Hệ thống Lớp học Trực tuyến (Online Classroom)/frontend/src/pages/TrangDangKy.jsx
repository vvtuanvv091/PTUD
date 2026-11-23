import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { suDungXacThuc } from '../context/NguCanhXacThuc';
import { suDungThongBao } from '../context/NguCanhThongBao';
import { layThongBaoLoi } from '../services/goiApi';
import { ONhapMatKhau } from '../components/ThanhPhanChung';

export function TrangDangKy() {
  const { dangKy } = suDungXacThuc();
  const thongBao = suDungThongBao();
  const dieuHuong = useNavigate();

  const [bieuMau, datBieuMau] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    studentCode: '',
    department: 'Công nghệ thông tin',
  });
  const [loi, datLoi] = useState('');
  const [dangXuLy, datDangXuLy] = useState(false);

  const xuLyGui = async (e) => {
    e.preventDefault();
    datLoi('');
    if (bieuMau.password !== bieuMau.confirmPassword) {
      datLoi('Mật khẩu xác nhận không khớp');
      return;
    }

    datDangXuLy(true);
    try {
      const user = await dangKy({
        fullName: bieuMau.fullName,
        email: bieuMau.email,
        password: bieuMau.password,
        role: bieuMau.role,
        studentCode: bieuMau.studentCode,
        department: bieuMau.department,
      });
      thongBao.thanhCong(`Tạo tài khoản thành công! Xin chào ${user.fullName}`);
      dieuHuong('/dashboard', { replace: true });
    } catch (err) {
      datLoi(layThongBaoLoi(err, 'Không thể đăng ký tài khoản'));
    } finally {
      datDangXuLy(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="the-bang-dieu-khien p-4 p-md-5 animate__animated animate__fadeInUp">
            <h1 className="h4 fw-bold mb-1">Tạo tài khoản EduClass</h1>
            <p className="small text-secondary mb-4">
              Chọn đúng vai trò Sinh viên hoặc Giảng viên để vào không gian học tập tương ứng.
            </p>

            {loi && (
              <div className="alert alert-danger py-2 px-3 small" role="alert">
                {loi}
              </div>
            )}

            <form onSubmit={xuLyGui} className="row g-3">
              <div className="col-12">
                <label className="form-label">Vai trò tài khoản</label>
                <div className="d-flex gap-2">
                  {[
                    { ma: 'student', nhan: 'Sinh viên' },
                    { ma: 'teacher', nhan: 'Giảng viên' },
                  ].map((vt) => (
                    <button
                      key={vt.ma}
                      type="button"
                      className={`btn flex-grow-1 ${bieuMau.role === vt.ma ? 'btn-danger' : 'nut-phu'}`}
                      onClick={() => datBieuMau((p) => ({ ...p, role: vt.ma }))}
                    >
                      {vt.nhan}
                    </button>
                  ))}
                </div>
              </div>

              <div className="col-md-7">
                <label className="form-label">Họ và tên</label>
                <input
                  className="form-control"
                  value={bieuMau.fullName}
                  onChange={(e) => datBieuMau((p) => ({ ...p, fullName: e.target.value }))}
                  required
                />
              </div>

              <div className="col-md-5">
                <label className="form-label">{bieuMau.role === 'teacher' ? 'Mã giảng viên' : 'Mã số sinh viên'}</label>
                <input
                  className="form-control chu-don-cach"
                  placeholder={bieuMau.role === 'teacher' ? 'VD: GV205' : 'VD: SV2026099'}
                  value={bieuMau.studentCode}
                  onChange={(e) => datBieuMau((p) => ({ ...p, studentCode: e.target.value }))}
                />
              </div>

              <div className="col-md-7">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="ten@educlass.vn"
                  value={bieuMau.email}
                  onChange={(e) => datBieuMau((p) => ({ ...p, email: e.target.value }))}
                  required
                />
              </div>

              <div className="col-md-5">
                <label className="form-label">Khoa / Bộ môn</label>
                <input
                  className="form-control"
                  value={bieuMau.department}
                  onChange={(e) => datBieuMau((p) => ({ ...p, department: e.target.value }))}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Mật khẩu</label>
                <ONhapMatKhau
                  minLength={6}
                  value={bieuMau.password}
                  onChange={(e) => datBieuMau((p) => ({ ...p, password: e.target.value }))}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Nhập lại mật khẩu</label>
                <ONhapMatKhau
                  minLength={6}
                  value={bieuMau.confirmPassword}
                  onChange={(e) => datBieuMau((p) => ({ ...p, confirmPassword: e.target.value }))}
                  required
                />
              </div>

              <div className="col-12 mt-3">
                <button type="submit" className="nut-hanh-dong-do w-100" disabled={dangXuLy}>
                  <UserPlus size={16} />
                  <span>{dangXuLy ? 'Đang tạo tài khoản...' : 'Hoàn tất đăng ký'}</span>
                </button>
              </div>
            </form>

            <div className="text-center small text-secondary mt-4">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-danger fw-semibold">
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

