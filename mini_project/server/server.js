const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { xacThuc, SECRET_KEY } = require("./middleware");

const app = express();
const PORT = 3000;

// 1. Cấu hình CORS: chỉ cho phép React ở port 5173
app.use(cors({ origin: "http://localhost:5173" }));

// 2. Đọc body dạng JSON
app.use(express.json());

// 3. API đăng nhập
app.post("/login", (req, res) => {
  const { email, matKhau } = req.body;

  if (email === "admin@gmail.com" && matKhau === "123456") {
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "1h" });
    return res.status(200).json({ message: "Đăng nhập thành công", token });
  }

  return res.status(401).json({ message: "Sai email hoặc mật khẩu" });
});

// 4. API sản phẩm (được bảo vệ bởi middleware xacThuc)
app.get("/api/products", xacThuc, (req, res) => {
  const products = [
    { id: 1, ten: "Bút bi", gia: 5000 },
    { id: 2, ten: "Vở kẻ ngang", gia: 12000 },
    { id: 3, ten: "Thước kẻ", gia: 8000 },
    { id: 4, ten: "Tẩy", gia: 3000 },
  ];

  // Trễ 1.5 giây để chụp được trạng thái "Đang tải..." (xóa khi nộp cũng được)
  setTimeout(() => res.status(200).json(products), 1500);
});

app.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));