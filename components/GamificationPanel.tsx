import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { GamificationState, applyGamificationReward, loadGamificationState, saveGamificationState, saveRemoteGamificationState, syncGamificationState } from '../services/gamificationService';

const DAY_MS = 24 * 60 * 60 * 1000;

const CARD_LIBRARY = [
  { title: 'Arritmias Raras', rarity: 'Lendaria' },
  { title: 'ECG Avancado', rarity: 'Epica' },
  { title: 'Septicemia Rapida', rarity: 'Epica' },
  { title: 'Sopro Cardio', rarity: 'Rara' },
  { title: 'Dor Abdominal', rarity: 'Rara' },
  { title: 'Anamnese Focada', rarity: 'Comum' },
  { title: 'Pneumonia Atipica', rarity: 'Comum' },
  { title: 'Trauma Cranio', rarity: 'Comum' },
];

const formatCountdown = (ms: number) => {
  const totalSeconds = Math.max(Math.floor(ms / 1000), 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const getTodayKey = (date = new Date()) => date.toISOString().slice(0, 10);

const getYesterdayKey = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return getTodayKey(date);
};

const GamificationPanel: React.FC = () => {
  const [state, setState] = useState<GamificationState>(loadGamificationState());
  const [now, setNow] = useState(Date.now());
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      const id = data.user?.id ? null;
      setUserId(id);
      if (id) {
        const synced = await syncGamificationState(id);
        setState(synced);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!userId) return;
    saveRemoteGamificationState(userId, state);
  }, [state, userId]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<GamificationState>).detail;
      if (detail) {
        setState(detail);
      }
    };
    window.addEventListener('simmit-gamification-updated', handler);
    return () => window.removeEventListener('simmit-gamification-updated', handler);
  }, []);

  useEffect(() => {
    if (state.packsAvailable > 0 || !state.nextPackAt) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [state.packsAvailable, state.nextPackAt]);

  useEffect(() => {
    if (state.packsAvailable === 0 && state.nextPackAt && now >= state.nextPackAt) {
      const updated = saveGamificationState({
        ...state,
        packsAvailable: 2,
        nextPackAt: null,
      });
      setState(updated);
    }
  }, [now, state, state.nextPackAt, state.packsAvailable]);

  const countdown = useMemo(() => {
    if (state.packsAvailable > 0 || !state.nextPackAt) return null;
    return formatCountdown(state.nextPackAt - now);
  }, [state.nextPackAt, state.packsAvailable, now]);

  const handleOpenPack = () => {
    if (state.packsAvailable <= 0) return;
    const todayKey = getTodayKey();
    const yesterdayKey = getYesterdayKey();
    let nextStreak = state.streakDays;

    if (!state.lastStreakDate) {
      nextStreak = 1;
    } else if (state.lastStreakDate === todayKey) {
      nextStreak = state.streakDays;
    } else if (state.lastStreakDate === yesterdayKey) {
      nextStreak = state.streakDays + 1;
    } else {
      nextStreak = 1;
    }

    const nextPacks = state.packsAvailable - 1;
    const bonusHourglass = Math.random() < 0.3 ? 1 : 0;

    const updated = applyGamificationReward({
      packsDelta: -1,
      hourglassesDelta: bonusHourglass,
      resiliencePointsDelta: 1,
      cardsDelta: 1,
    });
    const finalState = saveGamificationState({
      ...updated,
      nextPackAt: nextPacks === 0 ? Date.now() + DAY_MS : updated.nextPackAt,
      streakDays: nextStreak,
      lastStreakDate: todayKey,
      cardsUnlocked: Math.min(updated.cardsUnlocked, CARD_LIBRARY.length),
      caseCredits: updated.caseCredits + 1,
      flashcardCredits: updated.flashcardCredits + 15,
    });
    setState(finalState);
  };

  const visibleCards = CARD_LIBRARY.slice(0, 6);

  return (
    <section className="mb-6 space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className={`rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-lg animate-in fade-in slide-in-from-bottom-4 ${state.packsAvailable > 0 ? 'shadow-teal-500/20' : ''}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Lote de Conhecimento</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-100">
                {state.packsAvailable} disponivel
                {state.packsAvailable !== 1 ? 's' : ''}
              </h3>
              <p className="mt-2 text-sm text-slate-300">Resgate libera 1 caso OSCE + 15 flashcards.</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.5 9.5V6a2 2 0 00-2-2H5.5a2 2 0 00-2 2v3.5M20.5 9.5v8a2 2 0 01-2 2H5.5a2 2 0 01-2-2v-8M20.5 9.5L12 14 3.5 9.5" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleOpenPack}
              disabled={state.packsAvailable === 0}
              className={`inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${state.packsAvailable > 0 ? 'border-teal-500/50 bg-teal-500/30 text-teal-100 animate-pulse' : 'border-white/10 bg-slate-900/50 text-slate-300'}`}
            >
              Resgatar lote
            </button>
            {countdown && (
              <div className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                {countdown}
              </div>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-center text-sm">
            <div className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-3">
              <p className="text-slate-400 text-xs">Casos disponiveis</p>
              <p className="text-lg font-bold text-slate-100">{state.caseCredits}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-3">
              <p className="text-slate-400 text-xs">Flashcards disponiveis</p>
              <p className="text-lg font-bold text-slate-100">{state.flashcardCredits}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-lg animate-in fade-in slide-in-from-bottom-4">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Economia de Estudo</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-center text-sm sm:grid-cols-5">
            <div className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-3">
              <p className="text-slate-400 text-xs">Energia de Foco</p>
              <p className="text-lg font-bold text-slate-100">{state.focusEnergy}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-3">
              <p className="text-slate-400 text-xs">Ampulhetas</p>
              <p className="text-lg font-bold text-slate-100">{state.hourglasses}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-3">
              <p className="text-slate-400 text-xs">Resiliencia</p>
              <p className="text-lg font-bold text-slate-100">{state.resiliencePoints}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-3">
              <p className="text-slate-400 text-xs">MediPoints (MP)</p>
              <p className="text-lg font-bold text-slate-100">{state.medPoints}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-3">
              <p className="text-slate-400 text-xs">NeuroGems (NG)</p>
              <p className="text-lg font-bold text-slate-100">{state.neuroGems}</p>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3 text-sm text-slate-300">
            Streak atual: <span className="font-semibold text-teal-300">{state.streakDays}</span> {state.streakDays === 1 ? 'dia' : 'dias'}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-lg animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Galeria de Diagnosticos Dominados</p>
            <p className="text-sm text-slate-300 mt-1">
              {state.cardsUnlocked} / {CARD_LIBRARY.length} cartas desbloqueadas
            </p>
          </div>
          <span className="rounded-full border border-white/10 bg-slate-900/50 px-3 py-1 text-xs text-slate-300">Colecao Clinica</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {visibleCards.map((card, index) => {
            const unlocked = index < state.cardsUnlocked;
            return (
              <div
                key={card.title}
                className={`relative overflow-hidden rounded-xl border border-white/10 px-3 py-4 text-left ${
                  unlocked ? 'bg-slate-900/40' : 'bg-slate-900/70 opacity-70'
                }`}
              >
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{unlocked ? card.rarity : '?'}</div>
                <div className="mt-2 text-sm font-semibold text-slate-100">
                  {unlocked ? card.title : 'Carta Misteriosa'}
                </div>
                {!unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-slate-400">
                    Bloqueada
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default GamificationPanel;
