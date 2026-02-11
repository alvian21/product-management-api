# Product Management API

Proyek ini adalah API untuk manajemen produk yang dibangun menggunakan **Node.js**, **Express**, dan **Sequelize**.

## Fitur Utama

- **Manajemen Produk**: CRUD produk.
- **Manajemen User**: CRUD user.
- **Keamanan**: Autentikasi menggunakan OAuth2.
- **Soft Delete**: Data yang dihapus tetap tersimpan di database (`deletedAt`).

## Cara Menjalankan

1. Salin file lingkungan: `cp .env.development.example .env`
2. Instal dependensi: `npm install`
3. Jalankan server: `npm run dev`
