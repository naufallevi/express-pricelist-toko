export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} tidak ditemukan`,
  });
};

export const errorHandler = (err, req, res, next) => {
  console.error('[ERROR]', err);

  // Prisma: unique constraint violation
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: `Duplikasi data pada field: ${err.meta?.target?.join(', ')}`,
    });
  }

  // Prisma: foreign key constraint violation (Restrict)
  if (err.code === 'P2003') {
    return res.status(409).json({
      success: false,
      message:
        'Operasi gagal: data masih direferensikan oleh tabel lain (Restrict).',
    });
  }

  // Prisma: record not found
  if (err.code === 'P2025') {
    return res
      .status(404)
      .json({ success: false, message: 'Data tidak ditemukan' });
  }

  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};