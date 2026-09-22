# Backend Toko — API Inventaris

REST API untuk sistem manajemen barang toko dengan sliding window price history.

## Tech Stack
- Node.js + Express 4.21.1
- Prisma 5.22.0 + MySQL 8.x
- JWT + bcryptjs

## Setup
1. `npm install`
2. Salin `.env.example` → `.env`, sesuaikan `DATABASE_URL`
3. `npx prisma migrate dev --name init_store_inventory`
4. `npx prisma db seed`
5. `npm run dev`

## Default Admin
- username: `admin`
- password: `admin123`