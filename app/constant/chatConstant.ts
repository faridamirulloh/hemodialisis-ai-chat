import { v7 as uuidv7 } from 'uuid';
import type { ChatMessage } from '~/types/chat';

export const WelcomeMessage: ChatMessage = {
  id: uuidv7(),
  role: 'system',
  text: 'Halo — Saya adalah asisten AI yang suportif bagi pasien hemodialisis. Saya sudah ditraining dengan data jurnal dan paper penelitian tentang Hemodialisis. Saya dapat menjawab pertanyaan seputar dialisis, pengobatan, diet, dan membantu mencatat gejala. Saya TIDAK menggantikan tim medis Anda. Jika Anda mengalami keadaan darurat, hubungi tim medis.',
  createdAt: new Date().toISOString(),
};

export const QuickPrompts = [
  {
    name: 'Diet',
    items: [
      'Makanan apa saja yang boleh dan tidak boleh saya konsumsi saat menjalani dialisis?',
      'Bagaimana cara mengelola asupan cairan agar tidak berlebihan?',
      'Apakah ada tips untuk mengatasi rasa haus yang berlebihan?',
      'Bagaimana cara mengetahui porsi makan yang tepat untuk kondisi saya?',
      'Apakah ada resep makanan khusus yang aman dan enak untuk pasien dialisis?',
    ],
  },
  {
    name: 'Prosedur Hemodialisis',
    items: [
      'Seberapa sering saya harus menjalani dialisis?',
      'Apa saja efek samping yang umum terjadi setelah sesi dialisis?',
      'Apa yang harus saya lakukan jika merasa tidak nyaman selama sesi dialisis?',
      'Berapa lama waktu yang dibutuhkan untuk setiap sesi dialisis?',
    ],
  },
  {
    name: 'Kesehatan dan Gaya Hidup',
    items: [
      'Bagaimana cara menjaga tekanan darah tetap stabil?',
      'Olahraga apa yang aman untuk saya?',
      'Bagaimana cara mengatasi kelelahan yang sering saya rasakan?',
      'Apakah saya perlu mengonsumsi suplemen tertentu?',
      'Bagaimana cara menjaga kesehatan mental dan tetap positif selama menjalani pengobatan?',
    ],
  },
  {
    name: 'Obat',
    items: [
      'Obat-obatan apa saja yang biasanya diresepkan untuk pasien hemodialisis?',
      'Apakah ada obat yang harus saya hindari?',
    ],
  },
  {
    name: 'Pengetahuan',
    items: [
      'Bagaimana cara kerja ginjal buatan (dialyzer)?',
      'Apa saja tanda-tanda komplikasi yang harus saya waspadai?',
    ],
  },
];
