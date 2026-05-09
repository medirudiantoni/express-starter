# express-starter

Boilerplate siap pakai untuk membangun REST API dengan **Express 5**, **TypeScript**, **Prisma ORM**, dan **PostgreSQL**. Dirancang agar kamu bisa langsung fokus menulis fitur tanpa repot setup dari nol.

## Tech Stack

| Teknologi | Versi | Keterangan |
|---|---|---|
| [Express](https://expressjs.com/) | ^5.2 | Framework HTTP |
| [TypeScript](https://www.typescriptlang.org/) | ^6.0 | Type safety |
| [Prisma](https://www.prisma.io/) | ^7.8 | ORM & migrasi database |
| [PostgreSQL](https://www.postgresql.org/) | — | Database (via `pg`) |
| [Better Auth](https://www.better-auth.com/) | ^1.6 | Autentikasi siap pakai |
| [dotenv](https://github.com/motdotla/dotenv) | ^17 | Manajemen environment variable |
| [tsx](https://github.com/privatenumber/tsx) | ^4.21 | Menjalankan TypeScript langsung |

## Prasyarat

- **Node.js** v18 atau lebih baru
- **PostgreSQL** yang sudah berjalan (lokal atau cloud)
- **npm** atau package manager pilihan kamu

## Instalasi

1. Clone repositori ini:

```bash
git clone https://github.com/medirudiantoni/express-starter.git
cd express-starter
```

2. Install dependensi:

```bash
npm install
```

3. Buat file `.env` di root project dan isi variabel berikut:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"
```

4. Jalankan migrasi Prisma:

```bash
npx prisma migrate dev
```

5. Generate Prisma Client:

```bash
npx prisma generate
```

## Menjalankan Aplikasi

### Mode Development

```bash
npm run dev
```

Perintah ini menjalankan `src/app.ts` langsung menggunakan `tsx` — tidak perlu compile dulu.

## Struktur Proyek

```
express-starter/
├── prisma/
│   ├── schema.prisma       # Definisi model database
│   └── migrations/         # File migrasi database
├── src/
│   └── app.ts              # Entry point aplikasi
├── prisma.config.ts        # Konfigurasi Prisma (schema, migrations, DB URL)
├── tsconfig.json           # Konfigurasi TypeScript
├── package.json
└── .gitignore
```

## Konfigurasi Prisma

File `prisma.config.ts` mengatur path schema, direktori migrasi, dan koneksi database secara otomatis melalui environment variable `DATABASE_URL`.

```ts
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

## Scripts

| Script | Perintah | Keterangan |
|---|---|---|
| `dev` | `tsx src/app.ts` | Jalankan server dalam mode development |

## Lisensi

Proyek ini tidak memiliki lisensi yang tercantum. Silakan hubungi pemilik repositori untuk informasi lebih lanjut.

---

Dibuat oleh [@medirudiantoni](https://github.com/medirudiantoni)
