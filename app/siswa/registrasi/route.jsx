import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  const { nama, citaCita, kodeKelas } = await req.json();

  // 1. Simpan Siswa
  const { data: siswa, error } = await supabase
    .from('siswa')
    .insert([{ nama, cita_cita: citaCita, kode_kelas: kodeKelas }])
    .select()
    .single();

  // 2. Generate Soal via Gemini
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Buat soal matematika perbandingan senilai untuk cita-cita ${citaCita}. Jangan beri jawaban.`;
  const result = await model.generateContent(prompt);
  
  // 3. Simpan soal ke database
  await supabase.from('sesi_latihan').insert([{ 
    siswa_id: siswa.id, 
    soal: result.response.text() 
  }]);
  

  return Response.json({ siswa, soal: result.response.text() });
}