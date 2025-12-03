import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const isExist = await prisma.user.findUnique({ where: { email } });
    if (isExist)
      return res.status(400).json({ message: "Email sudah digunakan" });

    const hashed = await bcrypt.hash(password, 10);

    // 1️⃣ Buat user dulu
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: role?.toUpperCase() || "MAHASISWA",
      },
    });

    let profile = null;

    // 2️⃣ Jika role mahasiswa → buat profil Mahasiswa
    if (user.role === "MAHASISWA") {
      profile = await prisma.mahasiswa.create({
        data: {
          nim: "NIM" + user.id, // boleh diganti sesuai kebutuhan
          nama: user.name,
          userId: user.id,
        },
      });
    }

    // 3️⃣ Jika role dosen → buat profil admin (opsional)
    else if (user.role === "ADMIN") {
      profile = await prisma.dosen.create({
        data: {
          nama: user.name,
          userId: user.id,
        },
      });
    }

    // Admin tidak perlu punya profil tambahan

    res.status(201).json({
      message: "Registrasi berhasil",
      user: user,
      profile: profile,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Gagal registrasi", error: error.message });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user)
      return res.status(404).json({ message: "Email tidak ditemukan" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Password salah" });

    // generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login berhasil",
      token,
      user: { id: user.id, name: user.name, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Gagal login" });
  }
};
