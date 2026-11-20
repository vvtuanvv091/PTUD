const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'EduClass API — Hệ thống Lớp học Trực tuyến (MERN Stack)',
    version: '1.1.0',
    description:
      'Tài liệu RESTful API cho nền tảng lớp học trực tuyến EduClass (Kiến trúc 4 lớp: Routes — Controllers theo vai trò — Services — Models). Hỗ trợ xác thực JWT Bearer Token, phân quyền Admin / Teacher / Student, upload học liệu/ảnh bìa, nộp bài, chấm điểm và xuất bảng điểm CSV.',
  },
  servers: [
    { url: 'http://localhost:5000', description: 'Máy chủ phát triển cục bộ' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  tags: [
    { name: 'Xác thực', description: 'Đăng ký, đăng nhập JWT và hồ sơ cá nhân' },
    { name: 'Tổng quan', description: 'Thống kê công khai Trang chủ và theo vai trò' },
    { name: 'Danh mục', description: 'Danh mục học phần (Quản trị viên)' },
    { name: 'Khóa học & Học liệu', description: 'CRUD lớp học, ảnh bìa, học liệu PDF/Video/Bài đọc, bảng điểm CSV' },
    { name: 'Ghi danh & Tiến độ', description: 'Ghi danh khóa học bằng ID/JoinCode và đánh dấu hoàn thành' },
    { name: 'Bài tập & Chấm điểm', description: 'Giao bài, nộp file/text và chấm điểm kèm nhận xét' },
    { name: 'Bảng tin lớp', description: 'Thông báo ghim và bình luận trao đổi trong lớp' },
    { name: 'Quản trị', description: 'Khóa/mở khóa tài khoản, đổi vai trò, giám sát lớp học' },
  ],
  paths: {
    '/api/health': {
      get: {
        tags: ['Tổng quan'],
        summary: 'Kiểm tra kết nối máy chủ và MongoDB',
        responses: { 200: { description: 'Máy chủ đang hoạt động bình thường' } },
      },
    },
    '/api/dashboard/public-summary': {
      get: {
        tags: ['Tổng quan'],
        summary: 'Số liệu công khai, danh mục và khóa học nổi bật trên Trang chủ',
        responses: { 200: { description: 'Trả về số liệu thống kê công khai' } },
      },
    },
    '/api/dashboard/stats': {
      get: {
        tags: ['Tổng quan'],
        summary: 'Thống kê bảng điều khiển theo đúng vai trò đang đăng nhập',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Dữ liệu Dashboard theo Admin / Teacher / Student' } },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Xác thực'],
        summary: 'Đăng ký tài khoản Sinh viên hoặc Giảng viên',
        responses: { 201: { description: 'Đăng ký thành công, trả về JWT token' } },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Xác thực'],
        summary: 'Đăng nhập nhận JWT Token (chặn nếu tài khoản bị khóa)',
        responses: { 200: { description: 'Đăng nhập thành công' } },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Xác thực'],
        summary: 'Lấy thông tin tài khoản hiện tại',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Hồ sơ người dùng' } },
      },
      put: {
        tags: ['Xác thực'],
        summary: 'Cập nhật hồ sơ cá nhân',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Cập nhật thành công' } },
      },
    },
    '/api/auth/change-password': {
      put: {
        tags: ['Xác thực'],
        summary: 'Đổi mật khẩu tài khoản',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Đổi mật khẩu thành công' } },
      },
    },
    '/api/categories': {
      get: {
        tags: ['Danh mục'],
        summary: 'Lấy danh sách danh mục kèm số lượng khóa học',
        responses: { 200: { description: 'Danh sách danh mục' } },
      },
      post: {
        tags: ['Danh mục'],
        summary: 'Tạo danh mục mới (Admin)',
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: 'Đã tạo danh mục' } },
      },
    },
    '/api/courses': {
      get: {
        tags: ['Khóa học & Học liệu'],
        summary: 'Danh sách khóa học (lọc search, category, status, mine=true)',
        responses: { 200: { description: 'Danh sách khóa học' } },
      },
      post: {
        tags: ['Khóa học & Học liệu'],
        summary: 'Tạo khóa học mới kèm ảnh bìa (Teacher / Admin)',
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: 'Tạo khóa học thành công' } },
      },
    },
    '/api/courses/{id}/gradebook/export': {
      get: {
        tags: ['Khóa học & Học liệu'],
        summary: 'Xuất bảng điểm toàn lớp định dạng CSV (UTF-8 BOM cho Excel)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Tệp CSV bảng điểm' } },
      },
    },
    '/api/enrollments': {
      post: {
        tags: ['Ghi danh & Tiến độ'],
        summary: 'Sinh viên ghi danh vào khóa học bằng courseId hoặc joinCode',
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: 'Ghi danh thành công' } },
      },
    },
    '/api/assignments/{assignmentId}/submit': {
      post: {
        tags: ['Bài tập & Chấm điểm'],
        summary: 'Sinh viên nộp bài tập (text và/hoặc file đính kèm)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'assignmentId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 201: { description: 'Nộp bài thành công' } },
      },
    },
    '/api/submissions/{id}/grade': {
      put: {
        tags: ['Bài tập & Chấm điểm'],
        summary: 'Giảng viên chấm điểm và gửi nhận xét cho bài nộp',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Đã lưu điểm và nhận xét' } },
      },
    },
    '/api/admin/users': {
      get: {
        tags: ['Quản trị'],
        summary: 'Lấy danh sách toàn bộ người dùng (Admin)',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Danh sách tài khoản' } },
      },
    },
    '/api/admin/users/{id}/status': {
      patch: {
        tags: ['Quản trị'],
        summary: 'Khóa hoặc mở khóa tài khoản người dùng (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Đã cập nhật trạng thái tài khoản' } },
      },
    },
    '/api/admin/database': {
      get: {
        tags: ['Quản trị'],
        summary: 'Trạng thái kết nối & thống kê toàn bộ collection MongoDB (Admin)',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Thông tin kết nối, dung lượng, số bản ghi, chỉ mục' } },
      },
    },
    '/api/admin/database/{ten}/documents': {
      get: {
        tags: ['Quản trị'],
        summary: 'Duyệt bản ghi của một collection có phân trang & tìm kiếm (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'ten', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Danh sách bản ghi (đã ẩn mật khẩu)' } },
      },
    },
    '/api/admin/database/{ten}/export': {
      get: {
        tags: ['Quản trị'],
        summary: 'Xuất toàn bộ collection ra tệp JSON (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'ten', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Tệp JSON' } },
      },
    },
  },
};

module.exports = swaggerSpec;
