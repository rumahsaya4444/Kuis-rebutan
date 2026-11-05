import express, { Request, Response } from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEFAULT_QUIZZES } from './src/data/defaultQuizzes';
import { GamePhase, QuizSet, RoomState, Player, GlobalLeaderboardEntry, FriendChallenge, UserAccountProfile } from './src/types/quiz';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(express.json());

// In-memory data stores
interface ServerRoom {
  state: RoomState;
  hostWs: WebSocket | null;
  playerSockets: Map<string, WebSocket>;
  timerInterval: NodeJS.Timeout | null;
}

const activeRooms = new Map<string, ServerRoom>();

// Global Leaderboard Seed Data
let globalLeaderboard: GlobalLeaderboardEntry[] = [
  {
    id: 'user-top-1',
    playerName: 'Rian_SiKilat',
    avatar: { iconId: 'cat', colorTheme: 'amber', accessory: 'crown', title: 'Master Kilat ⚡' },
    xpScore: 28450,
    gamesPlayed: 42,
    winCount: 29,
    accuracy: 94,
    tier: 'Master Kilat',
    lastActive: '2 menit lalu'
  },
  {
    id: 'user-top-2',
    playerName: 'Siti_Quantum',
    avatar: { iconId: 'owl', colorTheme: 'indigo', accessory: 'glasses', title: 'Juara Galaksi 🌌' },
    xpScore: 24100,
    gamesPlayed: 36,
    winCount: 22,
    accuracy: 91,
    tier: 'Master Kilat',
    lastActive: '15 menit lalu'
  },
  {
    id: 'user-top-3',
    playerName: 'Budi_Nusantara',
    avatar: { iconId: 'knight', colorTheme: 'emerald', accessory: 'halo', title: 'Kampiun Kuis 👑' },
    xpScore: 19800,
    gamesPlayed: 31,
    winCount: 18,
    accuracy: 88,
    tier: 'Jawara Kuis',
    lastActive: '1 jam lalu'
  },
  {
    id: 'user-top-4',
    playerName: 'Alya_Trivia',
    avatar: { iconId: 'fox', colorTheme: 'rose', accessory: 'headphones', title: 'Penembak Jitu 🎯' },
    xpScore: 16500,
    gamesPlayed: 25,
    winCount: 14,
    accuracy: 85,
    tier: 'Jawara Kuis',
    lastActive: '3 jam lalu'
  },
  {
    id: 'user-top-5',
    playerName: 'Dimas_Cyber',
    avatar: { iconId: 'bot', colorTheme: 'cyan', accessory: 'sunglasses', title: 'Detektif Waktu ⏳' },
    xpScore: 13200,
    gamesPlayed: 20,
    winCount: 11,
    accuracy: 82,
    tier: 'Penjelajah Cepat',
    lastActive: 'Hari ini'
  }
];

// Active Friend Challenges
const activeChallenges: FriendChallenge[] = [
  {
    id: 'ch-demo-1',
    senderName: 'Rian_SiKilat',
    senderAvatar: { iconId: 'cat', colorTheme: 'amber', accessory: 'crown', title: 'Master Kilat ⚡' },
    quizTitle: 'Pesona Nusantara & Warisan Dunia',
    quizCategory: 'Budaya & Alam',
    roomCode: '882-140',
    createdAt: Date.now() - 35000,
    expiresInSeconds: 300
  }
];

// User Account Profiles Store for multi-device sync
const accountProfiles = new Map<string, UserAccountProfile>();

// Helper to broadcast to all clients in a room
function broadcastToRoom(roomCode: string, payload: object) {
  const room = activeRooms.get(roomCode);
  if (!room) return;
  const message = JSON.stringify(payload);

  if (room.hostWs && room.hostWs.readyState === WebSocket.OPEN) {
    room.hostWs.send(message);
  }

  for (const clientWs of room.playerSockets.values()) {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(message);
    }
  }
}

// Check if all players answered
function checkAllAnswered(room: ServerRoom) {
  const currentQIndex = room.state.currentQuestionIndex;
  const currentQ = room.state.quiz.questions[currentQIndex];
  if (!currentQ) return;

  const playerIds = Object.keys(room.state.players);
  if (playerIds.length === 0) return;

  const allAnswered = playerIds.every(id => room.state.answersReceived[id] !== undefined);
  if (allAnswered && room.state.phase === 'QUESTION') {
    advanceToReveal(room);
  }
}

