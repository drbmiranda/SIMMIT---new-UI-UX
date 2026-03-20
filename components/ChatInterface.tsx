import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GameMessage, MedicalSubject } from '../types';
import { SIMMIT_COMMANDS } from '../constants';
import MessageItem from './MessageItem';
import iconArrowLeft from '../design-SIMMIT/figma-sections/07-exam-hud-chat/assets/icon-arrow-left.svg';
import iconHudStamina from '../design-SIMMIT/figma-sections/07-exam-hud-chat/assets/icon-stamina.svg';
import iconHudBolt from '../design-SIMMIT/figma-sections/07-exam-hud-chat/assets/icon-bolt.svg';
import iconHudCancel from '../design-SIMMIT/figma-sections/07-exam-hud-chat/assets/icon-cancel.svg';
import SimulationCommandDrawer from './SimulationCommandDrawer';
import adultFemaleBlack from '../design-SIMMIT/patients-image/adult-female/blackwoman.jpg';
import adultFemaleBlond from '../design-SIMMIT/patients-image/adult-female/blondwoman.jpg';
import adultFemaleAsian from '../design-SIMMIT/patients-image/adult-female/japawoman.jpg';
import adultMaleBlack from '../design-SIMMIT/patients-image/adult-male/balckman.jpg';
import adultMaleBlond from '../design-SIMMIT/patients-image/adult-male/blondman.jpg';
import adultMaleAsian from '../design-SIMMIT/patients-image/adult-male/japaman.jpg';
import babyNeutral from '../design-SIMMIT/patients-image/baby/baby.jpg';
import childFemaleBlack from '../design-SIMMIT/patients-image/child-female/blackgirl.jpg';
import childFemaleBlond from '../design-SIMMIT/patients-image/child-female/blondgirl.jpg';
import childFemaleGinger from '../design-SIMMIT/patients-image/child-female/gingergirl.jpg';
import childMaleBlack from '../design-SIMMIT/patients-image/child-male/blackkikd.jpg';
import childMaleBlond from '../design-SIMMIT/patients-image/child-male/blondboy.jpg';
import childMaleGinger from '../design-SIMMIT/patients-image/child-male/gingerboy.jpg';
import elderlyFemale from '../design-SIMMIT/patients-image/elderly-female/olderwoman.jpg';
import elderlyMale from '../design-SIMMIT/patients-image/elderly-male/oldman.jpg';
import { sanitizeText } from '../utils/text';


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

type ExamActionKey = 'examGeneral' | 'examVitals' | 'examInspection' | 'examPalpation' | 'examPercussion' | 'examAuscultation';
type ExamReport = { title: string; subtitle: string; findings: string; issuedDate: string; imageUrl?: string };

type PatientProfile = { age: number | null; sexo: string; faixa: string };

const EXAM_ACTION_KEYS: ExamActionKey[] = ['examGeneral', 'examVitals', 'examInspection', 'examPalpation', 'examPercussion', 'examAuscultation'];
const adultFemalePool = [adultFemaleBlack, adultFemaleBlond, adultFemaleAsian];
const adultMalePool = [adultMaleBlack, adultMaleBlond, adultMaleAsian];
const childFemalePool = [childFemaleBlack, childFemaleBlond, childFemaleGinger];
const childMalePool = [childMaleBlack, childMaleBlond, childMaleGinger];
const elderlyFemalePool = [elderlyFemale];
const elderlyMalePool = [elderlyMale];
const babyPool = [babyNeutral];

