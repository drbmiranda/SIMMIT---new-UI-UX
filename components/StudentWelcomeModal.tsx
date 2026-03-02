import React, { useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { MedicalSubject } from '../types';
import { SIMMIT_COMMANDS } from '../constants';
import SimmitLogo from './SimmitLogo';

gsap.registerPlugin(Flip);

interface StudentWelcomeModalProps {
  onStart: () => void;
  subject: MedicalSubject;
}

const StudentWelcomeModal: React.FC<StudentWelcomeModalProps> = ({ onStart, subject }) => {
  useLayoutEffect(() => {
    const flipState = (window as any).__simmitFlipState;
    if (flipState) {
      Flip.from(flipState, {
        duration: 0.6,
        ease: 'power2.inOut',
        absolute: true,
      });
    }
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#eaf0f7]/90 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="simmit-card w-full max-w-2xl rounded-2xl p-6 text-[#003322] sm:p-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <SimmitLogo size="sm" subtitle="Instruções de Simulação: Rumo à Soberania Clínica" />
          <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#003322]">
            {subject}
          </span>
        </div>

        <div className="mt-6 space-y-4 text-sm text-[#003322]/70 sm:text-base">
          <p>
            Bem-vindo, Pioneer! Você está prestes a assumir o comando de um caso clínico real. Sua missão é diagnosticar e manejar o paciente utilizando raciocínio clínico estratégico e agilidade técnica.
          </p>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-[#003322]">Como Operar sua HUD (Heads-Up Display):</h3>
            <ul className="space-y-2 pl-4">
              <li>
                <span className="font-semibold text-[#003322]">Atendimento Híbrido:</span> Converse naturalmente com o paciente para realizar a Anamnese, mas utilize a HUD para todas as ações técnicas.
              </li>
              <li>
                <span className="font-semibold text-[#003322]">Exame Físico e Sinais Vitais:</span> Acesse o menu de Exame Físico para solicitar Inspeção, Palpação, Percussão, Ausculta e monitoramento de Sinais Vitais em tempo real.
              </li>
              <li>
                <span className="font-semibold text-[#003322]">Investigação Diagnóstica:</span> Utilize os menus de Laboratório, Imagem e Exames Funcionais para solicitar exames complementares específicos. Lembre-se: cada pedido impacta seu tempo e performance.
              </li>
              <li>
                <span className="font-semibold text-[#003322]">Intervenção e Manejo:</span> No menu de Procedimentos, execute ações críticas como IOT, acessos vasculares ou medicações de suporte avançado.
              </li>
              <li>
                <span className="font-semibold text-[#003322]">Performance em Tempo Real:</span> Sua pontuação de soberania oscila conforme a precisão de suas condutas. Erros e acertos moldam seu dashboard final.
              </li>
              <li>
                <span className="font-semibold text-[#003322]">Encerramento Obrigatório:</span> Para receber seu feedback detalhado e salvar sua evolução, você deve encerrar o caso via HUD clicando no botão <span className="rounded bg-white/10 px-1 font-semibold">{SIMMIT_COMMANDS.closeCase}</span>.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex justify-center sm:justify-end">
          <button
            onClick={onStart}
            className="simmit-button w-full rounded-xl px-8 py-3 text-sm font-semibold text-white sm:w-auto"
          >
            Entendi, iniciar simulação
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentWelcomeModal;
