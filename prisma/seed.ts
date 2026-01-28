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

// Realistic hemodialysis patient records over 30 days
// Patient profile: 58 years old, stage 5 CKD, on regular HD 3x/week
const realisticRecords = [
  // Week 1 - Starting with stable condition
  {
    daysAgo: 28,
    category: 'dialysis',
    symptoms: [{ name: 'Kelelahan', severity: 'low' }],
    bloodPressure: { systolic: 142, diastolic: 88, pulse: 76 },
    weight: 68.5,
    fluidIntake: 1200,
    mood: 'neutral',
    dialysisSchedule: {
      type: 'HD',
      duration: 240,
      accessType: 'AVF',
      location: 'RS Cipto Mangunkusumo',
      completed: true,
    },
    dietNotes: 'Sarapan bubur, makan siang nasi dengan ikan rebus',
    note: 'Dialisis berjalan lancar, UF tercapai 2.5L',
  },
  {
    daysAgo: 26,
    category: 'dialysis',
    symptoms: [
      { name: 'Kram otot', severity: 'medium' },
      { name: 'Pusing', severity: 'low' },
    ],
    bloodPressure: { systolic: 138, diastolic: 85, pulse: 72 },
    weight: 67.8,
    fluidIntake: 1100,
    mood: 'neutral',
    dialysisSchedule: {
      type: 'HD',
      duration: 240,
      accessType: 'AVF',
      location: 'RS Cipto Mangunkusumo',
      completed: true,
    },
    dietNotes: 'Mengurangi konsumsi garam',
    note: 'Kram pada jam ke-3, diatasi dengan pengaturan UF',
  },
  {
    daysAgo: 24,
    category: 'dialysis',
    symptoms: [],
    bloodPressure: { systolic: 135, diastolic: 82, pulse: 74 },
    weight: 67.2,
    fluidIntake: 1000,
    mood: 'good',
    dialysisSchedule: {
      type: 'HD',
      duration: 240,
      accessType: 'AVF',
      location: 'RS Cipto Mangunkusumo',
      completed: true,
    },
    dietNotes: 'Makan sesuai anjuran ahli gizi',
    note: 'Kondisi stabil, tidak ada keluhan',
  },

  // Week 2 - Lab results week
  {
    daysAgo: 21,
    category: 'lab',
    symptoms: [{ name: 'Kelelahan', severity: 'low' }],
    bloodPressure: { systolic: 140, diastolic: 86, pulse: 78 },
    weight: 68.0,
    fluidIntake: 1150,
    mood: 'neutral',
    dialysisSchedule: {
      type: 'HD',
      duration: 240,
      accessType: 'AVF',
      location: 'RS Cipto Mangunkusumo',
      completed: true,
    },
    labResults: [
      { testName: 'BUN', value: 45, flag: 'high' },
      { testName: 'Creatinine', value: 8.2, flag: 'normal' },
      { testName: 'Hemoglobin', value: 10.5, flag: 'normal' },
      { testName: 'Potassium', value: 5.1, flag: 'normal' },
      { testName: 'Phosphorus', value: 5.8, flag: 'high' },
      { testName: 'Calcium', value: 8.9, flag: 'normal' },
      { testName: 'Albumin', value: 3.6, flag: 'normal' },
    ],
    dietNotes: 'Batasi makanan tinggi fosfor',
    note: 'Hasil lab menunjukkan fosfor sedikit tinggi',
  },
  {
    daysAgo: 19,
    category: 'dialysis',
    symptoms: [{ name: 'Gatal-gatal', severity: 'medium' }],
    bloodPressure: { systolic: 145, diastolic: 90, pulse: 80 },
    weight: 67.5,
    fluidIntake: 1100,
    mood: 'neutral',
    dialysisSchedule: {
      type: 'HD',
      duration: 240,
      accessType: 'AVF',
      location: 'RS Cipto Mangunkusumo',
      completed: true,
    },
    dietNotes: 'Hindari keju dan susu',
    note: 'Gatal kemungkinan karena fosfor tinggi',
  },
  {
    daysAgo: 17,
    category: 'dialysis',
    symptoms: [{ name: 'Gatal-gatal', severity: 'low' }],
    bloodPressure: { systolic: 138, diastolic: 84, pulse: 75 },
    weight: 67.0,
    fluidIntake: 950,
    mood: 'good',
    dialysisSchedule: {
      type: 'HD',
      duration: 240,
      accessType: 'AVF',
      location: 'RS Cipto Mangunkusumo',
      completed: true,
    },
    dietNotes: 'Konsumsi pengikat fosfat sebelum makan',
    note: 'Gatal mulai berkurang',
  },

  // Week 3 - Some challenges
  {
    daysAgo: 14,
    category: 'dialysis',
    symptoms: [
      { name: 'Mual', severity: 'medium' },
      { name: 'Nafsu makan menurun', severity: 'medium' },
    ],
    bloodPressure: { systolic: 150, diastolic: 92, pulse: 82 },
    weight: 69.0,
    fluidIntake: 1400,
    mood: 'bad',
    dialysisSchedule: {
      type: 'HD',
      duration: 240,
      accessType: 'AVF',
      location: 'RS Cipto Mangunkusumo',
      completed: true,
    },
    dietNotes: 'Makan sedikit karena mual',
    note: 'BB naik signifikan, perlu kontrol cairan lebih ketat',
  },
  {
    daysAgo: 12,
    category: 'dialysis',
    symptoms: [
      { name: 'Sesak napas', severity: 'medium' },
      { name: 'Bengkak (edema)', severity: 'medium' },
    ],
    bloodPressure: { systolic: 155, diastolic: 95, pulse: 88 },
    weight: 69.5,
    fluidIntake: 800,
    mood: 'bad',
    dialysisSchedule: {
      type: 'HD',
      duration: 270,
      accessType: 'AVF',
      location: 'RS Cipto Mangunkusumo',
      completed: true,
    },
    dietNotes: 'Batasi cairan maksimal 800ml/hari',
    note: 'Dialisis diperpanjang untuk tarik cairan lebih banyak',
  },
  {
    daysAgo: 10,
    category: 'dialysis',
    symptoms: [{ name: 'Kelelahan', severity: 'medium' }],
    bloodPressure: { systolic: 142, diastolic: 88, pulse: 78 },
    weight: 68.0,
    fluidIntake: 850,
    mood: 'neutral',
    dialysisSchedule: {
      type: 'HD',
      duration: 240,
      accessType: 'AVF',
      location: 'RS Cipto Mangunkusumo',
      completed: true,
    },
    dietNotes: 'Lanjutkan pembatasan cairan',
    note: 'Kondisi membaik, sesak berkurang',
  },

  // Week 4 - Recovery and stability
  {
    daysAgo: 7,
    category: 'lab',
    symptoms: [],
    bloodPressure: { systolic: 136, diastolic: 82, pulse: 74 },
    weight: 67.5,
    fluidIntake: 900,
    mood: 'good',
    dialysisSchedule: {
      type: 'HD',
      duration: 240,
      accessType: 'AVF',
      location: 'RS Cipto Mangunkusumo',
      completed: true,
    },
    labResults: [
      { testName: 'BUN', value: 38, flag: 'normal' },
      { testName: 'Creatinine', value: 7.8, flag: 'normal' },
      { testName: 'Hemoglobin', value: 10.8, flag: 'normal' },
      { testName: 'Potassium', value: 4.8, flag: 'normal' },
      { testName: 'Phosphorus', value: 4.9, flag: 'normal' },
      { testName: 'Calcium', value: 9.1, flag: 'normal' },
      { testName: 'Albumin', value: 3.7, flag: 'normal' },
    ],
    dietNotes: 'Diet berjalan baik',
    note: 'Hasil lab membaik, fosfor turun',
  },
  {
    daysAgo: 5,
    category: 'dialysis',
    symptoms: [{ name: 'Kelelahan', severity: 'low' }],
    bloodPressure: { systolic: 134, diastolic: 80, pulse: 72 },
    weight: 67.2,
    fluidIntake: 950,
    mood: 'good',
    dialysisSchedule: {
      type: 'HD',
      duration: 240,
      accessType: 'AVF',
      location: 'RS Cipto Mangunkusumo',
      completed: true,
    },
    dietNotes: 'Makan teratur 3x sehari',
    note: 'Kondisi stabil, tenaga mulai pulih',
  },
  {
    daysAgo: 3,
    category: 'dialysis',
    symptoms: [],
    bloodPressure: { systolic: 132, diastolic: 78, pulse: 70 },
    weight: 66.8,
    fluidIntake: 900,
    mood: 'good',
    dialysisSchedule: {
      type: 'HD',
      duration: 240,
      accessType: 'AVF',
      location: 'RS Cipto Mangunkusumo',
      completed: true,
    },
    dietNotes: 'Lanjutkan pola makan sehat',
    note: 'Dialisis lancar, tidak ada keluhan',
  },
  {
    daysAgo: 1,
    category: 'dialysis',
    symptoms: [{ name: 'Kelelahan', severity: 'low' }],
    bloodPressure: { systolic: 135, diastolic: 82, pulse: 73 },
    weight: 67.0,
    fluidIntake: 950,
    mood: 'good',
    dialysisSchedule: {
      type: 'HD',
      duration: 240,
      accessType: 'AVF',
      location: 'RS Cipto Mangunkusumo',
      completed: true,
    },
    dietNotes: 'Sarapan oatmeal, makan siang nasi dengan ayam kukus',
    note: 'Kondisi baik, siap untuk kontrol rutin minggu depan',
  },
  // Today's record
  {
    daysAgo: 0,
    category: 'general',
    symptoms: [],
    bloodPressure: { systolic: 130, diastolic: 80, pulse: 72 },
    weight: 66.5,
    fluidIntake: 500,
    mood: 'good',
    dietNotes: 'Sarapan roti gandum dengan telur rebus',
    note: 'Pagi ini kondisi segar, tidur nyenyak semalam',
  },
];

