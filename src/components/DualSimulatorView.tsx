import React, { useState } from 'react';
import { RoomState, Player } from '../types/quiz';
import { HostScreen } from './HostScreen';
import { MobileController } from './MobileController';
import { Smartphone, Monitor, Sparkles } from 'lucide-react';

interface DualSimulatorViewProps {
  roomState: RoomState;
  players: Player[];
  onStartGame: () => void;
  onNextQuestion: () => void;
  onShowLeaderboard: () => void;
  onRestartGame: () => void;
  onViewStats: () => void;
  onSubmitAnswer: (playerId: string, optionIdx: number, elapsedMs: number) => void;
  onOpenAvatarEditor: (playerIndex: number) => void;
}

export const DualSimulatorView: React.FC<DualSimulatorViewProps> = ({
  roomState,
  players,
  onStartGame,
  onNextQuestion,
  onShowLeaderboard,
  onRestartGame,
  onViewStats,
  onSubmitAnswer,
  onOpenAvatarEditor
}) => {
  const [activeMobileTab, setActiveMobileTab] = useState<number>(0);

  const player1 = players[0];
  const player2 = players[1];

  return (
    <div className="w-full h-screen flex flex-col lg:flex-row bg-slate-950 overflow-hidden font-sans">
      {/* Left/Main Column: Big Screen (Host / Projector View) */}
      <div className="flex-1 h-full overflow-y-auto border-r border-slate-800 flex flex-col">
        <HostScreen
          roomState={roomState}
          onStartGame={onStartGame}
          onNextQuestion={onNextQuestion}
          onShowLeaderboard={onShowLeaderboard}
          onRestartGame={onRestartGame}
          onViewStats={onViewStats}
          isSimulatorMode={true}
        />
      </div>

      {/* Right Column: Virtual Smartphone Controller View */}
      <div className="w-full lg:w-[420px] h-full bg-slate-900/90 border-t lg:border-t-0 border-slate-800 flex flex-col shrink-0">
        {/* Header Tab Switcher (Pemain 1 vs Pemain 2) */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <Smartphone className="w-4 h-4 text-indigo-400" />
            <span>Simulator Ponsel Peserta</span>
          </div>

          <div className="flex items-center gap-1 p-0.5 bg-slate-900 rounded-lg border border-slate-800">
            {players.slice(0, 2).map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setActiveMobileTab(idx)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                  activeMobileTab === idx
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p.name.split('_')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Device Mockup Frame */}
        <div className="flex-1 p-3 overflow-hidden flex flex-col items-center justify-center bg-slate-950/60">
          <div className="w-full max-w-[340px] h-full max-h-[640px] bg-slate-950 rounded-[32px] border-4 border-slate-700 shadow-2xl overflow-hidden flex flex-col relative ring-1 ring-white/10">
            {/* Phone Speaker Notch */}
            <div className="h-4 bg-slate-900 flex items-center justify-center shrink-0">
              <div className="w-16 h-1 rounded-full bg-slate-800" />
            </div>

            {/* Active Phone Screen */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {players[activeMobileTab] ? (
                <MobileController
                  roomState={roomState}
                  currentPlayer={players[activeMobileTab]}
                  onSubmitAnswer={(optionIdx, elapsedMs) =>
                    onSubmitAnswer(players[activeMobileTab].id, optionIdx, elapsedMs)
                  }
                  onOpenAvatarEditor={() => onOpenAvatarEditor(activeMobileTab)}
                  onViewStats={onViewStats}
                  isCompact={true}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-xs text-slate-400">
                  <Sparkles className="w-8 h-8 text-indigo-400 mb-2 animate-bounce" />
                  <span>Pemain belum siap</span>
                </div>
              )}
            </div>

            {/* Phone Home Bar */}
            <div className="h-4 bg-slate-950 flex items-center justify-center shrink-0">
              <div className="w-24 h-1 rounded-full bg-slate-700" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
