import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Cloud,
  Code2,
  Database,
  FileText,
  GraduationCap,
  Laptop,
  Layers,
  Lock,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
} from 'lucide-react';
import goiApi from '../services/goiApi';
import { suDungXacThuc } from '../context/NguCanhXacThuc';
import { AnhDaiDien, DemSoDong } from '../components/ThanhPhanChung';

const MAU_DANH_MUC = [
  '#ffbb2c',
  '#5578ff',
  '#e80368',
  '#e361ff',
  '#47aeff',
  '#ffa76e',
  '#11dbcf',
  '#4233ff',
];

const DANH_MUC_MAC_DINH = [
  { ten: 'Lập trình Web', moTa: 'MERN Stack, React & Express', bieuTuong: Code2 },
  { ten: 'Công nghệ phần mềm', moTa: 'Thiết kế hệ thống & Kiến trúc', bieuTuong: Laptop },
  { ten: 'Khoa học dữ liệu', moTa: 'Python, Pandas & Machine Learning', bieuTuong: BrainCircuit },
  { ten: 'An toàn thông tin', moTa: 'Bảo mật Web & Xác thực JWT', bieuTuong: Lock },
  { ten: 'Cơ sở dữ liệu', moTa: 'MongoDB, SQL & Schema Design', bieuTuong: Database },
  { ten: 'Điện toán đám mây', moTa: 'DevOps, Docker & RESTful API', bieuTuong: Cloud },
  { ten: 'Cấu trúc dữ liệu', moTa: 'Giải thuật & Tư duy lập trình', bieuTuong: Layers },
  { ten: 'Kỹ năng phần mềm', moTa: 'Git, Agile & Báo cáo kỹ thuật', bieuTuong: Sparkles },
];

const GIANG_VIEN_TIEU_BIEU = [
  {
    ten: 'TS. Nguyễn Hoàng Nam',
    hocVi: 'Tiến sĩ CNTT • Trưởng bộ môn Kỹ thuật Web',
    anh: '/assets/img/trainers/trainer-1.jpg',
    moTa: 'Hơn 12 năm nghiên cứu và giảng dạy các hệ thống phân tán, kiến trúc Web fullstack MERN và tối ưu hóa hiệu năng cơ sở dữ liệu.',
    linhVuc: 'Lập trình Web & Kiến trúc hệ thống',
  },
  {
    ten: 'ThS. Lê Thị Mai Hương',
    hocVi: 'Thạc sĩ An toàn thông tin • ĐH Bách Khoa',
    anh: '/assets/img/trainers/trainer-2.jpg',
    moTa: 'Chuyên gia bảo mật ứng dụng web, kiểm thử xâm nhập và cơ chế xác thực phân quyền dựa trên JSON Web Token & RBAC.',
    linhVuc: 'An toàn & Bảo mật thông tin',
  },
  {
    ten: 'TS. Trần Quốc Bảo',
    hocVi: 'Tiến sĩ Khoa học Máy tính • Trưởng phòng Lab',
    anh: '/assets/img/trainers/trainer-3.jpg',
    moTa: 'Tác giả nhiều bài báo quốc tế về cơ sở dữ liệu phi quan hệ NoSQL, thiết kế chỉ mục MongoDB và khai phá dữ liệu lớn.',
    linhVuc: 'Cơ sở dữ liệu & Khoa học dữ liệu',
  },
];

const ANH_KHOA_HOC_MAC_DINH = [
  '/assets/img/course-1.jpg',
  '/assets/img/course-2.jpg',
  '/assets/img/course-3.jpg',
];

