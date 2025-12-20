import { v7 as uuidv7 } from 'uuid';
import type { ChatMessage } from '~/types/chat';

export const WelcomeMessage: ChatMessage = {
  id: uuidv7(),
  role: 'system',
  text: 'Halo — Saya adalah asisten AI yang suportif bagi pasien hemodialisis. Saya sudah ditraining dengan data jurnal dan paper penelitian tentang Hemodialisis. Saya dapat menjawab pertanyaan seputar dialisis, pengobatan, diet, dan membantu mencatat gejala. Saya TIDAK menggantikan tim medis Anda. Jika Anda mengalami keadaan darurat, hubungi tim medis.',
  createdAt: new Date().toISOString(),
};

export const QuickPrompts = [
  'Makanan apa yang harus saya hindari setelah dialisis?',
  'Cara mengatasi kulit gatal setelah dialisis',
  'Catat: pusing setelah sesi dialisis',
  'Kapan saya harus menghubungi perawat saya?',
];
