import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Minus,
  Shield,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import { suDungXacThuc } from '../context/NguCanhXacThuc';

const DANH_SACH_VAI_TRO = [
  {
    vaiTro: 'student',
    ten: 'Sinh viên',
    tieuDe: 'Chủ động học tập & theo dõi tiến độ',
    bieuTuong: GraduationCap,
    mauNen: 'rgba(2, 132, 199, 0.1)',
    mauChu: '#0284c7',
    badge: 'Học viên',
    moTa: 'Dành cho sinh viên tham gia các lớp học tín chỉ, truy cập kho học liệu số, làm bài tập và nhận đánh giá từ giảng viên.',
    quyenHan: [
      'Ghi danh lớp học bằng một chạm hoặc nhập mã tham gia (Join Code)',
      'Học tập qua tài liệu PDF, video bài giảng nhúng và bài đọc chi tiết',
      'Đánh dấu hoàn thành bài học, tự động tính tỷ lệ % tiến độ học tập',
      'Nộp bài tập bằng tệp đính kèm và/hoặc văn bản trước hạn chót',
      'Tra cứu bảng điểm cá nhân quy đổi hệ 10 kèm nhận xét của giảng viên',
    ],
    nutHanhDong: 'Khám phá lớp đang mở',
    duongDan: '/explore',
  },
  {
    vaiTro: 'teacher',
    ten: 'Giảng viên',
    tieuDe: 'Quản trị lớp học & Đánh giá học tập',
    bieuTuong: BookOpen,
    mauNen: 'rgba(219, 48, 58, 0.1)',
    mauChu: '#db303a',
    badge: 'Phụ trách môn',
    moTa: 'Dành cho giảng viên mở lớp, phân phối học liệu số hóa, giao bài tập định kỳ, chấm bài và quản lý bảng điểm toàn diện.',
    quyenHan: [
      'CRUD lớp học, hệ thống tự động sinh mã tham gia Join Code 6 ký tự',
      'Đăng tải học liệu số hóa theo từng tuần (PDF thật, Video YouTube, Bài đọc)',
      'Tạo bài tập kèm file đề, thiết lập hạn nộp và tùy chọn nộp trễ',
      'Chấm điểm bài nộp theo thang 10, nhận xét chi tiết và lọc bài chưa chấm',
      'Xuất bảng điểm lớp dạng CSV (UTF-8 BOM) mở trực tiếp bằng Excel tiếng Việt',
    ],
    nutHanhDong: 'Đăng nhập Giảng viên',
    duongDan: '/login',
  },
  {
    vaiTro: 'admin',
    ten: 'Quản trị viên',
    tieuDe: 'Điều hành & Giám sát toàn hệ thống',
    bieuTuong: Shield,
    mauNen: 'rgba(22, 101, 52, 0.1)',
    mauChu: '#166534',
    badge: 'Quản trị cấp cao',
    moTa: 'Dành cho ban quản trị nhà trường theo dõi toàn bộ hoạt động đào tạo, quản lý tài khoản người dùng và duy trì dữ liệu hệ thống.',
    quyenHan: [
      'Quản lý toàn bộ người dùng, phân quyền và Khóa / Mở khóa tài khoản ngay lập tức',
      'CRUD danh mục khóa học, cơ chế an toàn tự chặn xóa danh mục đang có lớp học',
      'Giám sát tất cả lớp học trong hệ thống, chuyển đổi trạng thái mở / nháp / lưu trữ',
      'Quản lý cơ sở dữ liệu MongoDB: xem chi tiết 8 collection tiếng Việt và xuất JSON',
      'Dashboard thống kê toàn cảnh: số sinh viên, tỷ lệ chấm bài và mức độ tương tác',
    ],
    nutHanhDong: 'Đăng nhập Quản trị viên',
    duongDan: '/login',
  },
];

