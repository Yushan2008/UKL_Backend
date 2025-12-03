import express from "express";
import cors from "cors";
import authRoute from "./routes/auth.route.js";
import adminRoute from "./routes/admin.route.js";
import mahasiswaRoute from "./routes/mahasiswa.route.js";
import dosenRoute from "./routes/dosen.route.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoute);
app.use("/api/admin", adminRoute);
app.use("/api/mahasiswa", mahasiswaRoute);
app.use("/api/dosen", dosenRoute);

app.get("/", (req, res) => res.json({ ok: true, message: "Sistem Penjadwalan API" }));

export default app;
