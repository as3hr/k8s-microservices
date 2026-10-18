import { Router } from "express";
import { pool } from "./index.js";

const router = Router();

interface ITask {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    completed: boolean;
    created_at: Date;
}

router.get("/", async (req, res) => {
  const { rows } = await pool.query<ITask>("SELECT * FROM tasks");
  res.send({ message: "Tasks fetched successfully", tasks: rows });
});

router.post("/", async (req, res) => {
  const { user_id, title, description } = req.body;
  const { rows } = await pool.query<ITask>(
    "INSERT INTO tasks (user_id, title, description) VALUES ($1, $2, $3) RETURNING *",
    [user_id, title, description]
  );
  res.status(201).send({ message: "Task created successfully", task: rows[0] });
});

router.get("/:id", async (req, res) => {
  const { rows } = await pool.query<ITask>("SELECT * FROM tasks WHERE id = $1", [req.params.id]);
  if (rows.length === 0) {
    return res.status(404).send({ message: "Task not found" });
  }
  res.send({ message: "Task fetched successfully", task: rows[0] });
});

router.put("/:id", async (req, res) => {
  const { title, description, completed } = req.body;
  const { rows } = await pool.query<ITask>(
    "UPDATE tasks SET title = $1, description = $2, completed = $3 WHERE id = $4 RETURNING *",
    [title, description, completed, req.params.id]
  );
  if (rows.length === 0) {
    return res.status(404).send({ message: "Task not found" });
  }
  res.send({ message: "Task updated successfully", task: rows[0] });
});

router.delete("/:id", async (req, res) => {
  const { rowCount } = await pool.query("DELETE FROM tasks WHERE id = $1", [req.params.id]);
  if (rowCount === 0) {
    return res.status(404).send({ message: "Task not found" });
  }
  res.send({ message: "Task deleted successfully" });
});

export { router as taskRouter };
