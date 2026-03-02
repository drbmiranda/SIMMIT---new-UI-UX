import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { GamificationState, loadGamificationState, syncGamificationState } from '../services/gamificationService';

const StudentHud: React.FC = () => {
  const [state, setState] = useState<GamificationState>(loadGamificationState());
  const [pulseXp, setPulseXp] = useState(false);
  const [lastXp, setLastXp] = useState(state.medPoints);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user?.id) {
        const synced = await syncGamificationState(data.user.id);
        setState(synced);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user?.id) {
        const synced = await syncGamificationState(session.user.id);
        setState(synced);
      }
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<GamificationState>).detail;
      if (!detail) return;
      setState(detail);
    };
    window.addEventListener('simmit-gamification-updated', handler);
    return () => window.removeEventListener('simmit-gamification-updated', handler);
  }, []);

  useEffect(() => {
    if (state.medPoints !== lastXp) {
      setPulseXp(true);
      setLastXp(state.medPoints);
      const timer = setTimeout(() => setPulseXp(false), 600);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [state.medPoints, lastXp]);

  const { level, progress, prestige, rank } = useMemo(() => {
    const total = Math.max(state.medPoints, 0);
    const nextLevel = Math.floor(total / 100) + 1;
    let rankLabel = 'INTERNO';
    if (total >= 300) rankLabel = 'PRECEPTOR';
    else if (total >= 200) rankLabel = 'R2';
    else if (total >= 100) rankLabel = 'R1';
    return {
      level: nextLevel,
      progress: total % 100,
      prestige: total,
      rank: rankLabel,
    };
  }, [state.medPoints]);

  const resiliencePercent = useMemo(() => {
    const percent = (state.resiliencePoints / 5) * 100;
    return Math.min(100, Math.max(0, Math.round(percent)));
  }, [state.resiliencePoints]);\r\n  const hudTone = 'border-[#741cd9]/15 bg-gradient-to-r from-white/70 via-white/60 to-white/70 shadow-[#741cd9]/20';

  return (
    <div className="w-full px-4 pb-3 sm:px-6">
      <div className={`rounded-2xl border px-3 py-3 shadow-lg ${hudTone}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-teal-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m-4-4h8m5 4a1 1 0 01-1 1H5a1 1 0 01-1-1V8a1 1 0 011-1h3l2-2h4l2 2h3a1 1 0 011 1v8z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Prestígio clínico</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-slate-100">{prestige}</span>
                <span className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-200">
                  {rank}
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Nível {level}</p>
            </div>
          </div>
          <div className="flex-1">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all ${pulseXp ? 'animate-pulse' : ''}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-slate-400">
              <span>Progresso</span>
              <span>{progress}%</span>
            </div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Sinapses</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 9-7 9-7-9 7-9z" />
              </svg>
            </div>
            <p className="mt-1 text-lg font-semibold text-slate-100">{state.neuroGems}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Saúde mental</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <p className={`mt-1 text-lg font-semibold $'text-slate-100'`}>{resiliencePercent}%</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Concentração</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m-4-4h8m5 4a1 1 0 01-1 1H5a1 1 0 01-1-1V8a1 1 0 011-1h3l2-2h4l2 2h3a1 1 0 011 1v8z" />
              </svg>
            </div>
            <p className="mt-1 text-lg font-semibold text-slate-100">{state.focusEnergy}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Tempo plantão</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="mt-1 text-lg font-semibold text-slate-100">{state.caseCredits}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Streak</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
              </svg>
            </div>
            <p className="mt-1 text-lg font-semibold text-slate-100">{state.streakDays}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentHud;


