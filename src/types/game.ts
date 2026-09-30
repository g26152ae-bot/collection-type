export type RarityLevel = 'N' | 'R' | 'SR' | 'SSR' | 'UR' | 'GOD' | 'TIME' | string;

export interface RankDefinition {
  name: string;
  pt: number;
  rate: number;
}

export interface SushiItem {
  id: number;
  name: string;
  kana: string;
  emoji: string;
  rarity: RarityLevel;
  pattern: string[][];
  bonusTime?: number;
}

export interface UpgradeLevels {
  money: number;
  accuracy: number;
  guard: number;
  timeBoost: number;
}

export interface ScoreRecord {
  id: string;
  date: string;
  score: number;
  accuracy: number;
  rank: string;
  timeLimit: number;
  earnedPt: number;
}

export interface UserData {
  pt: number;
  tickets: number;
  tenTickets: number;
  unlocked: number[];
  upgrades: UpgradeLevels;
  scoreHistory: ScoreRecord[];
}

export type UserRole = 'admin' | 'subadmin' | 'user';

export interface UserAccount {
  password: string;
  role: UserRole;
  data: UserData;
}

export interface SystemConfig {
  gachaPrice: number;
  moneyRate: number;      // % increase per Lv
  accuracyRate: number;   // % tolerance per Lv
  guardRate: number;      // % guard chance per Lv
  timeBoostRate: number;  // % bonus time trigger chance per Lv
}
