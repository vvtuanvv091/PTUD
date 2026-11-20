import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ClipboardCheck } from 'lucide-react';
import goiApi, { layThongBaoLoi } from '../services/goiApi';
import { suDungThongBao } from '../context/NguCanhThongBao';
import { KhungChoTai, NhanHanNop, TrangThaiTrong } from '../components/ThanhPhanChung';
import { dinhDangHanNopTuongDoi, dinhDangNgayGio } from '../utils/dinhDang';

export function TrangHanNopBaiTap() {
  const thongBao = suDungThongBao();
  const [dsBaiTap, datDsBaiTap] = useState([]);
  const [boLoc, datBoLoc] = useState('all');
  const [dangTai, datDangTai] = useState(true);

  useEffect(() => {
    const tai = async () => {
      datDangTai(true);
      try {
        const res = await goiApi.get('/assignments/my-upcoming');
        datDsBaiTap(res.data.data);
      } catch (err) {
        thongBao.loi(layThongBaoLoi(err, 'Không thể tải danh sách bài tập'));
      } finally {
        datDangTai(false);
      }
    };
    tai();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const daLoc = dsBaiTap.filter((bt) => {
    if (boLoc === 'pending') return ['overdue', 'due_soon', 'upcoming'].includes(bt.deadlineState);
    if (boLoc === 'urgent') return ['overdue', 'due_soon'].includes(bt.deadlineState);
    if (boLoc === 'done') return ['submitted', 'graded'].includes(bt.deadlineState);
    return true;
  });

  return (
    <div className="d-flex flex-column gap-4">
      <div>
        <h1 className="h4 fw-bold mb-1">Hạn nộp bài tập</h1>
        <p className="small text-secondary mb-0">
          Tổng hợp toàn bộ bài tập từ các khóa học bạn đã ghi danh, sắp xếp ưu tiên theo hạn chót.
        </p>
      </div>

      <div className="d-flex gap-2 flex-wrap">
        {[
          { ma: 'all', nhan: `Tất cả (${dsBaiTap.length})` },
          { ma: 'pending', nhan: 'Chưa nộp' },
          { ma: 'urgent', nhan: 'Quá hạn / Sắp hết hạn' },
          { ma: 'done', nhan: 'Đã nộp / Đã chấm' },
        ].map((tab) => (
          <button
            key={tab.ma}
            type="button"
            className={`btn btn-sm rounded-pill ${boLoc === tab.ma ? 'btn-danger' : 'nut-phu'}`}
            onClick={() => datBoLoc(tab.ma)}
          >
            {tab.nhan}
          </button>
        ))}
      </div>

      {dangTai ? (
        <KhungChoTai soDong={3} />
      ) : daLoc.length === 0 ? (
        <div className="the-bang-dieu-khien">
          <TrangThaiTrong
            bieuTuong={boLoc === 'pending' ? CheckCircle2 : ClipboardCheck}
            tieuDe="Không có bài tập nào trong mục này"
            moTa="Bạn đang theo kịp tiến độ các lớp học của mình."
          />
        </div>
      ) : (
        <div className="the-bang-dieu-khien">
          <div className="list-group list-group-flush">
            {daLoc.map((bt) => (
              <div
                key={bt._id}
                className="list-group-item px-4 py-3 d-flex align-items-center justify-content-between flex-wrap gap-3"
              >
                <div className="min-w-0 flex-grow-1">
                  <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                    <span className="chu-don-cach small fw-bold text-danger">{bt.course?.code}</span>
                    <span className="small text-secondary">{bt.course?.title}</span>
                    <NhanHanNop trangThai={bt.deadlineState} />
                  </div>
                  <div className="fw-semibold">{bt.title}</div>
                  <div className="small text-secondary so-thang-hang mt-1">
                    Hạn nộp: {dinhDangNgayGio(bt.dueDate)} ({dinhDangHanNopTuongDoi(bt.dueDate)}) • Thang điểm {bt.maxScore}
                  </div>
                </div>

                <Link
                  to={`/courses/${bt.course?._id}?tab=assignments&assignment=${bt._id}`}
                  className="btn btn-outline-danger btn-sm rounded-pill px-3 d-inline-flex align-items-center gap-1 flex-shrink-0"
                >
                  <span>{bt.mySubmission ? 'Xem bài nộp' : 'Làm & Nộp bài'}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

