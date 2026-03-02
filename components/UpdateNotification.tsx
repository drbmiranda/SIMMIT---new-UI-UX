import React from 'react';

interface UpdateNotificationProps {
  onUpdate: () => void;
}

const UpdateNotification: React.FC<UpdateNotificationProps> = ({ onUpdate }) => {
  return (
    <div
      className="fixed bottom-4 right-4 z-50 bg-white/10 text-white p-4 rounded-lg shadow-2xl flex items-center gap-4 animate-fade-in border border-white/10"
      role="alert"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      <div>
        <p className="font-semibold">Nova versão disponível!</p>
        <p className="text-sm text-slate-300">Recarregue para obter as últimas melhorias.</p>
      </div>
      <button
        onClick={onUpdate}
        className="ml-auto flex-shrink-0 px-4 py-2 bg-teal-600 font-semibold rounded-md hover:bg-teal-500 transition"
      >
        Atualizar
      </button>
    </div>
  );
};

export default UpdateNotification;
