import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function OtpConfirm() {
  const nav = useNavigate();
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");

  const expected = useMemo(() => sessionStorage.getItem("mylyfe_otp") ?? "", []);

  function confirm() {
    setErr("");

    if (!code.trim()) {
      setErr("enter the code, don’t just vibe 😭");
      return;
    }

    if (code.trim() !== expected) {
      setErr("wrong code. (check console log, it literally told you 😭)");
      return;
    }

    // “account created” (dev)
    sessionStorage.setItem("mylyfe_authed", "true");

    // cleanup otp so it isn’t reusable
    sessionStorage.removeItem("mylyfe_otp");

    nav("/home", { replace: true });
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoText}>mylyfe</div>
        <h2 style={styles.h2}>enter 1 time password</h2>

        <input
          style={styles.otp}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="6 digits"
          inputMode="numeric"
        />

        {err ? <div style={styles.err}>{err}</div> : null}

        <button style={styles.primaryBtn} onClick={confirm}>
          confirm
        </button>

        <button style={styles.linkBtn} onClick={() => nav("/otp/send")}>
          ← back
        </button>

        {/* dev helper - delete later */}
        {expected ? (
          <div style={styles.devHint}>
            dev hint: your code is <b>{expected}</b>
          </div>
        ) : null}
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
    boxSizing: "border-box"
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
    textAlign: "center"
  },
  logoText: {
    fontWeight: 900,
    fontSize: 34,
    letterSpacing: 1,
    color: "#1a7f2e",
    marginBottom: 10
  },
  h2: { margin: "6px 0 10px", fontWeight: 900 },
  otp: {
    width: "100%",
    padding: "14px 14px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.18)",
    outline: "none",
    fontSize: 22,
    fontWeight: 900,
    letterSpacing: 6,
    textAlign: "center",
    boxSizing: "border-box"
  },
  err: { marginTop: 10, color: "#b91c1c", fontWeight: 800, fontSize: 13 },
  primaryBtn: {
    width: "100%",
    marginTop: 12,
    padding: "12px 14px",
    borderRadius: 10,
    fontWeight: 900,
    background: "#1a7f2e",
    color: "white",
    border: "none",
    cursor: "pointer"
  },
  linkBtn: {
    marginTop: 10,
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    background: "transparent",
    border: "none",
    color: "#1877f2",
    fontWeight: 800,
    cursor: "pointer"
  },
  devHint: { marginTop: 12, fontSize: 12, opacity: 0.7 }
};