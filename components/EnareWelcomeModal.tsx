import React from 'react';
import { MedicalSubject } from '../types';
import SimmitLogo from './SimmitLogo';

interface IntensivoWelcomeModalProps {
  onStart: () => void;
  subject: MedicalSubject;
}

const IntensivoWelcomeModal: React.FC<IntensivoWelcomeModalProps> = ({ onStart, subject }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="simmit-card w-full max-w-2xl rounded-2xl p-6 text-[#003322] sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <SimmitLogo size="sm" subtitle="Intensivo de residência" />
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#003322]">{subject}</span>
        </div>

        <div className="mt-6 space-y-4 text-sm text-[#003322]/70 sm:text-base">
          <p>Bem-vindo ao Intensivo de Residência Médica. Este modo é focado em treino rápido com questões objetivas e feedback imediato.</p>
          <p>Você receberá questões no estilo das principais provas de residência. Mantenha o foco, responda com precisão e suba seu nível de desempenho.</p>
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Regra do modo</p>
            <p className="mt-2 text-sm text-[#003322]">Cada sequência correta aumenta sua precisão. O objetivo é manter o streak para bônus de prestígio.</p>
          </div>
        </div>

        <div className="mt-8 flex justify-center sm:justify-end">
          <button onClick={onStart} className="simmit-button w-full rounded-xl px-8 py-3 text-sm font-semibold text-white sm:w-auto">Começar intensivo</button>
        </div>
      </div>
    </div>
  );
};

export default IntensivoWelcomeModal;
