import React from 'react';
import { UpgradeLevels, SystemConfig } from '../types/game';
import { UPGRADE_COSTS } from '../utils/storage';
import { X, DollarSign, Target, Shield, Clock, CheckCircle2 } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  pt: number;
  upgrades: UpgradeLevels;
  systemConfig: SystemConfig;
  onBuyUpgrade: (type: keyof UpgradeLevels) => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  pt,
  upgrades,
  systemConfig,
  onBuyUpgrade,
}) => {
  if (!isOpen) return null;

  const upgradeItems: {
    key: keyof UpgradeLevels;
    title: string;
    icon: React.ReactNode;
    desc: string;
    rate: number;
    unit: string;
    level: number;
  }[] = [
    {
      key: 'money',
      title: '稼げる額 (獲得ポイントUP)',
      icon: <DollarSign className="w-5 h-5 text-amber-400" />,
      desc: 'タイピング成功時の獲得ptが増加！',
      rate: systemConfig.moneyRate,
      unit: '%',
      level: upgrades.money,
    },
    {
      key: 'accuracy',
      title: '正確性 (隣接キー補正)',
      icon: <Target className="w-5 h-5 text-blue-400" />,
      desc: 'キーを押し間違えても隣接キーなら正解判定に！',
      rate: systemConfig.accuracyRate,
      unit: '%',
      level: upgrades.accuracy,
    },
    {
      key: 'guard',
      title: 'ミスの手助け (コンボガード)',
      icon: <Shield className="w-5 h-5 text-emerald-400" />,
      desc: 'ミスタイプしてもコンボが切れずに継続！',
      rate: systemConfig.guardRate,
      unit: '%',
      level: upgrades.guard,
    },
    {
      key: 'timeBoost',
      title: 'タイムブースト (時間回復)',
      icon: <Clock className="w-5 h-5 text-purple-400" />,
      desc: '寿司を食べるたびに一定確率で制限時間+1秒回復！',
      rate: systemConfig.timeBoostRate,
      unit: '%',
      level: upgrades.timeBoost,
    },
  ];

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
            <span>💪</span>
            <span>職人能力 強化訓練</span>
            <span>⚡</span>
          </h2>
          <p className="text-sm font-bold text-slate-300">
            所持: <span className="text-amber-400 font-extrabold text-base">{pt.toLocaleString()}</span> pt
          </p>
        </div>

        {/* Upgrade Cards List */}
        <div className="space-y-3">
          {upgradeItems.map(item => {
            const isMax = item.level >= 5;
            const cost = isMax ? 0 : UPGRADE_COSTS[item.level];
            const canAfford = pt >= cost;
            const currentBonus = item.level * item.rate;

            return (
              <div
                key={item.key}
                className="p-3.5 sm:p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-slate-900 border border-slate-700/60">
                      {item.icon}
                    </div>
                    <h3 className="font-black text-slate-100 text-sm sm:text-base">
                      {item.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-400">
                    {item.desc}{' '}
                    <span className="text-emerald-400 font-bold">
                      +{currentBonus}{item.unit}
                    </span>
                  </p>

                  <div className="flex items-center gap-2 text-xs font-bold pt-1">
                    <span className="text-slate-400">現在レベル:</span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full ${
                            i < item.level ? 'bg-amber-400 shadow-sm' : 'bg-slate-800 border border-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-amber-400 font-extrabold">Lv.{item.level} / 5</span>
                  </div>
                </div>

                {/* Upgrade Button */}
                <div className="shrink-0 flex items-center justify-end">
                  {isMax ? (
                    <button
                      disabled
                      className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-emerald-400 font-black text-xs sm:text-sm rounded-xl border border-emerald-500/40 opacity-80 cursor-default"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>MAX</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onBuyUpgrade(item.key)}
                      disabled={!canAfford}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:translate-y-0.5 text-white font-black text-xs sm:text-sm rounded-xl shadow-[0_3px_#047857] transition disabled:opacity-40 disabled:pointer-events-none"
                    >
                      強化 ({cost.toLocaleString()} pt)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