const normalize = (text: string) => text.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
const randomFrom = (items: string[]) => items[Math.floor(Math.random() * items.length)] || null;
const normalizePlain = (text: string) => sanitizeText(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const inferProfile = (caseText: string, subject: MedicalSubject): PatientProfile => {
  const normalized = sanitizeText(caseText).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  let age = Number(normalized.match(/(\d{1,3})\s*anos?/)?.[1] || '') || null;
  let sexo = /\b(mulher|feminino|senhora|gestante|menina)\b/.test(normalized) ? 'Feminino' : /\b(homem|masculino|senhor|menino)\b/.test(normalized) ? 'Masculino' : 'Masculino';
  let faixa = age !== null && age >= 60 ? 'Idoso' : age !== null && age <= 2 ? 'Bebe' : age !== null && age <= 17 ? 'Crianca' : 'Adulto';

  if (subject.includes('Gine')) {
    sexo = 'Feminino';
    if (age === null || age < 10) age = 28;
    faixa = age >= 60 ? 'Idoso' : 'Adulto';
  }

  if (subject.includes('Pedi')) {
    if (age === null || age > 17) age = 8;
    faixa = age <= 2 ? 'Bebe' : 'Crianca';
  }

  return { age, sexo, faixa };
};

const pickPortrait = (profile: PatientProfile) => {
  if (profile.faixa === 'Bebe') return randomFrom(babyPool);
  if (profile.faixa === 'Idoso') return profile.sexo === 'Feminino' ? randomFrom(elderlyFemalePool) : randomFrom(elderlyMalePool);
  if (profile.faixa === 'Crianca') return profile.sexo === 'Feminino' ? randomFrom(childFemalePool) : randomFrom(childMalePool);
  return profile.sexo === 'Feminino' ? randomFrom(adultFemalePool) : randomFrom(adultMalePool);
};

const fallbackPatientName = (profile: PatientProfile) => {
  if (profile.faixa === 'Bebe') return profile.sexo === 'Feminino' ? 'Lia' : 'Theo';
  if (profile.faixa === 'Crianca') return profile.sexo === 'Feminino' ? 'Marina Costa' : 'Pedro Costa';
  if (profile.faixa === 'Idoso') return profile.sexo === 'Feminino' ? 'Dona Lúcia' : 'Seu Antônio';
  return profile.sexo === 'Feminino' ? 'Mariana Alves' : 'João Alves';
};

const extractPatientName = (caseText: string, profile: PatientProfile) => {
  const clean = sanitizeText(caseText);
  const candidate = clean.match(/(?:nome|paciente)\s*[:=-]?\s*([A-ZÀ-ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-ÿ][a-zà-ÿ]+){0,2})/i)?.[1]
    || clean.match(/(?:voc(?:e|ê|\?)\s*(?:é|e|\?))\s+([A-ZÀ-ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-ÿ][a-zà-ÿ]+){0,2})/i)?.[1]
    || clean.match(/^([A-ZÀ-ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-ÿ][a-zà-ÿ]+){0,2}),\s*\d{1,3}\s*anos?/i)?.[1]
    || '';

  const normalizedCandidate = candidate.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  if (!candidate || normalizedCandidate.startsWith('paciente') || normalizedCandidate.includes('feminin') || normalizedCandidate.includes('masculin')) {
    return fallbackPatientName(profile);
  }

  return candidate;
};

