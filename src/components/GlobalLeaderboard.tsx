import React, { useState, useEffect } from 'react';
import { GlobalLeaderboardEntry } from '../types/quiz';
import { Trophy, Medal, Flame, Search, Filter, ArrowLeft, Crown } from 'lucide-react';
import { AVATAR_ICONS, COLOR_THEMES } from './AvatarCustomizer';

interface GlobalLeaderboardProps {
  onBack: () => void;
}

export const GlobalLeaderboard: React.FC<GlobalLeaderboardProps> = ({ onBack }) => {
  const [entries, setEntries] = useState<GlobalLeaderboardEntry[]>([]);
  const [timeFilter, setTimeFilter] = useState<'weekly' | 'alltime'>('alltime');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        setEntries(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const filtered = entries.filter(e => 
    e.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.tier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderAvatar = (avatar: GlobalLeaderboardEntry['avatar']) => {
    const iconObj = AVATAR_ICONS.find(i => i.id === avatar.iconId) || AVATAR_ICONS[0];
    const themeObj = COLOR_THEMES.find(t => t.id === avatar.colorTheme) || COLOR_THEMES[0];
    return (
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md ${themeObj.bg} text-white`}>
        <span>{iconObj.emoji}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans select-none">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Title */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 text-sm font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Menu</span>
          </button>

          <div className="text-right">
            <span className="text-xs uppercase font-bold text-amber-400 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-800">
              Papan Peringkat Global
            </span>
          </div>
        </div>

        <div className="text-center py-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white font-display tracking-tight flex items-center justify-center gap-3">
            <Trophy className="w-8 h-8 text-amber-400" />
            Hall of Fame KilatQuiz
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-md mx-auto">
            Daftar pemain kuis tercepat dan terakurat di seluruh dunia! Terus bertanding untuk menaikkan Tier XP kamu.
          </p>
        </div>

        {/* Filter Controls (Segmented Tabs & Search) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
          {/* Segmented Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => setTimeFilter('alltime')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                timeFilter === 'alltime'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sepanjang Masa
            </button>
            <button
              onClick={() => setTimeFilter('weekly')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                timeFilter === 'weekly'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Minggu Ini
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nickname pemain..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-400"
            />
          </div>
        </div>

        {/* Leaderboard Ranking Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="grid grid-cols-12 px-6 py-3 bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <div className="col-span-1 text-center">Rank</div>
            <div className="col-span-6 sm:col-span-5">Pemain & Gelar</div>
            <div className="col-span-3 sm:col-span-3 text-center">Tier & Akurasi</div>
            <div className="col-span-2 sm:col-span-3 text-right">Skor Total XP</div>
          </div>

          <div className="divide-y divide-slate-800/60">
            {filtered.map((entry, idx) => {
              const rank = idx + 1;
              const isFirst = rank === 1;
              const isSecond = rank === 2;
              const isThird = rank === 3;

              return (
                <div
                  key={entry.id}
                  className={`grid grid-cols-12 px-6 py-3.5 items-center transition ${
                    isFirst
                      ? 'bg-amber-950/20 hover:bg-amber-950/30'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  {/* Rank */}
                  <div className="col-span-1 flex items-center justify-center font-display font-black text-base">
                    {isFirst && <Crown className="w-5 h-5 text-amber-400" />}
                    {isSecond && <Medal className="w-5 h-5 text-slate-300" />}
                    {isThird && <Medal className="w-5 h-5 text-orange-400" />}
                    {!isFirst && !isSecond && !isThird && (
                      <span className="text-slate-400 font-mono text-sm">#{rank}</span>
                    )}
                  </div>

                  {/* Player & Title */}
                  <div className="col-span-6 sm:col-span-5 flex items-center gap-3">
                    {renderAvatar(entry.avatar)}
                    <div className="min-w-0">
                      <div className="font-bold text-white text-sm truncate flex items-center gap-1.5">
                        <span>{entry.playerName}</span>
                      </div>
                      <div className="text-[11px] text-indigo-400 truncate">
                        {entry.avatar.title}
                      </div>
                    </div>
                  </div>

                  {/* Tier & Accuracy */}
                  <div className="col-span-3 sm:col-span-3 text-center">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 inline-block">
                      {entry.tier}
                    </span>
                    <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                      {entry.accuracy}% Akurasi
                    </div>
                  </div>

                  {/* XP Points */}
                  <div className="col-span-2 sm:col-span-3 text-right">
                    <div className="font-mono font-extrabold text-base text-amber-300">
                      {entry.xpScore.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400">XP</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
