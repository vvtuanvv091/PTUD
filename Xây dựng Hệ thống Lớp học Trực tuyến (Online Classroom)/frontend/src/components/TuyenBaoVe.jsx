import { Navigate, useLocation } from 'react-router-dom';
import { suDungXacThuc } from '../context/NguCanhXacThuc';

export function TuyenBaoVe({ cacVaiTro, children }) {
  const { nguoiDung, daDangNhap, dangTai } = suDungXacThuc();
  const viTri = useLocation();

  if (dangTai) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5 min-vh-100">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (!daDangNhap) {
    return <Navigate to="/login" state={{ from: viTri }} replace />;
  }

  if (cacVaiTro && cacVaiTro.length > 0 && !cacVaiTro.includes(nguoiDung?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

