import { useEffect, useState, type CSSProperties } from "react";
import { API_URL } from "../lib/config";
import type { Envelope } from "../types";

export default function Home() {
  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadEnvelopes() {
    try {
      setLoadingList(true);
      setError(null);

      const res = await fetch(`${API_URL}/envelopes/all`);
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`failed loading envelopes: ${res.status} ${text}`);
      }

      const data = await res.json();
      setEnvelopes(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setError("couldn’t load envelopes");
    } finally {
      setLoadingList(false);
    }
  }

  async function deleteEnvelope(id: number) {
    if (!confirm("delete envelope permanently?")) return;

    const snapshot = envelopes;
    setDeletingId(id);
    setError(null);
    setEnvelopes((prev) => prev.filter((e) => e.id !== id));

    try {
      const res = await fetch(`${API_URL}/envelopes/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`delete failed: ${res.status} ${text}`);
      }
    } catch (err) {
      console.error(err);
      setEnvelopes(snapshot);
      alert("delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  function showDate(env: Envelope) {
    const raw = env.created_at ?? env.date;
    if (!raw) return "unknown time";
    const dt = new Date(raw);
    if (Number.isNaN(dt.getTime())) return "unknown time";

    return dt.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  }

  useEffect(() => {
    loadEnvelopes();
  }, []);

  return (
    <div>
      <h1 style={styles.title}>home feed</h1>

      {loadingList && <div style={{ opacity: 0.7 }}>loading…</div>}
      {error && <div style={{ marginBottom: 16, color: "#ff9b9b" }}>{error}</div>}

      <div style={styles.grid}>
        {envelopes.map((env) => (
          <div key={env.id} style={styles.card}>
            <img src={env.photourl} style={styles.image} />

            <div style={{ padding: 12 }}>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>{env.caption || "untitled"}</div>
              <div style={{ opacity: 0.8 }}>{env.location || "unknown"}</div>
              <div style={{ opacity: 0.8, marginTop: 6 }}>{showDate(env)}</div>

              <button
                onClick={() => deleteEnvelope(env.id)}
                disabled={deletingId === env.id}
                style={{
                  marginTop: 10,
                  padding: 10,
                  borderRadius: 10,
                  border: "1px solid rgba(255,90,90,0.35)",
                  background: "rgba(255,90,90,0.10)",
                  color: "white",
                  fontWeight: 800,
                  cursor: deletingId === env.id ? "not-allowed" : "pointer",
                  opacity: deletingId === env.id ? 0.6 : 1
                }}
              >
                {deletingId === env.id ? "deleting…" : "delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  title: { fontSize: 28, marginBottom: 14 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 20,
    width: "100%"
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.05)",
    boxShadow: "0 10px 25px rgba(0,0,0,0.4)"
  },
  image: {
    width: "100%",
    height: 220,
    objectFit: "cover",
    display: "block"
  }
};
