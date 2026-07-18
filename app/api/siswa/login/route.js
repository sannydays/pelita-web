import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // validate usr input
    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password wajib diisi.' }, { status: 400 });
    }

    // ambil data based usn
    const { data: siswa, error } = await supabase
      .from('siswa')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !siswa) {
      return NextResponse.json({ error: 'Username tidak ditemukan.' }, { status: 404 });
    }

    // Hash
    const isMatch = await bcrypt.compare(password, siswa.password);

    if (!isMatch) {
      return NextResponse.json({ error: 'Password yang kamu masukkan salah.' }, { status: 401 });
    }

    const siswaData = { ...siswa };
    delete siswaData.password;

    return NextResponse.json({ siswa: siswaData }, { status: 200 });

  } catch (error) {
    console.error("LOGIN API ERROR:", error);
    return NextResponse.json({ error: 'Terjadi kegagalan sistem pada server.' }, { status: 500 });
  }
}