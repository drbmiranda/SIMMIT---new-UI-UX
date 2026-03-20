import React, { useEffect, useRef, useState } from 'react';
import { MedicalSubject, Flashcard } from '../types';
import { generateFlashcards } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

interface FlashcardViewProps {
  subject: MedicalSubject;
  onExit: () => void;
}

const DAILY_FLASHCARD_KEY = 'simmit-daily-flashcards';
const getLocalDateKey = (date = new Date()) => date.toLocaleDateString('en-CA');

const readDailyFlashcards = () => {
  const todayKey = getLocalDateKey();
  try {
    const raw = localStorage.getItem(DAILY_FLASHCARD_KEY);
    if (!raw) return { dateKey: todayKey, count: 0 };
    const parsed = JSON.parse(raw) as { dateKey?: string; count?: number };
    if (parsed.dateKey !== todayKey) return { dateKey: todayKey, count: 0 };
    return { dateKey: todayKey, count: typeof parsed.count === 'number' ? parsed.count : 0 };
  } catch {
    return { dateKey: todayKey, count: 0 };
  }
};

const bumpDailyFlashcards = (delta = 1) => {
  const current = readDailyFlashcards();
  const next = { dateKey: current.dateKey, count: current.count + delta };
  localStorage.setItem(DAILY_FLASHCARD_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('simmit-daily-flashcards-updated', { detail: next.count }));
};

const FlashcardView: React.FC<FlashcardViewProps> = ({ subject, onExit }) => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const seenIndexes = useRef<Set<number>>(new Set());

  const fetchCards = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateFlashcards(subject);
      if (result.flashcards && result.flashcards.length > 0) {
        setCards(result.flashcards);
        setCurrentIndex(0);
        setIsFlipped(false);
      } else {
        setError('Nao foram encontrados flashcards para esta materia.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao gerar flashcards.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [subject]);

  useEffect(() => {
    if (cards.length === 0) return;
    seenIndexes.current = new Set();
  }, [cards]);

  useEffect(() => {
    if (cards.length === 0) return;
    if (!seenIndexes.current.has(currentIndex)) {
      seenIndexes.current.add(currentIndex);
      bumpDailyFlashcards(1);
    }
  }, [currentIndex, cards.length]);

  const currentCard = cards[currentIndex];
  const total = cards.length || 1;
  const progressPercent = Math.max(12, ((currentIndex + 1) / total) * 100);

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev + 1) % cards.length), 120);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length), 120);
  };

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4 text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-lg text-[#061033]">Gerando flashcards sobre {subject}...</p>
      </div>
    );
  }

  if (error || !currentCard) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4 text-center text-[#061033]">
        <div className="rounded-[24px] border border-white/70 bg-white/70 px-8 py-10 shadow-[0_24px_48px_rgba(15,23,42,0.08)]">
          <h3 className="text-xl font-bold">Erro ao carregar</h3>
          <p className="mt-2 text-[#061033]/70">{error || 'Nao foi possivel carregar os flashcards.'}</p>
          <button onClick={onExit} className="mt-5 rounded-full bg-[linear-gradient(90deg,#6d28d9,#10b981)] px-5 py-2.5 text-sm font-semibold text-white">Voltar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.96),rgba(244,246,251,0.98)_30%,rgba(225,214,255,0.78)_72%,rgba(214,246,233,0.64)_100%)] text-[#061033]">
      <div className="mx-auto max-w-[1280px] px-8 pb-16 pt-10">
        <div className="mx-auto max-w-[960px]">
          <div className="h-3 rounded-full bg-[#d9e1ea]">
            <div className="h-full rounded-full bg-[linear-gradient(90deg,#7c3aed,#10b981)]" style={{ width: `${progressPercent}%` }} />
          </div>

          <div className="mt-4 flex items-center justify-between text-[#061033]">
            <span className="rounded-full border border-[#34d399] px-6 py-2 text-[14px] font-medium">Flashcards: {subject}</span>
            <button onClick={onExit} className="text-[15px] font-medium text-[#061033]/85">Encerrar</button>
          </div>

          <div className="mt-14 flex flex-col items-center">
            <div className="relative h-[352px] w-full max-w-[622px]">
              <div className="absolute inset-x-4 top-3 h-[300px] rotate-[2deg] rounded-[28px] border border-white/55 bg-[linear-gradient(135deg,rgba(237,233,254,0.52),rgba(191,219,254,0.34))] shadow-[0_22px_50px_rgba(15,23,42,0.05)] backdrop-blur-2xl" />
              <div className="absolute inset-x-2 top-5 h-[306px] -rotate-[2deg] rounded-[28px] border border-white/55 bg-[linear-gradient(135deg,rgba(233,213,255,0.44),rgba(191,219,254,0.28))] shadow-[0_22px_50px_rgba(15,23,42,0.05)] backdrop-blur-2xl" />
              <div className="absolute inset-0 rounded-[30px] border border-white/65 bg-[linear-gradient(135deg,rgba(233,213,255,0.62),rgba(186,230,253,0.52))] px-9 py-9 shadow-[0_30px_70px_rgba(15,23,42,0.08)] backdrop-blur-[28px]">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[16px] bg-white/70 text-[34px] font-bold text-[#7c3aed]">{currentIndex + 1}</div>
                <div className="mt-6 text-center">
                  <p className="text-[19px] font-bold leading-[1.18] text-[#111827]">{currentCard.question}</p>
                  {isFlipped ? (
                    <p className="mt-7 text-[17px] leading-[1.34] text-[#334155]">{currentCard.answer}</p>
                  ) : (
                    <div className="mt-10 space-y-4 px-6 opacity-45 blur-[2px]">
                      <div className="h-4 rounded-full bg-white/50" />
                      <div className="h-4 rounded-full bg-white/45" />
                      <div className="h-4 rounded-full bg-white/40" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <p className="mt-8 text-[18px] font-medium">{currentIndex + 1}/{cards.length}</p>

            <div className="mt-3 flex items-center gap-8">
              <button onClick={handlePrev} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/55 text-[28px] text-[#061033]/65 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">&lsaquo;</button>
              <button
                onClick={() => setIsFlipped((prev) => !prev)}
                className="rounded-[14px] bg-[linear-gradient(90deg,#6d28d9,#10b981)] px-5 py-3 text-[17px] font-semibold text-white shadow-[0_14px_30px_rgba(79,70,229,0.28)]"
              >
                {isFlipped ? 'Ocultar resposta' : 'Ver resposta'}
              </button>
              <button onClick={handleNext} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/55 text-[28px] text-[#061033]/65 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">&rsaquo;</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardView;



