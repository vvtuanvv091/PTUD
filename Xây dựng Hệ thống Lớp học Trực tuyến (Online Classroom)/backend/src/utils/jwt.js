const jwt = require('jsonwebtoken');

const KHOA_BI_MAT = () => process.env.JWT_SECRET || 'educlass_dev_secret_key_2026';

const kyToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    KHOA_BI_MAT(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

const giaiMaToken = (token) => jwt.verify(token, KHOA_BI_MAT());

module.exports = { kyToken, giaiMaToken };
