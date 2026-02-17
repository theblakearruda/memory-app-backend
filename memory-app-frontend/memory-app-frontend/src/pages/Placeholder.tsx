import type { CSSProperties } from "react";
import TopBar from "../components/TopBar";
import Sidebar from "../components/Sidebar";

export default function Placeholder({ title, msg }: { title: string; msg: string }) {
  return (
    <div style={styles.page}>
      <TopBar />

      <div style={styles.body}>
        <Sidebar />

        <div style={styles.main}>
          <div style={styles.mainInner}>
            <h1 style={styles.title}>{title}</h1>
            <div style={styles.msg}>{msg}</div>
          </div>
        </div>

        <div style={styles.rightRail} />
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
    padding: 18,
    boxSizing: "border-box",
  },
  title: {
    fontSize: 22,
    margin: 0,
    fontWeight: 900,
    color: "#111827",
    textTransform: "lowercase",
    marginBottom: 10,
  },
  msg: { fontSize: 16, fontWeight: 800, color: "#374151", opacity: 0.9 },
  rightRail: {},
};