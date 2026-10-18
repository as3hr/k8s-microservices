import { Router } from "express";
import { pool } from "./index.js";
import { TASKS_URL } from "./constants.js";

const router = Router();

interface IUser {
    id: string;
    name: string;
    email: string;
    created_at: Date;
}

router.get("/", async (req, res) => {
  const { rows } = await pool.query<IUser>("SELECT * FROM users");
  res.send({ message: "Users fetched successfully", users: rows });
});

router.post("/", async (req, res) => {
  const { name, email } = req.body;
  const { rows } = await pool.query<IUser>(
    "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
    [name, email]
  );
  res.status(201).send({ message: "User created successfully", user: rows[0] });
});

router.get("/:id", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [req.params.id]);
  if (!rows[0]) return res.status(404).send({ message: "User not found" });

  const r = await fetch(`${TASKS_URL}/api/tasks?userId=${req.params.id}`);
  if (!r.ok) return res.status(502).send({ message: "Tasks service unavailable" });

  const data = await r.json();
  res.send({ user: rows[0], tasks: data.tasks });
});

router.put("/:id", async (req, res) => {
  const { name, email } = req.body;
  const { rows } = await pool.query<IUser>(
    "UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *",
    [name, email, req.params.id]
  );
  if (rows.length === 0) {
    return res.status(404).send({ message: "User not found" });
  }
  res.send({ message: "User updated successfully", user: rows[0] });
});

router.delete("/:id", async (req, res) => {
  const { rowCount } = await pool.query("DELETE FROM users WHERE id = $1", [req.params.id]);
  if (rowCount === 0) {
    return res.status(404).send({ message: "User not found" });
  }
  res.send({ message: "User deleted successfully" });
});

export { router as userRouter };
