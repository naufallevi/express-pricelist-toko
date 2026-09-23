import 'dotenv/config';
import app from './app.js';
import { prisma } from './config/prisma.js';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`\n${signal} diterima. Menutup server...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));