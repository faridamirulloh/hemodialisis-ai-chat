import type { ChatMessage } from '~/types/chat';

export const welcomeMessage = (date: Date): ChatMessage => ({
  id: 'welcome-message',
  role: 'system',
  text: 'Halo — Saya adalah asisten AI yang suportif bagi pasien hemodialisis. Saya sudah ditraining dengan data jurnal dan paper penelitian tentang Hemodialisis. Saya dapat menjawab pertanyaan seputar dialisis, pengobatan, diet, dan membantu mencatat gejala. Saya TIDAK menggantikan tim medis Anda. Jika Anda mengalami keadaan darurat, hubungi tim medis.',
  createdAt: date.toISOString(),
});

export const QuickPrompts = [
  {
    name: 'Pola Makan',
    items: [
      'Boleh minum berapa banyak dalam sehari?',
      'Apa saja makanan yang perlu dibatasi?',
      'Apa saja yang dihitung sebagai cairan?',
      'Bagaimana cara mengatasi rasa haus tanpa banyak minum?',
      'Apakah saya perlu suplemen vitamin tambahan?',
    ],
  },
  {
    name: 'Efek Samping & Gejala',
    items: ['Kenapa saya merasa sangat lelah setelah cuci darah?', 'Kenapa kulit saya gatal dan sering kram?'],
  },
  {
    name: 'Gaya Hidup',
    items: ['Apakah saya masih bisa bekerja atau bepergian (traveling)?', 'Bolehkan saya tetap berolahraga?'],
  },
];
