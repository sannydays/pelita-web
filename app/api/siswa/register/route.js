import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { nama, username, password, kelas_id, citaCita } = body;

    // hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert to supa
    const { data, error } = await supabase
      .from('siswa')
      .insert([{ 
        nama, 
        username, 
        password: hashedPassword, 
        kelas_id,
        cita_cita: citaCita 
      }])
      .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ siswa: data[0] }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}