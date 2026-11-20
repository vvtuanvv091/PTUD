import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Database,
  Download,
  Eye,
  HardDrive,
  KeyRound,
  Layers,
  RefreshCw,
  Search,
  Server,
} from 'lucide-react';
import goiApi, { layThongBaoLoi } from '../services/goiApi';
import { suDungThongBao } from '../context/NguCanhThongBao';
import { KhungChoTai, TrangThaiTrong } from '../components/ThanhPhanChung';

const dinhDangByte = (soByte) => {
  if (!soByte) return '0 B';
  const donVi = ['B', 'KB', 'MB', 'GB'];
  let giaTri = soByte;
  let i = 0;
  while (giaTri >= 1024 && i < donVi.length - 1) {
    giaTri /= 1024;
    i += 1;
  }
  return `${giaTri.toFixed(i === 0 ? 0 : 1)} ${donVi[i]}`;
};

// Lay 1 truong "de doc" lam tieu de cho moi ban ghi
const layTieuDeBanGhi = (doc) =>
  doc.fullName || doc.title || doc.name || doc.email || doc.code || doc.status || '';

export function TrangQuanLyDatabase() {
  const thongBao = suDungThongBao();
  const [tongQuan, datTongQuan] = useState(null);
  const [dangTai, datDangTai] = useState(true);
  const [loi, datLoi] = useState('');

  const [collectionChon, datCollectionChon] = useState('');
  const [duLieuBanGhi, datDuLieuBanGhi] = useState(null);
  const [trang, datTrang] = useState(1);
  const [tuKhoa, datTuKhoa] = useState('');
  const [dangTaiBanGhi, datDangTaiBanGhi] = useState(false);
  const [banGhiMo, datBanGhiMo] = useState({});

  const taiTongQuan = async () => {
    datDangTai(true);
    datLoi('');
    try {
      const res = await goiApi.get('/admin/database');
      datTongQuan(res.data.data);
    } catch (err) {
      datLoi(layThongBaoLoi(err, 'Không đọc được thông tin database'));
    } finally {
      datDangTai(false);
    }
  };

  const taiBanGhi = async (ten, soTrang = 1, q = tuKhoa) => {
    datDangTaiBanGhi(true);
    try {
      const res = await goiApi.get(`/admin/database/${ten}/documents`, {
        params: { page: soTrang, limit: 8, search: q },
      });
      datDuLieuBanGhi(res.data.data);
      datTrang(soTrang);
      datBanGhiMo({});
    } catch (err) {
      thongBao.loi(layThongBaoLoi(err));
    } finally {
      datDangTaiBanGhi(false);
    }
  };

  useEffect(() => {
    taiTongQuan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chonCollection = (ten) => {
    datCollectionChon(ten);
    datTuKhoa('');
    taiBanGhi(ten, 1, '');
    setTimeout(() => {
      document.getElementById('khung-duyet-ban-ghi')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const xuatJson = async (ten) => {
    try {
      const res = await goiApi.get(`/admin/database/${ten}/export`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tongQuan?.ketNoi?.tenDatabase || 'db'}-${ten}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      thongBao.thanhCong(`Đã xuất collection ${ten} ra tệp JSON`);
    } catch (err) {
      thongBao.loi(layThongBaoLoi(err, 'Xuất JSON thất bại'));
    }
  };

  const saoChepChuoiKetNoi = () => {
    if (!tongQuan?.ketNoi?.uri) return;
    navigator.clipboard?.writeText(`mongodb://${tongQuan.ketNoi.host}:${tongQuan.ketNoi.port}`);
    thongBao.thongTin('Đã sao chép chuỗi kết nối, dán vào MongoDB Compass để mở');
  };

  if (dangTai) return <KhungChoTai soDong={3} />;

  if (loi) {
    return (
      <div className="the-bang-dieu-khien p-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div>
          <h5 className="fw-bold text-danger mb-1">Không kết nối được database</h5>
          <p className="small text-secondary mb-0">{loi}</p>
        </div>
        <button type="button" className="btn btn-danger btn-sm" onClick={taiTongQuan}>
          Thử lại
        </button>
      </div>
    );
  }

  const { ketNoi, thongKe, collectionHeThong, collectionKhac } = tongQuan;
  const daKetNoi = ketNoi.trangThai === 'connected';
  const collectionDangXem = [...collectionHeThong, ...collectionKhac].find((c) => c.ten === collectionChon);

  const renderDongCollection = (c, laHeThong) => (
    <tr key={c.ten} className={collectionChon === c.ten ? 'dong-dang-chon' : ''}>
      <td>
        <div className="d-flex align-items-center gap-2">
          <Layers size={15} className={laHeThong ? 'text-danger' : 'text-secondary'} />
          <span className="chu-don-cach fw-semibold">{c.ten}</span>
          {!c.tonTai && <span className="nhan-trang-thai nhan-canh-bao">Chưa tạo</span>}
          {!laHeThong && <span className="nhan-trang-thai nhan-trung-tinh">Ngoài hệ thống</span>}
        </div>
        {c.moTa && <div className="small text-secondary mt-1">{c.moTa}</div>}
      </td>
      <td className="so-thang-hang fw-bold">{c.soBanGhi}</td>
      <td className="small text-secondary so-thang-hang">{dinhDangByte(c.kichThuoc)}</td>
      <td className="small so-thang-hang">{c.chiMuc.length}</td>
      <td className="text-end">
        <div className="d-inline-flex gap-2">
          <button
            type="button"
            className="btn nut-phu btn-sm d-inline-flex align-items-center gap-1"
            disabled={!c.tonTai}
            onClick={() => chonCollection(c.ten)}
          >
            <Eye size={13} /> Xem
          </button>
          <button
            type="button"
            className="btn nut-phu btn-sm d-inline-flex align-items-center gap-1"
            disabled={!c.tonTai || c.soBanGhi === 0}
            onClick={() => xuatJson(c.ten)}
          >
            <Download size={13} /> JSON
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex align-items-end justify-content-between flex-wrap gap-3">
        <div>
          <h1 className="h4 fw-bold mb-1">Quản lý cơ sở dữ liệu MongoDB</h1>
          <p className="small text-secondary mb-0">
            Theo dõi kết nối, dung lượng và dữ liệu thật trong từng collection của database{' '}
            <code className="chu-don-cach">{ketNoi.tenDatabase}</code>.
          </p>
        </div>
        <button type="button" className="btn nut-phu btn-sm d-inline-flex align-items-center gap-2" onClick={taiTongQuan}>
          <RefreshCw size={14} /> Làm mới số liệu
        </button>
      </div>

      {/* Trang thai ket noi + 4 the chi so */}
      <div className="row g-3">
        <div className="col-md-6 col-xl-3">
          <div className="the-chi-so">
            <div className="tieu-de-chi-so">TRẠNG THÁI KẾT NỐI</div>
            <div className="d-flex align-items-center gap-2 mt-1">
              <span className={`cham-trang-thai ${daKetNoi ? 'dang-song' : ''}`} />
              <span className="fw-bold">{daKetNoi ? 'Đã kết nối' : ketNoi.trangThai}</span>
            </div>
            <div className="small text-secondary mt-1 chu-don-cach">
              {ketNoi.host}:{ketNoi.port}
            </div>
            <div className="hop-bieu-tuong-chi-so hop-mau-la"><Server size={18} /></div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="the-chi-so">
            <div className="tieu-de-chi-so">COLLECTION</div>
            <div className="gia-tri-chi-so">{thongKe.soCollection}</div>
            <div className="small text-secondary mt-1">{thongKe.soChiMuc} chỉ mục</div>
            <div className="hop-bieu-tuong-chi-so hop-mau-do"><Database size={18} /></div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="the-chi-so">
            <div className="tieu-de-chi-so">TỔNG BẢN GHI</div>
            <div className="gia-tri-chi-so">{thongKe.soBanGhi}</div>
            <div className="small text-secondary mt-1">Tất cả document</div>
            <div className="hop-bieu-tuong-chi-so hop-mau-xanh"><Layers size={18} /></div>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="the-chi-so">
            <div className="tieu-de-chi-so">DUNG LƯỢNG</div>
            <div className="gia-tri-chi-so">{dinhDangByte(thongKe.dungLuongDuLieu)}</div>
            <div className="small text-secondary mt-1">
              Lưu trữ {dinhDangByte(thongKe.dungLuongLuuTru)} • Index {dinhDangByte(thongKe.dungLuongChiMuc)}
            </div>
            <div className="hop-bieu-tuong-chi-so hop-mau-vang"><HardDrive size={18} /></div>
          </div>
        </div>
      </div>

      {/* Chuoi ket noi & huong dan mo Compass */}
      <div className="the-bang-dieu-khien p-4">
        <div className="row g-4 align-items-center">
          <div className="col-lg-6">
            <div className="small fw-bold text-secondary mb-2">CHUỖI KẾT NỐI ĐANG DÙNG (backend/.env → MONGODB_URI)</div>
            <div className="chuoi-ket-noi">
              <span className="text-truncate">{ketNoi.uri}</span>
              <button type="button" className="btn btn-link btn-sm p-0 text-danger" onClick={saoChepChuoiKetNoi} title="Sao chép">
                <Copy size={15} />
              </button>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="small fw-bold text-secondary mb-2">MỞ CÙNG DỮ LIỆU TRÊN MONGODB COMPASS</div>
            <ol className="small mb-0 ps-3 d-flex flex-column gap-1">
              <li>
                Kết nối Compass tới <code className="chu-don-cach">mongodb://{ketNoi.host}:{ketNoi.port}</code>
              </li>
              <li>
                Mở database <code className="chu-don-cach">{ketNoi.tenDatabase}</code> ở cột trái
              </li>
              <li>
                Bấm nút <strong>Refresh ↻</strong> trên cây database nếu chưa thấy đủ {collectionHeThong.length} collection
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Bang collection */}
      <div className="the-bang-dieu-khien">
        <div className="dau-the-bang">
          <h2 className="h6 fw-bold mb-0">Collection của hệ thống</h2>
          <span className="small text-secondary">Mật khẩu người dùng luôn được ẩn khi xem & xuất</span>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Collection</th>
                <th>Bản ghi</th>
                <th>Dung lượng</th>
                <th>Chỉ mục</th>
                <th className="text-end">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {collectionHeThong.map((c) => renderDongCollection(c, true))}
              {collectionKhac.map((c) => renderDongCollection(c, false))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Khung duyet ban ghi */}
      {collectionChon && (
        <div className="the-bang-dieu-khien" id="khung-duyet-ban-ghi">
          <div className="dau-the-bang">
            <div>
              <h2 className="h6 fw-bold mb-0">
                Dữ liệu trong <span className="chu-don-cach text-danger">{collectionChon}</span>
              </h2>
              <div className="small text-secondary so-thang-hang">
                {duLieuBanGhi ? `${duLieuBanGhi.tong} bản ghi khớp • Trang ${duLieuBanGhi.trang}/${duLieuBanGhi.soTrang}` : 'Đang tải...'}
              </div>
            </div>
            <form
              className="d-flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                taiBanGhi(collectionChon, 1, tuKhoa);
              }}
            >
              <div className="input-group input-group-sm" style={{ width: 260 }}>
                <span className="input-group-text"><Search size={14} /></span>
                <input
                  className="form-control"
                  placeholder="Tìm theo tên, email, mã hoặc _id..."
                  value={tuKhoa}
                  onChange={(e) => datTuKhoa(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-danger btn-sm">Tìm</button>
            </form>
          </div>

          {collectionDangXem?.chiMuc?.length > 0 && (
            <div className="px-4 pt-3 d-flex flex-wrap gap-2 align-items-center">
              <span className="small text-secondary d-inline-flex align-items-center gap-1">
                <KeyRound size={13} /> Chỉ mục:
              </span>
              {collectionDangXem.chiMuc.map((cm) => (
                <span key={cm.ten} className={`nhan-trang-thai ${cm.duyNhat ? 'nhan-chu-dao' : 'nhan-trung-tinh'} chu-don-cach`}>
                  {cm.truong}{cm.duyNhat ? ' • unique' : ''}
                </span>
              ))}
            </div>
          )}

          <div className="than-the-bang d-flex flex-column gap-2">
            {dangTaiBanGhi ? (
              <KhungChoTai soDong={2} />
            ) : !duLieuBanGhi || duLieuBanGhi.banGhi.length === 0 ? (
              <TrangThaiTrong
                bieuTuong={Database}
                tieuDe="Không có bản ghi nào"
                moTa="Collection này đang trống hoặc không có bản ghi khớp từ khóa tìm kiếm."
              />
            ) : (
              duLieuBanGhi.banGhi.map((doc) => {
                const dangMo = Boolean(banGhiMo[doc._id]);
                return (
                  <div key={doc._id} className="the-ban-ghi">
                    <button
                      type="button"
                      className="dau-ban-ghi"
                      onClick={() => datBanGhiMo((p) => ({ ...p, [doc._id]: !p[doc._id] }))}
                      aria-expanded={dangMo}
                    >
                      <ChevronRight size={15} className={`mui-ten-ban-ghi ${dangMo ? 'dang-mo' : ''}`} />
                      <span className="chu-don-cach small text-secondary">{doc._id}</span>
                      <span className="fw-semibold small text-truncate">{layTieuDeBanGhi(doc)}</span>
                    </button>
                    {dangMo && <pre className="khoi-json">{JSON.stringify(doc, null, 2)}</pre>}
                  </div>
                );
              })
            )}

            {duLieuBanGhi && duLieuBanGhi.soTrang > 1 && (
              <div className="d-flex justify-content-end align-items-center gap-2 pt-2">
                <button
                  type="button"
                  className="btn nut-phu btn-sm"
                  disabled={trang <= 1 || dangTaiBanGhi}
                  onClick={() => taiBanGhi(collectionChon, trang - 1)}
                >
                  <ChevronLeft size={14} /> Trước
                </button>
                <span className="small so-thang-hang">{trang}/{duLieuBanGhi.soTrang}</span>
                <button
                  type="button"
                  className="btn nut-phu btn-sm"
                  disabled={trang >= duLieuBanGhi.soTrang || dangTaiBanGhi}
                  onClick={() => taiBanGhi(collectionChon, trang + 1)}
                >
                  Sau <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
