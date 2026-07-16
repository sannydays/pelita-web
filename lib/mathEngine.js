// File: lib/mathEngine.js
//
// Mesin hitung soal. AI HANYA merangkai cerita — semua angka dan jawaban
// benar dihitung secara deterministik di sini, supaya selalu akurat.

// Metadata tipe soal yang tersedia untuk dipilih guru saat membuat modul.
export const TIPE_SOAL = [
  {
    value: 'perbandingan_senilai',
    label: 'Perbandingan Senilai',
    contoh: 'Semakin banyak A, semakin banyak B (naik bersama)',
  },
  {
    value: 'perbandingan_berbalik_nilai',
    label: 'Perbandingan Berbalik Nilai',
    contoh: 'Semakin banyak A, semakin sedikit B (kebalikan)',
  },
  {
    value: 'pecahan_sederhana',
    label: 'Penjumlahan Pecahan Sederhana',
    contoh: 'Menjumlahkan dua pecahan berpenyebut sama',
  },
];

function acak(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Perbandingan Senilai: jika a berbanding b, maka c (kelipatan a) berbanding berapa?
 * jawaban = (c / a) * b
 */
function generatePerbandinganSenilai() {
  const pengali = acak(2, 6);
  const a = acak(1, 5);
  const b = acak(5, 14);
  const c = a * pengali;
  const jawabanBenar = (c / a) * b;

  return {
    angka: { a, b, c },
    jawabanBenar,
    tipe: 'perbandingan_senilai',
    instruksiAi:
      `Kondisi awal: ${a} unit menghasilkan/membutuhkan ${b}. ` +
      `Kondisi baru: ${c} unit (kelipatan dari kondisi awal). ` +
      `Nilai harus naik sebanding (semakin banyak unit, semakin banyak hasilnya).`,
  };
}

/**
 * Perbandingan Berbalik Nilai: a pekerja selesai dalam b hari, c pekerja (kelipatan a) selesai berapa hari?
 * jawaban = (a * b) / c
 */
function generatePerbandinganBerbalikNilai() {
  const pengali = acak(2, 4);
  const a = acak(1, 4);
  const b = a * pengali * acak(2, 4); // pastikan hasil akhir bulat
  const c = a * pengali;
  const jawabanBenar = (a * b) / c;

  return {
    angka: { a, b, c },
    jawabanBenar,
    tipe: 'perbandingan_berbalik_nilai',
    instruksiAi:
      `Kondisi awal: ${a} unit (misalnya orang/mesin) menyelesaikan pekerjaan dalam ${b} (satuan waktu). ` +
      `Kondisi baru: jumlah unit berubah menjadi ${c}. ` +
      `Nilai harus berbalik (semakin banyak unit, semakin SEDIKIT waktu yang dibutuhkan).`,
  };
}

/**
 * Pecahan sederhana: a/d + b/d dengan penyebut sama.
 * Jawaban dikembalikan dalam bentuk desimal agar mudah divalidasi.
 */
function generatePecahanSederhana() {
  const d = acak(4, 10); // penyebut sama
  const a = acak(1, d - 2);
  const sisa = d - a - 1;
  const b = acak(1, sisa > 0 ? sisa : 1);
  const jawabanBenar = Math.round(((a + b) / d) * 1000) / 1000;

  return {
    angka: { a, b, c: d },
    jawabanBenar,
    tipe: 'pecahan_sederhana',
    instruksiAi:
      `Ceritakan penjumlahan dua bagian/porsi dari benda yang sama: ${a} per ${d} bagian ditambah ${b} per ${d} bagian. ` +
      `Gunakan istilah "per" atau "dari" untuk pecahan (misal: "${a} dari ${d} bagian kue"), jangan gunakan simbol pecahan matematis.`,
  };
}

const GENERATORS = {
  perbandingan_senilai: generatePerbandinganSenilai,
  perbandingan_berbalik_nilai: generatePerbandinganBerbalikNilai,
  pecahan_sederhana: generatePecahanSederhana,
};

/**
 * Dispatcher utama: hasilkan soal berdasarkan tipe_soal yang dipilih guru.
 * Jatuh kembali ke perbandingan_senilai jika tipe tidak dikenali.
 */
export function generateSoal(tipeSoal) {
  const generator = GENERATORS[tipeSoal] || GENERATORS.perbandingan_senilai;
  return generator();
}