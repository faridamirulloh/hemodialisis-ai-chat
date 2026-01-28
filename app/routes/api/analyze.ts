import { Chat } from '~/constant/api';
import prisma from '~/lib/prisma.server';

export async function action({ request }: { request: Request }) {
  try {
    const body = await request.json();
    let { userId } = body;
    const { startDate, endDate, startFrom } = body as {
      startDate?: string;
      endDate?: string;
      startFrom?: 'beginning' | 'lastAnalysis' | 'custom';
    };

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

    // Build date filter based on startFrom option
    const dateFilter: { gte?: Date; lte?: Date } = {};

    if (startFrom === 'beginning') {
      // No start date filter - get all records from beginning
    } else if (startFrom === 'lastAnalysis') {
      // Find the last analysis session for this user
      const lastAnalysis = await prisma.chatSession.findFirst({
        where: {
          id: {
            startsWith: `health-analysis-${userId}`,
          },
        },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      });
      if (lastAnalysis) {
        dateFilter.gte = lastAnalysis.updatedAt;
      }
    } else if (startFrom === 'custom' && startDate) {
      dateFilter.gte = new Date(startDate);
    }

    if (endDate) {
      dateFilter.lte = new Date(endDate);
    } else {
      dateFilter.lte = new Date(); // Default to current date
    }

    // Fetch records for analysis with date range
    const records = await prisma.record.findMany({
      where: {
        userId,
        date: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
      },
      orderBy: { date: 'desc' },
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
      body: JSON.stringify({ message: aiPrompt, sessionId: `health-analysis-${userId}-${Date.now()}`, userId }),
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

  // Sort records by date (oldest first for chronological view)
  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Chronological data for each record
  lines.push('=== DATA KRONOLOGIS PER TANGGAL ===\n');

  sortedRecords.forEach((record, index) => {
    const date = new Date(record.date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    lines.push(`📅 ${date} (Catatan ke-${index + 1}):`);

    // Blood pressure
    if (record.bloodPressure) {
      const bp = record.bloodPressure as { systolic?: number; diastolic?: number; pulse?: number };
      if (bp.systolic && bp.diastolic) {
        lines.push(`   • Tekanan darah: ${bp.systolic}/${bp.diastolic} mmHg`);
      }
      if (bp.pulse) {
        lines.push(`   • Detak jantung: ${bp.pulse} bpm`);
      }
    }

    // Weight
    if (record.weight) {
      lines.push(`   • Berat badan: ${record.weight} kg`);
    }

    // Fluid intake
    if (record.fluidIntake) {
      lines.push(`   • Asupan cairan: ${record.fluidIntake} ml`);
    }

    // Symptoms
    const symptoms = record.symptoms as { name: string; severity: string }[] | null;
    if (symptoms && Array.isArray(symptoms) && symptoms.length > 0) {
      const symptomList = symptoms.map((s) => `${s.name} (${s.severity})`).join(', ');
      lines.push(`   • Gejala: ${symptomList}`);
    }

    // Mood
    if (record.mood) {
      const moodMap: Record<string, string> = { good: 'Baik', neutral: 'Biasa', bad: 'Buruk' };
      lines.push(`   • Mood: ${moodMap[record.mood] || record.mood}`);
    }

    // Dialysis
    if (record.dialysisSchedule) {
      const dialysis = record.dialysisSchedule as { completed?: boolean; duration?: number };
      if (dialysis.completed !== undefined) {
        lines.push(
          `   • Dialisis: ${dialysis.completed ? 'Selesai' : 'Tidak selesai'}${dialysis.duration ? ` (${dialysis.duration} jam)` : ''}`,
        );
      }
    }

    // Lab results
    if (record.labResults && Array.isArray(record.labResults)) {
      const labs = record.labResults as { testName: string; value: number; flag?: string }[];
      if (labs.length > 0) {
        const labList = labs
          .map((lab) => {
            const flagLabel = lab.flag === 'high' ? '↑' : lab.flag === 'low' ? '↓' : '';
            return `${lab.testName}: ${lab.value}${flagLabel}`;
          })
          .join(', ');
        lines.push(`   • Hasil lab: ${labList}`);
      }
    }

    // Diet notes
    if (record.dietNotes) {
      lines.push(`   • Catatan diet: ${record.dietNotes}`);
    }

    // General notes
    if (record.note) {
      lines.push(`   • Catatan: ${record.note}`);
    }

    lines.push(''); // Empty line between records
  });

  // Add summary statistics at the end for context
  lines.push('=== RINGKASAN STATISTIK ===\n');

  // Blood pressure trend
  const bpRecords = sortedRecords.filter((r) => r.bloodPressure);
  if (bpRecords.length >= 2) {
    const firstBp = bpRecords[0].bloodPressure as { systolic?: number; diastolic?: number };
    const lastBp = bpRecords[bpRecords.length - 1].bloodPressure as { systolic?: number; diastolic?: number };
    if (firstBp.systolic && lastBp.systolic) {
      const systolicChange = lastBp.systolic - firstBp.systolic;
      const diastolicChange = (lastBp.diastolic || 0) - (firstBp.diastolic || 0);
      lines.push(
        `• Tren tekanan darah: ${systolicChange > 0 ? '+' : ''}${systolicChange}/${diastolicChange > 0 ? '+' : ''}${diastolicChange} mmHg (dari catatan pertama ke terakhir)`,
      );
    }
  }

  // Weight trend
  const weights = sortedRecords.map((r) => r.weight).filter(Boolean) as number[];
  if (weights.length >= 2) {
    const weightChange = weights[weights.length - 1] - weights[0];
    lines.push(
      `• Tren berat badan: ${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} kg (dari catatan pertama ke terakhir)`,
    );
  }

  // Average fluid intake
  const fluids = sortedRecords.map((r) => r.fluidIntake).filter(Boolean) as number[];
  if (fluids.length > 0) {
    const avgFluid = Math.round(fluids.reduce((a, b) => a + b, 0) / fluids.length);
    lines.push(`• Asupan cairan rata-rata: ${avgFluid} ml/hari`);
  }

  // Most common symptoms
  const symptomCounts: Record<string, number> = {};
  sortedRecords.forEach((r) => {
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
    lines.push(`• Gejala paling sering: ${topSymptoms.map(([name, count]) => `${name} (${count}x)`).join(', ')}`);
  }

  // Mood trend
  const moods = sortedRecords.map((r) => r.mood).filter(Boolean) as string[];
  if (moods.length > 0) {
    const moodCounts = { good: 0, neutral: 0, bad: 0 };
    moods.forEach((m) => {
      if (m in moodCounts) moodCounts[m as keyof typeof moodCounts]++;
    });
    lines.push(`• Distribusi mood: Baik ${moodCounts.good}x, Biasa ${moodCounts.neutral}x, Buruk ${moodCounts.bad}x`);
  }

  return lines.join('\n');
}
