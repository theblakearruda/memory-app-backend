import { Router } from "express";
import { pool } from "../db";

const r = Router();

r.get("/all", async (req, res) => {
  const userid = Number(req.query.userid);
  if (!userid) return res.status(400).send("missing userid");

  const { rows } = await pool.query(
    `select * from life_events where userid=$1 order by created_at desc`,
    [userid]
  );
  res.json(rows);
});

r.post("/create", async (req, res) => {
  const {
    userid,
    title,
    category,
    event_date,
    location,
    story,
    cover_url,
    audience_group_id,
  } = req.body;

  if (!userid || !title?.trim()) return res.status(400).send("missing userid/title");

  const { rows } = await pool.query(
    `insert into life_events
     (userid, title, category, event_date, location, story, cover_url, audience_group_id)
     values ($1,$2,$3,$4,$5,$6,$7,$8)
     returning *`,
    [
      userid,
      title.trim(),
      (category || "other").trim(),
      event_date || null,
      location?.trim() || null,
      story?.trim() || null,
      cover_url?.trim() || null,
      audience_group_id || null,
    ]
  );

  res.json(rows[0]);
});

export default r;