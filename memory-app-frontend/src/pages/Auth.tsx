import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { STORAGE_AUTH, STORAGE_USER } from "../lib/storage";

type Step = "phone" | "otp";

export default function Auth() {
  const nav = useNavigate();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function sendOtp() {
    setErr(null);

    const cleaned = phone.trim();
    if (!cleaned) return setErr("enter your phone number");
    if (!cleaned.startsWith("+")) return setErr('use format like "+1XXXXXXXXXX"');

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: cleaned });
      if (error) throw error;
      setStep("otp");
    } catch (e: any) {
      setErr(e?.message ?? "failed to send code");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    setErr(null);

    const cleanedPhone = phone.trim();
    const cleanedCode = code.trim();

    if (!cleanedCode) return setErr("enter the code");
    if (!cleanedPhone.startsWith("+")) return setErr("phone number looks wrong");

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: cleanedPhone,
        token: cleanedCode,
        type: "sms",
      });

      if (error) throw error;

      // ✅ single truth
      localStorage.setItem(STORAGE_AUTH, "1");

      // store minimal profile
      localStorage.setItem(
        STORAGE_USER,
        JSON.stringify({ contact: cleanedPhone, first: "mylyfe", last: "user" })
      );

      nav("/home", { replace: true });
    } catch (e: any) {
      setErr(e?.message ?? "failed to verify code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>MyLyfe</div>

        {step === "phone" ? (
          <>
            <div style={styles.title}>sign in</div>
            <div style={styles.sub}>enter your phone to get a one-time code.</div>

            <input
              style={styles.input}
              placeholder='phone number (ex: "+1XXXXXXXXXX")'
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />

            {err && <div style={styles.err}>{err}</div>}

            <button style={styles.primaryBtn} onClick={sendOtp} disabled={loading}>
              {loading ? "sending..." : "send one-time password"}
            </button>

            <button style={styles.secondaryBtn} onClick={() => nav("/signup", { replace: true })} disabled={loading}>
              back to sign up
            </button>
          </>
        ) : (
          <>
            <div style={styles.title}>enter code</div>
            <div style={styles.sub}>check your phone and type the code.</div>

            <input
              style={styles.input}
              placeholder="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
            />

            {err && <div style={styles.err}>{err}</div>}

            <button style={styles.primaryBtn} onClick={verifyOtp} disabled={loading}>
              {loading ? "confirming..." : "confirm"}
            </button>

            <button
              style={styles.secondaryBtn}
              onClick={() => {
                setCode("");
                setStep("phone");
              }}
              disabled={loading}
            >
              ← back
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { position: "fixed", inset: 0, background: "#ffffff", display: "grid", placeItems: "center", padding: 24 },
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
  logo: { fontWeight: 900, letterSpacing: 0.5, fontSize: 44, marginBottom: 18, color: "#0b0e14" },
  title: { fontSize: 26, fontWeight: 900, marginBottom: 6, color: "#0b0e14" },
  sub: { marginBottom: 16, opacity: 0.75, color: "#0b0e14" },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.18)",
    outline: "none",
    fontSize: 16,
    marginBottom: 12,
    boxSizing: "border-box",
  },
  err: { marginBottom: 12, color: "#b91c1c", fontWeight: 700, textAlign: "left" },
  primaryBtn: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    fontWeight: 900,
    background: "#16a34a",
    border: "1px solid rgba(0,0,0,0.10)",
    color: "white",
    cursor: "pointer",
    marginTop: 4,
  },
  secondaryBtn: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    fontWeight: 900,
    background: "#ffffff",
    border: "1px solid rgba(0,0,0,0.18)",
    color: "#0b0e14",
    cursor: "pointer",
    marginTop: 10,
  },
};