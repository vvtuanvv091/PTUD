import { useEffect, useState } from 'react';
import { Edit3, FolderKanban, Plus, Trash2 } from 'lucide-react';
import goiApi, { layThongBaoLoi } from '../services/goiApi';
import { suDungThongBao } from '../context/NguCanhThongBao';
import { HopThoai, KhungChoTai, TrangThaiTrong } from '../components/ThanhPhanChung';

const MAU_DANH_MUC = ['#DB303A', '#0284C7', '#D97706', '#9333EA', '#166534', '#475569'];

const DANH_MUC_TRONG = {
  name: '',
  description: '',
  accentColor: '#DB303A',
  isActive: true,
};

export function TrangQuanLyDanhMuc() {
  const thongBao = suDungThongBao();
  const [dsDanhMuc, datDsDanhMuc] = useState([]);
  const [dangTai, datDangTai] = useState(true);

  const [moHopThoai, datMoHopThoai] = useState(false);
  const [idDangSua, datIdDangSua] = useState(null);
  const [bieuMau, datBieuMau] = useState(DANH_MUC_TRONG);
  const [dangLuu, datDangLuu] = useState(false);

  const taiDanhMuc = async () => {
    datDangTai(true);
    try {
      const res = await goiApi.get('/categories', { params: { includeInactive: 'true' } });
      datDsDanhMuc(res.data.data);
    } catch (err) {
      thongBao.loi(layThongBaoLoi(err));
    } finally {
      datDangTai(false);
    }
  };

  useEffect(() => {
    taiDanhMuc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const moTaoMoi = () => {
    datIdDangSua(null);
    datBieuMau(DANH_MUC_TRONG);
    datMoHopThoai(true);
  };

  const moChinhSua = (dm) => {
    datIdDangSua(dm._id);
    datBieuMau({
      name: dm.name,
      description: dm.description || '',
      accentColor: dm.accentColor || '#DB303A',
      isActive: dm.isActive,
    });
    datMoHopThoai(true);
  };

  const xuLyLuuDanhMuc = async (e) => {
    e.preventDefault();
    datDangLuu(true);
    try {
      if (idDangSua) {
        await goiApi.put(`/categories/${idDangSua}`, bieuMau);
        thongBao.thanhCong('Đã cập nhật danh mục khóa học');
      } else {
        await goiApi.post('/categories', bieuMau);
        thongBao.thanhCong('Đã thêm danh mục khóa học mới');
      }
      datMoHopThoai(false);
      await taiDanhMuc();
    } catch (err) {
      thongBao.loi(layThongBaoLoi(err));
    } finally {
      datDangLuu(false);
    }
  };

  const xuLyXoaDanhMuc = async (dm) => {
    if (!window.confirm(`Xóa danh mục "${dm.name}"?`)) return;
    try {
      await goiApi.delete(`/categories/${dm._id}`);
      thongBao.thongTin(`Đã xóa danh mục ${dm.name}`);
      await taiDanhMuc();
    } catch (err) {
      thongBao.loi(layThongBaoLoi(err));
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex align-items-end justify-content-between flex-wrap gap-3">
        <div>
          <h1 className="h4 fw-bold mb-1">Quản lý danh mục khóa học</h1>
          <p className="text-secondary small mb-0">
            Tổ chức phân loại học phần toàn hệ thống. Danh mục đang có lớp học sẽ được bảo vệ khỏi thao tác xóa nhầm.
          </p>
        </div>
        <button type="button" className="nut-hanh-dong-do btn-sm" onClick={moTaoMoi}>
          <Plus size={15} /> Thêm danh mục
        </button>
      </div>

      {dangTai ? (
        <KhungChoTai soDong={3} />
      ) : dsDanhMuc.length === 0 ? (
        <div className="the-bang-dieu-khien">
          <TrangThaiTrong bieuTuong={FolderKanban} tieuDe="Chưa có danh mục nào" />
        </div>
      ) : (
        <div className="the-bang-dieu-khien">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Danh mục</th>
                  <th>Slug</th>
                  <th>Mô tả</th>
                  <th>Số lớp học</th>
                  <th>Hiển thị</th>
                  <th className="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {dsDanhMuc.map((dm) => (
                  <tr key={dm._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <span
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: 3,
                            backgroundColor: dm.accentColor || '#DB303A',
                            display: 'inline-block',
                          }}
                        />
                        <span className="fw-semibold">{dm.name}</span>
                      </div>
                    </td>
                    <td className="chu-don-cach small text-secondary">{dm.slug}</td>
                    <td className="small text-secondary" style={{ maxWidth: 360 }}>
                      {dm.description || '—'}
                    </td>
                    <td className="so-thang-hang fw-bold">{dm.courseCount}</td>
                    <td>
                      <span className={`nhan-trang-thai ${dm.isActive ? 'nhan-thanh-cong' : 'nhan-trung-tinh'}`}>
                        {dm.isActive ? 'Đang hiển thị' : 'Đang ẩn'}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-2">
                        <button
                          type="button"
                          className="btn nut-phu btn-sm d-inline-flex align-items-center gap-1"
                          onClick={() => moChinhSua(dm)}
                        >
                          <Edit3 size={13} /> Sửa
                        </button>
                        <button
                          type="button"
                          className="btn nut-phu btn-sm text-danger d-inline-flex align-items-center gap-1"
                          onClick={() => xuLyXoaDanhMuc(dm)}
                        >
                          <Trash2 size={13} /> Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <HopThoai
        hienThi={moHopThoai}
        tieuDe={idDangSua ? 'Cập nhật danh mục' : 'Thêm danh mục khóa học'}
        khiDong={() => datMoHopThoai(false)}
      >
        <form onSubmit={xuLyLuuDanhMuc}>
          <div className="mb-3">
            <label className="form-label">Tên danh mục</label>
            <input
              className="form-control"
              value={bieuMau.name}
              onChange={(e) => datBieuMau((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Mô tả</label>
            <textarea
              className="form-control"
              rows={3}
              value={bieuMau.description}
              onChange={(e) => datBieuMau((p) => ({ ...p, description: e.target.value }))}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Màu đại diện</label>
            <div className="d-flex gap-2">
              {MAU_DANH_MUC.map((mau) => (
                <button
                  key={mau}
                  type="button"
                  onClick={() => datBieuMau((p) => ({ ...p, accentColor: mau }))}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    backgroundColor: mau,
                    border:
                      bieuMau.accentColor === mau ? '3px solid #16212c' : '1px solid rgba(0,0,0,0.18)',
                  }}
                />
              ))}
            </div>
          </div>
          <div className="form-check mb-4">
            <input
              id="hienThiDanhMuc"
              type="checkbox"
              className="form-check-input"
              checked={bieuMau.isActive}
              onChange={(e) => datBieuMau((p) => ({ ...p, isActive: e.target.checked }))}
            />
            <label className="form-check-label small" htmlFor="hienThiDanhMuc">
              Hiển thị danh mục này trên trang chủ và trang khám phá
            </label>
          </div>
          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn nut-phu" onClick={() => datMoHopThoai(false)}>
              Hủy
            </button>
            <button type="submit" className="btn btn-danger" disabled={dangLuu}>
              {dangLuu ? 'Đang lưu...' : 'Lưu danh mục'}
            </button>
          </div>
        </form>
      </HopThoai>
    </div>
  );
}

