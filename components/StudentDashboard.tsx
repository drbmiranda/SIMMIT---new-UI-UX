import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabaseClient';
import { SimulationResult, PerformanceAnalysis, MedicalSubject, Profile } from '../types';
import { analyzeStudentPerformance } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { MEDICAL_SUBJECTS } from '../constants';
import { GamificationState, loadGamificationState, syncGamificationState } from '../services/gamificationService';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white/5 border border-white/60 p-4 rounded-lg flex items-center shadow-sm">
        <div className="p-3 rounded-full bg-teal-500/20 text-teal-200 mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm text-[#003322]/60">{title}</p>
            <p className="text-2xl font-bold text-[#003322]">{value}</p>
        </div>
    </div>
);

const EconomyStatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    accent: string;
    badge: string;
}> = ({ title, value, icon, accent, badge }) => (
    <div className={`group relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 glass-panel p-4 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl ${accent}`}>
        <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
                <div className="rounded-full border border-white/60 bg-white/10 p-2 text-[#003322]">
                    {icon}
                </div>
                <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-[#003322]/60">{title}</p>
                    <p className="mt-1 text-2xl font-bold text-[#003322]">{value}</p>
                </div>
            </div>
            <span className="rounded-full border border-white/60 bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#003322]/80">
                {badge}
            </span>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-2/3 bg-gradient-to-r from-teal-500/60 to-cyan-400/60" />
        </div>
    </div>
);

const AnalysisItem: React.FC<{ text: string, type: 'strength' | 'improvement' }> = ({ text, type }) => {
    const icon = type === 'strength'
        ? <path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
        : <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />;
    const color = type === 'strength' ? 'text-emerald-300' : 'text-amber-300';

    return (
        <li className="flex items-start text-[#003322]/80">
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 flex-shrink-0 mr-3 mt-1 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {icon}
            </svg>
            <span>{text}</span>
        </li>
    );
};

const DAILY_FLASHCARD_KEY = 'simmit-daily-flashcards';

const getLocalDateKey = (date = new Date()) => date.toLocaleDateString('en-CA');

const readDailyFlashcards = () => {
    const todayKey = getLocalDateKey();
    try {
        const raw = localStorage.getItem(DAILY_FLASHCARD_KEY);
        if (!raw) return { dateKey: todayKey, count: 0 };
        const parsed = JSON.parse(raw) as { dateKey?: string; count?: number };
        if (parsed.dateKey !== todayKey) return { dateKey: todayKey, count: 0 };
        return { dateKey: todayKey, count: typeof parsed.count === 'number' ? parsed.count : 0 };
    } catch {
        return { dateKey: todayKey, count: 0 };
    }
};

const PerformanceChart: React.FC<{ results: SimulationResult[] }> = ({ results }) => {
    const data = useMemo(() => {
        // Reverse to get chronological order and take last 15 for readability
        return results.slice(0, 15).reverse();
    }, [results]);

    if (data.length < 2) return null;

    const width = 500;
    const height = 150;
    const padding = 20;

    const scores = data.map(r => r.final_score);
    const minScore = Math.min(...scores, 0);
    const maxScore = Math.max(...scores, 100);
    const scoreRange = maxScore - minScore === 0 ? 1 : maxScore - minScore;

    const getX = (index: number) => padding + (index / (data.length - 1)) * (width - padding * 2);
    const getY = (score: number) => height - padding - ((score - minScore) / scoreRange) * (height - padding * 2);

    const points = data.map((d, i) => `${getX(i)},${getY(d.final_score)}`).join(' ');

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" aria-labelledby="chart-title" role="img">
            <title id="chart-title">Gráfico de evolução da pontuação nas simulações</title>
            {/* Y-axis labels */}
            <text x="5" y={padding - 5} fontSize="10" fill="currentColor" className="text-[#003322]/60">{maxScore}</text>
            <text x="5" y={height - padding + 10} fontSize="10" fill="currentColor" className="text-[#003322]/60">{minScore}</text>

            {/* Grid lines */}
            <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="currentColor" strokeDasharray="2" className="text-[#003322]/80" />
            <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="currentColor" strokeDasharray="2" className="text-[#003322]/80" />
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="currentColor" strokeDasharray="2" className="text-[#003322]/80" />
            
            {/* Line */}
            <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points} className="text-teal-500" />
            
            {/* Points */}
            {data.map((d, i) => (
                <g key={d.id}>
                    <circle cx={getX(i)} cy={getY(d.final_score)} r="3" fill="currentColor" className="text-teal-500" />
                    <title>{`Simulação ${i + 1} (${new Date(d.created_at).toLocaleDateString()}): ${d.final_score} pontos`}</title>
                </g>
            ))}
        </svg>
    );
};

