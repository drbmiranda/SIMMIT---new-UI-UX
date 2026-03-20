import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { SimulationResult, PerformanceAnalysis, MedicalSubject, Profile } from '../types';
import { analyzeStudentPerformance } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { MEDICAL_SUBJECTS } from '../constants';
import { GamificationState, loadGamificationState, syncGamificationState } from '../services/gamificationService';
import iconAvgScore from '../design-SIMMIT/figma-sections/09-student-dashboard/assets/icon-avg-score.svg';
import iconSimulations from '../design-SIMMIT/figma-sections/09-student-dashboard/assets/icon-simulations.svg';
import iconLastActivity from '../design-SIMMIT/figma-sections/09-student-dashboard/assets/icon-last-activity.svg';
import iconStrengths2 from '../design-SIMMIT/figma-sections/09-student-dashboard/assets/icon-strengths2.svg';
import iconAreas2 from '../design-SIMMIT/figma-sections/09-student-dashboard/assets/icon-areas2.svg';
import iconArrowDown from '../design-SIMMIT/figma-sections/09-student-dashboard/assets/icon-arrow-down.svg';
import iconMedical from '../design-SIMMIT/figma-sections/09-student-dashboard/assets/icon-medical.svg';
import iconSurgical from '../design-SIMMIT/figma-sections/09-student-dashboard/assets/icon-surgical.svg';
import iconPreventive from '../design-SIMMIT/figma-sections/09-student-dashboard/assets/icon-preventive.svg';
import iconPediatrics from '../design-SIMMIT/figma-sections/09-student-dashboard/assets/icon-pediatrics.svg';
import iconGynecology from '../design-SIMMIT/figma-sections/09-student-dashboard/assets/icon-gynecology.svg';
import iconTaskDone from '../design-SIMMIT/figma-sections/09-student-dashboard/assets/icon-task-done.svg';
import iconStamina from '../design-SIMMIT/figma-sections/09-student-dashboard/assets/icon-stamina.svg';
import iconXp from '../design-SIMMIT/figma-sections/09-student-dashboard/assets/icon-xp.svg';
import iconBolt from '../design-SIMMIT/figma-sections/09-student-dashboard/assets/icon-bolt.svg';
import iconFire from '../design-SIMMIT/figma-sections/09-student-dashboard/assets/icon-fire.svg';

const SUBJECT_ICON_MAP: Record<string, string> = {
  'Clinica Medica': iconMedical,
  'Clinica Cirurgica': iconSurgical,
  'Medicina Preventiva': iconPreventive,
  'Pediatria': iconPediatrics,
  'Ginecologia e Obstetricia': iconGynecology,
};

const normalizeSubject = (subject: string) => subject.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

