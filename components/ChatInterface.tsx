import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { GameMessage, MedicalSubject } from '../types';
import { SIMMIT_COMMANDS } from '../constants';
import MessageItem from './MessageItem';
import LoadingSpinner from './LoadingSpinner';
import SimulationCommandDrawer from './SimulationCommandDrawer';

gsap.registerPlugin(Flip);

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((this: SpeechRecognition, ev: any) => any) | null;
  onerror: ((this: SpeechRecognition, ev: any) => any) | null;
  onend: ((this: SpeechRecognition, ev: any) => any) | null;
}

declare global {
  interface Window {
    SpeechRecognition: { new(): SpeechRecognition };
    webkitSpeechRecognition: { new(): SpeechRecognition };
    __simmitFlipState?: any;
  }
}

interface ChatInterfaceProps {
  messages: GameMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isGameStarted: boolean;
  onStartGame: () => void;
  error: string | null;
  isCaseFinished: boolean;
  onGetFeedback: () => void;
  onShowDashboard: () => void;
  showFeedback: boolean;
  feedbackText: string | null;
  runningScore: number;
  scoreNotification: { change: number; reason: string } | null;
  subject: MedicalSubject;
  isTutorialActive: boolean;
}

const EXAM_ACTION_KEYS = [
  'examGeneral',
  'examVitals',
  'examInspection',
  'examPalpation',
  'examPercussion',
  'examAuscultation',
] as const;

type ExamActionKey = (typeof EXAM_ACTION_KEYS)[number];

type BadgeState = {
  id: number;
  title: string;
  description: string;
  change: number;
};

