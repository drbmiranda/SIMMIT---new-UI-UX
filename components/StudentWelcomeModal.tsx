import React from 'react';
import { MedicalSubject } from '../types';
import { SIMMIT_COMMANDS } from '../constants';
import SimmitLogo from './SimmitLogo';

interface StudentWelcomeModalProps {
  onStart: () => void;
  subject: MedicalSubject;
}

const StudentWelcomeModal: React.FC<StudentWelcomeModalProps> = ({ onStart, subject }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#eaf0f7]/90 p-4 backdrop-blur-sm">
      <div className="simmit-card flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl p-4 text-[#003322] sm:max-h-[min(90vh,860px)] sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <SimmitLogo size="sm" subtitle="Instruções de simulação: rumo à soberania clínica" />
          <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#003322]">
            {subject}
          </span>
        </div>

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="space-y-4 text-sm text-[#003322]/70 sm:text-base">
            <p>
              Bem-vindo. Você está prestes a assumir o comando de um caso clínico real. Sua missão é diagnosticar e manejar o paciente utilizando raciocínio clínico estratégico e agilidade técnica.
            </p>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-[#003322]">Como operar sua HUD:</h3>
              <ul className="space-y-2 pl-4">
                <li><span className="font-semibold text-[#003322]">Atendimento híbrido:</span> converse naturalmente com o paciente para realizar a anamnese, mas utilize a HUD para todas as ações técnicas.</li>
                <li><span className="font-semibold text-[#003322]">Exame físico e sinais vitais:</span> acesse o painel para solicitar inspeção, palpação, percussão, ausculta e monitoramento de sinais vitais em tempo real.</li>
                <li><span className="font-semibold text-[#003322]">Investigação diagnóstica:</span> utilize os menus de laboratório, imagem e exames funcionais para solicitar exames complementares específicos.</li>
                <li><span className="font-semibold text-[#003322]">Intervenção e manejo:</span> no menu de procedimentos, execute ações críticas como IOT, acessos vasculares ou medicações de suporte avançado.</li>
                <li><span className="font-semibold text-[#003322]">Performance em tempo real:</span> sua pontuação oscila conforme a precisão das condutas. Erros e acertos moldam seu dashboard final.</li>
                <li><span className="font-semibold text-[#003322]">Encerramento obrigatório:</span> para receber seu feedback detalhado e salvar sua evolução, encerre o caso pela HUD com <span className="rounded bg-white/10 px-1 font-semibold">{SIMMIT_COMMANDS.closeCase}</span>.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-[#003322]/10 pt-4 sm:mt-6 sm:pt-6">
          <button onClick={onStart} className="simmit-button w-full rounded-xl px-8 py-3 text-sm font-semibold text-white sm:w-auto">
            Entendi, iniciar simulação
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentWelcomeModal;
