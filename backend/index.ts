import express from "express";
import cors from "cors";

import { PORT } from "./env.ts";
import macrosRouter from "./routes/macros.ts";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/macros", macrosRouter);

app.get("/", (req, res) => {
  res.send("Backend running");
});

app.listen(PORT, () => console.log(`Open on ${PORT}`));
