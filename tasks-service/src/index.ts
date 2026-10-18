import express from "express";
import { taskRouter } from "./tasks.js";
import pg from "pg";

const app = express();

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(express.json());

app.use('/api/tasks', taskRouter);

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server listening on port http://localhost:${port}`);
});