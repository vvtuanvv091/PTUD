import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock } from 'lucide-react';
import { suDungXacThuc } from '../context/NguCanhXacThuc';
import { suDungThongBao } from '../context/NguCanhThongBao';
import { layThongBaoLoi } from '../services/goiApi';
import { ONhapMatKhau } from '../components/ThanhPhanChung';

const TAI_KHOAN_MAU = [
  { nhan: 'Quản trị viên', email: 'admin@educlass.vn', biKhoa: false },
  { nhan: 'Giảng viên', email: 'giangvien@educlass.vn', biKhoa: false },
  { nhan: 'Sinh viên', email: 'sinhvien@educlass.vn', biKhoa: false },
  { nhan: 'Tài khoản bị khóa', email: 'locked.sv@educlass.vn', biKhoa: true },
];

export function TrangDangNhap() {
  const { dangNhap } = suDungXacThuc();
  const thongBao = suDungThongBao();
  const dieuHuong = useNavigate();
  const viTri = useLocation();
  const dichDen = viTri.state?.from?.pathname || '/dashboard';

  const [email, datEmail] = useState('');
  const [matKhau, datMatKhau] = useState('');
  const [dangXuLy, datDangXuLy] = useState(false);
  const [loi, datLoi] = useState('');

  const xuLyGui = async (e) => {
    e.preventDefault();
    datLoi('');
    datDangXuLy(true);
    try {
      const user = await dangNhap(email, matKhau);
      thongBao.thanhCong(`Chào mừng ${user.fullName} quay trở lại`);
      dieuHuong(dichDen, { replace: true });
    } catch (err) {
      datLoi(layThongBaoLoi(err, 'Đăng nhập thất bại'));
    } finally {
      datDangXuLy(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-5">
          <div className="the-bang-dieu-khien p-4 p-md-5 animate__animated animate__fadeInUp">
            <h1 className="h4 fw-bold mb-1">Đăng nhập hệ thống</h1>
            <p className="small text-secondary mb-4">
              Dùng email đã đăng ký hoặc chọn nhanh tài khoản demo bên dưới để kiểm thử theo từng vai trò.
            </p>

            {loi && (
              <div className="alert alert-danger py-2 px-3 small" role="alert">
                {loi}
              </div>
            )}

            <form onSubmit={xuLyGui} className="d-flex flex-column gap-3">
              <div>
                <label className="form-label">Địa chỉ email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="ten@educlass.vn"
                  value={email}
                  onChange={(e) => datEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="form-label">Mật khẩu</label>
                <ONhapMatKhau
                  placeholder="Nhập mật khẩu"
                  value={matKhau}
                  onChange={(e) => datMatKhau(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="nut-hanh-dong-do w-100 mt-1"
                disabled={dangXuLy}
              >
                <span>{dangXuLy ? 'Đang xác thực...' : 'Đăng nhập'}</span>
                {!dangXuLy && <ArrowRight size={16} />}
              </button>
            </form>

            <div className="border-top mt-4 pt-3">
              <div className="small text-secondary mb-2">
                Điền nhanh tài khoản mẫu (mật khẩu: <code>123456</code>)
              </div>
              <div className="row g-2">
                {TAI_KHOAN_MAU.map((tk) => (
                  <div className="col-6" key={tk.email}>
                    <button
                      type="button"
                      className="btn nut-phu btn-sm w-100 d-flex align-items-center justify-content-between"
                      onClick={() => {
                        datEmail(tk.email);
                        datMatKhau('123456');
                        datLoi('');
                      }}
                    >
                      <span className="text-truncate">{tk.nhan}</span>
                      {tk.biKhoa && <Lock size={13} className="text-danger flex-shrink-0" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center small text-secondary mt-4">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-danger fw-semibold">
                Đăng ký ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

