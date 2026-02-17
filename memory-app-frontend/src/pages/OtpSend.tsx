import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

function makeOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

const STORAGE_USER = "MyLyfe_user";
const STORAGE_OTP = "MyLyfe_otp";

export default function OtpSend() {
  const nav = useNavigate();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_USER) ?? "null");
    } catch {
      return null;
    }
  }, []);

  const contact = user?.contact ?? "your phone/email";

  function send() {
    const code = makeOtp();

    // store it for the confirm screen
    localStorage.setItem(STORAGE_OTP, code);

    // dev-mode: show it so you can test
    console.log("DEV OTP CODE:", code);

    nav("/otp/confirm");
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoText}>MyLyfe</div>
        <h2 style={styles.h2}>send 1 time password to</h2>
        <div style={styles.sub}>{contact}</div>

        <button style={styles.primaryBtn} onClick={send}>
          send
        </button>

        <button style={styles.linkBtn} onClick={() => nav("/signup")}>
          ← back
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    width: "100vw",
    background: "#f0f2f5",
    display: "grid",
    placeItems: "center",
    padding: 16,
    boxSizing: "border-box",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "white",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.12)",
    padding: 18,
    boxSizing: "border-box",
    boxShadow: "0 12px 38px rgba(0,0,0,0.12)",
    textAlign: "center",
  },
  logoText: {
    fontWeight: 900,
    fontSize: 34,
    letterSpacing: 1,
    color: "#1a7f2e",
    marginBottom: 10,
  },
  h2: { margin: "6px 0 6px", fontWeight: 900, color: "#0b0e14" },
  sub: { marginBottom: 14, opacity: 0.7, fontSize: 13, color: "rgba(0,0,0,0.65)" },
  primaryBtn: {
    width: "100%",
    marginTop: 8,
    padding: "12px 14px",
    borderRadius: 10,
    fontWeight: 900,
    background: "#1a7f2e",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
  linkBtn: {
    marginTop: 12,
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    background: "transparent",
    border: "none",
    color: "#1877f2",
    fontWeight: 800,
    cursor: "pointer",
  },
};