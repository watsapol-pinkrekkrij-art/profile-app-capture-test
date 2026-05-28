import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Profile.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3001";

const isMobile = () =>
  /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
  window.matchMedia("(pointer: coarse)").matches;

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saveInfo, setSaveInfo] = useState(null);

  const [capturing, setCapturing] = useState(false);
  const [downloadDone, setDownloadDone] = useState(false);

  const fileInputRef = useRef(null);
  const profileCardRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/user/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error("ไม่พบข้อมูลผู้ใช้");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        if (data.avatar) setAvatarUrl(`${API_BASE}${data.avatar}`);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    if (!user || downloadDone) return;
    const timer = setTimeout(() => {
      handleAutoDownload();
    }, 600);
    return () => clearTimeout(timer);
  }, [user]);

  const handleAutoDownload = async () => {
    if (isMobile()) {
      await captureAndDownloadMobile();
    } else {
      downloadAvatarPC();
    }
    setDownloadDone(true);
  };

  const downloadAvatarPC = () => {
    const url = avatarUrl || generatePlaceholderDataUrl(user);
    const link = document.createElement("a");
    link.href = url;
    link.download = `profile_${user.name.replace(/\s+/g, "_")}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const captureAndDownloadMobile = async () => {
    if (!profileCardRef.current) return;
    setCapturing(true);
    try {
      if (!window.html2canvas) {
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
        );
      }
      const canvas = await window.html2canvas(profileCardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const filename = `profile_${user.name.replace(/\s+/g, "_")}.jpg`;

      // ลอง Web Share API ก่อน (บันทึกลง Photos ได้เลยบน iOS/Android)
      if (navigator.canShare) {
        const blob = await new Promise((res) =>
          canvas.toBlob(res, "image/jpeg", 0.92)
        );
        const file = new File([blob], filename, { type: "image/jpeg" });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `โปรไฟล์ ${user.name}`,
          });
          return; // สำเร็จ — ออกได้เลย
        }
      }

      // Fallback: download ปกติ (กรณี browser ไม่รองรับ share)
      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      // user กด Cancel share ถือว่า OK ไม่ต้อง alert
      if (err.name !== "AbortError") {
        console.error("Capture failed:", err);
      }
    } finally {
      setCapturing(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);
    setUploading(true);
    setSaveInfo(null);

    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await fetch(`${API_BASE}/api/user/${userId}/upload-avatar`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("อัปโหลดไม่สำเร็จ");
      const result = await res.json();
      setAvatarUrl(result.avatarUrl);
      setSaveInfo({
        filename: result.filename,
        size: (result.size / 1024).toFixed(1),
        savedAt: new Date(result.savedAt).toLocaleString("th-TH"),
      });
    } catch (err) {
      alert(`เกิดข้อผิดพลาด: ${err.message}`);
      setAvatarUrl(null);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const loadScript = (src) =>
    new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });

  const generatePlaceholderDataUrl = (u) => {
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#e6f1fb";
    ctx.fillRect(0, 0, 300, 300);
    ctx.fillStyle = "#185fa5";
    ctx.font = "bold 120px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(u.name.charAt(0), 150, 155);
    return canvas.toDataURL("image/jpeg", 0.9);
  };

  if (loading)
    return (
      <div className="profile-loading">
        <div className="spinner" />
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );

  if (error)
    return (
      <div className="profile-error">
        <p>❌ {error}</p>
        <button onClick={() => navigate("/")}>← กลับหน้าหลัก</button>
      </div>
    );

  const fields = [
    { label: "ชื่อ-นามสกุล", value: user.name },
    { label: "อีเมล", value: user.email },
    { label: "เบอร์โทรศัพท์", value: user.phone },
    { label: "แผนก", value: user.department },
    {
      label: "วันที่เริ่มงาน",
      value: new Date(user.joinDate).toLocaleDateString("th-TH"),
    },
  ];

  const mobile = isMobile();

  return (
    <div className="profile-container">
      <button className="btn-back" onClick={() => navigate("/")}>
        ← กลับ
      </button>

      {capturing && (
        <div className="capture-badge">
          <div className="spinner-sm-dark" />
          กำลังบันทึกหน้าสรุป...
        </div>
      )}
      {downloadDone && !capturing && (
        <div className="capture-badge success">
          {mobile ? "📱 เปิด Share Sheet แล้ว กด Save to Photos" : "💾 ดาวน์โหลด .jpg แล้ว"}
          <button
            className="btn-redownload"
            onClick={() => {
              setDownloadDone(false);
              setTimeout(handleAutoDownload, 100);
            }}
          >
            ↓ บันทึกอีกครั้ง
          </button>
        </div>
      )}

      <div className="profile-card" ref={profileCardRef}>
        <div className="avatar-section">
          <div
            className="avatar-wrapper"
            onClick={() => fileInputRef.current?.click()}
            title="คลิกเพื่อเปลี่ยนรูปภาพ"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="avatar-img" />
            ) : (
              <div className="avatar-placeholder">{user.name.charAt(0)}</div>
            )}
            {uploading && (
              <div className="avatar-overlay">
                <div className="spinner-sm" />
              </div>
            )}
            <div className="avatar-edit-badge">✏️</div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          {saveInfo && (
            <div className="save-info">
              <span className="save-tick">✅</span>
              <div>
                <p>บันทึกอัตโนมัติสำเร็จ</p>
                <p className="save-detail">
                  {saveInfo.filename} · {saveInfo.size} KB
                </p>
                <p className="save-detail">{saveInfo.savedAt}</p>
              </div>
            </div>
          )}

          <p className="avatar-hint">คลิกรูปเพื่ออัปโหลด</p>
        </div>

        <div className="user-details">
          <h2 className="profile-name">{user.name}</h2>
          <span className="profile-dept">{user.department}</span>

          <div className="fields-grid">
            {fields.map(({ label, value }) => (
              <div key={label} className="field-item">
                <span className="field-label">{label}</span>
                <span className="field-value">{value}</span>
              </div>
            ))}
          </div>

          <p className="device-mode-hint">
            {mobile
              ? "📱 Mobile: แชร์รูปหน้าสรุปอัตโนมัติ"
              : "🖥️ PC: ดาวน์โหลดรูปโปรไฟล์ .jpg อัตโนมัติ"}
          </p>
        </div>
      </div>
    </div>
  );
}