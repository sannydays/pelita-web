// File: app/layout.jsx

// Baris ini sangat penting! Ini yang memanggil Tailwind CSS agar aktif di seluruh aplikasi
import './globals.css'; 

// Ini adalah informasi dasar website (berguna untuk nama tab di browser)
export const metadata = {
  title: 'PELITA - Belajar Logika',
  description: 'Personalisasi Edukasi Logika & Imajinasi Cita-cita',
};

// Fungsi utama kerangka halaman
export default function RootLayout({ children }) {
  return (
    <html lang="id">
      {/* Semua desain dan warna Tailwind akan meresap ke dalam tag body ini */}
      <body className="antialiased bg-gray-50 text-gray-900">
        {/* 'children' di bawah ini adalah tempat Next.js menyuntikkan isi dari page.jsx (Siswa/Guru) */}
        {children}
      </body>
    </html>
  );
}