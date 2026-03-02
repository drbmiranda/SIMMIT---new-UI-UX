import React, { useState } from 'react';

interface ReportErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReport: (subject: string) => void;
}

const ReportErrorModal: React.FC<ReportErrorModalProps> = ({ isOpen, onClose, onReport }) => {
  const [subject, setSubject] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleReport = () => {
    const trimmed = subject.trim();
    if (!trimmed) {
      return;
    }
    onReport(trimmed);
    setSubject('');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose} // Close on overlay click
    >
      <div 
        className="bg-white/5 border border-white/10 rounded-xl shadow-2xl p-6 sm:p-8 max-w-lg w-full text-center backdrop-blur-xl transform transition-all"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-500/10 border border-yellow-500/30 mb-4">
          <svg className="h-6 w-6 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-100 mb-3">
          Encontrou algum problema?
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          Você encontrou algum conteúdo que não faz sentido? Desculpe-nos pelo transtorno, estamos ativamente implementando um protocolo anti alucinação para IA. Clique em "Reportar Problema" para avisar a equipe de desenvolvimento.
        </p>
        <label className="block text-left text-sm font-semibold text-slate-200 mb-2" htmlFor="report-subject">
          Descreva o problema
        </label>
        <textarea
          id="report-subject"
          rows={4}
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="Conteúdo incorreto, resposta incoerente, erro no caso, etc."
          className="mb-6 w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/30"
        />
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-white/10 border border-white/10 text-slate-100 font-semibold rounded-lg hover:bg-white/20 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleReport}
            disabled={!subject.trim()}
            className="w-full px-4 py-2.5 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-500 transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reportar Problema
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportErrorModal;
