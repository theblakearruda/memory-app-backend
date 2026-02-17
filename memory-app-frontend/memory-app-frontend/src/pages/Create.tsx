import { useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL, STORAGE_BUCKET } from "../lib/config";
import { supabase } from "../lib/supabaseClient";

import TopBar from "../components/TopBar";
import Sidebar from "../components/Sidebar";

export default function Create() {
  const nav = useNavigate();

  const [loadingCreate, setLoadingCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [photoUrl, setPhotoUrl] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");

  const [uploading, setUploading] = useState(false);

  // gps state
  const [locLoading, setLocLoading] = useState(false);
  const [locStatus, setLocStatus] = useState<string | null>(null);

  const canUseSupabase = useMemo(() => !!supabase, []);

  function makeSafeFilename(name: string) {
    return name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9.\-_]/g, "");
  }

  function makeId() {
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
        contentType: file.type || "image/jpeg",
      });

      if (uploadErr) throw new Error(uploadErr.message);

      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      if (!data?.publicUrl) throw new Error("failed to get public url (bucket might not be public)");

      return data.publicUrl;
    } finally {
      setUploading(false);
    }
  }

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

          const url =
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +
            `&lat=${latitude}&lon=${longitude}`;

          const res = await fetch(url, { headers: { Accept: "application/json" } });
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
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }

  async function createEnvelope(e: FormEvent) {
    e.preventDefault();

    try {
      setLoadingCreate(true);
      setError(null);

      let finalUrl = photoUrl.trim();

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
          location: location.trim(),
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`backend failed: ${res.status} ${text}`);
      }

      // success: go back to home so you see it in the feed
      nav("/home", { replace: true });
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "failed creating envelope");
    } finally {
      setLoadingCreate(false);
    }
  }

  return (
    <div style={layout.page}>
      <TopBar />

      <div style={layout.body}>
        <Sidebar />

        <div style={layout.main}>
          <div style={layout.mainInner}>
            <div style={header.row}>
              <h1 style={header.title}>create a memory</h1>
              <button type="button" style={header.backBtn} onClick={() => nav("/home")}>
                ← back
              </button>
            </div>

            <form onSubmit={createEnvelope} style={styles.form}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setPhotoFile(file);
                  if (file) setPhotoUrl("");
                }}
                style={styles.input}
                disabled={!canUseSupabase}
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

              <button
                type="button"
                onClick={fillLocationFromGPS}
                disabled={locLoading}
                style={{ ...styles.button, opacity: locLoading ? 0.7 : 1 }}
              >
                {locLoading ? "getting location…" : "use my location"}
              </button>

              {locStatus && <div style={{ opacity: 0.75, fontSize: 12 }}>{locStatus}</div>}

              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="location"
                style={styles.input}
              />

              <button disabled={loadingCreate || uploading} style={styles.primaryBtn}>
                {loadingCreate ? "saving..." : uploading ? "uploading..." : "save envelope"}
              </button>

              {!canUseSupabase && (
                <div style={{ opacity: 0.75, fontSize: 12 }}>
                  supabase client not ready — check env vars and restart vite.
                </div>
              )}
            </form>

            {error && <div style={styles.error}>{error}</div>}
          </div>
        </div>

        <div style={layout.rightRail} />
      </div>
    </div>
  );
}

/** layout matches Home.tsx vibe */
const layout: Record<string, React.CSSProperties> = {
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
  rightRail: {
    position: "sticky",
    top: 70,
    height: "calc(100vh - 70px)",
    overflow: "auto",
    padding: 12,
    boxSizing: "border-box",
  },
};

const header: Record<string, React.CSSProperties> = {
  row: {
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
  backBtn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.10)",
    background: "white",
    cursor: "pointer",
    fontWeight: 900,
    color: "#111827",
  },
};

const styles: Record<string, CSSProperties> = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: 16,
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 12,
    background: "white",
  },
  input: {
    padding: 12,
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.14)",
    background: "#ffffff",
    color: "#111827",
    fontWeight: 700,
    outline: "none",
  },
  button: {
    padding: 12,
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.14)",
    background: "#f3f4f6",
    color: "#111827",
    fontWeight: 900,
    cursor: "pointer",
    width: "fit-content",
  },
  primaryBtn: {
    padding: 12,
    borderRadius: 10,
    border: "none",
    background: "#111827",
    color: "white",
    fontWeight: 1000,
    cursor: "pointer",
    width: "fit-content",
  },
  error: {
    marginTop: 14,
    color: "#b91c1c",
    fontWeight: 900,
  },
};