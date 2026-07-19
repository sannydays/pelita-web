'use client'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function PendaftaranSiswa() {
  const router = useRouter();
  const [step, setStep] = useState('register'); 
  // Tambahkan username dan password ke state awal
  const [formData, setFormData] = useState({ nama: '', citaCita: '', kodeKelas: '', username: '', password: '' });
  const [siswaInfo, setSiswaInfo] = useState(null);
  const [modulList, setModulList] = useState([]);
  
  // State untuk Simulasi Soal
  const [allParams, setAllParams] = useState([]);
  const [daftarSoal, setDaftarSoal] = useState([]); 
  const [currentIndex, setCurrentIndex] = useState(0);
  const [soalAI, setSoalAI] = useState('');
  
  // State interaksi
  const [isLoading, setIsLoading] = useState(false);
  const [jawaban, setJawaban] = useState('');
  const [skor, setSkor] = useState(0);

  // LOGIKA PELINDUNG & BYPASS OTOMATIS
  useEffect(() => {
    const sesiData = localStorage.getItem('sesi_siswa');
    
    if (sesiData) {
      const siswa = JSON.parse(sesiData);
      setSiswaInfo(siswa);
      
      // Ambil daftar modul secara otomatis tanpa harus register ulang
      const fetchModulSiswa = async () => {
        const { data: daftarModul } = await supabase.from('modul').select('*').eq('kelas_id', siswa.kelas_id);
        setModulList(daftarModul || []);
        setStep('dashboard'); // Lewati form register, langsung ke dashboard
      };
      
      fetchModulSiswa();
    }
    // Ingat: Kita TIDAK melakukan router.push('/login') di sini agar siswa baru tetap bisa mendaftar.
  }, []);

  // 1. REGISTER
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data: kelasData } = await supabase.from('kelas').select('id').eq('kode_join', formData.kodeKelas).single();
      if (!kelasData) throw new Error("Kelas tidak ditemukan");

      const res = await fetch('/api/siswa/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: formData.nama,
          username: formData.username,
          password: formData.password, // Data 8 karakter siap dikirim ke backend untuk di-hash
          kelas_id: kelasData.id
        })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      // Simpan ke localStorage agar tidak perlu login lagi jika di-refresh
      localStorage.setItem('sesi_siswa', JSON.stringify(result.siswa));

      const { data: daftarModul } = await supabase.from('modul').select('*').eq('kelas_id', kelasData.id);
      setSiswaInfo(result.siswa);
      setModulList(daftarModul || []);
      setStep('dashboard');

    } catch (err) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. PILIH MODUL & FETCH BATCH SOAL DARI AI
  const handlePilihModul = async (modulId) => {
    setIsLoading(true); 
    try {
      const { data: params } = await supabase.from('parameter_soal').select('*').eq('modul_id', modulId);
      if (!params || params.length === 0) throw new Error("Modul ini belum memiliki soal!");

      // ===============================
      // MODE TESTING (HARDCODED)
      // ===============================
      const dummySoal = [
        {
          soal: "Nina mempunyai 5,75 meter kain. Ia menggunakan 2,48 meter untuk membuat taplak meja. Berapa meter kain yang masih dimiliki Nina?",
          jawaban: 3.27
        },
        {
          soal: "Sebuah kolam berisi 12,6 liter air. Kemudian ditambahkan lagi 7,85 liter air. Berapa liter air di dalam kolam sekarang?",
          jawaban: 20.45
        },
        {
          soal: "Pak Andi memiliki 9,5 kg beras. Ia membagikan 3,75 kg kepada tetangganya. Berapa kilogram beras yang masih dimiliki Pak Andi?",
          jawaban: 5.75
        },
        {
          soal: "Siti membeli 2,4 kg apel dan 3,65 kg jeruk. Berapa total berat buah yang dibeli Siti?",
          jawaban: 6.05
        },
        {
          soal: "Terdapat 7,2 liter sirup yang akan dibagi rata ke dalam 6 botol. Berapa liter sirup yang ada di setiap botol?",
          jawaban: 1.2
        }
      ];

      setAllParams(dummySoal);
      setDaftarSoal(dummySoal);
      setCurrentIndex(0);
      setSoalAI(dummySoal[0].soal);
      setStep('simulasi');
      return;

      // const res = await fetch('/api/ai', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     siswaId: siswaInfo.id,
      //     citaCita: siswaInfo.cita_cita,
      //     parameters: params.map(p => ({ id: p.id, tipe: p.tipe, angkaDasar: p.angka_dasar }))
      //   })
      // });
      
      // const data = await res.json();
      
      // if (!res.ok) throw new Error(data.error || 'Server menolak permintaan.');
      // if (!data.daftarSoal || data.daftarSoal.length === 0) throw new Error('AI mengembalikan data kosong.');

      // setAllParams(params);
      // setDaftarSoal(data.daftarSoal);
      // setCurrentIndex(0);
      // setSoalAI(data.daftarSoal[0].soal);
      // setStep('simulasi');
      
    } catch (err) {
      console.error("ERROR LOAD SOAL BATCH:", err);
      alert(`Oops! Terjadi masalah: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. KIRIM JAWABAN
  const handleKirimJawaban = async (e) => {
    e.preventDefault();
    const currentParam = allParams[currentIndex];

    if (Math.abs(Number(jawaban) - currentParam.jawaban) < 0.001) { // awalnya jawaban_sistem, but karena diubah jadi simulasi itu jadinya pake .jawaban aja
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
            
            {/* Input Username & Password Baru */}
            <input required placeholder="Username (Tanpa Spasi)" pattern="^\S+$" title="Username tidak boleh menggunakan spasi" className="w-full p-4 border-2 border-black rounded-xl" onChange={(e) => setFormData({...formData, username: e.target.value})} />
            <input required type="password" minLength={8} placeholder="Password (Min. 8 Karakter)" className="w-full p-4 border-2 border-black rounded-xl" onChange={(e) => setFormData({...formData, password: e.target.value})} />
            
            <input required placeholder="Cita-cita" className="w-full p-4 border-2 border-black rounded-xl" onChange={(e) => setFormData({...formData, citaCita: e.target.value})} />
            <input required placeholder="Kode Kelas" className="w-full p-4 border-2 border-black rounded-xl uppercase" onChange={(e) => setFormData({...formData, kodeKelas: e.target.value.toUpperCase()})} />
            
            <button disabled={isLoading} className={`w-full text-white py-4 rounded-xl font-bold ${isLoading ? 'bg-gray-400' : 'bg-black'}`}>
              {isLoading ? 'Memproses...' : 'Masuk ke Kelas'}
            </button>
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
            {/* Opsi tambahan: Tombol Keluar (Logout) yang baik untuk UX */}
            <button 
              onClick={() => {
                localStorage.removeItem('sesi_siswa');
                window.location.href = '/login';
              }} 
              className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold border-2 border-black hover:bg-red-600 transition-colors"
            >
              Keluar
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {modulList.map(m => (
              <div key={m.id} className="bg-white p-6 rounded-3xl border-2 border-black hover:translate-y-[-4px] transition-transform">
                <h4 className="font-bold text-lg mb-4">📚 {m.judul}</h4>
                <button 
                  onClick={() => handlePilihModul(m.id)} 
                  disabled={isLoading}
                  className={`w-full text-white py-3 rounded-xl font-bold ${isLoading ? 'bg-gray-400' : 'bg-black'}`}
                >
                  {isLoading ? 'Menyiapkan Soal...' : 'Mulai'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 'simulasi' && (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-between mb-6">
            <span className="font-bold">SOAL {currentIndex + 1} / {allParams.length}</span>
            <button onClick={() => setStep('dashboard')} className="font-bold underline">Keluar</button>
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