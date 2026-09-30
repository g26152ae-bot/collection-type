/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SushiItem, UpgradeLevels, ScoreRecord, UserRole, SystemConfig, RankDefinition } from './types/game';
import { TIME_BONUS_ITEMS } from './data/sushiData';
import { sounds } from './utils/sound';
import { isAdjacentKey } from './utils/romaji';
import {
  loadSystemConfig,
  saveSystemConfig,
  getUsersDB,
  saveUsersDB,
  getGuestData,
  saveGuestData,
  loadRankHierarchy,
  saveRankHierarchy,
  loadAllSushiItems,
  saveCustomSushiItem,
} from './utils/storage';

import { HeaderBar } from './components/HeaderBar';
import { LaneDisplay } from './components/LaneDisplay';
import { TypingDisplay } from './components/TypingDisplay';
import { ResultSection } from './components/ResultSection';
import { GachaModal } from './components/GachaModal';
import { ZukanModal } from './components/ZukanModal';
import { UpgradeModal } from './components/UpgradeModal';
import { ScoreModal } from './components/ScoreModal';
import { AdminModal } from './components/AdminModal';
import { AuthModal, ChangePasswordModal } from './components/AuthModals';
import { Play } from 'lucide-react';

export default function App() {
  // System Config & Ranks
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(loadSystemConfig);
  const [rankHierarchy, setRankHierarchy] = useState<RankDefinition[]>(loadRankHierarchy);
  const [allSushi, setAllSushi] = useState<SushiItem[]>(loadAllSushiItems);

  // User & DB State
  const [usersDB, setUsersDB] = useState(getUsersDB);
  const [currentUser, setCurrentUser] = useState<string | null>('admin'); // Default login as admin for smooth preview
  const [userRole, setUserRole] = useState<UserRole>('admin');

  // Player Economy & Progress State
  const [pt, setPt] = useState<number>(100000);
  const [tickets, setTickets] = useState<number>(5);
  const [tenTickets, setTenTickets] = useState<number>(2);
  const [unlockedSet, setUnlockedSet] = useState<Set<number>>(new Set(Array.from({ length: 110 }, (_, i) => i + 1)));
  const [upgrades, setUpgrades] = useState<UpgradeLevels>({ money: 1, accuracy: 1, guard: 1, timeBoost: 1 });
  const [scoreHistory, setScoreHistory] = useState<ScoreRecord[]>([]);

  // Sound Mute State
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Modals Visibility State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isChangePassOpen, setIsChangePassOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isGachaOpen, setIsGachaOpen] = useState(false);
  const [isZukanOpen, setIsZukanOpen] = useState(false);
  const [isScoreOpen, setIsScoreOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // In-Game State
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTimeLimit, setSelectedTimeLimit] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [missCount, setMissCount] = useState(0);
  const [totalTypedChars, setTotalTypedChars] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isFeverMode, setIsFeverMode] = useState(false);
  const [isEating, setIsEating] = useState(false);
  const [isBonusLane, setIsBonusLane] = useState(false);
  const [timePop, setTimePop] = useState<string | null>(null);
  const [earnedSessionPt, setEarnedSessionPt] = useState(0);

  const [currentSushi, setCurrentSushi] = useState<SushiItem | null>(null);
  const [currentPatternIndex, setCurrentPatternIndex] = useState(0);
  const [currentInputBuffer, setCurrentInputBuffer] = useState('');

  // Result Section State
  const [showResult, setShowResult] = useState(false);
  const [resultRankText, setResultRankText] = useState('');
  const [resultAccuracy, setResultAccuracy] = useState(0);
  const [dropMessage, setDropMessage] = useState<string | null>(null);

  // Refs for timer and state access in event handlers
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const currentSushiRef = useRef(currentSushi);
  currentSushiRef.current = currentSushi;

  const currentPatternIndexRef = useRef(currentPatternIndex);
  currentPatternIndexRef.current = currentPatternIndex;

  const currentInputBufferRef = useRef(currentInputBuffer);
  currentInputBufferRef.current = currentInputBuffer;

  const comboRef = useRef(combo);
  comboRef.current = combo;

  const isFeverModeRef = useRef(isFeverMode);
  isFeverModeRef.current = isFeverMode;

  const upgradesRef = useRef(upgrades);
  upgradesRef.current = upgrades;

  const systemConfigRef = useRef(systemConfig);
  systemConfigRef.current = systemConfig;

  const rankHierarchyRef = useRef(rankHierarchy);
  rankHierarchyRef.current = rankHierarchy;

  const timeLeftRef = useRef(timeLeft);
  timeLeftRef.current = timeLeft;

  // Load User Data based on current username
  const loadUserDataFor = useCallback((username: string | null) => {
    const db = getUsersDB();
    setUsersDB(db);

    if (username && db[username]) {
      const u = db[username];
      setUserRole(u.role);
      setPt(u.data.pt ?? 0);
      setTickets(u.data.tickets ?? 0);
      setTenTickets(u.data.tenTickets ?? 0);
      setUnlockedSet(new Set(u.data.unlocked ?? [1, 2, 3, 4, 5]));
      setUpgrades(u.data.upgrades ?? { money: 0, accuracy: 0, guard: 0, timeBoost: 0 });
      setScoreHistory(u.data.scoreHistory ?? []);
    } else {
      setUserRole('user');
      const guest = getGuestData();
      setPt(guest.pt);
      setTickets(guest.tickets);
      setTenTickets(guest.tenTickets);
      setUnlockedSet(new Set(guest.unlocked));
      setUpgrades(guest.upgrades);
      setScoreHistory(guest.scoreHistory);
    }
  }, []);

  // Sync state to local storage
  const persistUserData = useCallback(() => {
    if (currentUser) {
      const db = getUsersDB();
      if (db[currentUser]) {
        db[currentUser].data = {
          pt,
          tickets,
          tenTickets,
          unlocked: Array.from(unlockedSet),
          upgrades,
          scoreHistory,
        };
        saveUsersDB(db);
        setUsersDB({ ...db });
      }
    } else {
      saveGuestData({
        pt,
        tickets,
        tenTickets,
        unlocked: Array.from(unlockedSet),
        upgrades,
        scoreHistory,
      });
    }
  }, [currentUser, pt, tickets, tenTickets, unlockedSet, upgrades, scoreHistory]);

  useEffect(() => {
    persistUserData();
  }, [pt, tickets, tenTickets, unlockedSet, upgrades, scoreHistory, persistUserData]);

  // Initial load
  useEffect(() => {
    loadUserDataFor(currentUser);
  }, [currentUser, loadUserDataFor]);

  // Next Word Selector
  const pickNextSushi = useCallback(() => {
    setIsEating(false);

    let nextItem: SushiItem;
    if (Math.random() < 0.08) {
      nextItem = TIME_BONUS_ITEMS[Math.floor(Math.random() * TIME_BONUS_ITEMS.length)];
      setIsBonusLane(true);
    } else {
      setIsBonusLane(false);
      const availablePool = allSushi.filter(s => unlockedSet.has(s.id));
      const pool = availablePool.length > 0 ? availablePool : allSushi;
      nextItem = pool[Math.floor(Math.random() * pool.length)];
    }

    // Clone pattern to avoid mutation
    const itemCopy: SushiItem = {
      ...nextItem,
      pattern: nextItem.pattern.map(p => [...p]),
    };

    setCurrentSushi(itemCopy);
    setCurrentPatternIndex(0);
    setCurrentInputBuffer('');
  }, [allSushi, unlockedSet]);

  // End Game
  const endGame = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsPlaying(false);
    setIsFeverMode(false);
    setIsBonusLane(false);

    const totalAttempts = totalTypedChars + missCount;
    const finalAccuracy = totalAttempts === 0 ? 0 : Math.round((totalTypedChars / totalAttempts) * 100);
    setResultAccuracy(finalAccuracy);

    let rankText = '🍵 見習い職人 (Cランク)';
    if (score >= 45 && finalAccuracy >= 95) {
      rankText = '👑 伝説の神速寿司職人 (Sランク)';
    } else if (score >= 30 && finalAccuracy >= 90) {
      rankText = '🍣 名物大将 (Aランク)';
    } else if (score >= 15 && finalAccuracy >= 80) {
      rankText = '🐟 一人前職人 (Bランク)';
    } else if (score >= 5) {
      rankText = '🍵 見習い職人 (Cランク)';
    } else {
      rankText = '🧹 皿洗いに逆戻り (Dランク)';
    }
    setResultRankText(rankText);

    // Drop ticket chances
    let droppedMsg: string | null = null;
    const roll = Math.random();
    if (roll < 0.03) {
      setTenTickets(prev => prev + 1);
      droppedMsg = '🎟 超激レア！【十連ガチャ無料券】を獲得しました！';
      sounds.play('jackpot');
    } else if (roll < 0.12) {
      setTickets(prev => prev + 1);
      droppedMsg = '🎫 当たり！【ガチャ無料券】を獲得しました！';
      sounds.play('fanfare');
    }
    setDropMessage(droppedMsg);

    // Record score history
    const record: ScoreRecord = {
      id: `${Date.now()}`,
      date: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
      score,
      accuracy: finalAccuracy,
      rank: rankText,
      timeLimit: selectedTimeLimit,
      earnedPt: earnedSessionPt,
    };
    setScoreHistory(prev => [record, ...prev.slice(0, 9)]);
    setShowResult(true);
  }, [earnedSessionPt, missCount, score, selectedTimeLimit, totalTypedChars]);

  // Start Game
  const startGame = useCallback(() => {
    if (isPlaying) return;

    setShowResult(false);
    setScore(0);
    setMissCount(0);
    setTotalTypedChars(0);
    setCombo(0);
    setIsFeverMode(false);
    setEarnedSessionPt(0);
    setTimeLeft(selectedTimeLimit);
    setIsPlaying(true);

    pickNextSushi();

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [isPlaying, selectedTimeLimit, pickNextSushi, endGame]);

  // Handle Character Input
  const handleCharInput = useCallback(
    (inputChar: string) => {
      if (!isPlayingRef.current || !currentSushiRef.current) return;

      const sushi = currentSushiRef.current;
      const patternIdx = currentPatternIndexRef.current;
      const inputBuffer = currentInputBufferRef.current;
      const patterns = sushi.pattern[patternIdx];

      let typedChar = inputChar.toLowerCase();
      let testBuffer = inputBuffer + typedChar;
      let matchedPattern = patterns.find(p => p.startsWith(testBuffer));

      // Accuracy Skill Check (Adjacent key auto-assist)
      const curUpgrades = upgradesRef.current;
      const curConfig = systemConfigRef.current;

      if (!matchedPattern && curUpgrades.accuracy > 0) {
        const accuracyChance = curUpgrades.accuracy * (curConfig.accuracyRate / 100);
        if (Math.random() < accuracyChance) {
          for (const p of patterns) {
            const expectedChar = p[inputBuffer.length];
            if (expectedChar && isAdjacentKey(typedChar, expectedChar)) {
              typedChar = expectedChar;
              testBuffer = inputBuffer + typedChar;
              matchedPattern = p;
              break;
            }
          }
        }
      }

      if (matchedPattern) {
        sounds.play('type');
        setTotalTypedChars(prev => prev + 1);

        const newCombo = comboRef.current + 1;
        setCombo(newCombo);

        if (newCombo > 0 && newCombo % 10 === 0) {
          setIsFeverMode(true);
          sounds.play('fever');
        }

        const exactMatch = patterns.find(p => p === testBuffer);
        if (exactMatch) {
          (patterns as string[] & { _chosen?: string })._chosen = exactMatch;
          const nextPatternIdx = patternIdx + 1;

          if (nextPatternIdx === sushi.pattern.length) {
            // Eaten Sushi!
            sounds.play('eat');
            setIsEating(true);

            // Time Boost Skill Check
            if (curUpgrades.timeBoost > 0) {
              const boostChance = curUpgrades.timeBoost * (curConfig.timeBoostRate / 100);
              if (Math.random() < boostChance) {
                setTimeLeft(t => Math.min(600, t + 1));
              }
            }

            // Bonus Time Food check
            if (sushi.bonusTime) {
              setTimeLeft(t => Math.min(600, t + (sushi.bonusTime || 0)));
              sounds.play('timeBonus');
              setTimePop(`+${sushi.bonusTime}秒！`);
              setTimeout(() => setTimePop(null), 850);
            }

            // Pt calculation
            const rankObj = rankHierarchyRef.current.find(r => r.name === sushi.rarity);
            const basePt = rankObj ? rankObj.pt : 100;
            let multiplier = 1 + curUpgrades.money * (curConfig.moneyRate / 100);
            if (isFeverModeRef.current) multiplier *= 2;
            const rewardPt = Math.round(basePt * multiplier);

            setPt(p => p + rewardPt);
            setEarnedSessionPt(prev => prev + rewardPt);
            setScore(s => s + 1);

            setTimeout(() => {
              pickNextSushi();
            }, 120);
          } else {
            setCurrentPatternIndex(nextPatternIdx);
            setCurrentInputBuffer('');
          }
        } else {
          setCurrentInputBuffer(testBuffer);
        }
      } else {
        // Mistake / Guard check
        const guardChance = curUpgrades.guard * (curConfig.guardRate / 100);
        if (curUpgrades.guard > 0 && Math.random() < guardChance) {
          sounds.play('type');
        } else {
          sounds.play('miss');
          setMissCount(m => m + 1);
          setCombo(0);
          setIsFeverMode(false);
        }
      }
    },
    [pickNextSushi]
  );

  // Global Keydown Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space to start/restart when not playing
      if (!isPlayingRef.current) {
        const anyModalOpen =
          isAuthOpen || isChangePassOpen || isUpgradeOpen || isGachaOpen || isZukanOpen || isScoreOpen || isAdminOpen;
        if (e.key === ' ' && !anyModalOpen) {
          e.preventDefault();
          startGame();
        }
        return;
      }

      if (e.key === ' ') {
        e.preventDefault();
        return;
      }

      if (e.key.length === 1 && /[a-z-]/i.test(e.key)) {
        e.preventDefault();
        handleCharInput(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    startGame,
    handleCharInput,
    isAuthOpen,
    isChangePassOpen,
    isUpgradeOpen,
    isGachaOpen,
    isZukanOpen,
    isScoreOpen,
    isAdminOpen,
  ]);

  // Audio Toggle
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    sounds.setMuted(nextMute);
  };

  // Auth Operations
  const handleLogin = (name: string, pass: string): boolean => {
    const db = getUsersDB();
    if (!db[name]) {
      alert('ユーザーが存在しません。「新規登録」を行ってください。');
      return false;
    }
    if (db[name].password !== pass) {
      alert('パスワードが正しくありません。');
      return false;
    }
    setCurrentUser(name);
    loadUserDataFor(name);
    alert(`ようこそ、${name}さん！`);
    return true;
  };

  const handleRegister = (name: string, pass: string): boolean => {
    const db = getUsersDB();
    if (db[name]) {
      alert('そのユーザー名は既に使用されています。');
      return false;
    }
    db[name] = {
      password: pass,
      role: 'user',
      data: {
        pt: 1000,
        tickets: 2,
        tenTickets: 0,
        unlocked: [1, 2, 3, 4, 5],
        upgrades: { money: 0, accuracy: 0, guard: 0, timeBoost: 0 },
        scoreHistory: [],
      },
    };
    saveUsersDB(db);
    setCurrentUser(name);
    loadUserDataFor(name);
    alert(`アカウント「${name}」を新規作成しました！`);
    return true;
  };

  const handleChangePassword = (currentPass: string, newPass: string): boolean => {
    if (!currentUser) return false;
    const db = getUsersDB();
    if (db[currentUser].password !== currentPass) {
      alert('現在のパスワードが正しくありません。');
      return false;
    }
    db[currentUser].password = newPass;
    saveUsersDB(db);
    alert('パスワードを変更しました！');
    return true;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    loadUserDataFor(null);
    alert('ログアウトしました。ゲストモードでプレイできます。');
  };

  // Upgrade Buy
  const handleBuyUpgrade = (type: keyof UpgradeLevels) => {
    const currentLv = upgrades[type];
    if (currentLv >= 5) return;
    const costs = [500, 1200, 2500, 5000, 10000];
    const cost = costs[currentLv];
    if (pt < cost) {
      alert('ポイントが足りません！');
      return;
    }
    setPt(prev => prev - cost);
    setUpgrades(prev => ({ ...prev, [type]: prev[type] + 1 }));
    sounds.play('fanfare');
  };

  // Admin Operations
  const handleSelfAddPt = (amount: number) => {
    setPt(prev => prev + amount);
    sounds.play('fanfare');
    alert(`${amount.toLocaleString()} pt を追加しました！`);
  };

  const handleSelfUnlockAll = () => {
    const allIds = allSushi.map(s => s.id);
    setUnlockedSet(new Set(allIds));
    sounds.play('fanfare');
    alert('全すしを解放しました！');
  };

  const handleSelfMaxUpgrades = () => {
    setUpgrades({ money: 5, accuracy: 5, guard: 5, timeBoost: 5 });
    sounds.play('fanfare');
    alert('全スキルをMAX（Lv.5）にしました！');
  };

  const handleSelfAddTickets = (single: number, ten: number) => {
    setTickets(prev => prev + single);
    setTenTickets(prev => prev + ten);
    sounds.play('fanfare');
    alert(`ガチャ無料券 +${single}枚 / 10連無料券 +${ten}枚 を付与しました！`);
  };

  const handleAddPtToAll = (amount: number) => {
    const db = getUsersDB();
    Object.keys(db).forEach(u => {
      if (!db[u].data) db[u].data = {} as any;
      db[u].data.pt = (db[u].data.pt || 0) + amount;
    });
    saveUsersDB(db);
    setUsersDB({ ...db });
    setPt(prev => prev + amount);
  };

  const handleUpdateSystemConfig = (cfg: SystemConfig) => {
    setSystemConfig(cfg);
    saveSystemConfig(cfg);
  };

  const handleGivePtToUser = (username: string, amount: number) => {
    const db = getUsersDB();
    if (!db[username]) return;
    if (!db[username].data) db[username].data = {} as any;
    db[username].data.pt = (db[username].data.pt || 0) + amount;
    saveUsersDB(db);
    setUsersDB({ ...db });
    if (username === currentUser) {
      setPt(db[username].data.pt);
    }
    alert(`「${username}」に ${amount.toLocaleString()} pt を付与しました！`);
  };

  const handleToggleSubAdmin = (username: string) => {
    const db = getUsersDB();
    if (!db[username] || db[username].role === 'admin') return;
    const newRole: UserRole = db[username].role === 'subadmin' ? 'user' : 'subadmin';
    db[username].role = newRole;
    saveUsersDB(db);
    setUsersDB({ ...db });
    if (username === currentUser) {
      setUserRole(newRole);
    }
    alert(`「${username}」の権限を【${newRole === 'subadmin' ? '副管理者' : '一般'}】に変更しました。`);
  };

  const handleResetUserData = (username: string) => {
    if (!confirm(`「${username}」のプレイヤーデータを初期化しますか？`)) return;
    const db = getUsersDB();
    if (!db[username]) return;
    db[username].data = {
      pt: 0,
      tickets: 0,
      tenTickets: 0,
      unlocked: [1, 2, 3, 4, 5],
      upgrades: { money: 0, accuracy: 0, guard: 0, timeBoost: 0 },
      scoreHistory: [],
    };
    saveUsersDB(db);
    setUsersDB({ ...db });
    if (username === currentUser) {
      loadUserDataFor(username);
    }
    alert(`「${username}」のデータを初期化しました。`);
  };

  const handleDeleteUser = (username: string) => {
    if (!confirm(`アカウント「${username}」を完全に削除しますか？`)) return;
    const db = getUsersDB();
    delete db[username];
    saveUsersDB(db);
    setUsersDB({ ...db });
    if (username === currentUser) {
      handleLogout();
    }
    alert(`「${username}」を削除しました。`);
  };

  const handleAddCustomSushi = (
    item: { name: string; kana: string; emoji: string; rarity: string },
    newRank?: { name: string; lower: string; upper: string }
  ) => {
    let updatedRanks = [...rankHierarchy];

    if (newRank) {
      const idxLower = updatedRanks.findIndex(r => r.name === newRank.lower);
      const idxUpper = updatedRanks.findIndex(r => r.name === newRank.upper);
      const lowerPt = updatedRanks[idxLower]?.pt ?? 100;
      const upperPt = updatedRanks[idxUpper]?.pt ?? 300;
      const lowerRate = updatedRanks[idxLower]?.rate ?? 20;
      const upperRate = updatedRanks[idxUpper]?.rate ?? 10;

      const calcPt = Math.round((lowerPt + upperPt) / 2);
      const calcRate = Math.max(0.1, Number(((lowerRate + upperRate) / 2).toFixed(2)));

      const insertIndex = Math.min(idxLower, idxUpper) + 1;
      updatedRanks.splice(insertIndex, 0, {
        name: newRank.name,
        pt: calcPt,
        rate: calcRate,
      });

      setRankHierarchy(updatedRanks);
      saveRankHierarchy(updatedRanks);
    }

    const newId = Date.now();
    const rawCustom = {
      id: newId,
      name: item.name,
      kana: item.kana,
      emoji: item.emoji,
      rarity: item.rarity,
    };
    saveCustomSushiItem(rawCustom);

    const reloaded = loadAllSushiItems();
    setAllSushi(reloaded);
    setUnlockedSet(prev => new Set([...prev, newId]));
  };

  // Format time text (e.g. 1分00秒 or 30秒)
  const formatTime = (sec: number) => {
    if (sec >= 60) {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m}分${s < 10 ? '0' : ''}${s}秒`;
    }
    return `${sec}秒`;
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-3 sm:p-6 select-none font-sans">
      <div className="w-full max-w-3xl bg-slate-900 border-4 border-amber-500 rounded-3xl p-4 sm:p-7 shadow-[0_12px_45px_rgba(0,0,0,0.8)] relative space-y-4">
        {/* Main Title Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wider">
            🍣 すしコレクション！タイピング
          </h1>
          <p className="text-xs text-slate-400 font-semibold">
            110種以上の寿司をコンプリートせよ！ガチャ回転寿司タイピング
          </p>
        </div>

        {/* Top Header Bar */}
        <HeaderBar
          currentUser={currentUser}
          userRole={userRole}
          pt={pt}
          tickets={tickets}
          tenTickets={tenTickets}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenChangePassword={() => setIsChangePassOpen(true)}
          onLogout={handleLogout}
          onOpenUpgrade={() => setIsUpgradeOpen(true)}
          onOpenGacha={() => setIsGachaOpen(true)}
          onOpenZukan={() => setIsZukanOpen(true)}
          onOpenScore={() => setIsScoreOpen(true)}
          onOpenAdmin={() => setIsAdminOpen(true)}
          isPlaying={isPlaying}
        />

        {/* Stats Row (Time & Plates) */}
        <div className="flex items-center justify-around p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs sm:text-sm font-extrabold shadow-inner">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">残り時間:</span>
            <span className={`text-sm sm:text-base ${timeLeft <= 10 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          <div className="w-[1px] h-5 bg-slate-800" />

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">食べた皿:</span>
            <span className="text-sm sm:text-base text-emerald-400">{score}</span>
            <span className="text-xs text-slate-500">皿</span>
          </div>
        </div>

        {/* Conveyor Belt Display */}
        <LaneDisplay
          currentSushi={currentSushi}
          isFeverMode={isFeverMode}
          isBonusLane={isBonusLane}
          isEating={isEating}
          timePop={timePop}
          combo={combo}
        />

        {/* Typing Word Display */}
        <TypingDisplay
          currentSushi={currentSushi}
          currentPatternIndex={currentPatternIndex}
          currentInputBuffer={currentInputBuffer}
          isPlaying={isPlaying}
          onStartGame={startGame}
          onMobileInput={handleCharInput}
        />

        {/* Game Result Section */}
        {showResult && (
          <ResultSection
            score={score}
            accuracy={resultAccuracy}
            earnedPt={earnedSessionPt}
            rankText={resultRankText}
            dropMessage={dropMessage}
            selectedTime={selectedTimeLimit}
            onChangeTime={setSelectedTimeLimit}
            onRestart={startGame}
          />
        )}

        {/* Time Setting & Start Controls (When Not Playing and Not showing result) */}
        {!isPlaying && !showResult && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-300">
              <label htmlFor="time-select">⏱️ 制限時間設定:</label>
              <select
                id="time-select"
                value={selectedTimeLimit}
                onChange={e => setSelectedTimeLimit(Number(e.target.value))}
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
              onClick={startGame}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-400 active:translate-y-0.5 text-slate-950 font-black text-base rounded-2xl shadow-[0_4px_#b45309] transition"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>開店する（Space）</span>
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      <ChangePasswordModal
        isOpen={isChangePassOpen}
        onClose={() => setIsChangePassOpen(false)}
        onChangePassword={handleChangePassword}
      />

      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        pt={pt}
        upgrades={upgrades}
        systemConfig={systemConfig}
        onBuyUpgrade={handleBuyUpgrade}
      />

      <GachaModal
        isOpen={isGachaOpen}
        onClose={() => setIsGachaOpen(false)}
        pt={pt}
        tickets={tickets}
        tenTickets={tenTickets}
        gachaPrice={systemConfig.gachaPrice}
        allSushi={allSushi}
        unlockedSet={unlockedSet}
        rankHierarchy={rankHierarchy}
        onConsumeTickets={type => {
          if (type === 'single') setTickets(t => Math.max(0, t - 1));
          else setTenTickets(t => Math.max(0, t - 1));
        }}
        onSpendPt={cost => setPt(p => Math.max(0, p - cost))}
        onAddPt={bonus => setPt(p => p + bonus)}
        onUnlockSushi={ids => setUnlockedSet(prev => new Set([...prev, ...ids]))}
      />

      <ZukanModal
        isOpen={isZukanOpen}
        onClose={() => setIsZukanOpen(false)}
        allSushi={allSushi}
        unlockedSet={unlockedSet}
      />

      <ScoreModal
        isOpen={isScoreOpen}
        onClose={() => setIsScoreOpen(false)}
        scores={scoreHistory}
      />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        currentUser={currentUser}
        userRole={userRole}
        systemConfig={systemConfig}
        rankHierarchy={rankHierarchy}
        allSushi={allSushi}
        usersDB={usersDB}
        onSelfAddPt={handleSelfAddPt}
        onSelfUnlockAll={handleSelfUnlockAll}
        onSelfMaxUpgrades={handleSelfMaxUpgrades}
        onSelfAddTickets={handleSelfAddTickets}
        onAddPtToAll={handleAddPtToAll}
        onUpdateSystemConfig={handleUpdateSystemConfig}
        onGivePtToUser={handleGivePtToUser}
        onToggleSubAdmin={handleToggleSubAdmin}
        onResetUserData={handleResetUserData}
        onDeleteUser={handleDeleteUser}
        onAddCustomSushi={handleAddCustomSushi}
      />
    </main>
  );
}
