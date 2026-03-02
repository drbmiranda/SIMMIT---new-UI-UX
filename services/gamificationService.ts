import { supabase } from './supabaseClient';

export type GamificationState = {
  packsAvailable: number;
  nextPackAt: number | null;
  caseCredits: number;
  flashcardCredits: number;
  focusEnergy: number;
  hourglasses: number;
  resiliencePoints: number;
  medPoints: number;
  neuroGems: number;
  streakDays: number;
  lastStreakDate: string | null;
  lastActivityDate: string | null;
  cardsUnlocked: number;
  updatedAt: number;
};

export type GamificationReward = {
  packsDelta?: number;
  focusEnergyDelta?: number;
  hourglassesDelta?: number;
  resiliencePointsDelta?: number;
  medPointsDelta?: number;
  neuroGemsDelta?: number;
  cardsDelta?: number;
};

const STORAGE_KEY = 'simmit-gamification';
const MAX_PACKS = 2;
const DAY_MS = 24 * 60 * 60 * 1000;

const defaultState: GamificationState = {
  packsAvailable: 2,
  nextPackAt: null,
  caseCredits: 2,
  flashcardCredits: 0,
  focusEnergy: 6,
  hourglasses: 1,
  resiliencePoints: 0,
  medPoints: 0,
  neuroGems: 0,
  streakDays: 0,
  lastStreakDate: null,
  lastActivityDate: null,
  cardsUnlocked: 0,
  updatedAt: Date.now(),
};

const notifyUpdate = (state: GamificationState) => {
  window.dispatchEvent(new CustomEvent('simmit-gamification-updated', { detail: state }));
};

const sanitizeState = (state: Partial<GamificationState>): GamificationState => ({
  ...defaultState,
  ...state,
  packsAvailable: typeof state.packsAvailable === 'number' ? state.packsAvailable : defaultState.packsAvailable,
  focusEnergy: typeof state.focusEnergy === 'number' ? state.focusEnergy : defaultState.focusEnergy,
  hourglasses: typeof state.hourglasses === 'number' ? state.hourglasses : defaultState.hourglasses,
  resiliencePoints: typeof state.resiliencePoints === 'number' ? state.resiliencePoints : defaultState.resiliencePoints,
  medPoints: typeof state.medPoints === 'number' ? state.medPoints : defaultState.medPoints,
  neuroGems: typeof state.neuroGems === 'number' ? state.neuroGems : defaultState.neuroGems,
  caseCredits: typeof state.caseCredits === 'number' ? state.caseCredits : defaultState.caseCredits,
  flashcardCredits: typeof state.flashcardCredits === 'number' ? state.flashcardCredits : defaultState.flashcardCredits,
  streakDays: typeof state.streakDays === 'number' ? state.streakDays : defaultState.streakDays,
  lastActivityDate: typeof state.lastActivityDate === 'string' ? state.lastActivityDate : defaultState.lastActivityDate,
  cardsUnlocked: typeof state.cardsUnlocked === 'number' ? state.cardsUnlocked : defaultState.cardsUnlocked,
  updatedAt: typeof state.updatedAt === 'number' ? state.updatedAt : Date.now(),
});

const getLocalDateKey = (date = new Date()) => date.toLocaleDateString('en-CA');

const getDayDiff = (fromKey: string, toKey: string) => {
  const fromDate = new Date(`${fromKey}T00:00:00`);
  const toDate = new Date(`${toKey}T00:00:00`);
  return Math.floor((toDate.getTime() - fromDate.getTime()) / DAY_MS);
};

const applyDailyLoginBonus = (state: GamificationState) => {
  const todayKey = getLocalDateKey();
  if (state.lastActivityDate === todayKey) {
    return { state, changed: false };
  }

  let nextStreak = 1;
  if (state.lastActivityDate) {
    const diff = getDayDiff(state.lastActivityDate, todayKey);
    nextStreak = diff === 1 ? state.streakDays + 1 : 1;
  }

  let bonusMedPoints = 10;
  let bonusNeuroGems = 0;
  if (nextStreak > 0 && nextStreak % 5 === 0) {
    bonusMedPoints += 200;
    bonusNeuroGems += 3;
  }

  const nextState: GamificationState = {
    ...state,
    streakDays: nextStreak,
    lastActivityDate: todayKey,
    caseCredits: state.caseCredits + 2,
    medPoints: state.medPoints + bonusMedPoints,
    neuroGems: state.neuroGems + bonusNeuroGems,
  };

  return { state: nextState, changed: true };
};

