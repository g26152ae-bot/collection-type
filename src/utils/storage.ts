import { SystemConfig, UserAccount, UserData, RankDefinition, SushiItem } from '../types/game';
import { DEFAULT_RANKS, buildInitialSushiItems } from '../data/sushiData';
import { parseKanaToPattern } from './romaji';

export const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  gachaPrice: 1000,
  moneyRate: 10,
  accuracyRate: 15,
  guardRate: 15,
  timeBoostRate: 12,
};

export const UPGRADE_COSTS = [500, 1200, 2500, 5000, 10000];

export function loadSystemConfig(): SystemConfig {
  try {
    const raw = localStorage.getItem('sushi_system_config');
    if (raw) {
      return { ...DEFAULT_SYSTEM_CONFIG, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load system config', e);
  }
  return { ...DEFAULT_SYSTEM_CONFIG };
}

export function saveSystemConfig(cfg: SystemConfig) {
  try {
    localStorage.setItem('sushi_system_config', JSON.stringify(cfg));
  } catch (e) {
    console.error('Failed to save system config', e);
  }
}

export function getUsersDB(): Record<string, UserAccount> {
  let db: Record<string, UserAccount> = {};
  try {
    const raw = localStorage.getItem('sushi_users_db');
    if (raw) {
      db = JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load users DB', e);
  }

  // Ensure default admin exists
  if (!db['admin']) {
    db['admin'] = {
      password: 'adminadminusermasamasa0705',
      role: 'admin',
      data: {
        pt: 100000,
        tickets: 5,
        tenTickets: 2,
        unlocked: Array.from({ length: 110 }, (_, i) => i + 1),
        upgrades: { money: 1, accuracy: 1, guard: 1, timeBoost: 1 },
        scoreHistory: []
      }
    };
    saveUsersDB(db);
  }

  return db;
}

export function saveUsersDB(db: Record<string, UserAccount>) {
  try {
    localStorage.setItem('sushi_users_db', JSON.stringify(db));
  } catch (e) {
    console.error('Failed to save users DB', e);
  }
}

export function getGuestData(): UserData {
  try {
    const raw = localStorage.getItem('sushi_game_guest_data');
    if (raw) {
      const data = JSON.parse(raw);
      return {
        pt: data.pt ?? 500,
        tickets: data.tickets ?? 1,
        tenTickets: data.tenTickets ?? 0,
        unlocked: data.unlocked ?? [1, 2, 3, 4, 5],
        upgrades: {
          money: data.upgrades?.money ?? 0,
          accuracy: data.upgrades?.accuracy ?? 0,
          guard: data.upgrades?.guard ?? 0,
          timeBoost: data.upgrades?.timeBoost ?? 0,
        },
        scoreHistory: data.scoreHistory ?? [],
      };
    }
  } catch (e) {
    console.error('Failed to load guest data', e);
  }

  return {
    pt: 500,
    tickets: 1,
    tenTickets: 0,
    unlocked: [1, 2, 3, 4, 5],
    upgrades: { money: 0, accuracy: 0, guard: 0, timeBoost: 0 },
    scoreHistory: []
  };
}

export function saveGuestData(data: UserData) {
  try {
    localStorage.setItem('sushi_game_guest_data', JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save guest data', e);
  }
}

export function loadRankHierarchy(): RankDefinition[] {
  try {
    const raw = localStorage.getItem('sushi_rank_hierarchy');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load ranks', e);
  }
  return [...DEFAULT_RANKS];
}

export function saveRankHierarchy(ranks: RankDefinition[]) {
  try {
    localStorage.setItem('sushi_rank_hierarchy', JSON.stringify(ranks));
  } catch (e) {
    console.error('Failed to save ranks', e);
  }
}

export function loadAllSushiItems(): SushiItem[] {
  const baseItems = buildInitialSushiItems();
  try {
    const raw = localStorage.getItem('sushi_custom_items');
    if (raw) {
      const customItems: Omit<SushiItem, 'pattern'>[] = JSON.parse(raw);
      const parsedCustom = customItems.map(item => ({
        ...item,
        pattern: parseKanaToPattern(item.kana)
      }));
      return [...baseItems, ...parsedCustom];
    }
  } catch (e) {
    console.error('Failed to load custom items', e);
  }
  return baseItems;
}

export function saveCustomSushiItem(item: Omit<SushiItem, 'pattern'>) {
  try {
    const raw = localStorage.getItem('sushi_custom_items');
    const list: Omit<SushiItem, 'pattern'>[] = raw ? JSON.parse(raw) : [];
    list.push(item);
    localStorage.setItem('sushi_custom_items', JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save custom item', e);
  }
}
