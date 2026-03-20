import React, { useEffect, useState } from 'react';

import { supabase } from '../services/supabaseClient';
import { fetchRemoteGamificationState, loadGamificationState, GamificationState } from '../services/gamificationService';
import { MedicalSubject } from '../types';
import { sanitizeText } from '../utils/text';
import SimmitLogo from './SimmitLogo';
import pathwayAvatar from '../design-SIMMIT/figma-sections/08-student-pathway/assets/avatar.png';
import iconPathway from '../design-SIMMIT/figma-sections/08-student-pathway/assets/icon-pathway.svg';
import iconFrequency from '../design-SIMMIT/figma-sections/08-student-pathway/assets/icon-frequency.svg';
import iconRetention from '../design-SIMMIT/figma-sections/08-student-pathway/assets/icon-retention.svg';
import iconWindow from '../design-SIMMIT/figma-sections/08-student-pathway/assets/icon-window.svg';
import iconCurrent from '../design-SIMMIT/figma-sections/08-student-pathway/assets/icon-current.svg';
import iconDone from '../design-SIMMIT/figma-sections/08-student-pathway/assets/icon-done.svg';
import iconLevel from '../design-SIMMIT/figma-sections/08-student-pathway/assets/icon-level.svg';
import iconLock from '../design-SIMMIT/figma-sections/08-student-pathway/assets/icon-lock.svg';

type CheckpointStatus = 'dominada' | 'atencao' | 'bloqueada';

type Checkpoint = {
  title: string;
  focus: string;
  status: CheckpointStatus;
  window: string;
  note: string;
};

type PerformanceSummary = {
  totalCases: number;
  avgScore: number | null;
  topBlindSpot: string | null;
  lastWindow: string;
  weeklyErrors: number;
  lastUpdatedLabel: string;
};

type PathwayViewProps = {
  userId: string | null;
};

const subjectLabels: Record<MedicalSubject, string> = {
  'Clínica Médica': 'Clínica Médica',
  'Clínica Cirúrgica': 'Clínica Cirúrgica',
  'Medicina Preventiva': 'Medicina Preventiva',
  'Pediatria': 'Pediatria',
  'Ginecologia e Obstetrícia': 'Ginecologia e Obstetrícia',
};

