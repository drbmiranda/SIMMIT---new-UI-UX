import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Profile } from '../types';
import { StudentDashboard } from './StudentDashboard';
import { GamificationState, loadGamificationState } from '../services/gamificationService';

interface ProfilePanelProps {
  isOpen: boolean;
  email: string | null;
  profile: Profile | null;
  onClose: () => void;
  onStartTutorial: () => void;
  onLogout: () => void;
  variant?: 'modal' | 'dock';
}

const ProfilePanel: React.FC<ProfilePanelProps> = ({
  isOpen,
  email,
  profile,
  onClose,
  onStartTutorial,
  onLogout,
  variant = 'modal',
}) => {
  const displayName = profile?.full_name ?? 'Aluno(a)';
  const firstName = displayName.split(' ')[0] || 'Aluno(a)';
  const initials = displayName.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase();

  const [gamification, setGamification] = useState<GamificationState>(loadGamificationState());

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<GamificationState>).detail;
      if (detail) setGamification(detail);
    };
    window.addEventListener('simmit-gamification-updated', handler);
    return () => window.removeEventListener('simmit-gamification-updated', handler);
  }, []);

  const { level, progress, prestige, rank } = useMemo(() => {
    const total = Math.max(gamification.medPoints, 0);
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
  }, [gamification.medPoints]);

  const panelContent = (
    <motion.div
      initial={variant === 'modal' ? { opacity: 0, y: 24, scale: 0.98 } : false}
      animate={variant === 'modal' ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1 }}
      exit={variant === 'modal' ? { opacity: 0, y: 16, scale: 0.98 } : { opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-[0_20px_60px_rgba(193,188,250,0.45)] backdrop-blur-xl aero-gloss text-[#003322]"
    >
      <div className="flex items-center justify-between gap-4 border-b border-white/60 bg-white/70 px-6 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#741cd9]">Perfil</p>
          <h3 className="text-lg font-semibold text-[#003322]">{displayName}</h3>
          <p className="text-sm text-[#003322]/70">Logado como: {email ?? 'não identificado'}</p>
        </div>
        {variant === 'modal' && (
          <button
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/60 text-[#003322] hover:bg-white/80"
            aria-label="Fechar perfil"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <section className="mb-6 rounded-3xl border border-white/70 bg-gradient-to-br from-white/85 via-white/70 to-[#c1bcfa]/30 p-5 shadow-[0_12px_40px_rgba(116,28,217,0.18)]">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-[#741cd9]/30 bg-white/80 text-xl font-semibold text-[#741cd9] shadow-[0_0_0_6px_rgba(116,28,217,0.12)] animate-soft-glow">
                {initials || 'SM'}
                <div className="absolute -bottom-2 right-0 rounded-full border border-[#741cd9]/30 bg-white/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#741cd9]">
                  Lvl {level}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[#741cd9]">Bem-vindo de volta</p>
                <h4 className="text-xl font-semibold text-[#003322]">{firstName}, seu progresso está aqui.</h4>
                <p className="text-sm text-[#003322]/70">Volte quando quiser: seus casos e conquistas ficam salvos.</p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <div className="flex items-center gap-2 rounded-full border border-[#741cd9]/30 bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#741cd9]">
                {rank}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-[#741cd9]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m-4-4h8m5 4a1 1 0 01-1 1H5a1 1 0 01-1-1V8a1 1 0 011-1h3l2-2h4l2 2h3a1 1 0 011 1v8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#003322]/60">Prestígio clínico</p>
                  <p className="text-2xl font-bold text-[#003322]">{prestige}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-[#003322]/60">
              <span>Progresso para nível {level + 1}</span>
              <span>{progress}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/60">
              <div
                className="h-full bg-gradient-to-r from-[#741cd9] to-[#18cf91]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
            <div className="rounded-xl border border-white/60 bg-white/70 px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#003322]/60">Streak</p>
              <p className="text-lg font-semibold text-[#003322]">{gamification.streakDays}</p>
            </div>
            <div className="rounded-xl border border-white/60 bg-white/70 px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#003322]/60">Foco</p>
              <p className="text-lg font-semibold text-[#003322]">{gamification.focusEnergy}</p>
            </div>
            <div className="rounded-xl border border-white/60 bg-white/70 px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#003322]/60">Resiliência</p>
              <p className="text-lg font-semibold text-[#003322]">{gamification.resiliencePoints}</p>
            </div>
            <div className="rounded-xl border border-white/60 bg-white/70 px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#003322]/60">NeuroGems</p>
              <p className="text-lg font-semibold text-[#003322]">{gamification.neuroGems}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={onStartTutorial}
              className="inline-flex items-center justify-center rounded-full border border-white/60 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#003322] shadow-sm transition hover:bg-white"
            >
              Refazer tutorial
            </button>
          </div>
        </section>

        <StudentDashboard profile={profile} onStartTutorial={onStartTutorial} />

        <div className="mt-6 rounded-2xl border border-[#741cd9]/20 bg-white/60 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-[#741cd9]">Sessão</p>
          <p className="mt-2 text-sm text-[#003322]/70">
            Para encerrar sua sessão e sair do app, use o botão abaixo.
          </p>
          <button
            onClick={onLogout}
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-[#741cd9]/30 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#741cd9] shadow-sm transition hover:bg-white/80"
          >
            Sair do app
          </button>
        </div>
      </div>
    </motion.div>
  );

  if (variant === 'dock') {
    return panelContent;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            className="absolute inset-0 bg-[#003322]/40 backdrop-blur-sm"
            aria-label="Fechar perfil"
            onClick={onClose}
          />
          <div className="relative z-10 h-[90vh] w-[95vw] max-w-5xl">
            {panelContent}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfilePanel;

