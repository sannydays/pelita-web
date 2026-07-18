'use client'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; 

export default function DashboardGuru() {
  const [activeTab, setActiveTab] = useState('classes');
  const [newClassName, setNewClassName] = useState('');
  
  const [classes, setClasses] = useState([]);
  const [modules, setModules] = useState([]);
  const [students, setStudents] = useState([]);
  const [parameters, setParameters] = useState([]);

  // State Modal Soal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModul, setActiveModul] = useState(null);
  
  // add soal guru
  const [paramForm, setParamForm] = useState({ 
    tipe: '', 
    angkaDasar: '', 
    jawaban: '',
    teksManual: '' 
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: c } = await supabase.from('kelas').select('*');
      const { data: m } = await supabase.from('modul').select('*');
      const { data: s } = await supabase.from('siswa').select('*');
      const { data: p } = await supabase.from('parameter_soal').select('*');
      
      if (c) setClasses(c);
      if (m) setModules(m);
      if (s) setStudents(s);
      if (p) setParameters(p);
    };
    fetchData();
  }, []);

  const handleBuatKelas = async () => {
    if (!newClassName) return;
    const { data } = await supabase.from('kelas')
      .insert([{ nama_kelas: newClassName, kode_join: Math.random().toString(36).substring(2, 7).toUpperCase() }])
      .select();
    if (data) setClasses([...classes, ...data]);
    setNewClassName('');
  };

  const handleTambahModul = async (classId) => {
    const title = window.prompt('Masukkan Nama Modul:');
    if (title) {
      const { data } = await supabase.from('modul')
        .insert([{ kelas_id: classId, judul: title }])
        .select();
      if (data) setModules([...modules, ...data]);
    }
  };

  const handleSimpanSoal = async (e) => {
    e.preventDefault();
    try {
      const { data } = await supabase.from('parameter_soal').insert([{
        modul_id: activeModul.id,
        tipe: paramForm.tipe,
        angka_dasar: JSON.parse(paramForm.angkaDasar),
        jawaban_sistem: Number(paramForm.jawaban),
        teks_soal_manual: paramForm.teksManual 
      }]).select();
      
      if (data) {
        setParameters([...parameters, ...data]);
        setParamForm({ tipe: '', angkaDasar: '', jawaban: '', teksManual: '' });
      }
    } catch { 
      alert("Gagal menyimpan! Pastikan format JSON Angka Dasar benar."); 
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F9F9] p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="bg-white p-6 rounded-3xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold">👨‍🏫 Ruang Guru</h1>
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('classes')} className={`px-5 py-3 rounded-xl font-bold border-2 border-black ${activeTab === 'classes' ? 'bg-secondary' : 'bg-gray-100'}`}>Kelas & Modul</button>
            <button onClick={() => setActiveTab('students')} className={`px-5 py-3 rounded-xl font-bold border-2 border-black ${activeTab === 'students' ? 'bg-secondary' : 'bg-gray-100'}`}>Pantau Siswa</button>
          </div>
        </header>

        {activeTab === 'classes' ? (
          <div className="space-y-8">
            <div className="bg-accent p-8 rounded-3xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex gap-4">
              <input value={newClassName} onChange={e => setNewClassName(e.target.value)} className="flex-1 p-4 rounded-xl border-2 border-black font-bold" placeholder="Nama Kelas Baru..." />
              <button onClick={handleBuatKelas} className="bg-primary px-8 py-4 rounded-xl font-bold border-2 border-black">Buat Kelas</button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {classes.map(c => (
                <div key={c.id} className="bg-white p-6 rounded-3xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">{c.nama_kelas}</h3>
                    <span className="bg-gray-200 font-bold px-3 py-1 rounded-lg border-2 border-black text-sm">#{c.kode_join}</span>
                  </div>
                  <ul className="space-y-2 mb-4">
                    {modules.filter(m => m.kelas_id === c.id).map(m => (
                      <li key={m.id} className="bg-blue-50 p-3 rounded-xl border-2 border-blue-200 flex justify-between items-center font-semibold">
                        <span>📚 {m.judul}</span>
                        <button onClick={() => { setActiveModul(m); setIsModalOpen(true); }} className="bg-yellow-300 px-3 py-1 rounded-lg border-2 border-black text-sm hover:bg-yellow-400">
                          ⚙️ Atur Soal
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => handleTambahModul(c.id)} className="w-full bg-success py-3 rounded-xl font-bold border-2 border-black">+ Tambah Modul</button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-3xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-bold mb-6">Progress Siswa 📊</h2>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-4 border-black">
                  <th className="p-4 font-black">Nama Siswa</th>
                  <th className="p-4 font-black">Cita-cita</th>
                  <th className="p-4 text-center font-black">Total Skor</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id} className="border-b-2 border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-bold">{s.nama}</td>
                    <td className="p-4 text-gray-600 font-medium">{s.cita_cita}</td>
                    <td className="p-4 text-center">
                      <span className="bg-success text-black px-4 py-1 rounded-full font-black border-2 border-black">
                        {s.progress}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Buat Soal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-3xl border-4 border-black w-full max-w-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Buat Soal: {activeModul?.judul}</h2>
            
            <form onSubmit={handleSimpanSoal} className="space-y-4">
              <div>
                <label className="font-bold text-sm">Tipe Soal (Contoh: Dosis Obat)</label>
                <input required value={paramForm.tipe} onChange={e => setParamForm({...paramForm, tipe: e.target.value})} className="w-full p-3 border-2 border-black rounded-xl font-bold" />
              </div>
              
              <div>
                <label className="font-bold text-sm">Angka Dasar (Format JSON)</label>
                <textarea required placeholder='{"berat": 50, "dosis": 5}' value={paramForm.angkaDasar} onChange={e => setParamForm({...paramForm, angkaDasar: e.target.value})} className="w-full p-3 border-2 border-black rounded-xl font-mono text-sm" rows="2" />
              </div>

              <div>
                <label className="font-bold text-sm">Jawaban Benar (Angka)</label>
                <input required type="number" value={paramForm.jawaban} onChange={e => setParamForm({...paramForm, jawaban: e.target.value})} className="w-full p-3 border-2 border-black rounded-xl font-bold" />
              </div>

              <div className="p-4 bg-gray-100 rounded-xl border-2 border-gray-300 border-dashed">
                <label className="font-bold text-sm text-gray-600">Teks Soal Manual (Opsional jika AI mati)</label>
                <p className="text-xs text-gray-500 mb-2">Tuliskan cerita soal secara manual jika kuota AI habis.</p>
                <textarea placeholder="Seorang dokter anak menangani pasien..." value={paramForm.teksManual} onChange={e => setParamForm({...paramForm, teksManual: e.target.value})} className="w-full p-3 border-2 border-gray-300 rounded-xl text-sm" rows="3" />
              </div>

              <button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg mt-4">Simpan Parameter</button>
            </form>
            
            <button onClick={() => setIsModalOpen(false)} className="mt-6 w-full text-center font-bold text-gray-500 hover:text-black underline">Tutup Panel</button>
          </div>
        </div>
      )}
    </div>
  );
}
