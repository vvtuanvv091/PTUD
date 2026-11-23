import { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Check,
  ClipboardList,
  Copy,
  MessageSquare,
  Users,
} from 'lucide-react';
import goiApi, { layThongBaoLoi, taoDuongDanTep } from '../services/goiApi';
import { suDungXacThuc } from '../context/NguCanhXacThuc';
import { suDungThongBao } from '../context/NguCanhThongBao';
import { AnhDaiDien, KhungChoTai } from '../components/ThanhPhanChung';
import { TabTaiLieu } from '../components/lopHoc/TabTaiLieu';
import { TabBaiTap } from '../components/lopHoc/TabBaiTap';
import { TabBangTin } from '../components/lopHoc/TabBangTin';
import { TabSinhVienBangDiem } from '../components/lopHoc/TabSinhVienBangDiem';
import { layTrangThaiKhoaHoc } from '../utils/dinhDang';

export function TrangChiTietKhoaHoc() {
  const { id } = useParams();
  const [thamSoUrl, datThamSoUrl] = useSearchParams();
  const { nguoiDung } = suDungXacThuc();
  const thongBao = suDungThongBao();

  const tabDangMo = thamSoUrl.get('tab') || 'materials';
  const idBaiTapBanDau = thamSoUrl.get('assignment') || '';

  const [khoaHoc, datKhoaHoc] = useState(null);
  const [dsTaiLieu, datDsTaiLieu] = useState([]);
  const [thongTinTaiLieu, datThongTinTaiLieu] = useState(null);
  const [dsBaiTap, datDsBaiTap] = useState([]);
  const [dsThongBao, datDsThongBao] = useState([]);
  const [dangTai, datDangTai] = useState(true);
  const [dangGhiDanh, datDangGhiDanh] = useState(false);
  const [daSaoChepMa, datDaSaoChepMa] = useState(false);

  const taiKhongGianLop = useCallback(async () => {
    try {
      const [resLop, resTl, resBt] = await Promise.all([
        goiApi.get(`/courses/${id}`),
        goiApi.get(`/courses/${id}/materials`),
        goiApi.get(`/courses/${id}/assignments`),
      ]);
      const dlLop = resLop.data.data;
      datKhoaHoc(dlLop);
      datDsTaiLieu(resTl.data.data);
      datThongTinTaiLieu(resTl.data.meta);
      datDsBaiTap(resBt.data.data);

      if (dlLop?.isOwner || dlLop?.isEnrolled) {
        const resTb = await goiApi
          .get(`/courses/${id}/announcements`)
          .catch(() => ({ data: { data: [] } }));
        datDsThongBao(resTb.data.data || []);
      } else {
        datDsThongBao([]);
      }
    } catch (err) {
      thongBao.loi(layThongBaoLoi(err, 'Không thể tải không gian lớp học'));
    } finally {
      datDangTai(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    datDangTai(true);
    taiKhongGianLop();
  }, [taiKhongGianLop]);

  const xuLyGhiDanh = async () => {
    datDangGhiDanh(true);
    try {
      const res = await goiApi.post('/enrollments', { courseId: id });
      thongBao.thanhCong(res.data.message);
      await taiKhongGianLop();
    } catch (err) {
      thongBao.loi(layThongBaoLoi(err));
    } finally {
      datDangGhiDanh(false);
    }
  };

  const saoChepMaLop = () => {
    if (!khoaHoc?.joinCode) return;
    navigator.clipboard?.writeText(khoaHoc.joinCode);
    datDaSaoChepMa(true);
    thongBao.thongTin(`Đã sao chép mã tham gia lớp: ${khoaHoc.joinCode}`);
    setTimeout(() => datDaSaoChepMa(false), 2000);
  };

  if (dangTai) return <KhungChoTai soDong={4} />;

  if (!khoaHoc) {
    return (
      <div className="the-bang-dieu-khien p-5 text-center">
        <h5 className="fw-bold mb-2">Không tìm thấy lớp học</h5>
        <Link to="/dashboard" className="btn btn-danger btn-sm rounded-pill px-4">
          Quay về tổng quan
        </Link>
      </div>
    );
  }

  const coQuyenQuanLy = Boolean(khoaHoc.isOwner);
  const laSinhVien = nguoiDung?.role === 'student';
  const ttLop = layTrangThaiKhoaHoc(khoaHoc.status);
  const anhBiaUrl = taoDuongDanTep(khoaHoc.thumbnailUrl);

  return (
    <div className="d-flex flex-column gap-4">
      <div>
        <Link
          to={
            nguoiDung?.role === 'teacher'
              ? '/teacher/courses'
              : nguoiDung?.role === 'admin'
              ? '/admin/courses'
              : '/my-courses'
          }
          className="small text-secondary d-inline-flex align-items-center gap-1 mb-2"
        >
          <ArrowLeft size={14} /> Quay lại danh sách lớp
        </Link>

        <div
          className="khung-bia-chi-tiet-lop"
          style={{ backgroundColor: khoaHoc.bannerColor || '#DB303A' }}
        >
          {anhBiaUrl && (
            <>
              <img src={anhBiaUrl} alt={khoaHoc.title} className="hinh-nen-bia-lop" />
              <div className="lop-phu-bia-lop" aria-hidden="true" />
            </>
          )}

          <div className="row g-3 align-items-end noi-dung-bia-lop">
            <div className="col-lg-8">
              <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                <span
                  className="chu-don-cach small fw-semibold px-2 py-1 rounded"
                  style={{ backgroundColor: 'rgba(255,255,255,0.22)' }}
                >
                  {khoaHoc.code}
                </span>
                <span className="small" style={{ opacity: 0.94 }}>{khoaHoc.category?.name}</span>
                <span className={`nhan-trang-thai ${ttLop.lopCss}`}>{ttLop.nhan}</span>
              </div>

              <h1 className="h3 fw-bold mb-2 text-white">{khoaHoc.title}</h1>
              <p className="small mb-3" style={{ opacity: 0.93, maxWidth: '68ch' }}>
                {khoaHoc.description}
              </p>

              <div className="d-flex align-items-center gap-4 flex-wrap small" style={{ opacity: 0.94 }}>
                <span className="d-inline-flex align-items-center gap-2">
                  <AnhDaiDien
                    ten={khoaHoc.teacher?.fullName}
                    mauNen="rgba(255,255,255,0.2)"
                    kichThuoc={26}
                    anh={khoaHoc.teacher?.avatarUrl}
                  />
                  <span>GV: {khoaHoc.teacher?.fullName}</span>
                </span>
                <span className="d-inline-flex align-items-center gap-1">
                  <Calendar size={14} /> {khoaHoc.schedule}
                </span>
                <span className="d-inline-flex align-items-center gap-1 so-thang-hang">
                  <Users size={14} /> {khoaHoc.studentCount}/{khoaHoc.maxStudents} sinh viên
                </span>
              </div>
            </div>

            <div className="col-lg-4 d-flex flex-column align-items-lg-end gap-2">
              {coQuyenQuanLy && (
                <button
                  type="button"
                  onClick={saoChepMaLop}
                  className="btn btn-sm text-white rounded-pill px-3 d-inline-flex align-items-center gap-2"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.38)',
                  }}
                >
                  <span>
                    Mã lớp: <strong className="chu-don-cach">{khoaHoc.joinCode}</strong>
                  </span>
                  {daSaoChepMa ? <Check size={14} /> : <Copy size={14} />}
                </button>
              )}

              {laSinhVien && !khoaHoc.isEnrolled && (
                <button
                  type="button"
                  className="btn btn-light rounded-pill px-4 fw-bold text-danger"
                  disabled={dangGhiDanh}
                  onClick={xuLyGhiDanh}
                >
                  {dangGhiDanh ? 'Đang ghi danh...' : 'Ghi danh vào lớp học này'}
                </button>
              )}

              {laSinhVien && khoaHoc.isEnrolled && (
                <div
                  className="p-3 rounded-3 w-100"
                  style={{ backgroundColor: 'rgba(0,0,0,0.3)', maxWidth: 280 }}
                >
                  <div className="d-flex justify-content-between small mb-1">
                    <span>Tiến độ hoàn thành</span>
                    <strong className="so-thang-hang">{thongTinTaiLieu?.progressPercent || 0}%</strong>
                  </div>
                  <div className="progress" style={{ height: 7, backgroundColor: 'rgba(255,255,255,0.25)' }}>
                    <div
                      className="progress-bar bg-white"
                      style={{ width: `${thongTinTaiLieu?.progressPercent || 0}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ul className="nav tab-lop-hoc">
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link ${tabDangMo === 'materials' ? 'active' : ''}`}
            onClick={() => datThamSoUrl({ tab: 'materials' })}
          >
            <BookOpen size={16} />
            <span>Tài liệu &amp; Bài học ({dsTaiLieu.length})</span>
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link ${tabDangMo === 'assignments' ? 'active' : ''}`}
            onClick={() => datThamSoUrl({ tab: 'assignments' })}
          >
            <ClipboardList size={16} />
            <span>Bài tập ({dsBaiTap.length})</span>
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link ${tabDangMo === 'stream' ? 'active' : ''}`}
            onClick={() => datThamSoUrl({ tab: 'stream' })}
          >
            <MessageSquare size={16} />
            <span>Bảng tin &amp; Thảo luận ({dsThongBao.length})</span>
          </button>
        </li>
        {coQuyenQuanLy && (
          <li className="nav-item">
            <button
              type="button"
              className={`nav-link ${tabDangMo === 'students' ? 'active' : ''}`}
              onClick={() => datThamSoUrl({ tab: 'students' })}
            >
              <Users size={16} />
              <span>Sinh viên &amp; Bảng điểm ({khoaHoc.studentCount})</span>
            </button>
          </li>
        )}
      </ul>

      {tabDangMo === 'materials' && (
        <TabTaiLieu
          idLop={khoaHoc._id}
          dsTaiLieu={dsTaiLieu}
          thongTinPhu={thongTinTaiLieu}
          coQuyenQuanLy={coQuyenQuanLy}
          laSinhVien={laSinhVien}
          khiTaiLai={taiKhongGianLop}
        />
      )}

      {tabDangMo === 'assignments' && (
        <TabBaiTap
          idLop={khoaHoc._id}
          dsBaiTap={dsBaiTap}
          idBaiTapBanDau={idBaiTapBanDau}
          coQuyenQuanLy={coQuyenQuanLy}
          laSinhVien={laSinhVien}
          daGhiDanh={Boolean(khoaHoc.isEnrolled)}
          khiTaiLai={taiKhongGianLop}
        />
      )}

      {tabDangMo === 'stream' && (
        <TabBangTin
          idLop={khoaHoc._id}
          dsThongBao={dsThongBao}
          coQuyenQuanLy={coQuyenQuanLy}
          duocBinhLuan={coQuyenQuanLy || Boolean(khoaHoc.isEnrolled)}
          khiTaiLai={taiKhongGianLop}
        />
      )}

      {tabDangMo === 'students' && coQuyenQuanLy && (
        <TabSinhVienBangDiem idLop={khoaHoc._id} maLop={khoaHoc.code} />
      )}
    </div>
  );
}

