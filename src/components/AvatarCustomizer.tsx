import React, { useState } from 'react';
import { PlayerAvatar } from '../types/quiz';
import { Sparkles, Crown, Glasses, Headphones, Award, Check } from 'lucide-react';

interface AvatarCustomizerProps {
  currentAvatar: PlayerAvatar;
  playerName: string;
  onSave: (avatar: PlayerAvatar, name: string) => void;
  onClose?: () => void;
}

export const AVATAR_ICONS = [
  { id: 'cat', emoji: '🐱', label: 'Kucing Cyber' },
  { id: 'bot', emoji: '🤖', label: 'Mecha Bot' },
  { id: 'fox', emoji: '🦊', label: 'Rubah Cerdik' },
  { id: 'knight', emoji: '🦁', label: 'Singa Ksatria' },
  { id: 'owl', emoji: '🦉', label: 'Burung Hantu Bijak' },
  { id: 'alien', emoji: '👽', label: 'Alien Kosmik' },
  { id: 'ninja', emoji: '🥷', label: 'Ninja Kilat' },
  { id: 'panda', emoji: '🐼', label: 'Panda Juara' },
  { id: 'wizard', emoji: '🧙‍♂️', label: 'Penyihir Waktu' },
  { id: 'tiger', emoji: '🐯', label: 'Harimau Berani' },
  { id: 'falcon', emoji: '🦅', label: 'Elang Pengintai' },
  { id: 'dragon', emoji: '🐲', label: 'Naga Legendaris' }
];

export const COLOR_THEMES = [
  { id: 'indigo', name: 'Neon Indigo', bg: 'bg-indigo-600', ring: 'ring-indigo-400', border: 'border-indigo-500', glow: 'shadow-indigo-500/50' },
  { id: 'emerald', name: 'Cyber Emerald', bg: 'bg-emerald-600', ring: 'ring-emerald-400', border: 'border-emerald-500', glow: 'shadow-emerald-500/50' },
  { id: 'amber', name: 'Solar Amber', bg: 'bg-amber-600', ring: 'ring-amber-400', border: 'border-amber-500', glow: 'shadow-amber-500/50' },
  { id: 'rose', name: 'Rose Magenta', bg: 'bg-rose-600', ring: 'ring-rose-400', border: 'border-rose-500', glow: 'shadow-rose-500/50' },
  { id: 'cyan', name: 'Electric Cyan', bg: 'bg-cyan-600', ring: 'ring-cyan-400', border: 'border-cyan-500', glow: 'shadow-cyan-500/50' },
  { id: 'violet', name: 'Sunset Violet', bg: 'bg-purple-600', ring: 'ring-purple-400', border: 'border-purple-500', glow: 'shadow-purple-500/50' }
];

export const ACCESSORIES = [
  { id: 'none', label: 'Tanpa Aksesoris', icon: null },
  { id: 'crown', label: 'Mahkota Emas', icon: Crown },
  { id: 'glasses', label: 'Kacamata Cyber', icon: Glasses },
  { id: 'headphones', label: 'Headset Gamer', icon: Headphones },
  { id: 'sparkles', label: 'Aura Bintang', icon: Sparkles },
  { id: 'halo', label: 'Medali Kehormatan', icon: Award }
];

export const TITLES = [
  'Si Kilat ⚡',
  'Master Trivia 🧠',
  'Penembak Jitu 🎯',
  'Detektif Waktu ⏳',
  'Juara Galaksi 🌌',
  'Kampiun Kuis 👑',
  'Pemberani Refleks 🚀',
  'Strategis Handal 🛡️'
];