export function TrangChu() {
  const { daDangNhap } = suDungXacThuc();
  const [duLieu, datDuLieu] = useState({
    counts: { studentCount: 0, teacherCount: 0, courseCount: 0, materialCount: 0 },
    featuredCourses: [],
    categories: [],
  });
  const [dangTai, datDangTai] = useState(true);

  useEffect(() => {
    let conHoatDong = true;

    Promise.all([
      goiApi.get('/dashboard/public-summary').catch(() => ({ data: {} })),
      goiApi.get('/categories').catch(() => ({ data: {} })),
    ])
      .then(([resSummary, resCat]) => {
        if (!conHoatDong) return;
        const summary = resSummary.data?.data || {};
        const cats = resCat.data?.data || [];
        datDuLieu({
          counts: summary.counts || { studentCount: 5, teacherCount: 3, courseCount: 6, materialCount: 12 },
          featuredCourses: summary.featuredCourses || [],
          teachers: summary.teachers || [],
          categories: cats,
        });
      })
      .finally(() => {
        if (conHoatDong) datDangTai(false);
      });

    return () => {
      conHoatDong = false;
    };
  }, []);

  const { counts, featuredCourses, categories } = duLieu;

  const danhMucHienThi = categories.length > 0
    ? categories.slice(0, 8).map((cat, idx) => ({
        ten: cat.name,
        moTa: cat.description || 'Chương trình chuẩn đại học',
        bieuTuong: DANH_MUC_MAC_DINH[idx % DANH_MUC_MAC_DINH.length].bieuTuong,
      }))
    : DANH_MUC_MAC_DINH;

  return (
    <div className="main otsp-home">
      {/* ==================== 1. KHỐI HERO (CHUẨN OTSP GIA SƯ) ==================== */}
      <section id="hero" className="hero section dark-background otsp-hero">
        <img
          src="/assets/img/hero-bg.jpg"
          alt="Học tập cùng EduClass"
          width="1920"
          height="1080"
          fetchPriority="high"
          decoding="async"
        />
        <div className="container">
          <div className="otsp-hero-content">
            <h1 className="otsp-hero-title">
              Nơi tri thức hội tụ,<br />
              <span className="otsp-hero-highlight">vững bước tương lai.</span>
            </h1>

            <p>
              Nền tảng lớp học trực tuyến EduClass số hóa toàn diện quy trình giảng dạy và học tập.
              Giảng viên mở lớp và phân phối học liệu PDF &amp; Video; Sinh viên ghi danh, làm bài tập
              và theo dõi tiến độ học tập&nbsp;minh&nbsp;bạch.
            </p>

            <div className="otsp-hero-actions">
              <Link to={daDangNhap ? '/dashboard' : '/explore'} className="btn-hero-primary">
                <span>{daDangNhap ? 'Vào không gian học' : 'Khám phá lớp đang mở'}</span>
                <ArrowRight size={17} className="ms-1" />
              </Link>
              <Link to="/khong-gian" className="btn-hero-secondary">
                <UserCheck size={17} className="me-1" />
                <span>Tìm hiểu các vai trò</span>
              </Link>
            </div>

            <div className="otsp-hero-trust">
              <span>
                <CheckCircle2 size={16} className="text-danger me-1" /> 100% Giảng viên xác minh
              </span>
              <span>
                <FileText size={16} className="text-danger me-1" /> Học liệu chuẩn hóa (PDF &amp; Video)
              </span>
              <span>
                <ShieldCheck size={16} className="text-danger me-1" /> Đánh giá &amp; Chấm điểm minh bạch
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 2. KHỐI GIỚI THIỆU (ABOUT SECTION) ==================== */}
      <section id="about" className="section about">
        <div className="container">
          <div className="row gy-4 align-items-center">
            <div className="col-lg-6 order-1 order-lg-2">
              <div
                className="rounded-4 shadow overflow-hidden"
                style={{ aspectRatio: '4 / 3', width: '100%', backgroundColor: '#f1f5f9' }}
              >
                <img
                  src="/assets/img/about.jpg"
                  className="w-100 h-100"
                  style={{ objectFit: 'cover', display: 'block' }}
                  alt="Về EduClass"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>

            <div className="col-lg-6 order-2 order-lg-1 content">
              <h2 className="fw-bold mb-3">Nền tảng Lớp học Trực tuyến Chuẩn hóa &amp; Toàn diện</h2>
              <p className="fst-italic text-muted">
                EduClass xây dựng không gian học thuật số hóa chuyên nghiệp, kết nối chặt chẽ giữa
                Giảng viên, Sinh viên và Quản trị viên nhà trường trên cùng một hệ thống duy nhất.
              </p>
              <ul className="list-unstyled">
                <li className="d-flex align-items-start gap-2 mb-3">
                  <CheckCircle2 size={20} className="text-danger flex-shrink-0 mt-1" />
                  <span>
                    <strong>100% Khóa học chuẩn tín chỉ:</strong> Được giảng viên thiết kế theo đề cương chi tiết, phân chia bài học theo chương mục khoa học.
                  </span>
                </li>
                <li className="d-flex align-items-start gap-2 mb-3">
                  <CheckCircle2 size={20} className="text-danger flex-shrink-0 mt-1" />
                  <span>
                    <strong>Học liệu số hóa phong phú:</strong> Tích hợp đọc trực tiếp tệp PDF bài giảng, nhúng video bài học và liên kết tài liệu đọc mở rộng.
                  </span>
                </li>
                <li className="d-flex align-items-start gap-2 mb-4">
                  <CheckCircle2 size={20} className="text-danger flex-shrink-0 mt-1" />
                  <span>
                    <strong>Quản lý tiến độ minh bạch:</strong> Tự động tính phần trăm tiến độ học tập, cảnh báo hạn nộp bài tập &lt; 48h và xuất bảng điểm CSV.
                  </span>
                </li>
              </ul>
              <Link to="/khong-gian" className="btn btn-otsp">
                <span>Khám phá 3 không gian vai trò</span>
                <ArrowRight size={16} className="ms-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 3. KHỐI CON SỐ THỐNG KÊ (COUNTS) ==================== */}
      <section id="counts" className="section counts light-background">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-3 col-md-6">
              <div className="stats-card d-flex align-items-center gap-3">
                <Users size={32} className="text-danger flex-shrink-0" />
                <div>
                  <div className="stats-number">
                    <DemSoDong giaTriMucTieu={counts.studentCount || 5} />
                  </div>
                  <div className="stats-label">Sinh viên đang học</div>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="stats-card d-flex align-items-center gap-3">
                <BookOpen size={32} className="text-danger flex-shrink-0" />
                <div>
                  <div className="stats-number">
                    <DemSoDong giaTriMucTieu={counts.courseCount || 6} />
                  </div>
                  <div className="stats-label">Lớp học đang mở</div>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="stats-card d-flex align-items-center gap-3">
                <FileText size={32} className="text-danger flex-shrink-0" />
                <div>
                  <div className="stats-number">
                    <DemSoDong giaTriMucTieu={counts.materialCount || 12} />
                  </div>
                  <div className="stats-label">Học liệu PDF &amp; Video</div>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="stats-card d-flex align-items-center gap-3">
                <GraduationCap size={32} className="text-danger flex-shrink-0" />
                <div>
                  <div className="stats-number">
                    <DemSoDong giaTriMucTieu={counts.teacherCount || 3} />
                  </div>
                  <div className="stats-label">Giảng viên phụ trách</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 4. KHỐI VÌ SAO CHỌN EDUCLASS (WHY-US) ==================== */}
      <section id="why-us" className="section why-us">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-4">
              <div className="why-box">
                <div>
                  <h2 className="text-white fw-bold mb-3" style={{ fontSize: 'clamp(22px, 2.8vw, 28px)', lineHeight: 1.25 }}>
                    Vì sao giảng viên &amp; sinh viên tin chọn EduClass?
                  </h2>
                  <p>
                    EduClass số hóa toàn bộ trải nghiệm lớp học: từ tạo lớp, đăng tải học liệu,
                    giao nộp bài tập đến chấm điểm và xếp loại học lực, đáp ứng chặt chẽ yêu cầu
                    quản lý đào tạo hiện đại.
                  </p>
                </div>
                <div>
                  <Link to="/lo-trinh" className="more-btn">
                    <span>Xem lộ trình học tập</span>
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-lg-8 d-flex align-items-stretch">
              <div className="row gy-4 w-100">
                <div className="col-xl-4 col-md-4">
                  <div className="icon-box">
                    <ShieldCheck size={28} className="text-danger mb-3" />
                    <h3>Giảng viên chọn lọc</h3>
                    <p>Đội ngũ giảng viên trình độ cao, giáo trình chuẩn hóa và bài giảng cập nhật liên tục.</p>
                  </div>
                </div>
                <div className="col-xl-4 col-md-4">
                  <div className="icon-box">
                    <BookOpen size={28} className="text-danger mb-3" />
                    <h3>Học tập linh hoạt</h3>
                    <p>Chủ động học mọi lúc mọi nơi qua tài liệu PDF, video bài giảng và thảo luận trực tiếp.</p>
                  </div>
                </div>
                <div className="col-xl-4 col-md-4">
                  <div className="icon-box">
                    <Award size={28} className="text-danger mb-3" />
                    <h3>Đánh giá minh bạch</h3>
                    <p>Chấm bài tập theo thang điểm 10, nhận xét chi tiết và xuất báo cáo điểm số chuẩn xác.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 5. KHỐI DANH MỤC ĐÀO TẠO (FEATURES) ==================== */}
      <section id="features" className="section features">
        <div className="container section-title">
          <h2>DANH MỤC ĐÀO TẠO</h2>
          <p>Chuyên ngành &amp; Lĩnh vực học tập phổ biến</p>
        </div>

        <div className="container">
          <div className="row gy-4">
            {danhMucHienThi.map((dm, idx) => {
              const IconComp = dm.bieuTuong || Code2;
              const color = MAU_DANH_MUC[idx % MAU_DANH_MUC.length];
              return (
                <div key={dm.ten} className="col-lg-3 col-md-4 col-sm-6">
                  <div className="features-item">
                    <IconComp
                      size={22}
                      className="me-3 flex-shrink-0"
                      style={{ color }}
                    />
                    <div className="min-w-0">
                      <h3 className="text-truncate">
                        <Link to={`/explore?category=${encodeURIComponent(dm.ten)}`} className="stretched-link">
                          {dm.ten}
                        </Link>
                      </h3>
                      <div className="small text-muted text-truncate">{dm.moTa}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== 6. KHỐI LỚP HỌC ĐANG MỞ (COURSES) ==================== */}
      <section id="courses" className="section courses">
        <div className="container section-title">
          <h2>LỚP HỌC ĐANG MỞ</h2>
          <p>Các lớp học chất lượng cao sẵn sàng nhận học viên</p>
        </div>

        <div className="container">
          <div className="row gy-4">
            {(featuredCourses.length > 0 ? featuredCourses.slice(0, 3) : []).map((lop, idx) => {
              const anhBia = lop.thumbnailUrl || ANH_KHOA_HOC_MAC_DINH[idx % ANH_KHOA_HOC_MAC_DINH.length];
              return (
                <div key={lop._id || idx} className="col-lg-4 col-md-6 d-flex align-items-stretch">
                  <div className="course-item w-100">
                    <div className="course-image-wrap position-relative">
                      <img src={anhBia} alt={lop.title} loading="lazy" />
                      <span className="badge-ma-lop">{lop.code}</span>
                    </div>

                    <div className="course-content">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="category">{lop.category?.name || 'Công nghệ thông tin'}</span>
                        <span className="ma-tham-gia-text">Mã: <code>{lop.joinCode}</code></span>
                      </div>

                      <h3>
                        <Link to={daDangNhap ? `/courses/${lop._id}` : '/login'}>
                          {lop.title}
                        </Link>
                      </h3>

                      <p className="description">
                        {lop.description || 'Khóa học cung cấp đầy đủ bài giảng lý thuyết, tài liệu thực hành và bài tập định kỳ.'}
                      </p>

                      <div className="trainer">
                        <div className="trainer-profile">
                          <AnhDaiDien
                            ten={lop.teacher?.fullName}
                            mauNen={lop.teacher?.avatarColor || '#DB303A'}
                            kichThuoc={38}
                            anh={lop.teacher?.avatarUrl}
                          />
                          <Link to="/explore" className="trainer-link">
                            {lop.teacher?.fullName || 'Giảng viên phụ trách'}
                          </Link>
                        </div>
                        <div className="trainer-rank">
                          <Users size={16} className="user-icon" />
                          <span>{lop.studentCount || 0}/{lop.maxStudents || 60} SV</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-5">
            <Link to="/explore" className="btn btn-otsp px-4 py-2">
              <span>Xem tất cả khóa học đang mở</span>
              <ArrowRight size={16} className="ms-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== 7. KHỐI GIẢNG VIÊN TIÊU BIỂU (TRAINERS) ==================== */}
      <section id="trainers" className="section trainers-index">
        <div className="container section-title">
          <h2>GIẢNG VIÊN TIÊU BIỂU</h2>
          <p>Đội ngũ giảng viên tâm huyết &amp; giàu kinh nghiệm thực tiễn</p>
        </div>

        <div className="container">
          <div className="row gy-4">
            {(duLieu.teachers?.length > 0 ? duLieu.teachers : GIANG_VIEN_TIEU_BIEU).map((gv, idx) => {
              const anhGv = gv.avatarUrl || gv.anh || `/assets/img/trainers/trainer-${(idx % 3) + 1}.jpg`;
              const tenGv = gv.fullName || gv.ten;
              const hocVi = gv.department || gv.hocVi || 'Giảng viên Khoa CNTT';
              const moTa = gv.bio || gv.moTa || 'Giảng viên giàu kinh nghiệm, phụ trách giảng dạy và cố vấn chuyên môn tại EduClass.';
              const linhVuc = gv.department || gv.linhVuc || 'Công nghệ thông tin';
              return (
                <div key={gv._id || tenGv} className="col-lg-4 col-md-6 d-flex align-items-stretch">
                  <div className="member w-100">
                    <div className="member-img-wrap" style={{ height: 260, overflow: 'hidden' }}>
                      <img
                        src={anhGv}
                        className="w-100 h-100 object-fit-cover"
                        alt={tenGv}
                        loading="lazy"
                      />
                    </div>
                    <div className="member-content">
                      <h3 className="h5 fw-bold mb-1">{tenGv}</h3>
                      <span>{hocVi}</span>
                      <p>{moTa}</p>
                      <div className="mt-3 pt-2 border-top">
                        <span className="badge rounded-pill bg-danger-subtle text-danger fw-semibold px-3 py-1">
                          {linhVuc}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== 8. KHỐI TÀI KHOẢN MẪU & KẾT NỐI (CTA) ==================== */}
      <section id="cta" className="section cta-section light-background py-5">
        <div className="container">
          <div className="cta-card p-4 p-lg-5 rounded-4 shadow-sm">
            <div className="row align-items-center gy-4">
              <div className="col-lg-8">
                <h2 className="fw-bold mb-2" style={{ color: 'var(--otsp-text-main)' }}>
                  Trải nghiệm hệ thống ngay hôm nay
                </h2>
                <p className="text-muted mb-3" style={{ maxWidth: 640 }}>
                  Hệ thống đã chuẩn bị sẵn tài khoản cho 3 vai trò mẫu (mật khẩu chung <code>EduClass@2026</code>).
                  Màn hình đăng nhập hỗ trợ 1-click điền nhanh để kiểm thử đầy đủ nghiệp vụ.
                </p>
                <div className="d-flex flex-wrap gap-2">
                  <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-2">
                    Quản trị viên: admin@educlass.vn
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
                <Link to={daDangNhap ? '/dashboard' : '/login'} className="btn btn-otsp btn-lg px-4 py-3">
                  <span>{daDangNhap ? 'Vào bảng điều khiển' : 'Đăng nhập ngay'}</span>
                  <ArrowRight size={18} className="ms-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
