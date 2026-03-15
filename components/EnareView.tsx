import React, { useState, useEffect, useCallback } from 'react';
import { MedicalSubject, MultipleChoiceQuestion } from '../types';
import { INTENSIVO_RESIDENCIA_QUESTIONS } from '../constants';
import { generateQuestionExplanation } from '../services/geminiService';
import { questionsSupabase, QUESTIONS_TABLE } from '../services/supabaseQuestionsClient';
import LoadingSpinner from './LoadingSpinner';

interface IntensivoViewProps {
  subject: MedicalSubject;
  onExit: () => void;
}

type LoadedQuestion = MultipleChoiceQuestion & {
  id: string;
  examName?: string;
  institution?: string;
  year?: number | string;
};

const shuffle = <T,>(items: T[]): T[] => [...items].sort(() => 0.5 - Math.random());

const normalizeText = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const formatExplanationText = (text: string): string =>
  text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`{1,3}/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*]\s+/gm, '- ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const getRandomLocalQuestions = (subject: MedicalSubject, count: number): LoadedQuestion[] => {
  const allQuestions = INTENSIVO_RESIDENCIA_QUESTIONS[subject] || [];
  if (allQuestions.length === 0) {
    return [];
  }

  return shuffle(allQuestions)
    .slice(0, count)
    .map((question, index) => ({
      ...question,
      id: `local-${subject}-${index}-${Date.now()}`,
      examName: 'Banco local',
      institution: undefined,
      year: undefined,
    }));
};

const parseOptions = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((option) => String(option).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((option) => String(option).trim()).filter(Boolean);
      }
    } catch {
      // fallback to text split
    }

    return trimmed
      .split(/\r?\n|\s*\|\s*/)
      .map((option) => option.replace(/^[A-E]\)?\.?\s*/i, '').trim())
      .filter(Boolean);
  }

  return [];
};

const getSchemaOptions = (row: Record<string, unknown>): string[] => {
  return [row.opcao_a, row.opcao_b, row.opcao_c, row.opcao_d, row.opcao_e]
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter(Boolean);
};

const resolveCorrectAnswer = (raw: string, options: string[]): string => {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const upper = trimmed.toUpperCase();
  if (/^[A-E]$/.test(upper)) {
    const index = upper.charCodeAt(0) - 65;
    return options[index] || '';
  }

  return trimmed;
};

const subjectMatches = (rowSubject: string, appSubject: MedicalSubject): boolean => {
  const row = normalizeText(rowSubject);
  const app = normalizeText(appSubject);

  if (row === app) return true;
  if (app.includes('pedi')) return row.includes('pedi');
  if (app.includes('prevent')) return row.includes('prevent');
  if (app.includes('gine') || app.includes('obst')) return row.includes('gine') || row.includes('obst');
  if (app.includes('cirurg')) return row.includes('cirurg');
  if (app.includes('clinic')) return row.includes('clinic') || row.includes('medica') || row.includes('medicina interna');

  return false;
};

const getProvaMeta = (row: Record<string, unknown>): { examName?: string; institution?: string; year?: number | string } => {
  const provaRaw = row.provas as Record<string, unknown> | Record<string, unknown>[] | null | undefined;
  const prova = Array.isArray(provaRaw) ? provaRaw[0] : provaRaw;

  const examName = ((row.nome_prova as string) || (prova?.nome as string) || '').trim() || undefined;
  const institution = ((row.instituicao as string) || (prova?.instituicao as string) || '').trim() || undefined;
  const year = (row.ano as number | string) ?? (prova?.ano as number | string) ?? undefined;

  return { examName, institution, year };
};

const toQuestion = (row: Record<string, unknown>): LoadedQuestion | null => {
  const question = ((row.question as string) || (row.enunciado as string) || (row.statement as string) || '').trim();

  const explicitOptions = parseOptions(row.options ?? row.alternativas ?? row.answers);
  const schemaOptions = getSchemaOptions(row);
  const options = explicitOptions.length > 0 ? explicitOptions : schemaOptions;

  const rawCorrectAnswer =
    ((row.correct_answer as string) ||
      (row.correctAnswer as string) ||
      (row.gabarito as string) ||
      (row.answer as string) ||
      (row.resposta_correta as string) ||
      '').trim();

  const correctAnswer = resolveCorrectAnswer(rawCorrectAnswer, options);

  if (!question || !correctAnswer || options.length === 0) {
    return null;
  }

  const { examName, institution, year } = getProvaMeta(row);

  return {
    id: String(row.id || `${question.slice(0, 30)}-${Math.random()}`),
    question,
    options,
    correctAnswer,
    explanation:
      ((row.explanation as string) ||
        (row.explicacao as string) ||
        (row.justification as string) ||
        (row.comentario_expert as string) ||
        '').trim(),
    examName,
    institution,
    year,
  };
};

const loadQuestionsFromSupabase = async (subject: MedicalSubject, count: number): Promise<LoadedQuestion[]> => {
  if (!questionsSupabase) {
    return [];
  }

  let query = await questionsSupabase
    .from(QUESTIONS_TABLE)
    .select('*, provas(nome, instituicao, ano)')
    .limit(500);

  if (query.error) {
    query = await questionsSupabase
      .from(QUESTIONS_TABLE)
      .select('*')
      .limit(500);
  }

  if (query.error || !query.data) {
    throw new Error(query.error?.message || 'Falha ao consultar banco de questoes no Supabase.');
  }

  const allMappedQuestions = (query.data as Record<string, unknown>[])
    .map(toQuestion)
    .filter((question): question is LoadedQuestion => Boolean(question));

  const subjectQuestions = (query.data as Record<string, unknown>[])
    .filter((row) => {
      const rowSubject =
        (row.subject as string) ||
        (row.medical_subject as string) ||
        (row.disciplina as string) ||
        (row.especialidade as string) ||
        null;

      if (!rowSubject) {
        return true;
      }

      return subjectMatches(rowSubject, subject);
    })
    .map(toQuestion)
    .filter((question): question is LoadedQuestion => Boolean(question));

  // If subject labels from the DB do not match app labels, prefer using DB data
  // (mixed subjects) instead of falling back to the legacy local question bank.
  const source = subjectQuestions.length > 0 ? subjectQuestions : allMappedQuestions;
  return shuffle(source).slice(0, count);
};

const IntensivoView: React.FC<IntensivoViewProps> = ({ subject, onExit }) => {
  const [questions, setQuestions] = useState<LoadedQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [generatedExplanations, setGeneratedExplanations] = useState<Record<string, string>>({});
  const [isGeneratingExplanation, setIsGeneratingExplanation] = useState<Record<string, boolean>>({});

  const ensureExplanation = useCallback(
    async (question: LoadedQuestion) => {
      if (question.explanation.trim()) return;
      if (generatedExplanations[question.id]) return;
      if (isGeneratingExplanation[question.id]) return;

      setIsGeneratingExplanation((prev) => ({ ...prev, [question.id]: true }));

      try {
        const text = await generateQuestionExplanation({
          question: question.question,
          options: question.options,
          correctAnswer: question.correctAnswer,
          subject,
          institution: question.institution,
          year: question.year,
          examName: question.examName,
        });

        setGeneratedExplanations((prev) => ({
          ...prev,
          [question.id]: formatExplanationText(text.trim()) || 'Nao foi possivel gerar explicacao.',
        }));
      } catch (err) {
        setGeneratedExplanations((prev) => ({
          ...prev,
          [question.id]: err instanceof Error ? err.message : 'Falha ao gerar explicacao.',
        }));
      } finally {
        setIsGeneratingExplanation((prev) => ({ ...prev, [question.id]: false }));
      }
    },
    [generatedExplanations, isGeneratingExplanation, subject],
  );

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setQuestions([]);
    setRevealedAnswers({});
    setSelectedAnswers({});
    setGeneratedExplanations({});
    setIsGeneratingExplanation({});

    try {
      const supabaseQuestions = await loadQuestionsFromSupabase(subject, 10);
      if (supabaseQuestions.length > 0) {
        setQuestions(supabaseQuestions);
        return;
      }

      const localQuestions = getRandomLocalQuestions(subject, 10);
      if (localQuestions.length > 0) {
        setQuestions(localQuestions);
        return;
      }

      setError(`Nao ha questoes disponiveis para ${subject} no momento.`);
    } catch (err) {
      const localQuestions = getRandomLocalQuestions(subject, 10);
      if (localQuestions.length > 0) {
        setQuestions(localQuestions);
      } else {
        setError(err instanceof Error ? err.message : 'Falha ao carregar as questoes.');
      }
    } finally {
      setTimeout(() => setIsLoading(false), 300);
    }
  }, [subject]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const toggleAnswer = (index: number) => {
    const question = questions[index];
    const nextValue = !revealedAnswers[index];

    setRevealedAnswers((prev) => ({ ...prev, [index]: nextValue }));

    if (question && nextValue) {
      void ensureExplanation(question);
    }
  };

  const handleSelectAnswer = (questionIndex: number, option: string) => {
    if (revealedAnswers[questionIndex]) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: option }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-[#003322]/70 text-lg">Sorteando questoes sobre {subject}...</p>
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
      <h2 className="text-2xl sm:text-3xl font-bold text-[#003322] mb-6 text-center">Banco de Questoes: {subject}</h2>
      <div className="space-y-6 max-w-3xl mx-auto">
        {questions.map((q, index) => {
          const generatedExplanation = generatedExplanations[q.id] || '';
          const explanationText = formatExplanationText(q.explanation.trim() || generatedExplanation);
          const generating = Boolean(isGeneratingExplanation[q.id]);

          return (
            <div key={q.id} className="bg-white/60 p-5 rounded-lg shadow-md border border-white/60 animate-fade-in">
              <div className="mb-2 text-xs text-[#003322]/65">
                {q.examName ? <span>{q.examName}</span> : <span>Banco de questoes</span>}
                {q.institution ? <span>{` - ${q.institution}`}</span> : null}
                {q.year ? <span>{` - ${q.year}`}</span> : null}
              </div>

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
                  {generating ? (
                    <p className="mt-2 text-sm text-[#003322]">Gerando explicacao com IA...</p>
                  ) : (
                    <p className="mt-2 text-sm text-[#003322] whitespace-pre-wrap">
                      <span className="font-bold">Explicacao:</span>{' '}
                      {explanationText || 'Sem explicacao cadastrada para esta questao.'}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex-shrink-0 text-center pt-8 pb-4">
        <button onClick={fetchQuestions} className="text-sm font-semibold text-[#741cd9] hover:text-[#18cf91] mr-8">Sortear Novas Questoes</button>
        <button onClick={onExit} className="text-sm font-semibold text-[#003322]/70 hover:text-[#003322]">Sair do Estudo</button>
      </div>
    </div>
  );
};

export default IntensivoView;
