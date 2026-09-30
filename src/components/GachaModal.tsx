import React, { useState } from 'react';
import { SushiItem, RankDefinition } from '../types/game';
import { sounds } from '../utils/sound';
import { X, Sparkles, Ticket } from 'lucide-react';

interface GachaModalProps {
  isOpen: boolean;
  onClose: () => void;
  pt: number;
  tickets: number;
  tenTickets: number;
  gachaPrice: number;
  allSushi: SushiItem[];
  unlockedSet: Set<number>;
  rankHierarchy: RankDefinition[];
  onConsumeTickets: (type: 'single' | 'ten') => void;
  onSpendPt: (cost: number) => void;
  onAddPt: (bonus: number) => void;
  onUnlockSushi: (ids: number[]) => void;
}

export const GachaModal: React.FC<GachaModalProps> = ({
  isOpen,
  onClose,
  pt,
  tickets,
  tenTickets,
  gachaPrice,
  allSushi,
  unlockedSet,
  rankHierarchy,
  onConsumeTickets,
  onSpendPt,
  onAddPt,
  onUnlockSushi,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResults, setSpinResults] = useState<{ item: SushiItem; isNew: boolean }[]>([]);
  const [duplicateBonus, setDuplicateBonus] = useState(0);
  const [resultMessage, setResultMessage] = useState<string>('');
  const [displayReel, setDisplayReel] = useState<{ emoji: string; rarity: string }[]>([]);

  if (!isOpen) return null;

  const tenCost = gachaPrice * 10;
  const maxCanBuy = Math.floor(pt / gachaPrice);

  const executeSpin = (count: number, isTicket: boolean) => {
    if (isSpinning) return;
    setIsSpinning(true);
    setResultMessage(isTicket ? `🎟️ ガチャ無料券消費！ ${count}連 回転中...` : `🎰 ガチャ ${count}連 回転中...`);
    setSpinResults([]);
    setDuplicateBonus(0);

    const initialDisplay = Array.from({ length: Math.min(count, 10) }, () => ({
      emoji: '🍣',
      rarity: '???',
    }));
    setDisplayReel(initialDisplay);

    let tick = 0;
    const interval = setInterval(() => {
      sounds.play('gachaTick');
      setDisplayReel(
        Array.from({ length: Math.min(count, 10) }, () => {
          const randItem = allSushi[Math.floor(Math.random() * allSushi.length)];
          return { emoji: randItem.emoji, rarity: randItem.rarity };
        })
      );
      tick++;

      if (tick > 12) {
        clearInterval(interval);

        // Calculate gacha weights based on rank hierarchy
        const totalRate = rankHierarchy.reduce((sum, r) => sum + r.rate, 0);
        const drawnItems: SushiItem[] = [];

        for (let i = 0; i < count; i++) {
          const rand = Math.random() * totalRate;
          let cum = 0;
          let chosenRank = rankHierarchy[0].name;
          for (const r of rankHierarchy) {
            cum += r.rate;
            if (rand <= cum) {
              chosenRank = r.name;
              break;
            }
          }
          const pool = allSushi.filter(s => s.rarity === chosenRank);
          const drawn = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : allSushi[0];
          drawnItems.push(drawn);
        }

        let bonusRefund = 0;
        const newUnlocks: number[] = [];
        const processedResults = drawnItems.map(item => {
          const isNew = !unlockedSet.has(item.id) && !newUnlocks.includes(item.id);
          if (isNew) {
            newUnlocks.push(item.id);
          } else {
            const rankObj = rankHierarchy.find(r => r.name === item.rarity);
            bonusRefund += Math.round((rankObj ? rankObj.pt : 100) * 0.5);
          }
          return { item, isNew };
        });

        if (newUnlocks.length > 0) {
          onUnlockSushi(newUnlocks);
        }
        if (bonusRefund > 0) {
          onAddPt(bonusRefund);
        }

        const hasGodOrUr = processedResults.some(r => r.item.rarity === 'GOD' || r.item.rarity === 'UR');
        if (hasGodOrUr) {
          sounds.play('jackpot');
        } else {
          sounds.play('fanfare');
        }

        setSpinResults(processedResults);
        setDuplicateBonus(bonusRefund);
        setResultMessage(`ガチャ結果 (${count}連)！ 重複売却還元: +${bonusRefund.toLocaleString()} pt`);
        setIsSpinning(false);
      }
    }, 90);
  };

  const handleTicketSpin = (type: 'single' | 'ten') => {
    if (type === 'single') {
      if (tickets <= 0) return;
      onConsumeTickets('single');
      executeSpin(1, true);
    } else {
      if (tenTickets <= 0) return;
      onConsumeTickets('ten');
      executeSpin(10, true);
    }
  };

  const handlePtSpin = (count: number) => {
    const cost = count * gachaPrice;
    if (pt < cost) return;
    onSpendPt(cost);
    executeSpin(count, false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border-4 border-amber-500 rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSpinning}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1 mb-4">
          <h2 className="text-2xl sm:text-3xl font-black text-amber-400 flex items-center justify-center gap-2">
            <span>🎰</span>
            <span>すしコレクション ガチャ</span>
            <span>🍣</span>
          </h2>
          <p className="text-sm font-bold text-slate-300">
            所持: <span className="text-amber-400 font-extrabold text-base">{pt.toLocaleString()}</span> pt
          </p>
        </div>

        {/* Free Tickets Box */}
        <div className="flex items-center justify-around p-3 rounded-2xl bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-pink-950/40 border border-pink-500/40 mb-4 text-xs sm:text-sm font-bold">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-pink-400" />
            <span className="text-slate-300">単発無料券:</span>
            <span className="text-pink-400 text-base font-black">{tickets}</span>
            <span className="text-slate-500 text-xs">枚</span>
          </div>
          <div className="w-[1px] h-6 bg-slate-700" />
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300">10連無料券:</span>
            <span className="text-amber-400 text-base font-black">{tenTickets}</span>
            <span className="text-slate-500 text-xs">枚</span>
          </div>
        </div>

        {/* Note on duplicates */}
        <p className="text-xs text-slate-400 text-center mb-3">
          ※すでに入手済みのすしが出た場合は自動売却され、ランクに応じたptが50%還元されます。
        </p>

        {/* Gacha Reel / Result Stage */}
        <div className="min-h-[140px] p-4 bg-slate-950 border-2 border-slate-800 rounded-2xl flex flex-wrap items-center justify-center gap-2.5 mb-3">
          {isSpinning ? (
            displayReel.map((item, idx) => (
              <div
                key={idx}
                className="w-20 sm:w-24 p-2 bg-slate-900 border border-slate-700 rounded-xl text-center shadow-lg animate-pulse"
              >
                <div className="text-3xl sm:text-4xl mb-1">{item.emoji}</div>
                <div className="text-[11px] font-bold text-amber-400">{item.rarity}</div>
              </div>
            ))
          ) : spinResults.length > 0 ? (
            spinResults.slice(0, 12).map((res, idx) => (
              <div
                key={idx}
                className={`w-24 sm:w-28 p-2.5 rounded-xl text-center shadow-md border ${
                  res.item.rarity === 'GOD' ? 'anim-god' : ''
                } rarity-${res.item.rarity}`}
              >
                <div className="text-3xl sm:text-4xl mb-1 select-none">{res.item.emoji}</div>
                <div className="text-xs font-black truncate">{res.item.name}</div>
                <div className="flex items-center justify-center gap-1 text-[10px] font-extrabold mt-0.5">
                  <span>{res.item.rarity}</span>
                  {res.isNew ? (
                    <span className="text-emerald-400 font-black animate-pulse">[NEW!]</span>
                  ) : (
                    <span className="text-rose-400 font-semibold">(重複)</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-slate-500">
              <div className="text-5xl mb-2">🍣</div>
              <p className="text-sm font-semibold">ボタンを押してガチャを回そう！</p>
            </div>
          )}
        </div>

        {/* Status Message */}
        {resultMessage && (
          <div className="text-center font-bold text-sm sm:text-base text-amber-300 min-h-[28px] mb-4">
            {resultMessage}
          </div>
        )}

        {/* Action Controls */}
        <div className="space-y-2.5">
          {/* Ticket buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => handleTicketSpin('single')}
              disabled={isSpinning || tickets <= 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-pink-600 hover:bg-pink-500 active:translate-y-0.5 text-white font-bold rounded-xl text-xs sm:text-sm shadow-[0_3px_#be185d] transition disabled:opacity-40 disabled:pointer-events-none"
            >
              <span>🎫 単発券で引く</span>
            </button>
            <button
              onClick={() => handleTicketSpin('ten')}
              disabled={isSpinning || tenTickets <= 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 active:translate-y-0.5 text-white font-bold rounded-xl text-xs sm:text-sm shadow-[0_3px_#6b21a8] transition disabled:opacity-40 disabled:pointer-events-none"
            >
              <span>🎟️ 10連券で引く</span>
            </button>
          </div>

          {/* Pt buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => handlePtSpin(1)}
              disabled={isSpinning || pt < gachaPrice}
              className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:translate-y-0.5 text-white font-bold rounded-xl text-xs sm:text-sm shadow-[0_3px_#3730a3] transition disabled:opacity-40"
            >
              <span>単発 ({gachaPrice.toLocaleString()} pt)</span>
            </button>
            <button
              onClick={() => handlePtSpin(10)}
              disabled={isSpinning || pt < tenCost}
              className="flex items-center gap-1 px-4 py-2 bg-pink-600 hover:bg-pink-500 active:translate-y-0.5 text-white font-bold rounded-xl text-xs sm:text-sm shadow-[0_3px_#be185d] transition disabled:opacity-40"
            >
              <span>10連 ({tenCost.toLocaleString()} pt)</span>
            </button>
            <button
              onClick={() => handlePtSpin(maxCanBuy)}
              disabled={isSpinning || maxCanBuy <= 0}
              className="flex items-center gap-1 px-4 py-2 bg-amber-600 hover:bg-amber-500 active:translate-y-0.5 text-white font-bold rounded-xl text-xs sm:text-sm shadow-[0_3px_#b45309] transition disabled:opacity-40"
            >
              <span>🔥 買えるだけ引く ({maxCanBuy}連)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
