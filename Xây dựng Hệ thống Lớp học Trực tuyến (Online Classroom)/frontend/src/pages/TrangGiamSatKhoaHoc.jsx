import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ExternalLink, Search } from 'lucide-react';
import goiApi, { layThongBaoLoi } from '../services/goiApi';
import { suDungThongBao } from '../context/NguCanhThongBao';
import { KhungChoTai, TrangThaiTrong } from '../components/ThanhPhanChung';
import { layTrangThaiKhoaHoc } from '../utils/dinhDang';

export function TrangGiamSatKhoaHoc() {
  const thongBao = suDungThongBao();
  const [dsKhoaHoc, datDsKhoaHoc] = useState([]);
  const [tuKhoa, datTuKhoa] = useState('');
  const [locTrangThai, datLocTrangThai] = useState('');
  const [dangTai, datDangTai] = useState(true);
  const [dangSuaId, datDangSuaId] = useState('');

  const taiDanhSach = async (q = tuKhoa, tt = locTrangThai) => {
    datDangTai(true);
    try {
      const params = {};
      if (q.trim()) params.search = q.trim();
      if (tt) params.status = tt;
      const res = await goiApi.get('/admin/courses', { params });
      datDsKhoaHoc(res.data.data);
    } catch (err) {
      thongBao.loi(layThongBaoLoi(err, 'Không thể tải danh sách khóa học'));
    } finally {
      datDangTai(false);
    }
  };

  useEffect(() => {
    taiDanhSach('', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const xuLyDoiTrangThai = async (idLop, trangThaiMoi) => {
    datDangSuaId(idLop);
    try {
      await goiApi.patch(`/admin/courses/${idLop}/status`, { status: trangThaiMoi });
      thongBao.thanhCong('Đã cập nhật trạng thái lớp học');
      await taiDanhSach(tuKhoa, locTrangThai);
    } catch (err) {
      thongBao.loi(layThongBaoLoi(err));
    } finally {
      datDangSuaId('');
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      <div>
        <h1 className="h4 fw-bold mb-1">Giám sát khóa học toàn hệ thống</h1>
        <p className="small text-secondary mb-0">
          Theo dõi toàn bộ lớp học của các giảng viên, kiểm duyệt mở ghi danh hoặc chuyển lưu trữ.
        </p>
      </div>

      <div className="the-bang-dieu-khien p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            taiDanhSach(tuKhoa, locTrangThai);
          }}
          className="row g-2 align-items-center"
        >
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text"><Search size={15} /></span>
              <input
                className="form-control"
                placeholder="Tìm theo tên lớp, mã học phần hoặc mã tham gia..."
                value={tuKhoa}
                onChange={(e) => datTuKhoa(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={locTrangThai}
              onChange={(e) => {
                datLocTrangThai(e.target.value);
                taiDanhSach(tuKhoa, e.target.value);
              }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="published">Đang mở</option>
              <option value="draft">Bản nháp</option>
              <option value="archived">Đã lưu trữ</option>
            </select>
          </div>
          <div className="col-md-3">
            <button type="submit" className="btn btn-danger rounded-pill w-100">
              Lọc khóa học
            </button>
          </div>
        </form>
      </div>

      {dangTai ? (
        <KhungChoTai soDong={3} />
      ) : dsKhoaHoc.length === 0 ? (
        <div className="the-bang-dieu-khien">
          <TrangThaiTrong bieuTuong={BookOpen} tieuDe="Không có khóa học nào khớp bộ lọc" />
        </div>
      ) : (
        <div className="the-bang-dieu-khien">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Khóa học</th>
                  <th>Giảng viên</th>
                  <th>Danh mục</th>
                  <th>Sĩ số / Học liệu</th>
                  <th>Trạng thái</th>
                  <th className="text-end">Kiểm tra</th>
                </tr>
              </thead>
              <tbody>
                {dsKhoaHoc.map((lop) => {
                  const tt = layTrangThaiKhoaHoc(lop.status);
                  return (
                    <tr key={lop._id}>
                      <td>
                        <div className="fw-semibold small">{lop.title}</div>
                        <div className="small text-secondary chu-don-cach">
                          {lop.code} • Mã lớp: {lop.joinCode}
                        </div>
                      </td>
                      <td className="small">
                        <div className="fw-semibold">{lop.teacher?.fullName}</div>
                        <div className="text-secondary">{lop.teacher?.email}</div>
                      </td>
                      <td className="small">{lop.category?.name}</td>
                      <td className="small so-thang-hang">
                        {lop.studentCount}/{lop.maxStudents} SV • {lop.materialCount} tài liệu • {lop.assignmentCount} bài tập
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span className={`nhan-trang-thai ${tt.lopCss}`}>{tt.nhan}</span>
                          <select
                            className="form-select form-select-sm"
                            style={{ width: 132 }}
                            value={lop.status}
                            disabled={dangSuaId === lop._id}
                            onChange={(e) => xuLyDoiTrangThai(lop._id, e.target.value)}
                          >
                            <option value="published">Đang mở</option>
                            <option value="draft">Bản nháp</option>
                            <option value="archived">Lưu trữ</option>
                          </select>
                        </div>
                      </td>
                      <td className="text-end">
                        <Link
                          to={`/courses/${lop._id}`}
                          className="btn nut-phu btn-sm rounded-pill d-inline-flex align-items-center gap-1"
                        >
                          <span>Mở lớp</span>
                          <ExternalLink size={13} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

