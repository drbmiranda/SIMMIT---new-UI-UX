import React, { useState } from 'react';

import SimmitLogo from './SimmitLogo';
import illusTarget from '../design-SIMMIT/figma-sections/04-ai-theory-test/assets/illus-target.png';
import illusHospital from '../design-SIMMIT/figma-sections/04-ai-theory-test/assets/illus-hospital-man.png';
import illusAnatomy from '../design-SIMMIT/figma-sections/04-ai-theory-test/assets/illus-anatomy-vr.png';
import subjectFlashcards from '../design-SIMMIT/figma-sections/04-ai-theory-test/assets/subject-flashcards.png';

interface TheoryHubProps {
  onSelectPdf: () => void;
  onSelectQuestionBank: () => void;
  onSelectFlashcards: () => void;
  onSelectFlashcardsFromPdf: () => void;
}

type TheoryHubStep = 'root' | 'question_bank' | 'flashcards';

const ActionCard: React.FC<{ title: string; description: string; badge: string; image: string; onClick: () => void; }> = ({ title, description, badge, image, onClick }) => {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <button onClick={onClick} className="relative min-h-[200px] w-full overflow-hidden rounded-3xl border border-white/70 bg-[linear-gradient(135deg,#1e293b_0%,#334155_50%,#4f46e5_100%)] text-left shadow-[0_16px_34px_rgba(2,6,23,0.16)] focus:outline-none focus:ring-4 focus:ring-[#741cd9]/30">
      {!imageFailed && <img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover" loading="eager" decoding="async" onError={() => setImageFailed(true)} />}
      <div className={`absolute inset-0 ${imageFailed ? 'bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_35%),linear-gradient(135deg,rgba(30,41,59,0.78),rgba(79,70,229,0.88))]' : 'bg-gradient-to-t from-black/70 via-black/20 to-transparent'}`} />
      <div className="relative z-10 flex h-full flex-col justify-between p-5">
        <span className="inline-flex w-fit rounded-full border border-white/60 bg-white/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">{badge}</span>
        <div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="mt-2 text-sm text-white/90">{description}</p>
        </div>
      </div>
    </button>
  );
};

const TheoryHub: React.FC<TheoryHubProps> = ({ onSelectPdf, onSelectQuestionBank, onSelectFlashcards, onSelectFlashcardsFromPdf }) => {
  const [step, setStep] = useState<TheoryHubStep>('root');
  const isRoot = step === 'root';

  return (
    <div className="mx-auto flex h-full w-full max-w-6xl flex-col px-4 pb-8 pt-6 text-[#003322] sm:px-6">
      <div className="rounded-3xl border border-white/70 bg-white/80 px-5 py-6 shadow-[0_24px_64px_rgba(116,28,217,0.14)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <SimmitLogo size="md" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#741cd9]/80">04 AI Theory Test</p>
              <h2 className="mt-1 font-title text-3xl tracking-tight text-[#003322] sm:text-4xl">IA para provas teóricas</h2>
            </div>
          </div>
          {!isRoot && <button onClick={() => setStep('root')} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#741cd9]/20 bg-white text-[#741cd9]" aria-label="Voltar"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>}
        </div>
      </div>

      <div className="mt-6 flex-grow overflow-y-auto no-scrollbar">
        <div className="grid gap-4 md:grid-cols-2">
          {isRoot && <><ActionCard title="Banco de questões" description="Questões organizadas por matéria para treino rápido antes da prova." badge="05" image={illusTarget} onClick={() => setStep('question_bank')} /><ActionCard title="Flashcards" description="Memorização ativa com cartas prontas ou criadas a partir de arquivo." badge="06" image={subjectFlashcards} onClick={() => setStep('flashcards')} /></>}
          {step === 'question_bank' && <><ActionCard title="Banco fixo" description="Questões reais de residência médica e ENAMED, organizadas por matéria." badge="FIX" image={illusHospital} onClick={onSelectQuestionBank} /><ActionCard title="Gerar de PDF" description="Upload de PDF, DOCX ou TXT para gerar questões novas com IA." badge="GEN" image={illusTarget} onClick={onSelectPdf} /></>}
          {step === 'flashcards' && <><ActionCard title="Flashcards fixos" description="Cartões prontos para revisão por matéria." badge="FIX" image={subjectFlashcards} onClick={onSelectFlashcards} /><ActionCard title="Gerar de PDF" description="Crie flashcards automaticamente a partir de arquivo." badge="GEN" image={illusAnatomy} onClick={onSelectFlashcardsFromPdf} /></>}
        </div>
      </div>
    </div>
  );
};

export default TheoryHub;

