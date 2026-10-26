import { useState } from "react";
import axios from "axios";

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [thongBao, setThongBao] = useState({ loai: "", noiDung: "" });
  const [dangGui, setDangGui] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDangGui(true);
    setThongBao({ loai: "", noiDung: "" });
    try {
      const res = await axios.post("http://localhost:3000/login", {
        email,
        matKhau,
      });
      localStorage.setItem("token", res.data.token); // lưu token
      setThongBao({ loai: "success", noiDung: "Đăng nhập thành công!" });
      setTimeout(onLoginSuccess, 600); // dừng chút để thấy thông báo rồi chuyển trang
    } catch (err) {
      setThongBao({
        loai: "error",
        noiDung: err.response?.data?.message || "Không kết nối được server",
      });
    } finally {
      setDangGui(false);
    }
  };

  return (
    <div className="card login-card">
      <h2>Đăng nhập</h2>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Email</label>
          <input
            type="email"
            placeholder="admin@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label>Mật khẩu</label>
          <input
            type="password"
            placeholder="••••••"
            value={matKhau}
            onChange={(e) => setMatKhau(e.target.value)}
            required
          />
        </div>
        <button className="btn primary" type="submit" disabled={dangGui}>
          {dangGui ? "Đang xử lý..." : "Đăng nhập"}
        </button>
      </form>
      {thongBao.noiDung && (
        <div className={`alert ${thongBao.loai}`}>{thongBao.noiDung}</div>
      )}
    </div>
  );
}

export default Login;