export const loadGamificationState = (): GamificationState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultState;
    const parsed = JSON.parse(saved) as Partial<GamificationState>;
    return sanitizeState(parsed);
  } catch (error) {
    console.error('Falha ao carregar gamificacao do localStorage', error);
    localStorage.removeItem(STORAGE_KEY);
    return defaultState;
  }
};

export const saveGamificationState = (state: GamificationState) => {
  const updated = { ...state, updatedAt: Date.now() };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Falha ao salvar gamificacao no localStorage', error);
  }
  notifyUpdate(updated);
  return updated;
};

export const applyGamificationReward = (reward: GamificationReward) => {
  const current = loadGamificationState();
  const packsDelta = reward.packsDelta ?? 0;
  const nextPacks = Math.min(MAX_PACKS, Math.max(current.packsAvailable + packsDelta, 0));

  let nextPackAt = current.nextPackAt;
  if (current.packsAvailable === 0 && nextPacks > 0) {
    nextPackAt = null;
  }
  if (nextPacks === 0 && current.packsAvailable > 0 && !current.nextPackAt) {
    nextPackAt = Date.now() + 24 * 60 * 60 * 1000;
  }

  const nextState: GamificationState = {
    ...current,
    packsAvailable: nextPacks,
    nextPackAt,
    focusEnergy: current.focusEnergy + (reward.focusEnergyDelta ?? 0),
    hourglasses: current.hourglasses + (reward.hourglassesDelta ?? 0),
    resiliencePoints: current.resiliencePoints + (reward.resiliencePointsDelta ?? 0),
    medPoints: current.medPoints + (reward.medPointsDelta ?? 0),
    neuroGems: current.neuroGems + (reward.neuroGemsDelta ?? 0),
    cardsUnlocked: Math.max(current.cardsUnlocked + (reward.cardsDelta ?? 0), 0),
    caseCredits: current.caseCredits,
    flashcardCredits: current.flashcardCredits,
  };

  return saveGamificationState(nextState);
};

export const fetchRemoteGamificationState = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('gamification_state')
      .select('state, updated_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    const parsed = data.state as Partial<GamificationState>;
    const updatedAt = data.updated_at ? Date.parse(data.updated_at) : Date.now();
    return sanitizeState({ ...parsed, updatedAt });
  } catch (error) {
    console.warn('Falha ao buscar gamificacao remota', error);
    return null;
  }
};

export const saveRemoteGamificationState = async (userId: string, state: GamificationState) => {
  try {
    const payload = {
      user_id: userId,
      state: state,
      updated_at: new Date(state.updatedAt).toISOString(),
    };
    const { error } = await supabase.from('gamification_state').upsert(payload);
    if (error) throw error;
  } catch (error) {
    console.warn('Falha ao salvar gamificacao remota', error);
  }
};

export const applyDailyLoginReward = () => {
  const current = loadGamificationState();
  const { state: updated, changed } = applyDailyLoginBonus(current);
  if (!changed) return current;
  return saveGamificationState(updated);
};

export const syncGamificationState = async (userId: string) => {
  const localState = loadGamificationState();
  const remoteState = await fetchRemoteGamificationState(userId);
  if (!remoteState) {
    const { state: updated, changed } = applyDailyLoginBonus(localState);
    const saved = saveGamificationState(updated);
    await saveRemoteGamificationState(userId, saved);
    return saved;
  }

  const merged = remoteState.updatedAt > localState.updatedAt ? remoteState : localState;
  const { state: updated, changed } = applyDailyLoginBonus(merged);
  const saved = saveGamificationState(updated);
  if (merged === localState || changed) {
    await saveRemoteGamificationState(userId, saved);
  }
  return saved;
};
