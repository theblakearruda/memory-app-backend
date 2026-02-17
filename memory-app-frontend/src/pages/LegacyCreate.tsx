import { useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../lib/config";

export default function LegacyCreate() {
  const nav = useNavigate();

  const [photoUrl, setPhotoUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [legacyDate, setLegacyDate] = useState(""); // YYYY-MM-DD
  const [legacyTime, setLegacyTime] = useState("09:00"); // HH:mm (default not noon lol)
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!photoUrl.trim()) return alert("drop a photo url first bro");
    if (!legacyDate) return alert("pick the legacy date (that’s the whole point 😭)");

    setSaving(true);

    try {
      const res = await fetch(`${API_URL}/envelopes/legacy-create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userid: 1, // <-- keep whatever you’re using for now
          photourl: photoUrl.trim(),
          caption: caption.trim(),
          location: location.trim(),
          legacy_date: legacyDate,  // "YYYY-MM-DD"
          legacy_time: legacyTime,  // "HH:mm"
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`legacy create failed: ${res.status} ${text}`);
      }

      nav("/home");
    } catch (err) {
      console.error(err);
      alert("legacy envo failed to create (backend didn’t like something)");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <div style={styles.title}>legacy envo</div>
            <div style={styles.sub}>post something from the past (you set the date).</div>
          </div>

          <button style={styles.backBtn} onClick={() => nav("/home")}>
            ← back
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
          <input
            style={styles.input}
            placeholder="photo url"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <div style={styles.dateTimeRow}>
            <label style={styles.label}>
              legacy date
              <input
                type="date"
                style={styles.input}
                value={legacyDate}
                onChange={(e) => setLegacyDate(e.target.value)}
              />
            </label>

            <label style={styles.label}>
              time
              <input
                type="time"
                style={styles.input}
                value={legacyTime}
                onChange={(e) => setLegacyTime(e.target.value)}
              />
            </label>
          </div>

          <button type="submit" style={styles.primaryBtn} disabled={saving}>
            {saving ? "creating…" : "create legacy envo"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    position: "fixed",
    inset: 0,
    background: "#f0f2f5",
    display: "grid",
    placeItems: "center",
    padding: 16,
    boxSizing: "border-box",
  },
  card: {
    width: "min(94vw, 560px)",
    background: "white",
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,0.10)",
    boxShadow: "0 12px 38px rgba(0,0,0,0.12)",
    padding: 16,
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 10,
  },
  title: { fontWeight: 1000, fontSize: 20, color: "#111827" },
  sub: { marginTop: 2, fontSize: 13, color: "rgba(0,0,0,0.65)", fontWeight: 700 },
  backBtn: {
    border: "1px solid rgba(0,0,0,0.12)",
    background: "white",
    borderRadius: 12,
    padding: "10px 12px",
    fontWeight: 900,
    cursor: "pointer",
  },
  input: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.18)",
    outline: "none",
    fontSize: 14,
    boxSizing: "border-box",
    color: "#111827",
    background: "white",
  },
  dateTimeRow: {
    display: "grid",
    gridTemplateColumns: "1fr 180px",
    gap: 10,
    alignItems: "end",
  },
  label: {
    display: "grid",
    gap: 6,
    fontSize: 12,
    fontWeight: 900,
    color: "rgba(0,0,0,0.70)",
  },
  primaryBtn: {
    marginTop: 6,
    padding: "12px 14px",
    borderRadius: 12,
    fontWeight: 1000,
    background: "#111827",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
};
