import { useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Download,
  ExternalLink,
  FileText,
  Lock,
  PlayCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import goiApi, { layThongBaoLoi, taoDuongDanTep } from '../../services/goiApi';
import { suDungThongBao } from '../../context/NguCanhThongBao';
import { HopThoai, TrangThaiTrong } from '../ThanhPhanChung';
import { dinhDangDungLuong, taoLinkVideoNhung } from '../../utils/dinhDang';

const TAI_LIEU_TRONG = {
  moduleTitle: 'Tuần 1: Nội dung bài giảng',
  title: '',
  type: 'pdf',
  description: '',
  videoUrl: '',
  content: '',
  durationMinutes: 20,
};

export function TabTaiLieu({
  idLop,
  dsTaiLieu,
  thongTinPhu,
  coQuyenQuanLy,
  laSinhVien,
  khiTaiLai,
}) {
  const thongBao = suDungThongBao();
  const [moThem, datMoThem] = useState(false);
  const [bieuMau, datBieuMau] = useState(TAI_LIEU_TRONG);
  const [tepChon, datTepChon] = useState(null);
  const [dangLuu, datDangLuu] = useState(false);
  const [baiDangXem, datBaiDangXem] = useState(null);
  const [dangDanhDauId, datDangDanhDauId] = useState('');

  const cacChuong = useMemo(() => {
    const nhom = new Map();
    dsTaiLieu.forEach((tl) => {
      const khoa = tl.moduleTitle || 'Học liệu chung';
      if (!nhom.has(khoa)) nhom.set(khoa, []);
      nhom.get(khoa).push(tl);
    });
    return Array.from(nhom.entries());
  }, [dsTaiLieu]);

  const xuLyTaoTaiLieu = async (e) => {
    e.preventDefault();
    datDangLuu(true);
    try {
      const duLieu = new FormData();
      Object.entries(bieuMau).forEach(([k, v]) => duLieu.append(k, v));
      if (tepChon) duLieu.append('file', tepChon);

      await goiApi.post(`/courses/${idLop}/materials`, duLieu);
      thongBao.thanhCong('Đã thêm học liệu vào lớp');
      datBieuMau(TAI_LIEU_TRONG);
      datTepChon(null);
      datMoThem(false);
      await khiTaiLai();
    } catch (err) {
      thongBao.loi(layThongBaoLoi(err, 'Không thể tải tài liệu lên'));
    } finally {
      datDangLuu(false);
    }
  };

  const xuLyXoaTaiLieu = async (tl) => {
    if (!window.confirm(`Xóa tài liệu "${tl.title}"?`)) return;
    try {
      await goiApi.delete(`/materials/${tl._id}`);
      thongBao.thongTin('Đã xóa tài liệu');
      await khiTaiLai();
    } catch (err) {
      thongBao.loi(layThongBaoLoi(err));
    }
  };

  const xuLyDanhDau = async (tl) => {
    datDangDanhDauId(tl._id);
    try {
      const res = await goiApi.post(`/materials/${tl._id}/toggle-complete`);
      thongBao.thanhCong(res.data.message);
      await khiTaiLai();
    } catch (err) {
      thongBao.loi(layThongBaoLoi(err));
    } finally {
      datDangDanhDauId('');
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div>
          <h2 className="h5 fw-bold mb-0">Học liệu &amp; Bài giảng</h2>
          <div className="small text-secondary">
            {dsTaiLieu.length} tài liệu (PDF, Video bài giảng, Bài đọc)
            {laSinhVien && thongTinPhu?.canAccessFullContent && (
              <>
                {' '}• Đã hoàn thành{' '}
                <strong className="text-danger so-thang-hang">
                  {thongTinPhu.completedCount}/{thongTinPhu.total} ({thongTinPhu.progressPercent}%)
                </strong>
              </>
            )}
          </div>
        </div>

        {coQuyenQuanLy && (
          <button type="button" className="nut-hanh-dong-do btn-sm" onClick={() => datMoThem(true)}>
            <Plus size={15} /> Đăng tài liệu mới
          </button>
        )}
      </div>

      {!thongTinPhu?.canAccessFullContent && laSinhVien && (
        <div className="alert alert-warning d-flex align-items-center gap-2 small mb-0">
          <Lock size={16} />
          <span>Bạn đang xem trước mục lục. Hãy bấm <strong>Ghi danh vào lớp học này</strong> để mở khóa tệp PDF, video và bài đọc.</span>
        </div>
      )}

      {dsTaiLieu.length === 0 ? (
        <div className="the-bang-dieu-khien">
          <TrangThaiTrong
            bieuTuong={BookOpen}
            tieuDe="Chưa có học liệu nào"
            moTa={coQuyenQuanLy ? 'Đăng tải file PDF, video bài giảng hoặc bài đọc để sinh viên bắt đầu học.' : 'Giảng viên chưa đăng tài liệu cho lớp này.'}
          />
        </div>
      ) : (
        cacChuong.map(([tenChuong, dsMuc]) => (
          <div className="the-bang-dieu-khien" key={tenChuong}>
            <div className="dau-the-bang">
              <h3 className="h6 fw-bold mb-0">{tenChuong}</h3>
              <span className="nhan-trang-thai nhan-trung-tinh so-thang-hang">{dsMuc.length} mục</span>
            </div>
            <div className="list-group list-group-flush">
              {dsMuc.map((tl) => {
                const icon =
                  tl.type === 'pdf' ? (
                    <FileText size={18} className="text-danger" />
                  ) : tl.type === 'video' ? (
                    <PlayCircle size={18} className="text-primary" />
                  ) : (
                    <BookOpen size={18} className="text-success" />
                  );

                return (
                  <div
                    key={tl._id}
                    className="list-group-item px-4 py-3 d-flex align-items-start justify-content-between gap-3 flex-wrap"
                  >
                    <div className="d-flex align-items-start gap-3 flex-grow-1 min-w-0">
                      <span
                        className="d-inline-flex align-items-center justify-content-center rounded-3 flex-shrink-0 mt-1"
                        style={{ width: 38, height: 38, backgroundColor: 'var(--mau-be-mat-phu)' }}
                      >
                        {icon}
                      </span>
                      <div className="min-w-0">
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <span className="fw-semibold">{tl.title}</span>
                          <span className="nhan-trang-thai nhan-trung-tinh text-uppercase">{tl.type}</span>
                          <span className="small text-secondary so-thang-hang">~{tl.durationMinutes} phút</span>
                        </div>
                        {tl.description && (
                          <p className="small text-secondary mb-0 mt-1">{tl.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2 flex-shrink-0">
                      {tl.locked ? (
                        <span className="nhan-trang-thai nhan-trung-tinh">
                          <Lock size={12} /> Khóa
                        </span>
                      ) : (
                        <>
                          {tl.type === 'pdf' && tl.fileUrl && (
                            <a
                              href={taoDuongDanTep(tl.fileUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-outline-danger btn-sm rounded-pill d-inline-flex align-items-center gap-1"
                            >
                              <Download size={14} />
                              <span>Tải / Xem PDF {tl.fileSize ? `(${dinhDangDungLuong(tl.fileSize)})` : ''}</span>
                            </a>
                          )}

                          {(tl.type === 'video' || tl.type === 'reading') && (
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm rounded-pill"
                              onClick={() => datBaiDangXem(tl)}
                            >
                              {tl.type === 'video' ? 'Xem video' : 'Đọc bài'}
                            </button>
                          )}

                          {laSinhVien && (
                            <button
                              type="button"
                              className={`btn btn-sm rounded-pill d-inline-flex align-items-center gap-1 ${
                                tl.isCompleted ? 'btn-success' : 'nut-phu'
                              }`}
                              disabled={dangDanhDauId === tl._id}
                              onClick={() => xuLyDanhDau(tl)}
                            >
                              {tl.isCompleted ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                              <span>{tl.isCompleted ? 'Đã học' : 'Đánh dấu xong'}</span>
                            </button>
                          )}
                        </>
                      )}

                      {coQuyenQuanLy && (
                        <button
                          type="button"
                          className="btn nut-phu btn-sm text-danger"
                          title="Xóa tài liệu"
                          onClick={() => xuLyXoaTaiLieu(tl)}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Hop thoai xem video / bai doc */}
      <HopThoai
        hienThi={Boolean(baiDangXem)}
        tieuDe={baiDangXem?.title || ''}
        khiDong={() => datBaiDangXem(null)}
        kichCo="modal-lg"
      >
        {baiDangXem?.type === 'video' && (
          <div>
            {taoLinkVideoNhung(baiDangXem.videoUrl) ? (
              <div className="ratio ratio-16x9 rounded overflow-hidden mb-3">
                <iframe
                  src={taoLinkVideoNhung(baiDangXem.videoUrl)}
                  title={baiDangXem.title}
                  allowFullScreen
                />
              </div>
            ) : null}
            <a
              href={baiDangXem.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline-danger btn-sm rounded-pill d-inline-flex align-items-center gap-1"
            >
              <ExternalLink size={14} /> Mở đường dẫn video gốc
            </a>
          </div>
        )}
        {baiDangXem?.type === 'reading' && (
          <div className="noi-dung-bai-doc">{baiDangXem.content}</div>
        )}
      </HopThoai>

      {/* Hop thoai dang tai lieu moi */}
      <HopThoai
        hienThi={moThem}
        tieuDe="Đăng tài liệu học tập mới"
        khiDong={() => datMoThem(false)}
        kichCo="modal-lg"
      >
        <form onSubmit={xuLyTaoTaiLieu} className="row g-3">
          <div className="col-md-7">
            <label className="form-label">Tiêu đề tài liệu</label>
            <input
              className="form-control"
              value={bieuMau.title}
              onChange={(e) => datBieuMau((p) => ({ ...p, title: e.target.value }))}
              required
            />
          </div>
          <div className="col-md-5">
            <label className="form-label">Chương / Tuần học</label>
            <input
              className="form-control"
              value={bieuMau.moduleTitle}
              onChange={(e) => datBieuMau((p) => ({ ...p, moduleTitle: e.target.value }))}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Định dạng tài liệu</label>
            <select
              className="form-select"
              value={bieuMau.type}
              onChange={(e) => datBieuMau((p) => ({ ...p, type: e.target.value }))}
            >
              <option value="pdf">Tệp PDF / Slide / Tài liệu tải lên</option>
              <option value="video">Link Video (YouTube / Vimeo)</option>
              <option value="reading">Bài đọc trực tuyến</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Thời lượng dự kiến (phút)</label>
            <input
              type="number"
              min={1}
              className="form-control"
              value={bieuMau.durationMinutes}
              onChange={(e) => datBieuMau((p) => ({ ...p, durationMinutes: e.target.value }))}
            />
          </div>

          <div className="col-12">
            <label className="form-label">Mô tả ngắn</label>
            <input
              className="form-control"
              value={bieuMau.description}
              onChange={(e) => datBieuMau((p) => ({ ...p, description: e.target.value }))}
            />
          </div>

          {bieuMau.type === 'pdf' && (
            <div className="col-12">
              <label className="form-label">Chọn tệp tải lên (.pdf, .doc, .docx, .ppt, .pptx, .txt)</label>
              <input
                type="file"
                className="form-control"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                onChange={(e) => datTepChon(e.target.files?.[0] || null)}
                required
              />
            </div>
          )}

          {bieuMau.type === 'video' && (
            <div className="col-12">
              <label className="form-label">Đường dẫn Video (YouTube / Vimeo)</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://www.youtube.com/watch?v=..."
                value={bieuMau.videoUrl}
                onChange={(e) => datBieuMau((p) => ({ ...p, videoUrl: e.target.value }))}
                required
              />
            </div>
          )}

          {bieuMau.type === 'reading' && (
            <div className="col-12">
              <label className="form-label">Nội dung bài đọc</label>
              <textarea
                className="form-control"
                rows={6}
                value={bieuMau.content}
                onChange={(e) => datBieuMau((p) => ({ ...p, content: e.target.value }))}
                required
              />
            </div>
          )}

          <div className="col-12 d-flex justify-content-end gap-2 mt-2">
            <button type="button" className="btn nut-phu" onClick={() => datMoThem(false)}>
              Hủy
            </button>
            <button type="submit" className="btn btn-danger" disabled={dangLuu}>
              {dangLuu ? 'Đang đăng...' : 'Đăng tài liệu'}
            </button>
          </div>
        </form>
      </HopThoai>
    </div>
  );
}

