import { z } from 'zod';
import { prisma } from '../config/prisma.js';

const MAX_HISTORY = 3;

const createItemSchema = z.object({
  namaBarang: z.string().min(1).max(150),
  categoryId: z.number().int().positive(),
  locationId: z.number().int().positive(),
  harga: z.number().positive(),
  deskripsi: z.string().optional().nullable(),
});

const updateItemSchema = z.object({
  namaBarang: z.string().min(1).max(150).optional(),
  categoryId: z.number().int().positive().optional(),
  locationId: z.number().int().positive().optional(),
  deskripsi: z.string().optional().nullable(),
});

const updatePriceSchema = z.object({ hargaBaru: z.number().positive() });

/* ========================= GET /api/items ========================= */
export const getAllItems = async (req, res, next) => {
  try {
    const { categoryId, locationId, search } = req.query;

    const where = {};
    if (categoryId) where.categoryId = Number(categoryId);
    if (locationId) where.locationId = Number(locationId);
    if (search) where.namaBarang = { contains: search };

    const items = await prisma.item.findMany({
      where,
      include: {
        category: true,
        location: true,
        priceHistory: { orderBy: { tanggalPerubahan: 'desc' } },
      },
      orderBy: { id: 'asc' },
    });

    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

/* ==================== POST /api/items (Admin) ===================== */
export const createItem = async (req, res, next) => {
  try {
    const payload = createItemSchema.parse(req.body);

    const item = await prisma.$transaction(async (tx) => {
      const created = await tx.item.create({
        data: {
          namaBarang: payload.namaBarang,
          categoryId: payload.categoryId,
          locationId: payload.locationId,
          hargaSaatIni: payload.harga,
          deskripsi: payload.deskripsi ?? null,
        },
      });

      await tx.priceHistory.create({
        data: { itemId: created.id, harga: payload.harga },
      });

      return tx.item.findUnique({
        where: { id: created.id },
        include: {
          category: true,
          location: true,
          priceHistory: { orderBy: { tanggalPerubahan: 'desc' } },
        },
      });
    });

    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

/* ==================== PATCH /api/items/:id/price =================== */
export const updateItemPrice = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { hargaBaru } = updatePriceSchema.parse(req.body);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update harga saat ini
      await tx.item.update({
        where: { id },
        data: { hargaSaatIni: hargaBaru },
      });

      // 2. Tambah record baru
      await tx.priceHistory.create({
        data: { itemId: id, harga: hargaBaru },
      });

      // 3. Query semua riwayat terbaru
      const histories = await tx.priceHistory.findMany({
        where: { itemId: id },
        orderBy: { tanggalPerubahan: 'desc' },
        select: { id: true },
      });

      // 4. Sliding window: hapus riwayat > 3
      if (histories.length > MAX_HISTORY) {
        const idsToDelete = histories.slice(MAX_HISTORY).map((h) => h.id);
        await tx.priceHistory.deleteMany({
          where: { id: { in: idsToDelete } },
        });
      }

      // 5. Kembalikan ringkasan 3 riwayat aktif
      return tx.item.findUnique({
        where: { id },
        include: {
          category: true,
          location: true,
          priceHistory: { orderBy: { tanggalPerubahan: 'desc' } },
        },
      });
    });

    res.json({
      success: true,
      message: 'Harga berhasil diperbarui',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/* ==================== PUT /api/items/:id (Admin) =================== */
export const updateItem = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const payload = updateItemSchema.parse(req.body);

    const item = await prisma.item.update({
      where: { id },
      data: payload,
      include: {
        category: true,
        location: true,
        priceHistory: { orderBy: { tanggalPerubahan: 'desc' } },
      },
    });

    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

/* ==================== DELETE /api/items/:id (Admin) ================ */
export const deleteItem = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.item.delete({ where: { id } });
    res.json({ success: true, message: 'Barang berhasil dihapus' });
  } catch (err) {
    next(err);
  }
};