require('dotenv').config();
const ungDung = require('./ungDung');
const ketNoiDatabase = require('./config/db');

const PORT = Number(process.env.PORT) || 5000;

const khoiDongMayChu = async () => {
  await ketNoiDatabase();

  const mayChu = ungDung.listen(PORT, () => {
    console.log(`[EduClass API] Dang chay tai http://localhost:${PORT}`);
    console.log(`[Swagger UI]   Tai lieu API tai http://localhost:${PORT}/api-docs`);
  });

  process.on('unhandledRejection', (err) => {
    console.error('[MayChu] Unhandled Rejection:', err);
    mayChu.close(() => process.exit(1));
  });
};

khoiDongMayChu();
