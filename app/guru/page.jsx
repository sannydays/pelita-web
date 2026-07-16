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

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModul, setActiveModul] = useState(null);
  const [paramForm, setParamForm] = useState({ tipe: '', angkaDasar: '', jawaban: '' });

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
    const title = window.prompt('Nama Modul:');
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
        jawaban_sistem: Number(paramForm.jawaban)
      }]).select();
      if (data) {
        setParameters([...parameters, ...data]);
        setParamForm({ tipe: '', angkaDasar: '', jawaban: '' });
      }
    } catch { alert("Gagal! Cek format JSON."); }
  };

  return (
    <div className="min-h-screen bg-[#F4F9F9] p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="bg-white p-6 rounded-3xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold">👨‍🏫 Ruang Guru</h1>
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('classes')} className="px-5 py-3 bg-secondary rounded-xl font-bold border-2 border-black">Kelas</button>
            <button onClick={() => setActiveTab('students')} className="px-5 py-3 bg-secondary rounded-xl font-bold border-2 border-black">Pantau Siswa</button>
          </div>
        </header>

        {activeTab === 'classes' ? (
          <div className="space-y-8">
            <div className="bg-accent p-8 rounded-3xl border-2 border-black flex gap-4">
              <input value={newClassName} onChange={e => setNewClassName(e.target.value)} className="flex-1 p-4 rounded-xl border-2 border-black" placeholder="Nama Kelas Baru" />
              <button onClick={handleBuatKelas} className="bg-primary px-8 py-4 rounded-xl font-bold border-2 border-black">Buat</button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {classes.map(c => (
                <div key={c.id} className="bg-white p-6 rounded-3xl border-2 border-black">
                  <h3 className="text-xl font-bold mb-4">{c.nama_kelas} (#{c.kode_join})</h3>
                  <ul className="space-y-2 mb-4">
                    {modules.filter(m => m.kelas_id === c.id).map(m => (
                      <li key={m.id} className="bg-blue-50 p-3 rounded-xl border-2 border-blue-200 flex justify-between">
                        {m.judul}
                        <button onClick={() => { setActiveModul(m); setIsModalOpen(true); }} className="bg-yellow-300 px-3 rounded-lg border-2 border-black text-sm">⚙️ Soal</button>
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => handleTambahModul(c.id)} className="w-full bg-success py-3 rounded-xl font-bold border-2 border-black">+ Tambah Modul</button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-3xl border-2 border-black">
            <h2 className="text-2xl font-bold mb-6">Progress Siswa 📊</h2>
            <table className="w-full text-left">
              <thead><tr className="border-b-4 border-black"><th className="p-4">Nama</th><th className="p-4">Cita-cita</th><th className="p-4 text-center">Skor</th></tr></thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id} className="border-b-2 border-gray-100">
                    <td className="p-4 font-bold">{s.nama}</td>
                    <td className="p-4">{s.cita_cita}</td>
                    <td className="p-4 text-center font-black">{s.progress}</td>
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
            <h2 className="text-2xl font-bold mb-4">Soal: {activeModul.judul}</h2>
            <form onSubmit={handleSimpanSoal} className="space-y-4">
              <input required placeholder="Tipe Soal" value={paramForm.tipe} onChange={e => setParamForm({...paramForm, tipe: e.target.value})} className="w-full p-3 border-2 border-black rounded-xl" />
              <textarea required placeholder='JSON: {"a": 1, "b": 2}' value={paramForm.angkaDasar} onChange={e => setParamForm({...paramForm, angkaDasar: e.target.value})} className="w-full p-3 border-2 border-black rounded-xl" />
              <input required type="number" placeholder="Jawaban" value={paramForm.jawaban} onChange={e => setParamForm({...paramForm, jawaban: e.target.value})} className="w-full p-3 border-2 border-black rounded-xl" />
              <button className="w-full bg-black text-white py-4 rounded-xl font-bold">Simpan</button>
            </form>
            <button onClick={() => setIsModalOpen(false)} className="mt-4 w-full underline">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}