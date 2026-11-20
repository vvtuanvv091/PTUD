import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Code2,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  KeyRound,
  Layers,
  Shield,
  UploadCloud,
  UserCheck,
} from 'lucide-react';
import { suDungXacThuc } from '../context/NguCanhXacThuc';

const BON_BUOC_CHUNG = [
  {
    so: '01',
    ten: 'Tạo tài khoản & Xác thực',
    moTa: 'Đăng ký vai trò Sinh viên hoặc Giảng viên. Hệ thống mã hóa mật khẩu an toàn bằng bcryptjs và cấp mã JWT Bearer Token đăng nhập.',
    bieuTuong: KeyRound,
    mauNen: '#eff6ff',
    mauChu: '#2563eb',
  },
  {
    so: '02',
    ten: 'Ghi danh & Vào lớp',
    moTa: 'Duyệt danh sách khóa học theo chuyên ngành hoặc nhập mã tham gia (Join Code 6 ký tự) do giảng viên cung cấp để vào lớp ngay.',
    bieuTuong: BookOpen,
    mauNen: '#fef2f2',
    mauChu: '#dc2626',
  },
  {
    so: '03',
    ten: 'Học liệu & Tiến độ',
    moTa: 'Đọc tài liệu PDF bài giảng trực tiếp, xem video bài học nhúng và bấm "Đánh dấu hoàn thành" để hệ thống tự động tính tỷ lệ % tiến độ.',
    bieuTuong: FileText,
    mauNen: '#f0fdf4',
    mauChu: '#16a34a',
  },
  {
    so: '04',
    ten: 'Nộp bài & Tổng kết',
    moTa: 'Làm bài tập đúng hạn chót, nộp tệp hoặc văn bản. Giảng viên chấm điểm theo thang 10 kèm nhận xét và xuất bảng điểm CSV mở bằng Excel.',
    bieuTuong: FileSpreadsheet,
    mauNen: '#fffbeb',
    mauChu: '#d97706',
  },
];

