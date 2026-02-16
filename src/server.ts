import express from "express";
import cors from "cors";

import { authRouter } from "./routes/auth.js";
import { envelopesRouter } from "./routes/envelopes.js";

const app = express();

// ✅ allow your frontend (5173) to call your backend (3000)
app.use(cors({
  origin: true, // easiest in dev (reflects request origin)
}));

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRouter);
app.use("/envelopes", envelopesRouter);

const port = 3000;

app.listen(port, () => {
  console.log(`server running on http://localhost:${port}`);
});
