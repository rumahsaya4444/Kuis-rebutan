import React, { useState } from 'react';
import { QuizSet, QuizQuestion, MediaKind } from '../types/quiz';
import { Plus, Trash2, Image, Video, Sparkles, X, Check } from 'lucide-react';

interface QuizCreatorModalProps {
  onSaveQuiz: (newQuiz: QuizSet) => void;
  onClose: () => void;
}

export const QuizCreatorModal: React.FC<QuizCreatorModalProps> = ({
  onSaveQuiz,
  onClose
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Trivia Umum');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: 'q-custom-1',
      question: 'Apa ibukota negara Indonesia saat ini?',
      mediaType: 'none',
      options: ['DKI Jakarta', 'Nusantara (IKN)', 'Surabaya', 'Bandung'],
      correctIndex: 0,
      timeLimitSeconds: 15,
      explanation: 'DKI Jakarta saat ini masih berfungsi sebagai ibukota negara selama masa transisi ke IKN Nusantara.',
      category: 'Geografi'
    }
  ]);

  const addQuestion = () => {
    const newQ: QuizQuestion = {
      id: 'q-custom-' + Date.now(),
      question: '',
      mediaType: 'none',
      options: ['', '', '', ''],
      correctIndex: 0,
      timeLimitSeconds: 15,
      explanation: '',
      category
    };
    setQuestions([...questions, newQ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, idx) => idx !== index));
  };

  const updateQuestion = (index: number, updates: Partial<QuizQuestion>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const updated = [...questions];
    const newOptions = [...updated[qIndex].options] as [string, string, string, string];
    newOptions[optIndex] = value;
    updated[qIndex].options = newOptions;
    setQuestions(updated);
  };

  const handleSave = () => {
    if (!title.trim()) return;

    const newQuizSet: QuizSet = {
      id: 'custom-' + Date.now(),
      title: title.trim(),
      description: description.trim() || 'Kuis kustom buatan pengguna',
      category,
      difficulty: 'Menengah',
      createdDate: new Date().toISOString().split('T')[0],
      isCustom: true,
      questions
    };

    onSaveQuiz(newQuizSet);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-100 max-h-[90vh] flex flex-col relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-6 shrink-0">
          <div className="p-3 bg-indigo-950 border border-indigo-800 rounded-2xl text-indigo-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-display text-white">
              Buat Paket Kuis Baru
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Rancang soal interaktif lengkap dengan media gambar, video, dan pembahasan.
            </p>
          </div>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Judul Kuis</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Kuis Cerdas Cermat Sains 2026"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
              >
                <option value="Budaya & Alam">Budaya & Alam</option>
                <option value="Sains & Teknologi">Sains & Teknologi</option>
                <option value="Logika & Refleks">Logika & Refleks</option>
                <option value="Trivia Umum">Trivia Umum</option>
                <option value="Musik & Seni">Musik & Seni</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1">Deskripsi Singkat</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi kuis untuk peserta di lobby"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Daftar Butir Soal ({questions.length})
              </span>
              <button
                onClick={addQuestion}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Soal</span>
              </button>
            </div>

            {questions.map((q, qIdx) => (
              <div key={q.id} className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-4 relative">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-mono font-bold text-xs text-indigo-400">
                    Soal #{qIdx + 1}
                  </span>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(qIdx)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                      title="Hapus Soal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Question Input */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Teks Pertanyaan</label>
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => updateQuestion(qIdx, { question: e.target.value })}
                    placeholder="Ketikkan teks soal di sini..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>

                {/* Media Selector & Time Limit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Tipe Media</label>
                    <select
                      value={q.mediaType}
                      onChange={(e) => updateQuestion(qIdx, { mediaType: e.target.value as MediaKind })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                    >
                      <option value="none">Tanpa Media (Teks Saja)</option>
                      <option value="image">Gambar / Foto</option>
                      <option value="video">Video Singkat</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Batas Waktu (Detik)</label>
                    <select
                      value={q.timeLimitSeconds}
                      onChange={(e) => updateQuestion(qIdx, { timeLimitSeconds: parseInt(e.target.value, 10) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                    >
                      <option value={10}>10 Detik (Super Kilat)</option>
                      <option value={15}>15 Detik (Standar)</option>
                      <option value={20}>20 Detik</option>
                      <option value={30}>30 Detik (Analisis)</option>
                    </select>
                  </div>
                </div>

                {/* Media URL if chosen */}
                {q.mediaType === 'image' && (
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">URL Gambar (HTTPS)</label>
                    <input
                      type="text"
                      value={q.mediaUrl || ''}
                      onChange={(e) => updateQuestion(qIdx, { mediaUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                )}

                {q.mediaType === 'video' && (
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">URL Video Singkat (MP4/WebM)</label>
                    <input
                      type="text"
                      value={q.videoUrl || ''}
                      onChange={(e) => updateQuestion(qIdx, { videoUrl: e.target.value })}
                      placeholder="https://... (contoh: Google Cloud Storage video)"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                )}

                {/* 4 Options Grid */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">
                    4 Opsi Jawaban (Pilih radio untuk jawaban yang benar)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5">
                        <input
                          type="radio"
                          name={`correct-${q.id}`}
                          checked={q.correctIndex === optIdx}
                          onChange={() => updateQuestion(qIdx, { correctIndex: optIdx })}
                          className="accent-emerald-500 w-4 h-4 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => updateOption(qIdx, optIdx, e.target.value)}
                          placeholder={`Pilihan ${String.fromCharCode(65 + optIdx)}`}
                          className="w-full bg-transparent text-xs text-white focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Penjelasan Kunci Jawaban</label>
                  <input
                    type="text"
                    value={q.explanation}
                    onChange={(e) => updateQuestion(qIdx, { explanation: e.target.value })}
                    placeholder="Penjelasan trivia yang muncul setelah reveal..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition"
          >
            <Check className="w-4 h-4" />
            <span>Simpan Paket Kuis</span>
          </button>
        </div>
      </div>
    </div>
  );
};
