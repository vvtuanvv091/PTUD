import { useState } from 'react';
import { MessageSquare, Pin, Send, Trash2 } from 'lucide-react';
import goiApi, { layThongBaoLoi } from '../../services/goiApi';
import { suDungXacThuc } from '../../context/NguCanhXacThuc';
import { suDungThongBao } from '../../context/NguCanhThongBao';
import { AnhDaiDien, NhanVaiTro, TrangThaiTrong } from '../ThanhPhanChung';
import { dinhDangNgayGio } from '../../utils/dinhDang';

export function TabBangTin({ idLop, dsThongBao, coQuyenQuanLy, duocBinhLuan, khiTaiLai }) {
  const { nguoiDung } = suDungXacThuc();
  const thongBao = suDungThongBao();

  const [tieuDe, datTieuDe] = useState('');
  const [noiDung, datNoiDung] = useState('');
  const [ghimLenDau, datGhimLenDau] = useState(false);
  const [dangDang, datDangDang] = useState(false);
  const [binhLuanNhap, datBinhLuanNhap] = useState({});

  const xuLyDangThongBao = async (e) => {
    e.preventDefault();
    datDangDang(true);
    try {
      await goiApi.post(`/courses/${idLop}/announcements`, {
        title: tieuDe,
        content: noiDung,
        isPinned: ghimLenDau,
      });
      thongBao.thanhCong('Đã đăng thông báo lên bảng tin');
      datTieuDe('');
      datNoiDung('');
      datGhimLenDau(false);
      await khiTaiLai();
    } catch (err) {
      thongBao.loi(layThongBaoLoi(err));
    } finally {
      datDangDang(false);
    }
  };

  const xuLyGhim = async (idTb) => {
    try {
      const res = await goiApi.patch(`/announcements/${idTb}/pin`);
      thongBao.thongTin(res.data.message);
      await khiTaiLai();
    } catch (err) {
      thongBao.loi(layThongBaoLoi(err));
    }
  };

  const xuLyXoaTb = async (idTb) => {
    if (!window.confirm('Xóa thông báo này?')) return;
    try {
      await goiApi.delete(`/announcements/${idTb}`);
      thongBao.thongTin('Đã xóa thông báo');
      await khiTaiLai();
    } catch (err) {
      thongBao.loi(layThongBaoLoi(err));
    }
  };

  const xuLyGuiBinhLuan = async (e, idTb) => {
    e.preventDefault();
    const text = (binhLuanNhap[idTb] || '').trim();
    if (!text) return;
    try {
      await goiApi.post(`/announcements/${idTb}/comments`, { content: text });
      datBinhLuanNhap((p) => ({ ...p, [idTb]: '' }));
      await khiTaiLai();
    } catch (err) {
      thongBao.loi(layThongBaoLoi(err));
    }
  };

  const xuLyXoaBinhLuan = async (idTb, idBl) => {
    try {
      await goiApi.delete(`/announcements/${idTb}/comments/${idBl}`);
      await khiTaiLai();
    } catch (err) {
      thongBao.loi(layThongBaoLoi(err));
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      {coQuyenQuanLy && (
        <div className="the-bang-dieu-khien p-4">
          <h3 className="h6 fw-bold mb-3">Đăng thông báo mới cho lớp</h3>
          <form onSubmit={xuLyDangThongBao} className="d-flex flex-column gap-3">
            <input
              className="form-control"
              placeholder="Tiêu đề thông báo..."
              value={tieuDe}
              onChange={(e) => datTieuDe(e.target.value)}
              required
            />
            <textarea
              className="form-control"
              rows={3}
              placeholder="Nội dung thông báo, dặn dò hoặc tài liệu bổ sung..."
              value={noiDung}
              onChange={(e) => datNoiDung(e.target.value)}
              required
            />
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div className="form-check">
                <input
                  id="ghimTb"
                  type="checkbox"
                  className="form-check-input"
                  checked={ghimLenDau}
                  onChange={(e) => datGhimLenDau(e.target.checked)}
                />
                <label className="form-check-label small" htmlFor="ghimTb">
                  Ghim thông báo lên đầu bảng tin
                </label>
              </div>
              <button type="submit" className="nut-hanh-dong-do btn-sm" disabled={dangDang}>
                <Send size={14} /> {dangDang ? 'Đang đăng...' : 'Đăng thông báo'}
              </button>
            </div>
          </form>
        </div>
      )}

      {dsThongBao.length === 0 ? (
        <div className="the-bang-dieu-khien">
          <TrangThaiTrong
            bieuTuong={MessageSquare}
            tieuDe="Bảng tin lớp chưa có bài đăng"
            moTa={duocBinhLuan ? 'Các thông báo và trao đổi giữa giảng viên và sinh viên sẽ xuất hiện tại đây.' : 'Ghi danh vào lớp để theo dõi bảng tin và tham gia thảo luận.'}
          />
        </div>
      ) : (
        dsThongBao.map((tb) => (
          <div className="the-bang-dieu-khien p-4" key={tb._id}>
            <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
              <div className="d-flex align-items-center gap-2">
                <AnhDaiDien
                  ten={tb.author?.fullName}
                  mauNen={tb.author?.avatarColor}
                  kichThuoc={36}
                  anh={tb.author?.avatarUrl}
                />
                <div>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className="fw-semibold small">{tb.author?.fullName}</span>
                    <NhanVaiTro vaiTro={tb.author?.role} />
                    {tb.isPinned && (
                      <span className="nhan-trang-thai nhan-canh-bao">
                        <Pin size={11} /> Đã ghim
                      </span>
                    )}
                  </div>
                  <div className="small text-secondary so-thang-hang">
                    {dinhDangNgayGio(tb.createdAt)}
                  </div>
                </div>
              </div>

              {coQuyenQuanLy && (
                <div className="d-flex gap-1">
                  <button
                    type="button"
                    className="btn nut-phu btn-sm"
                    title={tb.isPinned ? 'Bỏ ghim' : 'Ghim bài'}
                    onClick={() => xuLyGhim(tb._id)}
                  >
                    <Pin size={13} />
                  </button>
                  <button
                    type="button"
                    className="btn nut-phu btn-sm text-danger"
                    title="Xóa thông báo"
                    onClick={() => xuLyXoaTb(tb._id)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>

            <h4 className="h6 fw-bold mt-2 mb-1">{tb.title}</h4>
            <p className="small mb-3" style={{ whiteSpace: 'pre-line' }}>
              {tb.content}
            </p>

            {/* Binh luan */}
            <div className="border-top pt-3 d-flex flex-column gap-2">
              {(tb.comments || []).map((bl) => {
                const duocXoa =
                  coQuyenQuanLy || String(bl.author?._id) === String(nguoiDung?._id);
                return (
                  <div
                    key={bl._id}
                    className="d-flex align-items-start justify-content-between gap-2 p-2 px-3 rounded-3"
                    style={{ backgroundColor: 'var(--mau-be-mat-phu)' }}
                  >
                    <div className="d-flex align-items-start gap-2 min-w-0">
                      <AnhDaiDien
                        ten={bl.author?.fullName}
                        mauNen={bl.author?.avatarColor}
                        kichThuoc={26}
                        anh={bl.author?.avatarUrl}
                      />
                      <div className="small">
                        <span className="fw-semibold">{bl.author?.fullName}</span>{' '}
                        <span className="text-secondary" style={{ fontSize: '0.75rem' }}>
                          {dinhDangNgayGio(bl.createdAt)}
                        </span>
                        <div className="mt-1">{bl.content}</div>
                      </div>
                    </div>
                    {duocXoa && (
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0 text-secondary"
                        onClick={() => xuLyXoaBinhLuan(tb._id, bl._id)}
                        title="Xóa bình luận"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                );
              })}

              {duocBinhLuan && (
                <form
                  onSubmit={(e) => xuLyGuiBinhLuan(e, tb._id)}
                  className="d-flex gap-2 mt-1"
                >
                  <input
                    className="form-control form-control-sm rounded-pill px-3"
                    placeholder="Viết bình luận trao đổi..."
                    value={binhLuanNhap[tb._id] || ''}
                    onChange={(e) =>
                      datBinhLuanNhap((p) => ({ ...p, [tb._id]: e.target.value }))
                    }
                  />
                  <button type="submit" className="btn btn-danger btn-sm rounded-pill px-3">
                    Gửi
                  </button>
                </form>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

