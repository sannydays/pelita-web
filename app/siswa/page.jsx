'use client'
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function PendaftaranSiswa() {
  const [step, setStep] = useState('register'); 
  const [formData, setFormData] = useState({ nama: '', citaCita: '', kodeKelas: '' });
  const [siswaInfo, setSiswaInfo] = useState(null);
  const [modulList, setModulList] = useState([]);
  
  // State untuk Simulasi Soal
  const [allParams, setAllParams] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [soalAI, setSoalAI] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [jawaban, setJawaban] = useState('');
  const [skor, setSkor] = useState(0);

  // Register
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data: kelasData } = await supabase.from('kelas').select('id').eq('kode_join', formData.kodeKelas).single();
      if (!kelasData) throw new Error("Kelas tidak ditemukan");

      const { data: siswaBaru } = await supabase.from('siswa').insert([{
        nama: formData.nama,
        cita_cita: formData.citaCita,
        kelas_id: kelasData.id,
        progress: 0
      }]).select().single();

      const { data: daftarModul } = await supabase.from('modul').select('*').eq('kelas_id', kelasData.id);
      
      setSiswaInfo(siswaBaru);
      setModulList(daftarModul || []);
      setStep('dashboard');
    } catch (err) {
      alert("Gagal masuk kelas. Cek kode kembali.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Soal
  const fetchSoalAI = async (param) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siswaId: siswaInfo.id,
          parameterId: param.id,
          citaCita: siswaInfo.cita_cita,
          tipeSoal: param.tipe,
          angkaDasar: param.angka_dasar
        })
      });
      const data = await res.json();
      setSoalAI(data.soal);
    } catch (err) {
      alert("Gagal memuat tantangan baru.");
    } finally {
      setIsLoading(false);
    }
  };

  const [daftarSoal, setDaftarSoal] = useState([]); // hasil batch dari AI

// Pilih modul 
const handlePilihModul = async (modulId) => {
  const { data: params } = await supabase.from('parameter_soal').select('*').eq('modul_id', modulId);
  if (!params || params.length === 0) return alert("Modul belum ada soal!");

  setIsLoading(true);
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siswaId: siswaInfo.id,
        citaCita: siswaInfo.cita_cita,
        parameters: params.map(p => ({ id: p.id, tipe: p.tipe, angkaDasar: p.angka_dasar }))
      })
    });
    const data = await res.json();
    if (!data.daftarSoal) throw new Error(data.error || 'Gagal generate soal');

    setAllParams(params);
    setDaftarSoal(data.daftarSoal);
    setCurrentIndex(0);
    setSoalAI(data.daftarSoal[0].soal);
    setStep('simulasi');
  } catch (err) {
    alert("Gagal memuat soal. Coba lagi.");
  } finally {
    setIsLoading(false);
  }
};

// 4. KIRIM JAWABAN — tidak perlu fetch lagi, tinggal ambil dari daftarSoal
const handleKirimJawaban = async (e) => {
  e.preventDefault();
  const currentParam = allParams[currentIndex];

  if (Number(jawaban) === currentParam.jawaban_sistem) {
    alert("🎉 BENAR! Melanjutkan ke soal berikutnya...");
    const newSkor = skor + 20;
    setSkor(newSkor);
    await supabase.from('siswa').update({ progress: newSkor }).eq('id', siswaInfo.id);

    if (currentIndex + 1 < allParams.length) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setJawaban('');
      setSoalAI(daftarSoal[nextIndex].soal); 
    } else {
      alert("Selesai! Kamu telah menuntaskan modul ini.");
      setStep('dashboard');
    }
  } else {
    alert("Yah, kurang tepat. Ayo coba lagi!");
  }
};
  return (
    <div className="min-h-screen bg-[#F4F9F9] p-4 md:p-8 font-sans">
      {step === 'register' && (
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-3xl font-bold mb-6 text-center">Mulai Petualangan! 🚀</h2>
          <form onSubmit={handleRegister} className="space-y-4">
            <input required placeholder="Nama Panggilan" className="w-full p-4 border-2 border-black rounded-xl" onChange={(e) => setFormData({...formData, nama: e.target.value})} />
            <input required placeholder="Cita-cita" className="w-full p-4 border-2 border-black rounded-xl" onChange={(e) => setFormData({...formData, citaCita: e.target.value})} />
            <input required placeholder="Kode Kelas" className="w-full p-4 border-2 border-black rounded-xl uppercase" onChange={(e) => setFormData({...formData, kodeKelas: e.target.value.toUpperCase()})} />
            <button className="w-full bg-black text-white py-4 rounded-xl font-bold">Masuk ke Kelas</button>
          </form>
        </div>
      )}

      {step === 'dashboard' && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-6 rounded-3xl border-2 border-black mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Halo, Calon {siswaInfo.cita_cita}! 👋</h2>
              <p className="font-bold text-gray-500">Skor Total: <span className="text-black">{skor}</span></p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {modulList.map(m => (
              <div key={m.id} className="bg-white p-6 rounded-3xl border-2 border-black hover:translate-y-[-4px] transition-transform">
                <h4 className="font-bold text-lg mb-4">📚 {m.judul}</h4>
                <button onClick={() => handlePilihModul(m.id)} className="w-full bg-black text-white py-3 rounded-xl font-bold">Mulai</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 'simulasi' && (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-between mb-6">
            <span className="font-bold">SOAL {currentIndex + 1} / {allParams.length}</span>
            <button onClick={() => setStep('dashboard')} className="font-bold underline">Kabur</button>
          </div>
          <p className="text-lg font-medium mb-6 leading-relaxed">{soalAI}</p>
          <form onSubmit={handleKirimJawaban} className="space-y-4">
            <input required type="number" value={jawaban} onChange={(e) => setJawaban(e.target.value)} className="w-full p-4 border-4 border-black rounded-xl text-2xl font-black" placeholder="Jawaban..." />
            <button className="w-full bg-green-500 py-4 rounded-xl font-bold text-lg border-2 border-black">Kirim Jawaban</button>
          </form>
        </div>
      )}
    </div>
  );
}
