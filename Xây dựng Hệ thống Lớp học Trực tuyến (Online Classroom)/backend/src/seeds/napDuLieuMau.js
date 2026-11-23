require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const User = require('../models/NguoiDung');
const Category = require('../models/DanhMuc');
const Course = require('../models/KhoaHoc');
const Material = require('../models/TaiLieu');
const Enrollment = require('../models/GhiDanh');
const Assignment = require('../models/BaiTap');
const Submission = require('../models/BaiNop');
const Announcement = require('../models/ThongBaoLop');

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/HeThongLopHocTrucTuyen';

const taoTepPdfDonGian = (tieuDe, cacDong) => {
  const locKyTu = (chuoi) =>
    chuoi.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

  const lenhVeChu = [
    'BT',
    '/F1 18 Tf',
    '54 750 Td',
    `(${locKyTu(tieuDe)}) Tj`,
    '/F1 11 Tf',
    '0 -28 Td',
    ...cacDong.flatMap((dong) => [`(${locKyTu(dong)}) Tj`, '0 -18 Td']),
    'ET',
  ].join('\n');

  const cacDoiTuong = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n',
    `4 0 obj\n<< /Length ${Buffer.byteLength(lenhVeChu, 'utf8')} >>\nstream\n${lenhVeChu}\nendstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
  ];

  let noiDungPdf = '%PDF-1.4\n';
  const viTri = [0];
  for (const dt of cacDoiTuong) {
    viTri.push(Buffer.byteLength(noiDungPdf, 'utf8'));
    noiDungPdf += dt;
  }

  const viTriXref = Buffer.byteLength(noiDungPdf, 'utf8');
  noiDungPdf += `xref\n0 ${cacDoiTuong.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= cacDoiTuong.length; i += 1) {
    noiDungPdf += `${String(viTri[i]).padStart(10, '0')} 00000 n \n`;
  }
  noiDungPdf += `trailer\n<< /Size ${cacDoiTuong.length + 1} /Root 1 0 R >>\nstartxref\n${viTriXref}\n%%EOF\n`;
  return Buffer.from(noiDungPdf, 'utf8');
};

const damBaoTepTaiLenMau = () => {
  const gocUpload = path.join(__dirname, '..', '..', 'uploads');
  ['materials', 'assignments', 'submissions', 'courses'].forEach((tenThuMuc) => {
    const dayDu = path.join(gocUpload, tenThuMuc);
    fs.mkdirSync(dayDu, { recursive: true });
    fs.writeFileSync(path.join(dayDu, '.gitkeep'), '');
  });

  const dsTepMau = [
    {
      tenTep: 'sample-mern-syllabus.pdf',
      tieuDe: 'WEB401 - De cuong hoc phan Lap trinh Web MERN Stack',
      cacDong: [
        'Giang vien phu trach: TS. Nguyen Hoang Nam',
        'Hoc ky: HK1 2026 - 2027 | Nen tang: Lop hoc truc tuyen EduClass',
        '-----------------------------------------------------------------------',
        '1. Muc tieu hoc phan:',
        '   - Lam chu kien truc 4 tang: Routes - Controllers - Services - Models.',
        '   - Ap dung xac thuc JWT va phan quyen 3 vai tro (Admin, Teacher, Student).',
        '2. Co cau danh gia: Thuc hanh 30% | Giua ky 20% | Do an cuoi ky 50%.',
      ],
    },
    {
      tenTep: 'sample-rest-api-guide.pdf',
      tieuDe: 'Huong dan thiet ke RESTful API & Service Layer voi Express',
      cacDong: [
        'Tai lieu tuan 2 - Lop WEB401',
        '-----------------------------------------------------------------------',
        'Cac endpoint cot loi:',
        '  GET/POST/PUT/DELETE /api/courses (ho tro upload anh bia)',
        '  POST /api/enrollments (ghi danh bang courseId hoac joinCode)',
        '  POST /api/assignments/:id/submit (nop van ban hoac tep dinh kem)',
        '  GET  /api/courses/:id/gradebook/export (xuat bang diem CSV UTF-8)',
      ],
    },
    {
      tenTep: 'sample-mongodb-indexing.pdf',
      tieuDe: 'DB204 - Thiet ke Schema Mongoose va Toi uu Index MongoDB',
      cacDong: [
        'Giang vien: ThS. Le Thi Phuong Linh',
        '-----------------------------------------------------------------------',
        '1. Compound Unique Index cho enrollments { student: 1, course: 1 }.',
        '2. Compound Unique Index cho submissions { assignment: 1, student: 1 }.',
        '3. Dung Aggregation Pipeline de tranh loi N+1 query.',
      ],
    },
    {
      tenTep: 'sample-react-bootstrap-guide.pdf',
      tieuDe: 'WEB305 - Ket hop React Hooks, Context API va Bootstrap 5',
      cacDong: [
        'Tai lieu thuc hanh - Lop WEB305',
        '-----------------------------------------------------------------------',
        '1. Quan ly xac thuc tap trung bang AuthContext (React Context API).',
        '2. Ho tro giao dien Sang/Toi bang thuoc tinh data-bs-theme cua Bootstrap 5.',
        '3. Tach khung khach (AOS, Animate.css, tsParticles) va khung lam viec Sidebar.',
      ],
    },
  ];

  const kichThuoc = {};
  dsTepMau.forEach((tep) => {
    const duongDan = path.join(gocUpload, 'materials', tep.tenTep);
    const boDem = taoTepPdfDonGian(tep.tieuDe, tep.cacDong);
    fs.writeFileSync(duongDan, boDem);
    kichThuoc[tep.tenTep] = boDem.length;
  });
  return kichThuoc;
};

