import React from 'react';
import { motion } from 'framer-motion';
import { UserRole } from '../types';

interface RoleSelectionProps {
  onSelectRole: (role: UserRole) => void;
  onSelectSimmit: () => void;
}

const RoleCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ title, description, icon, onClick }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ y: -4, scale: 1.01 }}
    whileTap={{ scale: 0.98 }}
    className="simmit-card aero-gloss flex w-full flex-col items-center rounded-2xl p-6 text-center shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-[#741cd9]/30"
  >
    <div className="mb-4 rounded-full border border-white/60 bg-white/50 p-3 shadow-[0_10px_20px_rgba(193,188,250,0.35)]">
      {icon}
    </div>
    <h3 className="mb-2 text-xl font-bold text-[#003322]">{title}</h3>
    <p className="text-sm text-[#003322]/70">{description}</p>
  </motion.button>
);

const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelectRole, onSelectSimmit }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex h-full flex-col text-[#003322]"
    >
      <div className="px-4 pb-2 pt-2 text-center">
        <h2 className="font-title text-3xl tracking-tight text-[#003322] sm:text-4xl">
          SIMMIT <span className="text-[#741cd9] simmit-glow">AI</span> QUEST
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-lg text-[#003322]/70">
          Plataforma de treinamento clínico gamificada para sua aprovação nas melhores provas
        </p>
      </div>
      <div className="flex-grow overflow-y-auto px-4 pb-6 no-scrollbar">
        <div className="mx-auto mt-4 flex max-w-md flex-col items-center gap-4">
          <RoleCard
            title="SIMMIT"
            description="Inicie sua simulação clínica e treine raciocínio em tempo real."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#741cd9] drop-shadow-[0_4px_8px_rgba(116,28,217,0.4)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.078 12.078 0 01.665-6.479L12 14z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
              </svg>
            }
            onClick={onSelectSimmit}
          />
          <RoleCard
            title="IA para provas teóricas"
            description="Gerador por PDF, banco de questões e flashcards em um só lugar."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#741cd9] drop-shadow-[0_4px_8px_rgba(116,28,217,0.4)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            onClick={() => onSelectRole('question_generator')}
          />
          <RoleCard
            title="SIMMIT Pathway"
            description="Calendário adaptativo e escalada clínica personalizada."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#18cf91] drop-shadow-[0_4px_8px_rgba(24,207,145,0.35)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 20l6-8 4 5 5-7 3 10H3z" />
              </svg>
            }
            onClick={() => onSelectRole('pathway')}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default RoleSelection;