const MA_TRAN_PHAN_QUYEN = [
  { chucNang: 'Đăng ký tài khoản, đăng nhập JWT & cập nhật hồ sơ cá nhân', sv: 'Có', gv: 'Có', ad: 'Có' },
  { chucNang: 'Tìm kiếm, lọc danh mục & xem thông tin khóa học công khai', sv: 'Có', gv: 'Có', ad: 'Có' },
  { chucNang: 'Ghi danh khóa học (qua mã Join Code hoặc danh sách đang mở)', sv: 'Có', gv: '-', ad: '-' },
  { chucNang: 'Xem học liệu bài giảng (PDF, Video, Bài đọc)', sv: 'Lớp đã ghi danh', gv: 'Lớp của mình', ad: 'Toàn hệ thống' },
  { chucNang: 'Đánh dấu hoàn thành học liệu & tự động tính tiến độ %', sv: 'Có', gv: 'Xem của sinh viên', ad: '-' },
  { chucNang: 'Nộp bài tập (Upload file hoặc nhập văn bản trực tiếp)', sv: 'Có', gv: '-', ad: '-' },
  { chucNang: 'Xem điểm số và nhận xét bài nộp cá nhân', sv: 'Có', gv: '-', ad: '-' },
  { chucNang: 'Tạo mới, sửa thông tin, đổi ảnh bìa & quản lý lớp học', sv: '-', gv: 'Lớp của mình', ad: 'Toàn hệ thống' },
  { chucNang: 'Đăng học liệu (Upload file PDF thật, nhúng link Video)', sv: '-', gv: 'Có', ad: 'Có' },
  { chucNang: 'Giao bài tập, thiết lập hạn nộp & thang điểm', sv: '-', gv: 'Có', ad: 'Có' },
  { chucNang: 'Chấm điểm bài nộp, nhận xét & xuất bảng điểm CSV', sv: '-', gv: 'Có', ad: 'Có' },
  { chucNang: 'Đăng thông báo, ghim bài & thảo luận bảng tin lớp', sv: 'Bình luận', gv: 'Toàn quyền', ad: 'Toàn quyền' },
  { chucNang: 'Khóa / Mở khóa tài khoản người dùng, đổi vai trò', sv: '-', gv: '-', ad: 'Có' },
  { chucNang: 'Quản lý danh mục khóa học (thêm, sửa, xóa danh mục)', sv: '-', gv: '-', ad: 'Có' },
  { chucNang: 'Giám sát CSDL MongoDB (xem số bản ghi, duyệt dữ liệu)', sv: '-', gv: '-', ad: 'Có' },
];

