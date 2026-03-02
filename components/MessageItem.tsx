import React from 'react';
import { GameMessage } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface MessageItemProps {
  message: GameMessage;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isPlayer = message.sender === 'Jogador';
  const isSimmit = message.sender === 'SIMMIT';
  const messageAlignment = isPlayer ? 'items-end' : 'items-start';
  const bubbleColor = isPlayer
    ? 'bg-gradient-to-br from-[#741cd9] to-[#18cf91] text-white shadow-[0_12px_24px_rgba(116,28,217,0.35)] aero-gloss'
    : isSimmit
      ? 'glass-panel text-[#003322]'
      : 'glass-panel text-[#003322]';
  const senderPrefix = isPlayer ? 'Você' : isSimmit ? 'SIMMIT' : 'Paciente';

  const displayText = message.imagePrompt ? message.text.replace(/\[IMAGE_PROMPT:.*?\]/i, '').trim() : message.text;
  const sanitizedText = displayText.replace(/\*/g, '');

  return (
    <div className={`flex flex-col my-2 ${messageAlignment}`}>
      <div className={`max-w-[85%] sm:max-w-xl lg:max-w-2xl px-4 py-3 rounded-2xl ${bubbleColor}`}>
        <p className={`text-xs font-semibold mb-1 opacity-80 ${isSimmit ? 'uppercase tracking-[0.3em] text-[#741cd9]' : ''}`}>
          {senderPrefix}
        </p>
        <p className={`whitespace-pre-wrap break-words ${isSimmit ? 'italic text-sm text-[#003322]' : 'text-[#003322]'}`}>{sanitizedText}</p>
        {message.isLoadingImage && (
          <div className="mt-2 flex items-center text-sm">
            <LoadingSpinner size="sm" color={isPlayer ? 'text-white' : 'text-[#18cf91]'} />
            <span className={`ml-2 ${isPlayer ? 'text-white' : 'text-[#003322]/70'}`}>Gerando imagem...</span>
          </div>
        )}
        {message.imageUrl && !message.isLoadingImage && (
          <div className="mt-3 border border-white/10 rounded-md overflow-hidden">
            <img
              src={message.imageUrl}
              alt={message.imagePrompt || "Imagem médica gerada"}
              className="max-w-full h-auto max-h-96 object-contain"
            />
          </div>
        )}
        {message.imagePrompt && !message.isLoadingImage && !message.imageUrl && (
          <p className="mt-2 text-xs text-red-300 italic">A imagem não pôde ser gerada para: "{message.imagePrompt}"</p>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
