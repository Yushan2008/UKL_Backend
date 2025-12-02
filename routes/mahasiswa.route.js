import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  listAvailableMata,
  listAvailableJadwal,
  enrollJadwal,
  mySchedule
} from "../controllers/mahasiswa.controller.js";

const router = express.Router();
router.use(authMiddleware);

// endpoints available for logged-in mahasiswa (role check inside controller)
router.get("/mata", listAvailableMata);       // melihat mata kuliah
router.get("/jadwal", listAvailableJadwal);   // melihat jadwal yang tersedia
router.post("/enroll", enrollJadwal);         // memilih / mendaftar jadwal
router.get("/schedule", mySchedule);          // lihat jadwal yang sudah dipilih

export default router;
