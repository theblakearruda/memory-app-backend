import express from "express";
import dns from "node:dns";
import { supabase } from "../supabase"; // ✅ src/routes/envelopes.ts -> src/supabase.ts

export const envelopesRouter = express.Router();

// prefer ipv4 (helps random fetch weirdness in some envs)
dns.setDefaultResultOrder("ipv4first");

// ✅ be consistent: if your DB table is "memories", keep it.
const TABLE_NAME = "memories";

// if you’re using `date` now but later switch to `created_at`, change this:
const ORDER_COLUMN = "date"; // change to "created_at" when ready

type WeatherResult = {
  weather: string | null;
  weather_code: number | null;
  temp_f: number | null;
};

envelopesRouter.get("/test", (_req, res) => {
  res.json({ message: "envelopes route working" });
});

// -----------------------------
// weather helpers
// -----------------------------
function weatherCodeToText(code: number): string {
  if (code === 0) return "clear";
  if (code === 1 || code === 2) return "mostly clear";
  if (code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "drizzle";
  if ([61, 63, 65, 66, 67].includes(code)) return "rain";
  if ([71, 73, 75, 77].includes(code)) return "snow";
  if ([77].includes(code)) return "snow grains";
  if ([80, 81, 82].includes(code)) return "rain showers";
  if ([85, 86].includes(code)) return "snow showers";
  if ([95, 96, 99].includes(code)) return "thunderstorm";
  return "unknown";
}

function cToF(c: number) {
  return Math.round((c * 9) / 5 + 32);
}

async function geocodeLocation(
  location: string
): Promise<{ lat: number; lon: number } | null> {
  const q = encodeURIComponent(location.trim());
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${q}&count=1&language=en&format=json`;

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;

    const json: any = await res.json();
    const first = json?.results?.[0];
    if (typeof first?.latitude !== "number" || typeof first?.longitude !== "number") {
      return null;
    }

    return { lat: first.latitude, lon: first.longitude };
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

async function getWeatherForLocation(location: string): Promise<WeatherResult> {
  if (!location?.trim()) return { weather: null, weather_code: null, temp_f: null };

  const coords = await geocodeLocation(location);
  if (!coords) return { weather: null, weather_code: null, temp_f: null };

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true`;

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return { weather: null, weather_code: null, temp_f: null };

    const json: any = await res.json();
    const cw = json?.current_weather;

    const code = typeof cw?.weathercode === "number" ? cw.weathercode : null;
    const tempC = typeof cw?.temperature === "number" ? cw.temperature : null;

    return {
      weather: code === null ? null : weatherCodeToText(code),
      weather_code: code,
      temp_f: tempC === null ? null : cToF(tempC)
    };
  } catch {
    return { weather: null, weather_code: null, temp_f: null };
  } finally {
    clearTimeout(t);
  }
}

// -----------------------------
// legacy date helper (NOW WITH TIME)
// -----------------------------
function parseLegacyDate(dateInput: unknown, timeInput?: unknown): string | null {
  const dateRaw = String(dateInput ?? "").trim();
  if (!dateRaw) return null;

  const timeRaw = String(timeInput ?? "").trim(); // "HH:mm" (optional)

  const ymd = /^\d{4}-\d{2}-\d{2}$/;
  const hm = /^\d{2}:\d{2}$/;

  let toParse = dateRaw;

  // if it's just a date like 2000-01-09, attach the time (or default to 12:00)
  if (ymd.test(dateRaw)) {
    const t = hm.test(timeRaw) ? timeRaw : "12:00";
    toParse = `${dateRaw}T${t}:00`;
  }

  const dt = new Date(toParse);
  if (Number.isNaN(dt.getTime())) return null;

  return dt.toISOString();
}

// -----------------------------
// routes
// -----------------------------

// get all
envelopesRouter.get("/all", async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .order(ORDER_COLUMN, { ascending: false });

    if (error) {
      console.error("supabase select error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.json(data ?? []);
  } catch (err: any) {
    console.error("server crash loading envelopes:", err);
    return res.status(500).json({ error: "server crashed loading envelopes" });
  }
});

// create (normal: date = now)
envelopesRouter.post("/create", async (req, res) => {
  try {
    const userid = Number(req.body?.userid);
    const photourl = String(req.body?.photourl ?? "").trim();
    const caption = String(req.body?.caption ?? "").trim();
    const location = String(req.body?.location ?? "").trim();

    if (!userid || Number.isNaN(userid)) {
      return res.status(400).json({ error: "valid userid required" });
    }
    if (!photourl) {
      return res.status(400).json({ error: "photourl required" });
    }

    const now = new Date().toISOString();

    // compute weather based on location string
    const w = await getWeatherForLocation(location);

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([
        {
          userid,
          photourl,
          caption,
          location,
          date: now,
          is_legacy: false,
          weather: w.weather,
          weather_code: w.weather_code,
          temp_f: w.temp_f
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("supabase insert error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({ message: "envelope saved successfully", envelope: data });
  } catch (err: any) {
    console.error("server crash saving envelope:", err);
    return res.status(500).json({ error: "server crashed saving envelope" });
  }
});

// create legacy (custom date + optional time)
envelopesRouter.post("/legacy-create", async (req, res) => {
  try {
    const userid = Number(req.body?.userid);
    const photourl = String(req.body?.photourl ?? "").trim();
    const caption = String(req.body?.caption ?? "").trim();
    const location = String(req.body?.location ?? "").trim();

    // legacy_date + legacy_time
    const legacyIso = parseLegacyDate(req.body?.legacy_date, req.body?.legacy_time);

    if (!userid || Number.isNaN(userid)) {
      return res.status(400).json({ error: "valid userid required" });
    }
    if (!photourl) {
      return res.status(400).json({ error: "photourl required" });
    }
    if (!legacyIso) {
      return res.status(400).json({ error: "legacy_date required (YYYY-MM-DD)" });
    }

    const w = await getWeatherForLocation(location);

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([
        {
          userid,
          photourl,
          caption,
          location,
          date: legacyIso,
          is_legacy: true,
          weather: w.weather,
          weather_code: w.weather_code,
          temp_f: w.temp_f
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("supabase insert error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({ message: "legacy envelope saved successfully", envelope: data });
  } catch (err: any) {
    console.error("server crash saving legacy envelope:", err);
    return res.status(500).json({ error: "server crashed saving legacy envelope" });
  }
});

// delete
envelopesRouter.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ error: "valid id required" });
    }

    const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);

    if (error) {
      console.error("supabase delete error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({ message: "deleted", id });
  } catch (err: any) {
    console.error("server crash deleting envelope:", err);
    return res.status(500).json({ error: "server crashed deleting envelope" });
  }
});