const formatDate = (value?: string, options?: Intl.DateTimeFormatOptions) => {
  if (!value) return 'Sem atividade';
  return new Date(value).toLocaleString('pt-BR', options ?? {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const OverviewCard: React.FC<{ title: string; value: string | number; caption: string; icon: string }> = ({ title, value, caption, icon }) => (
  <div className="rounded-[22px] border border-white/80 bg-white/78 p-4 shadow-[0_18px_40px_rgba(6,16,51,0.06)] backdrop-blur-xl">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7b8798]">{title}</p>
        <p className="mt-3 text-[24px] font-bold leading-none text-[#061033]">{value}</p>
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/70 bg-[#f6f8fc]">
        <img src={icon} alt={title} className="h-5 w-5" />
      </div>
    </div>
    <p className="mt-3 text-xs leading-5 text-[#003322]/55">{caption}</p>
  </div>
);

const InsightCard: React.FC<{ title: string; eyebrow: string; icon: string; accentClassName: string; items: string[] }> = ({ title, eyebrow, icon, accentClassName, items }) => (
  <div className="rounded-[22px] border border-white/80 bg-white/80 p-4 shadow-[0_18px_40px_rgba(6,16,51,0.05)] backdrop-blur-xl">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7b8798]">{eyebrow}</p>
        <h2 className="mt-2 text-lg font-bold text-[#061033]">{title}</h2>
      </div>
      <div className={`flex h-10 w-10 items-center justify-center rounded-[14px] ${accentClassName}`}>
        <img src={icon} alt={title} className="h-5 w-5" />
      </div>
    </div>
    <div className="mt-4 space-y-3">
      {items.map((item, index) => (
        <div key={`${item}-${index}`} className="rounded-[16px] border border-white/70 bg-white/78 px-4 py-3 text-xs leading-5 text-[#003322]/78 shadow-sm">{item}</div>
      ))}
    </div>
  </div>
);

const SubjectPerformanceRow: React.FC<{ subject: string; score: number | null }> = ({ subject, score }) => {
  const icon = SUBJECT_ICON_MAP[normalizeSubject(subject)] || iconMedical;
  const width = score !== null ? `${Math.min(100, Math.max(0, score))}%` : '0%';
  const barColor = subject === 'Clínica Médica' ? 'from-[#18cf91] to-[#18cf91]' : subject === 'Clínica Cirúrgica' ? 'from-[#d6a500] to-[#d6a500]' : subject === 'Medicina Preventiva' ? 'from-[#64748b] to-[#64748b]' : subject === 'Pediatria' ? 'from-[#e11d48] to-[#f43f5e]' : 'from-[#7c3aed] to-[#8b5cf6]';

  return (
    <div className="rounded-[18px] border border-white/70 bg-white/78 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <p className="inline-flex items-center gap-3 text-sm font-semibold text-[#061033]"><img src={icon} alt={subject} className="h-4 w-4" />{subject}</p>
        <span className="rounded-full bg-[#eef2f7] px-2.5 py-1 text-[10px] font-semibold uppercase text-[#64748b]">{score === null ? 'N/A' : `${score} pts`}</span>
      </div>
      <div className="mt-3 h-[4px] overflow-hidden rounded-full bg-[#e8eef7]"><div className={`h-full rounded-full bg-gradient-to-r ${barColor}`} style={{ width }} /></div>
    </div>
  );
};

interface StudentDashboardProps {
  profile: Profile | null;
  avatarUrl?: string | null;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ profile, avatarUrl }) => {
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [analysis, setAnalysis] = useState<PerformanceAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gamification, setGamification] = useState<GamificationState>(loadGamificationState());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado.');
        const { data: simData, error: simError } = await supabase.from('simulation_results').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (simError) throw simError;
        const nextResults = simData || [];
        setResults(nextResults);
        setAnalysis(nextResults.length > 0 ? await analyzeStudentPerformance(nextResults) : null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro ao buscar seus dados.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchGamification = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user?.id) setGamification(await syncGamificationState(data.user.id));
    };
    fetchGamification();
  }, []);

  const averageScore = useMemo(() => results.length === 0 ? 0 : Math.round(results.reduce((sum, result) => sum + result.final_score, 0) / results.length), [results]);
  const averageScoreBySubject = useMemo(() => {
    const scoresBySubject = new Map<MedicalSubject, { total: number; count: number }>();
    results.forEach((result) => {
      const existing = scoresBySubject.get(result.subject) || { total: 0, count: 0 };
      existing.total += result.final_score;
      existing.count += 1;
      scoresBySubject.set(result.subject, existing);
    });
    return Array.from(scoresBySubject.entries()).map(([subject, data]) => ({ subject, score: Math.round(data.total / data.count) }));
  }, [results]);

  const strengths = analysis?.strengths?.slice(0, 4) ?? ['Seus pontos fortes aparecerão aqui conforme o histórico crescer.'];
  const improvements = analysis?.improvements?.slice(0, 4) ?? ['As oportunidades de melhoria serão destacadas automaticamente pela IA.'];
  const strongestSubject = [...averageScoreBySubject].sort((a, b) => b.score - a.score)[0];
  const weakestSubject = [...averageScoreBySubject].sort((a, b) => a.score - b.score)[0];
  const progressLabel = averageScore >= 75 ? 'Ritmo excelente' : averageScore >= 55 ? 'Subida consistente' : 'Retomar base';
  const staminaValue = Math.min(100, Math.max(20, averageScore));
  const tasksDone = results.filter((result) => result.final_score >= 70).length;
  const medPoints = gamification.medPoints || results.length * 25;

  if (loading) {
    return <div className="flex h-full flex-col items-center justify-center p-4 text-center"><LoadingSpinner size="lg" /><p className="mt-4 text-lg text-[#003322]/70">Carregando seu histórico de desempenho...</p></div>;
  }

  if (error) {
    return <div className="flex h-full flex-col items-center justify-center border border-[#741cd9]/30 bg-[#c1bcfa]/30 p-4 text-center text-[#003322]/70"><h3 className="mb-2 text-xl font-bold">Erro ao carregar dashboard</h3><p>{error}</p></div>;
  }

  if (results.length === 0) {
    return <div className="flex h-full flex-col items-center justify-center bg-[#eaf0f7] p-6 text-center"><h3 className="text-2xl font-bold text-[#003322]/80">Nenhum dado ainda</h3><p className="mt-2 max-w-sm text-[#003322]/60">Complete sua primeira simulação no modo aluno para começar a acompanhar seu progresso aqui.</p></div>;
  }

  return (
    <div id="student-dashboard" className="h-full overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(116,28,217,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(24,207,145,0.14),transparent_26%),linear-gradient(180deg,#f5f8fc,#f3f5fb_55%,#eef4f8)] no-scrollbar">
      <div className="mx-auto max-w-[980px] space-y-6 px-4 py-5 sm:px-6">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-[#061033]/76">Visão geral</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <OverviewCard title="Pontuação média" value={`${averageScore}%`} caption="Média geral consolidada nas simulações concluídas." icon={iconAvgScore} />
            <OverviewCard title="Simulações" value={results.length} caption="Casos clínicos já registrados no seu histórico." icon={iconSimulations} />
            <OverviewCard title="Última atividade" value={results[0]?.subject || 'N/A'} caption={formatDate(results[0]?.created_at)} icon={iconLastActivity} />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-6">
            <div>
              <h2 className="mb-3 text-sm font-semibold text-[#061033]/76">Metas do dia</h2>
              <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-[24px] border border-white/85 bg-white/80 p-5 shadow-[0_18px_40px_rgba(6,16,51,0.05)]">
                  <p className="text-xs font-semibold text-[#061033]">Objetivos ativos</p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-[18px] bg-[#f8fbff] px-4 py-3"><div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold text-[#061033]">Sequência em alta</span><span className="rounded-full bg-[#eefcf7] px-2.5 py-1 text-[10px] font-semibold uppercase text-[#0f8c63]">+150</span></div><p className="mt-1 text-xs text-[#003322]/52">Sua consistência segue forte nesta semana.</p></div>
                    <div className="rounded-[18px] bg-[#f8fbff] px-4 py-3"><div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold text-[#061033]">Revisar flashcards</span><span className="rounded-full bg-[#eef2ff] px-2.5 py-1 text-[10px] font-semibold uppercase text-[#741cd9]">Iniciar</span></div></div>
                    <div className="rounded-[18px] bg-[#f8fbff] px-4 py-3"><div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold text-[#061033]">Casos com alta nota</span><span className="rounded-full bg-[#fff9e8] px-2.5 py-1 text-[10px] font-semibold uppercase text-[#b78a16]">{tasksDone}</span></div><p className="mt-1 text-xs text-[#003322]/52">Resultados acima de 70 pontos.</p></div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/85 bg-[linear-gradient(135deg,#faf6ff_0%,#ffffff_100%)] p-5 shadow-[0_18px_40px_rgba(6,16,51,0.05)]">
                  <p className="text-xs font-semibold text-[#061033]">Indicadores rápidos</p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-[18px] bg-[#fff9e8] px-4 py-3"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8c7b3e]">Fogo</p><p className="mt-2 text-lg font-bold text-[#061033]">{gamification.streakDays}</p></div>
                    <div className="rounded-[18px] bg-[#eefcf7] px-4 py-3"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#268b67]">MedPoints</p><p className="mt-2 text-lg font-bold text-[#061033]">{medPoints}</p></div>
                    <div className="rounded-[18px] bg-[#fff3f3] px-4 py-3"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c35353]">Meta restante</p><p className="mt-2 text-lg font-bold text-[#061033]">{Math.max(0, 100 - results.length)}</p></div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-sm font-semibold text-[#061033]/76">Desempenho por matéria</h2>
              <div className="rounded-[24px] border border-white/85 bg-white/80 p-5 shadow-[0_18px_40px_rgba(6,16,51,0.05)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div><p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#741cd9]">Desempenho clínico</p><h2 className="mt-2 text-xl font-bold text-[#061033]">Performance por matéria</h2></div>
                  <div className="rounded-full border border-white/80 bg-white/75 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#003322]/72">{averageScoreBySubject.length} áreas medidas</div>
                </div>
                <div className="mt-5 space-y-4">
                  {MEDICAL_SUBJECTS.map((subject) => {
                    const data = averageScoreBySubject.find((item) => normalizeSubject(item.subject) === normalizeSubject(subject));
                    return <SubjectPerformanceRow key={subject} subject={subject} score={data?.score ?? null} />;
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <section className="overflow-hidden rounded-[24px] border border-[#061033]/8 bg-[linear-gradient(160deg,#07112f_0%,#121d47_55%,#182658_100%)] p-5 text-white shadow-[0_24px_60px_rgba(6,16,51,0.14)]">
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/55">Progressão</p><h2 className="mt-2 text-[24px] font-bold text-white">{progressLabel}</h2></div>
                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/10 bg-white/10"><img src={iconBolt} alt="Progresso" className="h-7 w-7" /></div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] border border-white/10 bg-white/8 p-4"><div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-white/55"><img src={iconXp} alt="XP" className="h-5 w-5" />MedPoints</div><p className="mt-3 text-3xl font-bold text-white">{medPoints}</p><p className="mt-2 text-sm text-white/70">Acumulados a partir de estudo e simulações concluídas.</p></div>
                <div className="rounded-[24px] border border-white/10 bg-white/8 p-4"><div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-white/55"><img src={iconStamina} alt="Stamina" className="h-5 w-5" />Stamina</div><p className="mt-3 text-3xl font-bold text-white">{staminaValue}%</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-[#18cf91] to-[#34d399]" style={{ width: `${staminaValue}%` }} /></div></div>
                <div className="rounded-[24px] border border-white/10 bg-white/8 p-4"><div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-white/55"><img src={iconTaskDone} alt="Concluídos" className="h-5 w-5" />Casos fortes</div><p className="mt-3 text-3xl font-bold text-white">{tasksDone}</p><p className="mt-2 text-sm text-white/70">Simulações acima de 70 pontos.</p></div>
                <div className="rounded-[24px] border border-white/10 bg-white/8 p-4"><div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-white/55"><img src={iconFire} alt="Ritmo" className="h-5 w-5" />Último check-in</div><p className="mt-3 text-xl font-bold text-white">{formatDate(results[0]?.created_at, { day: '2-digit', month: '2-digit', year: 'numeric' })}</p><p className="mt-2 text-sm text-white/70">Preserve a cadência para manter a sequência ativa.</p></div>
              </div>
            </section>

            <div>
              <h2 className="mb-3 text-sm font-semibold text-[#061033]/76">Análise da IA</h2>
              <div className="grid gap-4 lg:grid-cols-2">
                <InsightCard eyebrow="Pontos fortes" title="Forças atuais" icon={iconStrengths2} accentClassName="border border-[#18cf91]/25 bg-[#ebfff7]" items={strengths} />
                <InsightCard eyebrow="Ajustes" title="Áreas de melhoria" icon={iconAreas2} accentClassName="border border-[#741cd9]/16 bg-[#f6f1ff]" items={improvements} />
              </div>
            </div>

            <section className="rounded-[24px] border border-white/85 bg-white/80 p-5 shadow-[0_18px_40px_rgba(6,16,51,0.05)]">
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#741cd9]">Radar de foco</p><h2 className="mt-2 text-xl font-bold text-[#061033]">Próximos ajustes</h2></div>
                {avatarUrl ? <img src={avatarUrl} alt="Perfil" className="h-12 w-12 rounded-full border border-white/80 object-cover" /> : null}
              </div>
              <div className="mt-5 space-y-4">
                <div className="rounded-[20px] border border-white/70 bg-[#f8fbff] p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7b8798]">Maior força atual</p><div className="mt-2 flex items-center justify-between gap-4"><span className="text-base font-semibold text-[#061033]">{strongestSubject?.subject ?? 'Aguardando histórico'}</span><span className="rounded-full bg-[#18cf91]/12 px-3 py-1 text-[10px] font-bold uppercase text-[#0f8c63]">{strongestSubject ? `${strongestSubject.score}%` : 'N/A'}</span></div></div>
                <div className="rounded-[20px] border border-white/70 bg-[#f8fbff] p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7b8798]">Ponto cego crítico</p><div className="mt-2 flex items-center justify-between gap-4"><span className="text-base font-semibold text-[#061033]">{weakestSubject?.subject ?? 'Aguardando histórico'}</span><span className="rounded-full bg-[#741cd9]/10 px-3 py-1 text-[10px] font-bold uppercase text-[#741cd9]">{weakestSubject ? `${weakestSubject.score}%` : 'N/A'}</span></div></div>
                <div className="rounded-[20px] border border-[#18cf91]/16 bg-[linear-gradient(135deg,#effff8_0%,#f8fcff_100%)] p-4"><p className="text-xs leading-5 text-[#003322]/78">A IA já reconhece sua melhor resposta clínica e está ajustando o Pathway para revisar onde a retenção ainda oscila.</p></div>
              </div>
            </section>
          </div>
        </section>

        <section className="rounded-[24px] border border-white/85 bg-white/80 p-5 shadow-[0_18px_40px_rgba(6,16,51,0.05)]">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div><p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#741cd9]">Histórico de simulações</p><h2 className="mt-2 text-xl font-bold text-[#061033]">Registros recentes</h2></div>
            <div className="rounded-full border border-white/80 bg-white/75 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#003322]/72">{results.length} registros</div>
          </div>
          <div className="space-y-3">
            {results.map((result) => (
              <details key={result.id} className="group overflow-hidden rounded-[20px] border border-white/70 bg-white/82 shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
                  <div><div className="font-semibold text-[#061033]">{result.subject}</div><div className="mt-1 text-xs text-[#003322]/60">{formatDate(result.created_at)}</div></div>
                  <div className="flex items-center gap-4"><span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${result.final_score > 70 ? 'bg-[#18cf91]/12 text-[#0f8c63]' : result.final_score > 40 ? 'bg-[#741cd9]/10 text-[#741cd9]' : 'bg-[#ffe8e8] text-[#b04141]'}`}>{result.final_score} pts</span><img src={iconArrowDown} alt="Expandir" className="h-4 w-4 transition-transform group-open:rotate-180" /></div>
                </summary>
                <div className="border-t border-white/70 px-5 py-4"><h4 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#003322]/60">Feedback detalhado</h4><p className="whitespace-pre-wrap rounded-[16px] bg-[#eef3fa] p-4 text-xs leading-5 text-[#003322]/70">{result.feedback_text}</p></div>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default StudentDashboard;



