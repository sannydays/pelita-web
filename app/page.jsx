// File: app/page.jsx

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-sky-100 flex flex-col items-center justify-center p-8 font-sans">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black text-blue-800 mb-4 drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">
          PELITA 🌟
        </h1>
        <p className="text-xl font-bold text-gray-800">
          Personalisasi Edukasi Logika & Imajinasi Cita-cita
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-2xl">
        {/* Kartu Masuk Guru */}
        <Link href="/guru" className="flex-1 bg-white border-4 border-black rounded-2xl p-8 hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer text-center group">
          <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">👩‍🏫</div>
          <h2 className="text-2xl font-black text-orange-600 mb-2">Masuk sebagai Guru</h2>
          <p className="font-bold text-gray-600">Buat kelas, pantau nilai, dan atur modul perbandingan.</p>
        </Link>

        {/* Kartu Masuk Siswa */}
        <Link href="/siswa" className="flex-1 bg-white border-4 border-black rounded-2xl p-8 hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer text-center group">
          <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🚀</div>
          <h2 className="text-2xl font-black text-teal-600 mb-2">Masuk sebagai Siswa</h2>
          <p className="font-bold text-gray-600">Pilih cita-citamu dan mulai petualangan logika!</p>
        </Link>
      </div>
    </div>
  );
}