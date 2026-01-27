import type { ChatMessage } from '~/types/chat';

export const welcomeMessage = (date: Date): ChatMessage => ({
  id: 'welcome-message',
  role: 'system',
  text: 'Halo — Saya adalah asisten AI yang suportif bagi pasien hemodialisis. Saya sudah ditraining dengan data jurnal dan paper penelitian tentang Hemodialisis. Saya dapat menjawab pertanyaan seputar dialisis, pengobatan, diet, dan membantu mencatat gejala. Saya TIDAK menggantikan tim medis Anda. Jika Anda mengalami keadaan darurat, hubungi tim medis.',
  createdAt: date.toISOString(),
});

export const QuickPrompts = [
  {
    name: 'Diet',
    items: [
      'Apa saja tantangan yang sering dihadapi pasien hemodialisis dalam mengatur diet dan cairan?',
      'Adakah tips pasien hemodialisis untuk mengatasi kesulitan pembatasan diet dan cairan?',
    ],
  },
  {
    name: 'Efek Samping',
    items: [
      'Bagaimana cara mencegah atau mengatasi kelebihan cairan saat menjalani dialisis?',
      'Apa saja efek samping yang umum terjadi setelah sesi dialisis?',
      'Mengapa saya mengalami anemia sebagai pasien ginjal?',
    ],
  },
  {
    name: 'Prosedur Dialisis',
    items: [
      'Apa saja panduan umum untuk dialisis, khususnya hemodialisis, di Indonesia?',
      'Apa perbedaan antara hemodialisis dan CAPD?',
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
    name: 'Nutrisi',
    items: [
      'Apa saja rekomendasi nutrisi dan diet untuk pasien dengan penyakit ginjal atau yang sedang dialisis?',
      'Bagaimana cara mengatur pola makan yang sehat untuk mendukung kesehatan ginjal saya?',
    ],
  },
  {
    name: 'Pengetahuan',
    items: [
      'Apa itu Gagal Ginjal Akut (GGA) dan bagaimana cara penanganannya?',
      'Apa saja penyebab umum Gagal Ginjal Akut?',
      'Bagaimana cara kerja ginjal buatan (dialyzer)?',
      'Apa saja tanda-tanda komplikasi yang harus saya waspadai?',
    ],
  },
];
