import { useEffect, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../lib/config";

export default function CreateGroup() {
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberContact, setMemberContact] = useState("");
  const [members, setMembers] = useState<Array<{ name: string; contact?: string }>>([]);

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const userid = 1;

  useEffect(() => {
    // make sure defaults exist once per browser
    const k = "MyLyfe_seeded_defaults";
    if (localStorage.getItem(k) === "1") return;

    fetch(`${API_URL}/groups/seed-defaults`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userid }),
    })
      .then(() => localStorage.setItem(k, "1"))
      .catch(() => {});
  }, []);

  function addMember() {
    const n = memberName.trim();
    const c = memberContact.trim();
    if (!n) return;

    setMembers((prev) => [...prev, { name: n, contact: c || undefined }]);
    setMemberName("");
    setMemberContact("");
  }

  async function create() {
    setErr(null);

    if (!name.trim()) return setErr("group needs a name. you can’t create ‘nothing’ 💀");

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/groups/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userid,
          name: name.trim(),
          members,
        }),
      });

      if (!res.ok) throw new Error(await res.text().catch(() => "failed"));

      nav("/groups", { replace: true });
    } catch (e: any) {
      setErr(e?.message ?? "failed to create group");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <div style={styles.title}>create group</div>
            <div style={styles.sub}>make a squad, then add people to it.</div>
          </div>

          <button style={styles.backBtn} onClick={() => nav("/home")}>
            ← back
          </button>
        </div>

        <input
          style={styles.input}
          placeholder="group name (ex: my homies)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div style={styles.sectionTitle}>members</div>

        <div style={styles.row2}>
          <input
            style={styles.input}
            placeholder="name"
            value={memberName}
            onChange={(e) => setMemberName(e.target.value)}
          />
          <input
            style={styles.input}
            placeholder="contact (optional)"
            value={memberContact}
            onChange={(e) => setMemberContact(e.target.value)}
          />
        </div>

        <button type="button" style={styles.secondaryBtn} onClick={addMember}>
          add member
        </button>

        {members.length > 0 && (
          <div style={styles.chips}>
            {members.map((m, i) => (
              <div key={i} style={styles.chip}>
                <div style={{ fontWeight: 900 }}>{m.name}</div>
                {m.contact ? <div style={{ opacity: 0.7, fontSize: 12 }}>{m.contact}</div> : null}
                <button
                  type="button"
                  style={styles.x}
                  onClick={() => setMembers((prev) => prev.filter((_, idx) => idx !== i))}
                  title="remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {err ? <div style={styles.err}>{err}</div> : null}

        <button style={styles.primaryBtn} disabled={saving} onClick={create}>
          {saving ? "creating…" : "create group"}
        </button>
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
    width: "min(94vw, 620px)",
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
    marginTop: 10,
  },
  sectionTitle: { marginTop: 14, fontWeight: 1000, color: "#111827" },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  secondaryBtn: {
    marginTop: 10,
    padding: "10px 12px",
    borderRadius: 12,
    fontWeight: 900,
    background: "#ffffff",
    border: "1px solid rgba(0,0,0,0.18)",
    color: "#0b0e14",
    cursor: "pointer",
  },
  chips: { marginTop: 12, display: "grid", gap: 8 },
  chip: {
    position: "relative",
    border: "1px solid rgba(0,0,0,0.10)",
    borderRadius: 12,
    padding: 12,
    background: "#f8fafc",
  },
  x: {
    position: "absolute",
    top: 8,
    right: 10,
    border: "none",
    background: "transparent",
    fontSize: 22,
    cursor: "pointer",
    opacity: 0.6,
  },
  err: { marginTop: 12, color: "#b91c1c", fontWeight: 900 },
  primaryBtn: {
    marginTop: 14,
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    fontWeight: 1000,
    background: "#111827",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
};