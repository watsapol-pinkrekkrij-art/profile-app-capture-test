const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000"
}));
app.use(express.json());

const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.use("/uploads", express.static(UPLOAD_DIR));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const userId = _req.params.id || "unknown";
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${userId}_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"), false);
  },
});

const users = {
  1: {
    id: 1,
    name: "สมชาย ใจดี",
    email: "somchai@example.com",
    phone: "081-234-5678",
    department: "วิศวกรรมซอฟต์แวร์",
    joinDate: "2022-03-15",
    avatar: null,
  },
  2: {
    id: 2,
    name: "มาลี สดใส",
    email: "malee@example.com",
    phone: "089-876-5432",
    department: "ออกแบบ UX",
    joinDate: "2023-07-01",
    avatar: null,
  },
};

app.get("/api/user/:id", (req, res) => {
  const user = users[req.params.id];
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

app.post("/api/user/:id/upload-avatar", upload.single("avatar"), (req, res) => {
  const user = users[req.params.id];
  if (!user) return res.status(404).json({ error: "User not found" });
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  user.avatar = `/uploads/${req.file.filename}`;

  res.json({
    message: "บันทึกรูปภาพสำเร็จ",
    avatarUrl: `${req.protocol}://${req.get("host")}${user.avatar}`,
    filename: req.file.filename,
    size: req.file.size,
    savedAt: new Date().toISOString(),
  });
});

app.use((err, _req, res, _next) => {
  console.error(err.message);
  res.status(400).json({ error: err.message });
});

app.listen(PORT, () =>
  console.log(`Backend running at http://localhost:${PORT}`)
);