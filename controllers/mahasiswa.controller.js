import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const MIN_SKS = 15;
const MAX_SKS = 23;

function ensureMahasiswaRole(req, res) {
  if (!req.user || req.user.role !== "MAHASISWA") {
    res.status(403).json({ error: "Endpoint hanya untuk mahasiswa" });
    return false;
  }
  return true;
}

export const listAvailableMata = async (req, res) => {
  if (!ensureMahasiswaRole(req, res)) return;
  const list = await prisma.mataKuliah.findMany({ include: { dosen: true } });

  const mantap = list.map((Laso)=> {
    const a = {
      id: Laso.id,
        namaMatkul: Laso.nama,
        kode: Laso.kode,
        Pengajar: Laso.dosen.nama,
        sks: Laso.sks,
    }
    return a;
  })
  res.json({
    message: "Daftar mata kuliah",
    Data: mantap
  });
};

export const listAvailableJadwal = async (req, res) => {
  if (!ensureMahasiswaRole(req, res)) return;
  const jadwals = await prisma.jadwal.findMany({ include: { mataKuliah: true, dosen: true, enrollments: true } });
  const daftar = await prisma.jadwal.findMany({ where: { id: jadwals.id }, include: { mataKuliah: true, dosen: true}})

  const respon = daftar.map((ka)=> {
    const m = {
      id: ka.id,
        mataKuliahId: ka.mataKuliah.nama,
        Pengajar: ka.dosen.nama,
        hari: ka.hari,
        jamMulai: ka.jamMulai,
        jamSelesai: ka.jamSelesai
    }
    return m;
  })
  res.json({
    message: "Daftar Jadwal",
    Data: respon
  });
};

export const enrollJadwal = async (req, res) => {
  if (!ensureMahasiswaRole(req, res)) return;
  try {
    const { jadwalId } = req.body;
    if (!jadwalId) return res.status(400).json({ error: "jadwalId required" });

    // find mahasiswa by user id
    const mahasiswa = await prisma.mahasiswa.findUnique({ where: { userId: req.user.id }, include: { enrollments: { include: { jadwal: { include: { mataKuliah: true } } } } } });
    if (!mahasiswa) return res.status(404).json({ error: "Mahasiswa profile not found" });

    // find jadwal
    const jadwal = await prisma.jadwal.findUnique({ where: { id: Number(jadwalId) }, include: { mataKuliah: true, enrollments: true } });
    if (!jadwal) return res.status(404).json({ error: "Jadwal not found" });

    // capacity check
    if (jadwal.enrollments.length >= jadwal.kapasitas) return res.status(400).json({ error: "Kelas sudah penuh" });

    // calculate current total SKS
    const currentSKS = mahasiswa.enrollments.reduce((sum, e) => sum + (e.jadwal.mataKuliah?.sks || 0), 0);
    const targetSKS = currentSKS + (jadwal.mataKuliah?.sks || 0);

    if (targetSKS > MAX_SKS) return res.status(400).json({ error: `Melebihi batas maksimum SKS (${MAX_SKS}). Saat ini ${currentSKS} SKS.` });

    // avoid duplicate enrollment same mataKuliah (optional) or same jadwal already
    const already = await prisma.enrollment.findFirst({ where: { mahasiswaId: mahasiswa.id, jadwalId: jadwal.id } });
    if (already) return res.status(400).json({ error: "Sudah terdaftar di jadwal ini" });

    // Prevent duplicate mataKuliah (optional): check if same mataKuliah already taken
    const sameMataTaken = mahasiswa.enrollments.find(e => e.jadwal.mataKuliahId === jadwal.mataKuliahId);
    if (sameMataTaken) return res.status(400).json({ error: "Anda sudah mengambil mata kuliah ini pada jadwal lain" });

    // create enrollment
    const enroll = await prisma.enrollment.create({ data: { mahasiswaId: mahasiswa.id, jadwalId: jadwal.id } });

    // after enroll, verify MIN SKS rule may be applied at semester end or enforced elsewhere. Here we just allow enroll; admin may check later.
    const daftarJadwal = await prisma.enrollment.findMany({ where: { id: Number(jadwalId) }, include: { mataKuliah: true, enrollments: true, dosen: true } });
     
    return res.status(201).json({ message: "Berhasil mendaftar jadwal", enrollment: enroll, totalSKS: targetSKS, });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const mySchedule = async (req, res) => {
  if (!ensureMahasiswaRole(req, res)) return;
  const mahasiswa = await prisma.mahasiswa.findUnique({
    where: { userId: req.user.id },
    include: { enrollments: { include: { jadwal: { include: { mataKuliah: true, dosen: true } } } } }
  });
  if (!mahasiswa) return res.status(404).json({ error: "Mahasiswa profile not found" });

  const schedules = mahasiswa.enrollments.map(e => ({
    jadwalId: e.jadwal.id,
    mataKuliah: e.jadwal.mataKuliah,
    Pengajar: e.jadwal.dosen,
    hari: e.jadwal.hari,
    jamMulai: e.jadwal.jamMulai,
    jamSelesai: e.jadwal.jamSelesai
  }));
  const totalSKS = mahasiswa.enrollments.reduce((s, e) => s + (e.jadwal.mataKuliah?.sks || 0), 0);

  res.json({ schedules, totalSKS, minSKS: MIN_SKS, maxSKS: MAX_SKS });
};
