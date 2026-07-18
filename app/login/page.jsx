'use client'
import { useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

function FormLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const roleDariUrl = searchParams.get('role');
  const [role, setRole] = useState(roleDariUrl === 'guru' ? 'guru' : 'siswa'); 
  
  const [isLoading, setIsLoading] = useState(false);

  // State Form Siswa
  const [usernameSiswa, setUsernameSiswa] = useState('');
  const [password, setpassword] = useState('');

  // State Form Guru
  const [emailGuru, setEmailGuru] = useState('');
  const [passwordGuru, setPasswordGuru] = useState('');

  const handleLoginSiswa = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/siswa/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameSiswa, 
          password: password      
        })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      localStorage.setItem('sesi_siswa', JSON.stringify(result.siswa));
      router.push('/siswa'); 
      
    } catch (err) {
      alert(`Gagal: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginGuru = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // login guru supabase auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailGuru,
        password: passwordGuru,
      });

      if (authError) throw new Error("Email atau password salah!");

      const { data: guruProfile, error: profileError } = await supabase
        .from('guru')
        .select('nama')
        .eq('id', authData.user.id) 
        .single();

      if (profileError) {
        console.error("Profil tidak ditemukan di tabel guru");
      }

      alert(`Selamat datang, ${guruProfile?.nama || 'Guru'}! 👨‍🏫`);
      window.location.href = '/guru';

    } catch (err) {
      alert(`Gagal: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md">
      <h1 className="text-3xl font-black text-center mb-6">Pintu Masuk 🚪</h1>
      
      {/* NAVIGASI TAB */}
      <div className="flex gap-2 mb-8 bg-gray-100 p-2 rounded-2xl border-2 border-black">
        <button 
          onClick={() => setRole('siswa')}
          className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${role === 'siswa' ? 'bg-yellow-300 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'border-transparent text-gray-500'}`}
        >
          Siswa 🎒
        </button>
        <button 
          onClick={() => setRole('guru')}
          className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${role === 'guru' ? 'bg-blue-300 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'border-transparent text-gray-500'}`}
        >
          Guru 👨‍🏫
        </button>
      </div>

      {/* FORM SISWA */}
      {role === 'siswa' && (
        <form onSubmit={handleLoginSiswa} className="space-y-4">
          <div>
            <label className="font-bold text-sm mb-1 block">Username</label>
            <input required placeholder="contoh: budi_keren" value={usernameSiswa} onChange={(e) => setUsernameSiswa(e.target.value)} className="w-full p-4 border-2 border-black rounded-xl font-bold" />
          </div>
          <div>
            <label className="font-bold text-sm mb-1 block">Password</label>
            {/* PERBAIKAN: Hapus pola 4 angka, ganti jadi minLength 8 */}
            <input required type="password" minLength={8} placeholder="Minimal 8 Karakter" value={password} onChange={(e) => setpassword(e.target.value)} className="w-full p-4 border-2 border-black rounded-xl font-black text-center tracking-widest text-2xl" />
          </div>
          <button disabled={isLoading} className={`w-full text-white py-4 rounded-xl font-bold text-lg mt-4 border-2 border-black ${isLoading ? 'bg-gray-400' : 'bg-black hover:bg-gray-800'}`}>
            {isLoading ? 'Mengecek Identitas...' : 'Mulai Belajar 🚀'}
          </button>
        </form>
      )}

      {/* FORM GURU */}
      {role === 'guru' && (
        <form onSubmit={handleLoginGuru} className="space-y-4">
          <div>
            <label className="font-bold text-sm mb-1 block">Email Instansi</label>
            <input required type="email" placeholder="guru@sekolah.com" value={emailGuru} onChange={(e) => setEmailGuru(e.target.value)} className="w-full p-4 border-2 border-black rounded-xl font-bold" />
          </div>
          <div>
            <label className="font-bold text-sm mb-1 block">Kata Sandi</label>
            <input required type="password" placeholder="••••••••" value={passwordGuru} onChange={(e) => setPasswordGuru(e.target.value)} className="w-full p-4 border-2 border-black rounded-xl font-bold" />
          </div>
          <button disabled={isLoading} className={`w-full text-white py-4 rounded-xl font-bold text-lg mt-4 border-2 border-black ${isLoading ? 'bg-gray-400' : 'bg-black hover:bg-gray-800'}`}>
            {isLoading ? 'Membuka Dashboard...' : 'Masuk ke Dashboard 📊'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function HalamanLogin() {
  return (
    <div className="min-h-screen bg-[#F4F9F9] flex items-center justify-center p-4 font-sans">
      <Suspense fallback={<h2 className="text-2xl font-bold">Menyiapkan Gerbang...</h2>}>
        <FormLogin />
      </Suspense>
    </div>
  );
}