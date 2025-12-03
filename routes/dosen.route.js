import express from "express";
import { authMiddleware, requireRole } from "../middleware/auth.middleware.js";

import {
  createJadwalDosen,
  getJadwalHariIni,
  updateJadwalDosen,
  deleteJadwalDosen,
} from "../controllers/dosen.controller.js";

const router = express.Router();

router.post( "/jadwal", authMiddleware, requireRole("DOSEN"), createJadwalDosen );
router.get( "/jadwal", authMiddleware, requireRole("DOSEN"), getJadwalHariIni );
router.put( "/jadwal/:id", authMiddleware, requireRole("DOSEN"), updateJadwalDosen );
router.delete( "/jadwal/:id", authMiddleware,requireRole("DOSEN"),deleteJadwalDosen);

export default router;
