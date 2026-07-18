'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ nama: '', username: '', password: '', kodeKelas: '', citaCita: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // search id kelas
      const { data: kelasData, error: kelasError } = await supabase
        .from('kelas')
        .select('id')
        .eq('kode_join', formData.kodeKelas.toUpperCase())
        .single();

      if (kelasError || !kelasData) throw new Error("Kode kelas tidak ditemukan!");

      // send to api register
      const res = await fetch('/api/siswa/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, kelas_id: kelasData.id })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal mendaftar");

      alert("Pendaftaran Berhasil! Silakan masuk.");
      router.push('/login');
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-black mb-6">Daftar Akun Siswa 🎒</h1>
      <form onSubmit={handleRegister} className="space-y-4">
        <input required placeholder="Nama Lengkap" onChange={e => setFormData({...formData, nama: e.target.value})} className="w-full p-3 border-2 border-black rounded-xl" />
        <input required placeholder="Username" onChange={e => setFormData({...formData, username: e.target.value})} className="w-full p-3 border-2 border-black rounded-xl" />
        <input required type="password" minLength={8} placeholder="Password (min 8 karakter)" onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-3 border-2 border-black rounded-xl" />
        <input required placeholder="Cita-cita" onChange={e => setFormData({...formData, citaCita: e.target.value})} className="w-full p-3 border-2 border-black rounded-xl" />
        <input required placeholder="Kode Kelas" onChange={e => setFormData({...formData, kodeKelas: e.target.value})} className="w-full p-3 border-2 border-black rounded-xl" />
        <button disabled={isLoading} type="submit" className="w-full bg-black text-white py-3 rounded-xl font-bold">
          {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
        </button>
      </form>
    </div>
  );
}