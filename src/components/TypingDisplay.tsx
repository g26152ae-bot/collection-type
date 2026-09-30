import React, { useRef } from 'react';
import { SushiItem } from '../types/game';
import { Keyboard } from 'lucide-react';

interface TypingDisplayProps {
  currentSushi: SushiItem | null;
  currentPatternIndex: number;
  currentInputBuffer: string;
  isPlaying: boolean;
  onStartGame: () => void;
  onMobileInput: (char: string) => void;
}

export const TypingDisplay: React.FC<TypingDisplayProps> = ({
  currentSushi,
  currentPatternIndex,
  currentInputBuffer,
  isPlaying,
  onStartGame,
  onMobileInput,
}) => {
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const formatRomajiText = () => {
    if (!currentSushi) return { typed: '', untyped: 'READY?' };

    let fullRoma = '';
    const pattern = currentSushi.pattern;

    for (let i = 0; i < pattern.length; i++) {
      const pGroup = pattern[i] as string[] & { _chosen?: string };
      if (i < currentPatternIndex) {
        fullRoma += pGroup._chosen || pGroup[0];
      } else if (i === currentPatternIndex) {
        const matched = pGroup.find(p => p.startsWith(currentInputBuffer)) || pGroup[0];
        fullRoma += matched;
      } else {
        fullRoma += pGroup[0];
      }
    }

    let typedLength = 0;
    for (let i = 0; i < currentPatternIndex; i++) {
      const pGroup = pattern[i] as string[] & { _chosen?: string };
      typedLength += (pGroup._chosen || pGroup[0]).length;
    }
    typedLength += currentInputBuffer.length;

    return {
      typed: fullRoma.substring(0, typedLength),
      untyped: fullRoma.substring(typedLength),
    };
  };

  const { typed, untyped } = formatRomajiText();

  const handleMobileContainerClick = () => {
    if (!isPlaying) {
      onStartGame();
    }
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  };

  const handleHiddenInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.length > 0) {
      const lastChar = val[val.length - 1];
      onMobileInput(lastChar);
      e.target.value = '';
    }
  };

  return (
    <div
      onClick={handleMobileContainerClick}
      className="relative w-full p-4 sm:p-6 bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-xl text-center cursor-pointer select-none space-y-3"
    >
      {/* Hidden input to bring up mobile soft keyboard on mobile devices */}
      <input
        ref={hiddenInputRef}
        type="text"
        className="opacity-0 absolute -top-10 left-0 w-1 h-1 pointer-events-none"
        onChange={handleHiddenInputChange}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck="false"
      />

      {/* Rarity Tag */}
      <div className="flex items-center justify-center">
        {isPlaying && currentSushi ? (
          <span
            className={`px-3.5 py-0.5 rounded-full text-xs sm:text-sm font-extrabold tracking-wider uppercase shadow-sm ${
              currentSushi.rarity === 'GOD' ? 'anim-god' : ''
            } rarity-${currentSushi.rarity}`}
          >
            ★ {currentSushi.rarity}
          </span>
        ) : (
          <span className="px-3.5 py-0.5 rounded-full text-xs sm:text-sm font-bold bg-slate-800 text-slate-400 border border-slate-700">
            READY
          </span>
        )}
      </div>

      {/* Kanji & Word Name */}
      <div className="min-h-[40px] flex items-center justify-center">
        <h2 className="text-2xl sm:text-3xl font-black tracking-wide text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          {isPlaying && currentSushi ? currentSushi.name : 'スペースキー または タップで開店！'}
        </h2>
      </div>

      {/* Furigana / Kana */}
      <div className="min-h-[22px] flex items-center justify-center text-sm font-medium text-slate-400">
        {isPlaying && currentSushi ? currentSushi.kana : 'すぺーすきー で すたーと'}
      </div>

      {/* Romaji typing box */}
      <div className="p-3 sm:p-4 rounded-xl bg-slate-950 border border-slate-800 min-h-[56px] flex items-center justify-center shadow-inner overflow-hidden">
        <div className="font-mono text-xl sm:text-2xl tracking-[2px] break-all font-bold">
          <span className="text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.7)] font-black">
            {typed}
          </span>
          <span className="text-slate-300">
            {untyped}
          </span>
        </div>
      </div>

      {/* Touch keyboard hint */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
        <Keyboard className="w-3.5 h-3.5" />
        <span>PCはキーボード直接入力 / スマホは画面タップで文字入力できます</span>
      </div>
    </div>
  );
};
