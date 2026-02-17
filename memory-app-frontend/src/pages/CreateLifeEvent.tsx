import { useEffect, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../lib/config";

type Group = { id: number; name: string; is_default: boolean };

export default function CreateLifeEvent() {
  const nav = useNavigate();
  const userid = 1;

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("other");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [story, setStory] = useState("");
  const [coverUrl, setCoverUrl] = useState("");

  const [groups, setGroups] = useState<Group[]>([]);
  const [audienceGroupId, setAudienceGroupId] = useState<number | "">("");

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/groups/all?userid=${userid}`)
      .then((r) => r.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setGroups(arr);
        const friends = arr.find((g: Group) => g.name.toLowerCase() === "friends");
        if (friends) setAudienceGroupId(friends.id);
      })
      .catch(() => setGroups([]));
  }, []);

  async function create() {
    setErr(null);
    if (!title.trim()) return setErr("life event needs a title. don’t post ‘unnamed trauma’ 😭");

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/life-events/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userid,
          title: title.trim(),
          category,
          event_date: eventDate || null,
          location: location.trim() || null,
          story: story.trim() || null,
          cover_url: coverUrl.trim() || null,
          audience_group_id: audienceGroupId || null,
        }),
      });

      if (!res.ok) throw new Error(await res.text().catch(() => "failed"));

      nav("/home", { replace: true });
    } catch (e: any) {
      setErr(e?.message ?? "failed to create life event");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <div style={styles.title}>create life event</div>
            <div style={styles.sub}>a chapter in your timeline (not just a single post).</div>
          </div>

          <button style={styles.backBtn} onClick={() => nav("/home")}>
            ← back
          </button>
        </div>

        <input style={styles.input} placeholder="title (ex: moved to miami)" value={title} onChange={(e) => setTitle(e.target.value)} />

        <div style={styles.row2}>
          <select style={styles.input} value={category} onChange={(e) => setCategory(e.target.value)}>
            {["move","relationship","career","school","travel","health","milestone","other"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <input style={styles.input} type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
        </div>

        <input style={styles.input} placeholder="location (optional)" value={location} onChange={(e) => setLocation(e.target.value)} />
        <input style={styles.input} placeholder="cover photo url (optional)" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} />

        <select
          style={styles.input}
          value={audienceGroupId}
          onChange={(e) => setAudienceGroupId(e.target.value ? Number(e.target.value) : "")}
        >
          <option value="">audience: everyone (for now)</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              audience: {g.name}
            </option>
          ))}
        </select>

        <textarea
          style={{ ...styles.input, height: 140, resize: "vertical" }}
          placeholder="story (optional) — what happened, why it mattered, the vibe"
          value={story}
          onChange={(e) => setStory(e.target.value)}
        />

        {err ? <div style={styles.err}>{err}</div> : null}

        <button style={styles.primaryBtn} disabled={saving} onClick={create}>
          {saving ? "creating…" : "create life event"}
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: { position: "fixed", inset: 0, background: "#f0f2f5", display: "grid", placeItems: "center", padding: 16, boxSizing: "border-box" },
  card: { width: "min(94vw, 700px)", background: "white", borderRadius: 14, border: "1px solid rgba(0,0,0,0.10)", boxShadow: "0 12px 38px rgba(0,0,0,0.12)", padding: 16, boxSizing: "border-box" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 10 },
  title: { fontWeight: 1000, fontSize: 20, color: "#111827" },
  sub: { marginTop: 2, fontSize: 13, color: "rgba(0,0,0,0.65)", fontWeight: 700 },
  backBtn: { border: "1px solid rgba(0,0,0,0.12)", background: "white", borderRadius: 12, padding: "10px 12px", fontWeight: 900, cursor: "pointer" },
  input: { width: "100%", padding: "12px 12px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.18)", outline: "none", fontSize: 14, boxSizing: "border-box", color: "#111827", background: "white", marginTop: 10 },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  err: { marginTop: 12, color: "#b91c1c", fontWeight: 900 },
  primaryBtn: { marginTop: 14, width: "100%", padding: "12px 14px", borderRadius: 12, fontWeight: 1000, background: "#111827", color: "white", border: "none", cursor: "pointer" },
};