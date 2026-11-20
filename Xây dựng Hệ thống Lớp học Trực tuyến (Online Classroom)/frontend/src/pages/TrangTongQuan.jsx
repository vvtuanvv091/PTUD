import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  FolderKanban,
  Lock,
  Minus,
  Plus,
  Search,
  TrendingUp,
  Users,
} from 'lucide-react';
import goiApi, { layThongBaoLoi } from '../services/goiApi';
import { suDungXacThuc } from '../context/NguCanhXacThuc';
import {
  AnhDaiDien,
  KhungChoTai,
  NhanHanNop,
  NhanVaiTro,
  TrangThaiTrong,
} from '../components/ThanhPhanChung';
import {
  dinhDangHanNopTuongDoi,
  dinhDangNgay,
  dinhDangNgayGio,
  layTrangThaiKhoaHoc,
} from '../utils/dinhDang';

export function TrangTongQuan() {
  const { nguoiDung } = suDungXacThuc();
  const [thongKe, datThongKe] = useState(null);
  const [dangTai, datDangTai] = useState(true);
  const [loi, datLoi] = useState('');
  const [tuKhoaLoc, datTuKhoaLoc] = useState('');
  const [thuGonDanhSach, datThuGonDanhSach] = useState(false);

  const taiThongKe = async () => {
    datDangTai(true);
    datLoi('');
    try {
      const phanHoi = await goiApi.get('/dashboard/stats');
      datThongKe(phanHoi.data.data);
    } catch (err) {
      datLoi(layThongBaoLoi(err, 'Không thể tải dữ liệu tổng quan'));
    } finally {
      datDangTai(false);
    }
  };

  useEffect(() => {
    taiThongKe();
  }, []);

  const dsBaiTapDaLoc = useMemo(() => {
    const goc = thongKe?.upcomingAssignments || [];
    const q = tuKhoaLoc.trim().toLowerCase();
    if (!q) return goc;
    return goc.filter(
      (bt) =>
        bt.title.toLowerCase().includes(q) ||
        bt.course?.code?.toLowerCase().includes(q) ||
        bt.course?.title?.toLowerCase().includes(q)
    );
  }, [thongKe, tuKhoaLoc]);

  if (dangTai) return <KhungChoTai soDong={3} />;

  if (loi) {
    return (
      <div className="the-bang-dieu-khien p-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div>
          <h5 className="fw-bold text-danger mb-1">Không tải được bảng điều khiển</h5>
          <p className="small text-secondary mb-0">{loi}</p>
        </div>
        <button type="button" className="btn btn-danger btn-sm" onClick={taiThongKe}>
          Thử lại
        </button>
      </div>
    );
  }

  // ==================== 1. DASHBOARD QUAN TRI VIEN ====================
  if (thongKe?.role === 'admin') {
    const { overview, categoryBreakdown, recentUsers, recentEnrollments } = thongKe;
    const lopMax = Math.max(1, ...categoryBreakdown.map((c) => c.courseCount));

    return (
      <div className="d-flex flex-column gap-4">
        <div>
          <h1 className="h4 fw-bold mb-1">Tổng quan quản trị</h1>
          <p className="small text-secondary mb-0">
            Trung tâm điều hành tài khoản, danh mục đào tạo và hoạt động học tập toàn hệ thống.
          </p>
        </div>

        {/* Banner hanh dong nhanh giong OTSP */}
        <div className="the-thong-bao-chinh d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <div className="small text-secondary fw-medium">Trạng thái vận hành hệ thống</div>
            <div className="h5 fw-bold mb-1 mt-1">
              {overview.totalUsers} tài khoản đang quản lý • {overview.courseStatusCount.published} lớp đang mở ghi danh
            </div>
            <div className="small text-danger fw-semibold">
              {overview.lockedUsers > 0
                ? `Hiện có ${overview.lockedUsers} tài khoản đang ở trạng thái khóa`
                : 'Toàn bộ tài khoản đang hoạt động bình thường'}
            </div>
          </div>
          <div className="d-flex gap-2">
            <Link to="/admin/users" className="nut-hanh-dong-do btn-sm">
              Quản lý tài khoản
            </Link>
            <Link to="/admin/categories" className="btn btn-outline-danger btn-sm rounded-pill px-3">
              Danh mục khóa học
            </Link>
          </div>
        </div>

        {/* 4 the KPI chuan OTSP */}
        <div className="row g-3">
          <div className="col-6 col-md-3">
            <div className="the-chi-so">
              <div className="tieu-de-chi-so">NGƯỜI DÙNG</div>
              <div className="gia-tri-chi-so">{overview.totalUsers}</div>
              <div className="small text-secondary mt-1">
                {overview.roleCount.teacher} GV • {overview.roleCount.student} SV
              </div>
              <div className="hop-bieu-tuong-chi-so hop-mau-do"><Users size={18} /></div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="the-chi-so">
              <div className="tieu-de-chi-so">KHÓA HỌC</div>
              <div className="gia-tri-chi-so">{overview.totalCourses}</div>
              <div className="small text-secondary mt-1">{overview.totalCategories} danh mục</div>
              <div className="hop-bieu-tuong-chi-so hop-mau-xanh"><BookOpen size={18} /></div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="the-chi-so">
              <div className="tieu-de-chi-so">LƯỢT GHI DANH</div>
              <div className="gia-tri-chi-so">{overview.totalEnrollments}</div>
              <div className="small text-secondary mt-1">{overview.totalAssignments} bài tập</div>
              <div className="hop-bieu-tuong-chi-so hop-mau-la"><TrendingUp size={18} /></div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="the-chi-so">
              <div className="tieu-de-chi-so">TỶ LỆ CHẤM BÀI</div>
              <div className="gia-tri-chi-so">{overview.gradingRate}%</div>
              <div className="small text-secondary mt-1">
                {overview.gradedSubmissions}/{overview.totalSubmissions} bài nộp
              </div>
              <div className="hop-bieu-tuong-chi-so hop-mau-vang"><ClipboardList size={18} /></div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-5">
            <div className="the-bang-dieu-khien h-100">
              <div className="dau-the-bang">
                <h2 className="h6 fw-bold mb-0">Phân bố khóa học theo danh mục</h2>
                <Link to="/admin/categories" className="small text-danger fw-semibold">Quản lý</Link>
              </div>
              <div className="than-the-bang d-flex flex-column gap-3">
                {categoryBreakdown.map((dm) => {
                  const phanTram = Math.round((dm.courseCount / lopMax) * 100);
                  return (
                    <div key={dm._id}>
                      <div className="d-flex justify-content-between small mb-1">
                        <span className="fw-semibold">{dm.name}</span>
                        <span className="text-secondary so-thang-hang">{dm.courseCount} lớp</span>
                      </div>
                      <div className="progress" style={{ height: 8 }}>
                        <div
                          className="progress-bar"
                          style={{
                            width: `${Math.max(8, phanTram)}%`,
                            backgroundColor: dm.accentColor || '#DB303A',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="the-bang-dieu-khien h-100">
              <div className="dau-the-bang">
                <h2 className="h6 fw-bold mb-0">Lượt ghi danh mới nhất</h2>
                <Link to="/admin/courses" className="small text-danger fw-semibold">Xem tất cả lớp</Link>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Sinh viên</th>
                      <th>Khóa học</th>
                      <th>Tiến độ</th>
                      <th>Ngày ghi danh</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEnrollments.map((gd) => (
                      <tr key={gd._id}>
                        <td>
                          <div className="fw-semibold small">{gd.student?.fullName}</div>
                          <div className="small text-secondary chu-don-cach">{gd.student?.studentCode}</div>
                        </td>
                        <td>
                          <Link to={`/courses/${gd.course?._id}`} className="fw-semibold small text-dark">
                            {gd.course?.title}
                          </Link>
                          <div className="small text-secondary chu-don-cach">{gd.course?.code}</div>
                        </td>
                        <td className="so-thang-hang fw-semibold small">{gd.progressPercent}%</td>
                        <td className="small text-secondary so-thang-hang">{dinhDangNgay(gd.enrolledAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="the-bang-dieu-khien">
          <div className="dau-the-bang">
            <h2 className="h6 fw-bold mb-0">Người dùng mới tạo gần đây</h2>
            <Link to="/admin/users" className="small text-danger fw-semibold">Quản lý người dùng</Link>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Khoa / Đơn vị</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((nd) => (
                  <tr key={nd._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <AnhDaiDien
                          ten={nd.fullName}
                          mauNen={nd.avatarColor}
                          kichThuoc={30}
                          anh={nd.avatarUrl}
                        />
                        <div>
                          <div className="fw-semibold small">{nd.fullName}</div>
                          {nd.studentCode && (
                            <div className="small text-secondary chu-don-cach">{nd.studentCode}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="small text-secondary">{nd.email}</td>
                    <td><NhanVaiTro vaiTro={nd.role} /></td>
                    <td>
                      <span className={`nhan-trang-thai ${nd.status === 'active' ? 'nhan-thanh-cong' : 'nhan-nguy-hiem'}`}>
                        {nd.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="small text-secondary">{nd.department}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ==================== 2. DASHBOARD GIANG VIEN ====================
  if (thongKe?.role === 'teacher') {
    const { overview, pendingQueue, courseStats } = thongKe;
    const baiDauTienChoCham = pendingQueue[0] || null;

    return (
      <div className="d-flex flex-column gap-4">
        <div>
          <h1 className="h4 fw-bold mb-1">Tổng quan giảng dạy</h1>
          <p className="small text-secondary mb-0">
            Xin chào {nguoiDung.fullName} — theo dõi lớp học phụ trách và hàng đợi chấm bài.
          </p>
        </div>

        <div className="the-thong-bao-chinh d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <div className="small text-secondary fw-medium">Công việc cần ưu tiên</div>
            <div className="h5 fw-bold mb-1 mt-1">
              {overview.pendingGradingCount > 0
                ? `Bạn có ${overview.pendingGradingCount} bài nộp đang chờ chấm điểm`
                : 'Tất cả bài nộp trong các lớp đều đã được chấm xong'}
            </div>
            <div className="small text-danger fw-semibold">
              {baiDauTienChoCham
                ? `Gần nhất: ${baiDauTienChoCham.student?.fullName} • ${baiDauTienChoCham.course?.code} — ${baiDauTienChoCham.assignment?.title}`
                : 'Tạo thêm lớp mới hoặc cập nhật học liệu cho tuần học tiếp theo'}
            </div>
          </div>
          <div className="d-flex gap-2">
            {baiDauTienChoCham ? (
              <Link
                to={`/courses/${baiDauTienChoCham.course?._id}?tab=assignments&assignment=${baiDauTienChoCham.assignment?._id}`}
                className="nut-hanh-dong-do btn-sm"
              >
                Chấm bài ngay <ArrowRight size={15} />
              </Link>
            ) : null}
            <Link to="/teacher/courses" className="btn btn-outline-danger btn-sm rounded-pill px-3">
              Quản lý lớp dạy
            </Link>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-6 col-md-3">
            <div className="the-chi-so">
              <div className="tieu-de-chi-so">LỚP PHỤ TRÁCH</div>
              <div className="gia-tri-chi-so">{overview.totalCourses}</div>
              <div className="small text-secondary mt-1">{overview.publishedCourses} đang mở</div>
              <div className="hop-bieu-tuong-chi-so hop-mau-do"><BookOpen size={18} /></div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="the-chi-so">
              <div className="tieu-de-chi-so">TỔNG SINH VIÊN</div>
              <div className="gia-tri-chi-so">{overview.totalStudents}</div>
              <div className="small text-secondary mt-1">Đang ghi danh</div>
              <div className="hop-bieu-tuong-chi-so hop-mau-xanh"><Users size={18} /></div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="the-chi-so">
              <div className="tieu-de-chi-so">CHỜ CHẤM ĐIỂM</div>
              <div className="gia-tri-chi-so">{overview.pendingGradingCount}</div>
              <div className="small text-secondary mt-1">{overview.gradedCount} bài đã chấm</div>
              <div className="hop-bieu-tuong-chi-so hop-mau-vang"><Clock size={18} /></div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="the-chi-so">
              <div className="tieu-de-chi-so">HỌC LIỆU &amp; BÀI TẬP</div>
              <div className="gia-tri-chi-so">{overview.totalMaterials}</div>
              <div className="small text-secondary mt-1">{overview.totalAssignments} bài tập</div>
              <div className="hop-bieu-tuong-chi-so hop-mau-tim"><FolderKanban size={18} /></div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-7">
            <div className="the-bang-dieu-khien h-100">
              <div className="dau-the-bang">
                <h2 className="h6 fw-bold mb-0">Danh sách lớp đang phụ trách</h2>
                <Link to="/teacher/courses" className="small text-danger fw-semibold">Quản lý tất cả</Link>
              </div>
              {courseStats.length === 0 ? (
                <TrangThaiTrong
                  bieuTuong={BookOpen}
                  tieuDe="Chưa có lớp học nào"
                  moTa="Tạo khóa học đầu tiên để bắt đầu đăng tải học liệu và giao bài tập."
                  hanhDong={
                    <Link to="/teacher/courses" className="btn btn-danger btn-sm rounded-pill px-3">
                      Tạo lớp học mới
                    </Link>
                  }
                />
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>Lớp học</th>
                        <th>Mã lớp</th>
                        <th>Sĩ số</th>
                        <th>Tiến độ TB</th>
                        <th>Chờ chấm</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courseStats.map((lop) => {
                        const tt = layTrangThaiKhoaHoc(lop.status);
                        return (
                          <tr key={lop._id}>
                            <td>
                              <Link to={`/courses/${lop._id}`} className="fw-semibold text-dark d-block">
                                {lop.title}
                              </Link>
                              <div className="d-flex align-items-center gap-2 mt-1">
                                <span className="small chu-don-cach text-secondary">{lop.code}</span>
                                <span className={`nhan-trang-thai ${tt.lopCss}`}>{tt.nhan}</span>
                              </div>
                            </td>
                            <td>
                              <code className="chu-don-cach px-2 py-1 rounded border small">
                                {lop.joinCode}
                              </code>
                            </td>
                            <td className="so-thang-hang small">{lop.studentCount}/{lop.maxStudents}</td>
                            <td style={{ minWidth: 115 }}>
                              <div className="d-flex align-items-center gap-2">
                                <div className="progress flex-grow-1" style={{ height: 6 }}>
                                  <div className="progress-bar" style={{ width: `${lop.avgProgress}%` }} />
                                </div>
                                <span className="small so-thang-hang">{lop.avgProgress}%</span>
                              </div>
                            </td>
                            <td>
                              {lop.pendingGradingCount > 0 ? (
                                <Link
                                  to={`/courses/${lop._id}?tab=assignments`}
                                  className="nhan-trang-thai nhan-canh-bao"
                                >
                                  {lop.pendingGradingCount} bài
                                </Link>
                              ) : (
                                <span className="small text-secondary">Đã chấm hết</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-5">
            <div className="the-bang-dieu-khien h-100">
              <div className="dau-the-bang">
                <h2 className="h6 fw-bold mb-0">Hàng đợi bài nộp cần chấm</h2>
                <span className="nhan-trang-thai nhan-canh-bao so-thang-hang">
                  {overview.pendingGradingCount} bài chờ
                </span>
              </div>
              {pendingQueue.length === 0 ? (
                <TrangThaiTrong
                  bieuTuong={CheckCircle2}
                  tieuDe="Không còn bài tồn đọng"
                  moTa="Toàn bộ bài nộp trong các lớp của bạn đều đã được chấm điểm."
                />
              ) : (
                <div className="list-group list-group-flush overflow-hidden">
                  {pendingQueue.map((bn) => (
                    <Link
                      key={bn._id}
                      to={`/courses/${bn.course?._id}?tab=assignments&assignment=${bn.assignment?._id}`}
                      className="list-group-item list-group-item-action px-3 py-3 d-flex align-items-start justify-content-between gap-2"
                    >
                      <div className="flex-grow-1 min-w-0">
                        <div className="fw-semibold small text-truncate">
                          {bn.student?.fullName}{' '}
                          <span className="text-secondary fw-normal chu-don-cach">
                            ({bn.student?.studentCode})
                          </span>
                        </div>
                        <div className="small text-secondary text-truncate">
                          {bn.course?.code} • {bn.assignment?.title}
                        </div>
                        <div className="mt-1 d-flex align-items-center gap-2 flex-wrap">
                          <span className="small text-secondary so-thang-hang">
                            Nộp lúc {dinhDangNgayGio(bn.submittedAt)}
                          </span>
                          {bn.isLate && <span className="nhan-trang-thai nhan-nguy-hiem">Nộp trễ</span>}
                        </div>
                      </div>
                      <span className="btn btn-outline-danger btn-sm rounded-pill px-3 flex-shrink-0">
                        Chấm
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== 3. DASHBOARD SINH VIEN (CHUAN BO CUC OTSP) ====================
  const { overview, enrolledCourses, upcomingAssignments, recentGrades } = thongKe;
  const baiTapGapNhat = upcomingAssignments[0] || null;

  return (
    <div className="d-flex flex-column gap-4">
      <div>
        <h1 className="h4 fw-bold mb-1">Tổng quan học tập</h1>
        <p className="small text-secondary mb-0">
          Khu học tập của sinh viên {nguoiDung.fullName} — theo dõi tiến độ, hạn nộp và kết quả đánh giá.
        </p>
      </div>

      {/* 1. Banner bai tap uu tien (giong banner Buoi hoc tiep theo cua OTSP) */}
      <div className="the-thong-bao-chinh d-flex align-items-center justify-content-between flex-wrap gap-3">
        {baiTapGapNhat ? (
          <>
            <div>
              <div className="small text-secondary fw-medium">Bài tập cần xử lý sớm nhất</div>
              <div className="h5 fw-bold mb-1 mt-1">
                {baiTapGapNhat.course?.code} — {baiTapGapNhat.title}
              </div>
              <div className="small text-danger fw-semibold so-thang-hang">
                Hạn nộp: {dinhDangNgayGio(baiTapGapNhat.dueDate)} ({dinhDangHanNopTuongDoi(baiTapGapNhat.dueDate)})
              </div>
            </div>
            <Link
              to={`/courses/${baiTapGapNhat.course?._id}?tab=assignments&assignment=${baiTapGapNhat._id}`}
              className="nut-hanh-dong-do btn-sm"
            >
              Nộp bài ngay <ArrowRight size={15} />
            </Link>
          </>
        ) : (
          <>
            <div>
              <div className="small text-secondary fw-medium">Tiến độ bài tập</div>
              <div className="h5 fw-bold mb-1 mt-1">Bạn đã hoàn tất toàn bộ bài tập hiện tại</div>
              <div className="small text-secondary">
                Tiếp tục ôn tập tài liệu hoặc tìm thêm khóa học mới đang mở ghi danh.
              </div>
            </div>
            <Link to="/explore" className="btn btn-outline-danger rounded-pill px-4 btn-sm fw-semibold">
              Khám phá khóa học
            </Link>
          </>
        )}
      </div>

      {/* 2. 4 The KPI pastel 4 mau (giong StudentDashboardPage cua OTSP) */}
      <div className="row g-3">
        <div className="col-6 col-md-3">
          <div className="the-chi-so">
            <div className="tieu-de-chi-so">LỚP ĐANG HỌC</div>
            <div className="gia-tri-chi-so">{overview.enrolledCoursesCount}</div>
            <div className="hop-bieu-tuong-chi-so hop-mau-do"><BookOpen size={18} /></div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="the-chi-so">
            <div className="tieu-de-chi-so">TIẾN ĐỘ HỌC LIỆU</div>
            <div className="gia-tri-chi-so">{overview.avgProgress}%</div>
            <div className="hop-bieu-tuong-chi-so hop-mau-xanh"><TrendingUp size={18} /></div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="the-chi-so">
            <div className="tieu-de-chi-so">BÀI CHƯA NỘP</div>
            <div className="gia-tri-chi-so">{overview.pendingAssignmentsCount}</div>
            {(overview.overdueCount > 0 || overview.dueSoonCount > 0) && (
              <div className="small text-danger mt-1 fw-medium">
                {overview.overdueCount > 0 && `${overview.overdueCount} quá hạn`}
                {overview.overdueCount > 0 && overview.dueSoonCount > 0 && ' • '}
                {overview.dueSoonCount > 0 && `${overview.dueSoonCount} sắp hết hạn`}
              </div>
            )}
            <div className="hop-bieu-tuong-chi-so hop-mau-vang"><Clock size={18} /></div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="the-chi-so">
            <div className="tieu-de-chi-so">ĐIỂM TB (HỆ 10)</div>
            <div className="gia-tri-chi-so">
              {overview.averageScore !== null ? overview.averageScore : '—'}
            </div>
            <div className="small text-secondary mt-1">{overview.gradedCount} bài đã chấm</div>
            <div className="hop-bieu-tuong-chi-so hop-mau-tim"><Award size={18} /></div>
          </div>
        </div>
      </div>

      {/* 3. Bo cuc 2 cot (7 - 5) giong OTSP: Cot trai co tim kiem + thu gon, Cot phai co Tien do + Truy cap nhanh */}
      <div className="row g-4">
        <div className="col-lg-7">
          <div className="the-bang-dieu-khien h-100">
            <div className="dau-the-bang">
              <div className="d-flex align-items-center gap-2">
                <h2 className="h6 fw-bold mb-0">Bài tập sắp tới</h2>
                <span className="nhan-trang-thai nhan-trung-tinh so-thang-hang">
                  {dsBaiTapDaLoc.length}
                </span>
              </div>

              <div className="d-flex align-items-center gap-2">
                <div className="position-relative" style={{ width: 175 }}>
                  <input
                    type="text"
                    className="form-control form-control-sm rounded-pill ps-4"
                    placeholder="Tìm môn, bài tập..."
                    value={tuKhoaLoc}
                    onChange={(e) => {
                      datTuKhoaLoc(e.target.value);
                      if (thuGonDanhSach) datThuGonDanhSach(false);
                    }}
                  />
                  <Search
                    size={13}
                    className="position-absolute top-50 start-0 translate-middle-y ms-2 text-secondary"
                  />
                </div>
                <button
                  type="button"
                  className="btn nut-phu btn-sm rounded-pill d-inline-flex align-items-center gap-1"
                  onClick={() => datThuGonDanhSach((v) => !v)}
                >
                  {thuGonDanhSach ? <Plus size={13} /> : <Minus size={13} />}
                  <span>{thuGonDanhSach ? 'Mở rộng' : 'Thu gọn'}</span>
                </button>
              </div>
            </div>

            {!thuGonDanhSach && (
              <div>
                {dsBaiTapDaLoc.length === 0 ? (
                  <TrangThaiTrong
                    bieuTuong={CheckCircle2}
                    tieuDe={tuKhoaLoc ? 'Không tìm thấy bài tập khớp từ khóa' : 'Không còn bài tập tồn đọng'}
                    moTa="Bạn đã nộp đầy đủ các bài tập hiện có trong lớp."
                  />
                ) : (
                  <div className="list-group list-group-flush">
                    {dsBaiTapDaLoc.map((bt) => (
                      <Link
                        key={bt._id}
                        to={`/courses/${bt.course?._id}?tab=assignments&assignment=${bt._id}`}
                        className="list-group-item list-group-item-action px-4 py-3 d-flex align-items-start justify-content-between gap-3"
                      >
                        <div className="flex-grow-1 min-w-0">
                          <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                            <span className="small chu-don-cach fw-bold text-danger">
                              {bt.course?.code}
                            </span>
                            <NhanHanNop trangThai={bt.deadlineState} />
                          </div>
                          <div className="fw-semibold small">{bt.title}</div>
                          <div className="small text-secondary mt-1 so-thang-hang">
                            Hạn: {dinhDangNgayGio(bt.dueDate)} ({dinhDangHanNopTuongDoi(bt.dueDate)})
                          </div>
                        </div>
                        <span className="btn btn-danger btn-sm rounded-pill px-3 flex-shrink-0">
                          Nộp bài
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-5 d-flex flex-column gap-4">
          <div className="the-bang-dieu-khien">
            <div className="dau-the-bang">
              <h2 className="h6 fw-bold mb-0">Tiến độ lớp đang học</h2>
              <Link to="/my-courses" className="small text-danger fw-semibold">Tất cả lớp</Link>
            </div>
            <div className="than-the-bang d-flex flex-column gap-3">
              {enrolledCourses.length === 0 ? (
                <div className="text-center py-3 small text-secondary">
                  Bạn chưa ghi danh lớp học nào.
                </div>
              ) : (
                enrolledCourses.map((gd) => (
                  <Link
                    key={gd._id}
                    to={`/courses/${gd.course._id}`}
                    className="p-3 rounded-3 border d-block text-reset"
                  >
                    <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                      <span className="fw-semibold small">{gd.course.title}</span>
                      <span className="small fw-bold text-danger so-thang-hang">
                        {gd.progressPercent}%
                      </span>
                    </div>
                    <div className="small text-secondary mb-2">
                      {gd.course.code} • {gd.completedCount}/{gd.totalMaterials} học liệu
                    </div>
                    <div className="progress" style={{ height: 6 }}>
                      <div className="progress-bar" style={{ width: `${gd.progressPercent}%` }} />
                    </div>
                  </Link>
                ))
              )}

              {/* Khoi Truy cap nhanh (tham khao OTSP StudentDashboardPage) */}
              <div className="pt-3 border-top">
                <div className="small fw-bold text-secondary mb-2">Truy cập nhanh</div>
                <div className="d-grid gap-2">
                  <Link
                    to="/my-courses"
                    className="btn nut-phu btn-sm text-start d-flex align-items-center justify-content-between"
                  >
                    <span>Lớp học của tôi</span>
                    <ChevronRight size={15} />
                  </Link>
                  <Link
                    to="/explore"
                    className="btn nut-phu btn-sm text-start d-flex align-items-center justify-content-between"
                  >
                    <span>Khám phá &amp; Ghi danh khóa học mới</span>
                    <ChevronRight size={15} />
                  </Link>
                  <Link
                    to="/my-grades"
                    className="btn nut-phu btn-sm text-start d-flex align-items-center justify-content-between"
                  >
                    <span>Xem bảng điểm cá nhân</span>
                    <ChevronRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {recentGrades.length > 0 && (
            <div className="the-bang-dieu-khien">
              <div className="dau-the-bang">
                <h2 className="h6 fw-bold mb-0">Điểm số mới chấm</h2>
                <Link to="/my-grades" className="small text-danger fw-semibold">Chi tiết</Link>
              </div>
              <div className="list-group list-group-flush">
                {recentGrades.slice(0, 3).map((bn) => (
                  <div key={bn._id} className="list-group-item px-3 py-3">
                    <div className="d-flex justify-content-between align-items-center gap-2">
                      <span className="fw-semibold small text-truncate">{bn.assignment?.title}</span>
                      <span className="nhan-trang-thai nhan-thanh-cong chu-don-cach so-thang-hang">
                        {bn.score}/{bn.assignment?.maxScore}
                      </span>
                    </div>
                    {bn.feedback && (
                      <div className="small text-secondary mt-1">“{bn.feedback}”</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

