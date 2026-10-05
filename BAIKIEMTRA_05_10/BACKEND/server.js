const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/noteapp')
  .then(() => console.log('Đã kết nối MongoDB'))
  .catch(err => console.error(err));

app.use('/api/notes', require('./routes/notes'));

app.listen(5000, () => console.log('Server chạy ở cổng 5000'));