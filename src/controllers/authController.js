import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
});

const loginSchema = registerSchema;

export const register = async (req, res, next) => {
  try {
    const { username, password } = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: 'Username sudah terdaftar' });
    }

    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { username, password: hashed, role: 'USER' },
    });

    res
      .status(201)
      .json({ success: true, message: 'User berhasil didaftarkan' });
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