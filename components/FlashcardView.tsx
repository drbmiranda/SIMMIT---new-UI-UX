import React, { useEffect, useRef, useState } from 'react';
import { MedicalSubject, Flashcard } from '../types';
import { generateFlashcards } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

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

interface FlashcardViewProps {
  subject: MedicalSubject;
  onExit: () => void;
}

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
        setError("Não foram encontrados flashcards para esta matéria.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao gerar flashcards.");
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

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };
  
  const handleFlip = () => {
      setIsFlipped(!isFlipped);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-[#003322] text-lg">Gerando flashcards sobre {subject}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4 glass-panel text-[#003322]">
        <h3 className="text-xl font-bold mb-2">Erro ao Carregar</h3>
        <p>{error}</p>
        <button onClick={onExit} className="mt-4 simmit-button px-4 py-2 rounded text-white">Voltar</button>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="flex flex-col h-full bg-[#eaf0f7] text-[#003322] p-4 sm:p-6">
      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="w-full max-w-xl h-64 sm:h-80 mb-6">
          <div className="flashcard-container w-full h-full" onClick={handleFlip} role="button" tabIndex={0} onKeyDown={(e) => e.key === ' ' && handleFlip()}>
              <div className={`flashcard ${isFlipped ? 'is-flipped' : ''}`}>
                  <div className="flashcard-face flashcard-front simmit-card aero-gloss border border-white/60">
                      <p className="text-xl sm:text-2xl font-semibold text-center">{currentCard.question}</p>
                  </div>
                  <div className="flashcard-face flashcard-back simmit-card aero-gloss border border-white/60">
                      <p className="text-lg sm:text-xl font-bold text-center whitespace-pre-wrap">{currentCard.answer}</p>
                  </div>
              </div>
          </div>
        </div>
        <p className="text-[#003322]/70 mb-4">Card {currentIndex + 1} de {cards.length}</p>
        <div className="flex items-center gap-4">
          <button onClick={handlePrev} className="px-5 py-2.5 glass-chip text-[#003322] font-semibold rounded-lg hover:bg-white/80 transition">Anterior</button>
          <button onClick={handleFlip} className="px-8 py-3 simmit-button text-white font-bold rounded-lg  transition">{isFlipped ? 'Ver Verso' : 'Ver Verso'}</button>
          <button onClick={handlePrev} className="px-5 py-2.5 glass-chip text-[#003322] font-semibold rounded-lg hover:bg-white/80 transition">Anterior</button>
        </div>
      </div>
      <div className="flex-shrink-0 text-center pt-4">
        <button onClick={fetchCards} className="text-sm font-semibold text-[#741cd9] hover:text-[#18cf91] mr-8">Gerar Novos Flashcards</button>
        <button onClick={onExit} className="text-sm font-semibold text-[#003322]/70 hover:text-[#003322]">Sair da Revisão</button>
      </div>
    </div>
  );
};

export default FlashcardView;
