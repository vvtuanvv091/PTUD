import { useState, useEffect } from "react";
import axios from "axios";

function ProductList({ onGoLogin }) {
  // Lấy token từ localStorage khi component mount
  const token = localStorage.getItem("token");

  // 3 state bắt buộc theo đề
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(!!token); // có token -> bắt đầu tải luôn
  const [error, setError] = useState(
    token ? "" : "Bạn chưa đăng nhập, vui lòng đăng nhập trước"
  );

  // Phần mở rộng: tìm kiếm + nút tải lại
  const [tuKhoa, setTuKhoa] = useState("");
  const [lanTai, setLanTai] = useState(0);

  useEffect(() => {
    if (!token) return;

    axios
      .get("http://localhost:3000/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setData(res.data);   // thành công -> cập nhật data
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Không kết nối được server");
        setLoading(false);   // thất bại -> cập nhật error
      });
  }, [token, lanTai]);

  const taiLai = () => {
    setError("");
    setLoading(true);        // bắt đầu gọi API -> loading = true
    setLanTai((n) => n + 1);
  };

  const dsLoc = data.filter((p) =>
    p.ten.toLowerCase().includes(tuKhoa.toLowerCase())
  );
  const tongTien = dsLoc.reduce((tong, p) => tong + p.gia, 0);

  return (
    <div className="card">
      <h2>Danh sách sản phẩm</h2>

      {loading && (
        <div className="loading">
          <div className="spinner" />
          <span>Đang tải...</span>
        </div>
      )}

      {!loading && error && (
        <div>
          <div className="alert error">Lỗi: {error}</div>
          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button className="btn primary" style={{ width: "auto" }} onClick={onGoLogin}>
              Đến trang đăng nhập
            </button>
            {token && (
              <button className="btn" onClick={taiLai}>
                Thử lại
              </button>
            )}
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="toolbar">
            <input
              placeholder="Tìm sản phẩm..."
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
            />
            <button className="btn" onClick={taiLai}>
              Tải lại
            </button>
          </div>

          <ul className="product-list">
            {dsLoc.map((p) => (
              <li key={p.id} className="product-item">
                <div>
                  <div className="product-name">{p.ten}</div>
                  <div className="product-id">Mã SP: #{p.id}</div>
                </div>
                <span className="product-price">{p.gia.toLocaleString("vi-VN")}đ</span>
              </li>
            ))}
          </ul>

          {dsLoc.length === 0 && <p className="summary">Không tìm thấy sản phẩm nào.</p>}
          {dsLoc.length > 0 && (
            <p className="summary">
              {dsLoc.length} sản phẩm · Tổng giá: {tongTien.toLocaleString("vi-VN")}đ
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default ProductList;