const LUONG_CHI_TIET = {
  student: {
    ten: 'Sinh viên',
    moTa: 'Quy trình học tập chủ động từ khi đăng ký đến khi hoàn thành môn học.',
    buoc: [
      {
        buocSo: 1,
        tieuDe: 'Đăng ký & Đăng nhập tài khoản',
        noiDung: 'Tạo tài khoản với vai trò Sinh viên, điền MSSV, họ tên và mật khẩu. Sau khi đăng nhập, hệ thống lưu JWT Token bảo mật vào localStorage.',
        apis: ['POST /api/auth/register', 'POST /api/auth/login'],
      },
      {
        buocSo: 2,
        tieuDe: 'Tìm kiếm & Ghi danh khóa học',
        noiDung: 'Lọc khóa học theo 8 danh mục chuyên ngành hoặc nhập mã Join Code. Sinh viên có thể xem sĩ số lớp, giảng viên phụ trách và đề cương môn học.',
        apis: ['GET /api/courses', 'POST /api/enrollments'],
      },
      {
        buocSo: 3,
        tieuDe: 'Truy cập học liệu & Tự học',
        noiDung: 'Xem trực tiếp tài liệu PDF bài giảng, xem video YouTube nhúng theo chương/tuần, trao đổi thảo luận trên bảng tin lớp học và cập nhật tiến độ.',
        apis: ['GET /api/courses/:id/materials', 'POST /api/materials/:id/toggle-complete'],
      },
      {
        buocSo: 4,
        tieuDe: 'Làm bài tập & Theo dõi hạn nộp',
        noiDung: 'Bảng theo dõi hạn nộp tự động cảnh báo màu (Quá hạn đỏ, Sắp hết hạn < 48h vàng, Đang mở xanh). Nộp bài bằng tệp hoặc văn bản trước deadline.',
        apis: ['GET /api/assignments/my-deadlines', 'POST /api/assignments/:id/submit'],
      },
      {
        buocSo: 5,
        tieuDe: 'Xem bảng điểm & Nhận xét',
        noiDung: 'Tra cứu bảng điểm cá nhân quy đổi hệ 10, xem điểm từng bài tập, trạng thái nộp đúng hạn/trễ hạn và lời phê chi tiết từ giảng viên.',
        apis: ['GET /api/submissions/my'],
      },
    ],
  },
  teacher: {
    ten: 'Giảng viên',
    moTa: 'Quy trình mở lớp, quản lý tài liệu, giao bài tập và chấm điểm học phần.',
    buoc: [
      {
        buocSo: 1,
        tieuDe: 'Khởi tạo lớp học mới',
        noiDung: 'Tạo lớp học với mã học phần, tên môn học, chọn danh mục, tải ảnh bìa riêng và quy định sĩ số tối đa. Hệ thống tự động tạo mã Join Code 6 ký tự ngẫu nhiên.',
        apis: ['POST /api/courses', 'GET /api/courses/my-teaching'],
      },
      {
        buocSo: 2,
        tieuDe: 'Đăng tải học liệu số hóa',
        noiDung: 'Tải tệp PDF/Slide bài giảng thật lên server, nhúng link video YouTube/Vimeo hoặc soạn bài đọc theo từng chương/tuần học.',
        apis: ['POST /api/courses/:id/materials', 'PUT /api/materials/:id'],
      },
      {
        buocSo: 3,
        tieuDe: 'Giao bài tập & Quy định deadline',
        noiDung: 'Tạo bài tập định kỳ, đính kèm file đề bài, thiết lập hạn nộp (deadline), thang điểm 10 và tùy chọn có cho phép sinh viên nộp muộn hay không.',
        apis: ['POST /api/courses/:id/assignments', 'PUT /api/assignments/:id'],
      },
      {
        buocSo: 4,
        tieuDe: 'Chấm điểm bài nộp & Nhận xét',
        noiDung: 'Duyệt danh sách bài nộp, lọc theo bài chờ chấm hoặc bài nộp trễ. Tải bài nộp sinh viên về chấm, nhập điểm số và gửi nhận xét phản hồi.',
        apis: ['GET /api/assignments/:id/submissions', 'PUT /api/submissions/:id/grade'],
      },
      {
        buocSo: 5,
        tieuDe: 'Quản lý bảng điểm & Xuất CSV',
        noiDung: 'Xem danh sách sinh viên ghi danh kèm tiến độ % hoàn thành học liệu. Xuất bảng điểm toàn lớp ra file CSV (UTF-8 BOM) mở trực tiếp bằng Excel tiếng Việt.',
        apis: ['GET /api/courses/:id/students', 'GET /api/courses/:id/gradebook/export'],
      },
    ],
  },
  admin: {
    ten: 'Quản trị viên',
    moTa: 'Quy trình điều hành toàn hệ thống, quản lý người dùng và giám sát CSDL MongoDB.',
    buoc: [
      {
        buocSo: 1,
        tieuDe: 'Quản lý danh mục khóa học',
        noiDung: 'Thêm mới, chỉnh sửa danh mục chuyên ngành đào tạo. Hệ thống có cơ chế kiểm tra toàn vẹn dữ liệu, tự động chặn xóa danh mục đang có lớp học.',
        apis: ['GET /api/categories', 'POST /api/categories', 'DELETE /api/categories/:id'],
      },
      {
        buocSo: 2,
        tieuDe: 'Quản lý người dùng & Phân quyền',
        noiDung: 'Duyệt danh sách toàn bộ tài khoản, tìm kiếm theo email/MSSV, cấp tài khoản mới, đổi vai trò và thực hiện Khóa / Mở khóa tài khoản ngay lập tức.',
        apis: ['GET /api/admin/users', 'POST /api/admin/users', 'PATCH /api/admin/users/:id/status'],
      },
      {
        buocSo: 3,
        tieuDe: 'Giám sát lớp học toàn hệ thống',
        noiDung: 'Theo dõi toàn bộ lớp học của tất cả giảng viên, thay đổi trạng thái lớp (Đang mở, Bản nháp, Đã lưu trữ) và kiểm tra sĩ số ghi danh thực tế.',
        apis: ['GET /api/admin/courses', 'PATCH /api/admin/courses/:id/status'],
      },
      {
        buocSo: 4,
        tieuDe: 'Giám sát CSDL MongoDB Compass',
        noiDung: 'Xem trực tiếp trạng thái kết nối MongoDB, thống kê số bản ghi của cả 8 collection tiếng Việt, xem dữ liệu mẫu và tải file sao lưu JSON.',
        apis: ['GET /api/admin/database/overview', 'GET /api/admin/database/export/:collection'],
      },
    ],
  },
};

