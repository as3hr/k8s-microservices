import express from "express";
import { userRouter } from "./users.js";
import pg from "pg";

const app = express();

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(express.json());

app.use('/api/users', userRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server listening on port http://localhost:${port}`);
});