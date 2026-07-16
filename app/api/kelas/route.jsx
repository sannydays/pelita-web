import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Fungsi bantuan untuk membuat kode acak 6 karakter
function generateKodeJoin() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function POST(request) {
  try {
    // 1. Terima data dari View
    const body = await request.json();
    const { namaKelas, guruId } = body;

    // Validasi dasar
    if (!namaKelas || !guruId) {
      return NextResponse.json({ error: 'Nama kelas dan ID Guru wajib diisi' }, { status: 400 });
    }

    // 2. Hasilkan kode unik
    const kodeJoin = generateKodeJoin();

    // 3. Eksekusi ke Model (Supabase)
    const { data, error } = await supabase
      .from('kelas')
      .insert([
        { 
          nama_kelas: namaKelas, 
          guru_id: guruId, 
          kode_join: kodeJoin,
          is_aktif: true 
        }
      ])
      .select();

    if (error) throw error;

    // 4. Kembalikan respons sukses ke View
    return NextResponse.json({ message: 'Kelas berhasil dibuat!', data: data[0] }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}