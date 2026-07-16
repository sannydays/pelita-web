// File: lib/citaCita.js
//
// Daftar profesi impian yang bisa dipilih siswa. Dipakai bersama oleh
// halaman siswa (pemilihan) dan AI (konteks cerita soal), serta sebagai
// elemen visual (warna + ikon) yang konsisten di seluruh aplikasi.

export const DAFTAR_CITA_CITA = [
  {
    value: 'Dokter yang menyelamatkan pasien',
    label: 'Dokter',
    emoji: '🩺',
    warna: '#EF6F6F',
  },
  {
    value: 'Insinyur Robotika yang membuat robot pintar',
    label: 'Insinyur Robotika',
    emoji: '🤖',
    warna: '#6E7DE0',
  },
  {
    value: 'Koki yang membuka restoran terkenal',
    label: 'Chef / Koki',
    emoji: '👨‍🍳',
    warna: '#F2A93B',
  },
  {
    value: 'Astronot yang menjelajah planet Mars',
    label: 'Astronot',
    emoji: '🚀',
    warna: '#8B6EE0',
  },
  {
    value: 'Programmer yang membuat aplikasi keren',
    label: 'Programmer',
    emoji: '💻',
    warna: '#2FBF9F',
  },
  {
    value: 'Polisi yang menjaga keamanan kota',
    label: 'Polisi',
    emoji: '👮',
    warna: '#4C8BF5',
  },
  {
    value: 'Pilot yang menerbangkan pesawat ke berbagai negara',
    label: 'Pilot',
    emoji: '✈️',
    warna: '#3AAED8',
  },
  {
    value: 'Atlet yang memenangkan kejuaraan olahraga',
    label: 'Atlet',
    emoji: '🏆',
    warna: '#E0A02F',
  },
];

export function getCitaCitaByValue(value) {
  return DAFTAR_CITA_CITA.find((c) => c.value === value) || null;
}