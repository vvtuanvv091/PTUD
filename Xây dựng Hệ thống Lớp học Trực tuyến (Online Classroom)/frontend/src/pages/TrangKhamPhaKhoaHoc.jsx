import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  KeyRound,
  Search,
  Users,
} from 'lucide-react';
import goiApi, { layThongBaoLoi } from '../services/goiApi';
import { suDungXacThuc } from '../context/NguCanhXacThuc';
import { suDungThongBao } from '../context/NguCanhThongBao';
import { AnhDaiDien, KhungChoTai, TrangThaiTrong } from '../components/ThanhPhanChung';
import { AnhBiaKhoaHoc } from '../components/AnhBiaKhoaHoc';
import { BannerTrangCongKhai } from '../components/BannerTrangCongKhai';

export function TrangKhamPhaKhoaHoc() {
  const { nguoiDung, daDangNhap } = suDungXacThuc();
  const thongBao = suDungThongBao();
  const [thamSoUrl] = useSearchParams();

  const [dsKhoaHoc, datDsKhoaHoc] = useState([]);
  const [dsDanhMuc, datDsDanhMuc] = useState([]);
  const [danhMucChon, datDanhMucChon] = useState(thamSoUrl.get('category') || '');
  const [tuKhoa, datTuKhoa] = useState('');
  const [maThamGia, datMaThamGia] = useState('');
  const [dangVaoBangMa, datDangVaoBangMa] = useState(false);
  const [dangGhiDanhId, datDangGhiDanhId] = useState('');
  const [dangTai, datDangTai] = useState(true);

  const taiDuLieu = async (q = tuKhoa, dm = danhMucChon) => {
    datDangTai(true);
    try {
      const thamSo = {};
      if (q.trim()) thamSo.search = q.trim();
      if (dm) thamSo.category = dm;

      const [resLop, resDm] = await Promise.all([
        goiApi.get('/courses', { params: thamSo }),
        goiApi.get('/categories'),
      ]);
      datDsKhoaHoc(resLop.data.data);
      datDsDanhMuc(resDm.data.data);
    } catch (err) {
      thongBao.loi(layThongBaoLoi(err, 'Không thể tải danh sách khóa học'));
    } finally {
      datDangTai(false);
    }
  };

  useEffect(() => {
    const dmBanDau = thamSoUrl.get('category') || '';
    datDanhMucChon(dmBanDau);
    taiDuLieu('', dmBanDau);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const xuLyGhiDanh = async (idLop) => {
    datDangGhiDanhId(idLop);
    try {
      const res = await goiApi.post('/enrollments', { courseId: idLop });
      thongBao.thanhCong(res.data.message);
      await taiDuLieu(tuKhoa, danhMucChon);
    } catch (err) {
      thongBao.loi(layThongBaoLoi(err, 'Không thể ghi danh khóa học'));
    } finally {
      datDangGhiDanhId('');
    }
  };

  const xuLyVaoBangMa = async (e) => {
    e.preventDefault();
    if (!maThamGia.trim()) return;
    datDangVaoBangMa(true);
    try {
      const res = await goiApi.post('/enrollments', { joinCode: maThamGia.trim() });
      thongBao.thanhCong(res.data.message);
      datMaThamGia('');
      await taiDuLieu(tuKhoa, danhMucChon);
    } catch (err) {
      thongBao.loi(layThongBaoLoi(err, 'Mã lớp không hợp lệ hoặc không thể ghi danh'));
    } finally {
      datDangVaoBangMa(false);
    }
  };

  return (
    <>
      {!daDangNhap && (
        <BannerTrangCongKhai
          nhan="Khóa học"
          dongPhu="DANH SÁCH LỚP HỌC ĐANG MỞ"
          tieuDe="Khám Phá Khóa Học"
          moTa="Duyệt các lớp học tín chỉ theo chuyên ngành đào tạo, xem thông tin giảng viên và đăng ký ghi danh trực tuyến."
        />
      )}
      <div className={!daDangNhap ? 'container py-4' : ''}>
        <div className="d-flex flex-column gap-4">
          {daDangNhap && (
            <div className="d-flex align-items-end justify-content-between flex-wrap gap-3">
              <div>
                <h1 className="h4 fw-bold mb-1">Khám phá khóa học đang mở</h1>
                <p className="text-secondary small mb-0">
                  Tìm theo tên học phần, mã môn hoặc lọc theo danh mục đào tạo.
                </p>
              </div>

              {nguoiDung?.role === 'student' && (
                <form onSubmit={xuLyVaoBangMa} className="d-flex align-items-center gap-2">
                  <div className="input-group input-group-sm" style={{ width: 245 }}>
                    <span className="input-group-text">
                      <KeyRound size={14} />
                    </span>
                    <input
                      type="text"
                      className="form-control chu-don-cach text-uppercase"
                      placeholder="Mã lớp (VD: MERN26)"
                      value={maThamGia}
                      onChange={(e) => datMaThamGia(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-danger btn-sm rounded-pill px-3 text-nowrap"
                    disabled={dangVaoBangMa}
                  >
                    {dangVaoBangMa ? 'Đang vào...' : 'Vào bằng mã'}
                  </button>
                </form>
              )}
            </div>
          )}

        <div className="the-bang-dieu-khien p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              taiDuLieu(tuKhoa, danhMucChon);
            }}
            className="row g-2 align-items-center mb-3"
          >
            <div className="col-md-8 col-lg-6">
              <div className="input-group">
                <span className="input-group-text">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm tên khóa học, mã học phần (WEB401, DB204...)..."
                  value={tuKhoa}
                  onChange={(e) => datTuKhoa(e.target.value)}
                />
              </div>
            </div>
            <div className="col-auto">
              <button type="submit" className="btn btn-danger rounded-pill px-4">
                Tìm kiếm
              </button>
            </div>
            {(tuKhoa || danhMucChon) && (
              <div className="col-auto">
                <button
                  type="button"
                  className="btn nut-phu rounded-pill"
                  onClick={() => {
                    datTuKhoa('');
                    datDanhMucChon('');
                    taiDuLieu('', '');
                  }}
                >
                  Xóa lọc
                </button>
              </div>
            )}
          </form>

          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className={`btn btn-sm rounded-pill ${danhMucChon === '' ? 'btn-danger' : 'nut-phu'}`}
              onClick={() => {
                datDanhMucChon('');
                taiDuLieu(tuKhoa, '');
              }}
            >
              Tất cả danh mục
            </button>
            {dsDanhMuc.map((dm) => (
              <button
                key={dm._id}
                type="button"
                className={`btn btn-sm rounded-pill ${danhMucChon === dm._id ? 'btn-danger' : 'nut-phu'}`}
                onClick={() => {
                  datDanhMucChon(dm._id);
                  taiDuLieu(tuKhoa, dm._id);
                }}
              >
                {dm.name} <span className="opacity-75 so-thang-hang">({dm.courseCount})</span>
              </button>
            ))}
          </div>
        </div>

        {dangTai ? (
          <KhungChoTai soDong={3} />
        ) : dsKhoaHoc.length === 0 ? (
          <div className="the-bang-dieu-khien">
            <TrangThaiTrong
              bieuTuong={BookOpen}
              tieuDe="Không tìm thấy khóa học phù hợp"
              moTa="Thử tìm với từ khóa khác hoặc chọn lại tất cả danh mục."
            />
          </div>
        ) : (
          <div className="row g-4">
            {dsKhoaHoc.map((lop) => (
              <div className="col-md-6 col-xl-4" key={lop._id}>
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
                      <span className="small fw-medium" style={{ opacity: 0.94 }}>{lop.category?.name}</span>
                    </div>
                    <h2 className="h6 fw-bold mb-1 text-white" style={{ minHeight: '2.6rem' }}>
                      {lop.title}
                    </h2>
                    <div className="small" style={{ opacity: 0.9 }}>{lop.semester}</div>
                  </AnhBiaKhoaHoc>

                  <div className="p-3 d-flex flex-column flex-grow-1">
                    <p
                      className="small text-secondary mb-3 flex-grow-1"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {lop.description}
                    </p>

                    <div className="d-flex align-items-center gap-2 mb-3">
                      <AnhDaiDien
                        ten={lop.teacher?.fullName}
                        mauNen={lop.teacher?.avatarColor}
                        kichThuoc={28}
                        anh={lop.teacher?.avatarUrl}
                      />
                      <div className="small min-w-0">
                        <div className="fw-semibold text-truncate">{lop.teacher?.fullName}</div>
                        <div className="text-secondary text-truncate" style={{ fontSize: '0.76rem' }}>
                          {lop.schedule}
                        </div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center justify-content-between small text-secondary py-2 border-top border-bottom mb-3 so-thang-hang">
                      <span className="d-inline-flex align-items-center gap-1">
                        <Users size={14} className="text-danger" /> {lop.studentCount}/{lop.maxStudents} SV
                      </span>
                      <span className="d-inline-flex align-items-center gap-1">
                        <BookOpen size={14} /> {lop.materialCount} học liệu
                      </span>
                      <span className="d-inline-flex align-items-center gap-1">
                        <Calendar size={14} /> {lop.assignmentCount} bài tập
                      </span>
                    </div>

                    <div className="d-flex gap-2">
                      {!daDangNhap ? (
                        <Link
                          to="/login"
                          className="btn btn-outline-danger btn-sm rounded-pill w-100 fw-semibold"
                        >
                          Đăng nhập để ghi danh
                        </Link>
                      ) : nguoiDung?.role === 'student' ? (
                        lop.isEnrolled ? (
                          <Link
                            to={`/courses/${lop._id}`}
                            className="btn btn-danger btn-sm rounded-pill w-100 d-inline-flex align-items-center justify-content-center gap-2"
                          >
                            <CheckCircle2 size={15} />
                            <span>Vào lớp học ({lop.myEnrollment?.progressPercent || 0}%)</span>
                          </Link>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm rounded-pill flex-grow-1"
                              disabled={dangGhiDanhId === lop._id}
                              onClick={() => xuLyGhiDanh(lop._id)}
                            >
                              {dangGhiDanhId === lop._id ? 'Đang ghi danh...' : 'Ghi danh ngay'}
                            </button>
                            <Link to={`/courses/${lop._id}`} className="btn nut-phu btn-sm rounded-pill">
                              Xem trước
                            </Link>
                          </>
                        )
                      ) : (
                        <Link
                          to={`/courses/${lop._id}`}
                          className="btn btn-outline-danger btn-sm rounded-pill w-100 d-inline-flex align-items-center justify-content-center gap-1"
                        >
                          <span>Mở không gian lớp</span>
                          <ArrowRight size={14} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}

