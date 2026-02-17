import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { STORAGE_AUTH, STORAGE_USER } from "../lib/storage";

type Gender = "female" | "male" | "custom" | "";

export default function Signup() {
  const nav = useNavigate();

  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [contact, setContact] = useState("");
  const [gender, setGender] = useState<Gender>("");
  const [month, setMonth] = useState("Sep");
  const [day, setDay] = useState("28");
  const [year, setYear] = useState("2025");
  const [password, setPassword] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!first.trim() || !last.trim() || !contact.trim() || !password.trim()) {
      alert("fill the required fields bro 😭 (first, last, phone/email, password)");
      return;
    }

    localStorage.setItem(
      STORAGE_USER,
      JSON.stringify({
        first: first.trim(),
        last: last.trim(),
        contact: contact.trim(),
        gender,
        dob: { month, day, year },
      })
    );

    localStorage.setItem(STORAGE_AUTH, "1");

    // ✅ go straight to home; splash plays on refresh anyway
    nav("/home", { replace: true });
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <div style={styles.logoText}>MyLyfe</div>
        </div>

        <h2 style={styles.h2}>create a new account</h2>
        <div style={styles.sub}>it’s quick and easy.</div>

        <form onSubmit={onSubmit} style={{ width: "100%" }}>
          <div style={styles.row2}>
            <input
              style={styles.input}
              placeholder="first name"
              value={first}
              onChange={(e) => setFirst(e.target.value)}
            />
            <input
              style={styles.input}
              placeholder="last name"
              value={last}
              onChange={(e) => setLast(e.target.value)}
            />
          </div>

          <input
            style={styles.inputFull}
            placeholder="mobile number or email"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />

          <div style={styles.label}>gender</div>
          <div style={styles.genderRow}>
            <label style={styles.genderBtn}>
              <span style={styles.genderText}>female</span>
              <input type="radio" checked={gender === "female"} onChange={() => setGender("female")} />
            </label>

            <label style={styles.genderBtn}>
              <span style={styles.genderText}>male</span>
              <input type="radio" checked={gender === "male"} onChange={() => setGender("male")} />
            </label>

            <label style={styles.genderBtn}>
              <span style={styles.genderText}>custom</span>
              <input type="radio" checked={gender === "custom"} onChange={() => setGender("custom")} />
            </label>
          </div>

          <div style={styles.label}>birthday</div>
          <div style={styles.row3}>
            <select style={styles.select} value={month} onChange={(e) => setMonth(e.target.value)}>
              {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <select style={styles.select} value={day} onChange={(e) => setDay(e.target.value)}>
              {Array.from({ length: 31 }, (_, i) => String(i + 1)).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select style={styles.select} value={year} onChange={(e) => setYear(e.target.value)}>
              {Array.from({ length: 100 }, (_, i) => String(2026 - i)).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <input
            style={styles.inputFull}
            placeholder="new password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" style={styles.primaryBtn}>
            sign up
          </button>

          <button type="button" style={styles.linkBtn} onClick={() => nav("/auth", { replace: true })}>
            already have an account?
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    position: "fixed",
    inset: 0,
    background: "#f0f2f5",
    display: "grid",
    placeItems: "center",
    padding: 24,
    boxSizing: "border-box",
    margin: 0,
    color: "#0b0e14",
  },
  card: {
    width: "min(92vw, 520px)",
    background: "white",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.12)",
    padding: 22,
    boxSizing: "border-box",
    boxShadow: "0 12px 38px rgba(0,0,0,0.12)",
    textAlign: "center",
    color: "#0b0e14",
  },
  logoWrap: { display: "flex", justifyContent: "center", marginBottom: 10 },
  logoText: { fontWeight: 900, fontSize: 34, letterSpacing: 1, color: "#1a7f2e" },
  h2: { margin: "6px 0 2px", fontWeight: 900, color: "#0b0e14" },
  sub: { marginBottom: 14, opacity: 0.7, fontSize: 13, color: "rgba(0,0,0,0.65)" },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 },
  row3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 },
  input: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 8,
    border: "1px solid rgba(0,0,0,0.18)",
    outline: "none",
    fontSize: 14,
    boxSizing: "border-box",
    background: "white",
    color: "#0b0e14",
  },
  inputFull: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 8,
    border: "1px solid rgba(0,0,0,0.18)",
    outline: "none",
    fontSize: 14,
    boxSizing: "border-box",
    marginBottom: 10,
    background: "white",
    color: "#0b0e14",
  },
  select: {
    width: "100%",
    padding: "10px 10px",
    borderRadius: 8,
    border: "1px solid rgba(0,0,0,0.18)",
    outline: "none",
    fontSize: 14,
    boxSizing: "border-box",
    background: "white",
    color: "#0b0e14",
    fontWeight: 700,
  },
  label: {
    textAlign: "left",
    fontSize: 12,
    fontWeight: 800,
    opacity: 0.8,
    margin: "6px 0 6px",
    color: "rgba(0,0,0,0.70)",
  },
  genderRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 },
  genderBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    border: "1px solid rgba(0,0,0,0.18)",
    borderRadius: 8,
    padding: "10px 10px",
    fontSize: 14,
    background: "white",
    color: "#0b0e14",
  },
  genderText: { color: "#0b0e14", fontWeight: 800 },
  primaryBtn: {
    width: "100%",
    marginTop: 6,
    padding: "12px 14px",
    borderRadius: 10,
    fontWeight: 900,
    background: "#1a7f2e",
    color: "white",
    border: "none",
    cursor: "pointer",
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
    cursor: "pointer",
  },
};