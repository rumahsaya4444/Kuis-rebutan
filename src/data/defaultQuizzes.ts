import { QuizSet } from '../types/quiz';

export const DEFAULT_QUIZZES: QuizSet[] = [
  {
    id: 'quiz-nusantara-budaya',
    title: 'Pesona Nusantara & Warisan Dunia',
    description: 'Uji wawasan seputar keajaiban alam, warisan budaya UNESCO, dan fauna endemik Indonesia dengan visual spektakuler.',
    category: 'Budaya & Alam',
    difficulty: 'Menengah',
    coverImage: '/src/assets/images/quiz_borobudur_1793880987950.jpg',
    createdDate: '2026-11-01',
    questions: [
      {
        id: 'q1-borobudur',
        question: 'Candi megah pada gambar ini didirikan pada abad ke-8 oleh wangsa apakah?',
        mediaType: 'image',
        mediaUrl: '/src/assets/images/quiz_borobudur_1793880987950.jpg',
        options: ['Wangsa Syailendra', 'Wangsa Sanjaya', 'Kerajaan Majapahit', 'Kerajaan Singasari'],
        correctIndex: 0,
        timeLimitSeconds: 15,
        explanation: 'Candi Borobudur didirikan sekitar tahun 750-842 Masehi pada masa pemerintahan Wangsa Syailendra yang bercorak Buddha Mahayana di Jawa Tengah.',
        category: 'Sejarah & Budaya'
      },
      {
        id: 'q2-komodo',
        question: 'Berdasarkan dokumenter fauna ini, di manakah habitat asli satwa purba langka tersebut?',
        mediaType: 'image',
        mediaUrl: '/src/assets/images/quiz_komodo_1793880990087.jpg',
        options: ['Taman Nasional Komodo, NTT', 'Taman Nasional Way Kambas, Lampung', 'Taman Nasional Ujung Kulon, Banten', 'Taman Nasional Baluran, Jawa Timur'],
        correctIndex: 0,
        timeLimitSeconds: 15,
        explanation: 'Komodo (Varanus komodoensis) adalah kadal terbesar di dunia dan merupakan fauna endemik yang hidup di Pulau Komodo, Rinca, Flores, dan Gili Motang di Nusa Tenggara Timur.',
        category: 'Flora & Fauna'
      },
      {
        id: 'q3-batik-video',
        question: 'Video singkat ini memperlihatkan teknik membatik tradisional. Alat apakah yang digunakan untuk menorehkan malam/lilin panas ke kain mori?',
        mediaType: 'video',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        options: ['Canting', 'Gawangan', 'Bandul', 'Wajan Tembaga'],
        correctIndex: 0,
        timeLimitSeconds: 20,
        explanation: 'Canting adalah alat kecil berujung tembaga dengan gagang bambu/kayu yang digunakan khusus untuk melukiskan motif lilin malam pada batik tulis.',
        category: 'Kesenian Tradisional'
      },
      {
        id: 'q4-raja-ampat',
        question: 'Gugusan pulau karang eksotis yang terkenal dengan julukan "Jantung Segitiga Terumbu Karang Dunia" terletak di provinsi...',
        mediaType: 'none',
        options: ['Papua Barat Daya', 'Maluku Utara', 'Sulawesi Tenggara', 'Nusa Tenggara Barat'],
        correctIndex: 0,
        timeLimitSeconds: 15,
        explanation: 'Kepulauan Raja Ampat kini berada di Provinsi Papua Barat Daya dan memiliki keanekaragaman hayati laut terkaya di planet Bumi.',
        category: 'Geografi'
      }
    ]
  },
  {
    id: 'quiz-sains-antariksa-quantum',
    title: 'Sains Eksplorasi: Antariksa & Quantum',
    description: 'Tantangan kilat teknologi masa depan, fenomena fisika kosmologi, dan komputasi kuantum.',
    category: 'Sains & Teknologi',
    difficulty: 'Sulit',
    coverImage: '/src/assets/images/quiz_space_nebula_1793880989507.jpg',
    createdDate: '2026-11-03',
    questions: [
      {
        id: 'q5-nebula',
        question: 'Gambar teleskop luar angkasa ini memperlihatkan "Nebula". Apakah peran utama nebula dalam siklus hidup bintang di alam semesta?',
        mediaType: 'image',
        mediaUrl: '/src/assets/images/quiz_space_nebula_1793880989507.jpg',
        options: ['Tempat lahirnya bintang-bintang baru', 'Penyerap radiasi supernova', 'Lubang cacing penghubung galaksi', 'Sisa pendinginan planet gas'],
        correctIndex: 0,
        timeLimitSeconds: 15,
        explanation: 'Nebula adalah awan raksasa gas antarbintang dan debu kosmik yang bertindak sebagai "nursery" atau tempat lahir dan pembentukan bintang baru akibat gravitasi.',
        category: 'Astronomi'
      },
      {
        id: 'q6-quantum',
        question: 'Chip kuantum mutakhir pada foto laboratorium ini memanfaatkan fenomena mekanika kuantum di mana sebuah partikel berada di dua keadaan sekaligus. Disebut apakah fenomena tersebut?',
        mediaType: 'image',
        mediaUrl: '/src/assets/images/quiz_quantum_tech_1793880989557.jpg',
        options: ['Superposisi Kuantum', 'Keterikatan Kuantum (Entanglement)', 'Tunneling Partikel', 'Kondensasi Bose-Einstein'],
        correctIndex: 0,
        timeLimitSeconds: 15,
        explanation: 'Superposisi kuantum memungkinkan qubit (quantum bit) bernilai 0 dan 1 secara bersamaan, memberikan lompatan komputasi eksponensial dibanding bit biner klasik.',
        category: 'Fisika Modern'
      },
      {
        id: 'q7-light-speed-video',
        question: 'Simulasi video singkat ini menunjukkan foton cahaya melintasi ruang hampa. Berapakah perkiraan kecepatan cahaya (c) di ruang hampa?',
        mediaType: 'video',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        options: ['Sekitar 300.000 km/detik', 'Sekitar 150.000 km/detik', 'Sekitar 3.000.000 km/detik', 'Sekitar 30.000 km/detik'],
        correctIndex: 0,
        timeLimitSeconds: 15,
        explanation: 'Kecepatan cahaya dalam ruang hampa tepatnya adalah 299.792.458 meter per detik atau dibulatkan menjadi sekitar 300.000 kilometer per detik.',
        category: 'Fisika Dasar'
      },
      {
        id: 'q8-mars',
        question: 'Planet Mars memiliki julukan "Planet Merah". Senyawa kimia utama apakah yang memberikan warna kemerahan khas pada permukaannya?',
        mediaType: 'none',
        options: ['Besi(III) Oksida (Karat)', 'Sulfur Dioksida', 'Tembaga Sulfat', 'Metana Terpadatkan'],
        correctIndex: 0,
        timeLimitSeconds: 15,
        explanation: 'Warna merah Mars disebabkan oleh tingginya kandungan Besi(III) Oksida atau karat pada debu dan bebatuan di permukaannya.',
        category: 'Astronomi'
      }
    ]
  },
  {
    id: 'quiz-kecepatan-logika-kilat',
    title: 'Kecepatan Pikir & Trivia Refleks',
    description: 'Uji refleks dan ketajaman logika dalam waktu singkat! Siapa cepat, dia yang merajai puncak klasemen.',
    category: 'Logika & Refleks',
    difficulty: 'Mudah',
    createdDate: '2026-11-04',
    questions: [
      {
        id: 'q9-logika1',
        question: 'Jika 5 mesin pembuat botol membutuhkan 5 menit untuk membuat 5 botol, berapa menitkah yang dibutuhkan 100 mesin untuk membuat 100 botol?',
        mediaType: 'none',
        options: ['5 Menit', '100 Menit', '20 Menit', '1 Menit'],
        correctIndex: 0,
        timeLimitSeconds: 12,
        explanation: 'Tiap 1 mesin membutuhkan waktu 5 menit untuk menyelesaikan 1 botol. Jadi 100 mesin bekerja bersamaan akan menyelesaikan 100 botol dalam waktu 5 menit yang sama.',
        category: 'Logika Cepat'
      },
      {
        id: 'q10-video-motion',
        question: 'Perhatikan klip gerakan kinetik ini. Manakah deret angka kelanjutan yang benar: 2, 4, 8, 16, 32, ...?',
        mediaType: 'video',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        options: ['64', '48', '56', '72'],
        correctIndex: 0,
        timeLimitSeconds: 10,
        explanation: 'Pola deret angka tersebut adalah kelipatan dua berturut-turut (2 × 2 = 4, 4 × 2 = 8, ..., 32 × 2 = 64).',
        category: 'Pola Bilangan'
      },
      {
        id: 'q11-refleks-warna',
        question: 'Warna apa yang dihasilkan saat cahaya MERAH dan HIJAU dipadukan dalam sistem pencahayaan aditif (RGB)?',
        mediaType: 'none',
        options: ['Kuning', 'Biru', 'Cokelat', 'Ungu'],
        correctIndex: 0,
        timeLimitSeconds: 12,
        explanation: 'Dalam model warna aditif cahaya (RGB), penggabungan cahaya merah dan hijau menghasilkan warna kuning cerah.',
        category: 'Sains Optik'
      }
    ]
  }
];
