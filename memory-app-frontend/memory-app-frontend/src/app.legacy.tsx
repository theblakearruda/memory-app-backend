import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { createClient } from "@supabase/supabase-js";

const API_URL = "https://fantastic-lamp-wx4pxjx6px294r9-3000.app.github.dev";

// your supabase storage bucket name
const STORAGE_BUCKET = "envelopes";

type Envelope = {
  id: number;
  userid: number;
  photourl: string;
  caption: string | null;
  location: string | null;
  // ✅ use created_at going forward. keep date optional just so older rows don't explode.
  created_at?: string | null;
  date?: string | null;
};

export default function App() {
  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [photoUrl, setPhotoUrl] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");

  const [uploading, setUploading] = useState(false);

  // ✅ gps state
  const [locLoading, setLocLoading] = useState(false);
  const [locStatus, setLocStatus] = useState<string | null>(null);

  const supabase = useMemo(() => {
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

    if (!url || !key) {
      console.error("missing supabase env vars (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)");
      return null;
    }

    return createClient(url, key);
  }, []);

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

      // ✅ don't trust the backend blindly
      setEnvelopes(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("loadEnvelopes error:", err);
      setError("couldn’t load envelopes");
    } finally {
      setLoadingList(false);
    }
  }

  // ✅ gps helper (auto-fill location)
  async function fillLocationFromGPS() {
    if (!("geolocation" in navigator)) {
      setLocStatus("gps not available in this browser.");
      return;
    }

    setLocLoading(true);
    setLocStatus("getting your location…");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;

          // reverse geocode (coords -> city/state) via openstreetmap nominatim
          const url =
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +
            `&lat=${latitude}&lon=${longitude}`;

          const res = await fetch(url, {
            headers: {
              Accept: "application/json"
            }
          });

          if (!res.ok) throw new Error("reverse geocode failed");

          const data = await res.json();

          const city =
            data?.address?.city ||
            data?.address?.town ||
            data?.address?.village ||
            data?.address?.hamlet ||
            "";

          const state = data?.address?.state || "";
          const nice = [city, state].filter(Boolean).join(", ");

          if (!nice) {
            setLocStatus("got coords, but couldn’t format a city/state.");
            return;
          }

          setLocation(nice);
          setLocStatus(`location set: ${nice}`);
        } catch (e) {
          console.error(e);
          setLocStatus("couldn’t convert gps to a city/state.");
        } finally {
          setLocLoading(false);
        }
      },
      (err) => {
        console.error(err);
        setLocLoading(false);

        if (err.code === 1) setLocStatus("location permission denied.");
        else if (err.code === 2) setLocStatus("gps unavailable.");
        else if (err.code === 3) setLocStatus("gps timed out.");
        else setLocStatus("gps error.");
      },
      {
        enableHighAccuracy: false,
        timeout: 8000
      }
    );
  }

  function makeSafeFilename(name: string) {
    return name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9.\-_]/g, "");
  }

  function makeId() {
    // ✅ safer than assuming randomUUID exists everywhere
    const c = (globalThis as any).crypto;
    if (c?.randomUUID) return c.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  async function uploadToSupabase(file: File): Promise<string> {
    if (!supabase) throw new Error("supabase not initialized (check env vars + restart vite)");

    setUploading(true);

    try {
      const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
      const base = makeSafeFilename(file.name.replace(/\.[^/.]+$/, "")) || "photo";
      const path = `user-1/${makeId()}-${base}.${ext}`;

      const { error: uploadErr } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
        upsert: false,
        contentType: file.type || "image/jpeg"
      });

      if (uploadErr) {
        console.error("supabase upload error:", uploadErr);
        throw new Error(uploadErr.message);
      }

      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);

      if (!data?.publicUrl) {
        throw new Error("failed to get public url (bucket might not be public)");
      }

      return data.publicUrl;
    } finally {
      setUploading(false);
    }
  }

  async function createEnvelopeReal(e: FormEvent) {
    e.preventDefault();

    try {
      setLoadingCreate(true);
      setError(null);

      let finalUrl = photoUrl.trim();

      // prefer upload if file selected
      if (photoFile) {
        finalUrl = await uploadToSupabase(photoFile);
      }

      if (!finalUrl) {
        setError("provide photo or URL");
        return;
      }

      const res = await fetch(`${API_URL}/envelopes/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userid: 1,
          photourl: finalUrl,
          caption: caption.trim(),
          location: location.trim()
        })
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`backend failed: ${res.status} ${text}`);
      }

      const data = await res.json();

      // ✅ validate response shape
      if (!data?.envelope) {
        console.error("backend returned:", data);
        throw new Error("backend returned no envelope");
      }

      setEnvelopes((prev) => [data.envelope, ...prev]);

      // reset form
      setPhotoFile(null);
      setPhotoUrl("");
      setCaption("");
      setLocation("");
      setLocStatus(null);
    } catch (err: any) {
      console.error("createEnvelopeReal error:", err);
      setError(err?.message || "failed creating envelope");
    } finally {
      setLoadingCreate(false);
    }
  }

  async function deleteEnvelope(id: number) {
    if (!confirm("delete envelope permanently?")) return;

    const snapshot = envelopes;

    setDeletingId(id);
    setError(null);
    setEnvelopes((prev) => prev.filter((e) => e.id !== id));

    try {
      const res = await fetch(`${API_URL}/envelopes/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`delete failed: ${res.status} ${text}`);
      }
    } catch (err) {
      console.error("deleteEnvelope error:", err);
      setEnvelopes(snapshot);
      alert("delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    loadEnvelopes();
  }, []);

  function showDate(env: Envelope) {
    // ✅ prefer created_at, fallback to date for older rows
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

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>MyLyfe</h1>

        <form onSubmit={createEnvelopeReal} style={styles.form}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setPhotoFile(file);
              if (file) setPhotoUrl("");
            }}
            style={styles.input}
          />

          <input
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="or paste photo URL"
            style={styles.input}
            disabled={!!photoFile}
          />

          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="caption"
            style={styles.input}
          />

          {/* ✅ gps button + status */}
          <button
            type="button"
            onClick={fillLocationFromGPS}
            disabled={locLoading}
            style={{ ...styles.button, opacity: locLoading ? 0.7 : 1 }}
          >
            {locLoading ? "Getting location…" : "Use my location"}
          </button>

          {locStatus && <div style={{ opacity: 0.75, fontSize: 12 }}>{locStatus}</div>}

          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="location"
            style={styles.input}
          />

          <button disabled={loadingCreate || uploading} style={styles.button}>
            {loadingCreate ? "Saving..." : uploading ? "Uploading..." : "Save Envelope"}
          </button>

          {loadingList && <div style={{ opacity: 0.7 }}>loading…</div>}
        </form>

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
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    width: "100vw",
    background: "#0b0e14",
    color: "white",
    padding: 24,
    boxSizing: "border-box"
  },

  container: {
    width: "100%",
    maxWidth: "1400px",
    margin: "0 auto"
  },

  title: {
    fontSize: 40,
    marginBottom: 20
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginBottom: 24,
    padding: 16,
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 12,
    background: "rgba(255,255,255,0.05)"
  },

  input: {
    padding: 12,
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(0,0,0,0.3)",
    color: "white"
  },

  button: {
    padding: 12,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.25)",
    background: "rgba(255,255,255,0.12)",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
    width: "fit-content"
  },

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
