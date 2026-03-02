import React, { useState, useEffect, useCallback } from 'react';
import { MedicalSubject, MultipleChoiceQuestion } from '../types';
import { INTENSIVO_RESIDENCIA_QUESTIONS } from '../constants';
import LoadingSpinner from './LoadingSpinner';

interface IntensivoViewProps {
  subject: MedicalSubject;
  onExit: () => void;
}

// Função para embaralhar um array e pegar os primeiros N itens
const getRandomQuestions = (subject: MedicalSubject, count: number): MultipleChoiceQuestion[] => {
    const allQuestions = INTENSIVO_RESIDENCIA_QUESTIONS[subject] || [];
    if (allQuestions.length === 0) {
        return [];
    }
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

const IntensivoView: React.FC<IntensivoViewProps> = ({ subject, onExit }) => {
    const [questions, setQuestions] = useState<MultipleChoiceQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});

    const fetchQuestions = useCallback(() => {
        setIsLoading(true);
        setError(null);
        setQuestions([]);
        setRevealedAnswers({});
        setSelectedAnswers({});
        try {
            const randomQuestions = getRandomQuestions(subject, 10);
            if (randomQuestions.length > 0) {
                setQuestions(randomQuestions);
            } else {
                setError(`Não há questões disponíveis para ${subject} no momento.`);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Falha ao carregar as questões.");
        } finally {
            // Adiciona um pequeno delay para a transição ser mais suave
            setTimeout(() => setIsLoading(false), 300);
        }
    }, [subject]);
    
    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    const toggleAnswer = (index: number) => {
        setRevealedAnswers(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const handleSelectAnswer = (questionIndex: number, option: string) => {
        if (revealedAnswers[questionIndex]) return;
        setSelectedAnswers(prev => ({ ...prev, [questionIndex]: option }));
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-[#003322]/70 text-lg">Sorteando questões sobre {subject}...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4 glass-panel text-[#003322]">
                <h3 className="text-xl font-bold mb-2">Erro ao Carregar</h3>
                <p>{error}</p>
                <button onClick={onExit} className="mt-4 px-4 py-2 simmit-button text-white rounded">Voltar</button>
            </div>
        );
    }

    return (
        <div className="overflow-y-auto h-full p-4 sm:p-6 bg-[#eaf0f7] text-[#003322] no-scrollbar">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#003322] mb-6 text-center">Banco de Questões: {subject}</h2>
            <div className="space-y-6 max-w-3xl mx-auto">
                {questions.map((q, index) => (
                    <div key={index} className="bg-white/60 p-5 rounded-lg shadow-md border border-white/60 animate-fade-in">
                        <p className="font-semibold text-[#003322] mb-4 text-left whitespace-pre-wrap">{`${index + 1}. ${q.question}`}</p>
                        <div className="space-y-2 mb-4">
                            {q.options.map((option, i) => {
                                const optionLetter = String.fromCharCode(65 + i);
                                const isRevealed = revealedAnswers[index];
                                const isSelected = selectedAnswers[index] === option;
                                const isCorrect = option === q.correctAnswer;
                                
                                let optionClasses = 'p-3 rounded-md border text-left transition-colors flex items-start';
                                
                                if (isRevealed) {
                                    if (isCorrect) {
                                        optionClasses += ' bg-[#18cf91]/15 border-[#18cf91]/60 text-[#003322] font-bold';
                                    } else if (isSelected && !isCorrect) {
                                        optionClasses += ' bg-[#741cd9]/15 border-[#741cd9]/60 text-[#003322] font-semibold';
                                    } else {
                                        optionClasses += ' bg-white/60 border-white/60 text-[#003322]/60 opacity-70';
                                    }
                                } else {
                                    optionClasses += ' cursor-pointer';
                                    if (isSelected) {
                                        optionClasses += ' bg-[#18cf91]/15 border-[#18cf91]/60 text-[#003322] font-semibold ring-2 ring-[#18cf91]/60';
                                    } else {
                                        optionClasses += ' bg-white/60 border-white/60 text-[#003322] hover:bg-white/80';
                                    }
                                }

                                return (
                                    <div 
                                        key={i} 
                                        className={optionClasses}
                                        onClick={() => handleSelectAnswer(index, option)}
                                        role="button"
                                        tabIndex={isRevealed ? -1 : 0}
                                        aria-pressed={isSelected}
                                    >
                                       <span className="font-bold mr-2">{optionLetter}.</span> <span className="flex-1">{option}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => toggleAnswer(index)}
                            className="text-sm font-semibold text-[#741cd9] hover:text-[#18cf91]"
                        >
                            {revealedAnswers[index] ? 'Esconder Resposta' : 'Mostrar Resposta'}
                        </button>
                        {revealedAnswers[index] && (
                            <div className="mt-4 p-4 bg-[#18cf91]/10 border border-[#18cf91]/60/40 rounded-lg animate-fade-in text-left">
                                <p className="font-bold text-[#003322]">Resposta Correta: <span className="font-normal">{q.correctAnswer}</span></p>
                                <p className="mt-2 text-sm text-[#003322] whitespace-pre-wrap"><span className="font-bold">Explicação:</span> {q.explanation}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="flex-shrink-0 text-center pt-8 pb-4">
                <button onClick={fetchQuestions} className="text-sm font-semibold text-[#741cd9] hover:text-[#18cf91] mr-8">Sortear Novas Questões</button>
                <button onClick={onExit} className="text-sm font-semibold text-[#003322]/70 hover:text-[#003322]">Sair do Estudo</button>
            </div>
        </div>
    );
};

export default IntensivoView;