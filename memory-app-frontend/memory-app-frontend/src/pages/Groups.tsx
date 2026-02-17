import { useEffect, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../lib/config";
import TopBar from "../components/TopBar";
import Sidebar from "../components/Sidebar";

type Group = { id: number; name: string; is_default: boolean };

export default function Groups() {
  const nav = useNavigate();
  const userid = 1;

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/groups/all?userid=${userid}`);
      const data = await res.json();
      setGroups(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={styles.page}>
      <TopBar />
      <div style={styles.body}>
        <Sidebar />
        <div style={styles.main}>
          <div style={styles.panel}>
            <div style={styles.headerRow}>
              <h1 style={styles.title}>groups</h1>
              <button style={styles.btn} onClick={() => nav("/create/group")}>+ new group</button>
            </div>

            {loading ? <div>loading…</div> : null}

            <div style={{ display: "grid", gap: 10 }}>
              {groups.map((g) => (
                <div key={g.id} style={styles.card}>
                  <div style={{ fontWeight: 1000 }}>{g.name}</div>
                  <div style={{ opacity: 0.7, fontWeight: 800, fontSize: 12 }}>
                    {g.is_default ? "default group" : "custom group"}
                  </div>
                </div>
              ))}
            </div>

            {!loading && groups.length === 0 ? <div>no groups yet. make one.</div> : null}
          </div>
        </div>

        <div style={styles.rightRail} />
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: { position: "fixed", inset: 0, background: "#f0f2f5", overflow: "auto" },
  body: { display: "grid", gridTemplateColumns: "280px 1fr 320px", gap: 12, padding: 12, paddingTop: 70, boxSizing: "border-box" },
  main: { minHeight: "calc(100vh - 90px)" },
  panel: { background: "white", borderRadius: 14, border: "1px solid rgba(0,0,0,0.10)", padding: 16, boxShadow: "0 10px 25px rgba(0,0,0,0.08)" },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14 },
  title: { margin: 0, fontWeight: 1000, color: "#111827" },
  btn: { padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.12)", background: "#111827", color: "white", fontWeight: 900, cursor: "pointer" },
  card: { borderRadius: 12, border: "1px solid rgba(0,0,0,0.10)", padding: 12, background: "#f8fafc" },
  rightRail: {},
};