import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent(prompt);
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

    // Cocokkan idSesi berdasarkan parameter_id
    const hasil = daftarSoal.map(item => ({
      parameterId: item.parameterId,
      soal: item.soal,
      idSesi: data.find(d => d.parameter_id === item.parameterId)?.id
    }));

    return NextResponse.json({ daftarSoal: hasil }, { status: 200 });

  } catch (error) {
    console.error("ERROR AI BATCH:", error);
    return NextResponse.json({ error: 'Gagal membuat soal dari AI' }, { status: 500 });
  }
}
