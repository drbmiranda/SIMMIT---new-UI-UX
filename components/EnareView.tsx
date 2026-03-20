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
  if (allQuestions.length === 0) return [];

  return shuffle(allQuestions)
    .slice(0, count)
    .map((question, index) => ({
      ...question,
      id: `local-${subject}-${index}-${Date.now()}`,
      examName: 'Banco local',
      institution: 'USP',
      year: 2024,
    }));
};

const parseOptions = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map((option) => String(option).trim()).filter(Boolean);

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.map((option) => String(option).trim()).filter(Boolean);
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

const getSchemaOptions = (row: Record<string, unknown>): string[] =>
  [row.opcao_a, row.opcao_b, row.opcao_c, row.opcao_d, row.opcao_e]
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter(Boolean);

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
  if (!question || !correctAnswer || options.length === 0) return null;

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
  if (!questionsSupabase) return [];

  let query = await questionsSupabase.from(QUESTIONS_TABLE).select('*, provas(nome, instituicao, ano)').limit(500);
  if (query.error) {
    query = await questionsSupabase.from(QUESTIONS_TABLE).select('*').limit(500);
  }
  if (query.error || !query.data) {
    throw new Error(query.error?.message || 'Falha ao consultar banco de questões no Supabase.');
  }

  const allMappedQuestions = (query.data as Record<string, unknown>[]).map(toQuestion).filter((question): question is LoadedQuestion => Boolean(question));
  const subjectQuestions = (query.data as Record<string, unknown>[])
    .filter((row) => {
      const rowSubject =
        (row.subject as string) ||
        (row.medical_subject as string) ||
        (row.disciplina as string) ||
        (row.especialidade as string) ||
        null;
      if (!rowSubject) return true;
      return subjectMatches(rowSubject, subject);
    })
    .map(toQuestion)
    .filter((question): question is LoadedQuestion => Boolean(question));

  const source = subjectQuestions.length > 0 ? subjectQuestions : allMappedQuestions;
  return shuffle(source).slice(0, count);
};

const subjectLabel = (subject: MedicalSubject) => {
  switch (subject) {
    case 'Clínica Médica':
      return 'Clínica Médica';
    case 'Clínica Cirúrgica':
      return 'Clínica Cirúrgica';
    case 'Medicina Preventiva':
      return 'Medicina Preventiva';
    case 'Pediatria':
      return 'Pediatria';
    default:
      return 'Banco de questões';
  }
};

