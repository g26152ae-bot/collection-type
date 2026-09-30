import React from 'react';
import { Gift, Play, Utensils } from 'lucide-react';

interface ResultSectionProps {
  score: number;
  accuracy: number;
  earnedPt: number;
  rankText: string;
  dropMessage: string | null;
  selectedTime: number;
  onChangeTime: (time: number) => void;
  onRestart: () => void;
}

export const ResultSection: React.FC<ResultSectionProps> = ({
  score,
  accuracy,
  earnedPt,
  rankText,
  dropMessage,
  selectedTime,
  onChangeTime,
  onRestart,
}) => {
  return (
    <div className="w-full p-5 sm:p-6 bg-slate-900 border-2 border-amber-500 rounded-2xl shadow-2xl space-y-4 animate-in fade-in duration-300">
      {/* Rank Banner */}
      <div className="text-center pb-2 border-b border-slate-700/80">
        <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">
          店舗評価 / 店舗判定
        </div>
        <div className="text-2xl sm:text-3xl font-black text-amber-400 drop-shadow-md">
          {rankText}
        </div>
      </div>

      {/* Stats Breakdown */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 font-bold mb-1">食べた皿数</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400">
            {score} <span className="text-xs">皿</span>
          </div>
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 font-bold mb-1">獲得ポイント</div>
          <div className="text-xl sm:text-2xl font-black text-amber-400">
            +{earnedPt.toLocaleString()} <span className="text-xs">pt</span>
          </div>
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 font-bold mb-1">タイピング正確率</div>
          <div className="text-xl sm:text-2xl font-black text-sky-400">
            {accuracy} <span className="text-xs">%</span>
          </div>
        </div>
      </div>

      {/* Ticket Drop Message */}
      {dropMessage && (
        <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-pink-950/80 to-purple-950/80 border border-pink-500 rounded-xl text-xs sm:text-sm font-bold text-pink-200 shadow-md animate-pulse">
          <Gift className="w-5 h-5 text-pink-400 shrink-0" />
          <span>🎁 ドロップ報酬: {dropMessage}</span>
        </div>
      )}

      {/* Time setting selector & Restart */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-300">
          <span>⏱️ 制限時間:</span>
          <select
            value={selectedTime}
            onChange={e => onChangeTime(Number(e.target.value))}
            className="px-3 py-1.5 bg-slate-950 border-2 border-amber-500 rounded-xl text-amber-400 font-bold focus:outline-none"
          >
            <option value={30}>30秒（ショート）</option>
            <option value={60}>1分（標準）</option>
            <option value={120}>2分（じっくり）</option>
            <option value={180}>3分（しっかり）</option>
            <option value={300}>5分（長旅）</option>
            <option value={600}>10分（無制限級）</option>
          </select>
        </div>

        <button
          onClick={onRestart}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 active:translate-y-0.5 text-slate-950 font-black text-sm sm:text-base rounded-xl shadow-[0_4px_#b45309] transition"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>もう一度喰らう（Space）</span>
        </button>
      </div>
    </div>
  );
};
