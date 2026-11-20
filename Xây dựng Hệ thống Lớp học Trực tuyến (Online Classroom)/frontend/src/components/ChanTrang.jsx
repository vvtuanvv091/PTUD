import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { DUONG_DAN_TAI_LEN } from '../services/goiApi';

export function ChanTrang({ dienAnh = false }) {
  return (
    <footer className={`chan-trang ${dienAnh ? 'chan-trang-dien-anh' : ''}`}>
      <div className="container-fluid container-xl">
        <div className="row gy-4">
          <div className="col-lg-5 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="bieu-tuong-thuong-hieu" style={{ width: 32, height: 32 }}>
                <GraduationCap size={18} />
              </span>
              <span className="fw-bold fs-5" style={{ color: dienAnh ? '#f8fafc' : 'var(--mau-chu-chinh)' }}>
                EduClass
              </span>
            </div>
            <p className="mb-2" style={{ maxWidth: 420 }}>
              Hệ thống Lớp học Trực tuyến xây dựng trên nền tảng MERN Stack (MongoDB, Express.js,
              React.js, Node.js), phục vụ quản lý học phần, học liệu, nộp bài và chấm điểm tập trung.
            </p>
            <div className="small">
              Cơ sở dữ liệu: <code className="chu-don-cach">HeThongLopHocTrucTuyen</code>
            </div>
          </div>

          <div className="col-6 col-lg-3 col-md-3">
            <h4>Khám phá</h4>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              <li><Link to="/">Trang chủ</Link></li>
              <li><Link to="/khong-gian">Không gian vai trò</Link></li>
              <li><Link to="/explore">Khóa học đang mở</Link></li>
              <li><Link to="/lo-trinh">Lộ trình học tập</Link></li>
            </ul>
          </div>

          <div className="col-6 col-lg-4 col-md-3">
            <h4>Tài khoản &amp; Kỹ thuật</h4>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              <li><Link to="/login">Đăng nhập</Link></li>
              <li><Link to="/register">Đăng ký tài khoản</Link></li>
              <li>
                <a href={`${DUONG_DAN_TAI_LEN}/api-docs`} target="_blank" rel="noreferrer">
                  Tài liệu Swagger UI (/api-docs)
                </a>
              </li>
              <li>
                <a href={`${DUONG_DAN_TAI_LEN}/api/health`} target="_blank" rel="noreferrer">
                  Kiểm tra sức khỏe API (/api/health)
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
