import React, { useState } from 'react';
import { SushiItem } from '../types/game';
import { X, Search } from 'lucide-react';

interface ZukanModalProps {
  isOpen: boolean;
  onClose: () => void;
  allSushi: SushiItem[];
  unlockedSet: Set<number>;
}

export const ZukanModal: React.FC<ZukanModalProps> = ({
  isOpen,
  onClose,
  allSushi,
  unlockedSet,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<string>('ALL');
  const [selectedSushi, setSelectedSushi] = useState<SushiItem | null>(null);

  if (!isOpen) return null;

  const unlockedCount = allSushi.filter(s => unlockedSet.has(s.id)).length;
  const completionPercentage = Math.round((unlockedCount / allSushi.length) * 100);

  const rarities = ['ALL', 'GOD', 'UR', 'SSR', 'SR', 'R', 'N'];

  const filteredSushi = allSushi.filter(s => {
    const matchesRarity = selectedRarity === 'ALL' || s.rarity === selectedRarity;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.kana.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRarity && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border-4 border-amber-500 rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[88vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1 mb-3">
          <h2 className="text-2xl sm:text-3xl font-black text-amber-400 flex items-center justify-center gap-2">
            <span>📖</span>
            <span>すし大図鑑</span>
            <span>🍣</span>
          </h2>
          <div className="flex items-center justify-center gap-2 text-sm font-bold text-slate-300">
            <span>解放率:</span>
            <span className="text-amber-400 font-extrabold text-base">{unlockedCount}</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-200">{allSushi.length} 種類</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {completionPercentage}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-md mx-auto h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700 mt-1">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 my-2">
          {/* Rarity Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {rarities.map(rarity => (
              <button
                key={rarity}
                onClick={() => setSelectedRarity(rarity)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition shrink-0 ${
                  selectedRarity === rarity
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {rarity}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-48">
            <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="寿司名で検索..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Grid List */}
        <div className="flex-1 overflow-y-auto pr-1 my-2 min-h-[300px]">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
            {filteredSushi.map(item => {
              const isUnlocked = unlockedSet.has(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => isUnlocked && setSelectedSushi(item)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                    isUnlocked
                      ? `cursor-pointer hover:scale-105 active:scale-95 shadow-md rarity-${item.rarity} ${
                          item.rarity === 'GOD' ? 'anim-god' : ''
                        }`
                      : 'bg-slate-950/60 border-slate-800 text-slate-600 opacity-40 grayscale select-none'
                  }`}
                >
                  <div className="text-3xl sm:text-4xl mb-1 select-none">
                    {isUnlocked ? item.emoji : '🔒'}
                  </div>
                  <div className="text-xs font-black truncate w-full">
                    {isUnlocked ? item.name : '？？？'}
                  </div>
                  <div className="text-[10px] font-extrabold uppercase mt-0.5">
                    {isUnlocked ? item.rarity : 'LOCKED'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail Modal Overlay */}
        {selectedSushi && (
          <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
            <div className="relative w-full max-w-sm bg-slate-900 border-2 border-amber-500 rounded-2xl p-5 text-center shadow-2xl space-y-3">
              <button
                onClick={() => setSelectedSushi(null)}
                className="absolute top-3 right-3 p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-6xl my-2">{selectedSushi.emoji}</div>
              <span
                className={`inline-block px-3 py-0.5 rounded-full text-xs font-black rarity-${selectedSushi.rarity}`}
              >
                ★ {selectedSushi.rarity}
              </span>
              <h3 className="text-xl font-black text-white">{selectedSushi.name}</h3>
              <p className="text-xs text-slate-400">読み: {selectedSushi.kana}</p>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
                タイピング成功で美味しくいただけます！
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
