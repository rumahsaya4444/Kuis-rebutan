import React, { useState, useEffect } from 'react';
import { FriendChallenge, PlayerAvatar } from '../types/quiz';
import { Swords, Send, Clock, Play, X, UserCheck, Flame, Check } from 'lucide-react';
import { AVATAR_ICONS, COLOR_THEMES } from './AvatarCustomizer';

interface FriendChallengesProps {
  currentUserName: string;
  currentUserAvatar: PlayerAvatar;
  onAcceptChallenge: (roomCode: string) => void;
  onClose: () => void;
}

export const FriendChallenges: React.FC<FriendChallengesProps> = ({
  currentUserName,
  currentUserAvatar,
  onAcceptChallenge,
  onClose
}) => {
  const [challenges, setChallenges] = useState<FriendChallenge[]>([]);
  const [targetFriendName, setTargetFriendName] = useState('');
  const [selectedQuizCategory, setSelectedQuizCategory] = useState('Budaya & Alam');
  const [sentSuccess, setSentSuccess] = useState(false);

  // Online simulated friends ready for 1v1 duel
  const ONLINE_FRIENDS = [
    {
      name: 'Rian_SiKilat',
      avatar: { iconId: 'cat', colorTheme: 'amber', accessory: 'crown', title: 'Master Kilat ⚡' },
      status: 'Online · Siap Tanding',
      winRate: '88% Menang'
    },
    {
      name: 'Dimas_Cyber',
      avatar: { iconId: 'bot', colorTheme: 'cyan', accessory: 'glasses', title: 'Detektif Waktu ⏳' },
      status: 'Online · Baru Selesai Kuis',
      winRate: '75% Menang'
    },
    {
      name: 'Siti_Quantum',
      avatar: { iconId: 'owl', colorTheme: 'indigo', accessory: 'sparkles', title: 'Juara Galaksi 🌌' },
      status: 'Online · Latihan Kilat',
      winRate: '92% Menang'
    }
  ];

  // Fetch active challenges
  useEffect(() => {
    fetch('/api/challenges')
      .then(res => res.json())
      .then(data => {
        setChallenges(data);
      })
      .catch(() => {});
  }, []);

  const handleSendChallenge = (friendName?: string) => {
    const friend = friendName || targetFriendName.trim() || 'Teman_Kuis';
    const roomCode = Math.floor(100000 + Math.random() * 900000).toString();
    const formattedCode = `${roomCode.substring(0, 3)}-${roomCode.substring(3)}`;

    const newChallenge: FriendChallenge = {
      id: 'ch-' + Date.now(),
      senderName: currentUserName || 'Pemain_1',
      senderAvatar: currentUserAvatar,
      quizTitle: `Duel Cepat: ${selectedQuizCategory}`,
      quizCategory: selectedQuizCategory,
      roomCode: formattedCode,
      createdAt: Date.now(),
      expiresInSeconds: 300
    };

    fetch('/api/challenges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newChallenge)
    })
      .then(() => {
        setChallenges(prev => [newChallenge, ...prev]);
        setSentSuccess(true);
        setTimeout(() => setSentSuccess(false), 3000);
      })
      .catch(() => {});
  };

  const renderAvatar = (avatar: PlayerAvatar) => {
    const iconObj = AVATAR_ICONS.find(i => i.id === avatar.iconId) || AVATAR_ICONS[0];
    const themeObj = COLOR_THEMES.find(t => t.id === avatar.colorTheme) || COLOR_THEMES[0];
    return (
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow ${themeObj.bg} text-white`}>
        <span>{iconObj.emoji}</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-950 border border-indigo-800 rounded-2xl text-indigo-400">
            <Swords className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-display text-white">
              Tantangan Kilat Antar Teman (1v1)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Kirim tantangan duel real-time atau terima undangan bertanding dari temanmu!
            </p>
          </div>
        </div>

        {/* Section 1: Kirim Tantangan Baru */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
            Kirim Tantangan Baru
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <input
                type="text"
                value={targetFriendName}
                onChange={(e) => setTargetFriendName(e.target.value)}
                placeholder="Masukkan nickname teman..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div className="sm:col-span-4">
              <select
                value={selectedQuizCategory}
                onChange={(e) => setSelectedQuizCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
              >
                <option value="Budaya & Alam">Budaya & Alam</option>
                <option value="Sains & Quantum">Sains & Quantum</option>
                <option value="Logika & Refleks">Logika & Refleks</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <button
                onClick={() => handleSendChallenge()}
                className="w-full h-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold py-2 flex items-center justify-center gap-1.5 transition shadow"
              >
                {sentSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Send className="w-3.5 h-3.5" />}
                <span>{sentSuccess ? 'Terkirim!' : 'Tantang'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Teman Online Siap Ditantang */}
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
            Pemain Aktif Siap Duel
          </span>

          <div className="space-y-2">
            {ONLINE_FRIENDS.map((friend) => (
              <div
                key={friend.name}
                className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-800 rounded-xl hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-3">
                  {renderAvatar(friend.avatar as PlayerAvatar)}
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{friend.name}</span>
                      <span className="text-[10px] text-emerald-400">● {friend.status}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {friend.avatar.title} · <span className="text-amber-400">{friend.winRate}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleSendChallenge(friend.name)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 text-xs font-bold rounded-lg transition flex items-center gap-1.5 border border-slate-700"
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>Tantang 1v1</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Daftar Undangan Tantangan Masuk */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
            Undangan Tantangan Masuk ({challenges.length})
          </span>

          {challenges.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              Belum ada tantangan masuk. Ajak temanmu bertanding di atas!
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {challenges.map((ch) => (
                <div
                  key={ch.id}
                  className="p-3 bg-gradient-to-r from-indigo-950/40 to-slate-900 border border-indigo-900/60 rounded-xl flex items-center justify-between shadow"
                >
                  <div className="flex items-center gap-3">
                    {renderAvatar(ch.senderAvatar)}
                    <div>
                      <div className="text-xs font-bold text-white">
                        {ch.senderName} menantangmu!
                      </div>
                      <div className="text-[11px] text-indigo-300">
                        {ch.quizTitle} · Room: <span className="font-mono font-bold text-emerald-400">{ch.roomCode}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onAcceptChallenge(ch.roomCode)}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Terima Duel</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
