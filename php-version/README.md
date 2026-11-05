# Panduan Lengkap Deploy KilatQuiz Versi PHP di aaPanel Linux

Paket ini menyediakan versi murni **PHP + MySQL + Nginx** untuk aplikasi lomba kuis interaktif KilatQuiz.

---

## 1. Persiapan di aaPanel

1. Buka dashboard aaPanel Anda.
2. Masuk ke menu **App Store** dan pastikan terpasang:
   * **Nginx** (v1.22 atau v1.24)
   * **PHP** (PHP 8.1, 8.2, atau 8.3)
   * **MySQL** (v5.7 atau v8.0 / MariaDB 10.6+)
   * **Supervisor / PM2 Manager** (untuk menjalankan server WebSocket di background)

---

## 2. Impor Database MySQL

1. Masuk ke menu **Databases** di aaPanel.
2. Klik **Add database**:
   * Nama database: `kilatquiz`
   * Username: `kilatquiz_user`
   * Password: *(buat password yang aman)*
3. Klik tombol **Import** pada database tersebut, lalu unggah file `database.sql` yang ada di folder ini.

---

## 3. Jalankan PHP WebSocket Server di Background (Port 8080)

WebSocket server bertugas mengelola koneksi real-time antara Layar Besar dan Smartphone peserta:

### Cara A: Menggunakan Supervisor di aaPanel (Paling Disarankan)
1. Buka **App Store** > cari **Supervisor** > klik **Setting**.
2. Klik **Add Daemon**:
   * **Name**: `quiz-websocket`
   * **Run User**: `www`
   * **Run Dir**: `/www/wwwroot/kilatquiz/php-version`
   * **Command**: `/usr/bin/php server.php` *(atau path binary PHP aaPanel Anda, misal `/www/server/php/82/bin/php server.php`)*
   * **Number of processes**: `1`
3. Klik **Submit**. Server WebSocket sekarang otomatis hidup terus di latar belakang.

---

## 4. Konfigurasi Nginx di aaPanel

1. Buka menu **Website** > **PHP project** > Klik domain kuis Anda.
2. Buka tab **Config** dan salin isi file `nginx-aapanel.conf` ke dalamnya.
3. Klik **Save**.
4. Pasang SSL gratis di tab **SSL** > **Let's Encrypt**.

---

## 5. Unggah Frontend

Jalankan perintah berikut di komputer lokal Anda:
```bash
npm run build
```
Salin semua isi folder `dist/` ke direktori web aaPanel Anda (`/www/wwwroot/kilatquiz/public/`).
Semua panggilan real-time ke `/ws` dan REST API ke `/api/` akan langsung ditangani oleh PHP!
