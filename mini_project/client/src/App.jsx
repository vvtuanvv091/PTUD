import { useState } from "react";
import Login from "./Login";
import ProductList from "./ProductList";

// Đọc email từ payload của JWT (chỉ để hiển thị, không dùng để bảo mật)
function layEmailTuToken() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return "";
    return JSON.parse(atob(token.split(".")[1])).email || "";
  } catch {
    return "";
  }
}

function App() {
  const [trang, setTrang] = useState("login"); // "login" | "products"
  const [email, setEmail] = useState(layEmailTuToken());

  const dangNhapXong = () => {
    setEmail(layEmailTuToken());
    setTrang("products");
  };

  const dangXuat = () => {
    localStorage.removeItem("token");
    setEmail("");
    setTrang("login");
  };

  return (
    <div className="app">
      <nav className="navbar">
        <span className="brand">🔐 Quản lý sản phẩm</span>
        <div className="nav-links">
          {email && <span className="user-badge">{email}</span>}
          <button
            className={`btn ${trang === "login" ? "active" : ""}`}
            onClick={() => setTrang("login")}
          >
            Đăng nhập
          </button>
          <button
            className={`btn ${trang === "products" ? "active" : ""}`}
            onClick={() => setTrang("products")}
          >
            Sản phẩm
          </button>
          <button className="btn danger" onClick={dangXuat}>
            Đăng xuất
          </button>
        </div>
      </nav>

      {trang === "login" && <Login onLoginSuccess={dangNhapXong} />}
      {trang === "products" && (
        <ProductList onGoLogin={() => setTrang("login")} />
      )}
    </div>
  );
}

export default App;