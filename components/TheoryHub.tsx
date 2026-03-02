import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface TheoryHubProps {
  onSelectPdf: () => void;
  onSelectQuestionBank: () => void;
  onSelectFlashcards: () => void;
  onSelectFlashcardsFromPdf: () => void;
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

type TheoryHubStep = 'root' | 'question_bank' | 'flashcards';

const TheoryHub: React.FC<TheoryHubProps> = ({
  onSelectPdf,
  onSelectQuestionBank,
  onSelectFlashcards,
  onSelectFlashcardsFromPdf,
}) => {
  const [step, setStep] = useState<TheoryHubStep>('root');
  const isRoot = step === 'root';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex h-full flex-col text-[#003322]"
    >
      <div className="flex-shrink-0 p-4 pt-2 text-center">
        <div className="flex items-center justify-between">
          <div className="w-10" />
          <h2 className="font-title mb-2 text-3xl tracking-tight text-[#003322] sm:text-4xl">
            IA para <span className="text-[#741cd9]">provas teóricas</span>
          </h2>
          <div className="w-10">
            {!isRoot && (
              <button
                onClick={() => setStep('root')}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#741cd9]/20 bg-white/70 text-[#741cd9] shadow-sm transition-all hover:bg-white active:scale-95"
                aria-label="Voltar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <p className="mx-auto max-w-2xl text-lg text-[#003322]/70">
          {isRoot
            ? 'Escolha uma trilha de estudo para provas teóricas.'
            : 'Agora escolha se quer conteúdo fixo ou gerar a partir de PDF.'}
        </p>
      </div>
      <div className="flex-grow overflow-y-auto px-4 pb-4 no-scrollbar">
        <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4">
          {isRoot && (
            <>
              <ActionCard
                title="Banco de questões"
                description="Questões organizadas por matéria para treinar antes da prova."
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#741cd9]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                }
                onClick={() => setStep('question_bank')}
              />
              <ActionCard
                title="Flashcards"
                description="Memorização ativa com flashcards por matéria."
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#741cd9]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                }
                onClick={() => setStep('flashcards')}
              />
            </>
          )}

          {step === 'question_bank' && (
            <>
              <ActionCard
                title="Banco fixo"
                description="Questões prontas separadas por matéria."
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#741cd9]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                }
                onClick={onSelectQuestionBank}
              />
              <ActionCard
                title="Gerar a partir de PDF"
                description="Upload de PDF/DOCX/TXT para criar questões novas com IA."
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#741cd9]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
                onClick={onSelectPdf}
              />
            </>
          )}

          {step === 'flashcards' && (
            <>
              <ActionCard
                title="Flashcards fixos"
                description="Cartões prontos gerados por IA por matéria."
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#741cd9]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                }
                onClick={onSelectFlashcards}
              />
              <ActionCard
                title="Gerar a partir de PDF"
                description="Crie flashcards a partir de um PDF ou DOCX."
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#741cd9]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M6 2h7l5 5v15a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z" />
                  </svg>
                }
                onClick={onSelectFlashcardsFromPdf}
              />
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TheoryHub;