export function TrangKhongGian() {
  const { daDangNhap } = suDungXacThuc();

  return (
    <div className="main pb-5" style={{ minHeight: '80vh' }}>
      <div className="container">
        {/* Tiêu đề trang */}
        <div className="text-center mb-5">
          <span className="badge bg-danger-subtle text-danger fw-semibold px-3 py-2 rounded-pill mb-2">
            MÔ HÌNH PHÂN QUYỀN RBAC
          </span>
          <h1 className="fw-bold mb-3" style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}>
            Không Gian Vai Trò
          </h1>
          <p className="text-muted mx-auto" style={{ maxWidth: 680, fontSize: '1.05rem', lineHeight: 1.6 }}>
            Hệ thống EduClass phân định rõ ràng quyền hạn và luồng nghiệp vụ giữa 3 vai trò:{' '}
            <strong>Sinh viên</strong>, <strong>Giảng viên</strong> và <strong>Quản trị viên</strong>,
            đảm bảo tính bảo mật và trải nghiệm học tập chuẩn mực.
          </p>
        </div>

        {/* 3 Thẻ vai trò */}
        <div className="row gy-4 mb-5">
          {DANH_SACH_VAI_TRO.map((vt) => {
            const BieuTuong = vt.bieuTuong;
            return (
              <div key={vt.vaiTro} className="col-lg-4 d-flex">
                <div className="card w-100 border rounded-4 shadow-sm p-4 d-flex flex-column" style={{ background: 'var(--otsp-surface)' }}>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div
                      className="d-inline-flex align-items-center justify-content-center rounded-3"
                      style={{ width: 48, height: 48, backgroundColor: vt.mauNen, color: vt.mauChu }}
                    >
                      <BieuTuong size={26} />
                    </div>
                    <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: vt.mauNen, color: vt.mauChu, fontWeight: 600 }}>
                      {vt.badge}
                    </span>
                  </div>

                  <h3 className="h4 fw-bold mb-1">{vt.ten}</h3>
                  <div className="small fw-semibold mb-2" style={{ color: vt.mauChu }}>
                    {vt.tieuDe}
                  </div>
                  <p className="text-muted small mb-4">{vt.moTa}</p>

                  <div className="fw-semibold small text-uppercase mb-2 text-secondary" style={{ letterSpacing: '0.5px' }}>
                    Quyền hạn chính:
                  </div>
                  <ul className="list-unstyled mb-4 flex-grow-1">
                    {vt.quyenHan.map((qh, idx) => (
                      <li key={idx} className="d-flex align-items-start gap-2 mb-2 small text-secondary">
                        <CheckCircle2 size={16} className="text-success flex-shrink-0 mt-1" />
                        <span>{qh}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-3 border-top mt-auto">
                    <Link
                      to={daDangNhap ? '/dashboard' : vt.duongDan}
                      className="btn w-100 fw-semibold d-flex align-items-center justify-content-center gap-2 py-2 rounded-3"
                      style={{
                        backgroundColor: vt.mauChu,
                        color: '#ffffff',
                        border: 'none',
                      }}
                    >
                      <span>{daDangNhap ? 'Vào bảng điều khiển' : vt.nutHanhDong}</span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ma trận phân quyền */}
        <div className="card border rounded-4 shadow-sm p-4 p-lg-5 mb-5" style={{ background: 'var(--otsp-surface)' }}>
          <div className="text-center mb-4">
            <h2 className="h4 fw-bold mb-2">Ma Trận Phân Quyền Chi Tiết (Role Matrix)</h2>
            <p className="text-muted small">
              Toàn bộ API backend kiểm tra phân quyền thông qua JWT Middleware <code>yeuCauDangNhap</code> và <code>phanQuyen</code>.
            </p>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '46%' }}>Chức năng nghiệp vụ</th>
                  <th className="text-center" style={{ width: '18%' }}>Sinh viên</th>
                  <th className="text-center" style={{ width: '18%' }}>Giảng viên</th>
                  <th className="text-center" style={{ width: '18%' }}>Quản trị viên</th>
                </tr>
              </thead>
              <tbody>
                {MA_TRAN_PHAN_QUYEN.map((row, idx) => (
                  <tr key={idx}>
                    <td className="fw-medium small">{row.chucNang}</td>
                    <td className="text-center">
                      {row.sv === 'Có' ? (
                        <span className="badge bg-success-subtle text-success px-2 py-1">Có</span>
                      ) : row.sv === '-' ? (
                        <span className="text-muted">-</span>
                      ) : (
                        <span className="badge bg-light text-secondary border px-2 py-1">{row.sv}</span>
                      )}
                    </td>
                    <td className="text-center">
                      {row.gv === 'Có' ? (
                        <span className="badge bg-danger-subtle text-danger px-2 py-1">Có</span>
                      ) : row.gv === '-' ? (
                        <span className="text-muted">-</span>
                      ) : (
                        <span className="badge bg-light text-secondary border px-2 py-1">{row.gv}</span>
                      )}
                    </td>
                    <td className="text-center">
                      {row.ad === 'Có' || row.ad === 'Toàn hệ thống' || row.ad === 'Toàn quyền' ? (
                        <span className="badge bg-primary-subtle text-primary px-2 py-1">{row.ad}</span>
                      ) : row.ad === '-' ? (
                        <span className="text-muted">-</span>
                      ) : (
                        <span className="badge bg-light text-secondary border px-2 py-1">{row.ad}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Khối tài khoản thử nghiệm */}
        <div className="card rounded-4 border p-4 p-lg-5" style={{ background: 'var(--otsp-surface-subtle)' }}>
          <div className="row align-items-center gy-3">
            <div className="col-lg-8">
              <h3 className="h5 fw-bold mb-2">Sẵn sàng trải nghiệm đầy đủ 3 vai trò?</h3>
              <p className="text-muted small mb-3">
                Hệ thống chuẩn bị sẵn tài khoản cho từng vai trò (mật khẩu chung <code>123456</code>).
                Tại màn hình đăng nhập có sẵn nút 1 chạm để điền tự động.
              </p>
              <div className="d-flex flex-wrap gap-2">
                <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-2">
                  Admin: admin@educlass.vn
                </span>
                <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2">
                  Giảng viên: giangvien@educlass.vn
                </span>
                <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2">
                  Sinh viên: sinhvien@educlass.vn
                </span>
              </div>
            </div>
            <div className="col-lg-4 text-lg-end">
              <Link to={daDangNhap ? '/dashboard' : '/login'} className="btn btn-danger btn-lg px-4 py-2 fw-semibold">
                <span>{daDangNhap ? 'Vào bảng điều khiển' : 'Đăng nhập ngay'}</span>
                <ArrowRight size={18} className="ms-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
