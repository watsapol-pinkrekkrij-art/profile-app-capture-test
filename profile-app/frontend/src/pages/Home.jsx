import { useNavigate } from "react-router-dom";
import "./Home.css";

const USERS = [
  { id: 1, name: "สมชาย ใจดี", role: "วิศวกรรมซอฟต์แวร์" },
  { id: 2, name: "มาลี สดใส", role: "ออกแบบ UX" },
];

export default function Home() {
  const navigate = useNavigate();

  // กดปุ่ม → navigate ไปหน้า Profile ทันที
  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="home-container">
      <h1 className="home-title">ระบบจัดการผู้ใช้</h1>
      <p className="home-subtitle">เลือกผู้ใช้เพื่อดูโปรไฟล์</p>

      <div className="user-list">
        {USERS.map((user) => (
          <div key={user.id} className="user-card">
            <div className="user-avatar-placeholder">
              {user.name.charAt(0)}
            </div>
            <div className="user-info">
              <h3>{user.name}</h3>
              <span>{user.role}</span>
            </div>
            {/* ปุ่มหลัก: กดแล้วนำไปหน้า Profile */}
            <button
              className="btn-view-profile"
              onClick={() => handleViewProfile(user.id)}
            >
              ดูโปรไฟล์ →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