const cachNgay = (soNgay) => new Date(Date.now() + soNgay * 24 * 60 * 60 * 1000);
const cachGio = (soGio) => new Date(Date.now() + soGio * 60 * 60 * 1000);

const napDuLieuMau = async () => {
  try {
    const kichThuocTep = damBaoTepTaiLenMau();
    await mongoose.connect(MONGODB_URI);
    console.log(`[Seed] Da ket noi: ${MONGODB_URI}`);

    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Course.deleteMany({}),
      Material.deleteMany({}),
      Enrollment.deleteMany({}),
      Assignment.deleteMany({}),
      Submission.deleteMany({}),
      Announcement.deleteMany({}),
    ]);

    const dsNguoiDung = await User.create([
      {
        fullName: 'Trần Quốc Bảo',
        email: 'admin@educlass.vn',
        password: 'EduClass@2026',
        role: 'admin',
        status: 'active',
        studentCode: 'AD001',
        department: 'Phòng Đào tạo & Hệ thống',
        bio: 'Quản trị viên hệ thống lớp học trực tuyến EduClass.',
        avatarColor: '#DB303A',
        avatarUrl: '/images/vai-tro-quan-tri.jpg',
      },
      {
        fullName: 'TS. Nguyễn Hoàng Nam',
        email: 'giangvien@educlass.vn',
        password: 'EduClass@2026',
        role: 'teacher',
        status: 'active',
        studentCode: 'GV101',
        department: 'Bộ môn Công nghệ Phần mềm',
        bio: 'Giảng dạy phát triển ứng dụng Web Full-stack, Node.js và kiến trúc hệ thống.',
        avatarColor: '#B7212B',
        avatarUrl: '/assets/img/trainers/trainer-1.jpg',
      },
      {
        fullName: 'ThS. Lê Thị Phương Linh',
        email: 'linh.gv@educlass.vn',
        password: 'EduClass@2026',
        role: 'teacher',
        status: 'active',
        studentCode: 'GV102',
        department: 'Bộ môn Hệ thống Thông tin',
        bio: 'Chuyên sâu cơ sở dữ liệu quan hệ, MongoDB và tối ưu hiệu năng truy vấn.',
        avatarColor: '#0284C7',
        avatarUrl: '/assets/img/trainers/trainer-2.jpg',
      },
      {
        fullName: 'ThS. Phạm Quang Huy',
        email: 'huy.gv@educlass.vn',
        password: 'EduClass@2026',
        role: 'teacher',
        status: 'active',
        studentCode: 'GV103',
        department: 'Bộ môn Khoa học Dữ liệu',
        bio: 'Phụ trách các học phần phân tích dữ liệu và trực quan hóa bằng Python.',
        avatarColor: '#D97706',
        avatarUrl: '/assets/img/trainers/trainer-3.jpg',
      },
      {
        fullName: 'Trần Minh Tuấn',
        email: 'sinhvien@educlass.vn',
        password: 'EduClass@2026',
        role: 'student',
        status: 'active',
        studentCode: 'SV2026001',
        department: 'Kỹ thuật phần mềm K22',
        bio: 'Sinh viên năm 3, định hướng phát triển Web Full-stack với JavaScript.',
        avatarColor: '#DB303A',
        avatarUrl: '/images/vai-tro-sinh-vien.jpg',
      },
      {
        fullName: 'Nguyễn Ngọc An',
        email: 'an.sv@educlass.vn',
        password: 'EduClass@2026',
        role: 'student',
        status: 'active',
        studentCode: 'SV2026002',
        department: 'Kỹ thuật phần mềm K22',
        avatarColor: '#166534',
        avatarUrl: '/assets/img/trainers/trainer-2-2.jpg',
      },
      {
        fullName: 'Lê Đăng Khoa',
        email: 'khoa.sv@educlass.vn',
        password: 'EduClass@2026',
        role: 'student',
        status: 'active',
        studentCode: 'SV2026003',
        department: 'Hệ thống thông tin K22',
        avatarColor: '#0284C7',
        avatarUrl: '/assets/img/trainers/trainer-1-2.jpg',
      },
      {
        fullName: 'Phạm Thảo Nhi',
        email: 'nhi.sv@educlass.vn',
        password: 'EduClass@2026',
        role: 'student',
        status: 'active',
        studentCode: 'SV2026004',
        department: 'Khoa học máy tính K22',
        avatarColor: '#9333EA',
        avatarUrl: '/assets/img/trainers/trainer-2.jpg',
      },
      {
        fullName: 'Vũ Hữu Đức',
        email: 'duc.sv@educlass.vn',
        password: 'EduClass@2026',
        role: 'student',
        status: 'active',
        studentCode: 'SV2026005',
        department: 'Kỹ thuật phần mềm K22',
        avatarColor: '#D97706',
        avatarUrl: '/assets/img/trainers/trainer-3-2.jpg',
      },
      {
        fullName: 'Hoàng Văn Bình',
        email: 'locked.sv@educlass.vn',
        password: 'EduClass@2026',
        role: 'student',
        status: 'locked',
        studentCode: 'SV2026006',
        department: 'Mạng máy tính K21',
        bio: 'Tài khoản mẫu đang ở trạng thái khóa để kiểm thử chức năng Quản trị viên.',
        avatarColor: '#475569',
        avatarUrl: '/assets/img/trainers/trainer-3.jpg',
      },
    ]);

    const [quanTri, gvNam, gvLinh, gvHuy, svTuan, svAn, svKhoa, svNhi, svDuc] = dsNguoiDung;

    const dsDanhMuc = await Category.create([
      {
        name: 'Lập trình Web',
        description: 'Frontend React, Bootstrap 5, Backend Node.js/Express và kiến trúc Full-stack.',
        accentColor: '#DB303A',
        createdBy: quanTri._id,
      },
      {
        name: 'Cơ sở dữ liệu',
        description: 'Thiết kế lược đồ, MongoDB NoSQL, SQL nâng cao và tối ưu truy vấn.',
        accentColor: '#0284C7',
        createdBy: quanTri._id,
      },
      {
        name: 'Khoa học dữ liệu',
        description: 'Phân tích dữ liệu thực nghiệm, thống kê ứng dụng và trực quan hóa.',
        accentColor: '#D97706',
        createdBy: quanTri._id,
      },
      {
        name: 'An toàn & Bảo mật',
        description: 'Xác thực JWT, OAuth2, phân quyền RBAC và phòng chống lỗ hổng Web.',
        accentColor: '#9333EA',
        createdBy: quanTri._id,
      },
      {
        name: 'Kỹ thuật phần mềm',
        description: 'Thiết kế kiến trúc, quy trình Git, kiểm thử tự động và triển khai hệ thống.',
        accentColor: '#166534',
        createdBy: quanTri._id,
      },
    ]);

    const [dmWeb, dmCsdl, dmKhdl, dmBaoMat, dmKtpm] = dsDanhMuc;

    const dsKhoaHoc = await Course.create([
      {
        title: 'Phát triển Ứng dụng Web với MERN Stack',
        code: 'WEB401',
        description:
          'Xây dựng ứng dụng web hoàn chỉnh từ thiết kế lược đồ MongoDB, tổ chức RESTful API tách lớp Routes–Controllers–Services bằng Express.js đến giao diện React hiện đại có xác thực JWT và phân quyền theo vai trò.',
        syllabusSummary:
          'Tuần 1-2: Node.js & Express • Tuần 3-4: MongoDB & Mongoose • Tuần 5-7: JWT Auth, Upload & RBAC • Tuần 8-10: React Hooks, Context API & Đồ án.',
        category: dmWeb._id,
        teacher: gvNam._id,
        semester: 'HK1 2026 - 2027',
        schedule: 'Thứ 3 & Thứ 5 • 18:30 - 20:30',
        joinCode: 'MERN26',
        bannerColor: '#DB303A',
        thumbnailUrl: '/images/bia-web-mern.jpg',
        status: 'published',
        maxStudents: 45,
      },
      {
        title: 'Thiết kế Giao diện Hiện đại với React & Bootstrap 5',
        code: 'WEB305',
        description:
          'Làm chủ bố cục responsive bằng Bootstrap 5 kết hợp hệ thống thành phần tái sử dụng trên React, hỗ trợ chế độ Sáng/Tối và tối ưu trải nghiệm học tập.',
        syllabusSummary:
          'Tuần 1-2: Hệ lưới & Biến CSS Bootstrap 5 • Tuần 3-4: React Router & Form UX • Tuần 5-6: Context API & Giao diện Sáng/Tối.',
        category: dmWeb._id,
        teacher: gvNam._id,
        semester: 'HK1 2026 - 2027',
        schedule: 'Thứ 2 & Thứ 4 • 14:00 - 16:00',
        joinCode: 'REACT5',
        bannerColor: '#B7212B',
        thumbnailUrl: '/images/bia-react-ui.jpg',
        status: 'published',
        maxStudents: 50,
      },
      {
        title: 'Cơ sở dữ liệu NoSQL & Tối ưu hóa MongoDB',
        code: 'DB204',
        description:
          'Thực hành thiết kế document schema chuẩn thực tế, sử dụng Aggregation Pipeline, đánh chỉ mục (Indexing) và giám sát trực quan trên MongoDB Compass.',
        syllabusSummary:
          'Tuần 1-2: Mô hình Document & CRUD • Tuần 3-4: Schema Design • Tuần 5-6: Aggregation & Compound Index.',
        category: dmCsdl._id,
        teacher: gvLinh._id,
        semester: 'HK1 2026 - 2027',
        schedule: 'Thứ 4 & Thứ 6 • 08:00 - 10:00',
        joinCode: 'MONGO4',
        bannerColor: '#0284C7',
        thumbnailUrl: '/images/bia-mongodb.jpg',
        status: 'published',
        maxStudents: 40,
      },
      {
        title: 'Bảo mật Ứng dụng Web & Xác thực JWT thực chiến',
        code: 'SEC202',
        description:
          'Nắm vững cơ chế mã hóa mật khẩu bằng bcrypt, cấu trúc JSON Web Token, bảo vệ API khỏi XSS/CSRF/Injection và thiết kế kiểm soát truy cập nhiều vai trò.',
        syllabusSummary: 'Tuần 1-2: OWASP Top 10 • Tuần 3-4: JWT & Middleware phân quyền.',
        category: dmBaoMat._id,
        teacher: gvNam._id,
        semester: 'HK1 2026 - 2027',
        schedule: 'Thứ 7 • 08:30 - 11:30',
        joinCode: 'SEC202',
        bannerColor: '#7C3AED',
        thumbnailUrl: '/images/bia-security.jpg',
        status: 'published',
        maxStudents: 35,
      },
      {
        title: 'Phân tích Dữ liệu Ứng dụng với Python',
        code: 'DS310',
        description:
          'Làm sạch, tổng hợp và khám phá bộ dữ liệu thực tế bằng Pandas, NumPy và xây dựng báo cáo trực quan hỗ trợ ra quyết định.',
        syllabusSummary: 'Tuần 1-3: Tiền xử lý dữ liệu • Tuần 4-6: Phân tích khám phá (EDA).',
        category: dmKhdl._id,
        teacher: gvHuy._id,
        semester: 'HK1 2026 - 2027',
        schedule: 'Thứ 3 & Thứ 5 • 09:00 - 11:00',
        joinCode: 'DATA31',
        bannerColor: '#D97706',
        thumbnailUrl: '/images/bia-data-science.jpg',
        status: 'published',
        maxStudents: 45,
      },
      {
        title: 'Kiến trúc Phần mềm & Triển khai CI/CD',
        code: 'SE409',
        description:
          'Khóa học bản nháp chuẩn bị cho học kỳ sau: tách dịch vụ, viết kiểm thử tích hợp API và cấu hình GitHub Actions.',
        syllabusSummary: 'Đang hoàn thiện đề cương chi tiết.',
        category: dmKtpm._id,
        teacher: gvLinh._id,
        semester: 'HK2 2026 - 2027',
        schedule: 'Dự kiến Thứ 6 • 18:30 - 21:00',
        joinCode: 'CICD09',
        bannerColor: '#166534',
        thumbnailUrl: '/images/bia-software-eng.jpg',
        status: 'draft',
        maxStudents: 30,
      },
    ]);

    const [lopMern, lopReact, lopMongo, lopBaoMat, lopDuLieu] = dsKhoaHoc;

    const tlMern = await Material.create([
      {
        course: lopMern._id,
        createdBy: gvNam._id,
        moduleTitle: 'Tuần 1: Tổng quan kiến trúc MERN',
        title: 'Đề cương học phần & Lộ trình đồ án MERN Stack (PDF)',
        type: 'pdf',
        description: 'Tài liệu trình bày mục tiêu học phần, tỷ lệ chấm điểm và các công cụ cần cài đặt.',
        fileUrl: '/uploads/materials/sample-mern-syllabus.pdf',
        fileName: 'De-cuong-hoc-phan-WEB401-MERN.pdf',
        fileSize: kichThuocTep['sample-mern-syllabus.pdf'],
        durationMinutes: 15,
        order: 1,
      },
      {
        course: lopMern._id,
        createdBy: gvNam._id,
        moduleTitle: 'Tuần 1: Tổng quan kiến trúc MERN',
        title: 'Video bài giảng: Tổ chức 4 tầng Backend Routes - Controllers - Services - Models',
        type: 'video',
        description: 'Giải thích luồng HTTP Request đi qua Express Middleware, Controller, Service và Model.',
        videoUrl: 'https://www.youtube.com/watch?v=Oe421EPjeBE',
        durationMinutes: 35,
        order: 2,
      },
      {
        course: lopMern._id,
        createdBy: gvNam._id,
        moduleTitle: 'Tuần 2: RESTful API & Xử lý lỗi tập trung',
        title: 'Hướng dẫn thiết kế RESTful API & Service Layer (PDF)',
        type: 'pdf',
        description: 'Quy ước mã trạng thái HTTP, thiết kế lớp LoiUngDung và phản hồi JSON nhất quán.',
        fileUrl: '/uploads/materials/sample-rest-api-guide.pdf',
        fileName: 'Huong-dan-RESTful-API-Express.pdf',
        fileSize: kichThuocTep['sample-rest-api-guide.pdf'],
        durationMinutes: 25,
        order: 3,
      },
      {
        course: lopMern._id,
        createdBy: gvNam._id,
        moduleTitle: 'Tuần 2: RESTful API & Xử lý lỗi tập trung',
        title: 'Bài đọc: Hiểu đúng về JWT, bcrypt và phân quyền 3 vai trò (RBAC)',
        type: 'reading',
        description: 'Tóm tắt luồng xác thực Bearer Token và những lỗi bảo mật thường gặp.',
        content: `1. Tại sao không bao giờ lưu mật khẩu dạng chữ thuần?
Khi người dùng đăng ký, mật khẩu phải được băm một chiều bằng bcrypt với salt rounds >= 10 ngay trong Mongoose pre-save hook.

2. Cấu trúc JWT trong hệ thống EduClass
Payload của token chỉ chứa thông tin tối thiểu (id, role). Client gửi header:
Authorization: Bearer <token>

3. Tách riêng tầng Controller và Service theo vai trò
Controller chỉ xử lý HTTP (req/res), còn Service giữ toàn bộ logic nghiệp vụ (kiểm tra sĩ số, kiểm tra quyền sở hữu lớp, tính điểm trung bình) nên rất dễ viết unit test và bảo trì.`,
        durationMinutes: 20,
        order: 4,
      },
      {
        course: lopMern._id,
        createdBy: gvNam._id,
        moduleTitle: 'Tuần 3: Kết nối React với Backend API',
        title: 'Video thực hành: Cấu hình Axios Interceptor và Context API cho Auth',
        type: 'video',
        description: 'Hướng dẫn tự động gắn JWT vào mọi request và xử lý tự đăng xuất khi gặp lỗi 401/403.',
        videoUrl: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
        durationMinutes: 40,
        order: 5,
      },
    ]);

    const tlReact = await Material.create([
      {
        course: lopReact._id,
        createdBy: gvNam._id,
        moduleTitle: 'Chương 1: Hệ thống lưới & Chế độ Sáng/Tối Bootstrap 5',
        title: 'Tài liệu thực hành: Tùy biến chủ đề Bootstrap 5 & Dark Mode (PDF)',
        type: 'pdf',
        description: 'Cách dùng data-bs-theme kết hợp biến CSS tùy biến để giao diện đồng bộ cả hai chế độ.',
        fileUrl: '/uploads/materials/sample-react-bootstrap-guide.pdf',
        fileName: 'Tuy-bien-Bootstrap5-React.pdf',
        fileSize: kichThuocTep['sample-react-bootstrap-guide.pdf'],
        durationMinutes: 20,
        order: 1,
      },
      {
        course: lopReact._id,
        createdBy: gvNam._id,
        moduleTitle: 'Chương 2: Quản lý trạng thái & Bố cục Responsive',
        title: 'Bài đọc: Tách khung Khách (Landing) và khung làm việc Sidebar sau đăng nhập',
        type: 'reading',
        description: 'Tránh lặp thanh điều hướng ngang khi người dùng đã đăng nhập vào khu làm việc.',
        content: `Khi tách bố cục ứng dụng web có đăng nhập:
- Khách chưa đăng nhập thấy trang giới thiệu với hiệu ứng AOS, Animate.css, tsParticles và thanh điều hướng ngang trên Header.
- Khi đã đăng nhập, toàn bộ menu theo vai trò dồn gọn vào Sidebar bên trái; Header chỉ giữ nút đóng/mở Sidebar, chuyển Sáng/Tối và menu tài khoản.`,
        durationMinutes: 15,
        order: 2,
      },
      {
        course: lopReact._id,
        createdBy: gvNam._id,
        moduleTitle: 'Chương 2: Quản lý trạng thái & Bố cục Responsive',
        title: 'Video: React Router v6 & Tuyến bảo vệ theo vai trò',
        type: 'video',
        description: 'Cách tổ chức route công khai và route riêng cho Sinh viên, Giảng viên, Quản trị viên.',
        videoUrl: 'https://www.youtube.com/watch?v=Ul3y1LXxzdU',
        durationMinutes: 28,
        order: 3,
      },
    ]);

    const tlMongo = await Material.create([
      {
        course: lopMongo._id,
        createdBy: gvLinh._id,
        moduleTitle: 'Tuần 1: Lược đồ Mongoose & Chỉ mục',
        title: 'Slide tổng hợp: Schema Design & Compound Index MongoDB (PDF)',
        type: 'pdf',
        description: 'Phân tích bài toán chọn Embedded Document hay ObjectId Reference trong hệ thống lớp học.',
        fileUrl: '/uploads/materials/sample-mongodb-indexing.pdf',
        fileName: 'DB204-MongoDB-Schema-Indexing.pdf',
        fileSize: kichThuocTep['sample-mongodb-indexing.pdf'],
        durationMinutes: 25,
        order: 1,
      },
      {
        course: lopMongo._id,
        createdBy: gvLinh._id,
        moduleTitle: 'Tuần 2: Aggregation Pipeline',
        title: 'Bài đọc: Tổng hợp thống kê lớp học bằng $match và $group',
        type: 'reading',
        description: 'Ví dụ thực tế đếm số sinh viên ghi danh trong một lần truy vấn duy nhất.',
        content: `Thay vì lặp từng khóa học và gọi countDocuments nhiều lần, gom toàn bộ mảng ID khóa học vào một lệnh aggregate:
Enrollment.aggregate([
  { $match: { course: { $in: mangId }, status: 'active' } },
  { $group: { _id: '$course', count: { $sum: 1 } } }
])`,
        durationMinutes: 18,
        order: 2,
      },
    ]);

    await Material.create([
      {
        course: lopBaoMat._id,
        createdBy: gvNam._id,
        moduleTitle: 'Chủ đề 1: Xác thực & Phân quyền API',
        title: 'Bài đọc: Danh sách kiểm tra bảo mật trước khi đẩy đồ án lên GitHub',
        type: 'reading',
        description: 'Những sai lầm phổ biến nhất cần tránh khi commit mã nguồn MERN Stack.',
        content: `Trước khi git push, kiểm tra lại 4 điểm:
1. File .env đã nằm trong .gitignore chưa?
2. Thư mục node_modules đã được loại trừ chưa?
3. Có cung cấp sẵn .env.example cho giảng viên/đồng đội chưa?
4. Các API sửa/xóa có kiểm tra quyền sở hữu ở tầng Service chưa?`,
        durationMinutes: 12,
        order: 1,
      },
      {
        course: lopDuLieu._id,
        createdBy: gvHuy._id,
        moduleTitle: 'Tuần 1: Làm quen Pandas',
        title: 'Video: Phân tích bộ dữ liệu điểm thi sinh viên với Pandas',
        type: 'video',
        description: 'Hướng dẫn đọc file CSV UTF-8 BOM và tính điểm trung bình theo nhóm.',
        videoUrl: 'https://www.youtube.com/watch?v=vmEHCJofslg',
        durationMinutes: 32,
        order: 1,
      },
    ]);

    await Enrollment.create([
      { student: svTuan._id, course: lopMern._id, completedMaterials: [tlMern[0]._id, tlMern[1]._id, tlMern[2]._id], progressPercent: 60, enrolledAt: cachNgay(-18), lastAccessedAt: cachGio(-3) },
      { student: svAn._id, course: lopMern._id, completedMaterials: tlMern.map((m) => m._id), progressPercent: 100, enrolledAt: cachNgay(-17), lastAccessedAt: cachGio(-5) },
      { student: svKhoa._id, course: lopMern._id, completedMaterials: [tlMern[0]._id, tlMern[1]._id], progressPercent: 40, enrolledAt: cachNgay(-15), lastAccessedAt: cachNgay(-1) },
      { student: svNhi._id, course: lopMern._id, completedMaterials: [tlMern[0]._id, tlMern[1]._id, tlMern[2]._id, tlMern[3]._id], progressPercent: 80, enrolledAt: cachNgay(-14), lastAccessedAt: cachGio(-10) },
      { student: svDuc._id, course: lopMern._id, completedMaterials: [tlMern[0]._id], progressPercent: 20, enrolledAt: cachNgay(-10), lastAccessedAt: cachNgay(-3) },
      { student: svTuan._id, course: lopReact._id, completedMaterials: [tlReact[0]._id, tlReact[1]._id], progressPercent: 67, enrolledAt: cachNgay(-16), lastAccessedAt: cachGio(-8) },
      { student: svAn._id, course: lopReact._id, completedMaterials: [tlReact[0]._id], progressPercent: 33, enrolledAt: cachNgay(-14), lastAccessedAt: cachNgay(-2) },
      { student: svNhi._id, course: lopReact._id, completedMaterials: tlReact.map((m) => m._id), progressPercent: 100, enrolledAt: cachNgay(-12), lastAccessedAt: cachGio(-2) },
      { student: svTuan._id, course: lopMongo._id, completedMaterials: [tlMongo[0]._id], progressPercent: 50, enrolledAt: cachNgay(-15), lastAccessedAt: cachNgay(-1) },
      { student: svKhoa._id, course: lopMongo._id, completedMaterials: tlMongo.map((m) => m._id), progressPercent: 100, enrolledAt: cachNgay(-14), lastAccessedAt: cachGio(-6) },
      { student: svDuc._id, course: lopMongo._id, completedMaterials: [], progressPercent: 0, enrolledAt: cachNgay(-9), lastAccessedAt: cachNgay(-4) },
      { student: svAn._id, course: lopMongo._id, completedMaterials: [tlMongo[0]._id], progressPercent: 50, enrolledAt: cachNgay(-11), lastAccessedAt: cachNgay(-2) },
      { student: svNhi._id, course: lopDuLieu._id, completedMaterials: [], progressPercent: 0, enrolledAt: cachNgay(-7) },
      { student: svKhoa._id, course: lopDuLieu._id, completedMaterials: [], progressPercent: 0, enrolledAt: cachNgay(-6) },
    ]);

    const dsBaiTap = await Assignment.create([
      {
        course: lopMern._id,
        createdBy: gvNam._id,
        title: 'Lab 01: Thiết kế Schema Mongoose & API xác thực JWT',
        description:
          'Xây dựng model User và Course kèm API đăng ký, đăng nhập trả về JWT token, tách rõ Controller và Service.',
        dueDate: cachNgay(-4),
        maxScore: 10,
        allowLateSubmission: true,
        status: 'open',
      },
      {
        course: lopMern._id,
        createdBy: gvNam._id,
        title: 'Lab 02: Xây dựng CRUD Khóa học & Upload tài liệu PDF bằng Multer',
        description:
          'Hoàn thiện các endpoint tạo/sửa/xóa khóa học theo quyền sở hữu giảng viên, upload ảnh bìa lớp và đính kèm tệp PDF bài giảng.',
        dueDate: cachGio(22),
        maxScore: 10,
        allowLateSubmission: true,
        status: 'open',
      },
      {
        course: lopMern._id,
        createdBy: gvNam._id,
        title: 'Đồ án cuối kỳ: Hệ thống Lớp học Trực tuyến hoàn chỉnh',
        description:
          'Tích hợp toàn bộ Frontend React + Bootstrap 5 + Backend Express + MongoDB. Đảm bảo đủ luồng Admin, Teacher, Student cùng báo cáo PDF.',
        dueDate: cachNgay(12),
        maxScore: 10,
        allowLateSubmission: false,
        status: 'open',
      },
      {
        course: lopReact._id,
        createdBy: gvNam._id,
        title: 'Bài tập 01: Dựng Trang chủ khách với AOS, Animate.css & tsParticles',
        description:
          'Thiết kế trang giới thiệu dành cho người dùng chưa đăng nhập có hiệu ứng hạt nền động, xuất hiện khi cuộn và ảnh bìa rõ nét.',
        dueDate: cachNgay(-2),
        maxScore: 10,
        allowLateSubmission: true,
        status: 'open',
      },
      {
        course: lopReact._id,
        createdBy: gvNam._id,
        title: 'Bài tập 02: Quản lý phiên đăng nhập bằng Context API & Tuyến bảo vệ',
        description:
          'Xây dựng AuthContext đồng bộ token với localStorage và tách khung Sidebar sau khi đăng nhập.',
        dueDate: cachNgay(5),
        maxScore: 10,
        allowLateSubmission: true,
        status: 'open',
      },
      {
        course: lopMongo._id,
        createdBy: gvLinh._id,
        title: 'Thực hành 01: Mô hình hóa ERD sang Collection MongoDB',
        description:
          'Thiết kế lược đồ cho các collection cốt lõi, chỉ rõ trường nào cần đánh index và giải thích lý do.',
        dueDate: cachNgay(-5),
        maxScore: 10,
        allowLateSubmission: true,
        status: 'open',
      },
      {
        course: lopMongo._id,
        createdBy: gvLinh._id,
        title: 'Thực hành 02: Viết Aggregation Pipeline thống kê tiến độ lớp học',
        description:
          'Viết truy vấn tổng hợp số sinh viên, tỷ lệ nộp bài đúng hạn và điểm trung bình theo từng khóa học.',
        dueDate: cachGio(36),
        maxScore: 10,
        allowLateSubmission: true,
        status: 'open',
      },
    ]);

    const [btMern1, btMern2, , btReact1, , btMongo1, btMongo2] = dsBaiTap;

    await Submission.create([
      {
        assignment: btMern1._id,
        course: lopMern._id,
        student: svTuan._id,
        textContent:
          'Em đã hoàn thiện đủ API /api/auth/register, /login, /me kèm bcrypt và tách riêng authController + authService.',
        submittedAt: cachNgay(-5),
        isLate: false,
        status: 'graded',
        score: 9.0,
        feedback: 'Tổ chức code gọn, tách controller và service rõ ràng. Rất tốt ở phần kiểm tra tài khoản bị khóa.',
        gradedBy: gvNam._id,
        gradedAt: cachNgay(-3),
      },
      {
        assignment: btMern1._id,
        course: lopMern._id,
        student: svAn._id,
        textContent: 'Em nộp bài Lab 01 kèm bộ test Postman cho cả trường hợp đăng nhập sai mật khẩu và thiếu Bearer Token.',
        submittedAt: cachNgay(-5),
        isLate: false,
        status: 'graded',
        score: 9.5,
        feedback: 'Bài làm chỉnh chu, xử lý mã lỗi 401/403 đầy đủ và tài liệu test rõ ràng.',
        gradedBy: gvNam._id,
        gradedAt: cachNgay(-3),
      },
      {
        assignment: btMern1._id,
        course: lopMern._id,
        student: svKhoa._id,
        textContent: 'Em bị kẹt phần cấu hình CORS nên nộp trễ hơn hạn một chút, nhờ thầy xem giúp phần kiểm tra JWT ạ.',
        submittedAt: cachNgay(-3),
        isLate: true,
        status: 'graded',
        score: 7.5,
        feedback: 'Chức năng chạy ổn, nhưng cần đưa JWT_SECRET ra file .env thay vì ghi cứng trong code.',
        gradedBy: gvNam._id,
        gradedAt: cachNgay(-2),
      },
      {
        assignment: btMern1._id,
        course: lopMern._id,
        student: svNhi._id,
        textContent: 'Em đã hoàn thành Lab 01 và bổ sung thêm endpoint đổi mật khẩu /api/auth/change-password.',
        submittedAt: cachNgay(-4),
        isLate: false,
        status: 'submitted',
      },
      {
        assignment: btMern2._id,
        course: lopMern._id,
        student: svAn._id,
        textContent: 'Em đã hoàn thành CRUD khóa học và tích hợp Multer upload ảnh bìa + tệp PDF tối đa 15MB.',
        submittedAt: cachGio(-6),
        isLate: false,
        status: 'submitted',
      },
      {
        assignment: btMern2._id,
        course: lopMern._id,
        student: svNhi._id,
        textContent: 'Bài nộp Lab 02 của em đã có đủ upload PDF và kiểm tra quyền sở hữu lớp học ở tầng service.',
        submittedAt: cachGio(-3),
        isLate: false,
        status: 'submitted',
      },
      {
        assignment: btReact1._id,
        course: lopReact._id,
        student: svTuan._id,
        textContent: 'Em dựng trang khách bằng Bootstrap 5 kết hợp AOS, Animate.css và nền hạt động tsParticles.',
        submittedAt: cachNgay(-3),
        isLate: false,
        status: 'graded',
        score: 8.5,
        feedback: 'Bố cục sạch sẽ, hiệu ứng mượt và tách gọn thanh điều hướng sau đăng nhập.',
        gradedBy: gvNam._id,
        gradedAt: cachNgay(-1),
      },
      {
        assignment: btReact1._id,
        course: lopReact._id,
        student: svNhi._id,
        textContent: 'Em nộp bài dựng layout dashboard bằng React + Bootstrap 5 theo mẫu chuẩn.',
        submittedAt: cachNgay(-2),
        isLate: false,
        status: 'submitted',
      },
      {
        assignment: btMongo1._id,
        course: lopMongo._id,
        student: svKhoa._id,
        textContent: 'Em đã thiết kế sơ đồ 8 collection kèm compound unique index cho enrollments và submissions.',
        submittedAt: cachNgay(-6),
        isLate: false,
        status: 'graded',
        score: 9.0,
        feedback: 'Phân tích hợp lý, chọn đúng compound index để chống ghi danh trùng.',
        gradedBy: gvLinh._id,
        gradedAt: cachNgay(-4),
      },
      {
        assignment: btMongo1._id,
        course: lopMongo._id,
        student: svAn._id,
        textContent: 'Bài thiết kế ERD sang Mongoose Schema kèm giải thích quan hệ 1-N.',
        submittedAt: cachNgay(-5),
        isLate: false,
        status: 'graded',
        score: 8.75,
        feedback: 'Thiết kế tốt, trình bày rõ ràng.',
        gradedBy: gvLinh._id,
        gradedAt: cachNgay(-4),
      },
      {
        assignment: btMongo2._id,
        course: lopMongo._id,
        student: svKhoa._id,
        textContent: 'Em đã viết pipeline thống kê theo danh mục và test chạy trực tiếp trên MongoDB Compass.',
        submittedAt: cachGio(-4),
        isLate: false,
        status: 'submitted',
      },
    ]);

    await Announcement.create([
      {
        course: lopMern._id,
        author: gvNam._id,
        title: 'Lịch nộp bài Lab 02 và lưu ý chấm đồ án cuối kỳ',
        content:
          'Chào cả lớp, hạn nộp Lab 02 là vào ngày mai. Các bạn nhớ kiểm tra kỹ file .gitignore để không đẩy node_modules và file .env lên GitHub nhé. Nếu gặp vướng mắc cứ bình luận ngay bên dưới.',
        isPinned: true,
        comments: [
          {
            author: svTuan._id,
            content: 'Thầy ơi cho em hỏi em nộp cả link GitHub trong phần text và đính kèm file PDF báo cáo cùng lúc được không ạ?',
          },
          {
            author: gvNam._id,
            content: 'Được em nhé, hệ thống hỗ trợ nộp đồng thời văn bản và tệp đính kèm.',
          },
        ],
      },
      {
        course: lopMern._id,
        author: gvNam._id,
        title: 'Đã cập nhật slide Tuần 2 & mẫu kiến trúc 4 tầng',
        content:
          'Thầy vừa tải lên tài liệu PDF hướng dẫn tách tầng Routes - Controllers - Services - Models trong tab Tài liệu & Bài học. Cả lớp đọc trước buổi thực hành thứ Năm.',
        isPinned: false,
        comments: [],
      },
      {
        course: lopReact._id,
        author: gvNam._id,
        title: 'Yêu cầu tối ưu Responsive trên màn hình 390px',
        content:
          'Khi test giao diện Bootstrap 5, nhớ kiểm tra bảng dữ liệu bọc trong .table-responsive và thanh bên chuyển sang dạng ngăn kéo trên di động.',
        isPinned: true,
        comments: [],
      },
      {
        course: lopMongo._id,
        author: gvLinh._id,
        title: 'Lưu ý nhấn nút Refresh trên MongoDB Compass sau khi chạy seed',
        content:
          'Sau khi chạy npm run seed, các bạn bấm biểu tượng làm mới bên cạnh database HeThongLopHocTrucTuyen trong Compass để thấy đủ 8 collection nhé.',
        isPinned: true,
        comments: [],
      },
    ]);

    console.log('[Seed] Hoan tat nap du lieu mau vao HeThongLopHocTrucTuyen (8 collections).');
    console.log('[Seed] Tai khoan demo (mat khau chung: EduClass@2026):');
    console.log('       - Admin:     admin@educlass.vn');
    console.log('       - Teacher:   giangvien@educlass.vn');
    console.log('       - Student:   sinhvien@educlass.vn');
    console.log('       - Bi khoa:   locked.sv@educlass.vn');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Loi nap du lieu:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

napDuLieuMau();