// Transition from question phase to reveal phase
function advanceToReveal(room: ServerRoom) {
  if (room.timerInterval) {
    clearInterval(room.timerInterval);
    room.timerInterval = null;
  }

  room.state.phase = 'REVEAL';

  // Compute answers, points, and update player records
  const currentQIndex = room.state.currentQuestionIndex;
  const currentQ = room.state.quiz.questions[currentQIndex];
  const correctIdx = currentQ.correctIndex;

  for (const [playerId, player] of Object.entries(room.state.players)) {
    const ans = room.state.answersReceived[playerId];
    player.totalAnswered += 1;

    if (ans && ans.option === correctIdx) {
      player.streak += 1;
      player.totalCorrect += 1;
      if (player.streak > player.bestStreak) {
        player.bestStreak = player.streak;
      }

      // Speed bonus calculation
      const timeElapsed = Math.min(ans.timeElapsedMs, currentQ.timeLimitSeconds * 1000);
      const timeFactor = Math.max(0.1, 1 - (timeElapsed / (currentQ.timeLimitSeconds * 1000)));
      const basePoints = 500;
      const speedBonus = Math.round(500 * timeFactor);
      const streakBonus = Math.min(250, (player.streak - 1) * 50);
      const totalPoints = basePoints + speedBonus + streakBonus;

      player.score += totalPoints;
      player.totalTimeMs += timeElapsed;

      player.lastAnswer = {
        questionIndex: currentQIndex,
        selectedOption: ans.option,
        isCorrect: true,
        pointsAwarded: totalPoints,
        timeElapsedMs: timeElapsed
      };
    } else {
      player.streak = 0;
      const timeElapsed = ans ? ans.timeElapsedMs : currentQ.timeLimitSeconds * 1000;
      player.totalTimeMs += timeElapsed;

      player.lastAnswer = {
        questionIndex: currentQIndex,
        selectedOption: ans ? ans.option : -1,
        isCorrect: false,
        pointsAwarded: 0,
        timeElapsedMs: timeElapsed
      };
    }
  }

  // Update rankings
  updatePlayerRankings(room.state);

  broadcastToRoom(room.state.roomCode, {
    type: 'PHASE_CHANGED',
    phase: 'REVEAL',
    state: room.state
  });
}

// Update ranks and compute rank delta
function updatePlayerRankings(state: RoomState) {
  const sorted = Object.values(state.players).sort((a, b) => b.score - a.score);
  sorted.forEach((player, idx) => {
    player.previousRank = player.rank || (idx + 1);
    player.rank = idx + 1;
  });
}

