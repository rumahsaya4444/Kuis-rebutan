/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  QuizSet, 
  RoomState, 
  Player, 
  PlayerAvatar, 
  UserAccountProfile, 
  FriendChallenge 
} from './types/quiz';
import { DEFAULT_QUIZZES } from './data/defaultQuizzes';
import { HostScreen } from './components/HostScreen';
import { MobileController } from './components/MobileController';
import { DualSimulatorView } from './components/DualSimulatorView';
import { PerformanceStats } from './components/PerformanceStats';
import { GlobalLeaderboard } from './components/GlobalLeaderboard';
import { FriendChallenges } from './components/FriendChallenges';
import { AccountSyncModal } from './components/AccountSyncModal';
import { QuizCreatorModal } from './components/QuizCreatorModal';
import { PhpExportModal } from './components/PhpExportModal';
import { AvatarCustomizer, AVATAR_ICONS, COLOR_THEMES } from './components/AvatarCustomizer';
import { 
  Play, 
  Smartphone, 
  Trophy, 
  Swords, 
  RefreshCw, 
  Plus, 
  Moon, 
  Sun, 
  Tv, 
  Users, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  ChevronRight,
  ExternalLink,
  Flame,
  Check
} from 'lucide-react';

type AppMode = 'HOME' | 'HOST' | 'CONTROLLER' | 'SIMULATOR' | 'STATS' | 'LEADERBOARD';

