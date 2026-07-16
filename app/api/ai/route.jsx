import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    // 1. Tangkap SEMUA data yang dikirim dari Frontend
    const { siswaId, parameterId, citaCita, tipeSoal, angkaDasar } = await request.json();

    // Validasi ketat
    if (!siswaId || !citaCita || !tipeSoal || !angkaDasar) {
      return NextResponse.json({ error: 'Data siswa atau soal tidak lengkap' }, { status: 400 });
    }

    // 2. Rekayasa Prompt (Menghubungkan data Guru dengan AI)
    const prompt = `
      Kamu adalah pembuat soal cerita matematika yang menyenangkan.
      Buat 1 soal cerita tentang ${tipeSoal} dengan tema profesi: ${citaCita}.
      
      ATURAN MUTLAK:
      1. Kamu WAJIB menggunakan angka-angka dari data JSON berikut ke dalam cerita secara natural:
         Data Angka: ${JSON.stringify(angkaDasar)}
      2. JANGAN PERNAH menuliskan jawaban akhir, rumus, atau cara menghitungnya.
      3. Akhiri cerita dengan kalimat tanya yang menantang.
      4. Gunakan bahasa Indonesia yang mudah dipahami.
    `;

    // 3. Panggil Gemini (MENGGUNAKAN NAMA MODEL DARI KATALOG BARU)
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent(prompt);
    const teksSoalAi = result.response.text();

    // 4. Simpan rekam jejak ke Supabase (Tabel sesi_latihan)
    const { data, error } = await supabase
      .from('sesi_latihan')
      .insert([{
          siswa_id: siswaId,
          parameter_id: parameterId,
          teks_soal_ai: teksSoalAi
      }])
      .select();

    if (error) throw error;

    // 5. Kembalikan data soal ke UI Siswa
    return NextResponse.json({ 
      idSesi: data[0].id, 
      soal: teksSoalAi 
    }, { status: 200 });

  } catch (error) {
    console.error("ERROR AI:", error);
    return NextResponse.json({ error: 'Gagal membuat soal dari AI' }, { status: 500 });
  }
}