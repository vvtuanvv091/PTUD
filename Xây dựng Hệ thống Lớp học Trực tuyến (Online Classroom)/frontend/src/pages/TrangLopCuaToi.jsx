import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Compass, LogOut } from 'lucide-react';
import goiApi, { layThongBaoLoi } from '../services/goiApi';
import { suDungThongBao } from '../context/NguCanhThongBao';
import { AnhDaiDien, KhungChoTai, TrangThaiTrong } from '../components/ThanhPhanChung';
import { AnhBiaKhoaHoc } from '../components/AnhBiaKhoaHoc';

export function TrangLopCuaToi() {
  const thongBao = suDungThongBao();
  const [dsGhiDanh, datDsGhiDanh] = useState([]);
  const [dangTai, datDangTai] = useState(true);

  const taiLopCuaToi = async () => {
    datDangTai(true);
    try {
      const phanHoi = await goiApi.get('/enrollments/my');
      datDsGhiDanh(phanHoi.data.data);
    } catch (err) {
      thongBao.loi(layThongBaoLoi(err, 'Không thể tải danh sách lớp của bạn'));
    } finally {
      datDangTai(false);
    }
  };

  useEffect(() => {
    taiLopCuaToi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const xuLyRoiLop = async (idLop, tenLop) => {
    if (!window.confirm(`Bạn chắc chắn muốn rời khỏi lớp "${tenLop}"?`)) return;
    try {
      await goiApi.delete(`/enrollments/course/${idLop}`);
      thongBao.thongTin(`Đã rời khỏi lớp ${tenLop}`);
      taiLopCuaToi();
    } catch (err) {
      thongBao.loi(layThongBaoLoi(err));
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex align-items-end justify-content-between flex-wrap gap-3">
        <div>
          <h1 className="h4 fw-bold mb-1">Lớp học của tôi</h1>
          <p className="text-secondary small mb-0">
            Theo dõi tiến độ học liệu, bài tập chưa nộp và điểm trung bình từng môn đã ghi danh.
          </p>
        </div>
        <Link to="/explore" className="nut-hanh-dong-do btn-sm">
          <Compass size={15} />
          <span>Tìm thêm khóa học</span>
        </Link>
      </div>

      {dangTai ? (
        <KhungChoTai soDong={3} />
      ) : dsGhiDanh.length === 0 ? (
        <div className="the-bang-dieu-khien">
          <TrangThaiTrong
            bieuTuong={BookOpen}
            tieuDe="Chưa có lớp học nào"
            moTa="Bạn chưa ghi danh vào khóa học nào. Vào trang Khám phá để đăng ký ngay."
            hanhDong={
              <Link to="/explore" className="btn btn-danger btn-sm rounded-pill px-3">
                Khám phá khóa học
              </Link>
            }
          />
        </div>
      ) : (
        <div className="row g-4">
          {dsGhiDanh.map((muc) => {
            const { course: lop } = muc;
            return (
              <div className="col-md-6 col-xl-4" key={muc._id}>
                <div className="the-khoa-hoc">
                  <AnhBiaKhoaHoc
                    anhBia={lop.thumbnailUrl}
                    mauNen={lop.bannerColor}
                    moTaAnh={lop.title}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span
                        className="chu-don-cach small fw-semibold px-2 py-1 rounded"
                        style={{ backgroundColor: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(4px)' }}
                      >
                        {lop.code}
                      </span>
                      {muc.pendingAssignmentsCount > 0 && (
                        <span className="badge text-bg-warning">
                          {muc.pendingAssignmentsCount} bài chưa nộp
                        </span>
                      )}
                    </div>
                    <h2 className="h6 fw-bold mb-1 text-white" style={{ minHeight: '2.5rem' }}>
                      {lop.title}
                    </h2>
                    <div className="small" style={{ opacity: 0.9 }}>{lop.schedule}</div>
                  </AnhBiaKhoaHoc>

                  <div className="p-3 d-flex flex-column flex-grow-1">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <AnhDaiDien
                        ten={lop.teacher?.fullName}
                        mauNen={lop.teacher?.avatarColor}
                        kichThuoc={28}
                        anh={lop.teacher?.avatarUrl}
                      />
                      <span className="small fw-semibold">{lop.teacher?.fullName}</span>
                    </div>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between small mb-1">
                        <span className="text-secondary">
                          Tiến độ ({muc.completedCount}/{muc.totalMaterials} tài liệu)
                        </span>
                        <span className="fw-bold text-danger so-thang-hang">
                          {muc.progressPercent}%
                        </span>
                      </div>
                      <div className="progress" style={{ height: 7 }}>
                        <div className="progress-bar" style={{ width: `${muc.progressPercent}%` }} />
                      </div>
                    </div>

                    <div className="d-flex justify-content-between small text-secondary py-2 border-top mb-3 so-thang-hang">
                      <span>Bài tập: {muc.totalAssignments}</span>
                      <span>
                        Điểm TB:{' '}
                        <strong className="text-dark">
                          {muc.averageScore !== null ? `${muc.averageScore}/10` : 'Chưa có'}
                        </strong>
                      </span>
                    </div>

                    <div className="d-flex gap-2 mt-auto">
                      <Link
                        to={`/courses/${lop._id}`}
                        className="btn btn-danger btn-sm rounded-pill flex-grow-1 d-inline-flex align-items-center justify-content-center gap-1"
                      >
                        <span>Tiếp tục học</span>
                        <ArrowRight size={14} />
                      </Link>
                      <button
                        type="button"
                        className="btn nut-phu btn-sm text-danger rounded-pill"
                        title="Rời lớp học"
                        onClick={() => xuLyRoiLop(lop._id, lop.title)}
                      >
                        <LogOut size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