// WebSocket handler
wss.on('connection', (ws: WebSocket) => {
  let boundRoomCode: string | null = null;
  let boundPlayerId: string | null = null;
  let isHost = false;

  ws.on('message', (rawData: string) => {
    try {
      const data = JSON.parse(rawData.toString());

      switch (data.type) {
        case 'CREATE_ROOM': {
          const { roomCode, quiz } = data;
          boundRoomCode = roomCode;
          isHost = true;

          const newRoom: ServerRoom = {
            state: {
              roomCode,
              hostId: 'host-' + Math.random().toString(36).substring(2, 7),
              quiz: quiz || DEFAULT_QUIZZES[0],
              phase: 'LOBBY',
              currentQuestionIndex: 0,
              timeRemainingSeconds: 0,
              questionStartTime: 0,
              players: {},
              answersReceived: {}
            },
            hostWs: ws,
            playerSockets: new Map(),
            timerInterval: null
          };

          activeRooms.set(roomCode, newRoom);

          ws.send(JSON.stringify({
            type: 'ROOM_CREATED',
            state: newRoom.state
          }));
          break;
        }

        case 'JOIN_ROOM': {
          const { roomCode, player } = data;
          boundRoomCode = roomCode;
          boundPlayerId = player.id;
          isHost = false;

          let room = activeRooms.get(roomCode);
          if (!room) {
            // Auto-create room if not already exists (for quick joining & challenges)
            room = {
              state: {
                roomCode,
                hostId: 'system-host',
                quiz: DEFAULT_QUIZZES[0],
                phase: 'LOBBY',
                currentQuestionIndex: 0,
                timeRemainingSeconds: 0,
                questionStartTime: 0,
                players: {},
                answersReceived: {}
              },
              hostWs: null,
              playerSockets: new Map(),
              timerInterval: null
            };
            activeRooms.set(roomCode, room);
          }

          // Register player
          const initialPlayer: Player = {
            ...player,
            score: player.score || 0,
            streak: 0,
            bestStreak: 0,
            totalCorrect: 0,
            totalAnswered: 0,
            totalTimeMs: 0,
            isReady: true,
            rank: Object.keys(room.state.players).length + 1
          };

          room.state.players[player.id] = initialPlayer;
          room.playerSockets.set(player.id, ws);

          broadcastToRoom(roomCode, {
            type: 'PLAYER_JOINED',
            player: initialPlayer,
            state: room.state
          });
          break;
        }

        case 'START_GAME': {
          if (!boundRoomCode) return;
          const room = activeRooms.get(boundRoomCode);
          if (!room) return;

          room.state.phase = 'QUESTION';
          room.state.currentQuestionIndex = 0;
          room.state.answersReceived = {};
          
          const currentQ = room.state.quiz.questions[0];
          room.state.timeRemainingSeconds = currentQ.timeLimitSeconds;
          room.state.questionStartTime = Date.now();

          // Clear previous timer
          if (room.timerInterval) clearInterval(room.timerInterval);

          room.timerInterval = setInterval(() => {
            room.state.timeRemainingSeconds -= 1;

            broadcastToRoom(room.state.roomCode, {
              type: 'TIMER_TICK',
              timeRemaining: room.state.timeRemainingSeconds
            });

            if (room.state.timeRemainingSeconds <= 0) {
              advanceToReveal(room);
            }
          }, 1000);

          broadcastToRoom(room.state.roomCode, {
            type: 'GAME_STARTED',
            state: room.state
          });
          break;
        }

        case 'SUBMIT_ANSWER': {
          if (!boundRoomCode || !boundPlayerId) return;
          const room = activeRooms.get(boundRoomCode);
          if (!room || room.state.phase !== 'QUESTION') return;

          const { option, timeElapsedMs } = data;

          // Record answer idempotently
          if (!room.state.answersReceived[boundPlayerId]) {
            room.state.answersReceived[boundPlayerId] = {
              option,
              timeElapsedMs: Math.max(100, timeElapsedMs || (Date.now() - room.state.questionStartTime)),
              points: 0
            };

            // Notify everyone of answer count progress
            broadcastToRoom(room.state.roomCode, {
              type: 'ANSWER_RECEIVED',
              playerId: boundPlayerId,
              totalAnswers: Object.keys(room.state.answersReceived).length,
              totalPlayers: Object.keys(room.state.players).length
            });

            // Check if all players answered
            checkAllAnswered(room);
          }
          break;
        }

        case 'SHOW_LEADERBOARD': {
          if (!boundRoomCode) return;
          const room = activeRooms.get(boundRoomCode);
          if (!room) return;

          room.state.phase = 'LEADERBOARD';
          updatePlayerRankings(room.state);

          broadcastToRoom(room.state.roomCode, {
            type: 'PHASE_CHANGED',
            phase: 'LEADERBOARD',
            state: room.state
          });
          break;
        }

        case 'NEXT_QUESTION': {
          if (!boundRoomCode) return;
          const room = activeRooms.get(boundRoomCode);
          if (!room) return;

          const nextIndex = room.state.currentQuestionIndex + 1;
          if (nextIndex < room.state.quiz.questions.length) {
            room.state.currentQuestionIndex = nextIndex;
            room.state.phase = 'QUESTION';
            room.state.answersReceived = {};

            const nextQ = room.state.quiz.questions[nextIndex];
            room.state.timeRemainingSeconds = nextQ.timeLimitSeconds;
            room.state.questionStartTime = Date.now();

            if (room.timerInterval) clearInterval(room.timerInterval);

            room.timerInterval = setInterval(() => {
              room.state.timeRemainingSeconds -= 1;

              broadcastToRoom(room.state.roomCode, {
                type: 'TIMER_TICK',
                timeRemaining: room.state.timeRemainingSeconds
              });

              if (room.state.timeRemainingSeconds <= 0) {
                advanceToReveal(room);
              }
            }, 1000);

            broadcastToRoom(room.state.roomCode, {
              type: 'PHASE_CHANGED',
              phase: 'QUESTION',
              state: room.state
            });
          } else {
            // End of quiz -> PODIUM
            room.state.phase = 'PODIUM';
            updatePlayerRankings(room.state);

            // Record top score to global leaderboard
            const topPlayer = Object.values(room.state.players).sort((a, b) => b.score - a.score)[0];
            if (topPlayer && topPlayer.score > 0) {
              globalLeaderboard.push({
                id: 'lead-' + Date.now(),
                playerName: topPlayer.name,
                avatar: topPlayer.avatar,
                xpScore: topPlayer.score,
                gamesPlayed: 1,
                winCount: 1,
                accuracy: topPlayer.totalAnswered > 0 ? Math.round((topPlayer.totalCorrect / topPlayer.totalAnswered) * 100) : 100,
                tier: topPlayer.score > 3000 ? 'Master Kilat' : 'Jawara Kuis',
                lastActive: 'Baru saja'
              });
              // Sort global leaderboard descending
              globalLeaderboard.sort((a, b) => b.xpScore - a.xpScore);
            }

            broadcastToRoom(room.state.roomCode, {
              type: 'PHASE_CHANGED',
              phase: 'PODIUM',
              state: room.state
            });
          }
          break;
        }

        case 'SEND_CHALLENGE': {
          const { challenge } = data;
          activeChallenges.unshift(challenge);
          if (activeChallenges.length > 20) activeChallenges.pop();

          // Broadcast challenge notification to all open sockets
          const notificationMsg = JSON.stringify({
            type: 'NEW_CHALLENGE',
            challenge
          });

          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(notificationMsg);
            }
          });
          break;
        }

        case 'LEAVE_ROOM': {
          if (boundRoomCode && boundPlayerId) {
            const room = activeRooms.get(boundRoomCode);
            if (room) {
              delete room.state.players[boundPlayerId];
              room.playerSockets.delete(boundPlayerId);
              broadcastToRoom(boundRoomCode, {
                type: 'PLAYER_LEFT',
                playerId: boundPlayerId,
                state: room.state
              });
            }
          }
          break;
        }
      }
    } catch (err) {
      console.error('Error handling WebSocket message:', err);
    }
  });

  ws.on('close', () => {
    if (boundRoomCode) {
      const room = activeRooms.get(boundRoomCode);
      if (room) {
        if (isHost) {
          room.hostWs = null;
        } else if (boundPlayerId) {
          room.playerSockets.delete(boundPlayerId);
        }
      }
    }
  });
});

