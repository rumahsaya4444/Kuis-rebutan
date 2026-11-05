import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { QuizSet, RoomState, Player } from '../types/quiz';
import { sounds } from '../utils/soundEffects';
import { 
  Users, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Play, 
  ChevronRight, 
  Trophy, 
  Flame, 
  Copy, 
  Check, 
  BarChart3, 
  RotateCcw,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { AVATAR_ICONS, COLOR_THEMES } from './AvatarCustomizer';

interface HostScreenProps {
  roomState: RoomState;
  onStartGame: () => void;
  onNextQuestion: () => void;
  onShowLeaderboard: () => void;
  onRestartGame: () => void;
  onViewStats: () => void;
  isSimulatorMode?: boolean;
}

export const HostScreen: React.FC<HostScreenProps> = ({
  roomState,
  onStartGame,
  onNextQuestion,
  onShowLeaderboard,
  onRestartGame,
  onViewStats,
  isSimulatorMode = false
}) => {
  const [isMuted, setIsMuted] = useState(sounds.getMuted());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [zoomedMedia, setZoomedMedia] = useState<string | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const playersList: Player[] = Object.values(roomState.players || {});
  const currentQIndex = roomState.currentQuestionIndex;
  const currentQ = roomState.quiz.questions[currentQIndex];

  // Sound mute toggle
  const toggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Generate QR code for mobile joining
  useEffect(() => {
    if (qrCanvasRef.current && roomState.phase === 'LOBBY') {
      const joinUrl = `${window.location.origin}?room=${roomState.roomCode}&mode=player`;
      QRCode.toCanvas(
        qrCanvasRef.current,
        joinUrl,
        {
          width: 140,
          margin: 1,
          color: {
            dark: '#ffffff',
            light: '#0b0f19'
          }
        },
        (error) => {
          if (error) console.error('QR code generation error:', error);
        }
      );
    }
  }, [roomState.roomCode, roomState.phase]);

  // Sound effects on timer tick
  useEffect(() => {
    if (roomState.phase === 'QUESTION' && roomState.timeRemainingSeconds > 0) {
      const isUrgent = roomState.timeRemainingSeconds <= 5;
      sounds.playTick(isUrgent);
    }
  }, [roomState.timeRemainingSeconds, roomState.phase]);

  // Fanfare / confetti on Podium phase
  useEffect(() => {
    if (roomState.phase === 'PODIUM') {
      sounds.playVictory();
      // Launch confetti
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
        setTimeout(() => {
          confetti({
            particleCount: 80,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          });
          confetti({
            particleCount: 80,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          });
        }, 400);
      } catch {
        // ignore
      }
    } else if (roomState.phase === 'LEADERBOARD') {
      sounds.playWhoosh();
    } else if (roomState.phase === 'REVEAL') {
      sounds.playCorrect();
    }
  }, [roomState.phase]);

  const copyJoinLink = () => {
    const url = `${window.location.origin}?room=${roomState.roomCode}&mode=player`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Option colors & Kahoot / Slido shape identifiers
  const OPTION_STYLES = [
    {
      bg: 'bg-rose-600/90 hover:bg-rose-600',
      border: 'border-rose-500',
      badge: 'bg-rose-700 text-white',
      shape: '▲',
      label: 'A'
    },
    {
      bg: 'bg-blue-600/90 hover:bg-blue-600',
      border: 'border-blue-500',
      badge: 'bg-blue-700 text-white',
      shape: '◆',
      label: 'B'
    },
    {
      bg: 'bg-amber-600/90 hover:bg-amber-600',
      border: 'border-amber-500',
      badge: 'bg-amber-700 text-white',
      shape: '●',
      label: 'C'
    },
    {
      bg: 'bg-emerald-600/90 hover:bg-emerald-600',
      border: 'border-emerald-500',
      badge: 'bg-emerald-700 text-white',
      shape: '■',
      label: 'D'
    }
  ];

  // Helper to render avatar badge
  const renderAvatar = (avatar: Player['avatar'], size = 'w-10 h-10 text-xl') => {
    const iconObj = AVATAR_ICONS.find(i => i.id === avatar.iconId) || AVATAR_ICONS[0];
    const themeObj = COLOR_THEMES.find(t => t.id === avatar.colorTheme) || COLOR_THEMES[0];
    return (
      <div className={`relative ${size} rounded-xl flex items-center justify-center font-bold shadow-md ${themeObj.bg} text-white`}>
        <span>{iconObj.emoji}</span>
      </div>
    );
  };

  // Calculate answer distribution percentages
  const totalAnswers = Object.keys(roomState.answersReceived || {}).length;
  const answerCounts = [0, 0, 0, 0];
  Object.values(roomState.answersReceived || {}).forEach((ans) => {
    if (ans.option >= 0 && ans.option < 4) {
      answerCounts[ans.option] += 1;
    }
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      {/* Top Presentation Bar */}
      <header className="h-16 px-6 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-20">
        {/* Left: Brand & PIN */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              KilatQuiz
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-indigo-300 font-medium">
              Layar Besar
            </span>
          </div>

          <div className="h-5 w-px bg-slate-800 hidden sm:block" />

          {/* Game PIN badge */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">PIN ROOM:</span>
            <span className="font-mono font-bold text-lg text-emerald-400 tracking-wider">
              {roomState.roomCode}
            </span>
            <button
              onClick={copyJoinLink}
              title="Salin Tautan Join"
              className="p-1 hover:text-white text-slate-400 transition"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Right: Controls & Player count */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 rounded-lg text-xs font-medium text-slate-300">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-mono tabular-nums">{playersList.length}</span>
            <span>Peserta</span>
          </div>

          <button
            onClick={toggleSound}
            title={isMuted ? 'Nyalakan Suara' : 'Bisukan'}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {!isSimulatorMode && (
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </header>

      {/* Main Screen Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 relative">
        {/* ============================================================ */}
        {/* PHASE 1: LOBBY */}
        {/* ============================================================ */}
        {roomState.phase === 'LOBBY' && (
          <div className="w-full max-w-5xl flex flex-col items-center justify-center text-center my-auto">
            {/* Big Join Header */}
            <div className="mb-8">
              <span className="text-xs uppercase font-bold tracking-widest text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-3 py-1 rounded-full inline-block mb-3">
                Kuis Siap Dimulai
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white font-display">
                {roomState.quiz.title}
              </h1>
              <p className="text-sm md:text-base text-slate-400 mt-2 max-w-xl mx-auto">
                {roomState.quiz.description}
              </p>
            </div>

            {/* Split: QR Code + Join Instructions */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full max-w-3xl items-center bg-slate-900/60 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl mb-10">
              {/* QR Code */}
              <div className="md:col-span-5 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-800 pb-6 md:pb-0 md:pr-6">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl shadow-inner">
                  <canvas ref={qrCanvasRef} className="rounded-lg shadow" />
                </div>
                <span className="text-xs text-slate-400 mt-2">Scan dengan kamera HP untuk masuk</span>
              </div>

              {/* Text Instructions */}
              <div className="md:col-span-7 text-left space-y-4">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Langkah 1: Kunjungi Tautan</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-sm md:text-base font-semibold text-indigo-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 break-all">
                      {window.location.origin}
                    </span>
                    <button
                      onClick={copyJoinLink}
                      className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
                    >
                      {copiedLink ? 'Tersalin!' : 'Salin'}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block font-medium">Langkah 2: Masukkan PIN Kuis</span>
                  <div className="text-3xl md:text-4xl font-extrabold font-mono text-emerald-400 tracking-wider mt-1">
                    {roomState.roomCode}
                  </div>
                </div>

                <div className="pt-2 text-xs text-slate-400">
                  Total Soal: <span className="text-white font-semibold">{roomState.quiz.questions.length} Butir</span> · 
                  Kategori: <span className="text-white font-semibold">{roomState.quiz.category}</span>
                </div>
              </div>
            </div>

            {/* Live Participants Grid */}
            <div className="w-full max-w-4xl mb-8">
              <div className="flex items-center justify-between mb-4 px-2">
                <span className="text-sm font-bold text-slate-300 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  Peserta yang Sudah Bergabung ({playersList.length})
                </span>
                {playersList.length === 0 && (
                  <span className="text-xs text-amber-400 animate-pulse">
                    Menunggu peserta pertama masuk...
                  </span>
                )}
              </div>

              {playersList.length === 0 ? (
                <div className="py-12 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-500">
                  <Sparkles className="w-8 h-8 text-slate-600 mb-2 animate-bounce" />
                  <p className="text-sm">Scan QR Code di atas atau buka tab baru untuk bergabung sebagai peserta!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {playersList.map((player) => (
                    <div
                      key={player.id}
                      className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center gap-2.5 shadow-lg transform transition hover:-translate-y-1"
                    >
                      {renderAvatar(player.avatar, 'w-9 h-9 text-lg shrink-0')}
                      <div className="min-w-0 text-left">
                        <div className="text-xs font-bold text-white truncate">{player.name}</div>
                        <div className="text-[10px] text-indigo-400 truncate">{player.avatar.title}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Start Button */}
            <button
              onClick={onStartGame}
              disabled={playersList.length === 0}
              className={`px-8 py-3.5 rounded-2xl font-display font-extrabold text-lg flex items-center gap-3 transition shadow-xl ${
                playersList.length > 0
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/20 transform hover:-translate-y-0.5'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Play className="w-5 h-5 fill-current" />
              Mulai Kuis Sekarang ({playersList.length} Peserta)
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* PHASE 2: QUESTION */}
        {/* ============================================================ */}
        {roomState.phase === 'QUESTION' && currentQ && (
          <div className="w-full max-w-5xl flex flex-col my-auto">
            {/* Top Question Info & Timer Bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <span className="px-2.5 py-1 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                  Soal {currentQIndex + 1} / {roomState.quiz.questions.length}
                </span>
                <span>·</span>
                <span>{currentQ.category}</span>
                <span>·</span>
                <span className="text-amber-400">Max 1000 Poin</span>
              </div>

              {/* Answers count status */}
              <div className="flex items-center gap-2 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
                <span className="font-mono text-emerald-400 font-bold">{totalAnswers}</span>
                <span>dari {playersList.length} Menjawab</span>
              </div>
            </div>

            {/* Question Text */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl mb-6">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white text-center font-display tracking-tight leading-snug">
                {currentQ.question}
              </h2>
            </div>

            {/* Center Area: Media + Big Countdown Circle */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mb-6">
              {/* Media Viewport (Image or Video) */}
              <div className={`md:col-span-9 flex items-center justify-center bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden relative min-h-[240px] md:h-[300px]`}>
                {currentQ.mediaType === 'image' && currentQ.mediaUrl ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={currentQ.mediaUrl}
                      alt="Soal Kuis Visual"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                    <button
                      onClick={() => setZoomedMedia(currentQ.mediaUrl || null)}
                      className="absolute top-3 right-3 bg-slate-950/70 hover:bg-slate-950 text-white p-2 rounded-lg text-xs flex items-center gap-1.5 transition backdrop-blur-sm"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      Perbesar
                    </button>
                  </div>
                ) : currentQ.mediaType === 'video' && currentQ.videoUrl ? (
                  <div className="w-full h-full relative flex items-center justify-center bg-black">
                    <video
                      src={currentQ.videoUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute bottom-2 left-3 text-[11px] bg-slate-950/80 px-2 py-0.5 rounded text-slate-300">
                      Klip Video Kuis
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
                    <Sparkles className="w-12 h-12 text-indigo-400 mb-2 opacity-60" />
                    <p className="text-sm font-medium text-slate-300">Pilih jawaban paling tepat secepat mungkin di layar ponselmu!</p>
                  </div>
                )}
              </div>

              {/* Big Circular Countdown Timer */}
              <div className="md:col-span-3 flex flex-col items-center justify-center p-6 bg-slate-900/60 rounded-2xl border border-slate-800">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      className="stroke-slate-800"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      className={`transition-all duration-1000 ${
                        roomState.timeRemainingSeconds <= 5
                          ? 'stroke-rose-500 animate-pulse'
                          : 'stroke-indigo-500'
                      }`}
                      strokeWidth="8"
                      strokeDasharray={264}
                      strokeDashoffset={264 - (264 * roomState.timeRemainingSeconds) / currentQ.timeLimitSeconds}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span
                      className={`font-mono text-3xl font-extrabold ${
                        roomState.timeRemainingSeconds <= 5 ? 'text-rose-400 animate-ping' : 'text-white'
                      }`}
                    >
                      {roomState.timeRemainingSeconds}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Detik</span>
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-400 text-center font-medium">
                  {roomState.timeRemainingSeconds <= 5 ? 'Waktu Hampir Habis!' : 'Hitung Mundur'}
                </div>
              </div>
            </div>

            {/* 4 Large Options (Kahoot / Slido Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentQ.options.map((optionText, idx) => {
                const style = OPTION_STYLES[idx];
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border-2 flex items-center gap-4 transition shadow-lg ${style.bg} ${style.border}`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-black/30 flex items-center justify-center text-white font-bold text-lg shrink-0">
                      <span>{style.shape}</span>
                    </div>
                    <span className="text-lg font-bold text-white leading-tight">
                      {optionText}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* PHASE 3: REVEAL */}
        {/* ============================================================ */}
        {roomState.phase === 'REVEAL' && currentQ && (
          <div className="w-full max-w-4xl flex flex-col my-auto">
            <div className="text-center mb-6">
              <span className="text-xs uppercase font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-3 py-1 rounded-full">
                Kunci Jawaban Resmi
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-3 font-display">
                {currentQ.question}
              </h2>
            </div>

            {/* Answer Distribution Bars (Slido Style) */}
            <div className="space-y-3 mb-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Distribusi Jawaban Peserta
              </div>

              {currentQ.options.map((optionText, idx) => {
                const isCorrect = idx === currentQ.correctIndex;
                const count = answerCounts[idx];
                const percentage = totalAnswers > 0 ? Math.round((count / totalAnswers) * 100) : 0;
                const style = OPTION_STYLES[idx];

                return (
                  <div
                    key={idx}
                    className={`relative overflow-hidden rounded-xl border p-3.5 transition ${
                      isCorrect
                        ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/50'
                        : 'bg-slate-950/40 border-slate-800'
                    }`}
                  >
                    {/* Percentage Fill Bar */}
                    <div
                      className={`absolute left-0 top-0 bottom-0 opacity-20 transition-all duration-1000 ${
                        isCorrect ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />

                    <div className="relative flex items-center justify-between z-10">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-md bg-black/40 flex items-center justify-center font-bold text-sm">
                          {style.shape}
                        </span>
                        <span className={`text-base font-bold ${isCorrect ? 'text-emerald-300' : 'text-slate-300'}`}>
                          {optionText}
                        </span>
                        {isCorrect && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-display">
                            BENAR ✓
                          </span>
                        )}
                      </div>

                      <div className="font-mono text-sm font-bold text-slate-300">
                        {percentage}% ({count} suara)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Explanation Trivia Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-8 text-left">
              <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Fakta & Penjelasan Trivia
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {currentQ.explanation}
              </p>
            </div>

            {/* Advance Button */}
            <div className="flex justify-center">
              <button
                onClick={onShowLeaderboard}
                className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-display font-extrabold text-base shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition transform hover:-translate-y-0.5"
              >
                <span>Lihat Papan Skor Langsung</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* PHASE 4: LEADERBOARD */}
        {/* ============================================================ */}
        {roomState.phase === 'LEADERBOARD' && (
          <div className="w-full max-w-3xl flex flex-col my-auto">
            <div className="text-center mb-8">
              <span className="text-xs uppercase font-bold text-amber-400 bg-amber-950/80 border border-amber-800 px-3 py-1 rounded-full">
                Klasemen Sementara
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-3 font-display">
                Papan Skor Langsung
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Soal {currentQIndex + 1} dari {roomState.quiz.questions.length} selesai
              </p>
            </div>

            {/* Leaderboard Table */}
            <div className="space-y-3 mb-8">
              {playersList
                .sort((a, b) => b.score - a.score)
                .slice(0, 5)
                .map((player, idx) => {
                  const rank = idx + 1;
                  const isTop3 = rank <= 3;
                  const rankDelta = (player.previousRank || rank) - rank;

                  return (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition shadow-lg ${
                        rank === 1
                          ? 'bg-amber-950/30 border-amber-500/80 ring-1 ring-amber-500/50'
                          : rank === 2
                          ? 'bg-slate-800/80 border-slate-600'
                          : rank === 3
                          ? 'bg-orange-950/30 border-orange-700/60'
                          : 'bg-slate-900/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Rank Position */}
                        <div className="w-8 flex flex-col items-center justify-center">
                          <span
                            className={`font-display font-extrabold text-lg ${
                              rank === 1
                                ? 'text-amber-400'
                                : rank === 2
                                ? 'text-slate-300'
                                : rank === 3
                                ? 'text-orange-400'
                                : 'text-slate-500'
                            }`}
                          >
                            #{rank}
                          </span>
                          {rankDelta > 0 && (
                            <span className="text-[10px] text-emerald-400 font-bold">▲ +{rankDelta}</span>
                          )}
                          {rankDelta < 0 && (
                            <span className="text-[10px] text-rose-400 font-bold">▼ {rankDelta}</span>
                          )}
                        </div>

                        {/* Avatar */}
                        {renderAvatar(player.avatar, 'w-11 h-11 text-2xl')}

                        {/* Player Name & Streak */}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-base">{player.name}</span>
                            {player.streak >= 2 && (
                              <span className="flex items-center gap-0.5 text-xs font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800">
                                <Flame className="w-3.5 h-3.5 fill-current" />
                                {player.streak}x
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-indigo-400">{player.avatar.title}</span>
                        </div>
                      </div>

                      {/* Points */}
                      <div className="text-right">
                        <div className="font-mono font-extrabold text-2xl text-white">
                          {player.score.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-slate-400">POIN</div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Next Action Button */}
            <div className="flex justify-center">
              <button
                onClick={onNextQuestion}
                className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-display font-extrabold text-base shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition transform hover:-translate-y-0.5"
              >
                <span>
                  {currentQIndex + 1 < roomState.quiz.questions.length ? 'Lanjut ke Soal Berikutnya' : 'Lihat Podium Juara 🏆'}
                </span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* PHASE 5: PODIUM */}
        {/* ============================================================ */}
        {roomState.phase === 'PODIUM' && (
          <div className="w-full max-w-4xl flex flex-col items-center justify-center my-auto text-center">
            <span className="text-xs uppercase font-bold text-amber-400 bg-amber-950/80 border border-amber-800 px-4 py-1.5 rounded-full">
              Kuis Selesai!
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white mt-3 font-display tracking-tight">
              Podium Para Juara
            </h1>
            <p className="text-sm text-slate-400 mt-1 mb-10">
              Selamat kepada para penakluk soal tercepat dan terakurat!
            </p>

            {/* 3D Pedestal Podium for Top 3 */}
            {(() => {
              const sorted = [...playersList].sort((a, b) => b.score - a.score);
              const first = sorted[0];
              const second = sorted[1];
              const third = sorted[2];

              return (
                <div className="flex items-end justify-center gap-4 sm:gap-8 w-full max-w-2xl mb-12">
                  {/* 2nd Place (Silver) */}
                  {second ? (
                    <div className="flex-1 flex flex-col items-center">
                      <div className="mb-3 transform hover:scale-105 transition">
                        {renderAvatar(second.avatar, 'w-16 h-16 text-3xl')}
                      </div>
                      <div className="font-bold text-white text-sm truncate max-w-[120px]">{second.name}</div>
                      <div className="font-mono text-xs text-slate-300 font-semibold mb-2">
                        {second.score.toLocaleString()} Poin
                      </div>
                      <div className="w-full h-36 bg-gradient-to-t from-slate-800 to-slate-700 rounded-t-2xl border-t-4 border-slate-400 flex flex-col items-center justify-center shadow-xl">
                        <span className="font-display font-black text-4xl text-slate-300">2</span>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Perak</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 h-28" />
                  )}

                  {/* 1st Place (Gold) */}
                  {first ? (
                    <div className="flex-1 flex flex-col items-center -mt-6">
                      <div className="mb-2 relative">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-amber-400">
                          <Trophy className="w-8 h-8 fill-current drop-shadow-md animate-bounce" />
                        </div>
                        {renderAvatar(first.avatar, 'w-20 h-20 text-4xl ring-4 ring-amber-400 shadow-2xl')}
                      </div>
                      <div className="font-extrabold text-white text-base truncate max-w-[140px] mt-1">{first.name}</div>
                      <div className="font-mono text-sm text-amber-300 font-bold mb-2">
                        {first.score.toLocaleString()} Poin
                      </div>
                      <div className="w-full h-48 bg-gradient-to-t from-amber-900/90 to-amber-600 rounded-t-2xl border-t-4 border-amber-300 flex flex-col items-center justify-center shadow-2xl shadow-amber-500/20">
                        <span className="font-display font-black text-5xl text-amber-100">1</span>
                        <span className="text-[11px] uppercase font-black text-amber-200">Juara Emas</span>
                      </div>
                    </div>
                  ) : null}

                  {/* 3rd Place (Bronze) */}
                  {third ? (
                    <div className="flex-1 flex flex-col items-center">
                      <div className="mb-3 transform hover:scale-105 transition">
                        {renderAvatar(third.avatar, 'w-14 h-14 text-2xl')}
                      </div>
                      <div className="font-bold text-white text-sm truncate max-w-[120px]">{third.name}</div>
                      <div className="font-mono text-xs text-slate-300 font-semibold mb-2">
                        {third.score.toLocaleString()} Poin
                      </div>
                      <div className="w-full h-28 bg-gradient-to-t from-orange-950 to-orange-800 rounded-t-2xl border-t-4 border-orange-500 flex flex-col items-center justify-center shadow-xl">
                        <span className="font-display font-black text-3xl text-orange-200">3</span>
                        <span className="text-[10px] uppercase font-bold text-orange-300">Perunggu</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 h-20" />
                  )}
                </div>
              );
            })()}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={onViewStats}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 border border-slate-700 transition"
              >
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                <span>Statistik Analitik Komprehensif</span>
              </button>

              <button
                onClick={onRestartGame}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Mainkan Kuis Lagi</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modal Zoom Media */}
      {zoomedMedia && (
        <div
          onClick={() => setZoomedMedia(null)}
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6 cursor-zoom-out"
        >
          <img
            src={zoomedMedia}
            alt="Perbesaran Media"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
