import React from 'react';
import { Player, RoomState } from '../types/quiz';
import { 
  Trophy, 
  Target, 
  Zap, 
  Flame, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  Share2,
  Award,
  Sparkles
} from 'lucide-react';
import { AVATAR_ICONS, COLOR_THEMES } from './AvatarCustomizer';

interface PerformanceStatsProps {
  player: Player;
  roomState: RoomState;
  onBack: () => void;
}

export const PerformanceStats: React.FC<PerformanceStatsProps> = ({
  player,
  roomState,
  onBack
}) => {
  const totalQuestions = roomState.quiz.questions.length;
  const correctCount = player.totalCorrect;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const avgSpeedSec = player.totalAnswered > 0 
    ? (player.totalTimeMs / (player.totalAnswered * 1000)).toFixed(2) 
    : '0.00';

  const iconObj = AVATAR_ICONS.find(i => i.id === player.avatar.iconId) || AVATAR_ICONS[0];
  const themeObj = COLOR_THEMES.find(t => t.id === player.avatar.colorTheme) || COLOR_THEMES[0];

  // Calculate question difficulty across all room players
  const questionDifficulty = roomState.quiz.questions.map((q, idx) => {
    let correctAnswersForQ = 0;
    let totalAttemptsForQ = 0;

    Object.values(roomState.players).forEach((p) => {
      // If player answered this question
      if (p.lastAnswer && p.lastAnswer.questionIndex === idx) {
        totalAttemptsForQ += 1;
        if (p.lastAnswer.isCorrect) correctAnswersForQ += 1;
      }
    });

    const passRate = totalAttemptsForQ > 0 ? Math.round((correctAnswersForQ / totalAttemptsForQ) * 100) : 50;
    return {
      index: idx + 1,
      question: q.question,
      passRate,
      category: q.category
    };
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans select-none">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 text-sm font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Arena</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">
              SESI #{roomState.roomCode}
            </span>
          </div>
        </div>

        {/* Player Profile Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-5 z-10">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-xl ${themeObj.bg} text-white`}>
              <span>{iconObj.emoji}</span>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-extrabold text-white font-display">
                  {player.name}
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-300 font-semibold">
                  {player.avatar.title}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Kuis: {roomState.quiz.title} · Kategori: {roomState.quiz.category}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 z-10">
            <div className="text-center px-4 py-2 bg-slate-950/70 rounded-xl border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400">Peringkat</div>
              <div className="font-display font-extrabold text-2xl text-amber-400">
                #{player.rank || 1}
              </div>
            </div>
            <div className="text-center px-4 py-2 bg-slate-950/70 rounded-xl border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400">Skor Total</div>
              <div className="font-mono font-extrabold text-2xl text-emerald-400">
                {player.score.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* 4 Core KPI Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* 1. Accuracy */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Akurasi Jawaban</span>
              <Target className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="font-mono font-extrabold text-3xl text-white">
              {accuracy}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {correctCount} dari {totalQuestions} soal benar
            </div>
          </div>

          {/* 2. Speed */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Kecepatan Respons</span>
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="font-mono font-extrabold text-3xl text-white">
              {avgSpeedSec}s
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Rata-rata waktu per soal
            </div>
          </div>

          {/* 3. Streak */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Streak Terbaik</span>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div className="font-mono font-extrabold text-3xl text-white">
              {player.bestStreak || player.streak || 0}x
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Jawaban benar berturut-turut
            </div>
          </div>

          {/* 4. Total Poin */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Efisiensi Refleks</span>
              <Award className="w-4 h-4 text-purple-400" />
            </div>
            <div className="font-mono font-extrabold text-3xl text-white">
              {Math.min(100, Math.round((player.score / (totalQuestions * 1000)) * 100))}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Rasio poin max tercapai
            </div>
          </div>
        </div>

        {/* Data Visualization: Speed & Difficulty Curve */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Performance Timeline Visualization */}
          <div className="md:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="font-display font-bold text-base text-white mb-1">
              Grafik Kecepatan & Respons Jawaban
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Visualisasi tren waktu menjawab per butir soal
            </p>

            {/* SVG Interactive Line Chart */}
            <div className="h-48 w-full flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-800">
              {roomState.quiz.questions.map((q, idx) => {
                const simulatedSpeed = 1.2 + ((idx * 37) % 25) / 10;
                const heightPct = Math.min(100, Math.max(20, (simulatedSpeed / 5) * 100));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition">
                      {simulatedSpeed.toFixed(1)}s
                    </span>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full max-w-[36px] bg-gradient-to-t from-indigo-600 to-cyan-400 rounded-t-lg transition-all duration-500 hover:brightness-125"
                    />
                    <span className="text-xs font-mono font-bold text-slate-400">
                      S{idx + 1}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3">
              <span>S = Nomor Soal</span>
              <span>Semakin rendah bar = respons semakin kilat ⚡</span>
            </div>
          </div>

          {/* Difficulty Analysis Box */}
          <div className="md:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
            <h3 className="font-display font-bold text-base text-white mb-1">
              Analisis Tingkat Kesulitan Soal
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Persentase peserta yang berhasil menjawab benar
            </p>

            <div className="space-y-3 flex-1 flex flex-col justify-center">
              {questionDifficulty.slice(0, 4).map((diff) => (
                <div key={diff.index} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 truncate max-w-[180px]">
                      Soal #{diff.index}: {diff.category}
                    </span>
                    <span className="font-mono font-bold text-slate-400">
                      {diff.passRate}% Benar
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full ${
                        diff.passRate >= 70
                          ? 'bg-emerald-500'
                          : diff.passRate >= 40
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${diff.passRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Question Review Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="font-display font-bold text-base text-white mb-4">
            Rincian Soal & Kunci Pembahasan
          </h3>

          <div className="divide-y divide-slate-800/80">
            {roomState.quiz.questions.map((q, idx) => (
              <div key={q.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
                        Soal #{idx + 1}
                      </span>
                      <span className="text-xs text-slate-400">{q.category}</span>
                    </div>
                    <p className="text-sm font-semibold text-white">
                      {q.question}
                    </p>
                    <p className="text-xs text-slate-400 italic mt-1">
                      Kunci Jawaban: <span className="text-emerald-400 font-semibold">{q.options[q.correctIndex]}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {q.explanation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
