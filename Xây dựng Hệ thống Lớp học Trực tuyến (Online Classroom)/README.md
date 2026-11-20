# Xay dung He thong Lop hoc Truc tuyen (Online Classroom)

De tai: Xay dung He thong Lop hoc Truc tuyen (Online Classroom) - Do an Cuoi ky Mon Lap trinh Web (MERN Stack).

## 1. Gioi thieu du an

Nen tang lop hoc truc tuyen duoc xay dung theo kien truc **MERN Stack** (MongoDB, Express.js, React.js, Node.js), dap ung day du luong nghiep vu cho 3 vai tro nguoi dung:
- **Quan tri vien (Admin):** Quan ly nguoi dung (Khoa / Mo khoa tai khoan), quan ly danh muc khoa hoc toan he thong, giam sat lop hoc va theo doi co so du lieu MongoDB.
- **Giang vien (Teacher):** Tao, xem, cap nhat, xoa lop hoc; cap ma tham gia lop (Join Code); dang tai hoc lieu da dinh dang (PDF, Video link, Bai doc); tao bai tap kem han nop; cham diem bai nop thang 10 va xuat bang diem CSV UTF-8.
- **Sinh vien (Student):** Xem danh sach lop hoc dang mo, ghi danh truc tiep hoac qua ma Join Code; truy cap hoc lieu, theo doi tien do hoan thanh; nop bai tap (van ban / tep dinh kem) va xem diem so ca nhan.

---

## 2. Cong nghe su dung

- **Frontend:** React 18, Vite, Bootstrap 5, React Router v6, Axios, Lucide React Icons.
- **Backend:** Node.js, Express.js (Kien truc 4 tang: Routes - Controllers - Services - Models).
- **Co so du lieu:** MongoDB Mongoose (8 collections tieng Viet: `nguoidung`, `danhmuc`, `khoahoc`, `tailieu`, `ghidanh`, `baitap`, `bainop`, `thongbaolop`).
- **Bao mat & Xac thuc:** JSON Web Token (JWT Bearer Token), ma hoa mat khau bcryptjs, phan quyen 3 vai tro (RBAC).
- **Tai lieu API:** Swagger UI OpenApi 3.0 tich hop truc tiep tai `/api-docs`.

---

## 3. Huong dan cai dat va khoi chay

### Yeu cau moi truong:
- Node.js >= 18.x
- MongoDB Server dang chay tai `mongodb://127.0.0.1:27017`

### Buoc 1: Cai dat thu vien (Dependencies)
```bash
# Cai dat dependencies cho toan bo he thong:
npm run install:all

# Hoac cai dat thu cong cho tung phan:
cd backend && npm install
cd ../frontend && npm install
```

### Buoc 2: Cau hinh bien moi truong (.env)
Tao tep `.env` ben trong thu muc `backend/` tu tep `.env.example`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/HeThongLopHocTrucTuyen
JWT_SECRET=educlass_jwt_secret_key_2026_super_secure
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Tao tep `.env` ben trong thu muc `frontend/` tu tep `.env.example`:
```env
VITE_API_URL=/api
VITE_UPLOAD_BASE_URL=http://localhost:5000
```

### Buoc 3: Khoi tao du lieu mau (Seed Database)
```bash
npm run seed
# Hoac chay truc tiep:
node backend/src/seeds/napDuLieuMau.js
```

### Buoc 4: Khoi chay ung dung

**Khoi chay Backend API (Cong 5000):**
```bash
npm run dev:backend
# Hoac: cd backend && npm run dev
```

**Khoi chay Frontend UI (Cong 5173):**
```bash
npm run dev:frontend
# Hoac: cd frontend && npm run dev
```

- **Giao dien nguoi dung:** [http://localhost:5173](http://localhost:5173)
- **Tai lieu API Swagger:** [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

---

## 4. Tai khoan trai nghiem he thong (Mat khau mac dinh: `123456`)

| Vai tro | Email dang nhap | Mat khau | Mo ta chuc nang |
| :--- | :--- | :--- | :--- |
| **Quan tri vien (Admin)** | `admin@educlass.vn` | `123456` | Khoa/mo tai khoan, quan ly danh muc, giam sat lop toan truong |
| **Giang vien (Teacher)** | `giangvien@educlass.vn` | `123456` | Tao lop, dang hoc lieu, cham diem bai tap, xuat bang diem CSV |
| **Sinh vien (Student)** | `sinhvien@educlass.vn` | `123456` | Ghi danh lop hoc, xem tai lieu, nop bai tap, xem bang diem |
| **Tai khoan bi khoa (Locked)** | `locked.sv@educlass.vn` | `123456` | Kiem thu co che chan truy cap cua tai khoan bi Admin khoa |

---

## 5. Cau truc ma nguon

```text
Cuoi_Ki_Final/
├── backend/
│   ├── src/
│   │   ├── mayChu.js                      # Entry point khoi chay may chu Express & ket noi MongoDB
│   │   ├── ungDung.js                     # Cau hinh middleware Express, CORS, Swagger routes
│   │   ├── config/                        # db.js, swagger.js
│   │   ├── middleware/                    # authMiddleware, errorMiddleware, uploadMiddleware
│   │   ├── models/                        # 8 Mongoose Schemas tieng Viet
│   │   ├── services/                      # Tang Business Logic tach biet (auth, admin, giangVien, sinhVien, chung)
│   │   ├── controllers/                   # Tang Dieu phoi HTTP Request/Response
│   │   ├── routes/                        # RESTful API Endpoints
│   │   ├── utils/                         # asyncHandler, jwt, csvExport
│   │   └── seeds/                         # napDuLieuMau.js
│   ├── uploads/                           # Thu muc luu tru tai nguyen tai len (.gitkeep)
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/                            # Assets anh he thong
│   ├── src/
│   │   ├── components/                    # ThanhDauTrang, KhungLamViec, KhungCongKhai, lopHoc/
│   │   ├── context/                       # NguCanhXacThuc, NguCanhThongBao, NguCanhGiaoDien
│   │   ├── pages/                         # TrangChu, TrangTongQuan, TrangQuanLyLopGiangVien...
│   │   ├── services/                      # goiApi.js (Axios + JWT interceptor)
│   │   ├── styles/                        # giaoDienChinh.css (Bootstrap 5 Sáng/Tối)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
├── .gitignore
├── package.json
└── README.md
```