// REST Endpoints
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Global Leaderboard API
app.get('/api/leaderboard', (req: Request, res: Response) => {
  res.json(globalLeaderboard);
});

app.post('/api/leaderboard', (req: Request, res: Response) => {
  const newEntry = req.body;
  if (newEntry && newEntry.playerName) {
    globalLeaderboard.push(newEntry);
    globalLeaderboard.sort((a, b) => b.xpScore - a.xpScore);
  }
  res.json({ success: true, count: globalLeaderboard.length });
});

// Friend Challenges API
app.get('/api/challenges', (req: Request, res: Response) => {
  res.json(activeChallenges);
});

app.post('/api/challenges', (req: Request, res: Response) => {
  const challenge = req.body;
  activeChallenges.unshift(challenge);
  res.json({ success: true, challenge });
});

// Account Profile & Multi-Device Sync API
app.get('/api/sync/account/:syncToken', (req: Request, res: Response) => {
  const token = req.params.syncToken;
  const profile = accountProfiles.get(token);
  if (profile) {
    res.json({ success: true, profile });
  } else {
    res.status(404).json({ success: false, message: 'Profil akun tidak ditemukan untuk kode sinkronisasi ini.' });
  }
});

app.post('/api/sync/account', (req: Request, res: Response) => {
  const profile: UserAccountProfile = req.body;
  if (!profile || !profile.syncToken) {
    res.status(400).json({ success: false, message: 'Sync token diperlukan' });
    return;
  }
  accountProfiles.set(profile.syncToken, profile);
  res.json({ success: true, message: 'Data akun berhasil disinkronkan ke server cloud!', profile });
});

// Quizzes list API
app.get('/api/quizzes', (req: Request, res: Response) => {
  res.json(DEFAULT_QUIZZES);
});

// Setup Vite dev server or static serve
async function startServer() {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 KilatQuiz Realtime Engine running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
