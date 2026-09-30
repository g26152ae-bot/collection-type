import React, { useState } from 'react';
import { UserRole, SystemConfig, RankDefinition, SushiItem, UserAccount } from '../types/game';
import { X, Wrench, Plus, Users, Settings, Sparkles, Trash2, RotateCcw } from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: string | null;
  userRole: UserRole;
  systemConfig: SystemConfig;
  rankHierarchy: RankDefinition[];
  allSushi: SushiItem[];
  usersDB: Record<string, UserAccount>;
  onSelfAddPt: (amount: number) => void;
  onSelfUnlockAll: () => void;
  onSelfMaxUpgrades: () => void;
  onSelfAddTickets: (single: number, ten: number) => void;
  onAddPtToAll: (amount: number) => void;
  onUpdateSystemConfig: (cfg: SystemConfig) => void;
  onGivePtToUser: (username: string, amount: number) => void;
  onToggleSubAdmin: (username: string) => void;
  onResetUserData: (username: string) => void;
  onDeleteUser: (username: string) => void;
  onAddCustomSushi: (item: {
    name: string;
    kana: string;
    emoji: string;
    rarity: string;
  }, newRank?: { name: string; lower: string; upper: string }) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  userRole,
  systemConfig,
  rankHierarchy,
  allSushi,
  usersDB,
  onSelfAddPt,
  onSelfUnlockAll,
  onSelfMaxUpgrades,
  onSelfAddTickets,
  onAddPtToAll,
  onUpdateSystemConfig,
  onGivePtToUser,
  onToggleSubAdmin,
  onResetUserData,
  onDeleteUser,
  onAddCustomSushi,
}) => {
  // System config state
  const [cfgGachaPrice, setCfgGachaPrice] = useState(systemConfig.gachaPrice);
  const [cfgMoneyRate, setCfgMoneyRate] = useState(systemConfig.moneyRate);
  const [cfgAccuracyRate, setCfgAccuracyRate] = useState(systemConfig.accuracyRate);
  const [cfgGuardRate, setCfgGuardRate] = useState(systemConfig.guardRate);
  const [cfgTimeBoostRate, setCfgTimeBoostRate] = useState(systemConfig.timeBoostRate);

  // Batch give pt state
  const [batchPtAmount, setBatchPtAmount] = useState(5000);

  // New sushi state
  const [sushiName, setSushiName] = useState('');
  const [sushiKana, setSushiKana] = useState('');
  const [sushiEmoji, setSushiEmoji] = useState('🍣');
  const [rankMode, setRankMode] = useState<'exist' | 'new'>('exist');
  const [existRank, setExistRank] = useState(rankHierarchy[0]?.name || 'N');
  const [newRankName, setNewRankName] = useState('');
  const [posLower, setPosLower] = useState(rankHierarchy[0]?.name || 'N');
  const [posUpper, setPosUpper] = useState(rankHierarchy[1]?.name || 'R');

  if (!isOpen) return null;

  const handleSaveConfig = () => {
    onUpdateSystemConfig({
      gachaPrice: Number(cfgGachaPrice) || 1000,
      moneyRate: Number(cfgMoneyRate) || 10,
      accuracyRate: Number(cfgAccuracyRate) || 15,
      guardRate: Number(cfgGuardRate) || 15,
      timeBoostRate: Number(cfgTimeBoostRate) || 12,
    });
    alert('全プレイヤー共通システム設定を一括更新しました！');
  };

  const handleBatchPt = () => {
    if (batchPtAmount <= 0) return;
    onAddPtToAll(batchPtAmount);
    alert(`全プレイヤーに一括で ${batchPtAmount.toLocaleString()} pt を付与しました！`);
  };

  const handleCreateSushi = () => {
    if (!sushiName.trim() || !sushiKana.trim()) {
      alert('すしの名前とよみがなを入力してください！');
      return;
    }

    if (rankMode === 'exist') {
      onAddCustomSushi({
        name: sushiName.trim(),
        kana: sushiKana.trim(),
        emoji: sushiEmoji.trim() || '🍣',
        rarity: existRank,
      });
      alert(`「${sushiName}」（ランク: ${existRank}）を追加登録しました！`);
    } else {
      if (!newRankName.trim()) {
        alert('新規ランク名を入力してください！');
        return;
      }
      onAddCustomSushi(
        {
          name: sushiName.trim(),
          kana: sushiKana.trim(),
          emoji: sushiEmoji.trim() || '🍣',
          rarity: newRankName.trim().toUpperCase(),
        },
        {
          name: newRankName.trim().toUpperCase(),
          lower: posLower,
          upper: posUpper,
        }
      );
      alert(`新規ランク【${newRankName.toUpperCase()}】と寿司「${sushiName}」を追加登録しました！`);
    }

    setSushiName('');
    setSushiKana('');
    setNewRankName('');
  };

  const userEntries = Object.entries(usersDB);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border-4 border-red-600 rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black text-red-500 flex items-center justify-center gap-2">
            <Wrench className="w-6 h-6" />
            <span>管理者パネル</span>
          </h2>
          <p className="text-xs font-bold text-emerald-400">
            認証完了: {userRole === 'admin' ? '最高管理者モード' : '副管理者モード'} 動作中
          </p>
        </div>

        {/* Quick Self-Boost Operations */}
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
          <div className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>クイックデバッグ操作</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onSelfAddPt(100000)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-[0_3px_#047857]"
            >
              💰 自分の所持pt +10万pt
            </button>
            <button
              onClick={onSelfUnlockAll}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-[0_3px_#1d4ed8]"
            >
              🍣 全すし解放
            </button>
            <button
              onClick={onSelfMaxUpgrades}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-[0_3px_#6b21a8]"
            >
              💪 スキルMAX (Lv.5)
            </button>
            <button
              onClick={() => onSelfAddTickets(5, 2)}
              className="px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl shadow-[0_3px_#be185d]"
            >
              🎁 券付与 (+5単発 / +2十連)
            </button>
          </div>
        </div>

        {/* Batch Points to All Players */}
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
          <div className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>📢 全プレイヤー一括ポイント付与</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={batchPtAmount}
              onChange={e => setBatchPtAmount(Number(e.target.value))}
              placeholder="付与ポイント数"
              className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-bold"
            />
            <button
              onClick={handleBatchPt}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-[0_3px_#047857]"
            >
              全員へ一括付与！
            </button>
          </div>
        </div>

        {/* Global System Settings */}
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
          <div className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Settings className="w-4 h-4" />
            <span>⚙ 全プレイヤー共通システム設定（即時反映）</span>
          </div>
          <p className="text-[11px] text-slate-400">
            ※ここで設定を変更して保存すると、全プレイヤーのゲーム設定が即時に一括更新されます。
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-bold">ガチャ単発価格 (pt)</label>
              <input
                type="number"
                value={cfgGachaPrice}
                onChange={e => setCfgGachaPrice(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-bold">獲得pt増加率 (1Lvあたり %)</label>
              <input
                type="number"
                value={cfgMoneyRate}
                onChange={e => setCfgMoneyRate(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-bold">正確性補正率 (1Lvあたり %)</label>
              <input
                type="number"
                value={cfgAccuracyRate}
                onChange={e => setCfgAccuracyRate(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-bold">コンボガード率 (1Lvあたり %)</label>
              <input
                type="number"
                value={cfgGuardRate}
                onChange={e => setCfgGuardRate(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-slate-400 mb-1 font-bold">タイムブースト発動率 (1Lvあたり %)</label>
              <input
                type="number"
                value={cfgTimeBoostRate}
                onChange={e => setCfgTimeBoostRate(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
              />
            </div>
          </div>

          <button
            onClick={handleSaveConfig}
            className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-[0_3px_#b45309]"
          >
            🌐 システム設定を全プレイヤーへ一括適用！
          </button>
        </div>

        {/* Player Management Table */}
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
          <div className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>👥 プレイヤー管理 (個別ポイント付与・権限設定)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="bg-slate-900 text-amber-400 border border-slate-800">
                  <th className="p-2">ユーザー名</th>
                  <th className="p-2">権限</th>
                  <th className="p-2">所持pt</th>
                  <th className="p-2">図鑑</th>
                  <th className="p-2">ポイント操作</th>
                  <th className="p-2">管理操作</th>
                </tr>
              </thead>
              <tbody>
                {userEntries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-slate-500">
                      登録ユーザーはいません。
                    </td>
                  </tr>
                ) : (
                  userEntries.map(([uname, account]) => {
                    const isTargetAdmin = account.role === 'admin';
                    const isMyAccount = uname === currentUser;
                    const canManageRoles = userRole === 'admin' && !isTargetAdmin;

                    return (
                      <tr key={uname} className="border border-slate-800/80 bg-slate-900/40">
                        <td className="p-2 font-bold text-slate-100">{uname}</td>
                        <td className="p-2">
                          {account.role === 'admin' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-red-600 text-white">
                              最高管理者
                            </span>
                          )}
                          {account.role === 'subadmin' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-purple-600 text-white">
                              副管理者
                            </span>
                          )}
                          {account.role === 'user' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300">
                              一般
                            </span>
                          )}
                        </td>
                        <td className="p-2 font-black text-amber-400">
                          {account.data?.pt?.toLocaleString() ?? 0}
                        </td>
                        <td className="p-2 text-slate-300">
                          {account.data?.unlocked?.length ?? 0}/{allSushi.length}
                        </td>
                        <td className="p-2">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => onGivePtToUser(uname, 1000)}
                              className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold"
                            >
                              +1,000pt
                            </button>
                            <button
                              onClick={() => onGivePtToUser(uname, 10000)}
                              className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[10px] font-bold"
                            >
                              +1万pt
                            </button>
                          </div>
                        </td>
                        <td className="p-2">
                          {isTargetAdmin ? (
                            <span className="text-[11px] text-slate-500 font-semibold">(保護対象)</span>
                          ) : canManageRoles ? (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => onToggleSubAdmin(uname)}
                                className="px-2 py-0.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-[10px] font-bold"
                              >
                                {account.role === 'subadmin' ? '一般に戻す' : '副管理者にする'}
                              </button>
                              <button
                                onClick={() => onResetUserData(uname)}
                                className="p-1 bg-amber-600 hover:bg-amber-500 text-white rounded"
                                title="データを初期化"
                              >
                                <RotateCcw className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => onDeleteUser(uname)}
                                className="p-1 bg-red-600 hover:bg-red-500 text-white rounded"
                                title="アカウント削除"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-500">(権限なし)</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add New Custom Sushi */}
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
          <div className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            <span>➕ 新しいすしを追加登録する</span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-bold">すしの名前</label>
              <input
                type="text"
                value={sushiName}
                onChange={e => setSushiName(e.target.value)}
                placeholder="例: 特製トロあぶり"
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-bold">よみがな（ひらがな）</label>
              <input
                type="text"
                value={sushiKana}
                onChange={e => setSushiKana(e.target.value)}
                placeholder="例: とくせいとろあぶり"
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-bold">絵文字</label>
              <input
                type="text"
                value={sushiEmoji}
                onChange={e => setSushiEmoji(e.target.value)}
                placeholder="🍣"
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-bold">ランク設定モード</label>
              <select
                value={rankMode}
                onChange={e => setRankMode(e.target.value as 'exist' | 'new')}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
              >
                <option value="exist">既存のランクから選ぶ</option>
                <option value="new">新しいランクを作成して間に割り込ませる</option>
              </select>
            </div>

            {rankMode === 'exist' ? (
              <div>
                <label className="block text-slate-400 mb-1 font-bold">適用ランク</label>
                <select
                  value={existRank}
                  onChange={e => setExistRank(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
                >
                  {rankHierarchy.map(r => (
                    <option key={r.name} value={r.name}>
                      {r.name} (獲得pt: {r.pt})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="p-3 bg-slate-900 border border-amber-500/40 rounded-xl space-y-2">
                <div>
                  <label className="block text-amber-400 mb-1 font-bold">新規ランク名</label>
                  <input
                    type="text"
                    value={newRankName}
                    onChange={e => setNewRankName(e.target.value)}
                    placeholder="例: SSR+ や EX"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-amber-400 mb-1 font-bold">
                    ランクの割り込み位置指定
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={posLower}
                      onChange={e => setPosLower(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold"
                    >
                      {rankHierarchy.map(r => (
                        <option key={r.name} value={r.name}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                    <span className="text-slate-400 font-bold">と</span>
                    <select
                      value={posUpper}
                      onChange={e => setPosUpper(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold"
                    >
                      {rankHierarchy.map(r => (
                        <option key={r.name} value={r.name}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                    <span className="text-slate-400 font-bold">の間</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleCreateSushi}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-[0_3px_#047857]"
          >
            ✨ 新しいすしを追加登録！
          </button>
        </div>
      </div>
    </div>
  );
};