const normalizeCommandText = (text: string) =>
  text
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
  isGameStarted,
  onStartGame,
  error,
  isCaseFinished,
  onGetFeedback,
  onShowDashboard,
  showFeedback,
  feedbackText,
  runningScore,
  scoreNotification,
  subject,
  isTutorialActive,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [micSupported, setMicSupported] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [stamina, setStamina] = useState(100);
  const [completedExamActions, setCompletedExamActions] = useState<Set<ExamActionKey>>(new Set());
  const [activeBadge, setActiveBadge] = useState<BadgeState | null>(null);
  const [showVictory, setShowVictory] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const stopProcessingRef = useRef(false);

  const initialCaseMessage = messages.find((message) => {
    if (message.sender !== 'SIMMIT') return false;
    const normalized = message.text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
    return normalized.startsWith('SIMMIT: CASO CLINICO INICIAL');
  });
  const initialCaseText = initialCaseMessage
    ? initialCaseMessage.text
        .replace(/^SIMMIT:\s*Caso Clinico Inicial\s*/i, '')
        .replace(/^SIMMIT:\s*Caso Clínico Inicial\s*/i, '')
        .trim()
    : '';
  const visibleMessages = initialCaseMessage
    ? messages.filter((message) => message.id !== initialCaseMessage.id)
    : messages;

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setMicSupported(false);
      return;
    }

    setMicSupported(true);
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'pt-BR';

    recognition.onresult = (event) => {
      if (stopProcessingRef.current) return;
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInputValue(transcript);
    };

    recognition.onerror = (event) => {
      if (event.error !== 'aborted') {
        console.error('Speech recognition error:', event.error);
      }
      setIsRecording(false);
      stopProcessingRef.current = false;
    };

    recognition.onend = () => {
      setIsRecording(false);
      stopProcessingRef.current = false;
    };

    recognitionRef.current = recognition;

    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (!initialCaseMessage) return;
    setStamina(100);
    setCompletedExamActions(new Set());
    setActiveBadge(null);
    setShowVictory(false);
  }, [initialCaseMessage?.id]);

  useEffect(() => {
    if (!scoreNotification) return;
    setActiveBadge({
      id: Date.now(),
      title: scoreNotification.change >= 0 ? 'Raciocínio Clínico' : 'Atenção Clínica',
      description: scoreNotification.reason,
      change: scoreNotification.change,
    });
    const timer = setTimeout(() => setActiveBadge(null), 2500);
    return () => clearTimeout(timer);
  }, [scoreNotification]);

  useEffect(() => {
    if (!isCaseFinished) return;
    setShowVictory(true);
    const timer = setTimeout(() => setShowVictory(false), 2600);
    return () => clearTimeout(timer);
  }, [isCaseFinished]);

  const handleMicClick = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      stopProcessingRef.current = false;
      setInputValue('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const scrollToBottom = useCallback((behavior: 'smooth' | 'auto' = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    scrollToBottom('auto');
  }, [messages, scrollToBottom]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      if (isRecording && recognitionRef.current) {
        stopProcessingRef.current = true;
        recognitionRef.current.stop();
      }
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleOpenDrawer = () => {
    if (isLoading) return;
    const state = Flip.getState('[data-flip-id="simmit-logo"]');
    window.__simmitFlipState = state;
    setIsDrawerOpen(true);
  };

  const handleSimmitAction = useCallback(
    (command: string, cost = 0) => {
      if (isLoading) return;
      const normalized = normalizeCommandText(command);
      const actionKey = (Object.entries({
        examGeneral: SIMMIT_COMMANDS.examGeneral,
        examVitals: SIMMIT_COMMANDS.examVitals,
        examInspection: SIMMIT_COMMANDS.examInspection,
        examPalpation: SIMMIT_COMMANDS.examPalpation,
        examPercussion: SIMMIT_COMMANDS.examPercussion,
        examAuscultation: SIMMIT_COMMANDS.examAuscultation,
      }) as Array<[ExamActionKey, string]>).find(([, value]) => normalizeCommandText(value) === normalized)?.[0];

      if (actionKey) {
        setCompletedExamActions((prev) => new Set([...prev, actionKey]));
      }
      setStamina((prev) => Math.max(0, prev - cost));
      onSendMessage(command);
      setIsDrawerOpen(false);
    },
    [isLoading, onSendMessage]
  );

  const examProgress = Math.round((completedExamActions.size / EXAM_ACTION_KEYS.length) * 100);

  if (showFeedback) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-[#eaf0f7] p-6 text-center text-[#003322]">
        <h2 className="mb-4 text-3xl font-bold text-[#741cd9]">Avaliação de Desempenho</h2>
        {isLoading ? (
          <>
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-[#003322]/70">Analisando sua performance...</p>
          </>
        ) : (
          <div className="w-full max-w-2xl animate-fade-in rounded-lg border border-white/60 bg-white/70 p-6 shadow-[0_20px_40px_rgba(193,188,250,0.45)] backdrop-blur-xl">
            {error && (
              <div className="mb-6 rounded-lg border border-red-500/30 bg-red-50 px-4 py-3 text-sm text-red-700">
                Não foi possível gerar o feedback agora. Tente novamente em instantes.
              </div>
            )}
            <div className="mb-6">
              <p className="text-lg font-semibold text-[#003322]">Sua Pontuação Final</p>
              <p
                className={`text-6xl font-bold ${
                  runningScore >= 70
                    ? 'text-[#18cf91]'
                    : runningScore >= 40
                    ? 'text-[#741cd9]'
                    : 'text-red-400'
                }`}
              >
                {runningScore}
              </p>
            </div>
            <div className="text-left">
              <p className="mb-2 text-lg font-semibold text-[#003322]">Feedback Detalhado</p>
              <div className="max-h-60 overflow-y-auto rounded border border-white/60 bg-white/60 p-3 text-sm text-[#003322]/80 whitespace-pre-wrap">
                {feedbackText ?? 'Feedback indisponível no momento. Tente novamente.'}
              </div>
            </div>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              {(error || !feedbackText) && (
                <button
                  onClick={onGetFeedback}
                  className="rounded-lg border border-white/70 bg-white/60 px-6 py-3 font-semibold text-[#003322] shadow-md transition hover:bg-white/80"
                >
                  Tentar novamente
                </button>
              )}
              <button
                onClick={onStartGame}
                className="simmit-button aero-gloss rounded-lg px-6 py-3 font-semibold text-white"
              >
                Gerar Novo Caso de {subject}
              </button>
              <button
                onClick={onShowDashboard}
                className="rounded-lg border border-white/70 bg-white/60 px-6 py-3 font-semibold text-[#003322] shadow-md transition hover:bg-white/80"
              >
                Ver Dashboard Individual
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!isGameStarted || messages.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center text-[#003322]/70">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-lg">Preparando a simulação de {subject}...</p>
        {error && <p className="mt-4 text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#eaf0f7] text-[#003322] simmit-shell">
      <div className="sticky top-0 z-20 glass-panel aero-gloss px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.45em] text-[#741cd9]">SIMMIT OSCE</p>
            <p className="text-xs text-[#003322]/70">Pontuação em tempo real</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="glass-chip px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#003322] font-mono-data">
              {stamina} STAMINA
            </div>
            <div className="glass-chip px-4 py-2 text-sm font-semibold text-[#003322] font-mono-data">
              {runningScore} pts
            </div>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-[#003322]/60">
            <span>Propedêutica completa</span>
            <span>{examProgress}%</span>
          </div>
          <div className="mt-2 grid grid-cols-6 gap-1">
            {EXAM_ACTION_KEYS.map((key) => (
              <div
                key={key}
                className={`h-2 rounded-full border ${
                  completedExamActions.has(key)
                    ? 'bg-[#18cf91] border-[#18cf91] shadow-[0_0_12px_rgba(24,207,145,0.6)]'
                    : 'bg-white/60 border-white/70'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4" ref={scrollContainerRef}>
        {isTutorialActive && (
          <div className="mb-3 simmit-card aero-gloss rounded-2xl p-4 text-[#003322]">
            <p className="text-xs uppercase tracking-[0.3em] text-[#741cd9]">Modo Tutorial</p>
            <h3 className="mt-1 text-lg font-semibold text-[#003322]">Você é o médico. A IA é o paciente.</h3>
            <p className="mt-2 text-sm text-[#003322]/80">
              Fale diretamente com o paciente, como em uma consulta real.
            </p>
            <ol className="mt-3 grid gap-2 text-sm text-[#003322]/80 sm:grid-cols-2">
              <li>1. Apresente-se e confirme identidade.</li>
              <li>2. Explore a queixa principal (PQRST).</li>
              <li>3. Sintomas associados e antecedentes.</li>
              <li>4. Medicações, alergias e hábitos.</li>
              <li>5. Solicite exame físico/exames.</li>
              <li>6. Encerramento com hipótese e plano.</li>
            </ol>
            <p className="mt-3 text-xs text-[#003322]/60">
              Dica: use o menu de Exame Físico e Solicitações. Para feedback, use {SIMMIT_COMMANDS.closeCase}.
            </p>
          </div>
        )}

        {initialCaseMessage && (
          <div className="mb-3 simmit-card aero-gloss rounded-2xl p-4 text-[#003322]">
            <p className="text-xs uppercase tracking-[0.3em] text-[#741cd9]">Caso Clínico Inicial</p>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.2em] text-[#003322]/60">
              <span className="rounded-full border border-white/60 bg-white/70 px-2 py-1">Você: médico</span>
              <span className="rounded-full border border-white/60 bg-white/70 px-2 py-1">IA: paciente</span>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-[#003322]/80">{initialCaseText}</p>
          </div>
        )}

        {visibleMessages.map((msg) => (
          <MessageItem key={msg.id} message={msg} />
        ))}
        {isLoading && messages.length > 0 && (
          <div className="flex items-center p-2 text-[#003322]/70">
            <LoadingSpinner size="sm" color="text-[#18cf91]" />
            <span className="ml-2">Paciente está respondendo...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && <p className="px-4 pb-2 text-sm text-red-600">{error}</p>}

      {isCaseFinished && (
        <div className="px-4 pb-2">
          <div className="rounded-2xl glass-panel aero-gloss p-3 text-[#003322]">
            <p className="text-xs uppercase tracking-[0.3em] text-[#741cd9]">SIMMIT</p>
            <p className="mt-2 text-sm">
              SIMMIT: Caso concluído. Para feedback, digite {SIMMIT_COMMANDS.closeCase}.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleSimmitAction(SIMMIT_COMMANDS.closeCase, 0)}
                className="rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs font-semibold text-[#003322] transition hover:bg-[#d1e8d9]"
              >
                Inserir comando
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="sticky bottom-0 z-20 flex items-center gap-2 glass-panel aero-gloss px-4 py-3">
        <div className="flex flex-grow items-center rounded-2xl glass-panel transition-shadow focus-within:ring-2 focus-within:ring-[#741cd9]/40">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              isRecording
                ? 'Ouvindo... fale agora.'
                : isCaseFinished
                ? `Digite ${SIMMIT_COMMANDS.closeCase} para feedback.`
                : 'Digite sua fala como médico (perguntas ao paciente)...'
            }
            className="w-full border-none bg-transparent p-3 text-sm text-[#003322] outline-none placeholder:text-[#003322]/50"
            disabled={isLoading}
          />
          {micSupported && (
            <button
              type="button"
              onClick={handleMicClick}
              className={`-m-px flex-shrink-0 rounded-r-2xl border-l border-white/30 px-3 py-3 text-[11px] font-bold tracking-[0.2em] transition-colors ${
                isRecording ? 'bg-red-500 text-white' : 'bg-white/60 text-[#003322]/70 hover:bg-white/80'
              }`}
              aria-label={isRecording ? 'Parar gravação' : 'Iniciar gravação de voz'}
              disabled={isLoading}
            >
              MIC
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={handleOpenDrawer}
          className="simmit-button aero-gloss rounded-2xl px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-white"
        >
          SIMMIT
        </button>
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="glass-chip aero-gloss rounded-2xl px-4 py-3 text-sm font-semibold text-[#003322] transition hover:bg-white/70 disabled:opacity-50"
        >
          Enviar
        </button>
      </form>

      <AnimatePresence>
        {activeBadge && (
          <motion.div
            key={activeBadge.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className={`pointer-events-none fixed left-1/2 top-20 z-50 w-[90%] max-w-md -translate-x-1/2 rounded-2xl border px-4 py-3 text-center text-sm shadow-lg aero-gloss ${
              activeBadge.change >= 0
                ? 'border-white/60 bg-white/70 text-[#003322]'
                : 'border-red-300/70 bg-red-50 text-red-700'
            }`}
          >
            <p className="text-[10px] uppercase tracking-[0.4em]">
              {activeBadge.change >= 0 ? 'Bônus clínico' : 'Penalidade'}
            </p>
            <p className="mt-1 text-sm font-semibold">
              {activeBadge.change > 0 ? `+${activeBadge.change}` : activeBadge.change} pts
            </p>
            <p className="mt-1 text-xs text-[#003322]/70">{activeBadge.description}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVictory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-3xl border border-white/60 bg-white/70 px-8 py-6 text-center text-[#003322] shadow-[0_0_40px_rgba(193,188,250,0.6)] aero-gloss"
            >
              <p className="text-[11px] uppercase tracking-[0.4em] text-[#741cd9]">SIMMIT</p>
              <h3 className="mt-2 text-xl font-semibold">Caso Encerrado</h3>
              <p className="mt-2 text-sm text-[#003322]/70">Analisando sua performance final...</p>
            </motion.div>
            {[...Array(18)].map((_, idx) => (
              <motion.span
                key={idx}
                initial={{ opacity: 0, y: 0, x: 0, scale: 0.6 }}
                animate={{
                  opacity: [0, 1, 0],
                  y: -120 - idx * 4,
                  x: (idx % 2 === 0 ? 1 : -1) * (40 + idx * 3),
                  scale: 1,
                }}
                transition={{ duration: 1.8, delay: idx * 0.03, ease: 'easeOut' }}
                className="absolute h-2 w-2 rounded-full bg-[#c1bcfa] shadow-[0_0_12px_rgba(116,28,217,0.5)]"
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <SimulationCommandDrawer
        isOpen={isDrawerOpen}
        onToggle={() => setIsDrawerOpen((prev) => !prev)}
        onCommand={handleSimmitAction}
        stamina={stamina}
        disabled={isLoading}
      />
    </div>
  );
};

export default ChatInterface;
