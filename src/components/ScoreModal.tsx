import React from 'react';
import { ScoreRecord } from '../types/game';
import { X, Trophy, Flame, Calendar, Award } from 'lucide-react';

interface ScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  scores: ScoreRecord[];
}

export const ScoreModal: React.FC<ScoreModalProps> = ({
  isOpen,
  onClose,
  scores,
}) => {
  if (!isOpen) return null;

  const bestScore = scores.reduce((max, s) => (s.score > max ? s.score : max), 0);
  const bestAccuracy = scores.reduce((max, s) => (s.accuracy > max ? s.accuracy : max), 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border-4 border-amber-500 rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[88vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1 mb-5">
          <h2 className="text-2xl sm:text-3xl font-black text-amber-400 flex items-center justify-center gap-2">
            <span>🏆</span>
            <span>プレイ記録 & ハイスコア</span>
            <span>🍣</span>
          </h2>
          <p className="text-xs text-slate-400">直近のプレイ履歴と最高記録</p>
        </div>

        {/* Summary Highlights */}
        {scores.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-slate-950 border border-amber-500/30 rounded-2xl flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-bold">最高皿数</div>
                <div className="text-xl font-black text-amber-400">{bestScore} <span className="text-xs">皿</span></div>
              </div>
            </div>

            <div className="p-3 bg-slate-950 border border-emerald-500/30 rounded-2xl flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-bold">最高正確率</div>
                <div className="text-xl font-black text-emerald-400">{bestAccuracy} <span className="text-xs">%</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Scores List */}
        <div className="space-y-2.5">
          {scores.length === 0 ? (
            <div className="p-8 text-center text-slate-500 space-y-2">
              <Trophy className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm font-bold">まだプレイ記録がありません。</p>
              <p className="text-xs">開店して寿司をたくさん食べよう！</p>
            </div>
          ) : (
            scores.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 text-xs sm:text-sm shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-black text-amber-400 text-xs">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-emerald-400 text-base">
                        {item.score} <span className="text-xs text-emerald-500">皿</span>
                      </span>
                      <span className="text-slate-400 text-xs">
                        (正確率: <span className="text-slate-200 font-bold">{item.accuracy}%</span>)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{item.date}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-black bg-slate-900 border border-amber-500/40 text-amber-300">
                    {item.rank}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
