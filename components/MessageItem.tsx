import React from 'react';
import { GameMessage } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { sanitizeText } from '../utils/text';

interface MessageItemProps {
  message: GameMessage;
  onOpenExamResult?: (message: GameMessage) => void;
}

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();

const isExamResultMessage = (message: GameMessage) => {
  if (message.sender !== 'SIMMIT') return false;
  const normalized = normalize(message.text);
  return (
    normalized.includes('RESULTADOS DE EXAME') ||
    normalized.includes('RESULTADOS DE EXAMES') ||
    normalized.includes('RADIOGRAPHY') ||
    normalized.includes('RAIO X') ||
    normalized.includes('RAIO-X') ||
    normalized.includes('RX') ||
    normalized.includes('TOMOGRAFIA') ||
    normalized.includes('RESSONANCIA') ||
    normalized.includes('ULTRASSOM')
  );
};

const extractExamCard = (text: string) => {
  const cleaned = sanitizeText(text).replace(/^SIMMIT:\s*/i, '').trim();
  const [rawTitle, ...bodyParts] = cleaned.split(/\n+/);
  const body = bodyParts.join(' ').trim();
  const normalizedTitle = normalize(rawTitle || 'Resultado de exame');

  let title = rawTitle || 'Resultado de exame';
  let subtitle = 'Resultados do exame';

  if (normalizedTitle.includes('IMAGEM') || normalizedTitle.includes('RAIO') || normalizedTitle.includes('RX')) {
    title = 'Raio-X de Tórax';
    subtitle = 'Resultado radiografico';
  } else if (normalizedTitle.includes('LABORATORIA')) {
    title = 'Resultados laboratoriais';
    subtitle = 'Achados laboratoriais';
  }

  return {
    title,
    subtitle,
    preview: body || 'Toque para ver o laudo',
  };
};

const MessageItem: React.FC<MessageItemProps> = ({ message, onOpenExamResult }) => {
  const isPlayer = message.sender === 'Jogador';
  const isSimmit = message.sender === 'SIMMIT';
  const examCard = isExamResultMessage(message) ? extractExamCard(message.text) : null;

  const displayText = message.imagePrompt ? sanitizeText(message.text).replace(/\[IMAGE_PROMPT:.*?\]/i, '').trim() : sanitizeText(message.text);
  const sanitizedText = displayText.replace(/^SIMMIT:\s*/i, '').trim();
  const senderLabel = isPlayer ? 'VOCE' : isSimmit ? 'SIMMIT' : 'PACIENTE';

  if (examCard) {
    return (
      <div className="my-6 flex flex-col items-start">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#a7b3c7]">SIMMIT</p>
        <button
          type="button"
          onClick={() => onOpenExamResult?.(message)}
          className="flex w-full max-w-[236px] items-center gap-4 rounded-[22px] border border-white/60 bg-white/62 px-4 py-4 text-left shadow-[0_14px_32px_rgba(199,210,254,0.2)] backdrop-blur-[18px] transition hover:bg-white/78"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eff3fb] text-[#7c8ca6] shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M8 3.75h6l4.25 4.25v10A2 2 0 0116.25 20h-8.5A2 2 0 015.75 18V5.75A2 2 0 017.75 3.75z" />
              <path d="M14 3.75V8h4.25" />
              <path d="M8.5 11.25h7" />
              <path d="M8.5 14.25h7" />
            </svg>
          </span>
          <span className="min-w-0">
            <span className="block text-[13px] font-semibold leading-5 text-[#26344b]">{examCard.title}</span>
            <span className="mt-0.5 block text-[12px] font-semibold leading-4 text-[#73819a]">{examCard.subtitle}</span>
            <span className="mt-0.5 block text-[12px] font-semibold leading-4 text-[#2ecda2]">Toque para ver o laudo</span>
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className={`my-5 flex flex-col ${isPlayer ? 'items-end' : 'items-start'}`}>
      <p className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#a7b3c7] ${isPlayer ? 'pr-2' : ''}`}>
        {senderLabel}
      </p>
      <div
        className={
          isPlayer
            ? 'max-w-[132px] rounded-[22px] bg-[linear-gradient(135deg,#55628b_0%,#4f5a7d_52%,#5f8f80_100%)] px-5 py-4 text-right text-[16px] leading-6 text-white shadow-[0_16px_34px_rgba(67,92,130,0.22)]'
            : 'max-w-[602px] rounded-[26px] border border-white/60 bg-white/42 px-5 py-4 text-[15px] leading-7 text-[#334258] shadow-[0_14px_30px_rgba(196,208,230,0.16)] backdrop-blur-[18px]'
        }
      >
        <p className="whitespace-pre-wrap break-words">{sanitizedText}</p>
        {message.isLoadingImage && (
          <div className="mt-3 flex items-center text-sm">
            <LoadingSpinner size="sm" color={isPlayer ? 'text-white' : 'text-[#2ecda2]'} />
            <span className={`ml-2 ${isPlayer ? 'text-white/90' : 'text-[#6e7d96]'}`}>Gerando imagem...</span>
          </div>
        )}
        {message.imageUrl && !message.isLoadingImage && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/40">
            <img src={message.imageUrl} alt={message.imagePrompt || 'Imagem medica gerada'} className="max-h-96 w-full object-cover" />
          </div>
        )}
        {message.imagePrompt && !message.isLoadingImage && !message.imageUrl && (
          <p className="mt-3 text-xs italic text-red-400">A imagem nao pode ser gerada para: "{message.imagePrompt}"</p>
        )}
      </div>
    </div>
  );
};

export default MessageItem;



