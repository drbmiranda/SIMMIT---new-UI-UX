import React, { useState, useRef, useEffect } from 'react';
import { generateQuestionsFromText } from '../services/geminiService';
import { MultipleChoiceQuestion } from '../types';
import LoadingSpinner from './LoadingSpinner';

declare const mammoth: any;
declare const pdfjsLib: any;

const extractTextFromDocx = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
};

const extractTextFromTxt = async (file: File): Promise<string> => file.text();

const extractTextFromPdf = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.5.136/pdf.worker.mjs';

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += `${pageText}\n`;
  }

  return fullText;
};

export const QuestionGeneratorView: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileReady, setFileReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<MultipleChoiceQuestion[]>([]);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [libsError, setLibsError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof mammoth === 'undefined' || typeof pdfjsLib === 'undefined') {
        setLibsError('As bibliotecas de processamento de arquivo nao foram carregadas. Recarregue a pagina.');
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const clearResultState = () => {
    setQuestions([]);
    setRevealedAnswers({});
    setSelectedAnswers({});
  };

  const resetAll = () => {
    setFile(null);
    setFileReady(false);
    setIsLoading(false);
    setError(null);
    clearResultState();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    if (!selectedFile) return;

    const allowedTypes = [
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/pdf',
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Selecione um arquivo DOCX, TXT ou PDF.');
      setFile(null);
      setFileReady(false);
      clearResultState();
      return;
    }

    setFile(selectedFile);
    setFileReady(true);
    setError(null);
    clearResultState();
  };

  const handleGenerate = async () => {
    if (!file) {
      setError('Nenhum arquivo selecionado.');
      return;
    }

    setIsLoading(true);
    setError(null);
    clearResultState();

    try {
      let textContent = '';

      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        textContent = await extractTextFromDocx(file);
      } else if (file.type === 'application/pdf') {
        textContent = await extractTextFromPdf(file);
      } else {
        textContent = await extractTextFromTxt(file);
      }

      if (!textContent.trim()) {
        throw new Error('O arquivo parece vazio ou sem texto legivel.');
      }

      const generatedQuestions = await generateQuestionsFromText(textContent);
      setQuestions(generatedQuestions);
      setFileReady(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar questoes.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAnswer = (index: number) => {
    setRevealedAnswers((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleSelectAnswer = (questionIndex: number, option: string) => {
    if (revealedAnswers[questionIndex]) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: option }));
  };

  if (libsError) {
    return (
      <div className="mx-auto flex h-full w-full max-w-3xl flex-col items-center justify-center p-4 text-center text-[#003322]">
        <div className="w-full rounded-3xl border border-white/70 bg-white/75 p-8 shadow-[0_24px_64px_rgba(116,28,217,0.16)] backdrop-blur-xl">
          <h3 className="text-xl font-bold">Erro de carregamento</h3>
          <p className="mt-2 text-[#003322]/75">{libsError}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4 text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-lg text-[#003322]/80">Analisando documento e gerando questoes...</p>
      </div>
    );
  }

  if (questions.length > 0) {
    return (
      <div className="mx-auto h-full w-full max-w-5xl overflow-y-auto px-4 pb-8 pt-6 text-[#003322] no-scrollbar sm:px-6">
        <div className="rounded-3xl border border-white/70 bg-white/75 px-5 py-6 shadow-[0_24px_64px_rgba(116,28,217,0.12)] backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#741cd9]/80">05 Question bank</p>
          <h2 className="mt-2 font-title text-3xl tracking-tight text-[#003322]">Questoes geradas</h2>
          <p className="mt-2 text-sm text-[#003322]/70">Responda, revele o gabarito e revise a explicacao de cada item.</p>
        </div>

        <div className="mt-5 space-y-5">
          {questions.map((q, index) => (
            <div key={index} className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-md">
              <p className="text-base font-semibold text-[#003322]">{index + 1}. {q.question}</p>

              <div className="mt-4 space-y-2">
                {q.options.map((option, optionIndex) => {
                  const optionLetter = String.fromCharCode(65 + optionIndex);
                  const isRevealed = revealedAnswers[index];
                  const isSelected = selectedAnswers[index] === option;
                  const isCorrect = option === q.correctAnswer;

                  let optionClasses = 'flex items-start rounded-xl border p-3 text-left transition-colors';

                  if (isRevealed) {
                    if (isCorrect) {
                      optionClasses += ' border-[#18cf91]/60 bg-[#18cf91]/15 font-semibold text-[#003322]';
                    } else if (isSelected && !isCorrect) {
                      optionClasses += ' border-[#741cd9]/60 bg-[#741cd9]/15 text-[#003322]';
                    } else {
                      optionClasses += ' border-white/70 bg-white/65 text-[#003322]/65';
                    }
                  } else if (isSelected) {
                    optionClasses += ' cursor-pointer border-[#18cf91]/60 bg-[#18cf91]/10 ring-2 ring-[#18cf91]/45';
                  } else {
                    optionClasses += ' cursor-pointer border-white/70 bg-white/65 hover:bg-white';
                  }

                  return (
                    <div
                      key={optionIndex}
                      className={optionClasses}
                      onClick={() => handleSelectAnswer(index, option)}
                      role="button"
                      tabIndex={isRevealed ? -1 : 0}
                      aria-pressed={isSelected}
                    >
                      <span className="mr-2 font-bold">{optionLetter}.</span>
                      <span>{option}</span>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => toggleAnswer(index)}
                className="mt-4 text-sm font-semibold text-[#741cd9] hover:text-[#18cf91]"
              >
                {revealedAnswers[index] ? 'Esconder resposta' : 'Mostrar resposta'}
              </button>

              {revealedAnswers[index] && (
                <div className="mt-4 rounded-xl border border-[#18cf91]/45 bg-[#18cf91]/10 p-4">
                  <p className="font-semibold text-[#003322]">Resposta correta: {q.correctAnswer}</p>
                  <p className="mt-2 text-sm text-[#003322]/80">{q.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={resetAll}
            className="rounded-xl border border-white/70 bg-white/80 px-6 py-2.5 font-semibold text-[#003322] transition hover:bg-white"
          >
            Gerar novas questoes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-5xl flex-col px-4 pb-8 pt-6 text-[#003322] sm:px-6">
      <div className="rounded-3xl border border-white/70 bg-white/75 px-5 py-6 shadow-[0_24px_64px_rgba(116,28,217,0.12)] backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#741cd9]/80">05 Question bank</p>
        <h2 className="mt-2 font-title text-3xl tracking-tight text-[#003322]">Gerador de questoes</h2>
        <p className="mt-2 text-sm text-[#003322]/70">Faça upload de DOCX, TXT ou PDF para gerar questoes de multipla escolha.</p>
      </div>

      <div className="mt-6 rounded-3xl border border-white/70 bg-white/70 p-6 shadow-[0_20px_50px_rgba(116,28,217,0.12)] backdrop-blur-xl">
        <div
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${fileReady ? 'border-[#18cf91] bg-[#18cf91]/10' : 'border-[#741cd9]/30 bg-white/70 hover:border-[#18cf91]'}`}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              fileInputRef.current?.click();
            }
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".docx,.txt,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/pdf"
            className="hidden"
            aria-label="Selecionar arquivo"
          />
          <p className="text-base font-semibold text-[#003322]">Arraste seu arquivo ou clique para selecionar</p>
          <p className="mt-1 text-sm text-[#003322]/65">Formatos suportados: DOCX, TXT, PDF</p>
        </div>

        {file && (
          <div className="mt-5 text-center">
            <p className="text-sm text-[#003322]/75">
              Arquivo selecionado: <span className="font-semibold text-[#003322]">{file.name}</span>
            </p>
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="mt-4 rounded-xl bg-[#741cd9] px-8 py-3 font-semibold text-white shadow-[0_14px_28px_rgba(116,28,217,0.35)] transition hover:brightness-110 disabled:opacity-60"
            >
              Gerar questoes
            </button>
          </div>
        )}

        {error && <p className="mt-4 text-center text-sm font-medium text-[#741cd9]">{error}</p>}
      </div>
    </div>
  );
};