const MissionRow: React.FC<{ title: string; progress: string; reward: string; done: boolean }> = ({ title, progress, reward, done }) => (
    <div className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 ${done ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-white/60 bg-white/50'}`}>
        <div className="flex items-center gap-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full border ${done ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-200' : 'border-white/60 bg-white/10 text-[#003322]/70'}`}>
                {done ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
                    </svg>
                )}
            </div>
            <div>
                <p className="text-sm font-semibold text-[#003322]">{title}</p>
                <p className="text-xs text-[#003322]/60">Progresso {progress}</p>
            </div>
        </div>
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#003322]/70">{reward}</div>
    </div>
);

interface StudentDashboardProps {
  profile: Profile | null;
  onStartTutorial: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ profile, onStartTutorial }) => {
    const [results, setResults] = useState<SimulationResult[]>([]);
    const [analysis, setAnalysis] = useState<PerformanceAnalysis | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [gamification, setGamification] = useState<GamificationState>(loadGamificationState());
    const [showTokenomics, setShowTokenomics] = useState(false);
    const [flashcardsToday, setFlashcardsToday] = useState(() => readDailyFlashcards().count);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("Usuário não autenticado.");

                const { data: simData, error: simError } = await supabase
                    .from('simulation_results')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (simError) throw simError;

                setResults(simData || []);

                if (simData && simData.length > 0) {
                    const performanceAnalysis = await analyzeStudentPerformance(simData);
                    setAnalysis(performanceAnalysis);
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido ao buscar seus dados.";
                setError(errorMessage);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchGamification = async () => {
            const { data } = await supabase.auth.getUser();
            if (data.user?.id) {
                const synced = await syncGamificationState(data.user.id);
                setGamification(synced);
            }
        };
        fetchGamification();
    }, []);

    useEffect(() => {
        const handler = (event: Event) => {
            const detail = (event as CustomEvent<number>).detail;
            if (typeof detail === 'number') {
                setFlashcardsToday(detail);
            } else {
                setFlashcardsToday(readDailyFlashcards().count);
            }
        };
        window.addEventListener('simmit-daily-flashcards-updated', handler);
        return () => window.removeEventListener('simmit-daily-flashcards-updated', handler);
    }, []);

    const averageScore = useMemo(() => {
        if (results.length === 0) return 0;
        const total = results.reduce((sum, r) => sum + r.final_score, 0);
        return Math.round(total / results.length);
    }, [results]);

    const averageScoreBySubject = useMemo(() => {
        const scoresBySubject = new Map<MedicalSubject, { total: number; count: number }>();
        
        results.forEach(r => {
            const existing = scoresBySubject.get(r.subject) || { total: 0, count: 0 };
            existing.total += r.final_score;
            existing.count += 1;
            scoresBySubject.set(r.subject, existing);
        });

        return Array.from(scoresBySubject.entries()).map(([subject, data]) => {
            return {
                subject: subject,
                score: Math.round(data.total / data.count)
            };
        });
    }, [results]);

    const todayKey = getLocalDateKey();
    const todayResults = useMemo(() => {
        return results.filter(result => getLocalDateKey(new Date(result.created_at)) === todayKey);
    }, [results, todayKey]);
    const dailyCaseSuccess = todayResults.some(result => result.final_score >= 70);
    const dailyHighScore = todayResults.some(result => result.final_score >= 80);
    const dailyCaseCount = todayResults.length;
    const dailyFlashcardGoal = 10;
    const isFriday = new Date().getDay() === 5;
    const dailyMissionCount = [dailyCaseSuccess, flashcardsToday >= dailyFlashcardGoal, dailyHighScore].filter(Boolean).length;
    const prestigeTotal = Math.max(gamification.medPoints, 0);
    const prestigeLevel = Math.floor(prestigeTotal / 100) + 1;
    const prestigeProgress = prestigeTotal % 100;
    const prestigeRank = prestigeTotal >= 300 ? 'PRECEPTOR' : prestigeTotal >= 200 ? 'R2' : prestigeTotal >= 100 ? 'R1' : 'INTERNO';
    const resiliencePercent = Math.min(100, Math.max(0, Math.round((gamification.resiliencePoints / 5) * 100)));

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-[#003322]/70 text-lg">Carregando seu histórico de desempenho...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-[#c1bcfa]/30 text-[#003322]/70 border border-[#741cd9]/30">
                <h3 className="text-xl font-bold mb-2">Erro ao Carregar Dashboard</h3>
                <p>{error}</p>
            </div>
        );
    }
    
    if (results.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-[#eaf0f7]">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-[#003322]/60 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <h3 className="text-2xl font-bold text-[#003322]/80">Nenhum dado ainda</h3>
                <p className="text-[#003322]/60 mt-2 max-w-sm">Complete sua primeira simulação no modo "Aluno" para começar a acompanhar seu progresso aqui.</p>
                <button
                    onClick={onStartTutorial}
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border border-white/60 bg-white/10 px-5 py-3 text-sm font-semibold text-[#003322] hover:bg-white/20 transition"
                >
                    Iniciar tutorial guiado
                </button>
            </div>
        );
    }

    return (
        <div id="student-dashboard" className="h-full overflow-y-auto bg-[#eaf0f7] p-4 sm:p-6 no-scrollbar">
            <div className="max-w-4xl mx-auto">
                 <header className="mb-8">
                    <h1 className="text-3xl font-bold text-[#003322]">Meu Desempenho</h1>
                    <p className="text-[#003322]/60 mt-1">Análise do seu progresso, {profile?.full_name.split(' ')[0] || 'aluno(a)'}.</p>
                </header>

                <section className="mb-8">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-[#003322]">Escala de Plantão</h2>
                            <p className="text-sm text-[#003322]/60">Missão diária para manter o ritmo clínico.</p>
                        </div>
                        <span className="rounded-full border border-white/60 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#003322]/80">Hoje</span>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-2">
                        <div className="rounded-2xl border border-white/60 bg-white/70 glass-panel p-5 shadow-xl">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.3em] text-[#003322]/60">Plantão da vez</p>
                                    <h3 className="mt-1 text-lg font-semibold text-[#003322]">Foco total</h3>
                                </div>
                                <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] ${dailyMissionCount === 3 ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-200' : 'border-white/60 bg-white/5 text-[#003322]/80'}`}>
                                    {dailyMissionCount}/3 concluída
                                </span>
                            </div>
                            <div className="mt-4 space-y-3">
                                <MissionRow
                                    title="Atendimento de excelência (1 caso)"
                                    progress={`${Math.min(dailyCaseCount, 1)}/1`}
                                    reward="+15 MP"
                                    done={dailyCaseSuccess}
                                />
                                <MissionRow
                                    title="Treinamento cognitivo (10 flashcards)"
                                    progress={`${Math.min(flashcardsToday, dailyFlashcardGoal)}/${dailyFlashcardGoal}`}
                                    reward="+10 MP"
                                    done={flashcardsToday >= dailyFlashcardGoal}
                                />
                                <MissionRow
                                    title="Brilho acadêmico (>80% no simulado)"
                                    progress={dailyHighScore ? '1/1' : '0/1'}
                                    reward="+1 NG"
                                    done={dailyHighScore}
                                />
                            </div>
                        </div>
                        <div className="rounded-2xl border border-white/60 bg-white/70 glass-panel p-5 shadow-xl">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.3em] text-[#003322]/60">Modo Tutorial</p>
                                    <h3 className="mt-1 text-lg font-semibold text-[#003322]">Atendimento passo a passo</h3>
                                    <p className="mt-2 text-sm text-[#003322]/70">
                                        Revisite o roteiro guiado para não se perder na simulação.
                                    </p>
                                </div>
                                <span className="rounded-full border border-white/60 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#003322]/80">
                                    Sempre disponível
                                </span>
                            </div>
                            <button
                                onClick={onStartTutorial}
                                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/60 bg-white/10 px-4 py-3 text-sm font-semibold text-[#003322] hover:bg-white/20 transition"
                            >
                                Iniciar tutorial guiado
                            </button>
                        </div>
                        {isFriday && (
                            <div className="rounded-2xl border border-[#741cd9]/30 bg-gradient-to-br from-[#741cd9]/15 via-white/70 to-[#18cf91]/15 p-5 shadow-xl">
                                <p className="text-xs uppercase tracking-[0.3em] text-[#003322]/70">Modo emergência</p>
                                <h3 className="mt-2 text-xl font-bold text-[#003322]">Paciente em choque: você tem 5 minutos</h3>
                                <p className="mt-2 text-sm text-[#003322]/70">
                                    Responda rápido, diagnóstico preciso. XP triplicado e avatares exclusivos liberados.
                                </p>
                                <div className="mt-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#003322]/70">
                                    <span className="rounded-full border border-[#741cd9]/30 bg-white/70 px-3 py-1">Crise ativa</span>
                                    <span className="rounded-full border border-[#18cf91]/30 bg-white/70 px-3 py-1">Recompensa x3</span>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
                
                {/* Performance Chart Section */}
                {results.length > 1 && (
                    <section className="mb-8 animate-fade-in">
                        <h2 className="text-xl font-bold text-[#003322] mb-4">Evolução da Pontuação</h2>
                        <div className="bg-white/5 p-4 rounded-lg shadow-sm border border-white/60">
                            <PerformanceChart results={results} />
                        </div>
                    </section>
                )}

                {/* General Stats */}
                <section className="mb-8">
                    <h2 className="text-xl font-bold text-[#003322] mb-4">Visão Geral</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <StatCard title="Pontuação Média" value={averageScore} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>} />
                        <StatCard title="Simulações Feitas" value={results.length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} />
                         <StatCard title="�sltima Atividade" value={new Date(results[0].created_at).toLocaleDateString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
                    </div>
                </section>

                {/* AI Analysis */}
                {analysis && (
                <section className="mb-8">
                    <h2 className="text-xl font-bold text-[#003322] mb-4">Análise da IA</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/5 p-5 rounded-lg shadow-sm border border-white/60">
                             <h3 className="font-bold text-lg text-[#18cf91] mb-3">Pontos Fortes</h3>
                             <ul className="space-y-2">
                                {analysis.strengths.map((s, i) => <AnalysisItem key={i} text={s} type="strength" />)}
                             </ul>
                        </div>
                         <div className="bg-white/5 p-5 rounded-lg shadow-sm border border-white/60">
                             <h3 className="font-bold text-lg text-[#741cd9] mb-3">Áreas para Melhoria</h3>
                             <ul className="space-y-2">
                                 {analysis.improvements.map((imp, i) => <AnalysisItem key={i} text={imp} type="improvement" />)}
                             </ul>
                        </div>
                     </div>
                </section>
                )}

                <section className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-[#003322]">Economia de Estudo</h2>
                        <button
                            onClick={() => setShowTokenomics(true)}
                            className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/5 px-3 py-1 text-xs font-semibold text-[#003322]/80 hover:bg-white/10 transition"
                            aria-label="Entenda a Economia de Estudo"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
                            </svg>
                            Como funciona?
                        </button>
                    </div>
                    <div className="mb-4 rounded-2xl border border-white/60 bg-white/70 glass-panel px-4 py-3">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-[#003322]/60">Escala diária</p>
                                <p className="text-lg font-semibold text-[#003322]">Volte amanhã para manter sua presença</p>
                            </div>
                            <div className="text-right text-sm text-[#003322]/70">
                                <p>Streak: <span className="font-semibold text-teal-300">{gamification.streakDays}</span></p>
                                <p>Bonus em {gamification.streakDays % 5 === 0 ? 5 : 5 - (gamification.streakDays % 5)} dias</p>
                            </div>
                        </div>
                        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                            <div
                                className="h-full bg-gradient-to-r from-teal-500 to-cyan-400"
                                style={{ width: `${((gamification.streakDays % 5) / 5) * 100}%` }}
                            />
                        </div>
                    </div>
                    <div className="mb-4 rounded-2xl border border-white/60 bg-white/60 p-5 shadow-lg">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-[#003322]/60">Prestígio clínico</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl font-bold text-[#003322]">{prestigeTotal}</span>
                                    <span className="rounded-full border border-white/60 bg-white/10 px-2 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#003322]/80">
                                        {prestigeRank}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm text-[#003322]/60">Nível {prestigeLevel}</p>
                            </div>\r\n                        </div>
                        <div className="mt-4">
                            <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[#003322]/60">
                                <span>Progresso</span>
                                <span>{prestigeProgress}%</span>
                            </div>
                            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                                <div
                                    className="h-full bg-gradient-to-r from-teal-500 to-cyan-400"
                                    style={{ width: `${prestigeProgress}%` }}
                                />
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                            <div className="rounded-xl border border-white/60 bg-[#eaf0f7] px-3 py-3">
                                <p className="text-xs uppercase tracking-[0.2em] text-[#003322]/60">Sinapses</p>
                                <p className="text-lg font-bold text-[#003322]">{gamification.neuroGems}</p>
                            </div>
                            <div className="rounded-xl border border-white/60 bg-[#eaf0f7] px-3 py-3">
                                <p className="text-xs uppercase tracking-[0.2em] text-[#003322]/60">Saúde mental</p>
                                <p className={`text-lg font-bold $'text-[#003322]'`}>{resiliencePercent}%</p>
                            </div>
                            <div className="rounded-xl border border-white/60 bg-[#eaf0f7] px-3 py-3">
                                <p className="text-xs uppercase tracking-[0.2em] text-[#003322]/60">Concentração</p>
                                <p className="text-lg font-bold text-[#003322]">{gamification.focusEnergy}</p>
                            </div>
                            <div className="rounded-xl border border-white/60 bg-[#eaf0f7] px-3 py-3">
                                <p className="text-xs uppercase tracking-[0.2em] text-[#003322]/60">Tempo plantão</p>
                                <p className="text-lg font-bold text-[#003322]">{gamification.caseCredits}</p>
                            </div>
                            <div className="rounded-xl border border-white/60 bg-[#eaf0f7] px-3 py-3">
                                <p className="text-xs uppercase tracking-[0.2em] text-[#003322]/60">Streak</p>
                                <p className="text-lg font-bold text-[#003322]">{gamification.streakDays}</p>
                            </div>
                        </div>
                    </div>
                </section>

                
                {averageScoreBySubject.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-xl font-bold text-[#003322] mb-4">Desempenho por Matéria</h2>
                    <div className="bg-white/5 p-5 rounded-lg shadow-sm border border-white/60 space-y-4">
                        {MEDICAL_SUBJECTS.map(subject => {
                            const data = averageScoreBySubject.find(s => s.subject === subject);
                            const score = data ? data.score : null;
                            const width = score ? `${score}%` : '0%';

                            return (
                                <div key={subject}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <p className="text-sm font-semibold text-[#003322]/80">{subject}</p>
                                        <p className={`text-sm font-bold ${score === null ? 'text-[#003322]/60' : 'text-[#003322]/70'}`}>
                                            {score !== null ? `${score} / 100` : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-2.5">
                                        <div 
                                            className="bg-teal-500 h-2.5 rounded-full transition-all duration-500" 
                                            style={{ width: width }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
                )}

                {/* Recent Simulations */}
                <section>
                    <h2 className="text-xl font-bold text-[#003322] mb-4">Histórico de Simulações</h2>
                    <div className="space-y-2">
                        {results.map(result => (
                            <details key={result.id} className="bg-white/5 rounded-lg shadow-sm border border-white/60 group">
                                <summary className="p-4 flex justify-between items-center cursor-pointer list-none">
                                    <div className="font-semibold text-[#003322]">
                                        {result.subject} - <span className="text-[#003322]/60 font-normal">{new Date(result.created_at).toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className={`font-bold text-lg mr-4 ${result.final_score > 70 ? 'text-[#18cf91]' : result.final_score > 40 ? 'text-[#741cd9]' : 'text-[#003322]'}`}>
                                            {result.final_score}
                                        </span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#003322]/60 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </summary>
                                <div className="p-4 border-t border-white/60">
                                    <h4 className="font-semibold text-[#003322]/80 mb-2">Feedback Detalhado:</h4>
                                    <p className="text-sm text-[#003322]/70 whitespace-pre-wrap bg-[#eaf0f7] p-3 rounded">{result.feedback_text}</p>
                                </div>
                            </details>
                        ))}
                    </div>
                </section>
            </div>
            {showTokenomics && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-2xl rounded-2xl border border-white/60 bg-white/70 p-6 shadow-2xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-[#003322]">Como funciona a Economia de Estudo</h3>
                                <p className="mt-2 text-sm text-[#003322]/70">
                                    Seus recursos controlam ritmo, foco e recompensas. Use para desbloquear casos e flashcards.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowTokenomics(false)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/5 text-[#003322]/80 hover:bg-white/10"
                                aria-label="Fechar"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-xl border border-white/60 bg-white/5 p-4">
                                <h4 className="text-sm font-semibold text-[#003322]">Energia de Foco</h4>
                                <p className="mt-2 text-sm text-[#003322]/70">Gasta para iniciar casos ou liberar flashcards quando os lotes acabam.</p>
                            </div>
                            <div className="rounded-xl border border-white/60 bg-white/5 p-4">
                                <h4 className="text-sm font-semibold text-[#003322]">Ampulhetas</h4>
                                <p className="mt-2 text-sm text-[#003322]/70">Aceleram sua progressão e destravam bônus de desempenho.</p>
                            </div>
                            <div className="rounded-xl border border-white/60 bg-white/5 p-4">
                                <h4 className="text-sm font-semibold text-[#003322]">Resiliência</h4>
                                <p className="mt-2 text-sm text-[#003322]/70">Recompensa consistência mesmo quando você erra. Mantém o ritmo.</p>
                            </div>
                            <div className="rounded-xl border border-white/60 bg-white/5 p-4">
                                <h4 className="text-sm font-semibold text-[#003322]">MediPoints (MP)</h4>
                                <p className="mt-2 text-sm text-[#003322]/70">Experiência acumulada. Eleva seu nível e destrava diagnósticos.</p>
                            </div>
                            <div className="rounded-xl border border-white/60 bg-white/5 p-4">
                                <h4 className="text-sm font-semibold text-[#003322]">NeuroGems (NG)</h4>
                                <p className="mt-2 text-sm text-[#003322]/70">Moeda rara para itens premium, skins e casos lendarios.</p>
                            </div>
                            <div className="rounded-xl border border-white/60 bg-white/5 p-4">
                                <h4 className="text-sm font-semibold text-[#003322]">Casos Disponíveis</h4>
                                <p className="mt-2 text-sm text-[#003322]/70">Créditos de caso vindos do Lote de Conhecimento.</p>
                            </div>
                            <div className="rounded-xl border border-white/60 bg-white/5 p-4">
                                <h4 className="text-sm font-semibold text-[#003322]">Flashcards Disponíveis</h4>
                                <p className="mt-2 text-sm text-[#003322]/70">Cada lote libera 15 flashcards.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};