const IntensivoView: React.FC<IntensivoViewProps> = ({ subject, onExit }) => {
  const [questions, setQuestions] = useState<LoadedQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [generatedExplanations, setGeneratedExplanations] = useState<Record<string, string>>({});
  const [isGeneratingExplanation, setIsGeneratingExplanation] = useState<Record<string, boolean>>({});
  const [currentIndex, setCurrentIndex] = useState(0);

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
          [question.id]: formatExplanationText(text.trim()) || 'Não foi possível gerar explicação.',
        }));
      } catch (err) {
        setGeneratedExplanations((prev) => ({
          ...prev,
          [question.id]: err instanceof Error ? err.message : 'Falha ao gerar explicação.',
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
    setCurrentIndex(0);

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

      setError(`Não há questões disponíveis para ${subject} no momento.`);
    } catch (err) {
      const localQuestions = getRandomLocalQuestions(subject, 10);
      if (localQuestions.length > 0) {
        setQuestions(localQuestions);
      } else {
        setError(err instanceof Error ? err.message : 'Falha ao carregar as questões.');
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
    if (question && nextValue) void ensureExplanation(question);
  };

  const handleSelectAnswer = (questionIndex: number, option: string) => {
    if (revealedAnswers[questionIndex]) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: option }));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + questions.length) % questions.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % questions.length);
  };

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4 text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-lg text-[#061033]/75">Sorteando questões sobre {subject}...</p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4 text-center">
        <div className="rounded-[24px] border border-white/70 bg-white/70 px-8 py-10 shadow-[0_24px_48px_rgba(15,23,42,0.08)]">
          <h3 className="text-xl font-bold text-[#061033]">Erro ao carregar</h3>
          <p className="mt-2 text-[#061033]/70">{error || 'Não foi possível carregar questões.'}</p>
          <button onClick={onExit} className="mt-5 rounded-full bg-[linear-gradient(90deg,#6d28d9,#10b981)] px-5 py-2.5 text-sm font-semibold text-white">Voltar</button>
        </div>
      </div>
    );
  }

  const question = questions[currentIndex];
  const generatedExplanation = generatedExplanations[question.id] || '';
  const explanationText = formatExplanationText(question.explanation.trim() || generatedExplanation);
  const generating = Boolean(isGeneratingExplanation[question.id]);
  const isRevealed = Boolean(revealedAnswers[currentIndex]);
  const progressPercent = Math.max(16, ((currentIndex + 1) / questions.length) * 100);
  const questionOriginLabel = [question.examName, question.institution, question.year].filter(Boolean).join(' • ') || 'USP AD • 2024';

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.96),rgba(244,246,251,0.98)_30%,rgba(225,214,255,0.78)_72%,rgba(214,246,233,0.64)_100%)] text-[#061033]">
      <div className="mx-auto max-w-[1280px] px-8 pb-16 pt-10">
        <div className="mx-auto max-w-[960px]">
          <div className="h-3 rounded-full bg-[#d9e1ea]">
            <div className="h-full rounded-full bg-[linear-gradient(90deg,#7c3aed,#10b981)]" style={{ width: `${progressPercent}%` }} />
          </div>

          <div className="mt-4 flex items-center justify-between text-[#061033]">
            <span className="rounded-full border border-[#34d399] px-6 py-2 text-[14px] font-medium">Banco de questões: {subjectLabel(subject)}</span>
            <button onClick={onExit} className="text-[15px] font-medium text-[#061033]/85">Encerrar</button>
          </div>
          <div className="mt-12 flex gap-4">
            <div className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-[15px] bg-[#efe7fb] text-[31px] font-bold text-[#7c3aed] shadow-[0_8px_18px_rgba(124,58,237,0.12)]">{currentIndex + 1}</div>
            <div className="max-w-[760px]">
              <div className="mb-3 flex flex-wrap gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#64748b]">
                {question.examName && <span>{question.examName}</span>}
                {question.institution && <span>{question.institution}</span>}
                {question.year && <span>{question.year}</span>}
              </div>
              <h1 className="text-[20px] font-bold leading-[1.12] text-[#1f2937]">{question.question}</h1>
            </div>
          </div>

          <div className="mt-9 grid grid-cols-2 gap-4">
            {question.options.map((option, i) => {
              const optionLetter = String.fromCharCode(65 + i);
              const isSelected = selectedAnswers[currentIndex] === option;
              const isCorrect = option === question.correctAnswer;
              const isIncorrectSelected = isRevealed && isSelected && !isCorrect;
              const cardClassName = isRevealed
                ? isCorrect
                  ? 'border-[#22c55e] bg-[#dff8ec] text-[#166534]'
                  : isIncorrectSelected
                    ? 'border-[#f43f5e] bg-[#fff1f2] text-[#be123c]'
                    : 'border-[#d7dfeb] bg-white/75 text-[#1f2937]'
                : isSelected
                  ? 'border-[#10b981] bg-[#ecfdf5] text-[#1f2937]'
                  : 'border-[#d7dfeb] bg-white/75 text-[#1f2937]';

              return (
                <button
                  key={option}
                  onClick={() => handleSelectAnswer(currentIndex, option)}
                  disabled={isRevealed}
                  className={`rounded-[18px] border px-4 py-4 text-left shadow-[0_12px_24px_rgba(15,23,42,0.04)] ${cardClassName}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white/70 text-[17px] font-semibold">{optionLetter}</span>
                      <span className="text-[16px] leading-[1.18]">{option}</span>
                    </div>
                    {isRevealed && (isCorrect || isIncorrectSelected) ? <span className="text-[20px] font-bold">{isCorrect ? '?' : '×'}</span> : null}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-7 flex flex-col items-center">
            <p className="text-[18px] font-medium">{currentIndex + 1}/{questions.length}</p>
            <div className="mt-3 flex items-center gap-8">
              <button onClick={handlePrev} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/55 text-[26px] text-[#061033]/65 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">&lsaquo;</button>
              <button
                onClick={() => toggleAnswer(currentIndex)}
                className="rounded-[14px] bg-[linear-gradient(90deg,#6d28d9,#10b981)] px-6 py-3 text-[17px] font-semibold text-white shadow-[0_14px_30px_rgba(79,70,229,0.28)]"
              >
                {isRevealed ? 'Ocultar resposta' : 'Ver resposta'}
              </button>
              <button onClick={handleNext} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/55 text-[26px] text-[#061033]/65 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">&rsaquo;</button>
            </div>
          </div>

          {isRevealed && (
            <div className="mt-10 rounded-[22px] border border-white/60 bg-[linear-gradient(135deg,rgba(233,213,255,0.54),rgba(186,230,253,0.46))] px-7 py-7 shadow-[0_24px_54px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
              <div className="flex items-center gap-3 text-[20px] font-bold text-[#111827]">
                <span>?</span>
                <span>Explicação</span>
              </div>
              <p className="mt-5 text-[16px] leading-[1.6] text-[#334155]">
                {generating ? 'Gerando explicação com IA...' : explanationText || 'Sem explicação cadastrada para esta questão.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntensivoView;





