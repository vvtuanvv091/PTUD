import { useEffect, useState } from 'react';
import { Download, Users } from 'lucide-react';
import goiApi, { layThongBaoLoi } from '../../services/goiApi';
import { suDungThongBao } from '../../context/NguCanhThongBao';
import { AnhDaiDien, KhungChoTai, TrangThaiTrong } from '../ThanhPhanChung';
import { dinhDangNgay } from '../../utils/dinhDang';

export function TabSinhVienBangDiem({ idLop, maLop }) {
  const thongBao = suDungThongBao();
  const [dsSinhVien, datDsSinhVien] = useState([]);
  const [bangDiem, datBangDiem] = useState(null);
  const [dangTai, datDangTai] = useState(true);
  const [dangXuat, datDangXuat] = useState(false);

  useEffect(() => {
    const tai = async () => {
      datDangTai(true);
      try {
        const [resSv, resBd] = await Promise.all([
          goiApi.get(`/courses/${idLop}/students`),
          goiApi.get(`/courses/${idLop}/gradebook`),
        ]);
        datDsSinhVien(resSv.data.data);
        datBangDiem(resBd.data.data);
      } catch (err) {
        thongBao.loi(layThongBaoLoi(err, 'Không thể tải danh sách sinh viên'));
      } finally {
        datDangTai(false);
      }
    };
    tai();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idLop]);

  const xuLyXuatCsv = async () => {
    datDangXuat(true);
    try {
      const res = await goiApi.get(`/courses/${idLop}/gradebook/export`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bang-diem-${maLop}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      thongBao.thanhCong('Đã xuất bảng điểm CSV (UTF-8 BOM cho Excel)');
    } catch (err) {
      thongBao.loi(layThongBaoLoi(err, 'Xuất CSV thất bại'));
    } finally {
      datDangXuat(false);
    }
  };

  if (dangTai) return <KhungChoTai soDong={3} />;

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div>
          <h2 className="h5 fw-bold mb-0">Sinh viên &amp; Bảng điểm lớp</h2>
          <div className="small text-secondary">{dsSinhVien.length} sinh viên đang ghi danh</div>
        </div>
        <button
          type="button"
          className="nut-hanh-dong-do btn-sm"
          disabled={dangXuat || dsSinhVien.length === 0}
          onClick={xuLyXuatCsv}
        >
          <Download size={15} /> {dangXuat ? 'Đang xuất...' : 'Xuất bảng điểm CSV'}
        </button>
      </div>

      {dsSinhVien.length === 0 ? (
        <div className="the-bang-dieu-khien">
          <TrangThaiTrong
            bieuTuong={Users}
            tieuDe="Chưa có sinh viên ghi danh"
            moTa="Chia sẻ mã tham gia lớp cho sinh viên để bắt đầu theo dõi tiến độ và chấm bài."
          />
        </div>
      ) : (
        <>
          <div className="the-bang-dieu-khien">
            <div className="dau-the-bang">
              <h3 className="h6 fw-bold mb-0">Danh sách sinh viên</h3>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Sinh viên</th>
                    <th>MSSV</th>
                    <th>Tiến độ bài học</th>
                    <th>Bài tập đã nộp</th>
                    <th>Điểm TB (hệ 10)</th>
                    <th>Ngày ghi danh</th>
                  </tr>
                </thead>
                <tbody>
                  {dsSinhVien.map((muc) => (
                    <tr key={muc.enrollmentId}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <AnhDaiDien
                            ten={muc.student.fullName}
                            mauNen={muc.student.avatarColor}
                            kichThuoc={32}
                            anh={muc.student.avatarUrl}
                          />
                          <div>
                            <div className="fw-semibold small">{muc.student.fullName}</div>
                            <div className="small text-secondary">{muc.student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="chu-don-cach small">{muc.student.studentCode || '—'}</td>
                      <td style={{ minWidth: 150 }}>
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress flex-grow-1" style={{ height: 6 }}>
                            <div className="progress-bar" style={{ width: `${muc.progressPercent}%` }} />
                          </div>
                          <span className="small so-thang-hang">{muc.progressPercent}%</span>
                        </div>
                      </td>
                      <td className="so-thang-hang small">
                        {muc.submittedCount}/{muc.totalAssignments} ({muc.gradedCount} đã chấm)
                      </td>
                      <td className="so-thang-hang fw-bold">
                        {muc.averageScore !== null ? muc.averageScore : '—'}
                      </td>
                      <td className="small text-secondary so-thang-hang">
                        {dinhDangNgay(muc.enrolledAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {bangDiem && bangDiem.assignments.length > 0 && (
            <div className="the-bang-dieu-khien">
              <div className="dau-the-bang">
                <h3 className="h6 fw-bold mb-0">Ma trận bảng điểm chi tiết</h3>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Sinh viên</th>
                      {bangDiem.assignments.map((bt) => (
                        <th key={bt._id} style={{ minWidth: 130 }}>
                          <div className="text-truncate" style={{ maxWidth: 160 }} title={bt.title}>
                            {bt.title}
                          </div>
                          <span className="fw-normal opacity-75">(/{bt.maxScore})</span>
                        </th>
                      ))}
                      <th>Điểm TB</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bangDiem.rows.map((dong) => (
                      <tr key={dong.student._id}>
                        <td>
                          <div className="fw-semibold small">{dong.student.fullName}</div>
                          <div className="small text-secondary chu-don-cach">
                            {dong.student.studentCode}
                          </div>
                        </td>
                        {dong.scores.map((o) => (
                          <td key={o.assignmentId} className="so-thang-hang small">
                            {o.status === 'missing' ? (
                              <span className="text-secondary">Chưa nộp</span>
                            ) : o.status === 'submitted' ? (
                              <span className="nhan-trang-thai nhan-canh-bao">Chờ chấm</span>
                            ) : (
                              <span className="fw-bold text-success">
                                {o.score} {o.isLate && <span className="text-danger">(Trễ)</span>}
                              </span>
                            )}
                          </td>
                        ))}
                        <td className="fw-bold so-thang-hang">
                          {dong.averageScore !== null ? dong.averageScore : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

