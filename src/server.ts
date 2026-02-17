import express from "express";
import cors from "cors";

import { authRouter } from "./routes/auth.js";
import { envelopesRouter } from "./routes/envelopes.js";

const app = express();

/**
 * codespaces + local dev + LAN (phone) friendly cors
 * - allows localhost
 * - allows any https://*.app.github.dev
 * - allows your LAN ip (phone hitting your laptop)
 * - handles OPTIONS preflight
 */
const corsOptions: cors.CorsOptions = {
  origin: (origin, cb) => {
    // no origin = server-to-server / curl / same-origin
    if (!origin) return cb(null, true);

    // allow local dev
    const isLocal =
      origin === "http://localhost:5173" ||
      origin === "http://127.0.0.1:5173";

    // allow LAN dev (your iphone hitting your laptop)
    // your IPv4 is 10.0.0.44, and vite runs on 5173
    const isLanDev = origin === "http://10.0.0.44:5173";

    // allow any codespaces preview domain
    const isCodespaces = /^https:\/\/.*\.app\.github\.dev$/.test(origin);

    if (isLocal || isLanDev || isCodespaces) return cb(null, true);

    return cb(new Error(`cors blocked origin: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRouter);
app.use("/envelopes", envelopesRouter);

const port = 3000;

// listen on all network interfaces so your phone can reach it
app.listen(port, "0.0.0.0", () => {
  console.log(`server running on http://0.0.0.0:${port}`);
});