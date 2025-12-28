import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import pg from 'pg';
import { PrismaClient } from '../app/generated/prisma/client';

dotenv.config({ path: '.env.development' });

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SYMPTOMS = [
  'Kelelahan',
  'Mual',
  'Muntah',
  'Sakit kepala',
  'Kram otot',
  'Gatal-gatal',
  'Sesak napas',
  'Nyeri dada',
  'Bengkak (edema)',
  'Pusing',
  'Nafsu makan menurun',
  'Gangguan tidur',
  'Kaki gelisah',
  'Kulit kering',
  'Mudah memar',
  'Tekanan darah tidak stabil',
];

const CATEGORIES = ['general', 'dialysis', 'lab', 'symptoms'] as const;
const SEVERITIES = ['low', 'medium', 'critical'] as const;
const MOODS = ['good', 'neutral', 'bad'] as const;
const DIALYSIS_TYPES = ['HD', 'PD', 'HDF'] as const;
const ACCESS_TYPES = ['AVF', 'AVG', 'Catheter'] as const;

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomSymptoms(): { name: string; severity: string }[] {
  const count = Math.floor(Math.random() * 4) + 1;
  const selected: string[] = [];
  for (let i = 0; i < count; i++) {
    const symptom = randomItem(SYMPTOMS);
    if (!selected.includes(symptom)) {
      selected.push(symptom);
    }
  }
  return selected.map((name) => ({
    name,
    severity: randomItem(SEVERITIES),
  }));
}

function randomLabResults() {
  const tests = [
    { testName: 'BUN', unit: 'mg/dL', normalRange: '7-20' },
    { testName: 'Creatinine', unit: 'mg/dL', normalRange: '0.6-1.2' },
    { testName: 'Hemoglobin', unit: 'g/dL', normalRange: '12-16' },
    { testName: 'Potassium', unit: 'mEq/L', normalRange: '3.5-5.0' },
    { testName: 'Phosphorus', unit: 'mg/dL', normalRange: '2.5-4.5' },
  ];
  const count = Math.floor(Math.random() * 3) + 1;
  return tests.slice(0, count).map((test) => ({
    ...test,
    value: Math.round((Math.random() * 20 + 5) * 10) / 10,
    flag: randomItem(['normal', 'high', 'low']),
  }));
}

function randomDate(daysBack: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  date.setHours(Math.floor(Math.random() * 12) + 6, Math.floor(Math.random() * 60));
  return date;
}

async function seedRecords() {
  console.log('Seeding 10 random records...');

  // First, ensure we have a demo user
  let user = await prisma.user.findFirst({ where: { email: 'demo@example.com' } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'demo@example.com',
        password: 'demo123',
        name: 'Demo User',
      },
    });
    console.log('Created demo user:', user.id);
  }

  const records = [];
  for (let i = 0; i < 10; i++) {
    const category = randomItem(CATEGORIES);
    const hasDialysis = category === 'dialysis' || Math.random() > 0.6;
    const hasLab = category === 'lab' || Math.random() > 0.7;

    const record = await prisma.record.create({
      data: {
        userId: user.id,
        date: randomDate(30),
        category,
        symptoms: randomSymptoms(),
        bloodPressure: {
          systolic: Math.floor(Math.random() * 40) + 110,
          diastolic: Math.floor(Math.random() * 20) + 70,
          pulse: Math.floor(Math.random() * 30) + 60,
        },
        weight: Math.round((Math.random() * 20 + 55) * 10) / 10,
        fluidIntake: Math.floor(Math.random() * 1500) + 500,
        mood: randomItem(MOODS),
        dialysisSchedule: hasDialysis
          ? {
              date: randomDate(30).toISOString(),
              type: randomItem(DIALYSIS_TYPES),
              duration: Math.floor(Math.random() * 2) * 30 + 180,
              accessType: randomItem(ACCESS_TYPES),
              location: randomItem(['RS Cipto Mangunkusumo', 'RS Fatmawati', 'Klinik Hemodialisis Bekasi']),
            }
          : undefined,
        labResults: hasLab ? randomLabResults() : undefined,
        dietNotes: randomItem([
          'Makan rendah garam dan protein',
          'Hindari makanan tinggi kalium',
          'Minum air sesuai anjuran dokter',
          'Konsumsi buah dan sayur secukupnya',
          null,
        ]),
        note: randomItem([
          'Kondisi stabil hari ini',
          'Sedikit lemas setelah dialisis',
          'Tidur nyenyak semalam',
          'Perlu kontrol tekanan darah',
          null,
        ]),
      },
    });
    records.push(record);
    console.log(`Created record ${i + 1}: ${record.id} (${category})`);
  }

  console.log('\nSeeding complete! Created 10 records.');
  await prisma.$disconnect();
  await pool.end();
}

seedRecords().catch((e) => {
  console.error('Error seeding:', e);
  process.exit(1);
});
