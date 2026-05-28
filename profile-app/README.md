# Profile App — React + Node.js

## โครงสร้างไฟล์

```
profile-app/
├── backend/
│   ├── server.js        ← Express API + Multer auto-save
│   ├── package.json
│   └── uploads/         ← รูปภาพถูกบันทึกที่นี่อัตโนมัติ
│
└── frontend/
    ├── package.json
    └── src/
        ├── App.jsx               ← React Router setup
        └── pages/
            ├── Home.jsx          ← หน้าหลัก + ปุ่มดูโปรไฟล์
            ├── Home.css
            ├── Profile.jsx       ← หน้าโปรไฟล์ + auto-save รูป
            └── Profile.css
```

---

## วิธีรัน

### 1. Backend (Node.js)

```bash
cd backend
npm install
npm start        # หรือ npm run dev (ใช้ nodemon)
```

→ Server รันที่ `http://localhost:3001`

### 2. Frontend (React)

```bash
cd frontend
npm install
npm start
```

→ App เปิดที่ `http://localhost:3000`

---

## API Endpoints

| Method | Path                          | คำอธิบาย                         |
|--------|-------------------------------|----------------------------------|
| GET    | `/api/user/:id`               | ดึงข้อมูลผู้ใช้                  |
| POST   | `/api/user/:id/upload-avatar` | อัปโหลดและบันทึกรูปอัตโนมัติ    |
| GET    | `/uploads/:filename`          | ดูรูปที่บันทึกไว้                |

---

## Flow การทำงาน

1. **Home page** — แสดงรายชื่อผู้ใช้พร้อมปุ่ม "ดูโปรไฟล์"
2. **กดปุ่ม** → `navigate('/profile/:id')` ผ่าน React Router
3. **Profile page** — `useEffect` fetch ข้อมูลจาก API ทันทีที่เข้าหน้า
4. **คลิกรูปภาพ** → เปิด file picker เลือกรูป
5. **เลือกรูปแล้ว** → auto-upload ทันที ไม่ต้องกดปุ่มยืนยัน
6. **Multer** บันทึกไฟล์ลง `backend/uploads/` พร้อม timestamp
7. **แสดง save info** — ชื่อไฟล์, ขนาด, เวลาที่บันทึก

---

## ปรับแต่งเพิ่มเติม

- เชื่อมต่อ **database จริง** (MySQL / MongoDB) แทน mock data ใน `server.js`
- เพิ่ม **JWT authentication** ก่อน fetch ข้อมูล
- เพิ่ม **image resize** ด้วย `sharp` ก่อนบันทึก
- deploy backend บน **Railway / Render**, frontend บน **Vercel**
