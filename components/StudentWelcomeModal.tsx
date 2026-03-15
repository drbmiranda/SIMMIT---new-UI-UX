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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#eaf0f7]/90 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="simmit-card flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl p-4 text-[#003322] sm:max-h-[min(90vh,860px)] sm:p-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <SimmitLogo size="sm" subtitle="Instrucoes de Simulacao: Rumo a Soberania Clinica" />
          <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#003322]">
            {subject}
          </span>
        </div>

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="space-y-4 text-sm text-[#003322]/70 sm:text-base">
            <p>
              Bem-vindo, Pioneer! Voce esta prestes a assumir o comando de um caso clinico real. Sua missao e diagnosticar e manejar o paciente utilizando raciocinio clinico estrategico e agilidade tecnica.
            </p>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-[#003322]">Como operar sua HUD (Heads-Up Display):</h3>
              <ul className="space-y-2 pl-4">
                <li>
                  <span className="font-semibold text-[#003322]">Atendimento hibrido:</span> Converse naturalmente com o paciente para realizar a anamnese, mas utilize a HUD para todas as acoes tecnicas.
                </li>
                <li>
                  <span className="font-semibold text-[#003322]">Exame fisico e sinais vitais:</span> Acesse o menu de Exame Fisico para solicitar inspecao, palpacao, percussao, ausculta e monitoramento de sinais vitais em tempo real.
                </li>
                <li>
                  <span className="font-semibold text-[#003322]">Investigacao diagnostica:</span> Utilize os menus de laboratorio, imagem e exames funcionais para solicitar exames complementares especificos. Lembre-se: cada pedido impacta seu tempo e performance.
                </li>
                <li>
                  <span className="font-semibold text-[#003322]">Intervencao e manejo:</span> No menu de procedimentos, execute acoes criticas como IOT, acessos vasculares ou medicacoes de suporte avancado.
                </li>
                <li>
                  <span className="font-semibold text-[#003322]">Performance em tempo real:</span> Sua pontuacao de soberania oscila conforme a precisao de suas condutas. Erros e acertos moldam seu dashboard final.
                </li>
                <li>
                  <span className="font-semibold text-[#003322]">Encerramento obrigatorio:</span> Para receber seu feedback detalhado e salvar sua evolucao, voce deve encerrar o caso via HUD clicando no botao <span className="rounded bg-white/10 px-1 font-semibold">{SIMMIT_COMMANDS.closeCase}</span>.
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-[#003322]/10 pt-4 sm:mt-6 sm:pt-6">
          <button
            onClick={onStart}
            className="simmit-button w-full rounded-xl px-8 py-3 text-sm font-semibold text-white sm:w-auto"
          >
            Entendi, iniciar simulacao
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentWelcomeModal;
