import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createJadwalDosen = async (req, res) => {
  const { mataKuliahId, hari, jamMulai, jamSelesai, kapasitas } = req.body;
  console.log(req.body);

  try {
    // Ambil profil dosen dari user login
    const dosen = await prisma.dosen.findUnique({
      where: { userId: req.user.id }
    });

    if (!dosen) {
      return res.status(404).json({ message: "Profil dosen tidak ditemukan" });
    }

    // Buat jadwal dengan dosenId
    const jadwal = await prisma.jadwal.create({
      data: {
        mataKuliahId: Number(mataKuliahId),
        dosenId: dosen.id,            // 👈 WAJIB ADA
        hari,
        jamMulai,
        jamSelesai,
        kapasitas: Number(kapasitas)
      }
    });

    // Ambil jadwal yang baru dibuat
    const find = await prisma.jadwal.findMany({
      where: { id: jadwal.id },
      include: {
        dosen: true,
        mataKuliah: true,
      }
    });

    const nambah = find.map((na) => {
      return {
        mataKuliah: na.mataKuliah.nama,
        pengajar: na.dosen.nama,
        hari: na.hari,
        jamMulai: na.jamMulai,
        jamSelesai: na.jamSelesai,
        kapasitas: na.kapasitas
      };
    });

    res.json({
      message: "Jadwal berhasil dibuat",
      Data: nambah
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getJadwalHariIni = async (req, res) => {
  try {
    const hariMap = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

    const today = new Date();
    const hariIni = hariMap[today.getDay()];

    const dosenUserId = req.user.id;

    const dosen = await prisma.dosen.findFirst({
      where: { userId: dosenUserId },
    });

    if (!dosen) {
      return res.status(404).json({ error: "Profil dosen tidak ditemukan" });
    }

    const jadwalHariIni = await prisma.jadwal.findMany({
      where: {
        dosenId: dosen.id,
        hari: hariIni,
      },
      include: {
        mataKuliah: true,
        dosen: true,
      },
    });

    res.json({
      message: `Jadwal mengajar hari ${hariIni}`,
      data: jadwalHariIni,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const updateJadwalDosen = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const dosen = await prisma.dosen.findUnique({ where: { userId: req.user.id }});

    const jadwal = await prisma.jadwal.findUnique({ where: { id }});
    if (!jadwal) return res.status(404).json({ message: "Jadwal tidak ditemukan" });
    if (jadwal.dosenId !== dosen.id)
      return res.status(403).json({ message: "Anda tidak berhak mengubah jadwal ini" });

    const updated = await prisma.jadwal.update({
      where: { id },
      data: req.body,
    });

    res.json({ message: "Jadwal diperbarui", updated });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteJadwalDosen = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const dosen = await prisma.dosen.findUnique({ where: { userId: req.user.id }});

    const jadwal = await prisma.jadwal.findUnique({ where: { id }});
    if (!jadwal) return res.status(404).json({ message: "Jadwal tidak ditemukan" });
    if (jadwal.dosenId !== dosen.id)
      return res.status(403).json({ message: "Anda tidak boleh menghapus jadwal ini" });

    await prisma.jadwal.delete({ where: { id } });

    res.json({ message: "Jadwal dihapus" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
