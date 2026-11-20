import { useRef, useState } from 'react';
import { Camera, Check, KeyRound, RotateCcw, Save, UploadCloud } from 'lucide-react';
import goiApi, { layThongBaoLoi } from '../services/goiApi';
import { suDungXacThuc } from '../context/NguCanhXacThuc';
import { suDungThongBao } from '../context/NguCanhThongBao';
import { AnhDaiDien, NhanVaiTro } from '../components/ThanhPhanChung';

const ANH_DAI_DIEN_CO_SAN = [
  { nhan: 'Giảng viên Nam', anh: '/assets/img/trainers/trainer-1.jpg' },
  { nhan: 'Giảng viên Nữ', anh: '/assets/img/trainers/trainer-2.jpg' },
  { nhan: 'Giảng viên 3', anh: '/assets/img/trainers/trainer-3.jpg' },
  { nhan: 'Sinh viên', anh: '/images/vai-tro-sinh-vien.jpg' },
  { nhan: 'Quản trị viên', anh: '/images/vai-tro-quan-tri.jpg' },
  { nhan: 'Sinh viên Nữ', anh: '/assets/img/trainers/trainer-2-2.jpg' },
];

export function TrangHoSo() {
  const { nguoiDung, capNhatNguoiDungCucBo } = suDungXacThuc();
  const thongBao = suDungThongBao();
  const thamChieuTep = useRef(null);

  const [hoSo, datHoSo] = useState({
    fullName: nguoiDung?.fullName || '',
    studentCode: nguoiDung?.studentCode || '',
    department: nguoiDung?.department || '',
    bio: nguoiDung?.bio || '',
  });
  const [dangLuuHoSo, datDangLuuHoSo] = useState(false);
  const [dangTaiAvatar, datDangTaiAvatar] = useState(false);

  const [matKhau, datMatKhau] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [dangDoiMk, datDangDoiMk] = useState(false);

  const xuLyTaiTepAvatar = async (e) => {
    const tep = e.target.files?.[0];
    if (!tep) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(tep.type)) {
      thongBao.loi('Chỉ chấp nhận tệp hình ảnh định dạng JPG, PNG hoặc WEBP');
      return;
    }
    if (tep.size > 5 * 1024 * 1024) {
      thongBao.loi('Dung lượng ảnh tối đa là 5MB');
      return;
    }

    const bieuMau = new FormData();
    bieuMau.append('avatar', tep);

    datDangTaiAvatar(true);
    try {
      const res = await goiApi.post('/auth/avatar', bieuMau, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      capNhatNguoiDungCucBo(res.data.data);
      thongBao.thanhCong('Đã cập nhật ảnh đại diện mới thành công');
    } catch (err) {
      thongBao.loi(layThongBaoLoi(err, 'Không thể tải ảnh đại diện'));
    } finally {
      datDangTaiAvatar(false);
      if (thamChieuTep.current) thamChieuTep.current.value = '';
    }
  };

  const xuLyChonAnhCoSan = async (duongDanAnh) => {
    datDangTaiAvatar(true);
    try {
      const res = await goiApi.put('/auth/me', { avatarUrl: duongDanAnh });
      capNhatNguoiDungCucBo(res.data.data);
      thongBao.thanhCong('Đã thay đổi ảnh đại diện');
    } catch (err) {
      thongBao.loi(layThongBaoLoi(err));
    } finally {
      datDangTaiAvatar(false);
    }
  };

  const xuLyLuuHoSo = async (e) => {
    e.preventDefault();
    datDangLuuHoSo(true);
    try {
      const res = await goiApi.put('/auth/me', hoSo);
      capNhatNguoiDungCucBo(res.data.data);
      thongBao.thanhCong('Đã lưu thay đổi hồ sơ cá nhân');
    } catch (err) {
      thongBao.loi(layThongBaoLoi(err));
    } finally {
      datDangLuuHoSo(false);
    }
  };

  const xuLyDoiMatKhau = async (e) => {
    e.preventDefault();
    if (matKhau.newPassword !== matKhau.confirmPassword) {
      thongBao.loi('Mật khẩu mới nhập lại chưa khớp');
      return;
    }
    datDangDoiMk(true);
    try {
      await goiApi.put('/auth/change-password', {
        currentPassword: matKhau.currentPassword,
        newPassword: matKhau.newPassword,
      });
      thongBao.thanhCong('Đã đổi mật khẩu thành công');
      datMatKhau({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      thongBao.loi(layThongBaoLoi(err));
    } finally {
      datDangDoiMk(false);
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Khối hồ sơ đại diện */}
      <div className="the-bang-dieu-khien p-4 d-flex align-items-center justify-content-between flex-wrap gap-4">
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <div className="position-relative">
            <AnhDaiDien
              ten={nguoiDung?.fullName}
              mauNen={nguoiDung?.avatarColor}
              kichThuoc={76}
              anh={nguoiDung?.avatarUrl}
            />
            <button
              type="button"
              className="btn btn-danger btn-sm rounded-circle position-absolute bottom-0 end-0 p-1 d-flex align-items-center justify-content-center shadow"
              style={{ width: 28, height: 28 }}
              onClick={() => thamChieuTep.current?.click()}
              title="Tải ảnh mới từ thiết bị"
              aria-label="Tải ảnh đại diện"
              disabled={dangTaiAvatar}
            >
              <Camera size={14} />
            </button>
          </div>
          <div>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <h1 className="h4 fw-bold mb-0">{nguoiDung?.fullName}</h1>
              <NhanVaiTro vaiTro={nguoiDung?.role} />
            </div>
            <div className="small text-secondary mt-1">
              <span className="fw-medium text-dark-emphasis">{nguoiDung?.email}</span>
              {nguoiDung?.studentCode && (
                <>
                  {' '}• Mã số: <span className="chu-don-cach fw-semibold">{nguoiDung?.studentCode}</span>
                </>
              )}
              {nguoiDung?.department && <> • {nguoiDung?.department}</>}
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <input
            type="file"
            ref={thamChieuTep}
            accept="image/png,image/jpeg,image/webp"
            className="d-none"
            onChange={xuLyTaiTepAvatar}
          />
          <button
            type="button"
            className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-medium d-inline-flex align-items-center gap-1"
            onClick={() => thamChieuTep.current?.click()}
            disabled={dangTaiAvatar}
          >
            <UploadCloud size={15} />
            <span>{dangTaiAvatar ? 'Đang tải ảnh...' : 'Tải ảnh từ máy tính'}</span>
          </button>
        </div>
      </div>

      {/* Thư viện ảnh đại diện mẫu */}
      <div className="the-bang-dieu-khien p-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h2 className="h6 fw-bold mb-0">Bộ sưu tập ảnh đại diện mẫu</h2>
          <span className="small text-secondary">Bấm chọn ảnh phù hợp với vai trò của bạn</span>
        </div>
        <div className="row g-3">
          {ANH_DAI_DIEN_CO_SAN.map((item, idx) => {
            const dangChon = nguoiDung?.avatarUrl === item.anh;
            return (
              <div key={idx} className="col-4 col-sm-3 col-md-2 text-center">
                <button
                  type="button"
                  className={`btn p-2 w-100 rounded-3 border d-flex flex-column align-items-center gap-2 position-relative ${
                    dangChon ? 'border-danger bg-danger-subtle shadow-sm' : 'border-light-subtle'
                  }`}
                  onClick={() => xuLyChonAnhCoSan(item.anh)}
                  disabled={dangTaiAvatar}
                  style={{ transition: 'all 0.16s ease' }}
                >
                  <img
                    src={item.anh}
                    alt={item.nhan}
                    className="rounded-circle object-fit-cover shadow-sm"
                    style={{ width: 52, height: 52 }}
                  />
                  <span className="small text-truncate w-100" style={{ fontSize: '0.76rem' }}>
                    {item.nhan}
                  </span>
                  {dangChon && (
                    <span
                      className="badge bg-danger rounded-circle position-absolute top-0 end-0 m-1 p-1 d-flex align-items-center justify-content-center"
                      style={{ width: 18, height: 18 }}
                    >
                      <Check size={11} strokeWidth={3} />
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="row g-4">
        {/* Form thông tin cá nhân */}
        <div className="col-lg-7">
          <div className="the-bang-dieu-khien p-4 h-100">
            <h2 className="h6 fw-bold mb-3">Thông tin cá nhân</h2>
            <form onSubmit={xuLyLuuHoSo} className="row g-3">
              <div className="col-md-7">
                <label className="form-label">Họ và tên</label>
                <input
                  className="form-control"
                  value={hoSo.fullName}
                  onChange={(e) => datHoSo((p) => ({ ...p, fullName: e.target.value }))}
                  required
                />
              </div>
              <div className="col-md-5">
                <label className="form-label">Mã SV / GV</label>
                <input
                  className="form-control chu-don-cach"
                  value={hoSo.studentCode}
                  onChange={(e) => datHoSo((p) => ({ ...p, studentCode: e.target.value }))}
                />
              </div>
              <div className="col-12">
                <label className="form-label">Khoa / Bộ môn</label>
                <input
                  className="form-control"
                  value={hoSo.department}
                  onChange={(e) => datHoSo((p) => ({ ...p, department: e.target.value }))}
                />
              </div>
              <div className="col-12">
                <label className="form-label">Giới thiệu ngắn</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={hoSo.bio}
                  onChange={(e) => datHoSo((p) => ({ ...p, bio: e.target.value }))}
                />
              </div>
              <div className="col-12">
                <button type="submit" className="nut-hanh-dong-do btn-sm" disabled={dangLuuHoSo}>
                  <Save size={15} /> {dangLuuHoSo ? 'Đang lưu...' : 'Lưu thông tin'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Form đổi mật khẩu */}
        <div className="col-lg-5">
          <div className="the-bang-dieu-khien p-4 h-100">
            <h2 className="h6 fw-bold mb-3">Đổi mật khẩu</h2>
            <form onSubmit={xuLyDoiMatKhau} className="d-flex flex-column gap-3">
              <div>
                <label className="form-label">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  className="form-control"
                  value={matKhau.currentPassword}
                  onChange={(e) => datMatKhau((p) => ({ ...p, currentPassword: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="form-label">Mật khẩu mới</label>
                <input
                  type="password"
                  className="form-control"
                  minLength={6}
                  value={matKhau.newPassword}
                  onChange={(e) => datMatKhau((p) => ({ ...p, newPassword: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="form-label">Nhập lại mật khẩu mới</label>
                <input
                  type="password"
                  className="form-control"
                  minLength={6}
                  value={matKhau.confirmPassword}
                  onChange={(e) => datMatKhau((p) => ({ ...p, confirmPassword: e.target.value }))}
                  required
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="btn btn-outline-danger rounded-pill px-4 btn-sm fw-semibold"
                  disabled={dangDoiMk}
                >
                  <KeyRound size={14} className="me-1" />
                  {dangDoiMk ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
