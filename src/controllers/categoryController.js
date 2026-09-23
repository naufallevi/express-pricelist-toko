import { z } from 'zod';
import { prisma } from '../config/prisma.js';

const categorySchema = z.object({ nama: z.string().min(1).max(100) });

export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { id: 'asc' },
    });
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { nama } = categorySchema.parse(req.body);
    const category = await prisma.category.create({ data: { nama } });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { nama } = categorySchema.parse(req.body);
    const category = await prisma.category.update({
      where: { id },
      data: { nama },
    });
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.category.delete({ where: { id } });
    res.json({ success: true, message: 'Kategori berhasil dihapus' });
  } catch (err) {
    next(err);
  }
};