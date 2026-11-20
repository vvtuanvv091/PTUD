const mongoose = require('mongoose');

const ketNoiDatabase = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/HeThongLopHocTrucTuyen';

  try {
    const ketNoi = await mongoose.connect(uri);
    console.log(`[MongoDB] Da ket noi: ${ketNoi.connection.host}/${ketNoi.connection.name}`);
  } catch (err) {
    console.error(`[MongoDB] Loi ket noi: ${err.message}`);
    process.exit(1);
  }
};

module.exports = ketNoiDatabase;