async function seedRecords() {
  console.log('Seeding realistic hemodialysis patient records...\n');

  let email = 'a@a.com';
  let password = 'a';
  let name = 'Demo Patient';
  if (process.env.USER_EMAIL && process.env.USER_PASSWORD && process.env.USER_NAME) {
    email = process.env.USER_EMAIL;
    password = process.env.USER_PASSWORD;
    name = process.env.USER_NAME;
  }

  let user = await prisma.user.findFirst({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: { email, password, name },
    });
    console.log('Created demo user:', user.email);
  }

  // Clear existing records for this user
  await prisma.record.deleteMany({ where: { userId: user.id } });
  console.log('Cleared existing records\n');

  const records = [];
  for (const recordData of realisticRecords) {
    const date = new Date();
    date.setDate(date.getDate() - recordData.daysAgo);
    date.setHours(8 + Math.floor(recordData.daysAgo % 3) * 4, 0, 0, 0); // Vary times

    const record = await prisma.record.create({
      data: {
        userId: user.id,
        date,
        category: recordData.category,
        symptoms: recordData.symptoms,
        bloodPressure: recordData.bloodPressure,
        weight: recordData.weight,
        fluidIntake: recordData.fluidIntake,
        mood: recordData.mood,
        dialysisSchedule: recordData.dialysisSchedule,
        labResults: recordData.labResults,
        dietNotes: recordData.dietNotes,
        note: recordData.note,
      },
    });
    records.push(record);

    const dateStr = date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    console.log(`✓ ${dateStr} - ${recordData.category}: ${recordData.note?.slice(0, 50) || 'No note'}`);
  }

  console.log(`\n✅ Seeding complete! Created ${records.length} realistic records.`);
  console.log('\nPatient journey summary:');
  console.log('  - Week 1: Stable dialysis sessions');
  console.log('  - Week 2: Lab results show high phosphorus, managed with diet');
  console.log('  - Week 3: Fluid overload episode, required extended dialysis');
  console.log('  - Week 4: Recovery and return to stability');

  await prisma.$disconnect();
  await pool.end();
}

seedRecords().catch((e) => {
  console.error('Error seeding:', e);
  process.exit(1);
});
