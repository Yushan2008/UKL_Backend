import express from "express";
import { authMiddleware, requireRole } from "../middleware/auth.middleware.js";
import {
  createDosen, updateDosen, deleteDosen, listDosen,
  createMata, updateMata, deleteMata, listMata,
  createMahasiswa, getMahasiswa, updateMahasiswa, deleteMahasiswa,
  createJadwal, updateJadwal, deleteJadwal, listJadwal
} from "../controllers/admin.controller.js"; // we'll split controllers but keep small

const router = express.Router();

router.use(authMiddleware, requireRole("ADMIN"));

// Dosen
router.post("/dosen", createDosen);
router.get("/dosen", listDosen);
router.put("/dosen/:id", updateDosen);
router.delete("/dosen/:id", deleteDosen);

// MataKuliah
router.post("/mata", createMata);
router.get("/mata", listMata);
router.put("/mata/:id", updateMata);
router.delete("/mata/:id", deleteMata);

// Mahasiswa (admin manage)
router.post("/mahasiswa", createMahasiswa);
router.get("/mahasiswa", getMahasiswa);
router.put("/mahasiswa/:id", updateMahasiswa);
router.delete("/mahasiswa/:id", deleteMahasiswa);

// Jadwal
router.post("/jadwal", createJadwal);
router.get("/jadwal", listJadwal);
router.put("/jadwal/:id", updateJadwal);
router.delete("/jadwal/:id", deleteJadwal);

export default router;
