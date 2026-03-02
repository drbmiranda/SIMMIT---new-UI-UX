import React, { useEffect, useRef, useState } from 'react';
import { generateFlashcardsFromText } from '../services/geminiService';
import { Flashcard } from '../types';
import LoadingSpinner from './LoadingSpinner';

// Tell TypeScript that mammoth and pdfjsLib will be available on the global scope.
declare const mammoth: any;
declare const pdfjsLib: any;

const extractTextFromDocx = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
};

const extractTextFromTxt = (file: File): Promise<string> => file.text();

const extractTextFromPdf = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.5.136/pdf.worker.mjs`;
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

const FlashcardPdfView: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileReady, setFileReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [libsError, setLibsError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof mammoth === 'undefined' || typeof pdfjsLib === 'undefined') {
        setLibsError('As bibliotecas para processar arquivos no puderam ser carregadas. Verifique sua conexo e recarregue a pgina.');
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const resetState = () => {
    setFile(null);
    setIsLoading(false);
    setFileReady(false);
    setError(null);
    setCards([]);
    setCurrentIndex(0);
    setFileReady(false);
    setIsFlipped(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    resetState();
    const allowedTypes = [
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/pdf',
    ];
    if (allowedTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
      setError(null);
      setFileReady(true);
    } else {
      setError('Por favor, selecione um arquivo DOCX, TXT ou PDF.');
    }
  };

  const handleGenerate = async () => {
    if (!file) {
      setError('Nenhum arquivo selecionado.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCards([]);
    setCurrentIndex(0);
    setFileReady(false);
    setIsFlipped(false);

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
        throw new Error('O arquivo parece estar vazio ou no contm texto legvel.');
      }

      const result = await generateFlashcardsFromText(textContent);
      if (!result.flashcards?.length) {
        throw new Error('No foi possvel gerar flashcards a partir deste documento.');
      }
      setCards(result.flashcards);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev + 1) % cards.length), 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length), 150);
  };

  if (libsError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4 glass-panel text-[#003322]">
        <h3 className="text-xl font-bold mb-2">Erro de Carregamento</h3>
        <p>{libsError}</p>
        <button onClick={onExit} className="mt-4 simmit-button px-6 py-2 rounded-lg text-white">Voltar</button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-[#003322] text-lg">Gerando flashcards a partir do documento...</p>
        <p className="mt-1 text-sm text-[#003322]/70">Isso pode levar alguns instantes.</p>
      </div>
    );
  }

  if (cards.length > 0) {
    const currentCard = cards[currentIndex];
    return (
      <div className="flex flex-col h-full bg-[#eaf0f7] text-[#003322] p-4 sm:p-6">
        <div className="flex-grow flex flex-col items-center justify-center">
          <div className="w-full max-w-xl h-64 sm:h-80 mb-6">
            <div className="flashcard-container w-full h-full" onClick={handleFlip} role="button" tabIndex={0} onKeyDown={(e) => e.key === ' ' && handleFlip()}>
              <div className={`flashcard ${isFlipped ? 'is-flipped' : ''}`}>
                <div className="flashcard-face flashcard-front simmit-card aero-gloss p-6 flex items-center justify-center">
                  <p className="text-xl sm:text-2xl font-semibold text-center text-[#003322]">{currentCard.question}</p>
                </div>
                <div className="flashcard-face flashcard-back simmit-card aero-gloss p-6 flex items-center justify-center">
                  <p className="text-base sm:text-lg text-center text-[#003322]/80 whitespace-pre-wrap">{currentCard.answer}</p>
                </div>
              </div>
            </div>
          </div>
          <p className="text-[#003322]/70 mb-4">Card {currentIndex + 1} de {cards.length}</p>
          <div className="flex items-center gap-4">
            <button onClick={handlePrev} className="px-5 py-2.5 glass-chip text-[#003322] font-semibold rounded-lg hover:bg-white/80 transition">Anterior</button>
            <button onClick={handleFlip} className="px-8 py-3 simmit-button text-white font-bold rounded-lg transition">Virar Card</button>
            <button onClick={handleNext} className="px-5 py-2.5 glass-chip text-[#003322] font-semibold rounded-lg hover:bg-white/80 transition">Prximo</button>
          </div>
        </div>
        <div className="flex-shrink-0 text-center pt-4">
          <button onClick={resetState} className="text-sm font-semibold text-[#741cd9] hover:text-[#18cf91] mr-8">Gerar Novos Flashcards</button>
          <button onClick={onExit} className="text-sm font-semibold text-[#003322]/70 hover:text-[#003322]">Sair da Reviso</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-[#eaf0f7] text-[#003322]">
      <div className="w-full max-w-lg">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Flashcards a partir de PDF</h2>
        <p className="text-[#003322]/70 mb-8 max-w-md mx-auto">
          Faa upload de um PDF, DOCX ou TXT e a IA ir gerar flashcards prontos para reviso rpida.
        </p>
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 sm:p-12 cursor-pointer transition-colors ${fileReady ? "border-[#18cf91] bg-white/30" : "border-white/60 hover:border-[#18cf91] hover:bg-white/40"}` }
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".docx,.txt,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/pdf"
            className="hidden"
            aria-label="Seletor de arquivo"
          />
          <div className="flex flex-col items-center text-[#003322]/70">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-[#741cd9]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="font-semibold text-[#003322]">Arraste e solte seu arquivo aqui</p>
            <p className="text-sm mt-1">ou <span className="text-[#18cf91] font-semibold">clique para selecionar</span></p>
            <p className="text-xs mt-4">Suporta: DOCX, TXT, PDF</p>
          </div>
        </div>

        {fileReady && !isLoading && (
          <div className="mt-4 rounded-full border border-[#18cf91]/50 bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#18cf91] inline-block">Documento carregado</div>
        )}

        {file && (
          <div className="mt-6 text-center animate-fade-in">
            <p className="text-[#003322]">Arquivo selecionado: <span className="font-semibold">{file.name}</span></p>
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="mt-4 simmit-button px-8 py-3 rounded-lg font-semibold text-white disabled:opacity-50"
            >
              Gerar Flashcards
            </button>
          </div>
        )}

        {error && <p className="mt-4 text-[#741cd9] animate-fade-in">{error}</p>}
      </div>
    </div>
  );
};

export default FlashcardPdfView;

