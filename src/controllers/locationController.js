import { z } from 'zod';
import { prisma } from '../config/prisma.js';

const locationSchema = z.object({ nama: z.string().min(1).max(100) });

export const getAllLocations = async (req, res, next) => {
  try {
    const locations = await prisma.location.findMany({
      orderBy: { id: 'asc' },
    });
    res.json({ success: true, data: locations });
  } catch (err) {
    next(err);
  }
};

export const createLocation = async (req, res, next) => {
  try {
    const { nama } = locationSchema.parse(req.body);
    const location = await prisma.location.create({ data: { nama } });
    res.status(201).json({ success: true, data: location });
  } catch (err) {
    next(err);
  }
};

export const updateLocation = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { nama } = locationSchema.parse(req.body);
    const location = await prisma.location.update({
      where: { id },
      data: { nama },
    });
    res.json({ success: true, data: location });
  } catch (err) {
    next(err);
  }
};

export const deleteLocation = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.location.delete({ where: { id } });
    res.json({ success: true, message: 'Lokasi berhasil dihapus' });
  } catch (err) {
    next(err);
  }
};