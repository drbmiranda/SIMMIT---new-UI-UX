import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Profile } from '../types';

interface StudentHubProps {
  profile: Profile | null;
  onSelectDashboard: () => void;
  onSelectSimulation: () => void;
}

const ActionCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ title, description, icon, onClick }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ y: -4, scale: 1.01 }}
    whileTap={{ scale: 0.98 }}
    className="simmit-card flex w-full flex-col items-center rounded-2xl  p-6 text-center shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-[#741cd9]/30"
  >
    <div className="mb-4 rounded-full  bg-white/50 p-3">
      {icon}
    </div>
    <h3 className="mb-2 text-xl font-bold text-[#003322]">{title}</h3>
    <p className="text-sm text-[#003322]/70">{description}</p>
  </motion.button>
);

const StudentHub: React.FC<StudentHubProps> = ({ profile, onSelectDashboard, onSelectSimulation }) => {
  const firstName = profile?.full_name.split(' ')[0] || 'Aluno(a)';
  const [showLore, setShowLore] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex h-full flex-col text-[#003322]"
    >
      <div className="flex-shrink-0 p-4 pt-2 text-center">
        <h2 className="font-title mb-2 text-3xl tracking-tight text-[#003322] sm:text-4xl">
          Olá, <span className="text-[#741cd9]">{firstName}</span>!
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-[#003322]/70">
          O que vamos treinar hoje?
        </p>
      </div>
      <div className="flex-grow overflow-y-auto px-4 pb-4 no-scrollbar">
        <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4">
          <ActionCard
            title="Gerar Simulação"
            description="Enfrente um novo caso clínico realista para aprimorar suas habilidades práticas de atendimento."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#741cd9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.078 12.078 0 01.665-6.479L12 14z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
              </svg>
            }
            onClick={onSelectSimulation}
          />
          <ActionCard
            title="Dashboard Individual"
            description="Veja seu desempenho, pontuações e a análise da IA sobre suas áreas de melhoria e pontos fortes."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#741cd9]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
            }
            onClick={onSelectDashboard}
          />
        </div>
      </div>
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setShowLore(prev => !prev)}
          className="glass-chip aero-gloss flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#741cd9] shadow-lg"
          aria-label="Abrir história do SIMMIT"
        >
          SIMMIT
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#741cd9]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
          </svg>
        </button>
        {showLore && (
          <div className="mt-3 w-[320px] max-w-[90vw] rounded-2xl glass-panel aero-gloss p-4 text-sm text-[#003322] shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#741cd9]">História do SIMMIT</p>
                <h3 className="mt-1 text-lg font-semibold text-[#003322]">GaveaXR Medical Center</h3>
              </div>
              <button
                onClick={() => setShowLore(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/60 text-[#003322] hover:bg-white/80"
                aria-label="Fechar história"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <p className="mt-3 text-[#003322]/70">
              O SIMMIT nasceu no ápice do GaveaXR Medical Center: uma engine clínica potencializada por IA,
              criada para simular o ritmo real de um plantão. Aqui você não estuda, você atende.
            </p>
            <p className="mt-3 text-[#003322]/70">
              Regras do jogo: cada caso consome Tempo de Plantão, sua Concentração limita sessões extras,
              e acertos elevam seu Prestígio Clínico. Missões diárias mantêm o ritmo e eventos de crise
              surgem para testar sua tomada de decisão sob pressão.
            </p>
            <p className="mt-3 text-[#741cd9] font-semibold">
              Seu objetivo: subir de Interno a Preceptor, colecionando diagnósticos e protegendo sua Saúde Mental.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StudentHub;