export function TrangLoTrinh() {
  const { daDangNhap } = suDungXacThuc();
  const [vaiTroChon, datVaiTroChon] = useState('student');

  const luongHienTai = LUONG_CHI_TIET[vaiTroChon];

  return (
    <div className="main pb-5" style={{ minHeight: '80vh' }}>
      <div className="container">
        {/* Tiêu đề trang */}
        <div className="text-center mb-5">
          <span className="badge bg-danger-subtle text-danger fw-semibold px-3 py-2 rounded-pill mb-2">
            QUY TRÌNH HỌC TẬP CHUẨN
          </span>
          <h1 className="fw-bold mb-3" style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}>
            Lộ Trình Học Tập
          </h1>
          <p className="text-muted mx-auto" style={{ maxWidth: 680, fontSize: '1.05rem', lineHeight: 1.6 }}>
            Trải nghiệm học tập trọn vẹn trong một học kỳ trên EduClass: từ bước tạo tài khoản, ghi danh lớp,
            học tập qua học liệu số hóa đến làm bài tập và nhận đánh giá xếp loại.
          </p>
        </div>

        {/* 4 Bước chung */}
        <div className="row gy-4 mb-5">
          {BON_BUOC_CHUNG.map((buoc) => {
            const BieuTuong = buoc.bieuTuong;
            return (
              <div key={buoc.so} className="col-lg-3 col-md-6 d-flex">
                <div
                  className="card w-100 border rounded-4 shadow-sm p-4 d-flex flex-column"
                  style={{ background: 'var(--otsp-surface)' }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span
                      className="d-inline-flex align-items-center justify-content-center rounded-3"
                      style={{ width: 44, height: 44, backgroundColor: buoc.mauNen, color: buoc.mauChu }}
                    >
                      <BieuTuong size={22} />
                    </span>
                    <span className="h5 fw-bold text-muted mb-0">#{buoc.so}</span>
                  </div>
                  <h3 className="h6 fw-bold mb-2">{buoc.ten}</h3>
                  <p className="text-muted small mb-0 flex-grow-1" style={{ lineHeight: 1.6 }}>
                    {buoc.moTa}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Luồng chi tiết theo vai trò */}
        <div className="card border rounded-4 shadow-sm p-4 p-lg-5 mb-5" style={{ background: 'var(--otsp-surface)' }}>
          <div className="text-center mb-4">
            <h2 className="h4 fw-bold mb-2">Quy Trình Nghiệp Vụ Chi Tiết</h2>
            <p className="text-muted small mb-4">
              Mỗi vai trò đều có luồng làm việc riêng biệt và kết nối trực tiếp với các API endpoint ở backend.
            </p>

            {/* Pills chọn vai trò */}
            <div className="d-inline-flex p-1 rounded-pill border bg-light gap-1">
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-4 py-2 fw-semibold ${vaiTroChon === 'student' ? 'btn-danger shadow-sm' : 'btn-light text-secondary'}`}
                onClick={() => datVaiTroChon('student')}
              >
                Sinh viên
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-4 py-2 fw-semibold ${vaiTroChon === 'teacher' ? 'btn-danger shadow-sm' : 'btn-light text-secondary'}`}
                onClick={() => datVaiTroChon('teacher')}
              >
                Giảng viên
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-4 py-2 fw-semibold ${vaiTroChon === 'admin' ? 'btn-danger shadow-sm' : 'btn-light text-secondary'}`}
                onClick={() => datVaiTroChon('admin')}
              >
                Quản trị viên
              </button>
            </div>
          </div>

          <div className="p-3 bg-light rounded-3 mb-4 text-center">
            <span className="fw-bold text-dark">{luongHienTai.ten}: </span>
            <span className="text-muted small">{luongHienTai.moTa}</span>
          </div>

          {/* Danh sách các bước */}
          <div className="row gy-3">
            {luongHienTai.buoc.map((b) => (
              <div key={b.buocSo} className="col-12">
                <div className="p-3 rounded-3 border d-flex flex-column flex-md-row align-items-start gap-3 bg-white">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 fw-bold bg-danger text-white"
                    style={{ width: 36, height: 36, fontSize: '0.95rem' }}
                  >
                    {b.buocSo}
                  </div>
                  <div className="flex-grow-1 min-w-0">
                    <h4 className="h6 fw-bold mb-1">{b.tieuDe}</h4>
                    <p className="text-muted small mb-2">{b.noiDung}</p>
                    <div className="d-flex flex-wrap gap-2">
                      {b.apis.map((api, i) => (
                        <span key={i} className="badge bg-secondary-subtle text-secondary font-monospace border px-2 py-1" style={{ fontSize: '0.75rem' }}>
                          <code>{api}</code>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Khối tài khoản thử nghiệm */}
        <div className="card rounded-4 border p-4 p-lg-5" style={{ background: 'var(--otsp-surface-subtle)' }}>
          <div className="row align-items-center gy-3">
            <div className="col-lg-8">
              <h3 className="h5 fw-bold mb-2">Trải nghiệm ngay luồng nghiệp vụ trên hệ thống</h3>
              <p className="text-muted small mb-3">
                Đăng nhập bằng tài khoản mẫu để thực hành ghi danh, nộp bài, chấm điểm hoặc quản trị CSDL.
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