export default function App() {
  // Theme state: dark / light
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
  });

  // Current App View Mode
  const [mode, setMode] = useState<AppMode>('HOME');

  // Modals state
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarModalTarget, setAvatarModalTarget] = useState<'player1' | 'player2'>('player1');
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showChallengesModal, setShowChallengesModal] = useState(false);
  const [showCreatorModal, setShowCreatorModal] = useState(false);
  const [showPhpModal, setShowPhpModal] = useState(false);

  // Incoming Challenge Toast
  const [incomingChallenge, setIncomingChallenge] = useState<FriendChallenge | null>(null);

  // Available Quizzes (Built-in + Custom)
  const [quizList, setQuizList] = useState<QuizSet[]>(DEFAULT_QUIZZES);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizSet>(DEFAULT_QUIZZES[0]);

  // Join PIN Input on Home
  const [pinInput, setPinInput] = useState('');
  const [playerNameInput, setPlayerNameInput] = useState('Pemain_1');

  // Current User Account Profile
  const [profile, setProfile] = useState<UserAccountProfile>(() => {
    const saved = localStorage.getItem('kilatquiz_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {
      id: 'usr-' + Math.random().toString(36).substring(2, 8),
      syncToken: 'KZ-' + Math.floor(1000 + Math.random() * 9000),
      name: 'Pemain_1',
      avatar: {
        iconId: 'cat',
        colorTheme: 'amber',
        accessory: 'crown',
        title: 'Si Kilat ⚡'
      },
      stats: {
        totalGames: 14,
        totalWins: 9,
        totalPoints: 12450,
        highestStreak: 6,
        accuracyRate: 88
      },
      achievements: [
        { id: 'ach-1', title: 'Refleks Cahaya', description: 'Menjawab dalam waktu < 1 detik', icon: '⚡' },
        { id: 'ach-2', title: 'Streak Master', description: 'Mencapai 5x streak beruntun', icon: '🔥' }
      ],
      customQuizzes: []
    };
  });

  // Simulator Player 2 Profile
  const [player2Profile, setPlayer2Profile] = useState<Player>({
    id: 'sim-player-2',
    name: 'Siti_Quantum',
    avatar: {
      iconId: 'owl',
      colorTheme: 'indigo',
      accessory: 'glasses',
      title: 'Juara Galaksi 🌌'
    },
    score: 0,
    streak: 0,
    bestStreak: 0,
    totalCorrect: 0,
    totalAnswered: 0,
    totalTimeMs: 0,
    isReady: true,
    rank: 2
  });

  // Authoritative Room State
  const [roomState, setRoomState] = useState<RoomState>({
    roomCode: '784-219',
    hostId: 'host-main',
    quiz: DEFAULT_QUIZZES[0],
    phase: 'LOBBY',
    currentQuestionIndex: 0,
    timeRemainingSeconds: 15,
    questionStartTime: 0,
    players: {},
    answersReceived: {}
  });

  // WebSocket Ref
  const wsRef = useRef<WebSocket | null>(null);

  // Sync theme with document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Save profile to localStorage on updates
  useEffect(() => {
    localStorage.setItem('kilatquiz_profile', JSON.stringify(profile));
  }, [profile]);

  // Check URL query parameters for direct mobile join: ?room=123456&mode=player
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    const modeParam = params.get('mode');

    if (roomParam) {
      setPinInput(roomParam);
      if (modeParam === 'player') {
        joinRoomAsController(roomParam);
      }
    }
  }, []);

  // Connect WebSocket to backend server
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    let ws: WebSocket;
    try {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        // Connected to server
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'ROOM_CREATED' || msg.type === 'PLAYER_JOINED' || msg.type === 'GAME_STARTED' || msg.type === 'PHASE_CHANGED') {
            if (msg.state) setRoomState(msg.state);
          } else if (msg.type === 'TIMER_TICK') {
            setRoomState(prev => ({
              ...prev,
              timeRemainingSeconds: msg.timeRemaining
            }));
          } else if (msg.type === 'ANSWER_RECEIVED') {
            // Updated total answers
          } else if (msg.type === 'NEW_CHALLENGE') {
            setIncomingChallenge(msg.challenge);
          }
        } catch {
          // ignore
        }
      };

      ws.onerror = () => {
        // Fallback gracefully to client state
      };
    } catch {
      // ignore
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Helper to send message via WS
  const sendWs = (payload: object) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  };

  // Launch Host Mode (Big Screen)
  const startHostMode = (quizToUse = selectedQuiz) => {
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    const formattedCode = `${randomCode.substring(0, 3)}-${randomCode.substring(3)}`;

    const newRoomState: RoomState = {
      roomCode: formattedCode,
      hostId: 'host-' + Date.now(),
      quiz: quizToUse,
      phase: 'LOBBY',
      currentQuestionIndex: 0,
      timeRemainingSeconds: quizToUse.questions[0]?.timeLimitSeconds || 15,
      questionStartTime: 0,
      players: {},
      answersReceived: {}
    };

    setRoomState(newRoomState);
    sendWs({ type: 'CREATE_ROOM', roomCode: formattedCode, quiz: quizToUse });
    setMode('HOST');
  };

  // Launch Dual Simulator Mode (Host + 2 Mobile Controllers side-by-side)
  const startSimulatorMode = (quizToUse = selectedQuiz) => {
    const formattedCode = '882-140';

    const p1: Player = {
      id: profile.id,
      name: profile.name,
      avatar: profile.avatar,
      score: 0,
      streak: 0,
      bestStreak: 0,
      totalCorrect: 0,
      totalAnswered: 0,
      totalTimeMs: 0,
      isReady: true,
      rank: 1
    };

    const p2: Player = {
      id: 'sim-p2',
      name: 'Dimas_Cyber',
      avatar: { iconId: 'bot', colorTheme: 'cyan', accessory: 'glasses', title: 'Detektif Waktu ⏳' },
      score: 0,
      streak: 0,
      bestStreak: 0,
      totalCorrect: 0,
      totalAnswered: 0,
      totalTimeMs: 0,
      isReady: true,
      rank: 2
    };

    const newRoomState: RoomState = {
      roomCode: formattedCode,
      hostId: 'host-sim',
      quiz: quizToUse,
      phase: 'LOBBY',
      currentQuestionIndex: 0,
      timeRemainingSeconds: quizToUse.questions[0]?.timeLimitSeconds || 15,
      questionStartTime: 0,
      players: {
        [p1.id]: p1,
        [p2.id]: p2
      },
      answersReceived: {}
    };

    setRoomState(newRoomState);
    sendWs({ type: 'CREATE_ROOM', roomCode: formattedCode, quiz: quizToUse });
    sendWs({ type: 'JOIN_ROOM', roomCode: formattedCode, player: p1 });
    sendWs({ type: 'JOIN_ROOM', roomCode: formattedCode, player: p2 });

    setMode('SIMULATOR');
  };

  // Join room as mobile participant
  const joinRoomAsController = (codeToJoin = pinInput) => {
    const cleanCode = codeToJoin.trim();
    if (!cleanCode) return;

    const currentPlayer: Player = {
      id: profile.id,
      name: profile.name,
      avatar: profile.avatar,
      score: 0,
      streak: 0,
      bestStreak: 0,
      totalCorrect: 0,
      totalAnswered: 0,
      totalTimeMs: 0,
      isReady: true,
      rank: 1
    };

    // Update room players locally
    setRoomState(prev => ({
      ...prev,
      roomCode: cleanCode,
      players: {
        ...prev.players,
        [currentPlayer.id]: currentPlayer
      }
    }));

    sendWs({
      type: 'JOIN_ROOM',
      roomCode: cleanCode,
      player: currentPlayer
    });

    setMode('CONTROLLER');
  };

  // Start the Quiz Game
  const handleStartGame = () => {
    sendWs({ type: 'START_GAME' });

    // Fallback timer simulation if running offline/local
    setRoomState(prev => {
      const q = prev.quiz.questions[0];
      return {
        ...prev,
        phase: 'QUESTION',
        currentQuestionIndex: 0,
        timeRemainingSeconds: q.timeLimitSeconds,
        questionStartTime: Date.now(),
        answersReceived: {}
      };
    });
  };

  // Advance to reveal or next question
  const handleNextQuestion = () => {
    sendWs({ type: 'NEXT_QUESTION' });

    setRoomState(prev => {
      const nextIdx = prev.currentQuestionIndex + 1;
      if (nextIdx < prev.quiz.questions.length) {
        const nextQ = prev.quiz.questions[nextIdx];
        return {
          ...prev,
          phase: 'QUESTION',
          currentQuestionIndex: nextIdx,
          timeRemainingSeconds: nextQ.timeLimitSeconds,
          questionStartTime: Date.now(),
          answersReceived: {}
        };
      } else {
        return {
          ...prev,
          phase: 'PODIUM'
        };
      }
    });
  };

  // Show Leaderboard
  const handleShowLeaderboard = () => {
    sendWs({ type: 'SHOW_LEADERBOARD' });
    setRoomState(prev => ({
      ...prev,
      phase: 'LEADERBOARD'
    }));
  };

  // Restart Quiz
  const handleRestartGame = () => {
    setRoomState(prev => ({
      ...prev,
      phase: 'LOBBY',
      currentQuestionIndex: 0,
      answersReceived: {},
      players: Object.fromEntries(
        Object.entries(prev.players).map(([id, p]) => [
          id,
          { ...p, score: 0, streak: 0, totalCorrect: 0, totalAnswered: 0, lastAnswer: undefined }
        ])
      )
    }));
  };

  // Submit Answer from Controller
  const handleSubmitAnswer = (playerId: string, optionIdx: number, elapsedMs: number) => {
    sendWs({
      type: 'SUBMIT_ANSWER',
      option: optionIdx,
      timeElapsedMs: elapsedMs
    });

    // Client-side state calculation
    setRoomState(prev => {
      const currentQ = prev.quiz.questions[prev.currentQuestionIndex];
      const isCorrect = optionIdx === currentQ.correctIndex;
      const player = prev.players[playerId];

      if (!player) return prev;

      const newAnswers = {
        ...prev.answersReceived,
        [playerId]: { option: optionIdx, timeElapsedMs: elapsedMs, points: isCorrect ? 900 : 0 }
      };

      const updatedPlayer: Player = {
        ...player,
        totalAnswered: player.totalAnswered + 1,
        totalCorrect: isCorrect ? player.totalCorrect + 1 : player.totalCorrect,
        streak: isCorrect ? player.streak + 1 : 0,
        score: isCorrect ? player.score + 900 : player.score,
        lastAnswer: {
          questionIndex: prev.currentQuestionIndex,
          selectedOption: optionIdx,
          isCorrect,
          pointsAwarded: isCorrect ? 900 : 0,
          timeElapsedMs: elapsedMs
        }
      };

      const updatedPlayers = {
        ...prev.players,
        [playerId]: updatedPlayer
      };

      // Check if all players in room answered
      const allAnswered = Object.keys(updatedPlayers).every(id => newAnswers[id] !== undefined);

      return {
        ...prev,
        answersReceived: newAnswers,
        players: updatedPlayers,
        phase: allAnswered ? 'REVEAL' : prev.phase
      };
    });
  };

  // Save customized avatar
  const handleSaveAvatar = (newAvatar: PlayerAvatar, newName: string) => {
    setProfile(prev => ({
      ...prev,
      name: newName,
      avatar: newAvatar
    }));

    if (avatarModalTarget === 'player2') {
      setPlayer2Profile(prev => ({
        ...prev,
        name: newName,
        avatar: newAvatar
      }));
    }

    setShowAvatarModal(false);
  };

  // Save user created quiz
  const handleSaveNewQuiz = (newQuiz: QuizSet) => {
    setQuizList(prev => [newQuiz, ...prev]);
    setSelectedQuiz(newQuiz);
    setShowCreatorModal(false);
  };

  // Render current player for controller
  const currentPlayerObj = roomState.players[profile.id] || {
    id: profile.id,
    name: profile.name,
    avatar: profile.avatar,
    score: 0,
    streak: 0,
    bestStreak: 0,
    totalCorrect: 0,
    totalAnswered: 0,
    totalTimeMs: 0,
    rank: 1
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      {/* ============================================================ */}
      {/* 1. TOP BAR CONTRACT */}
      {/* [Brand, one line] — [4–5 nav links, single-line] — [1 primary action] */}
      {/* ============================================================ */}
      {mode === 'HOME' && (
        <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => setMode('HOME')}
            className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent whitespace-nowrap shrink-0 font-display"
          >
            KilatQuiz
          </button>

          {/* Zone 2: 4 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <button
              onClick={() => {
                const el = document.getElementById('katalog-kuis');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Kuis Pilihan
            </button>
            <button
              onClick={() => setMode('LEADERBOARD')}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Papan Peringkat Global
            </button>
            <button
              onClick={() => setShowChallengesModal(true)}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Tantangan Teman (1v1)
            </button>
            <button
              onClick={() => setShowSyncModal(true)}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Sinkronisasi Akun
            </button>
            <button
              onClick={() => setShowPhpModal(true)}
              className="text-amber-400 hover:text-amber-300 font-bold transition-colors whitespace-nowrap shrink-0 flex items-center gap-1"
            >
              <span>🐘 Versi PHP & aaPanel</span>
            </button>
          </nav>

          {/* Zone 3: 1 primary action (+ Theme toggle) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>

            <button
              onClick={() => startHostMode()}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition whitespace-nowrap shrink-0 flex items-center gap-2"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Buka Layar Besar</span>
            </button>
          </div>
        </header>
      )}

      {/* Incoming Challenge Toast Notification */}
      {incomingChallenge && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-gradient-to-r from-indigo-950 to-slate-900 border-2 border-indigo-500 rounded-2xl p-4 shadow-2xl animate-float flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-xl shrink-0">
            ⚔️
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-white">
              Tantangan Duel dari {incomingChallenge.senderName}!
            </div>
            <div className="text-[11px] text-slate-300 truncate">
              {incomingChallenge.quizTitle}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => {
                  joinRoomAsController(incomingChallenge.roomCode);
                  setIncomingChallenge(null);
                }}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition"
              >
                Terima Duel
              </button>
              <button
                onClick={() => setIncomingChallenge(null)}
                className="px-2.5 py-1 text-slate-400 hover:text-slate-200 text-xs font-semibold"
              >
                Tolak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* VIEW: HOME LANDING PAGE */}
      {/* ============================================================ */}
      {mode === 'HOME' && (
        <main className="max-w-6xl mx-auto px-6 py-10 md:py-16 space-y-16">
          {/* Hero Section */}
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-800/80 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Lomba Cepat Menjawab Soal Interaktif Real-Time</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white font-display tracking-tight leading-tight" style={{ textWrap: 'balance' }}>
              Panggung Kuis Cepat dengan Layar Besar & Kendali Ponsel Pintar
            </h1>

            <p className="text-base md:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Tampilkan pertanyaan multimedia di proyektor atau TV, gunakan ponsel pintar peserta sebagai kendali jawaban berkecepatan tinggi, dan saksikan papan skor bergerak secara dinamis!
            </p>

            {/* Quick Action Matrix: Join PIN vs Start Simulator */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
              {/* Join Box */}
              <div className="w-full sm:w-auto flex-1 flex items-center bg-slate-900 border border-slate-700 rounded-2xl p-1.5 shadow-xl">
                <input
                  type="text"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Ketik PIN Room..."
                  className="w-full bg-transparent px-4 py-2 text-sm text-white font-mono placeholder:text-slate-500 focus:outline-none"
                />
                <button
                  onClick={() => joinRoomAsController()}
                  disabled={!pinInput.trim()}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Masuk</span>
                </button>
              </div>

              {/* 1-Click Split Simulator Preview Button */}
              <button
                onClick={() => startSimulatorMode()}
                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white rounded-2xl text-xs font-extrabold shadow-xl shadow-purple-600/30 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current text-amber-300" />
                <span>Uji Coba Split Simulator (Layar + HP)</span>
              </button>
            </div>
          </div>

          {/* Player Custom Avatar Quick Preview Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-3xl shadow-lg border-2 border-indigo-400">
                <span>{AVATAR_ICONS.find(i => i.id === profile.avatar.iconId)?.emoji || '🐱'}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-base">{profile.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-300 font-semibold">
                    {profile.avatar.title}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                  <span>Akurasi: <strong className="text-emerald-400 font-mono">{profile.stats.accuracyRate}%</strong></span>
                  <span>·</span>
                  <span>Total XP: <strong className="text-amber-400 font-mono">{profile.stats.totalPoints.toLocaleString()}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setAvatarModalTarget('player1');
                  setShowAvatarModal(true);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition"
              >
                Kustomisasi Avatar
              </button>
              <button
                onClick={() => setShowSyncModal(true)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                <span>Sinkronisasi</span>
              </button>
            </div>
          </div>

          {/* Quiz Catalog Section */}
          <div id="katalog-kuis" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold font-display text-white">Paket Kuis Multimedia Pilihan</h2>
                <p className="text-xs text-slate-400 mt-0.5">Pilih paket kuis atau buat sendiri untuk dimainkan bersama.</p>
              </div>

              <button
                onClick={() => setShowCreatorModal(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-2 transition"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Buat Kuis Baru</span>
              </button>
            </div>

            {/* Quiz Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quizList.map((quiz) => (
                <div
                  key={quiz.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:border-indigo-500/60 transition group flex flex-col"
                >
                  {/* Cover Image */}
                  <div className="h-44 w-full bg-slate-950 relative overflow-hidden">
                    {quiz.coverImage ? (
                      <img
                        src={quiz.coverImage}
                        alt={quiz.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-950 to-slate-900 text-indigo-400">
                        <Sparkles className="w-12 h-12 opacity-50" />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-sm text-indigo-300 border border-slate-800">
                      {quiz.category}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display font-bold text-lg text-white group-hover:text-indigo-300 transition">
                        {quiz.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {quiz.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-mono font-medium">
                        {quiz.questions.length} Butir Soal
                      </span>

                      <button
                        onClick={() => startHostMode(quiz)}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold flex items-center gap-1.5 transition shadow"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Mulai Kuis</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* ============================================================ */}
      {/* VIEW: HOST BIG SCREEN (PROJECTOR / TV PRESENTATION) */}
      {/* ============================================================ */}
      {mode === 'HOST' && (
        <div>
          <HostScreen
            roomState={roomState}
            onStartGame={handleStartGame}
            onNextQuestion={handleNextQuestion}
            onShowLeaderboard={handleShowLeaderboard}
            onRestartGame={handleRestartGame}
            onViewStats={() => setMode('STATS')}
          />
        </div>
      )}

      {/* ============================================================ */}
      {/* VIEW: MOBILE CONTROLLER (PLAYER BUZZER) */}
      {/* ============================================================ */}
      {mode === 'CONTROLLER' && (
        <div className="h-screen max-w-md mx-auto flex flex-col">
          <MobileController
            roomState={roomState}
            currentPlayer={currentPlayerObj}
            onSubmitAnswer={(optIdx, elapsed) => handleSubmitAnswer(profile.id, optIdx, elapsed)}
            onOpenAvatarEditor={() => {
              setAvatarModalTarget('player1');
              setShowAvatarModal(true);
            }}
            onViewStats={() => setMode('STATS')}
          />
        </div>
      )}

      {/* ============================================================ */}
      {/* VIEW: DUAL SIMULATOR (SPLIT SCREEN HOST + 2 MOBILE CONTROLLERS) */}
      {/* ============================================================ */}
      {mode === 'SIMULATOR' && (
        <DualSimulatorView
          roomState={roomState}
          players={Object.values(roomState.players)}
          onStartGame={handleStartGame}
          onNextQuestion={handleNextQuestion}
          onShowLeaderboard={handleShowLeaderboard}
          onRestartGame={handleRestartGame}
          onViewStats={() => setMode('STATS')}
          onSubmitAnswer={(playerId, optIdx, elapsed) => handleSubmitAnswer(playerId, optIdx, elapsed)}
          onOpenAvatarEditor={(idx) => {
            setAvatarModalTarget(idx === 0 ? 'player1' : 'player2');
            setShowAvatarModal(true);
          }}
        />
      )}

      {/* ============================================================ */}
      {/* VIEW: COMPREHENSIVE PERFORMANCE STATS & ANALYTICS */}
      {/* ============================================================ */}
      {mode === 'STATS' && (
        <PerformanceStats
          player={currentPlayerObj}
          roomState={roomState}
          onBack={() => setMode('HOME')}
        />
      )}

      {/* ============================================================ */}
      {/* VIEW: GLOBAL LEADERBOARD */}
      {/* ============================================================ */}
      {mode === 'LEADERBOARD' && (
        <GlobalLeaderboard onBack={() => setMode('HOME')} />
      )}

      {/* ============================================================ */}
      {/* MODAL: AVATAR CUSTOMIZER STUDIO */}
      {/* ============================================================ */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <AvatarCustomizer
            currentAvatar={avatarModalTarget === 'player1' ? profile.avatar : player2Profile.avatar}
            playerName={avatarModalTarget === 'player1' ? profile.name : player2Profile.name}
            onSave={handleSaveAvatar}
            onClose={() => setShowAvatarModal(false)}
          />
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ACCOUNT CLOUD SYNC */}
      {/* ============================================================ */}
      {showSyncModal && (
        <AccountSyncModal
          currentProfile={profile}
          onProfileSynced={(newProfile) => {
            setProfile(newProfile);
            setShowSyncModal(false);
          }}
          onClose={() => setShowSyncModal(false)}
        />
      )}

      {/* ============================================================ */}
      {/* MODAL: FRIEND CHALLENGES */}
      {/* ============================================================ */}
      {showChallengesModal && (
        <FriendChallenges
          currentUserName={profile.name}
          currentUserAvatar={profile.avatar}
          onAcceptChallenge={(roomCode) => {
            setShowChallengesModal(false);
            joinRoomAsController(roomCode);
          }}
          onClose={() => setShowChallengesModal(false)}
        />
      )}

      {/* ============================================================ */}
      {/* MODAL: QUIZ CREATOR */}
      {/* ============================================================ */}
      {showCreatorModal && (
        <QuizCreatorModal
          onSaveQuiz={handleSaveNewQuiz}
          onClose={() => setShowCreatorModal(false)}
        />
      )}

      {/* ============================================================ */}
      {/* MODAL: SOURCE CODE PHP & AAPANEL CONFIG */}
      {/* ============================================================ */}
      {showPhpModal && (
        <PhpExportModal onClose={() => setShowPhpModal(false)} />
      )}
    </div>
  );
}
