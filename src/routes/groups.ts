import { Router } from "express";
import { pool } from "../db"; // adjust to your db file

const r = Router();

// seed defaults: friends / colleagues / family
r.post("/seed-defaults", async (req, res) => {
  const { userid } = req.body;
  if (!userid) return res.status(400).send("missing userid");

  const defaults = ["friends", "colleagues", "family"];

  await pool.query("begin");
  try {
    for (const name of defaults) {
      await pool.query(
        `insert into groups (userid, name, is_default)
         values ($1, $2, true)
         on conflict (userid, name) do nothing`,
        [userid, name]
      );
    }
    await pool.query("commit");
    res.json({ ok: true });
  } catch (e: any) {
    await pool.query("rollback");
    res.status(500).send(e.message);
  }
});

r.get("/all", async (req, res) => {
  const userid = Number(req.query.userid);
  if (!userid) return res.status(400).send("missing userid");

  const { rows } = await pool.query(
    `select * from groups where userid=$1 order by is_default desc, created_at asc`,
    [userid]
  );
  res.json(rows);
});

// create group + members in one shot
r.post("/create", async (req, res) => {
  const { userid, name, members } = req.body;
  if (!userid || !name?.trim()) return res.status(400).send("missing userid/name");

  await pool.query("begin");
  try {
    const g = await pool.query(
      `insert into groups (userid, name, is_default)
       values ($1, $2, false)
       returning *`,
      [userid, name.trim()]
    );

    const group = g.rows[0];

    if (Array.isArray(members)) {
      for (const m of members) {
        const memberName = String(m?.name ?? "").trim();
        const contact = String(m?.contact ?? "").trim() || null;
        if (!memberName) continue;

        // upsert-ish: reuse same person if exact match
        const p = await pool.query(
          `insert into people (userid, name, contact)
           values ($1, $2, $3)
           returning id`,
          [userid, memberName, contact]
        );

        const personId = p.rows[0].id;

        await pool.query(
          `insert into group_members (group_id, person_id)
           values ($1, $2)
           on conflict (group_id, person_id) do nothing`,
          [group.id, personId]
        );
      }
    }

    await pool.query("commit");
    res.json(group);
  } catch (e: any) {
    await pool.query("rollback");
    res.status(500).send(e.message);
  }
});

export default r;