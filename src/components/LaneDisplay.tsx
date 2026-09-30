import React from 'react';
import { SushiItem } from '../types/game';

interface LaneDisplayProps {
  currentSushi: SushiItem | null;
  isFeverMode: boolean;
  isBonusLane: boolean;
  isEating: boolean;
  timePop: string | null;
  combo: number;
}

export const LaneDisplay: React.FC<LaneDisplayProps> = ({
  currentSushi,
  isFeverMode,
  isBonusLane,
  isEating,
  timePop,
  combo,
}) => {
  return (
    <div className="w-full space-y-2">
      {/* Combo and Fever Banner */}
      <div className="h-7 flex items-center justify-center font-extrabold text-sm sm:text-base tracking-wider italic">
        {combo >= 5 && (
          <div className={`transition-transform duration-200 animate-bounce ${isFeverMode ? 'text-amber-400 drop-shadow-[0_0_8px_#f59e0b]' : 'text-rose-500'}`}>
            🔥 {combo} COMBO! {isFeverMode && <span className="text-amber-300 font-black">【FEVER TIME! 獲得pt 2倍!!】</span>}
          </div>
        )}
      </div>

      {/* Conveyor Belt Lane */}
      <div
        className={`relative h-28 w-full rounded-2xl overflow-hidden border-b-8 transition-all duration-300 shadow-inner flex items-center justify-center ${
          isFeverMode
            ? 'bg-gradient-to-r from-amber-950 via-amber-800 to-amber-950 border-amber-500 anim-fever'
            : isBonusLane
            ? 'bg-emerald-950 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
            : 'bg-slate-800/90 border-slate-700'
        }`}
      >
        {/* Conveyor moving belt pattern */}
        <div className="absolute inset-0 conveyor-belt pointer-events-none opacity-40" />

        {/* Rail Guides */}
        <div className="absolute top-1 inset-x-0 h-1 bg-amber-600/30" />
        <div className="absolute bottom-1 inset-x-0 h-1 bg-amber-600/30" />

        {/* Plate & Sushi Character */}
        {currentSushi && (
          <div
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-10 transition-transform ${
              isEating ? 'anim-eat' : 'scale-100 hover:scale-105'
            }`}
          >
            {/* Ceramic Plate Shadow & Base */}
            <div className="relative flex items-center justify-center w-24 h-16 sm:w-28 sm:h-18 rounded-[50%] bg-gradient-to-b from-slate-100 via-slate-200 to-slate-300 border-2 border-slate-400 shadow-[0_6px_16px_rgba(0,0,0,0.6)]">
              {/* Inner Plate Rim */}
              <div className="absolute inset-1.5 rounded-[50%] border border-slate-300/80 bg-slate-50/50" />

              {/* Sushi Emoji on Plate */}
              <span className="relative z-10 text-4xl sm:text-5xl select-none filter drop-shadow-md">
                {currentSushi.emoji}
              </span>
            </div>
          </div>
        )}

        {/* Time Pop Animation Indicator */}
        {timePop && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-emerald-400 font-black text-2xl sm:text-3xl drop-shadow-[0_0_12px_#10b981] pointer-events-none z-20 anim-pop">
            {timePop}
          </div>
        )}
      </div>
    </div>
  );
};
