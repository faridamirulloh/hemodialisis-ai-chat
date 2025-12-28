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
  unit: string;
  normalRange: string;
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
  date: string;
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
  createdAt: string;
  updatedAt: string;
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
