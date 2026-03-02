import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MedicalSubject } from '../types';
import { MEDICAL_SUBJECTS } from '../constants';

interface SubjectSelectionProps {
  onSelectSubject: (subject: MedicalSubject) => void;
  onGoHome: () => void;
}

const SubjectCard: React.FC<{
  title: string;
  onClick: () => void;
}> = ({ title, onClick }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ y: -4, scale: 1.01 }}
    whileTap={{ scale: 0.98 }}
    className="simmit-card w-full rounded-2xl  p-6 text-center shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-[#741cd9]/30"
  >
    <h3 className="text-xl font-bold text-[#003322]">{title}</h3>
  </motion.button>
);

const SubjectSelection: React.FC<SubjectSelectionProps> = ({ onSelectSubject, onGoHome }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const listEndRef = useRef<HTMLDivElement>(null);
  const [showScrollUp, setShowScrollUp] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const scrollToBottom = useCallback((behavior: 'smooth' | 'auto' = 'smooth') => {
    listEndRef.current?.scrollIntoView({ behavior });
  }, []);

  const handleScrollUp = () => {
    scrollContainerRef.current?.scrollBy({ top: -300, behavior: 'smooth' });
  };

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 1;
    const isAtTop = scrollTop < 1;
    const isScrollable = scrollHeight > clientHeight;
    setShowScrollDown(isScrollable && !isAtBottom);
    setShowScrollUp(isScrollable && !isAtTop);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    const timer = setTimeout(handleScroll, 100);
    const resizeObserver = new ResizeObserver(handleScroll);
    if (container) {
      resizeObserver.observe(container);
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      clearTimeout(timer);
      if (container) {
        resizeObserver.unobserve(container);
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative flex h-full flex-col text-[#003322] pt-[env(safe-area-inset-top)]"
    >
      <div className="text-center p-4 pt-8 flex-shrink-0">
        <h2 className="font-title text-3xl sm:text-4xl tracking-tight text-[#003322] mb-4">
          Selecione a Matéria
        </h2>
        <p className="text-lg text-[#003322]/70 max-w-2xl mx-auto">
          Escolha a área de estudo para a sua próxima simulação OSCE.
        </p>
      </div>
      <div ref={scrollContainerRef} className="flex-grow overflow-y-auto px-4 pb-4 no-scrollbar">
        <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
          {MEDICAL_SUBJECTS.map((subject) => (
            <SubjectCard
              key={subject}
              title={subject}
              onClick={() => onSelectSubject(subject)}
            />
          ))}
        </div>
        <div ref={listEndRef} />
      </div>
      {showScrollUp && (
        <button
          onClick={handleScrollUp}
          aria-label="Rolar para cima"
          className="absolute bottom-24 right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full  bg-white/50 text-[#003322] transition-opacity duration-300 hover:bg-white/70"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
        </button>
      )}
      {showScrollDown && (
        <button
          onClick={() => scrollToBottom('smooth')}
          aria-label="Rolar para baixo"
          className="absolute bottom-10 right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full  bg-white/50 text-[#003322] transition-opacity duration-300 hover:bg-white/70"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
      )}
    </motion.div>
  );
};

export default SubjectSelection;
