import React, { useState, useCallback, useRef, useEffect } from 'react';
import { generateQuestionsFromText } from '../services/geminiService';
import { MultipleChoiceQuestion } from '../types';
import LoadingSpinner from './LoadingSpinner';

// Tell TypeScript that mammoth and pdfjsLib will be available on the global scope.
declare const mammoth: any;
declare const pdfjsLib: any;

const extractTextFromDocx = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
    return result.value;
};

const extractTextFromTxt = (file: File): Promise<string> => {
    return file.text();
};

const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    // The workerSrc property must be specified.
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.5.136/pdf.worker.mjs`;

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        // The item.str is the text content.
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
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
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [libsError, setLibsError] = useState<string | null>(null);

    useEffect(() => {
        // Give the scripts a moment to load from the CDN
        const timer = setTimeout(() => {
            if (typeof mammoth === 'undefined' || typeof pdfjsLib === 'undefined') {
                setLibsError('As bibliotecas para processar arquivos não puderam ser carregadas. Verifique sua conexão com a internet e tente recarregar a página.');
            }
        }, 2000);
        return () => clearTimeout(timer);
    }, []);


    const resetState = () => {
        setFile(null);
        setFileReady(false);
        setIsLoading(false);
        setError(null);
                setFileReady(true);
        setQuestions([]);
        setFileReady(false);
        setRevealedAnswers({});
        setSelectedAnswers({});
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            resetState();
            const allowedTypes = [
                'text/plain', 
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/pdf'
            ];
            if (allowedTypes.includes(selectedFile.type)) {
                setFile(selectedFile);
                setFileReady(true);
                setError(null);
                setFileReady(true);
            } else {
                setError('Por favor, selecione um arquivo DOCX, TXT ou PDF.');
            }
        }
    };
    
    const handleGenerate = async () => {
        if (!file) {
            setError('Nenhum arquivo selecionado.');
            return;
        }

        setIsLoading(true);
        setError(null);
                setFileReady(true);
        setQuestions([]);
        setFileReady(false);
        setRevealedAnswers({});
        setSelectedAnswers({});

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
                throw new Error("O arquivo parece estar vazio ou não contém texto legível.");
            }
            
            const generatedQuestions = await generateQuestionsFromText(textContent);
            setQuestions(generatedQuestions);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleAnswer = (index: number) => {
        setRevealedAnswers(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const handleSelectAnswer = (questionIndex: number, option: string) => {
        if (revealedAnswers[questionIndex]) return;
        setSelectedAnswers(prev => ({ ...prev, [questionIndex]: option }));
    };

    if (libsError) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4 glass-panel text-[#003322]">
                <h3 className="text-xl font-bold mb-2">Erro de Carregamento</h3>
                <p>{libsError}</p>
            </div>
        );
    }
    
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-[#003322]/70 text-lg">Analisando o documento e gerando questões...</p>
                <p className="mt-1 text-sm text-[#003322]/60">Isso pode levar alguns instantes.</p>
            </div>
        );
    }
    
    if (questions.length > 0) {
        return (
            <div className="overflow-y-auto h-full p-4 sm:p-6 bg-[#eaf0f7] text-[#003322] no-scrollbar">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#003322] mb-6 text-center">Questões Geradas</h2>
                <div className="space-y-6 max-w-2xl mx-auto">
                    {questions.map((q, index) => (
                        <div key={index} className="bg-white/60 p-5 rounded-lg shadow-md border border-white/60 animate-fade-in">
                            <p className="font-semibold text-[#003322] mb-4 text-left">{`${index + 1}. ${q.question}`}</p>
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
                                            optionClasses += ' bg-white/60 border-white/60 text-[#003322] hover:bg-white/60';
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
                                           <span className="font-bold mr-2">{optionLetter}.</span> <span>{option}</span>
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
                                    <p className="mt-2 text-sm text-[#003322]"><span className="font-bold">Explicação:</span> {q.explanation}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="text-center mt-8">
                    <button
                        onClick={resetState}
                        className="px-6 py-2 bg-white/60 border border-white/60 text-[#003322] font-semibold rounded-lg hover:bg-white/20 transition"
                    >
                        Gerar Novas Questões
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-[#eaf0f7] text-[#003322]">
            <div className="w-full max-w-lg">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#003322] mb-2">Gerador de Questões</h2>
                <p className="text-[#003322]/70 mb-8 max-w-md mx-auto">
                    Faça o upload de uma aula, artigo ou resumo em DOCX, TXT ou PDF e a IA criará questões de múltipla escolha para você.
                </p>
                <div 
                    className={`relative border-2 border-dashed rounded-xl p-8 sm:p-12 cursor-pointer transition-colors ${fileReady ? "border-[#18cf91] bg-white/20" : "border-white/60 hover:border-[#18cf91] hover:bg-white/30"}` }
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
                    <div className="flex flex-col items-center text-[#003322]/60">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-[#003322]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="font-semibold text-[#003322]">Arraste e solte seu arquivo aqui</p>
                        <p className="text-sm text-[#003322]/60 mt-1">ou <span className="text-[#741cd9] font-semibold">clique para selecionar</span></p>
                        <p className="text-xs text-[#003322]/60 mt-4">Suporta: DOCX, TXT, PDF</p>
                    </div>
                </div>

                {fileReady && !isLoading && (
                    <div className="mt-4 rounded-full border border-[#18cf91]/50 bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#18cf91]">Documento carregado</div>
                )}

                {file && (
                    <div className="mt-6 text-center animate-fade-in">
                        <p className="text-[#003322]">Arquivo selecionado: <span className="font-semibold">{file.name}</span></p>
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="mt-4 simmit-button px-8 py-3 rounded-lg font-semibold text-white shadow-md transition disabled:opacity-50"
                        >
                            Gerar Questões
                        </button>
                    </div>
                )}
                
                {error && <p className="mt-4 text-[#741cd9] animate-fade-in">{error}</p>}
            </div>
        </div>
    );
};