import React, { useState, useEffect } from 'react';
import { Player, RoomState } from '../types/quiz';
import { sounds } from '../utils/soundEffects';
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Flame, 
  Trophy, 
  Volume2, 
  VolumeX, 
  Edit3, 
  BarChart3,
  Check
} from 'lucide-react';
import { AVATAR_ICONS, COLOR_THEMES } from './AvatarCustomizer';

interface MobileControllerProps {
  roomState: RoomState;
  currentPlayer: Player;
  onSubmitAnswer: (optionIndex: number, responseTimeMs: number) => void;
  onOpenAvatarEditor: () => void;
  onViewStats: () => void;
  isCompact?: boolean; // For dual simulator view
}

export const MobileController: React.FC<MobileControllerProps> = ({
  roomState,
  currentPlayer,
  onSubmitAnswer,
  onOpenAvatarEditor,
  onViewStats,
  isCompact = false
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [isMuted, setIsMuted] = useState(sounds.getMuted());

  const currentQIndex = roomState.currentQuestionIndex;
  const currentQ = roomState.quiz.questions[currentQIndex];

  // Reset local selected answer when question changes
  useEffect(() => {
    if (roomState.phase === 'QUESTION') {
      setSelectedOption(null);
      setQuestionStartTime(Date.now());
    }
  }, [currentQIndex, roomState.phase]);

  // Handle answer click
  const handleSelectAnswer = (optionIdx: number) => {
    if (selectedOption !== null || roomState.phase !== 'QUESTION') return;
    
    const elapsed = Date.now() - questionStartTime;
    setSelectedOption(optionIdx);
    
    // Play sound and haptic vibration
    sounds.playTap();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([40]);
    }

    onSubmitAnswer(optionIdx, elapsed);
  };

  const toggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  // Controller shapes & colors
  const CONTROLLER_BUTTONS = [
    {
      id: 0,
      label: 'A',
      shape: '▲',
      name: 'Segitiga',
      bg: 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700',
      border: 'border-rose-400',
      activeRing: 'ring-rose-400'
    },
    {
      id: 1,
      label: 'B',
      shape: '◆',
      name: 'Wajik',
      bg: 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700',
      border: 'border-blue-400',
      activeRing: 'ring-blue-400'
    },
    {
      id: 2,
      label: 'C',
      shape: '●',
      name: 'Lingkaran',
      bg: 'bg-amber-600 hover:bg-amber-500 active:bg-amber-700',
      border: 'border-amber-400',
      activeRing: 'ring-amber-400'
    },
    {
      id: 3,
      label: 'D',
      shape: '■',
      name: 'Kotak',
      bg: 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700',
      border: 'border-emerald-400',
      activeRing: 'ring-emerald-400'
    }
  ];

  const currentIcon = AVATAR_ICONS.find(i => i.id === currentPlayer.avatar.iconId) || AVATAR_ICONS[0];
  const currentTheme = COLOR_THEMES.find(t => t.id === currentPlayer.avatar.colorTheme) || COLOR_THEMES[0];

  return (
    <div className={`w-full h-full flex flex-col bg-slate-950 text-slate-100 select-none ${isCompact ? 'text-xs' : ''}`}>
      {/* Top Mobile App Header */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          {/* Avatar Icon */}
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg shadow ${currentTheme.bg}`}>
            <span>{currentIcon.emoji}</span>
          </div>

          <div className="text-left">
            <div className="font-bold text-white text-xs truncate max-w-[120px]">
              {currentPlayer.name}
            </div>
            <div className="text-[10px] text-indigo-400 truncate max-w-[120px]">
              {currentPlayer.avatar.title}
            </div>
          </div>
        </div>

        {/* Right: Score, Streak & Settings */}
        <div className="flex items-center gap-2">
          {currentPlayer.streak > 1 && (
            <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-800 text-amber-400 font-bold text-[10px]">
              <Flame className="w-3 h-3 fill-current" />
              <span>{currentPlayer.streak}x</span>
            </div>
          )}

          <div className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-right">
            <div className="font-mono font-extrabold text-xs text-white">
              {currentPlayer.score.toLocaleString()}
            </div>
            <div className="text-[9px] text-slate-400 leading-none">POIN</div>
          </div>

          <button
            onClick={toggleSound}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Controller Body */}
      <div className="flex-1 flex flex-col p-4 overflow-y-auto">
        {/* ======================================================== */}
        {/* LOBBY STATE */}
        {/* ======================================================== */}
        {roomState.phase === 'LOBBY' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center my-auto p-4">
            <div className="relative mb-4">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-xl border-2 ${currentTheme.bg} ${currentTheme.border}`}>
                <span>{currentIcon.emoji}</span>
              </div>
              <button
                onClick={onOpenAvatarEditor}
                className="absolute -bottom-1 -right-1 bg-slate-900 border border-slate-700 text-slate-200 p-1.5 rounded-full hover:bg-slate-800"
                title="Kustomisasi Avatar"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            </div>

            <h2 className="font-display font-extrabold text-lg text-white">
              Halo, {currentPlayer.name}!
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Kamu telah bergabung di Room <span className="font-mono text-emerald-400 font-bold">{roomState.roomCode}</span>.
            </p>

            <div className="mt-8 p-4 bg-slate-900/80 border border-slate-800 rounded-2xl w-full max-w-xs flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping mb-2" />
              <div className="font-bold text-xs text-white">Menunggu Host Memulai Kuis...</div>
              <div className="text-[11px] text-slate-400 mt-1">
                Perhatikan pertanyaan yang akan muncul di Layar Besar!
              </div>
            </div>

            <button
              onClick={onOpenAvatarEditor}
              className="mt-6 text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 underline"
            >
              <Edit3 className="w-3 h-3" />
              Ubah Karakter & Gelar Avatar
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* QUESTION STATE (ACTIVE CONTROLLER BUZZER) */}
        {/* ======================================================== */}
        {roomState.phase === 'QUESTION' && currentQ && (
          <div className="flex-1 flex flex-col">
            {/* Top Question Indicator */}
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-semibold text-slate-400">
                Soal {currentQIndex + 1} / {roomState.quiz.questions.length}
              </span>
              <div className="flex items-center gap-1 text-slate-300 font-mono">
                <span>⏱️</span>
                <span className={`font-bold ${roomState.timeRemainingSeconds <= 5 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {roomState.timeRemainingSeconds}s
                </span>
              </div>
            </div>

            {/* Answer Locked Overlay or 4 Touch Buttons */}
            {selectedOption !== null ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-900/90 border border-slate-800 rounded-2xl text-center shadow-xl">
                <div className="w-14 h-14 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center text-emerald-400 mb-3 shadow-lg">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="font-display font-bold text-base text-white">
                  Jawaban Terkunci!
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Pilihan: {CONTROLLER_BUTTONS[selectedOption].name} ({CONTROLLER_BUTTONS[selectedOption].shape})
                </p>
                <div className="mt-4 text-[11px] text-slate-500 animate-pulse">
                  Menunggu peserta lain & waktu berakhir...
                </div>
              </div>
            ) : (
              <div className="flex-1 grid grid-cols-2 gap-3">
                {CONTROLLER_BUTTONS.map((btn) => (
                  <button
                    key={btn.id}
                    onClick={() => handleSelectAnswer(btn.id)}
                    className={`rounded-2xl border-2 flex flex-col items-center justify-center p-4 transition-transform active:scale-95 shadow-xl ${btn.bg} ${btn.border}`}
                  >
                    <span className="text-4xl text-white font-black drop-shadow">
                      {btn.shape}
                    </span>
                    <span className="text-xs font-bold text-white/90 mt-1 uppercase tracking-wider">
                      {btn.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* REVEAL STATE (INSTANT FEEDBACK FOR PLAYER) */}
        {/* ======================================================== */}
        {roomState.phase === 'REVEAL' && currentPlayer.lastAnswer && (
          <div className="flex-1 flex flex-col items-center justify-center my-auto p-4 text-center">
            {currentPlayer.lastAnswer.isCorrect ? (
              <div className="w-full bg-emerald-950/40 border-2 border-emerald-500/80 rounded-2xl p-6 shadow-xl">
                <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto mb-2" />
                <h3 className="font-display font-extrabold text-xl text-emerald-300">
                  BENAR SEKALI! 🎉
                </h3>
                <div className="text-2xl font-mono font-black text-white mt-2">
                  +{currentPlayer.lastAnswer.pointsAwarded.toLocaleString()} Poin
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  Kecepatan: {(currentPlayer.lastAnswer.timeElapsedMs / 1000).toFixed(2)} detik
                </div>
              </div>
            ) : (
              <div className="w-full bg-rose-950/40 border-2 border-rose-500/80 rounded-2xl p-6 shadow-xl">
                <XCircle className="w-14 h-14 text-rose-400 mx-auto mb-2" />
                <h3 className="font-display font-extrabold text-xl text-rose-300">
                  KURANG TEPAT! 💡
                </h3>
                <div className="text-lg font-mono font-bold text-slate-400 mt-2">
                  +0 Poin
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  Tetap semangat untuk soal berikutnya!
                </div>
              </div>
            )}

            <div className="mt-6 text-xs text-slate-400">
              Lihat penjelasan lengkap di Layar Besar Host!
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* LEADERBOARD & PODIUM STATES */}
        {/* ======================================================== */}
        {(roomState.phase === 'LEADERBOARD' || roomState.phase === 'PODIUM') && (
          <div className="flex-1 flex flex-col items-center justify-center my-auto p-4 text-center">
            <Trophy className="w-14 h-14 text-amber-400 mb-3 animate-bounce" />
            <div className="text-xs uppercase font-bold text-amber-400 bg-amber-950 px-3 py-1 rounded-full border border-amber-800">
              Peringkat Kamu
            </div>
            <div className="font-display font-black text-4xl text-white mt-2">
              #{currentPlayer.rank || 1}
            </div>
            <div className="font-mono text-base font-bold text-slate-300 mt-1">
              Total: {currentPlayer.score.toLocaleString()} Poin
            </div>

            {roomState.phase === 'PODIUM' && (
              <button
                onClick={onViewStats}
                className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Lihat Statistik & Analitik Saya</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