const getLocalDateKey = (date = new Date()) => date.toLocaleDateString('en-CA');
const formatDateKeyPt = (dateKey: string) => {
  const [year, month, day] = dateKey.split('-');
  if (!year || !month || !day) return dateKey;
  return `${day}/${month}/${year}`;
};
const formatWindowLabel = (start: Date, end: Date) => `${start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

const getNextFocusWindow = () => {
  const now = new Date();
  const start = new Date(now);
  start.setHours(18, 0, 0, 0);
  if (now > start) start.setDate(start.getDate() + 1);
  const end = new Date(start);
  end.setHours(start.getHours() + 2);
  return formatWindowLabel(start, end);
};

const getWeekRange = () => {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 7);
  return { start, end: now };
};

const getLevelLabel = (prestige: number) => {
  if (prestige >= 800) return 'Nível Ápice';
  if (prestige >= 200) return 'Nível Escalada';
  return 'Nível Explorador';
};

const buildCheckpoints = (summary: PerformanceSummary, loginDateKey: string): Checkpoint[] => {
  const blindSpot = summary.topBlindSpot ?? 'Clínica Geral';
  const avgScore = summary.avgScore ?? 0;

  return [
    {
      title: 'Nível 1: Explorador',
      focus: 'Consolidar anamnese dirigida, hipóteses iniciais e exames básicos.',
      status: avgScore >= 70 ? 'dominada' : 'atencao',
      window: 'Concluído nas últimas 48h',
      note: `${summary.totalCases} caso(s) recentes avaliados.`,
    },
    {
      title: 'Nível 2: Escalada',
      focus: `Corrigir lacunas recentes em ${blindSpot.toLowerCase()}.`,
      status: 'atencao',
      window: `Janela de hoje: ${summary.lastWindow}`,
      note: 'A IA detectou um ponto crítico que merece revisão imediata.',
    },
    {
      title: 'Revisão espaçada',
      focus: 'Reforçar retenção de longo prazo com revisão programada.',
      status: 'bloqueada',
      window: `Libera em ${formatDateKeyPt(loginDateKey)}`,
      note: 'Desbloqueie após estabilizar a base clínica atual.',
    },
    {
      title: 'Nível 3: Ápice',
      focus: 'Avançar para cenários complexos e tomada de decisão de alto risco.',
      status: 'bloqueada',
      window: 'Requer 5 casos com bom desempenho',
      note: 'Trilha de maior dificuldade, liberada progressivamente.',
    },
  ];
};

const statusBadge = (status: CheckpointStatus) => {
  if (status === 'dominada') return { label: 'Dominada', className: 'border-[#b8edd6] bg-[#ecfdf5] text-[#16a46b]', icon: iconDone };
  if (status === 'atencao') return { label: 'Em foco', className: 'border-[#d8c2ff] bg-[#f5f0ff] text-[#7c3aed]', icon: iconCurrent };
  return { label: 'Bloqueada', className: 'border-[#d9e1ea] bg-[#f3f6fb] text-[#64748b]', icon: iconLock };
};

const PathwayView: React.FC<PathwayViewProps> = ({ userId }) => {
  const [summary, setSummary] = useState<PerformanceSummary>({
    totalCases: 0,
    avgScore: null,
    topBlindSpot: null,
    lastWindow: getNextFocusWindow(),
    weeklyErrors: 0,
    lastUpdatedLabel: 'Atualizado agora',
  });
  const [caseOfDay, setCaseOfDay] = useState<string>('Caso do dia indisponível no momento.');
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [gamification, setGamification] = useState<GamificationState | null>(null);

  useEffect(() => {
    if (!userId) {
      setSummary((prev) => ({ ...prev, lastUpdatedLabel: 'Sem sessão ativa' }));
      return;
    }

    const fetchPathwayData = async () => {
      const { start, end } = getWeekRange();
      const remoteGamification = await fetchRemoteGamificationState(userId);
      const localGamification = loadGamificationState();
      const activeGamification = remoteGamification ?? localGamification;
      setGamification(activeGamification);
      const loginDateKey = activeGamification.lastActivityDate ?? getLocalDateKey();

      const [{ data: results }, { data: errors }] = await Promise.all([
        supabase.from('simulation_results').select('created_at, subject, final_score').eq('user_id', userId).order('created_at', { ascending: false }).limit(120),
        supabase.from('error_reports').select('created_at, subject').eq('user_id', userId).gte('created_at', start.toISOString()).lte('created_at', end.toISOString()),
      ]);

      const totalCases = results?.length ?? 0;
      const avgScore = results && results.length ? Math.round(results.reduce((acc, row) => acc + (row.final_score || 0), 0) / results.length) : null;

      const subjectScores = new Map<string, { total: number; count: number }>();
      results?.forEach((row) => {
        if (!row.subject) return;
        const key = row.subject as MedicalSubject;
        const entry = subjectScores.get(key) ?? { total: 0, count: 0 };
        entry.total += row.final_score || 0;
        entry.count += 1;
        subjectScores.set(key, entry);
      });

      let topBlindSpot: string | null = null;
      let lowestAverage = Number.POSITIVE_INFINITY;
      subjectScores.forEach((value, key) => {
        const avg = value.total / value.count;
        if (avg < lowestAverage) {
          lowestAverage = avg;
          topBlindSpot = subjectLabels[key as MedicalSubject] ?? key;
        }
      });

      const nextSummary: PerformanceSummary = {
        totalCases,
        avgScore,
        topBlindSpot: sanitizeText(topBlindSpot),
        lastWindow: getNextFocusWindow(),
        weeklyErrors: errors?.length ?? 0,
        lastUpdatedLabel: `Atualizado em ${formatDateKeyPt(loginDateKey)}`,
      };
      setSummary(nextSummary);
      setCaseOfDay(new Date().getDay() === 1 ? 'Caso do dia: revisão crítica obrigatória' : 'Novo caso do dia liberado na segunda-feira.');

      const generated = buildCheckpoints(nextSummary, loginDateKey).map((checkpoint) => ({
        ...checkpoint,
        title: sanitizeText(checkpoint.title),
        focus: sanitizeText(checkpoint.focus),
        window: sanitizeText(checkpoint.window),
        note: sanitizeText(checkpoint.note),
      }));

      const rows = generated.map((checkpoint, index) => ({
        user_id: userId,
        sort_order: index + 1,
        title: checkpoint.title,
        focus: checkpoint.focus,
        status: checkpoint.status,
        window_label: checkpoint.window,
        note: checkpoint.note,
        source: 'auto',
        generated_for_date: loginDateKey,
      }));

      await supabase.from('pathway_checkpoints').delete().eq('user_id', userId);
      await supabase.from('pathway_checkpoints').insert(rows);
      setCheckpoints(generated);
    };

    fetchPathwayData();
  }, [userId]);

  const prestige = gamification?.medPoints ?? summary.totalCases * 20;
  const progressValue = Math.min(100, Math.max(8, summary.avgScore ?? 0));
  const activeCheckpoints = checkpoints.length ? checkpoints : buildCheckpoints(summary, getLocalDateKey());

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(116,28,217,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(24,207,145,0.16),transparent_28%),linear-gradient(180deg,#f9fbff,#f4f6fb_60%,#edf6f2)]">
      <div className="mx-auto max-w-[1240px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#061033]/58">
          <SimmitLogo size="sm" />
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-[#ef6c3f]">Casos: {summary.totalCases}</span>
            <span className="inline-flex items-center gap-1 text-[#18a06f]">MP: {prestige}</span>
            <img src={pathwayAvatar} alt="Avatar" className="h-7 w-7 rounded-full border border-white/80" />
          </div>
        </div>

        <div className="rounded-[30px] border border-white/85 bg-[linear-gradient(135deg,#11998e_0%,#2454b6_48%,#6d28d9_100%)] p-6 text-white shadow-[0_24px_60px_rgba(44,58,130,0.22)] lg:p-8">
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]">SIMMIT Pathway</span>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <h1 className="max-w-[560px] text-[30px] font-bold leading-[1.02] sm:text-[38px]">A trilha adaptativa que reorganiza seus estudos com base no seu desempenho.</h1>
              <p className="mt-4 max-w-[560px] text-sm leading-7 text-white/82 sm:text-[15px]">
                O calendário clínico se recompõe todos os dias. A rota prioriza suas lacunas, respeita sua frequência e protege a retenção de longo prazo.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  { label: 'Reorganização diária', icon: iconPathway },
                  { label: 'Nós adaptativos', icon: iconCurrent },
                  { label: 'Retenção espaçada', icon: iconRetention },
                  { label: 'Janela inteligente', icon: iconFrequency },
                ].map((item) => (
                  <span key={item.label} className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em]">
                    <img src={item.icon} alt="" className="h-3 w-3" />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 lg:justify-items-end">
              <div className="w-full max-w-[280px] rounded-[24px] border border-white/18 bg-white/10 p-4 backdrop-blur-xl">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/70">Nível atual</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15"><img src={iconLevel} alt="" className="h-6 w-6" /></div>
                  <div>
                    <p className="text-lg font-bold">{getLevelLabel(prestige)}</p>
                    <p className="text-xs text-white/72">Prestígio {prestige} MP</p>
                  </div>
                </div>
              </div>
              <div className="w-full max-w-[280px] rounded-[24px] border border-white/18 bg-white/10 p-4 backdrop-blur-xl">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/70">Lacuna principal</p>
                <p className="mt-3 text-lg font-bold">{sanitizeText(summary.topBlindSpot) || 'Em definição'}</p>
                <p className="mt-1 text-xs text-white/72">Janela sugerida: {summary.lastWindow}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
          <section className="rounded-[30px] border border-white/85 bg-white/72 p-5 shadow-[0_18px_40px_rgba(6,16,51,0.06)] backdrop-blur-xl lg:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-[28px] font-bold text-[#061033]">Trilha GáveaXR</h2>
                <p className="mt-1 text-sm text-[#64748b]">Visual principal da progressão semanal com checkpoints adaptativos.</p>
              </div>
              <span className="rounded-full border border-[#d9c5ff] bg-[#faf5ff] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7c3aed]">{summary.lastUpdatedLabel}</span>
            </div>

            <div className="grid gap-4 lg:grid-cols-[128px_minmax(0,1fr)]">
              <div className="relative hidden min-h-[760px] lg:block">
                <div className="absolute left-[58px] top-[48px] h-[620px] w-[14px] rounded-full bg-[#e6edf6]" />
                {[0, 1, 2, 3].map((index) => {
                  const top = [34, 236, 442, 648][index];
                  const meta = statusBadge(activeCheckpoints[index]?.status ?? 'bloqueada');
                  return (
                    <div key={index} className="absolute left-[34px]" style={{ top }}>
                      <div className="flex h-[62px] w-[62px] items-center justify-center rounded-full border-4 border-white bg-[linear-gradient(135deg,#ffffff,#eef4fb)] shadow-[0_12px_30px_rgba(6,16,51,0.12)]">
                        <div className={`flex h-[46px] w-[46px] items-center justify-center rounded-full ${activeCheckpoints[index]?.status === 'dominada' ? 'bg-[linear-gradient(135deg,#34d399,#10b981)]' : activeCheckpoints[index]?.status === 'atencao' ? 'bg-[linear-gradient(135deg,#9b6bff,#7c3aed)]' : 'bg-[#dfe7f1]'}`}>
                          <img src={meta.icon} alt="" className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-4">
                {activeCheckpoints.map((checkpoint, index) => {
                  const meta = statusBadge(checkpoint.status);
                  return (
                    <article key={`${checkpoint.title}-${index}`} className="pathway-card rounded-[26px] border border-white/85 bg-[linear-gradient(180deg,#ffffff,#fbfdff)] p-5 shadow-[0_16px_36px_rgba(6,16,51,0.05)]">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#98a5bb]">Checkpoint {index + 1}</p>
                          <h3 className="mt-1 text-[24px] font-bold text-[#061033]">{sanitizeText(checkpoint.title)}</h3>
                        </div>
                        <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${meta.className}`}>{meta.label}</span>
                      </div>
                      <p className="mt-4 text-[15px] leading-7 text-[#43536b]">{sanitizeText(checkpoint.focus)}</p>
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <div className="rounded-[18px] border border-[#e8edf4] bg-[#f8fbff] px-4 py-3 text-sm text-[#526179]">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#98a5bb]">Janela</p>
                          <p className="mt-2 font-semibold text-[#061033]">{sanitizeText(checkpoint.window)}</p>
                        </div>
                        <div className="rounded-[18px] border border-[#e8edf4] bg-[#f8fbff] px-4 py-3 text-sm text-[#526179]">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#98a5bb]">Observação</p>
                          <p className="mt-2 font-semibold text-[#061033]">{sanitizeText(checkpoint.note)}</p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          <div className="space-y-4">
            <section className="pathway-card rounded-[26px] border border-white/85 bg-white/78 p-5 shadow-[0_18px_40px_rgba(6,16,51,0.06)]">
              <h3 className="text-[24px] font-bold text-[#061033]">Sua subida</h3>
              <p className="mt-2 text-sm leading-6 text-[#64748b]">Resumo da progressão adaptativa considerando performance, frequência e retenção.</p>
              <div className="mt-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#34d399,#10b981)] shadow-[0_10px_24px_rgba(16,185,129,0.2)]">
                    <img src={iconLevel} alt="" className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-[#061033]">{getLevelLabel(prestige)}</p>
                    <p className="text-xs text-[#64748b]">Prestígio {prestige} MP</p>
                  </div>
                </div>
                <img src={pathwayAvatar} alt="Avatar" className="h-10 w-10 rounded-full border border-white/80" />
              </div>
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs text-[#64748b]">
                  <span>Progressão da montanha</span>
                  <span>{progressValue}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-[#eff3f8]"><div className="h-2 rounded-full bg-[linear-gradient(90deg,#8b5cf6,#7c3aed)]" style={{ width: `${progressValue}%` }} /></div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[16px] border border-[#eceff4] bg-[#fafbfd] px-3 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7b8798]">Próximo foco</p>
                  <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-[#061033]"><img src={iconCurrent} alt="" className="h-4 w-4" /> {sanitizeText(summary.topBlindSpot) || 'Clínica Médica'}</div>
                </div>
                <div className="rounded-[16px] border border-[#eceff4] bg-[#fafbfd] px-3 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7b8798]">Janela sugerida</p>
                  <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-[#061033]"><img src={iconWindow} alt="" className="h-4 w-4" /> {summary.lastWindow}</div>
                </div>
              </div>
            </section>

            <section className="pathway-card rounded-[26px] border border-white/85 bg-white/78 p-5 shadow-[0_18px_40px_rgba(6,16,51,0.06)]">
              <h3 className="text-[24px] font-bold text-[#061033]">Motor adaptativo</h3>
              <p className="mt-2 text-sm leading-6 text-[#64748b]">A IA reorganiza a trilha conforme seus erros recentes, número de casos e retenção espaçada.</p>
              <div className="mt-4 space-y-3">
                <div className="rounded-[16px] border border-[#eceff4] bg-[#fafbfd] px-4 py-3 text-sm text-[#061033]"><span className="font-semibold">Desempenho histórico</span><p className="mt-1 text-xs text-[#64748b]">{summary.totalCases} caso(s) avaliados recentemente.</p></div>
                <div className="rounded-[16px] border border-[#eceff4] bg-[#fafbfd] px-4 py-3 text-sm text-[#061033]"><span className="font-semibold">Frequência de estudo</span><p className="mt-1 text-xs text-[#64748b]">Janela sugerida: {summary.lastWindow}.</p></div>
                <div className="rounded-[16px] border border-[#eceff4] bg-[#fafbfd] px-4 py-3 text-sm text-[#061033]"><span className="font-semibold">Retenção de longo prazo</span><p className="mt-1 text-xs text-[#64748b]">Revisões espaçadas evitam queda de desempenho.</p></div>
              </div>
            </section>

            <section className="pathway-card rounded-[26px] border border-[#5f21d4] bg-[linear-gradient(180deg,#6123d9,#35106c)] p-5 text-white shadow-[0_18px_40px_rgba(64,23,145,0.18)]">
              <h3 className="text-[24px] font-bold">Segundas da soberania</h3>
              <p className="mt-3 text-sm leading-6 text-white/78">Novos tópicos podem ser travados até a resolução do caso crítico da semana.</p>
              <div className="mt-4 rounded-[18px] border border-white/12 bg-white/10 p-4">
                <p className="text-sm font-semibold text-white">{caseOfDay}</p>
                <p className="mt-2 text-xs text-white/72">{summary.weeklyErrors} erro(s) registrados na última semana.</p>
                <span className="mt-3 inline-flex rounded-full bg-[#7c3aed] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">Monitoramento ativo</span>
              </div>
            </section>

            <section className="pathway-card rounded-[26px] border border-white/85 bg-white/78 p-5 shadow-[0_18px_40px_rgba(6,16,51,0.06)]">
              <h3 className="text-[24px] font-bold text-[#061033]">Focos adaptativos</h3>
              <p className="mt-2 text-sm leading-6 text-[#64748b]">A cada ciclo, a trilha reposiciona temas fortes e fracos para manter avanço consistente.</p>
              <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.14em]">
                {['Trauma', 'UTI', 'Sepse', 'Pediatria', 'Neuro'].map((tag, index) => (
                  <span key={tag} className={`rounded-full px-3 py-1.5 ${index === 0 ? 'bg-[#f5f0ff] text-[#7c3aed]' : index === 1 ? 'bg-[#eefcf7] text-[#16a46b]' : index === 2 ? 'bg-[#f3f6fb] text-[#64748b]' : index === 3 ? 'bg-[#fff9e8] text-[#c28a07]' : 'bg-[#fff3f3] text-[#e11d48]'}`}>{tag}</span>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PathwayView;


