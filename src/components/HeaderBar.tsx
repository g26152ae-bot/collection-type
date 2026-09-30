import React from 'react';
import { UserRole } from '../types/game';
import { 
  Trophy, 
  Dices, 
  Zap, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  Wrench, 
  User, 
  KeyRound, 
  LogOut, 
  LogIn 
} from 'lucide-react';

interface HeaderBarProps {
  currentUser: string | null;
  userRole: UserRole;
  pt: number;
  tickets: number;
  tenTickets: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenAuth: () => void;
  onOpenChangePassword: () => void;
  onLogout: () => void;
  onOpenUpgrade: () => void;
  onOpenGacha: () => void;
  onOpenZukan: () => void;
  onOpenScore: () => void;
  onOpenAdmin: () => void;
  isPlaying: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentUser,
  userRole,
  pt,
  tickets,
  tenTickets,
  isMuted,
  onToggleMute,
  onOpenAuth,
  onOpenChangePassword,
  onLogout,
  onOpenUpgrade,
  onOpenGacha,
  onOpenZukan,
  onOpenScore,
  onOpenAdmin,
  isPlaying,
}) => {
  return (
    <header className="w-full space-y-2.5">
      {/* User Auth Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-slate-900/90 border border-slate-700/70 rounded-xl text-xs sm:text-sm backdrop-blur-sm shadow-md">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-full bg-amber-500/10 text-amber-400">
            <User className="w-4 h-4" />
          </div>
          {currentUser ? (
            <div className="flex items-center gap-1.5 font-bold">
              <span className="text-slate-100">{currentUser}</span>
              {userRole === 'admin' && (
                <span className="px-2 py-0.5 text-[11px] font-extrabold bg-red-600 text-white rounded-md shadow-sm">
                  最高管理者
                </span>
              )}
              {userRole === 'subadmin' && (
                <span className="px-2 py-0.5 text-[11px] font-extrabold bg-purple-600 text-white rounded-md shadow-sm">
                  副管理者
                </span>
              )}
              {userRole === 'user' && (
                <span className="px-2 py-0.5 text-[11px] bg-slate-700 text-slate-300 rounded-md">
                  一般
                </span>
              )}
            </div>
          ) : (
            <span className="font-semibold text-slate-400">ゲスト（未ログイン）</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {!currentUser ? (
            <button
              onClick={onOpenAuth}
              disabled={isPlaying}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:translate-y-0.5 text-white font-bold rounded-lg text-xs transition shadow-sm disabled:opacity-50"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>ログイン / 新規登録</span>
            </button>
          ) : (
            <>
              <button
                onClick={onOpenChangePassword}
                disabled={isPlaying}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 active:translate-y-0.5 text-white font-semibold rounded-lg text-xs transition shadow-sm disabled:opacity-50"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>パスワード変更</span>
              </button>
              <button
                onClick={onLogout}
                disabled={isPlaying}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 active:translate-y-0.5 text-white font-semibold rounded-lg text-xs transition shadow-sm disabled:opacity-50"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>ログアウト</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Top Stats & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl shadow-lg">
        {/* Points & Tickets */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 border border-amber-500/30 rounded-lg">
            <span>💰</span>
            <span className="text-slate-400">所持:</span>
            <span className="text-amber-400 text-sm sm:text-base font-extrabold tracking-wide">
              {pt.toLocaleString()}
            </span>
            <span className="text-xs text-amber-500/80">pt</span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800/80 border border-pink-500/30 rounded-lg">
            <span>🎫</span>
            <span className="text-slate-400">単発券:</span>
            <span className="text-pink-400 font-extrabold">{tickets}</span>
            <span className="text-xs text-slate-500">枚</span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800/80 border border-amber-500/30 rounded-lg">
            <span>🎟️</span>
            <span className="text-slate-400">10連券:</span>
            <span className="text-amber-300 font-extrabold">{tenTickets}</span>
            <span className="text-xs text-slate-500">枚</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={onOpenUpgrade}
            disabled={isPlaying}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:translate-y-0.5 text-white font-bold text-xs sm:text-sm rounded-xl shadow-[0_3px_#047857] transition disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            <span>強化</span>
          </button>

          <button
            onClick={onOpenGacha}
            disabled={isPlaying}
            className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 active:translate-y-0.5 text-white font-bold text-xs sm:text-sm rounded-xl shadow-[0_3px_#6b21a8] transition disabled:opacity-50"
          >
            <Dices className="w-4 h-4" />
            <span>ガチャ</span>
          </button>

          <button
            onClick={onOpenZukan}
            disabled={isPlaying}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:translate-y-0.5 text-white font-bold text-xs sm:text-sm rounded-xl shadow-[0_3px_#1d4ed8] transition disabled:opacity-50"
          >
            <BookOpen className="w-4 h-4" />
            <span>図鑑</span>
          </button>

          <button
            onClick={onOpenScore}
            disabled={isPlaying}
            className="flex items-center gap-1 px-3 py-1.5 bg-pink-600 hover:bg-pink-500 active:translate-y-0.5 text-white font-bold text-xs sm:text-sm rounded-xl shadow-[0_3px_#be185d] transition disabled:opacity-50"
          >
            <Trophy className="w-4 h-4" />
            <span>記録</span>
          </button>

          <button
            onClick={onToggleMute}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 active:translate-y-0.5 text-slate-200 font-bold text-xs sm:text-sm rounded-xl shadow-[0_3px_#334155] transition"
            title={isMuted ? '音声をONにする' : '音声をOFFにする'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span className="hidden sm:inline">{isMuted ? 'OFF' : 'ON'}</span>
          </button>

          {(userRole === 'admin' || userRole === 'subadmin') && (
            <button
              onClick={onOpenAdmin}
              disabled={isPlaying}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-red-600 hover:bg-red-500 active:translate-y-0.5 text-white font-bold text-xs sm:text-sm rounded-xl shadow-[0_3px_#991b1b] transition disabled:opacity-50"
            >
              <Wrench className="w-4 h-4" />
              <span>管理者</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
