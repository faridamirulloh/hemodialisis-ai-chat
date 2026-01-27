import { Chat } from '~/constant/api';
import prisma from '~/lib/prisma.server';

export async function action({ request }: { request: Request }) {
  try {
    const body = await request.json();
    let { userId } = body;

    // Check if provided userId has records, otherwise find a user that does
    if (userId) {
      const hasRecords = await prisma.record.findFirst({
        where: { userId },
        select: { id: true },
      });
      if (!hasRecords) {
        // Provided userId has no records, find another user with records
        userId = null;
      }
    }

    // If no valid userId, find the first user with records
    if (!userId) {
      const firstRecord = await prisma.record.findFirst({
        select: { userId: true },
        orderBy: { createdAt: 'desc' },
      });
      userId = firstRecord?.userId;
    }

    if (!userId) {
      return new Response(
        JSON.stringify({
          analysis:
            'Belum ada data catatan kesehatan untuk dianalisis. Silakan tambahkan catatan kesehatan terlebih dahulu.',
          recommendations: [],
        }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Fetch recent records for analysis
    const records = await prisma.record.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 20, // Analyze last 20 records
    });

    console.log('Records found:', records.length, 'for userId:', userId);

    if (records.length === 0) {
      return new Response(
        JSON.stringify({
          analysis:
            'Belum ada data catatan kesehatan untuk dianalisis. Silakan tambahkan catatan kesehatan terlebih dahulu.',
          recommendations: [],
        }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Prepare summary for AI
    const summary = prepareHealthSummary(records);

    console.log(summary);

    // Send to AI for analysis
    const aiPrompt = `Kamu adalah asisten kesehatan AI yang khusus membantu pasien hemodialisis. 
Berikut adalah ringkasan data kesehatan saya dari ${records.length} catatan terakhir:

${summary}

Berdasarkan data di atas, berikan:
1. Analisis kondisi kesehatan saya secara keseluruhan (dalam 2-3 paragraf)
2. 5 rekomendasi langkah nyata yang bisa saya lakukan untuk memperbaiki kesehatan saya

Format respons dalam JSON:
{
  "analysis": "...",
  "recommendations": ["...", "...", "...", "...", "..."]
}`;

    const aiResponse = await fetch(Chat.POST.Prompt, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: aiPrompt, sessionId: `health-analysis-${userId}`, userId }),
    });

    const aiText = await aiResponse.text();

    try {
      const aiData = JSON.parse(aiText);
      let output = aiData.output || aiData;

      // Try to parse the output as JSON if it's a string
      if (typeof output === 'string') {
        // Extract JSON from the response if wrapped in markdown
        const jsonMatch = output.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          output = JSON.parse(jsonMatch[0]);
        }
      }

      return new Response(JSON.stringify(output), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch {
      // If AI response is not valid JSON, return raw text as analysis
      return new Response(
        JSON.stringify({
          analysis: aiText || 'Tidak dapat menganalisis data kesehatan saat ini. Silakan coba lagi nanti.',
          recommendations: [],
        }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    }
  } catch (error) {
    console.error('Health analysis error:', error);
    return new Response(
      JSON.stringify({
        error: 'Gagal menganalisis data kesehatan',
        analysis: 'Terjadi kesalahan saat menganalisis data. Silakan coba lagi.',
        recommendations: [],
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}

interface RecordData {
  date: Date;
  symptoms: unknown;
  bloodPressure: unknown;
  weight: number | null;
  fluidIntake: number | null;
  mood: string | null;
  labResults: unknown;
  dialysisSchedule: unknown;
  dietNotes: string | null;
  note: string | null;
}

function prepareHealthSummary(records: RecordData[]): string {
  const lines: string[] = [];

  // Blood pressure stats
  const bpRecords = records.filter((r) => r.bloodPressure);
  if (bpRecords.length > 0) {
    const systolics = bpRecords
      .map((r) => (r.bloodPressure as { systolic?: number })?.systolic)
      .filter(Boolean) as number[];
    const diastolics = bpRecords
      .map((r) => (r.bloodPressure as { diastolic?: number })?.diastolic)
      .filter(Boolean) as number[];
    if (systolics.length > 0) {
      const avgSystolic = Math.round(systolics.reduce((a, b) => a + b, 0) / systolics.length);
      const avgDiastolic = Math.round(diastolics.reduce((a, b) => a + b, 0) / diastolics.length);
      lines.push(`- Tekanan darah rata-rata: ${avgSystolic}/${avgDiastolic} mmHg`);
      lines.push(`- Tekanan darah tertinggi: ${Math.max(...systolics)}/${Math.max(...diastolics)} mmHg`);
      lines.push(`- Tekanan darah terendah: ${Math.min(...systolics)}/${Math.min(...diastolics)} mmHg`);
    }
  }

  // Weight stats
  const weights = records.map((r) => r.weight).filter(Boolean) as number[];
  if (weights.length > 0) {
    const avgWeight = Math.round((weights.reduce((a, b) => a + b, 0) / weights.length) * 10) / 10;
    lines.push(`- Berat badan rata-rata: ${avgWeight} kg`);
    if (weights.length >= 2) {
      const change = weights[0] - weights[weights.length - 1];
      lines.push(`- Perubahan berat badan: ${change > 0 ? '+' : ''}${change.toFixed(1)} kg`);
    }
  }

  // Fluid intake
  const fluids = records.map((r) => r.fluidIntake).filter(Boolean) as number[];
  if (fluids.length > 0) {
    const avgFluid = Math.round(fluids.reduce((a, b) => a + b, 0) / fluids.length);
    lines.push(`- Asupan cairan rata-rata: ${avgFluid} ml/hari`);
  }

  // Symptoms frequency
  const symptomCounts: Record<string, number> = {};
  records.forEach((r) => {
    const symptoms = r.symptoms as { name: string; severity: string }[] | null;
    if (symptoms && Array.isArray(symptoms)) {
      symptoms.forEach((s) => {
        symptomCounts[s.name] = (symptomCounts[s.name] || 0) + 1;
      });
    }
  });
  const topSymptoms = Object.entries(symptomCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  if (topSymptoms.length > 0) {
    lines.push(`- Gejala yang sering muncul: ${topSymptoms.map(([name, count]) => `${name} (${count}x)`).join(', ')}`);
  }

  // Mood distribution
  const moods = records.map((r) => r.mood).filter(Boolean) as string[];
  if (moods.length > 0) {
    const moodCounts = { good: 0, neutral: 0, bad: 0 };
    moods.forEach((m) => {
      if (m in moodCounts) moodCounts[m as keyof typeof moodCounts]++;
    });
    lines.push(`- Distribusi mood: Baik ${moodCounts.good}x, Biasa ${moodCounts.neutral}x, Buruk ${moodCounts.bad}x`);
  }

  // Dialysis frequency
  const dialysisRecords = records.filter((r) => r.dialysisSchedule);
  if (dialysisRecords.length > 0) {
    lines.push(`- Sesi dialisis tercatat: ${dialysisRecords.length} kali`);
  }

  // Lab results summary
  const labRecords = records.filter((r) => r.labResults);
  if (labRecords.length > 0) {
    lines.push(`- Catatan hasil lab: ${labRecords.length} kali`);
  }

  return lines.join('\n');
}