const extractChiefComplaint = (caseText: string) => {
  const raw = sanitizeText(caseText)
    .replace(/^(?:simmit:\s*)?caso cl(?:í|i|\?)nico inicial\s*/i, '')
    .trim();

  const explicitComplaint = raw.match(/queixa principal[:\-]?\s*([^.!?\n]+(?:[.!?])?)/i)?.[1]?.trim();
  if (explicitComplaint) return explicitComplaint.slice(0, 180);

  const sentences = raw
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const firstUsefulSentence = sentences.find((sentence) => {
    const normalizedSentence = sentence
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    return normalizedSentence.length > 12
      && !normalizedSentence.startsWith('voc')
      && !normalizedSentence.includes('o medico')
      && !normalizedSentence.includes('ia e o paciente')
      && !normalizedSentence.includes('deve ser decidido pelo medico')
      && !normalizedSentence.includes('se perguntado sobre diagnostico')
      && !normalizedSentence.includes('fale diretamente com o paciente')
      && !normalizedSentence.includes('painel de procedimentos')
      && !normalizedSentence.includes('menu de exame')
      && !normalizedSentence.includes('solicitacoes');
  });

  return (firstUsefulSentence || 'Queixa principal não informada.').slice(0, 180);
};
const extractVitals = (caseText: string) => {
  const clean = sanitizeText(caseText);
  return {
    heartRate: `${clean.match(/(?:fc|frequência cardíaca|frequencia cardiaca|heart rate)\s*[:=-]?\s*(\d{2,3})/i)?.[1] || '110'} bpm`,
    bloodPressure: `${clean.match(/(?:pa|pressão arterial|pressao arterial|blood pressure)\s*[:=-]?\s*(\d{2,3}\/?\d{2,3})/i)?.[1] || '145/90'} mmHg`,
    temperature: `${(clean.match(/(?:temp|temperatura|temperature)\s*[:=-]?\s*(\d{2}(?:[\.,]\d)?)/i)?.[1] || '37.2').replace(',', '.')} °C`,
    spo2: `${clean.match(/(?:spo2|sato2|sat(?:uração|uracao)?(?: de)? o2)\s*[:=-]?\s*(\d{2,3})/i)?.[1] || '96'} %`,
  };
};
const formatIssuedDate = (timestamp: number) => { const date = new Date(timestamp); return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`; };
const visibleSubject = (subject: MedicalSubject) => subject.includes('Cir') ? 'Clínica Cirúrgica' : subject.includes('Pedi') ? 'Pediatria' : subject.includes('Gine') ? 'Ginecologia e Obstetrícia' : subject.includes('Prevent') ? 'Medicina Preventiva' : 'Clínica Médica';
const buildExamReport = (message: GameMessage): ExamReport => {
  const cleaned = sanitizeText(message.text).replace(/^SIMMIT:\s*/i, '').trim();
  const [titleLine, ...rest] = cleaned.split(/\n+/);
  const detail = rest.join(' ').trim() || 'Nenhuma alteração aguda identificada.';
  const title = /IMAGEM|RAIO|RX/i.test(titleLine) ? 'Raio-X de Tórax' : /LABORATORIA/i.test(titleLine) ? 'Painel laboratorial' : 'Laudo diagnóstico';
  const subtitle = /RAIO|RX/i.test(title) ? 'Laudo radiográfico' : 'Laudo laboratorial';
  return { title, subtitle, findings: detail, issuedDate: formatIssuedDate(message.timestamp), imageUrl: message.imageUrl };
};
const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading, isGameStarted, onStartGame, error, isCaseFinished, onGetFeedback, onShowDashboard, showFeedback, feedbackText, runningScore, scoreNotification, subject, isTutorialActive }) => {
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [micSupported, setMicSupported] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [stamina, setStamina] = useState(100);
  const [completedExamActions, setCompletedExamActions] = useState<Set<ExamActionKey>>(new Set());
  const [isMedicalRecordOpen, setIsMedicalRecordOpen] = useState(false);
  const [activeExamReport, setActiveExamReport] = useState<ExamReport | null>(null);
  const [patientPortraitUrl, setPatientPortraitUrl] = useState<string | null>(null);
  const [badgeText, setBadgeText] = useState<string | null>(null);

  const patientProfileRef = useRef<PatientProfile>({ age: null, sexo: 'Masculino', faixa: 'Adulto' });
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const stopProcessingRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialCaseMessage = messages.find((message) => message.sender === 'SIMMIT' && /^SIMMIT:\s*CASO CL.?NICO INICIAL/i.test(sanitizeText(message.text).normalize('NFD').replace(/[\u0300-\u036f]/g, '')));
  const initialCaseText = initialCaseMessage ? sanitizeText(initialCaseMessage.text).replace(/^SIMMIT:\s*Caso Clinico Inicial\s*/i, '').replace(/^SIMMIT:\s*Caso Clínico Inicial\s*/i, '').replace(/^SIMMIT:\s*Caso Cl\?nico Inicial\s*/i, '').trim() : '';
  const visibleMessages = initialCaseMessage ? messages.filter((message) => message.id !== initialCaseMessage.id) : messages;

  const patientOpeningMessage = useMemo(() => visibleMessages.find((message) => {
    if (message.sender !== 'Paciente') return false;
    const clean = sanitizeText(message.text);
    const normalized = normalizePlain(clean);
    return clean.length > 0
      && normalized.length > 12
      && !normalized.includes('o medico')
      && !normalized.includes('voce e')
      && !normalized.includes('ia e o paciente')
      && !normalized.includes('exame fisico')
      && !normalized.includes('solicitacoes')
      && !normalized.includes('painel de procedimentos');
  })?.text ?? '', [visibleMessages]);
  const patientName = useMemo(() => extractPatientName(initialCaseText, patientProfileRef.current), [initialCaseText, subject, patientPortraitUrl]);
  const chiefComplaint = useMemo(() => extractChiefComplaint(patientOpeningMessage || initialCaseText), [patientOpeningMessage, initialCaseText]);
  const vitals = useMemo(() => extractVitals(initialCaseText), [initialCaseText]);
  const completion = Math.round((completedExamActions.size / EXAM_ACTION_KEYS.length) * 100);

  useEffect(() => {
    const API = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!API) return;
    setMicSupported(true);
    const recognition = new API();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'pt-BR';
    recognition.onresult = (event) => {
      if (stopProcessingRef.current) return;
      let transcript = '';
      for (let i = 0; i < event.results.length; i += 1) transcript += event.results[i][0].transcript;
      setInputValue(transcript);
    };
    recognition.onerror = () => { setIsRecording(false); stopProcessingRef.current = false; };
    recognition.onend = () => { setIsRecording(false); stopProcessingRef.current = false; };
    recognitionRef.current = recognition;
    return () => recognitionRef.current?.stop();
  }, []);

  useEffect(() => {
    if (!initialCaseText) return;
    const profile = inferProfile(initialCaseText, subject);
    patientProfileRef.current = profile;
    setPatientPortraitUrl(pickPortrait(profile));
  }, [initialCaseText, subject]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'auto' }); }, [visibleMessages, isLoading]);
  useEffect(() => {
    if (!scoreNotification) return;
    setBadgeText(`${scoreNotification.change > 0 ? '+' : ''}${scoreNotification.change} pts ? ${sanitizeText(scoreNotification.reason)}`);
    const timer = setTimeout(() => setBadgeText(null), 2400);
    return () => clearTimeout(timer);
  }, [scoreNotification]);

  const handleMicClick = () => {
    if (!recognitionRef.current) return;
    if (isRecording) recognitionRef.current.stop();
    else { stopProcessingRef.current = false; setInputValue(''); recognitionRef.current.start(); setIsRecording(true); }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    if (isRecording && recognitionRef.current) { stopProcessingRef.current = true; recognitionRef.current.stop(); }
    onSendMessage(inputValue.trim());
    setInputValue('');
  };

  const handleOpenDrawer = () => {
    if (isLoading) return;
    setIsDrawerOpen(true);
  };

  const handleSimmitAction = useCallback((command: string, cost = 0) => {
    if (isLoading) return;
    const actionKey = (Object.entries({ examGeneral: SIMMIT_COMMANDS.examGeneral, examVitals: SIMMIT_COMMANDS.examVitals, examInspection: SIMMIT_COMMANDS.examInspection, examPalpation: SIMMIT_COMMANDS.examPalpation, examPercussion: SIMMIT_COMMANDS.examPercussion, examAuscultation: SIMMIT_COMMANDS.examAuscultation }) as Array<[ExamActionKey, string]>).find(([, value]) => normalize(value) === normalize(command))?.[0];
    if (actionKey) setCompletedExamActions((prev) => new Set([...prev, actionKey]));
    setStamina((prev) => Math.max(0, prev - cost));
    onSendMessage(command);
    setIsDrawerOpen(false);
  }, [isLoading, onSendMessage]);

  if (showFeedback) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-[#f5f7fb] p-6 text-center text-[#21324a]">
        <h2 className="mb-4 text-3xl font-semibold">Avaliação de Desempenho</h2>
        {isLoading ? (
          <p className="mt-4 text-[#6d7b91]">Analisando sua performance...</p>
        ) : (
          <div className="w-full max-w-2xl rounded-[32px] border border-white/70 bg-white/70 p-8 shadow-[0_30px_70px_rgba(196,208,230,0.28)] ">
            {error && <div className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">Não foi possível gerar o feedback agora.</div>}
            <p className="text-sm uppercase tracking-[0.24em] text-[#8e9ab2]">Pontuação Final</p>
            <p className="mt-2 text-6xl font-semibold text-[#26344b]">{runningScore}</p>
            <div className="mt-6 rounded-[24px] bg-[#f7f9fc] p-5 text-left text-sm leading-7 text-[#526179]">{feedbackText ?? 'Feedback indisponível no momento.'}</div>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {(error || !feedbackText) && <button onClick={onGetFeedback} className="rounded-full border border-[#d7dfec] bg-white px-5 py-3 text-sm font-semibold text-[#26344b]">Tentar novamente</button>}
              <button onClick={onStartGame} className="rounded-full bg-[linear-gradient(135deg,#4d5d8f_0%,#5d36d1_45%,#31c9a3_100%)] px-5 py-3 text-sm font-semibold text-white">Gerar novo caso</button>
              <button onClick={onShowDashboard} className="rounded-full border border-[#d7dfec] bg-white px-5 py-3 text-sm font-semibold text-[#26344b]">Ver dashboard</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!isGameStarted || messages.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-[#f8fafc] text-[#6d7b91]">

        <p className="text-lg">Preparando a simulação de {subject}...</p>
        {error && <p className="mt-3 text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[radial-gradient(circle_at_15%_25%,rgba(194,245,231,0.78),transparent_28%),radial-gradient(circle_at_70%_40%,rgba(225,208,255,0.68),transparent_32%),linear-gradient(135deg,#f7fbfd_0%,#fefeff_30%,#f7f5ff_55%,#effbf8_100%)] text-[#26344b]">
      <header className="relative z-20 border-b border-[#dbe7e6] bg-[linear-gradient(90deg,rgba(214,248,240,0.82),rgba(248,244,255,0.78),rgba(211,248,236,0.82))] px-5 py-4  sm:px-8">
        <div className="mx-auto flex w-full max-w-[980px] items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/55 shadow-[0_8px_20px_rgba(210,220,236,0.45)]">
              <img src={iconArrowLeft} alt="" className="h-4 w-4" />
            </button>
            <div>
              <p className="text-[28px] font-semibold leading-none tracking-[-0.03em] text-[#26344b]">SIMMIT OSCE</p>
              <p className="mt-1 text-[15px] font-medium text-[#66758d]">Pontuação em tempo real</p>
            </div>
          </div>
          <div className="hidden items-center gap-6 sm:flex">
            <div className="rounded-2xl border-2 border-[#54cc9b] bg-white/65 px-4 py-2 text-[15px] font-semibold text-[#408a67]">{completion}% Completo</div>
            <div className="flex items-center gap-2 text-[22px] font-semibold text-[#26344b]"><img src={iconHudStamina} alt="" className="h-5 w-5" />{stamina} STAMINA</div>
            <div className="flex items-center gap-2 text-[22px] font-semibold text-[#26344b]"><img src={iconHudBolt} alt="" className="h-5 w-5" />{runningScore} MP</div>
            <button type="button" onClick={() => handleSimmitAction(SIMMIT_COMMANDS.closeCase, 0)} className="text-[18px] font-medium text-[#ee6d73]">encerrar</button>
          </div>
        </div>
      </header>

      <button type="button" onClick={() => setIsMedicalRecordOpen(true)} className="absolute right-5 top-[66px] z-20 rounded-b-[22px] rounded-t-none bg-white px-9 py-6 text-[18px] font-medium text-[#26344b] shadow-[0_14px_32px_rgba(199,210,228,0.22)] sm:right-10">Ficha do paciente</button>

      <div className="relative z-10 flex-1 overflow-y-scroll px-5 pb-44 pt-6 [scrollbar-gutter:stable] sm:px-8">
        <div className="mx-auto flex w-full max-w-[820px] flex-col">
          <div className="mb-4 inline-flex w-fit rounded-full border border-dashed border-[#56cda1] bg-white/42 px-6 py-3 text-[18px] font-medium text-[#46556d] ">{visibleSubject(subject)}</div>
          {isTutorialActive && <div className="mb-6 rounded-[28px] border border-white/65 bg-white/35 px-6 py-5 text-sm leading-7 text-[#526179]">Fale diretamente com o paciente, use o painel de procedimentos para exame físico e solicitações e encerre com {SIMMIT_COMMANDS.closeCase} quando quiser o feedback.</div>}
          {visibleMessages.map((msg) => <MessageItem key={msg.id} message={msg} onOpenExamResult={(message) => setActiveExamReport(buildExamReport(message))} />)}
          {isLoading && messages.length > 0 && <div className="my-4 inline-flex w-fit items-center rounded-[24px] border border-white/60 bg-white/55 px-5 py-4 text-sm text-[#6f7d94]">Paciente está respondendo...</div>}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {error && <p className="relative z-20 px-6 pb-3 text-sm text-red-600">{error}</p>}

      {isCaseFinished && <div className="relative z-20 px-5 pb-3 sm:px-8"><div className="mx-auto flex max-w-[820px] items-center justify-between rounded-[24px] border border-white/70 bg-white/62 px-5 py-4 "><div><p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#98a5bb]">SIMMIT</p><p className="mt-1 text-sm text-[#526179]">Caso concluído. Use o comando de encerramento para gerar o feedback do simulador.</p></div><button type="button" onClick={() => handleSimmitAction(SIMMIT_COMMANDS.closeCase, 0)} className="rounded-full bg-[linear-gradient(135deg,#4d5d8f_0%,#5d36d1_45%,#31c9a3_100%)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-white"><span className="inline-flex items-center gap-2"><img src={iconHudCancel} alt="" className="h-4 w-4" />Encerrar</span></button></div></div>}

      <form onSubmit={handleSubmit} className="absolute bottom-0 left-0 right-0 z-20 px-5 pb-5 sm:px-8 sm:pb-7">
        <div className="mx-auto flex max-w-[820px] items-center gap-3 rounded-[30px] border border-white/80 bg-white/78 p-2 shadow-[0_24px_48px_rgba(195,207,228,0.28)] ">
          <div className="flex min-w-0 flex-1 items-center gap-2 px-2">
            <input type="text" value={inputValue} onChange={(event) => setInputValue(event.target.value)} placeholder={isRecording ? 'Ouvindo...' : 'Fale ou digite para o paciente...'} className="w-full border-none bg-transparent px-2 text-[18px] text-[#6c7a91] outline-none placeholder:text-[#a3aec1]" disabled={isLoading} />
            {micSupported && <button type="button" onClick={handleMicClick} className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${isRecording ? 'border-red-300 bg-red-50 text-red-500' : 'border-[#d9e1ee] bg-[#f5f8fc] text-[#66758d]'}`} aria-label={isRecording ? 'Parar gravacao' : 'Iniciar gravacao'}><svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="9" y="3.5" width="6" height="11" rx="3" /><path d="M6.5 11.5a5.5 5.5 0 0011 0" /><path d="M12 17v3.5" /></svg></button>}
            <button type="button" onClick={handleOpenDrawer} className="inline-flex h-11 shrink-0 items-center gap-2 rounded-[22px] bg-[linear-gradient(135deg,#2ea989_0%,#3d59a9_45%,#5a2dc6_100%)] px-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_10px_22px_rgba(76,92,173,0.24)]" aria-label="Abrir painel de procedimentos"><span>Painel de procedimentos</span><svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 5l8 7-8 7" /></svg></button>
            <button type="submit" disabled={isLoading || !inputValue.trim()} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#d9e1ee] bg-[#f5f8fc] text-[#66758d] disabled:opacity-50" aria-label="Enviar mensagem"><svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 12h12" /><path d="M13 6l6 6-6 6" /></svg></button>
          </div>
        </div>
      </form>
      {badgeText && <div className="pointer-events-none fixed left-1/2 top-24 z-50 w-[92%] max-w-md -translate-x-1/2 rounded-[24px] border border-white/70 bg-white/78 px-5 py-4 text-center text-sm text-[#26344b] shadow-[0_24px_48px_rgba(196,208,230,0.24)] ">{badgeText}</div>}


      {isMedicalRecordOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-[#2b3038]/40 " onClick={() => setIsMedicalRecordOpen(false)}>
            <aside className="h-full w-full max-w-[498px] overflow-y-scroll rounded-l-[32px] border-l border-white/55 bg-[radial-gradient(circle_at_80%_25%,rgba(221,199,255,0.7),transparent_32%),radial-gradient(circle_at_90%_90%,rgba(199,246,229,0.72),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,251,255,0.93))] px-7 pb-10 [scrollbar-gutter:stable] shadow-[-18px_0_40px_rgba(28,42,68,0.12)]" onClick={(event) => event.stopPropagation()}>
              <div className="-mx-7 flex items-center justify-between border-b border-[#d8e2ef] px-7 py-5"><h3 className="text-[22px] font-semibold text-[#26344b]">Ficha do paciente</h3><button type="button" onClick={() => setIsMedicalRecordOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/75 text-[#98a5bb]">×</button></div>
              <div className="flex flex-col items-center pt-7 text-center">
                <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-white shadow-[0_14px_32px_rgba(196,208,230,0.24)]">{patientPortraitUrl && <img src={patientPortraitUrl} alt="Retrato do paciente" className="h-full w-full object-cover" />}</div>
                <h4 className="mt-4 text-[26px] font-semibold text-[#26344b]">{patientName}</h4>
                <p className="mt-1 text-[18px] text-[#55647b]">{patientProfileRef.current.age ?? 45} anos • {patientProfileRef.current.sexo}</p>
              </div>
              <section className="mt-8 rounded-[28px] border border-white/65 bg-white/36 p-6 "><h5 className="text-[22px] font-semibold text-[#26344b]">Queixa principal</h5><p className="mt-4 text-[18px] leading-8 text-[#46556d]">"{chiefComplaint}"</p></section>
              <section className="mt-5 rounded-[28px] border border-white/65 bg-white/36 p-6 "><h5 className="text-[22px] font-semibold text-[#26344b]">Sinais vitais</h5><div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-6"><div><p className="text-[16px] font-semibold text-[#8794aa]">Frequência cardíaca</p><p className="mt-1 text-[18px] font-semibold text-[#ed6474]">{vitals.heartRate}</p></div><div><p className="text-[16px] font-semibold text-[#8794aa]">Pressão arterial</p><p className="mt-1 text-[18px] font-semibold text-[#d39a23]">{vitals.bloodPressure}</p></div><div><p className="text-[16px] font-semibold text-[#8794aa]">Temperatura</p><p className="mt-1 text-[18px] font-semibold text-[#46556d]">{vitals.temperature}</p></div><div><p className="text-[16px] font-semibold text-[#8794aa]">SpO2</p><p className="mt-1 text-[18px] font-semibold text-[#2ecda2]">{vitals.spo2}</p></div></div></section>
            </aside>
          </div>
        )}

      {activeExamReport && (
          <div className="fixed inset-0 z-[60] flex justify-end bg-[#2b3038]/40 " onClick={() => setActiveExamReport(null)}>
            <aside className="h-full w-full max-w-[498px] overflow-y-scroll rounded-l-[32px] border-l border-white/55 bg-[radial-gradient(circle_at_80%_25%,rgba(221,199,255,0.7),transparent_32%),radial-gradient(circle_at_90%_90%,rgba(199,246,229,0.72),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,251,255,0.93))] px-7 pb-10 [scrollbar-gutter:stable] shadow-[-18px_0_40px_rgba(28,42,68,0.12)]" onClick={(event) => event.stopPropagation()}>
              <div className="-mx-7 flex items-center justify-between border-b border-[#d8e2ef] px-7 py-5"><div><h3 className="text-[22px] font-semibold text-[#26344b]">{activeExamReport.title}</h3><p className="text-[16px] font-semibold text-[#7c8ca6]">{activeExamReport.subtitle}</p></div><button type="button" onClick={() => setActiveExamReport(null)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/75 text-[#98a5bb]">×</button></div>
              <div className="mt-7 flex items-start justify-between gap-6 border-b border-[#e2e9f3] pb-5"><div><p className="text-[20px] font-semibold text-[#26344b]">SIMMIT Laboratório Médico</p><p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#8794aa]">Laudo confidencial do paciente</p></div><div className="text-right"><p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#a4b0c1]">Data de emissão</p><p className="text-[18px] font-semibold text-[#46556d]">{activeExamReport.issuedDate}</p></div></div>
              <div className="mt-5 overflow-hidden rounded-[6px] bg-[linear-gradient(135deg,#eef7f5_0%,#d6eef0_50%,#f5f1fb_100%)]">{activeExamReport.imageUrl ? <img src={activeExamReport.imageUrl} alt={activeExamReport.title} className="h-[266px] w-full object-cover" /> : <div className="flex h-[266px] items-center justify-center text-center"><div className="rounded-[24px] border border-white/60 bg-white/50 px-8 py-6 "><p className="text-[18px] font-semibold text-[#26344b]">{activeExamReport.title}</p><p className="mt-2 text-[14px] text-[#66758d]">Imagem do laudo indisponível</p></div></div>}</div>
              <section className="mt-5"><h5 className="text-[20px] font-semibold text-[#26344b]">Achados clínicos</h5><div className="mt-3 rounded-[28px] border border-white/65 bg-white/36 p-5 text-[16px] leading-8 text-[#526179] "><p><span className="font-semibold text-[#8794aa]">Paciente:</span> <span className="font-semibold text-[#26344b]">{patientName}</span></p><p><span className="font-semibold text-[#8794aa]">Data:</span> Hoje</p><p><span className="font-semibold text-[#8794aa]">Exame:</span> <span className="font-semibold text-[#26344b]">{activeExamReport.title}</span></p><p className="mt-3"><span className="font-semibold text-[#8794aa]">Resultados:</span></p><p className="font-semibold text-[#26344b]">{activeExamReport.findings}</p></div></section>
              <section className="mt-5"><h5 className="text-[20px] font-semibold text-[#26344b]">Interpretação do especialista</h5><div className="mt-3 rounded-[28px] border border-white/65 bg-white/36 p-5 text-[16px] leading-8 text-[#526179] ">{activeExamReport.findings}</div></section>
            </aside>
          </div>
        )}

      <SimulationCommandDrawer isOpen={isDrawerOpen} onToggle={() => setIsDrawerOpen((prev) => !prev)} onCommand={handleSimmitAction} stamina={stamina} disabled={isLoading} />
    </div>
  );
};

export default ChatInterface;















