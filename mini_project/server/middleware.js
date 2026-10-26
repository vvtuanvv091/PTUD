const jwt = require("jsonwebtoken");

const SECRET_KEY = "khoa_bi_mat_cua_toi"; // secret key tùy chọn

// Middleware xác thực token
function xacThuc(req, res, next) {
  // Header có dạng: "Authorization: Bearer <token>"
  const authHeader = req.headers.authorization;

  // Không có header -> chưa đăng nhập
  if (!authHeader) {
    return res.status(401).json({ message: "Chưa đăng nhập, thiếu token" });
  }

  const token = authHeader.split(" ")[1]; // tách chữ "Bearer" ra, lấy token
  if (!token) {
    return res.status(401).json({ message: "Token không đúng định dạng" });
  }

  // Kiểm tra token
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }
    req.user = decoded; // lưu thông tin user để route phía sau dùng
    next();             // token hợp lệ -> chuyển sang route tiếp theo
  });
}

module.exports = { xacThuc, SECRET_KEY };