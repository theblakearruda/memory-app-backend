import { useNavigate } from "react-router-dom";
import babyImg from "../assets/onboarding/thebaby.svg";

export default function Onboarding2() {
  const nav = useNavigate();

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <img src={babyImg} alt="baby" style={styles.img} />
        <h1 style={styles.title}>capture everything</h1>
        <p style={styles.text}>photos, places, captions — your life, organized.</p>

        <button style={styles.btn} onClick={() => nav("/onboarding/3")}>
          next →
        </button>

        <button style={styles.back} onClick={() => nav("/")}>
          ← back
        </button>

        <button style={styles.skip} onClick={() => nav("/home")}>
          skip
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#ffffff",
    display: "grid",
    placeItems: "center",
    padding: 24,
    color: "#0b0e14",
  },
  card: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 18,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "#ffffff",
    padding: 22,
    boxSizing: "border-box",
    textAlign: "center",
    boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
  },
  img: {
    width: "100%",
    height: 320,
    objectFit: "contain",
    borderRadius: 14,
    background: "#f3f4f6",
  },
  title: { margin: "16px 0 6px", fontWeight: 900, letterSpacing: 0.2 },
  text: { margin: 0, opacity: 0.85, lineHeight: 1.4 },
  btn: {
    marginTop: 16,
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    fontWeight: 800,
    background: "#0b0e14",
    border: "1px solid rgba(0,0,0,0.15)",
    color: "white",
    cursor: "pointer",
  },
  back: {
    marginTop: 10,
    width: "100%",
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 800,
    background: "transparent",
    border: "1px solid rgba(0,0,0,0.18)",
    color: "#0b0e14",
    cursor: "pointer",
  },
  skip: {
    marginTop: 10,
    width: "100%",
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 800,
    background: "transparent",
    border: "1px solid rgba(0,0,0,0.18)",
    color: "#0b0e14",
    cursor: "pointer",
    opacity: 0.8,
  },
};
