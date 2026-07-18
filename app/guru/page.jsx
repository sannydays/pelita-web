'use client'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function DashboardGuru() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('classes');
  const [newClassName, setNewClassName] = useState('');
  const [classes, setClasses] = useState([]);
  const [modules, setModules] = useState([]);
  const [students, setStudents] = useState([]);
  const [parameters, setParameters] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModul, setActiveModul] = useState(null);
  const [paramForm, setParamForm] = useState({ tipe: '', angkaDasar: '', jawaban: '', teksManual: '' });

  // data fetch
  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login?role=guru');
        return;
      }

      //  paralel fetch
      const [resC, resM, resS, resP] = await Promise.all([
        supabase.from('kelas').select('*'),
        supabase.from('modul').select('*'),
        supabase.from('siswa').select('*'),
        supabase.from('parameter_soal').select('*')
      ]);

      if (resC.data) setClasses(resC.data);
      if (resM.data) setModules(resM.data);
      if (resS.data) setStudents(resS.data);
      if (resP.data) setParameters(resP.data);
    };

    checkAuthAndFetch();
  }, [router]);

  // handler2
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login?role=guru');
  };

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
        setIsModalOpen(false);
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
            <button onClick={() => setActiveTab('classes')} className={`px-5 py-3 rounded-xl font-bold border-2 border-black ${activeTab === 'classes' ? 'bg-secondary text-black' : 'bg-gray-100'}`}>Kelas & Modul</button>
            <button onClick={() => setActiveTab('students')} className={`px-5 py-3 rounded-xl font-bold border-2 border-black ${activeTab === 'students' ? 'bg-secondary text-black' : 'bg-gray-100'}`}>Pantau Siswa</button>
            <button onClick={handleLogout} className="px-5 py-3 rounded-xl font-bold border-2 border-black bg-red-500 text-white">Keluar</button>
          </div>
        </header>

        {activeTab === 'classes' ? (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex gap-4">
              <input value={newClassName} onChange={e => setNewClassName(e.target.value)} className="flex-1 p-4 rounded-xl border-2 border-black font-bold" placeholder="Nama Kelas Baru..." />
              <button onClick={handleBuatKelas} className="bg-primary text-yellow px-8 py-4 rounded-xl font-bold border-2 border-black">Buat Kelas</button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {classes.map(c => (
                <div key={c.id} className="bg-white p-6 rounded-3xl border-2 border-black">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">{c.nama_kelas}</h3>
                    <span className="bg-gray-200 font-bold px-3 py-1 rounded-lg border-2 border-black text-sm">#{c.kode_join}</span>
                  </div>
                  <ul className="space-y-2 mb-4">
                    {modules.filter(m => m.kelas_id === c.id).map(m => (
                      <li key={m.id} className="bg-blue-50 p-3 rounded-xl border-2 border-blue-200 flex justify-between items-center font-semibold">
                        <span>📚 {m.judul}</span>
                        <button onClick={() => { setActiveModul(m); setIsModalOpen(true); }} className="bg-yellow-300 px-3 py-1 rounded-lg border-2 border-black text-sm hover:bg-yellow-400">⚙️ Atur</button>
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => handleTambahModul(c.id)} className="w-full bg-green-500 text-white py-3 rounded-xl font-bold border-2 border-black">+ Tambah Modul</button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-3xl border-2 border-black">
            <h2 className="text-2xl font-bold mb-6">Progress Siswa 📊</h2>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-4 border-black">
                  <th className="p-4">Nama</th>
                  <th className="p-4">Kelas</th>
                  <th className="p-4">Skor</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id} className="border-b-2">
                    <td className="p-4 font-bold">{s.nama}</td>
                    <td className="p-4">{classes.find(c => c.id === s.kelas_id)?.nama_kelas || '-'}</td>
                    <td className="p-4 font-black">{s.progress || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Soal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl border-4 border-black w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-6">Atur Soal: {activeModul?.judul}</h2>
            <form onSubmit={handleSimpanSoal} className="space-y-4">
              <input required placeholder="Tipe Soal" value={paramForm.tipe} onChange={e => setParamForm({...paramForm, tipe: e.target.value})} className="w-full p-3 border-2 border-black rounded-xl" />
              <textarea required placeholder='Angka Dasar (JSON)' value={paramForm.angkaDasar} onChange={e => setParamForm({...paramForm, angkaDasar: e.target.value})} className="w-full p-3 border-2 border-black rounded-xl" />
              <input required type="number" placeholder="Jawaban Benar" value={paramForm.jawaban} onChange={e => setParamForm({...paramForm, jawaban: e.target.value})} className="w-full p-3 border-2 border-black rounded-xl" />
              <button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-bold">Simpan</button>
              <button type="button" onClick={() => setIsModalOpen(false)} className="w-full text-gray-500 font-bold underline">Tutup</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}