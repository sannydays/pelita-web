export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Fungsi pembantu untuk memberi jeda (istirahat) jika server Google sibuk
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request) {
  try {
    const { siswaId, citaCita, parameters } = await request.json();

    if (!siswaId || !citaCita || !Array.isArray(parameters) || parameters.length === 0) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const daftarSoalPrompt = parameters.map((p, idx) => `
      Soal ke-${idx + 1} (parameterId: "${p.id}"):
      - Tipe: ${p.tipe}
      - Data angka WAJIB dipakai: ${JSON.stringify(p.angkaDasar)}
    `).join('\n');

    const prompt = `
      Kamu adalah pembuat soal cerita matematika yang menyenangkan untuk anak-anak.
      Buat ${parameters.length} soal cerita dengan tema profesi: ${citaCita}. 
      Soal yang dibuat terkait dalam ruang lingkup materi pecahan dan perbandingan.

      Daftar soal yang harus dibuat:
      ${daftarSoalPrompt}

      ATURAN MUTLAK:
      1. Setiap soal WAJIB pakai angka dari datanya masing-masing secara natural.
      2. JANGAN PERNAH menuliskan jawaban akhir, rumus, atau cara menghitung.
      3. Setiap soal diakhiri kalimat tanya yang menantang.
      4. Gunakan bahasa Indonesia yang mudah dipahami.
      5. Cerita antar soal harus berbeda-beda, jangan berulang.

      WAJIB kembalikan HANYA JSON array, TANPA teks lain, TANPA markdown code block,
      persis format ini:
      [
        { "parameterId": "...", "soal": "..." },
        { "parameterId": "...", "soal": "..." }
      ]
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // MEKANISME RETRY: Coba panggil Gemini maksimal 3 kali
    let result;
    for (let i = 0; i < 3; i++) {
      try {
        result = await model.generateContent(prompt);
        break; // Jika berhasil, langsung keluar dari loop
      } catch (apiError) {
        console.warn(`Percobaan ke-${i + 1} ke Gemini gagal. API sibuk.`);
        if (i === 2) throw apiError; // Jika percobaan ke-3 masih gagal, lemparkan errornya
        await sleep(3000 * (i + 1)); // Tunggu 3 detik, lalu 6 detik sebelum mencoba lagi
      }
    }
    
    let teks = result.response.text().trim();
    teks = teks.replace(/```json/g, '').replace(/```/g, '').trim();

    let daftarSoal;
    try {
      daftarSoal = JSON.parse(teks);
    } catch {
      console.error("Gagal parse JSON dari AI:", teks);
      throw new Error("Format balasan AI tidak valid");
    }

    const rowsToInsert = daftarSoal.map(item => ({
      siswa_id: siswaId,
      parameter_id: item.parameterId,
      teks_soal_ai: item.soal
    }));

    const { data, error } = await supabase.from('sesi_latihan').insert(rowsToInsert).select();
    if (error) throw error;

    const hasil = daftarSoal.map(item => ({
      parameterId: item.parameterId,
      soal: item.soal,
      idSesi: data.find(d => d.parameter_id === item.parameterId)?.id
    }));

    return NextResponse.json({ daftarSoal: hasil }, { status: 200 });

  } catch (error) {
    console.error("ERROR AI BATCH FINAL:", error);
    return NextResponse.json({ error: 'Sistem AI sedang padat, silakan coba lagi.' }, { status: 500 });
  }
}
