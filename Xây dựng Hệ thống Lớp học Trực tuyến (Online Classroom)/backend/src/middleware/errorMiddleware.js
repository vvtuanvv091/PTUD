class LoiUngDung extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const khongTimThay = (req, _res, next) => {
  next(new LoiUngDung(`Không tìm thấy endpoint: ${req.method} ${req.originalUrl}`, 404));
};

// eslint-disable-next-line no-unused-vars
const boXuLyLoi = (err, _req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Lỗi hệ thống nội bộ';

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Định dạng mã định danh không hợp lệ (${err.path})`;
  } else if (err.code === 11000) {
    statusCode = 409;
    const truongTrung = Object.keys(err.keyPattern || {})[0] || 'dữ liệu';
    const tenTruong = {
      email: 'Email',
      code: 'Mã học phần',
      joinCode: 'Mã tham gia lớp',
      slug: 'Đường dẫn danh mục',
      name: 'Tên danh mục',
    }[truongTrung] || truongTrung;
    message = `${tenTruong} đã tồn tại trong hệ thống`;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join('. ');
  } else if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'Dung lượng tệp vượt quá giới hạn cho phép';
    } else {
      message = `Lỗi tải tệp lên: ${err.message}`;
    }
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn, vui lòng đăng nhập lại';
  }

  const phanHoi = { success: false, message };
  if (process.env.NODE_ENV === 'development' && statusCode === 500) {
    phanHoi.stack = err.stack;
  }
  res.status(statusCode).json(phanHoi);
};

module.exports = { LoiUngDung, khongTimThay, boXuLyLoi };
