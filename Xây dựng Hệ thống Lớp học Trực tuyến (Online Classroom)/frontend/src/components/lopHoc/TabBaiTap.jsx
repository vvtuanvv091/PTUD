import { useEffect, useState } from 'react';
import {
  ClipboardList,
  Download,
  Edit3,
  Plus,
  Send,
  Trash2,
} from 'lucide-react';
import goiApi, { layThongBaoLoi, taoDuongDanTep } from '../../services/goiApi';
import { suDungThongBao } from '../../context/NguCanhThongBao';
import { AnhDaiDien, HopThoai, NhanHanNop, TrangThaiTrong } from '../ThanhPhanChung';
import {
  chuyenGiaTriNgayGioInput,
  dinhDangHanNopTuongDoi,
  dinhDangNgayGio,
} from '../../utils/dinhDang';

const BAI_TAP_TRONG = {
  title: '',
  description: '',
  dueDate: '',
  maxScore: 10,
  allowLateSubmission: true,
};

export function TabBaiTap({
  idLop,
  dsBaiTap,
  idBaiTapBanDau,
  coQuyenQuanLy,
  laSinhVien,
  daGhiDanh,
  khiTaiLai,
}) {
  const thongBao = suDungThongBao();
  const [baiTapChonId, datBaiTapChonId] = useState(idBaiTapBanDau || dsBaiTap[0]?._id || '');

  // Form GV tao / sua bai tap
  const [moFormBaiTap, datMoFormBaiTap] = useState(false);
  const [idSuaBt, datIdSuaBt] = useState(null);
  const [bieuMauBt, datBieuMauBt] = useState(BAI_TAP_TRONG);
  const [tepDeBai, datTepDeBai] = useState(null);
  const [dangLuuBt, datDangLuuBt] = useState(false);

  // GV xem bai nop & cham diem
  const [duLieuCham, datDuLieuCham] = useState(null);
  const [boLocNop, datBoLocNop] = useState('all');
  const [nhapDiem, datNhapDiem] = useState({});
  const [dangChamId, datDangChamId] = useState('');

  // SV nop bai
  const [noiDungNop, datNoiDungNop] = useState('');
  const [tepNop, datTepNop] = useState(null);
  const [dangNop, datDangNop] = useState(false);

  useEffect(() => {
    if (idBaiTapBanDau && dsBaiTap.some((b) => b._id === idBaiTapBanDau)) {
      datBaiTapChonId(idBaiTapBanDau);
    } else if (!dsBaiTap.some((b) => b._id === baiTapChonId)) {
      datBaiTapChonId(dsBaiTap[0]?._id || '');
    }
  }, [dsBaiTap, idBaiTapBanDau, baiTapChonId]);

  const baiTapChon = dsBaiTap.find((b) => b._id === baiTapChonId) || null;

  useEffect(() => {
    if (laSinhVien && baiTapChon) {
      datNoiDungNop(baiTapChon.mySubmission?.textContent || '');
      datTepNop(null);
    }
  }, [laSinhVien, baiTapChon]);

  const taiDanhSachBaiNop = async (idBt = baiTapChonId, loc = boLocNop) => {
    if (!coQuyenQuanLy || !idBt) return;
    try {
      const params = {};
      if (loc === 'submitted' || loc === 'graded') params.status = loc;
      if (loc === 'late') params.late = 'true';
      const res = await goiApi.get(`/assignments/${idBt}/submissions`, { params });
      datDuLieuCham(res.data.data);

      const khoiTao = {};
      res.data.data.submissions.forEach((s) => {
        khoiTao[s._id] = {
          score: s.score !== null && s.score !== undefined ? String(s.score) : '',
          feedback: s.feedback || '',
        };
      });
      datNhapDiem(khoiTao);
    } catch (err) {
      thongBao.loi(layThongBaoLoi(err));
    }
  };

  useEffect(() => {
    if (coQuyenQuanLy && baiTapChonId) {
      taiDanhSachBaiNop(baiTapChonId, boLocNop);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coQuyenQuanLy, baiTapChonId, boLocNop]);

  const moTaoBaiTap = () => {
    datIdSuaBt(null);
    datBieuMauBt({
      ...BAI_TAP_TRONG,
      dueDate: chuyenGiaTriNgayGioInput(new Date(Date.now() + 7 * 86400000)),
    });
    datTepDeBai(null);
    datMoFormBaiTap(true);
  };

  const moSuaBaiTap = (bt) => {
    datIdSuaBt(bt._id);
    datBieuMauBt({
      title: bt.title,
      description: bt.description,
      dueDate: chuyenGiaTriNgayGioInput(bt.dueDate),
      maxScore: bt.maxScore,
      allowLateSubmission: bt.allowLateSubmission,
    });
    datTepDeBai(null);
    datMoFormBaiTap(true);
  };

  const xuLyLuuBaiTap = async (e) => {
    e.preventDefault();
    datDangLuuBt(true);
    try {
      const fd = new FormData();
      Object.entries(bieuMauBt).forEach(([k, v]) => fd.append(k, v));
      if (tepDeBai) fd.append('attachment', tepDeBai);

      if (idSuaBt) {
        await goiApi.put(`/assignments/${idSuaBt}`, fd);
        thongBao.thanhCong('Đã cập nhật bài tập');
      } else {
        await goiApi.post(`/courses/${idLop}/assignments`, fd);
        thongBao.thanhCong('Đã tạo bài tập mới');
      }
      datMoFormBaiTap(false);
      await khiTaiLai();
    } catch (err) {
      thongBao.loi(layThongBaoLoi(err));
    } finally {
      datDangLuuBt(false);
    }
  };

  const xuLyXoaBaiTap = async (bt) => {
    if (!window.confirm(`Xóa bài tập "${bt.title}" và toàn bộ bài nộp của sinh viên?`)) return;
    try {
      await goiApi.delete(`/assignments/${bt._id}`);
      thongBao.thongTin('Đã xóa bài tập');
      await khiTaiLai();
    } catch (err) {
      thongBao.loi(layThongBaoLoi(err));
    }
  };

  const xuLyNopBai = async (e) => {
    e.preventDefault();
    if (!baiTapChon) return;
    datDangNop(true);
    try {
      const fd = new FormData();
      fd.append('textContent', noiDungNop);
      if (tepNop) fd.append('file', tepNop);

      const res = await goiApi.post(`/assignments/${baiTapChon._id}/submit`, fd);
      thongBao.thanhCong(res.data.message);
      datTepNop(null);
      await khiTaiLai();
    } catch (err) {
      thongBao.loi(layThongBaoLoi(err, 'Không thể nộp bài'));
    } finally {
      datDangNop(false);
    }
  };

  const xuLyLuuDiem = async (idBaiNop) => {
    const giaTri = nhapDiem[idBaiNop];
    if (!giaTri || giaTri.score === '') {
      thongBao.loi('Vui lòng nhập điểm số');
      return;
    }
    datDangChamId(idBaiNop);
    try {
      await goiApi.put(`/submissions/${idBaiNop}/grade`, {
        score: giaTri.score,
        feedback: giaTri.feedback,
      });
      thongBao.thanhCong('Đã lưu điểm và nhận xét');
      await Promise.all([taiDanhSachBaiNop(baiTapChonId, boLocNop), khiTaiLai()]);
    } catch (err) {
      thongBao.loi(layThongBaoLoi(err));
    } finally {
      datDangChamId('');
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div>
          <h2 className="h5 fw-bold mb-0">Bài tập &amp; Chấm điểm</h2>
          <div className="small text-secondary">{dsBaiTap.length} bài tập trong học phần này</div>
        </div>
        {coQuyenQuanLy && (
          <button type="button" className="nut-hanh-dong-do btn-sm" onClick={moTaoBaiTap}>
            <Plus size={15} /> Tạo bài tập mới
          </button>
        )}
      </div>

      {dsBaiTap.length === 0 ? (
        <div className="the-bang-dieu-khien">
          <TrangThaiTrong
            bieuTuong={ClipboardList}
            tieuDe="Chưa có bài tập nào"
            moTa={coQuyenQuanLy ? 'Tạo bài tập đầu tiên để sinh viên nộp bài và theo dõi điểm số.' : 'Giảng viên chưa giao bài tập cho lớp này.'}
          />
        </div>
      ) : (
        <div className="row g-4">
          {/* Cot danh sach bai tap */}
          <div className="col-lg-4">
            <div className="the-bang-dieu-khien overflow-hidden">
              <div className="dau-the-bang">
                <span className="fw-bold small">Danh sách bài tập</span>
              </div>
              <div className="list-group list-group-flush">
                {dsBaiTap.map((bt) => {
                  const dangChon = bt._id === baiTapChonId;
                  return (
                    <button
                      key={bt._id}
                      type="button"
                      className={`list-group-item list-group-item-action text-start px-3 py-3 ${
                        dangChon ? 'border-start border-4 border-danger' : ''
                      }`}
                      style={dangChon ? { backgroundColor: 'var(--mau-chu-dao-nhat)' } : undefined}
                      onClick={() => datBaiTapChonId(bt._id)}
                    >
                      <div className="fw-semibold small mb-1">{bt.title}</div>
                      <div className="small text-secondary so-thang-hang mb-2">
                        Hạn: {dinhDangNgayGio(bt.dueDate)}
                      </div>
                      <div className="d-flex flex-wrap gap-1">
                        {laSinhVien && <NhanHanNop trangThai={bt.deadlineState} />}
                        {coQuyenQuanLy && bt.stats && (
                          <>
                            <span className="nhan-trang-thai nhan-thong-tin so-thang-hang">
                              {bt.stats.submittedCount}/{bt.stats.enrolledCount} đã nộp
                            </span>
                            {bt.stats.pendingGradingCount > 0 && (
                              <span className="nhan-trang-thai nhan-canh-bao so-thang-hang">
                                {bt.stats.pendingGradingCount} chờ chấm
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Cot chi tiet bai tap + nop bai / cham diem */}
          <div className="col-lg-8 d-flex flex-column gap-4">
            {baiTapChon && (
              <>
                <div className="the-bang-dieu-khien p-4">
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                    <div>
                      <h3 className="h5 fw-bold mb-1">{baiTapChon.title}</h3>
                      <div className="d-flex flex-wrap gap-3 small text-secondary so-thang-hang">
                        <span>
                          Hạn nộp: <strong>{dinhDangNgayGio(baiTapChon.dueDate)}</strong> ({dinhDangHanNopTuongDoi(baiTapChon.dueDate)})
                        </span>
                        <span>Thang điểm: <strong>{baiTapChon.maxScore}</strong></span>
                        <span>{baiTapChon.allowLateSubmission ? 'Cho phép nộp trễ' : 'Không nhận bài trễ'}</span>
                      </div>
                    </div>

                    {coQuyenQuanLy && (
                      <div className="d-flex gap-2">
                        <button type="button" className="btn nut-phu btn-sm" onClick={() => moSuaBaiTap(baiTapChon)}>
                          <Edit3 size={13} /> Sửa
                        </button>
                        <button type="button" className="btn nut-phu btn-sm text-danger" onClick={() => xuLyXoaBaiTap(baiTapChon)}>
                          <Trash2 size={13} /> Xóa
                        </button>
                      </div>
                    )}
                  </div>

                  <hr className="my-3" />
                  <div className="small fw-semibold text-secondary mb-1">Yêu cầu đề bài</div>
                  <p className="mb-0" style={{ whiteSpace: 'pre-line' }}>
                    {baiTapChon.description}
                  </p>

                  {baiTapChon.attachmentUrl && (
                    <div className="mt-3">
                      <a
                        href={taoDuongDanTep(baiTapChon.attachmentUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline-danger btn-sm rounded-pill d-inline-flex align-items-center gap-1"
                      >
                        <Download size={14} /> Tải tệp đề bài ({baiTapChon.attachmentName || 'Tệp đính kèm'})
                      </a>
                    </div>
                  )}
                </div>

                {/* Khu vuc Sinh vien nop bai */}
                {laSinhVien && (
                  <div className="the-bang-dieu-khien p-4">
                    <h4 className="h6 fw-bold mb-3">Bài nộp của bạn</h4>
                    {!daGhiDanh ? (
                      <div className="small text-secondary">Bạn cần ghi danh vào lớp để nộp bài tập này.</div>
                    ) : baiTapChon.mySubmission?.status === 'graded' ? (
                      <div className="d-flex flex-column gap-3">
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <span className="nhan-trang-thai nhan-thanh-cong chu-don-cach">
                            Điểm: {baiTapChon.mySubmission.score}/{baiTapChon.maxScore}
                          </span>
                          {baiTapChon.mySubmission.isLate && (
                            <span className="nhan-trang-thai nhan-nguy-hiem">Nộp trễ hạn</span>
                          )}
                        </div>
                        {baiTapChon.mySubmission.feedback && (
                          <div className="p-3 rounded-3 border small">
                            <strong>Nhận xét của giảng viên:</strong> {baiTapChon.mySubmission.feedback}
                          </div>
                        )}
                        {baiTapChon.mySubmission.textContent && (
                          <div className="small text-secondary">
                            <strong>Nội dung đã nộp:</strong> {baiTapChon.mySubmission.textContent}
                          </div>
                        )}
                        {baiTapChon.mySubmission.fileUrl && (
                          <div>
                            <a
                              href={taoDuongDanTep(baiTapChon.mySubmission.fileUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-outline-danger btn-sm rounded-pill"
                            >
                              <Download size={14} /> Tải tệp đã nộp ({baiTapChon.mySubmission.fileName})
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <form onSubmit={xuLyNopBai} className="d-flex flex-column gap-3">
                        {baiTapChon.mySubmission && (
                          <div className="alert alert-info py-2 px-3 small mb-0">
                            Bạn đã nộp lúc {dinhDangNgayGio(baiTapChon.mySubmission.submittedAt)}. Có thể cập nhật lại trước khi giảng viên chấm điểm.
                          </div>
                        )}
                        <div>
                          <label className="form-label">Nội dung trả lời / Link GitHub</label>
                          <textarea
                            className="form-control"
                            rows={4}
                            placeholder="Nhập câu trả lời hoặc đường dẫn mã nguồn..."
                            value={noiDungNop}
                            onChange={(e) => datNoiDungNop(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="form-label">Đính kèm tệp bài làm (PDF, ZIP, DOCX, ảnh, code...)</label>
                          <input
                            type="file"
                            className="form-control"
                            onChange={(e) => datTepNop(e.target.files?.[0] || null)}
                          />
                        </div>
                        <div>
                          <button type="submit" className="nut-hanh-dong-do btn-sm" disabled={dangNop}>
                            <Send size={14} />
                            <span>{dangNop ? 'Đang nộp...' : baiTapChon.mySubmission ? 'Cập nhật bài nộp' : 'Nộp bài tập'}</span>
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* Khu vuc Giang vien cham diem */}
                {coQuyenQuanLy && duLieuCham && (
                  <div className="the-bang-dieu-khien">
                    <div className="dau-the-bang">
                      <div>
                        <h4 className="h6 fw-bold mb-0">Bài nộp của sinh viên &amp; Chấm điểm</h4>
                        <div className="small text-secondary so-thang-hang">
                          Đã nộp {duLieuCham.summary.submittedCount}/{duLieuCham.summary.enrolledCount} • Đã chấm{' '}
                          {duLieuCham.summary.gradedCount} • Trễ hạn {duLieuCham.summary.lateCount} • Chưa nộp{' '}
                          {duLieuCham.summary.missingCount}
                        </div>
                      </div>
                      <div className="d-flex gap-1 flex-wrap">
                        {[
                          { ma: 'all', nhan: 'Tất cả' },
                          { ma: 'submitted', nhan: 'Chờ chấm' },
                          { ma: 'graded', nhan: 'Đã chấm' },
                          { ma: 'late', nhan: 'Nộp trễ' },
                        ].map((loc) => (
                          <button
                            key={loc.ma}
                            type="button"
                            className={`btn btn-sm rounded-pill ${boLocNop === loc.ma ? 'btn-danger' : 'nut-phu'}`}
                            onClick={() => datBoLocNop(loc.ma)}
                          >
                            {loc.nhan}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="than-the-bang d-flex flex-column gap-3">
                      {duLieuCham.submissions.length === 0 ? (
                        <div className="text-center py-4 small text-secondary">
                          Chưa có bài nộp nào khớp bộ lọc hiện tại.
                        </div>
                      ) : (
                        duLieuCham.submissions.map((bn) => {
                          const oNhap = nhapDiem[bn._id] || { score: '', feedback: '' };
                          return (
                            <div key={bn._id} className="p-3 rounded-3 border">
                              <div className="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-2">
                                <div className="d-flex align-items-center gap-2">
                                  <AnhDaiDien
                                    ten={bn.student?.fullName}
                                    mauNen={bn.student?.avatarColor}
                                    kichThuoc={34}
                                    anh={bn.student?.avatarUrl}
                                  />
                                  <div>
                                    <div className="fw-semibold small">
                                      {bn.student?.fullName}{' '}
                                      <span className="text-secondary chu-don-cach">
                                        ({bn.student?.studentCode})
                                      </span>
                                    </div>
                                    <div className="small text-secondary so-thang-hang">
                                      Nộp lúc {dinhDangNgayGio(bn.submittedAt)}
                                    </div>
                                  </div>
                                </div>
                                <div className="d-flex gap-1">
                                  <span className={`nhan-trang-thai ${bn.isLate ? 'nhan-nguy-hiem' : 'nhan-thanh-cong'}`}>
                                    {bn.isLate ? 'Nộp trễ hạn' : 'Đúng hạn'}
                                  </span>
                                  {bn.status === 'graded' ? (
                                    <span className="nhan-trang-thai nhan-chu-dao chu-don-cach">
                                      Đã chấm: {bn.score}/{baiTapChon.maxScore}
                                    </span>
                                  ) : (
                                    <span className="nhan-trang-thai nhan-canh-bao">Chờ chấm</span>
                                  )}
                                </div>
                              </div>

                              {bn.textContent && (
                                <div
                                  className="p-2 px-3 rounded small mb-2"
                                  style={{ backgroundColor: 'var(--mau-be-mat-phu)' }}
                                >
                                  {bn.textContent}
                                </div>
                              )}

                              {bn.fileUrl && (
                                <div className="mb-2">
                                  <a
                                    href={taoDuongDanTep(bn.fileUrl)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn btn-outline-danger btn-sm rounded-pill d-inline-flex align-items-center gap-1"
                                  >
                                    <Download size={13} /> {bn.fileName || 'Tải tệp sinh viên nộp'}
                                  </a>
                                </div>
                              )}

                              <div className="row g-2 align-items-end pt-2 border-top">
                                <div className="col-sm-3">
                                  <label className="form-label small mb-1">
                                    Điểm (0 – {baiTapChon.maxScore})
                                  </label>
                                  <input
                                    type="number"
                                    step="0.25"
                                    min={0}
                                    max={baiTapChon.maxScore}
                                    className="form-control form-control-sm chu-don-cach"
                                    value={oNhap.score}
                                    onChange={(e) =>
                                      datNhapDiem((p) => ({
                                        ...p,
                                        [bn._id]: { ...oNhap, score: e.target.value },
                                      }))
                                    }
                                  />
                                </div>
                                <div className="col-sm-6">
                                  <label className="form-label small mb-1">Nhận xét cho sinh viên</label>
                                  <input
                                    className="form-control form-control-sm"
                                    placeholder="Góp ý chi tiết..."
                                    value={oNhap.feedback}
                                    onChange={(e) =>
                                      datNhapDiem((p) => ({
                                        ...p,
                                        [bn._id]: { ...oNhap, feedback: e.target.value },
                                      }))
                                    }
                                  />
                                </div>
                                <div className="col-sm-3">
                                  <button
                                    type="button"
                                    className="btn btn-danger btn-sm rounded-pill w-100"
                                    disabled={dangChamId === bn._id}
                                    onClick={() => xuLyLuuDiem(bn._id)}
                                  >
                                    {dangChamId === bn._id ? 'Đang lưu...' : 'Lưu điểm'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}

                      {duLieuCham.missingStudents.length > 0 && (
                        <div className="pt-3 border-top">
                          <div className="small fw-bold text-secondary mb-2">
                            Sinh viên chưa nộp ({duLieuCham.missingStudents.length})
                          </div>
                          <div className="d-flex flex-wrap gap-2">
                            {duLieuCham.missingStudents.map((sv) => (
                              <span key={sv._id} className="nhan-trang-thai nhan-trung-tinh">
                                {sv.fullName} ({sv.studentCode})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Hop thoai tao/sua bai tap */}
      <HopThoai
        hienThi={moFormBaiTap}
        tieuDe={idSuaBt ? 'Cập nhật bài tập' : 'Giao bài tập mới'}
        khiDong={() => datMoFormBaiTap(false)}
        kichCo="modal-lg"
      >
        <form onSubmit={xuLyLuuBaiTap} className="row g-3">
          <div className="col-12">
            <label className="form-label">Tiêu đề bài tập</label>
            <input
              className="form-control"
              value={bieuMauBt.title}
              onChange={(e) => datBieuMauBt((p) => ({ ...p, title: e.target.value }))}
              required
            />
          </div>
          <div className="col-12">
            <label className="form-label">Yêu cầu đề bài</label>
            <textarea
              className="form-control"
              rows={4}
              value={bieuMauBt.description}
              onChange={(e) => datBieuMauBt((p) => ({ ...p, description: e.target.value }))}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Hạn chót nộp bài</label>
            <input
              type="datetime-local"
              className="form-control"
              value={bieuMauBt.dueDate}
              onChange={(e) => datBieuMauBt((p) => ({ ...p, dueDate: e.target.value }))}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Thang điểm tối đa</label>
            <input
              type="number"
              min={1}
              max={100}
              className="form-control"
              value={bieuMauBt.maxScore}
              onChange={(e) => datBieuMauBt((p) => ({ ...p, maxScore: e.target.value }))}
            />
          </div>
          <div className="col-12">
            <label className="form-label">Tệp đề bài đính kèm (tùy chọn)</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) => datTepDeBai(e.target.files?.[0] || null)}
            />
          </div>
          <div className="col-12">
            <div className="form-check">
              <input
                id="choNopTre"
                type="checkbox"
                className="form-check-input"
                checked={bieuMauBt.allowLateSubmission}
                onChange={(e) =>
                  datBieuMauBt((p) => ({ ...p, allowLateSubmission: e.target.checked }))
                }
              />
              <label className="form-check-label small" htmlFor="choNopTre">
                Cho phép sinh viên nộp sau hạn chót (tự đánh dấu nộp trễ)
              </label>
            </div>
          </div>
          <div className="col-12 d-flex justify-content-end gap-2">
            <button type="button" className="btn nut-phu" onClick={() => datMoFormBaiTap(false)}>
              Hủy
            </button>
            <button type="submit" className="btn btn-danger" disabled={dangLuuBt}>
              {dangLuuBt ? 'Đang lưu...' : 'Lưu bài tập'}
            </button>
          </div>
        </form>
      </HopThoai>
    </div>
  );
}