export const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({
  currentAvatar,
  playerName,
  onSave,
  onClose
}) => {
  const [name, setName] = useState(playerName || 'Pemain_1');
  const [selectedIcon, setSelectedIcon] = useState(currentAvatar.iconId || 'cat');
  const [selectedColor, setSelectedColor] = useState(currentAvatar.colorTheme || 'indigo');
  const [selectedAccessory, setSelectedAccessory] = useState(currentAvatar.accessory || 'none');
  const [selectedTitle, setSelectedTitle] = useState(currentAvatar.title || TITLES[0]);

  const activeTheme = COLOR_THEMES.find(c => c.id === selectedColor) || COLOR_THEMES[0];
  const activeIconObj = AVATAR_ICONS.find(i => i.id === selectedIcon) || AVATAR_ICONS[0];

  const handleSave = () => {
    onSave(
      {
        iconId: selectedIcon,
        colorTheme: selectedColor,
        accessory: selectedAccessory,
        title: selectedTitle
      },
      name.trim() || 'Pemain_1'
    );
  };

  return (
    <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white font-display">Studio Kustomisasi Avatar</h2>
          <p className="text-xs text-slate-400 mt-0.5">Rancang identitas dan gelar pemain Anda untuk tampil di Layar Besar!</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
          >
            Tutup
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Live Avatar Preview Card */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-950/60 rounded-xl border border-slate-800/80">
          <div className="relative mb-4 group">
            {/* Glow Aura */}
            <div className={`absolute -inset-2 rounded-full opacity-40 blur-lg transition duration-500 ${activeTheme.bg}`} />
            
            {/* Avatar Circle */}
            <div className={`relative w-28 h-28 rounded-2xl flex items-center justify-center text-5xl shadow-xl transition-all duration-300 border-2 ${activeTheme.bg} ${activeTheme.border} ${activeTheme.glow}`}>
              <span className="transform transition hover:scale-110">{activeIconObj.emoji}</span>

              {/* Accessory Badge */}
              {selectedAccessory !== 'none' && (
                <div className="absolute -top-3 -right-2 bg-slate-900 border border-amber-400 text-amber-300 p-1.5 rounded-full shadow-lg">
                  {selectedAccessory === 'crown' && <Crown className="w-4 h-4 text-amber-400" />}
                  {selectedAccessory === 'glasses' && <Glasses className="w-4 h-4 text-cyan-400" />}
                  {selectedAccessory === 'headphones' && <Headphones className="w-4 h-4 text-emerald-400" />}
                  {selectedAccessory === 'sparkles' && <Sparkles className="w-4 h-4 text-yellow-300" />}
                  {selectedAccessory === 'halo' && <Award className="w-4 h-4 text-purple-400" />}
                </div>
              )}
            </div>
          </div>

          {/* Name & Title Preview */}
          <div className="text-center w-full">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama Pemain"
              maxLength={18}
              className="w-full text-center font-bold text-lg text-white bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-400"
            />
            <div className="mt-2 text-xs font-semibold text-indigo-400 bg-indigo-950/70 border border-indigo-800/60 rounded-md py-1 px-3 inline-block">
              {selectedTitle}
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              Level 12 · Tier Jawara Kilat
            </div>
          </div>
        </div>

        {/* Right Column: Customization Controls */}
        <div className="md:col-span-7 space-y-4 max-h-[480px] overflow-y-auto pr-1">
          {/* 1. Pilih Karakter */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-2 block uppercase tracking-wider">
              1. Pilih Karakter Avatar
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {AVATAR_ICONS.map((icon) => {
                const isSelected = selectedIcon === icon.id;
                return (
                  <button
                    key={icon.id}
                    onClick={() => setSelectedIcon(icon.id)}
                    title={icon.label}
                    className={`h-12 rounded-xl flex items-center justify-center text-2xl transition border ${
                      isSelected
                        ? 'bg-slate-800 border-indigo-400 ring-2 ring-indigo-500/50 scale-105'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    {icon.emoji}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Warna Tema Aura */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-2 block uppercase tracking-wider">
              2. Tema Warna Aura
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_THEMES.map((theme) => {
                const isSelected = selectedColor === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedColor(theme.id)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition border ${theme.bg} ${
                      isSelected ? 'ring-2 ring-white scale-110 border-white' : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                    title={theme.name}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Aksesoris Kepala */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-2 block uppercase tracking-wider">
              3. Aksesoris Ikonik
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ACCESSORIES.map((acc) => {
                const isSelected = selectedAccessory === acc.id;
                const IconComponent = acc.icon;
                return (
                  <button
                    key={acc.id}
                    onClick={() => setSelectedAccessory(acc.id)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-2 border transition ${
                      isSelected
                        ? 'bg-indigo-950/80 border-indigo-400 text-indigo-200'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {IconComponent ? <IconComponent className="w-3.5 h-3.5 shrink-0" /> : <span className="w-3.5" />}
                    <span className="truncate">{acc.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Gelar Pemain */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-2 block uppercase tracking-wider">
              4. Gelar Kehormatan
            </label>
            <select
              value={selectedTitle}
              onChange={(e) => setSelectedTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-400"
            >
              {TITLES.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end gap-3">
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition"
          >
            Batal
          </button>
        )}
        <button
          onClick={handleSave}
          className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
        >
          Simpan Avatar & Mulai
        </button>
      </div>
    </div>
  );
};
