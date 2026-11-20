import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Copy, Edit3, ImagePlus, Plus, Trash2, Users } from 'lucide-react';
import goiApi, { layThongBaoLoi } from '../services/goiApi';
import { suDungThongBao } from '../context/NguCanhThongBao';
import { HopThoai, KhungChoTai, TrangThaiTrong } from '../components/ThanhPhanChung';
import { ANH_BIA_MAC_DINH, AnhBiaKhoaHoc } from '../components/AnhBiaKhoaHoc';
import { layTrangThaiKhoaHoc } from '../utils/dinhDang';

const MAU_BIA_LOP = ['#DB303A', '#B7212B', '#0284C7', '#166534', '#7C3AED', '#D97706'];

const BIEU_MAU_TRONG = {
  title: '',
  code: '',
  category: '',
  description: '',
  syllabusSummary: '',
  semester: 'HK1 2026 - 2027',
  schedule: 'Thứ 3 & Thứ 5 • 18:30 - 20:30',
  joinCode: '',
  bannerColor: '#DB303A',
  thumbnailUrl: '/images/bia-web-mern.jpg',
  status: 'published',
  maxStudents: 50,
};

export function TrangQuanLyLopGiangVien() {
  const thongBao = suDungThongBao();
  const [dsKhoaHoc, datDsKhoaHoc] = useState([]);
  const [dsDanhMuc, datDsDanhMuc] = useState([]);
  const [locTrangThai, datLocTrangThai] = useState('');
  const [dangTai, datDangTai] = useState(true);

  const [moHopThoai, datMoHopThoai] = useState(false);
  const [idDangSua, datIdDangSua] = useState(null);
  const [bieuMau, datBieuMau] = useState(BIEU_MAU_TRONG);
  const [tepAnhBia, datTepAnhBia] = useState(null);
  const [xemTruocAnh, datXemTruocAnh] = useState('');
  const [dangLuu, datDangLuu] = useState(false);

  const taiDuLieu = async (tt = locTrangThai) => {
    datDangTai(true);
    try {
      const thamSo = { mine: 'true' };
      if (tt) thamSo.status = tt;
      const [resLop, resDm] = await Promise.all([
        goiApi.get('/courses', { params: thamSo }),
        goiApi.get('/categories'),
      ]);
      datDsKhoaHoc(resLop.data.data);
      datDsDanhMuc(resDm.data.data);
    } catch (err) {
      thongBao.loi(layThongBaoLoi(err, 'Không thể tải danh sách lớp của bạn'));
    } finally {
      datDangTai(false);
    }
  };

  useEffect(() => {
    taiDuLieu('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const moTaoMoi = () => {
    datIdDangSua(null);
    datTepAnhBia(null);
    datXemTruocAnh('');
    datBieuMau({ ...BIEU_MAU_TRONG, category: dsDanhMuc[0]?._id || '' });
    datMoHopThoai(true);
  };

  const moSuaLop = (lop) => {
    datIdDangSua(lop._id);
    datTepAnhBia(null);
    datXemTruocAnh('');
    datBieuMau({
      title: lop.title,
      code: lop.code,
      category: lop.category?._id || '',
      description: lop.description,
      syllabusSummary: lop.syllabusSummary || '',
      semester: lop.semester || '',
      schedule: lop.schedule || '',
      joinCode: lop.joinCode || '',
      bannerColor: lop.bannerColor || '#DB303A',
      thumbnailUrl: lop.thumbnailUrl || '',
      status: lop.status,
      maxStudents: lop.maxStudents || 50,
    });
    datMoHopThoai(true);
  };

  const xuLyChonTepAnh = (e) => {
    const tep = e.target.files?.[0] || null;
    datTepAnhBia(tep);
    if (tep) {
      datXemTruocAnh(URL.createObjectURL(tep));
    } else {
      datXemTruocAnh('');
    }
  };

  const xuLyLuuLop = async (e) => {
    e.preventDefault();
    datDangLuu(true);
    try {
      const duLieuGui = new FormData();
      Object.entries(bieuMau).forEach(([k, v]) => duLieuGui.append(k, v ?? ''));
      if (tepAnhBia) {
        duLieuGui.append('thumbnail', tepAnhBia);
      }

      if (idDangSua) {
        await goiApi.put(`/courses/${idDangSua}`, duLieuGui);
        thongBao.thanhCong('Đã cập nhật thông tin khóa học');
      } else {
        await goiApi.post('/courses', duLieuGui);
        thongBao.thanhCong('Đã tạo lớp học mới thành công');
      }
      datMoHopThoai(false);
      await taiDuLieu(locTrangThai);
    } catch (err) {
      thongBao.loi(layThongBaoLoi(err, 'Không thể lưu khóa học'));
    } finally {
      datDangLuu(false);
    }
  };

  const xuLyXoaLop = async (lop) => {
    if (
      !window.confirm(
        `Xóa khóa học "${lop.title}"? Toàn bộ tài liệu, bài tập và bài nộp trong lớp cũng sẽ bị xóa.`
      )
    ) {
      return;
    }
    try {
      await goiApi.delete(`/courses/${lop._id}`);
      thongBao.thongTin(`Đã xóa lớp ${lop.code}`);
      await taiDuLieu(locTrangThai);
    } catch (err) {
      thongBao.loi(layThongBaoLoi(err));
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex align-items-end justify-content-between flex-wrap gap-3">
        <div>
          <h1 className="h4 fw-bold mb-1">Lớp học đang phụ trách</h1>
          <p className="text-secondary small mb-0">
            Tạo mới, chọn hoặc tải ảnh bìa lớp học và quản trị học liệu, bài tập, bảng điểm sinh viên.
          </p>
        </div>
        <button type="button" className="nut-hanh-dong-do btn-sm" onClick={moTaoMoi}>
          <Plus size={16} />
          <span>Tạo khóa học mới</span>
        </button>
      </div>

      <div className="d-flex gap-2 flex-wrap">
        {[
          { ma: '', nhan: 'Tất cả trạng thái' },
          { ma: 'published', nhan: 'Đang mở' },
          { ma: 'draft', nhan: 'Bản nháp' },
          { ma: 'archived', nhan: 'Đã lưu trữ' },
        ].map((tab) => (
          <button
            key={tab.ma}
            type="button"
            className={`btn btn-sm rounded-pill ${locTrangThai === tab.ma ? 'btn-danger' : 'nut-phu'}`}
            onClick={() => {
              datLocTrangThai(tab.ma);
              taiDuLieu(tab.ma);
            }}
          >
            {tab.nhan}
          </button>
        ))}
      </div>

      {dangTai ? (
        <KhungChoTai soDong={3} />
      ) : dsKhoaHoc.length === 0 ? (
        <div className="the-bang-dieu-khien">
          <TrangThaiTrong
            bieuTuong={BookOpen}
            tieuDe="Chưa có lớp học nào"
            moTa="Bấm Tạo khóa học mới để mở lớp đầu tiên và chia sẻ mã tham gia cho sinh viên."
            hanhDong={
              <button type="button" className="btn btn-danger btn-sm rounded-pill px-3" onClick={moTaoMoi}>
                Tạo khóa học mới
              </button>
            }
          />
        </div>
      ) : (
        <div className="row g-4">
          {dsKhoaHoc.map((lop) => {
            const tt = layTrangThaiKhoaHoc(lop.status);
            return (
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
                      <span className={`nhan-trang-thai ${tt.lopCss}`}>{tt.nhan}</span>
                    </div>
                    <h2 className="h6 fw-bold text-white mb-1" style={{ minHeight: '2.6rem' }}>
                      {lop.title}
                    </h2>
                    <div className="small" style={{ opacity: 0.9 }}>
                      {lop.category?.name} • {lop.semester}
                    </div>
                  </AnhBiaKhoaHoc>

                  <div className="p-3 d-flex flex-column flex-grow-1">
                    <div className="d-flex align-items-center justify-content-between p-2 px-3 rounded border mb-3 small">
                      <span className="text-secondary">
                        Mã tham gia: <strong className="chu-don-cach">{lop.joinCode}</strong>
                      </span>
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0 text-danger"
                        title="Sao chép mã lớp"
                        onClick={() => {
                          navigator.clipboard?.writeText(lop.joinCode);
                          thongBao.thongTin(`Đã sao chép mã lớp ${lop.joinCode}`);
                        }}
                      >
                        <Copy size={14} />
                      </button>
                    </div>

                    <p
                      className="small text-secondary mb-3 flex-grow-1"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {lop.description}
                    </p>

                    <div className="d-flex justify-content-between small text-secondary py-2 border-top mb-3 so-thang-hang">
                      <span className="d-inline-flex align-items-center gap-1">
                        <Users size={14} className="text-danger" /> {lop.studentCount}/{lop.maxStudents} SV
                      </span>
                      <span>{lop.materialCount} học liệu</span>
                      <span>{lop.assignmentCount} bài tập</span>
                    </div>

                    <div className="d-flex gap-2">
                      <Link
                        to={`/courses/${lop._id}`}
                        className="btn btn-danger btn-sm rounded-pill flex-grow-1 d-inline-flex align-items-center justify-content-center gap-1"
                      >
                        <span>Vào quản lý lớp</span>
                        <ArrowRight size={14} />
                      </Link>
                      <button
                        type="button"
                        className="btn nut-phu btn-sm"
                        title="Sửa thông tin lớp"
                        onClick={() => moSuaLop(lop)}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn nut-phu btn-sm text-danger"
                        title="Xóa khóa học"
                        onClick={() => xuLyXoaLop(lop)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <HopThoai
        hienThi={moHopThoai}
        tieuDe={idDangSua ? 'Cập nhật thông tin lớp học' : 'Tạo lớp học mới'}
        khiDong={() => datMoHopThoai(false)}
        kichCo="modal-lg"
      >
        <form onSubmit={xuLyLuuLop}>
          <div className="row g-3">
            {/* Xem truoc bia lop truc tiep */}
            <div className="col-12">
              <div className="rounded-3 overflow-hidden">
                <AnhBiaKhoaHoc
                  anhBia={xemTruocAnh || bieuMau.thumbnailUrl}
                  mauNen={bieuMau.bannerColor}
                  moTaAnh="Xem trước ảnh bìa lớp học"
                >
                  <div className="small chu-don-cach mb-1" style={{ opacity: 0.9 }}>
                    {bieuMau.code || 'MÃ MÔN'} • {bieuMau.semester}
                  </div>
                  <div className="fw-bold fs-6">
                    {bieuMau.title || 'Xem trước tiêu đề khóa học'}
                  </div>
                </AnhBiaKhoaHoc>
              </div>
            </div>

            <div className="col-md-8">
              <label className="form-label">Tên khóa học / Lớp học</label>
              <input
                className="form-control"
                value={bieuMau.title}
                onChange={(e) => datBieuMau((p) => ({ ...p, title: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Mã học phần</label>
              <input
                className="form-control chu-don-cach text-uppercase"
                value={bieuMau.code}
                onChange={(e) => datBieuMau((p) => ({ ...p, code: e.target.value }))}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Danh mục đào tạo</label>
              <select
                className="form-select"
                value={bieuMau.category}
                onChange={(e) => datBieuMau((p) => ({ ...p, category: e.target.value }))}
                required
              >
                <option value="">-- Chọn danh mục --</option>
                {dsDanhMuc.map((dm) => (
                  <option key={dm._id} value={dm._id}>
                    {dm.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Trạng thái</label>
              <select
                className="form-select"
                value={bieuMau.status}
                onChange={(e) => datBieuMau((p) => ({ ...p, status: e.target.value }))}
              >
                <option value="published">Mở ghi danh</option>
                <option value="draft">Bản nháp</option>
                <option value="archived">Lưu trữ</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Sĩ số tối đa</label>
              <input
                type="number"
                min={1}
                className="form-control"
                value={bieuMau.maxStudents}
                onChange={(e) => datBieuMau((p) => ({ ...p, maxStudents: e.target.value }))}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Học kỳ</label>
              <input
                className="form-control"
                value={bieuMau.semester}
                onChange={(e) => datBieuMau((p) => ({ ...p, semester: e.target.value }))}
              />
            </div>
            <div className="col-md-5">
              <label className="form-label">Lịch học</label>
              <input
                className="form-control"
                value={bieuMau.schedule}
                onChange={(e) => datBieuMau((p) => ({ ...p, schedule: e.target.value }))}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Mã tham gia</label>
              <input
                className="form-control chu-don-cach text-uppercase"
                value={bieuMau.joinCode}
                onChange={(e) => datBieuMau((p) => ({ ...p, joinCode: e.target.value }))}
                placeholder="Tự sinh nếu trống"
              />
            </div>
            <div className="col-12">
              <label className="form-label">Mô tả khóa học</label>
              <textarea
                className="form-control"
                rows={3}
                value={bieuMau.description}
                onChange={(e) => datBieuMau((p) => ({ ...p, description: e.target.value }))}
                required
              />
            </div>

            {/* Chon anh bia co san hoac tai anh tu may */}
            <div className="col-12">
              <label className="form-label">Chọn ảnh bìa có sẵn</label>
              <div className="row g-2">
                {ANH_BIA_MAC_DINH.map((anh) => {
                  const dangChon = !tepAnhBia && bieuMau.thumbnailUrl === anh.duongDan;
                  return (
                    <div className="col-4 col-sm-2" key={anh.duongDan}>
                      <button
                        type="button"
                        className={`o-chon-anh-bia w-100 ${dangChon ? 'dang-chon' : ''}`}
                        onClick={() => {
                          datTepAnhBia(null);
                          datXemTruocAnh('');
                          datBieuMau((p) => ({ ...p, thumbnailUrl: anh.duongDan }));
                        }}
                      >
                        <img src={anh.duongDan} alt={anh.ten} />
                        <span>{anh.ten}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="col-md-7">
              <label className="form-label d-inline-flex align-items-center gap-1">
                <ImagePlus size={14} className="text-danger" /> Hoặc tải ảnh bìa từ máy tính (.jpg, .png, .webp)
              </label>
              <input
                type="file"
                className="form-control form-control-sm"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={xuLyChonTepAnh}
              />
            </div>

            <div className="col-md-5">
              <label className="form-label">Màu nền dự phòng</label>
              <div className="d-flex gap-2">
                {MAU_BIA_LOP.map((mau) => (
                  <button
                    key={mau}
                    type="button"
                    onClick={() => datBieuMau((p) => ({ ...p, bannerColor: mau }))}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      backgroundColor: mau,
                      border:
                        bieuMau.bannerColor === mau ? '3px solid #16212c' : '1px solid rgba(0,0,0,0.18)',
                    }}
                    aria-label={`Chọn màu ${mau}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button type="button" className="btn nut-phu" onClick={() => datMoHopThoai(false)}>
              Hủy
            </button>
            <button type="submit" className="btn btn-danger" disabled={dangLuu}>
              {dangLuu ? 'Đang lưu...' : idDangSua ? 'Lưu cập nhật' : 'Tạo lớp học'}
            </button>
          </div>
        </form>
      </HopThoai>
    </div>
  );
}
