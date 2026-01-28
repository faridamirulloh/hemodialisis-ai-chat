export type SeverityLevel = 'low' | 'medium' | 'critical';
export type RecordCategory = 'general' | 'dialysis' | 'lab' | 'symptoms';
export type MoodType = 'good' | 'neutral' | 'bad';
export type ViewMode = 'timeline' | 'cards' | 'calendar';
export type DialysisType = 'HD' | 'PD' | 'HDF';
export type AccessType = 'AVF' | 'AVG' | 'Catheter';
export type LabFlag = 'normal' | 'low' | 'high';

export interface Symptom {
  name: string;
  severity: SeverityLevel;
}

export interface DialysisSchedule {
  date: string;
  duration: number; // in minutes
  type: DialysisType;
  location?: string;
  accessType?: AccessType;
  dryWeight?: number;
  ultrafiltration?: number;
}

export interface LabResult {
  testName: string;
  value: number;
  flag?: LabFlag;
}

export interface BloodPressure {
  systolic: number;
  diastolic: number;
  pulse?: number;
  position?: 'sitting' | 'standing' | 'lying';
}

export interface Medication {
  name: string;
  dosage: string;
  time: string;
  frequency?: string;
}

export interface HealthRecord {
  id: string;
  userId: string;
  date: Date;
  symptoms: Symptom[];
  dialysisSchedule?: DialysisSchedule;
  labResults?: LabResult[];
  bloodPressure?: BloodPressure;
  weight?: number;
  fluidIntake?: number;
  dietNotes?: string;
  medications?: Medication[];
  note?: string;
  mood?: MoodType;
  category: RecordCategory;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecordFilter {
  dateFrom?: string;
  dateTo?: string;
  category?: RecordCategory;
  severity?: SeverityLevel;
  searchTerm?: string;
}

// Common lab tests for hemodialysis patients
export const LAB_TEST_CATEGORIES = {
  kidneyFunction: ['BUN', 'Creatinine', 'eGFR'],
  electrolytes: ['Sodium', 'Potassium', 'Chloride', 'Bicarbonate', 'Calcium', 'Phosphorus', 'Magnesium'],
  bloodCount: ['Hemoglobin', 'Hematocrit', 'WBC', 'Platelets'],
  dialysisAdequacy: ['Kt/V', 'URR'],
  ironStudies: ['Ferritin', 'TSAT', 'Iron', 'TIBC'],
  boneMineral: ['PTH', 'Vitamin D'],
  nutrition: ['Albumin', 'Pre-albumin'],
  lipidPanel: ['Total Cholesterol', 'LDL', 'HDL', 'Triglycerides'],
  bloodSugar: ['Glucose', 'HbA1c'],
  liverFunction: ['ALT', 'AST', 'Bilirubin'],
} as const;

// Normal ranges for lab tests (with dialysis-specific targets where applicable)
// Sources: KDOQI Guidelines, DaVita, Cleveland Clinic, NKF
export interface LabNormalRange {
  min: number;
  max: number;
  unit: string;
  dialysisNote?: string; // Special note for dialysis patients
}

export const LAB_NORMAL_RANGES: Record<string, LabNormalRange> = {
  // Kidney Function
  BUN: { min: 20, max: 40, unit: 'mg/dL', dialysisNote: 'Post-dialysis target' },
  Creatinine: { min: 5, max: 10, unit: 'mg/dL', dialysisNote: 'Varies with muscle mass' },
  eGFR: { min: 0, max: 15, unit: 'mL/min/1.73m²', dialysisNote: 'Stage 5 CKD' },

  // Electrolytes
  Sodium: { min: 135, max: 145, unit: 'mEq/L' },
  Potassium: { min: 3.5, max: 5.5, unit: 'mEq/L', dialysisNote: 'Optimal 4.6-5.3 mEq/L' },
  Chloride: { min: 96, max: 106, unit: 'mEq/L' },
  Bicarbonate: { min: 22, max: 26, unit: 'mEq/L', dialysisNote: 'Pre-dialysis ≥22' },
  Calcium: { min: 8.4, max: 9.5, unit: 'mg/dL', dialysisNote: 'Lower end preferred' },
  Phosphorus: { min: 3.0, max: 5.5, unit: 'mg/dL', dialysisNote: 'Target for dialysis' },
  Magnesium: { min: 1.7, max: 2.2, unit: 'mg/dL' },

  // Blood Count
  Hemoglobin: { min: 10, max: 12, unit: 'g/dL', dialysisNote: 'KDOQI target 11-12' },
  Hematocrit: { min: 33, max: 36, unit: '%', dialysisNote: 'Dialysis target' },
  WBC: { min: 4.5, max: 11, unit: '×10³/µL' },
  Platelets: { min: 150, max: 450, unit: '×10³/µL' },

  // Dialysis Adequacy
  'Kt/V': { min: 1.2, max: 1.8, unit: '', dialysisNote: 'Minimum 1.2 recommended' },
  URR: { min: 65, max: 80, unit: '%', dialysisNote: 'Minimum 65% recommended' },

  // Iron Studies
  Ferritin: { min: 100, max: 500, unit: 'ng/mL', dialysisNote: 'Dialysis target >100' },
  TSAT: { min: 20, max: 50, unit: '%', dialysisNote: 'Target >20%' },
  Iron: { min: 60, max: 170, unit: 'µg/dL' },
  TIBC: { min: 250, max: 370, unit: 'µg/dL' },

  // Bone Mineral
  PTH: { min: 150, max: 600, unit: 'pg/mL', dialysisNote: '2-9x upper normal' },
  'Vitamin D': { min: 30, max: 80, unit: 'ng/mL', dialysisNote: 'Target ≥30' },

  // Nutrition
  Albumin: { min: 3.5, max: 5.0, unit: 'g/dL', dialysisNote: 'Target ≥4.0' },
  'Pre-albumin': { min: 20, max: 40, unit: 'mg/dL' },

  // Lipid Panel
  'Total Cholesterol': { min: 0, max: 200, unit: 'mg/dL' },
  LDL: { min: 0, max: 100, unit: 'mg/dL', dialysisNote: 'Optimal <100' },
  HDL: { min: 40, max: 100, unit: 'mg/dL', dialysisNote: 'Higher is better' },
  Triglycerides: { min: 0, max: 150, unit: 'mg/dL' },

  // Blood Sugar
  Glucose: { min: 70, max: 140, unit: 'mg/dL', dialysisNote: 'Fasting <100' },
  HbA1c: { min: 4.0, max: 7.0, unit: '%', dialysisNote: 'Diabetic target <7%' },

  // Liver Function
  ALT: { min: 7, max: 56, unit: 'U/L' },
  AST: { min: 8, max: 48, unit: 'U/L' },
  Bilirubin: { min: 0.1, max: 1.2, unit: 'mg/dL' },
};

// Common symptoms for hemodialysis patients (Indonesian)
export const COMMON_SYMPTOMS = [
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
] as const;
