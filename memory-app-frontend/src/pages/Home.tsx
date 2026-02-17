import { useEffect, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../lib/config";
import type { Envelope } from "../types";

import TopBar from "../components/TopBar";
import Sidebar from "../components/Sidebar";

export default function Home({ mode = "home" }: { mode?: "home" | "envos" }) {
  const nav = useNavigate();

  const isFeeds = mode === "home";

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
    const raw = env.created_at;
    if (!raw) return "unknown time";
    const dt = new Date(raw);
    if (Number.isNaN(dt.getTime())) return "unknown time";

    return dt.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  useEffect(() => {
    loadEnvelopes();
  }, []);

  return (
    <div style={styles.page}>
      <TopBar />

      <div style={styles.body}>
        <Sidebar />

        <div style={styles.main}>
          <div style={styles.mainInner}>
            <div style={styles.headerRow}>
              <h1 style={styles.title}>{mode === "envos" ? "your envelopes" : "home"}</h1>

              <button style={styles.refreshBtn} onClick={loadEnvelopes} disabled={loadingList}>
                {loadingList ? "loading…" : "refresh"}
              </button>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <div style={{ ...styles.grid, ...(isFeeds ? styles.gridFeeds : {}) }}>
              {envelopes.map((env) => (
                <button
                  key={env.id}
                  type="button"
                  style={{ ...styles.cardBtn, ...(isFeeds ? styles.cardBtnFeeds : {}) }}
                  onClick={() => nav("/envos")}
                >
                  <img
                    src={env.photourl}
                    alt=""
                    style={{ ...styles.image, ...(isFeeds ? styles.imageFeeds : {}) }}
                  />

                  <div style={{ padding: 12 }}>
                    <div style={{ fontWeight: 900, marginBottom: 6, color: "#111827" }}>
                      {env.caption || "untitled"}
                    </div>

                    <div style={{ opacity: 0.85, color: "#374151" }}>{env.location || "unknown"}</div>

                    <div style={{ opacity: 0.75, marginTop: 6, color: "#374151" }}>
                      {showDate(env)}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteEnvelope(env.id);
                      }}
                      disabled={deletingId === env.id}
                      style={{
                        marginTop: 10,
                        padding: 10,
                        borderRadius: 10,
                        border: "1px solid rgba(239,68,68,0.30)",
                        background: "rgba(239,68,68,0.10)",
                        color: "#991b1b",
                        fontWeight: 900,
                        cursor: deletingId === env.id ? "not-allowed" : "pointer",
                        opacity: deletingId === env.id ? 0.6 : 1,
                        width: "100%",
                      }}
                    >
                      {deletingId === env.id ? "deleting…" : "delete"}
                    </button>
                  </div>
                </button>
              ))}

              {!loadingList && envelopes.length === 0 && (
                <div style={styles.empty}>
                  no envelopes yet. go create one so this page stops looking depressed.
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={styles.rightRail}>
          <div style={styles.panel}>
            <div style={{ fontWeight: 900, marginBottom: 10, color: "#111827" }}>contacts</div>
            <div style={{ color: "#374151", opacity: 0.85 }}>
              we’ll plug your “invite contacts” flow here next.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    position: "fixed",
    inset: 0,
    background: "#f0f2f5",
    overflow: "auto",
  },

  body: {
    display: "grid",
    gridTemplateColumns: "280px 1fr 320px",
    gap: 12,
    padding: 12,
    paddingTop: 70,
    boxSizing: "border-box",
  },

  main: { minHeight: "calc(100vh - 90px)" },

  mainInner: {
    background: "rgba(255,255,255,0.65)",
    border: "1px solid rgba(0,0,0,0.06)",
    borderRadius: 14,
    padding: 14,
    boxSizing: "border-box",
  },

  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
  },

  title: {
    fontSize: 22,
    margin: 0,
    fontWeight: 900,
    color: "#111827",
    textTransform: "lowercase",
  },

  refreshBtn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.10)",
    background: "white",
    cursor: "pointer",
    fontWeight: 900,
    color: "#111827",
  },

  error: { marginBottom: 12, color: "#b91c1c", fontWeight: 800 },

  // default = envos grid
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 16,
    width: "100%",
  },

  // feeds = single vertical column
  gridFeeds: {
    gridTemplateColumns: "1fr",
    maxWidth: 720,
    margin: "0 auto",
  },

  cardBtn: {
    borderRadius: 16,
    overflow: "hidden",
    border: "1px solid rgba(0,0,0,0.10)",
    background: "white",
    boxShadow: "0 10px 25px rgba(0,0,0,0.10)",
    padding: 0,
    cursor: "pointer",
    textAlign: "left",
  },

  cardBtnFeeds: {
    width: "100%",
  },

  image: {
    width: "100%",
    height: 220,
    objectFit: "cover",
    display: "block",
    background: "#e5e7eb",
  },

  // make feed images a little taller so it feels like an actual feed
  imageFeeds: {
    height: 320,
  },

  empty: {
    gridColumn: "1 / -1",
    background: "white",
    border: "1px solid rgba(0,0,0,0.10)",
    borderRadius: 14,
    padding: 16,
    fontWeight: 800,
    color: "#111827",
  },

  rightRail: {
    position: "sticky",
    top: 70,
    height: "calc(100vh - 70px)",
    overflow: "auto",
    padding: 12,
    boxSizing: "border-box",
  },

  panel: {
    background: "white",
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,0.10)",
    padding: 16,
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  },
};