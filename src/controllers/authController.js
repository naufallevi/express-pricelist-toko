import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';

const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
});

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
  role: z.enum(['ADMIN', 'USER']).optional().default('USER'),
});

export const register = async (req, res, next) => {
  try {
    const { username, password, role } = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: 'Username sudah terdaftar' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashed, role },
      select: { id: true, username: true, role: true, createdAt: true },
    });

    res.status(201).json({
      success: true,
      message: `User dengan role ${role} berhasil didaftarkan`,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'Username atau password salah' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res
        .status(401)
        .json({ success: false, message: 'Username atau password salah' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({ success: true, token, role: user.role });
  } catch (err) {
    next(err);
  }
};

// Admin melihat daftar user
export const listUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, role: true, createdAt: true },
      orderBy: { id: 'asc' },
    });
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

// Admin tidak bisa menghapus akun sendiri, hanya akun lain yang bisa dihapus
export const deleteUser = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat menghapus akun sendiri',
      });
    }

    await prisma.user.delete({ where: { id } });
    res.json({ success: true, message: 'User berhasil dihapus' });
  } catch (err) {
    next(err);
  }
};