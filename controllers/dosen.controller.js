import { PrismaClient } from "@prisma/client";
import { createDeflate } from "zlib";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

// --- Dosen CRUD ---
export const createDosen = async (req, res) => {
  try {
    const { nama, nip, alamat, jenisKelamin } = req.body;

    const dosen = await prisma.dosen.create({
      data: {
        nama,
        nip,
        alamat,
        jenisKelamin,
      },
    });

    res.status(201).json(dosen);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const listDosen = async (req, res) => {
  const dosens = await prisma.dosen.findMany();
  res.json(dosens);
};

export const updateDosen = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nama, nip, alamat, jenisKelamin } = req.body;
    const updated = await prisma.dosen.update({ where: { id }, data: { nama, nip, alamat, jenisKelamin } });
    res.json({
      message: "Data berhasil update",
      Data: updated
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const deleteDosen = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.dosen.delete({ where: { id } });
    res.json({ 
      message: "Dosen deleted",
      status: "succes"
     });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- MataKuliah CRUD ---
export const createMata = async (req, res) => {
  try {
    const { kode, nama, dosenId, sks } = req.body;
    const mata = await prisma.mataKuliah.create({ data: { kode, nama, dosenId, sks } });
    const find = await prisma.mataKuliah.findMany({where: {id: mata.id}, include: { dosen: true }})

    const result = find.map((Turuks)=> {
      const i = {
        id: Turuks.id,
        namaMatkul: Turuks.nama,
        kode: Turuks.kode,
        Pengajar: Turuks.dosen.nama,
        sks: Turuks.sks
      }
      return i;
    })
    res.status(201).json({
      message: "Matkul berhasil ditambah",
      Data: result
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const listMata = async (req, res) => {
  const list = await prisma.mataKuliah.findMany({ include: { dosen: true } });

  const mantap = list.map((Laso)=> {
    const a = {
      id: Laso.id,
        namaMatkul: Laso.nama,
        kode: Laso.kode,
        Pengajar: Laso.dosen.nama,
        sks: Laso.sks,
        createdAt: Laso.createdAt
    }
    return a;
  })
  res.json({
    message: "List mata kuliah",
    Data: mantap
  });
};

export const updateMata = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { kode, nama, sks } = req.body;
    const updated = await prisma.mataKuliah.update({ where: { id }, data: { kode, nama, sks } });
    const perbarui = await prisma.mataKuliah.findMany({ where: { id: updated.id }, include: { dosen: true } })
    
    const result = perbarui.map((Patak)=> {
      const s = {
        id: Patak.id,
        namaMatkul: Patak.nama,
        kode: Patak.kode,
        Pengajar: Patak.dosen.nama,
        sks: Patak.sks,
      }
      return s;
    })
    res.json({
      message: "Data berhasil update",
      Data: result
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const deleteMata = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.mataKuliah.delete({ where: { id }});
    const hapus = await prisma.mataKuliah.findMany({ where: { id: id.id }, include: { dosen: true } })

    const respon = hapus.map((haha)=> {
      const h = {
        id: haha.id,
        namaMatkul: haha.nama,
        kode: haha.kode,
        Pengajar: haha.dosen.nama,
        sks: haha.sks,
        createdAt: haha.createdAt
      }
      return h;
    })
    res.json({ message: "Mata kuliah deleted",
      matkulLainnya: respon
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- Mahasiswa management (admin) ---
export const createMahasiswa = async (req, res) => {
  try {
    const { nama, nim, email, password } = req.body;

    // Cek apakah email sudah dipakai
    const emailExists = await prisma.user.findUnique({ where: { email } });
    if (emailExists) {
      return res.status(400).json({ message: "Email sudah digunakan" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Buat user baru
    const user = await prisma.user.create({
      data: {
        name: nama,
        email,
        password: hashedPassword,
        role: "MAHASISWA",
      },
    });

    // 2. Buat mahasiswa yang terhubung ke user
    const mahasiswa = await prisma.mahasiswa.create({
      data: {
        nim,
        nama,
        userId: user.id,
      },
    });

    res.status(201).json({
      message: "Mahasiswa berhasil ditambahkan",
      data: {
        id: mahasiswa.id,
        nim: mahasiswa.nim,
        nama: mahasiswa.nama,
        email: user.email,
      },
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMahasiswa = async (req, res) => {
  try {
    const mhs = await prisma.mahasiswa.findMany({
      distinct: ["id"], 
      include: {
        enrollments: {
          include: {
            jadwal: {
              include: {
                mataKuliah: true,
                dosen: true,
              },
            },
          },
        },
      },
    });

    res.json({
      message: "List Mahasiswa",
      Data: mhs,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateMahasiswa = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nama, nim } = req.body;
    const updated = await prisma.mahasiswa.update({ where: { id }, data: { nama, nim } });
    const upgrade = await prisma.mahasiswa.findMany({ where: {id: updated.id }, include: {
        enrollments: {
          include: {
            jadwal: {
              include: {
                mataKuliah: true,
                dosen: true,
              },
            },
          },
        },
      },
    })

    const respon = upgrade.map((haha)=> {
      const h = {
        id: haha.id,
        nim: haha.nim,
        nama: haha.nama
      }
      return h;
    })

    res.json({
      message: "Data Berhasil diperbarui",
      Data: respon
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const deleteMahasiswa = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const hapus = await prisma.mahasiswa.findMany({ where: {id: id.id }, include: {
        enrollments: {
          include: {
            jadwal: {
              include: {
                mataKuliah: true,
                dosen: true,
              },
            },
          },
        },
      },
    })
    // optionally delete user too - here we just delete mahasiswa record
    await prisma.mahasiswa.delete({ where: { id } });
    res.json({ message: "Mahasiswa deleted",
      mahasiswaLainnya: hapus
     });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- Jadwal CRUD ---
export const createJadwal = async (req, res) => {
  try {
    const { mataKuliahId, dosenId, hari, jamMulai, jamSelesai, kapasitas } = req.body;
    const jadwal = await prisma.jadwal.create({
      data: { mataKuliahId: Number(mataKuliahId), dosenId: Number(dosenId), hari, jamMulai, jamSelesai, kapasitas: kapasitas ?? 999 }
    });
    res.status(201).json(jadwal);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const listJadwal = async (req, res) => {
  const jadwals = await prisma.jadwal.findMany({ include: { mataKuliah: true, dosen: true, enrollments: true } });
  res.json(jadwals);
};

export const updateJadwal = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { mataKuliahId, dosenId, hari, jamMulai, jamSelesai, kapasitas } = req.body;
    const updated = await prisma.jadwal.update({
      where: { id },
      data: { mataKuliahId: mataKuliahId ? Number(mataKuliahId) : undefined, dosenId: dosenId ? Number(dosenId) : undefined, hari, jamMulai, jamSelesai, kapasitas }
    });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const deleteJadwal = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.jadwal.delete({ where: { id } });
    res.json({ message: "Jadwal deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};