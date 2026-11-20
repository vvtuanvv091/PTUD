import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, CheckCircle2, Clock, FileCheck } from 'lucide-react';
import goiApi, { layThongBaoLoi } from '../services/goiApi';
import { suDungThongBao } from '../context/NguCanhThongBao';
import { KhungChoTai, TrangThaiTrong } from '../components/ThanhPhanChung';
import { dinhDangNgayGio } from '../utils/dinhDang';

export function TrangBangDiemCaNhan() {
  const thongBao = suDungThongBao();
  const [duLieu, datDuLieu] = useState(null);
  const [dangTai, datDangTai] = useState(true);

  useEffect(() => {
    const tai = async () => {
      datDangTai(true);
      try {
        const res = await goiApi.get('/submissions/my');
        datDuLieu(res.data.data);
      } catch (err) {
        thongBao.loi(layThongBaoLoi(err, 'Không thể tải bảng điểm cá nhân'));
      } finally {
        datDangTai(false);
      }
    };
    tai();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (dangTai) return <KhungChoTai soDong={3} />;

  const { summary, submissions } = duLieu || {
    summary: { totalSubmissions: 0, gradedCount: 0, pendingCount: 0, lateCount: 0, averageScore: null },
    submissions: [],
  };

  return (
    <div className="d-flex flex-column gap-4">
      <div>
        <h1 className="h4 fw-bold mb-1">Bảng điểm cá nhân</h1>
        <p className="small text-secondary mb-0">
          Theo dõi toàn bộ bài tập đã nộp, trạng thái chấm điểm, điểm quy đổi hệ 10 và nhận xét từ giảng viên.
        </p>
      </div>

      <div className="row g-3">
        <div className="col-6 col-md-3">
          <div className="the-chi-so">
            <div className="tieu-de-chi-so">ĐIỂM TB (HỆ 10)</div>
            <div className="gia-tri-chi-so">
              {summary.averageScore !== null ? summary.averageScore : '—'}
            </div>
            <div className="hop-bieu-tuong-chi-so hop-mau-do"><Award size={18} /></div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="the-chi-so">
            <div className="tieu-de-chi-so">ĐÃ CHẤM ĐIỂM</div>
            <div className="gia-tri-chi-so">{summary.gradedCount}</div>
            <div className="hop-bieu-tuong-chi-so hop-mau-la"><CheckCircle2 size={18} /></div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="the-chi-so">
            <div className="tieu-de-chi-so">ĐANG CHỜ CHẤM</div>
            <div className="gia-tri-chi-so">{summary.pendingCount}</div>
            <div className="hop-bieu-tuong-chi-so hop-mau-vang"><Clock size={18} /></div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="the-chi-so">
            <div className="tieu-de-chi-so">TỔNG BÀI ĐÃ NỘP</div>
            <div className="gia-tri-chi-so">{summary.totalSubmissions}</div>
            <div className="hop-bieu-tuong-chi-so hop-mau-xanh"><FileCheck size={18} /></div>
          </div>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="the-bang-dieu-khien">
          <TrangThaiTrong
            bieuTuong={Award}
            tieuDe="Chưa có dữ liệu điểm số"
            moTa="Khi bạn nộp bài tập và được giảng viên chấm điểm, kết quả chi tiết sẽ hiển thị tại đây."
          />
        </div>
      ) : (
        <div className="the-bang-dieu-khien">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Học phần &amp; Bài tập</th>
                  <th>Thời gian nộp</th>
                  <th>Trạng thái</th>
                  <th>Điểm số</th>
                  <th>Nhận xét của giảng viên</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((bn) => (
                  <tr key={bn._id}>
                    <td>
                      <Link
                        to={`/courses/${bn.course?._id}?tab=assignments&assignment=${bn.assignment?._id}`}
                        className="fw-semibold small text-dark d-block"
                      >
                        {bn.assignment?.title}
                      </Link>
                      <span className="small text-secondary chu-don-cach">
                        {bn.course?.code} • {bn.course?.title}
                      </span>
                    </td>
                    <td className="small text-secondary so-thang-hang">
                      {dinhDangNgayGio(bn.submittedAt)}
                    </td>
                    <td>
                      <div className="d-flex gap-1 flex-wrap">
                        <span
                          className={`nhan-trang-thai ${
                            bn.status === 'graded' ? 'nhan-thanh-cong' : 'nhan-canh-bao'
                          }`}
                        >
                          {bn.status === 'graded' ? 'Đã chấm' : 'Chờ chấm'}
                        </span>
                        {bn.isLate && <span className="nhan-trang-thai nhan-nguy-hiem">Nộp trễ</span>}
                      </div>
                    </td>
                    <td className="chu-don-cach fw-bold so-thang-hang">
                      {bn.status === 'graded' ? `${bn.score}/${bn.assignment?.maxScore}` : '—'}
                    </td>
                    <td className="small text-secondary" style={{ maxWidth: 320 }}>
                      {bn.feedback || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

