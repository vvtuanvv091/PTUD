import { useEffect, useState } from 'react';
import { Lock, Search, Unlock, UserPlus, Users } from 'lucide-react';
import goiApi, { layThongBaoLoi } from '../services/goiApi';
import { suDungXacThuc } from '../context/NguCanhXacThuc';
import { suDungThongBao } from '../context/NguCanhThongBao';
import {
  AnhDaiDien,
  HopThoai,
  KhungChoTai,
  NhanVaiTro,
  ONhapMatKhau,
  TrangThaiTrong,
} from '../components/ThanhPhanChung';
import { dinhDangNgay } from '../utils/dinhDang';

const TAI_KHOAN_TRONG = {
  fullName: '',
  email: '',
  password: '',
  role: 'teacher',
  studentCode: '',
  department: 'Công nghệ thông tin',
};

export function TrangQuanLyNguoiDung() {
  const { nguoiDung: hienTai } = suDungXacThuc();
  const thongBao = suDungThongBao();

  const [dsNguoiDung, datDsNguoiDung] = useState([]);
  const [tuKhoa, datTuKhoa] = useState('');
  const [locVaiTro, datLocVaiTro] = useState('');
  const [locTrangThai, datLocTrangThai] = useState('');
  const [dangTai, datDangTai] = useState(true);
  const [dangXuLyId, datDangXuLyId] = useState('');

  const [moTaoMoi, datMoTaoMoi] = useState(false);
  const [bieuMau, datBieuMau] = useState(TAI_KHOAN_TRONG);
  const [dangTao, datDangTao] = useState(false);

  const taiDanhSach = async (q = tuKhoa, vt = locVaiTro, tt = locTrangThai) => {
    datDangTai(true);
    try {
      const thamSo = {};
      if (q.trim()) thamSo.search = q.trim();
      if (vt) thamSo.role = vt;
      if (tt) thamSo.status = tt;
      const res = await goiApi.get('/admin/users', { params: thamSo });
      datDsNguoiDung(res.data.data);
    } catch (err) {
      thongBao.loi(layThongBaoLoi(err, 'Không thể tải danh sách người dùng'));
    } finally {
      datDangTai(false);
    }
  };

  useEffect(() => {
    taiDanhSach('', '', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const xuLyKhoaMo = async (mucTieu) => {
    const hanhDong = mucTieu.status === 'active' ? 'khóa' : 'mở khóa';
    if (!window.confirm(`Xác nhận ${hanhDong} tài khoản "${mucTieu.fullName}"?`)) return;
    datDangXuLyId(mucTieu._id);
    try {
      const res = await goiApi.patch(`/admin/users/${mucTieu._id}/status`);
      thongBao.thanhCong(res.data.message);
      await taiDanhSach(tuKhoa, locVaiTro, locTrangThai);
    } catch (err) {
      thongBao.loi(layThongBaoLoi(err));
    } finally {
      datDangXuLyId('');
    }
  };

  const xuLyDoiVaiTro = async (mucTieu, vaiTroMoi) => {
    datDangXuLyId(mucTieu._id);
    try {
      const res = await goiApi.patch(`/admin/users/${mucTieu._id}/role`, { role: vaiTroMoi });
      thongBao.thanhCong(res.data.message);
      await taiDanhSach(tuKhoa, locVaiTro, locTrangThai);
    } catch (err) {
      thongBao.loi(layThongBaoLoi(err));
    } finally {
      datDangXuLyId('');
    }
  };

  const xuLyTaoNguoiDung = async (e) => {
    e.preventDefault();
    datDangTao(true);
    try {
      await goiApi.post('/admin/users', bieuMau);
      thongBao.thanhCong('Đã tạo tài khoản người dùng mới');
      datBieuMau(TAI_KHOAN_TRONG);
      datMoTaoMoi(false);
      await taiDanhSach(tuKhoa, locVaiTro, locTrangThai);
    } catch (err) {
      thongBao.loi(layThongBaoLoi(err));
    } finally {
      datDangTao(false);
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex align-items-end justify-content-between flex-wrap gap-3">
        <div>
          <h1 className="h4 fw-bold mb-1">Quản lý người dùng</h1>
          <p className="text-secondary small mb-0">
            Kiểm soát toàn bộ tài khoản Sinh viên, Giảng viên và Quản trị viên; khóa hoặc mở khóa tức thì.
          </p>
        </div>
        <button type="button" className="nut-hanh-dong-do btn-sm" onClick={() => datMoTaoMoi(true)}>
          <UserPlus size={15} />
          <span>Cấp tài khoản mới</span>
        </button>
      </div>

      <div className="the-bang-dieu-khien p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            taiDanhSach(tuKhoa, locVaiTro, locTrangThai);
          }}
          className="row g-2 align-items-center"
        >
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text">
                <Search size={15} />
              </span>
              <input
                className="form-control"
                placeholder="Tìm theo họ tên, email hoặc MSSV/MGV..."
                value={tuKhoa}
                onChange={(e) => datTuKhoa(e.target.value)}
              />
            </div>
          </div>
          <div className="col-6 col-md-3">
            <select
              className="form-select"
              value={locVaiTro}
              onChange={(e) => {
                datLocVaiTro(e.target.value);
                taiDanhSach(tuKhoa, e.target.value, locTrangThai);
              }}
            >
              <option value="">Tất cả vai trò</option>
              <option value="student">Sinh viên</option>
              <option value="teacher">Giảng viên</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </div>
          <div className="col-6 col-md-2">
            <select
              className="form-select"
              value={locTrangThai}
              onChange={(e) => {
                datLocTrangThai(e.target.value);
                taiDanhSach(tuKhoa, locVaiTro, e.target.value);
              }}
            >
              <option value="">Mọi trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="locked">Đang bị khóa</option>
            </select>
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-danger w-100 rounded-pill">
              Lọc dữ liệu
            </button>
          </div>
        </form>
      </div>

      {dangTai ? (
        <KhungChoTai soDong={3} />
      ) : dsNguoiDung.length === 0 ? (
        <div className="the-bang-dieu-khien">
          <TrangThaiTrong
            bieuTuong={Users}
            tieuDe="Không tìm thấy người dùng phù hợp"
            moTa="Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc vai trò."
          />
        </div>
      ) : (
        <div className="the-bang-dieu-khien">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Mã số &amp; Khoa</th>
                  <th>Vai trò</th>
                  <th>Số lớp</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th className="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {dsNguoiDung.map((nd) => {
                  const laBanThan = String(nd._id) === String(hienTai?._id);
                  return (
                    <tr key={nd._id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <AnhDaiDien
                            ten={nd.fullName}
                            mauNen={nd.avatarColor}
                            kichThuoc={34}
                            anh={nd.avatarUrl}
                          />
                          <div>
                            <div className="fw-semibold small">
                              {nd.fullName} {laBanThan && <span className="text-danger">(Bạn)</span>}
                            </div>
                            <div className="small text-secondary">{nd.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="small">
                        <div className="chu-don-cach">{nd.studentCode || '—'}</div>
                        <div className="text-secondary">{nd.department}</div>
                      </td>
                      <td>
                        {laBanThan ? (
                          <NhanVaiTro vaiTro={nd.role} />
                        ) : (
                          <select
                            className="form-select form-select-sm"
                            style={{ width: 145 }}
                            value={nd.role}
                            disabled={dangXuLyId === nd._id}
                            onChange={(e) => xuLyDoiVaiTro(nd, e.target.value)}
                          >
                            <option value="student">Sinh viên</option>
                            <option value="teacher">Giảng viên</option>
                            <option value="admin">Quản trị viên</option>
                          </select>
                        )}
                      </td>
                      <td className="so-thang-hang small">
                        {nd.role === 'teacher'
                          ? `${nd.courseCount} lớp dạy`
                          : nd.role === 'student'
                          ? `${nd.courseCount} lớp học`
                          : '—'}
                      </td>
                      <td>
                        <span
                          className={`nhan-trang-thai ${
                            nd.status === 'active' ? 'nhan-thanh-cong' : 'nhan-nguy-hiem'
                          }`}
                        >
                          {nd.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                        </span>
                      </td>
                      <td className="small text-secondary so-thang-hang">{dinhDangNgay(nd.createdAt)}</td>
                      <td className="text-end">
                        <button
                          type="button"
                          className={`btn btn-sm rounded-pill d-inline-flex align-items-center gap-1 ${
                            nd.status === 'active' ? 'btn-outline-danger' : 'btn-outline-success'
                          }`}
                          disabled={laBanThan || dangXuLyId === nd._id}
                          onClick={() => xuLyKhoaMo(nd)}
                        >
                          {nd.status === 'active' ? (
                            <>
                              <Lock size={13} /> Khóa
                            </>
                          ) : (
                            <>
                              <Unlock size={13} /> Mở khóa
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <HopThoai hienThi={moTaoMoi} tieuDe="Cấp tài khoản người dùng mới" khiDong={() => datMoTaoMoi(false)}>
        <form onSubmit={xuLyTaoNguoiDung}>
          <div className="mb-3">
            <label className="form-label">Họ và tên</label>
            <input
              className="form-control"
              value={bieuMau.fullName}
              onChange={(e) => datBieuMau((p) => ({ ...p, fullName: e.target.value }))}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={bieuMau.email}
              onChange={(e) => datBieuMau((p) => ({ ...p, email: e.target.value }))}
              required
            />
          </div>
          <div className="row g-3 mb-3">
            <div className="col-6">
              <label className="form-label">Mật khẩu khởi tạo</label>
              <ONhapMatKhau
                value={bieuMau.password}
                onChange={(e) => datBieuMau((p) => ({ ...p, password: e.target.value }))}
                minLength={6}
                required
              />
            </div>
            <div className="col-6">
              <label className="form-label">Vai trò</label>
              <select
                className="form-select"
                value={bieuMau.role}
                onChange={(e) => datBieuMau((p) => ({ ...p, role: e.target.value }))}
              >
                <option value="student">Sinh viên</option>
                <option value="teacher">Giảng viên</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>
          </div>
          <div className="row g-3 mb-4">
            <div className="col-5">
              <label className="form-label">Mã SV / GV</label>
              <input
                className="form-control"
                value={bieuMau.studentCode}
                onChange={(e) => datBieuMau((p) => ({ ...p, studentCode: e.target.value }))}
              />
            </div>
            <div className="col-7">
              <label className="form-label">Khoa / Đơn vị</label>
              <input
                className="form-control"
                value={bieuMau.department}
                onChange={(e) => datBieuMau((p) => ({ ...p, department: e.target.value }))}
              />
            </div>
          </div>
          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn nut-phu" onClick={() => datMoTaoMoi(false)}>
              Hủy
            </button>
            <button type="submit" className="btn btn-danger" disabled={dangTao}>
              {dangTao ? 'Đang tạo...' : 'Tạo tài khoản'}
            </button>
          </div>
        </form>
      </HopThoai>
    </div>
  );
}

