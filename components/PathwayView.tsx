import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { supabase } from '../services/supabaseClient';
import { fetchRemoteGamificationState, loadGamificationState, GamificationState } from '../services/gamificationService';
import { MedicalSubject } from '../types';

gsap.registerPlugin(ScrollTrigger);

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

const statusStyles: Record<CheckpointStatus, { dot: string; badge: string; text: string }> = {
  dominada: {
    dot: 'bg-[#18cf91] shadow-[0_0_18px_rgba(24,207,145,0.6)]',
    badge: 'bg-[#18cf91]/15 text-[#0f8c63] border-[#18cf91]/40',
    text: 'Dominada'
  },
  atencao: {
    dot: 'bg-[#741cd9] animate-soft-glow',
    badge: 'bg-[#741cd9]/15 text-[#5b16ad] border-[#741cd9]/35',
    text: 'Atenção'
  },
  bloqueada: {
    dot: 'bg-[#c1bcfa] shadow-[0_0_18px_rgba(193,188,250,0.5)]',
    badge: 'bg-[#c1bcfa]/35 text-[#4b3c7a] border-[#c1bcfa]/60',
    text: 'Bloqueada'
  }
};

const subjectLabels: Record<MedicalSubject, string> = {
  'Clínica Médica': 'Clínica Médica',
  'Clínica Cirúrgica': 'Clínica Cirúrgica',
  'Medicina Preventiva': 'Medicina Preventiva',
  'Pediatria': 'Pediatria',
  'Ginecologia e Obstetrícia': 'Ginecologia e Obstetrícia'
};

const formatWindowLabel = (start: Date, end: Date) => {
  const pad = (value: number) => value.toString().padStart(2, '0');
  return `${pad(start.getHours())}:${pad(start.getMinutes())} - ${pad(end.getHours())}:${pad(end.getMinutes())}`;
};

const getLocalDateKey = (date = new Date()) => date.toLocaleDateString('en-CA');

const formatDateKeyPt = (dateKey: string) => {
  const [year, month, day] = dateKey.split('-');
  if (!year || !month || !day) return dateKey;
  return `${day}/${month}/${year}`;
};

const getNextFocusWindow = () => {
  const now = new Date();
  const start = new Date(now);
  start.setHours(18, 0, 0, 0);
  if (now > start) {
    start.setDate(start.getDate() + 1);
  }
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
  if (prestige >= 800) return 'Ápice';
  if (prestige >= 200) return 'Montanhista';
  return 'Explorador';
};


const normalizeCheckpointTitle = (title: string) => {
  if (title === 'N?vel 1: Explorer') return 'Nível 1: Explorador';
  if (title === 'N?vel 2: Practitioner') return 'Nível 2: Montanhista';
  if (title === 'N?vel 3: Sovereign') return 'N?vel 3: O ?pice (SIMMIT)';
  return title;
};

const buildCheckpoints = (summary: PerformanceSummary, loginDateKey: string): Checkpoint[] => {
  const blindSpot = summary.topBlindSpot ?? 'Cardiologia';
  const avgScore = summary.avgScore ?? 0;
  const initialStatus: CheckpointStatus = avgScore >= 70 ? 'dominada' : 'atencao';

  return [
    {
      title: 'Nível 1: Explorador',
      focus: 'Anamnese base + labs iniciais',
      status: initialStatus,
      window: 'Últimas 48h',
      note: `Total de ${summary.totalCases} casos recentes.`
    },
    {
      title: 'Nível 2: Montanhista',
      focus: `${blindSpot} crítica e pontos cegos`,
      status: 'atencao',
      window: summary.lastWindow,
      note: 'Erro crítico detectado na HUD recente.'
    },
    {
      title: 'Revisão espaçada',
      focus: 'Retenção de longo prazo (15 dias)',
      status: 'bloqueada',
      window: formatDateKeyPt(loginDateKey),
      note: 'Revisão automática após domínio sustentado.'
    },
    {
      title: 'Nível 3: Ápice',
      focus: 'ECMO + Swan-Ganz',
      status: 'bloqueada',
      window: summary.totalCases >= 5 ? 'Desbloqueia com 5 casos' : 'Complete 5 casos',
      note: 'Procedimentos avançados e decisões raras.'
    }
  ];
};

const PathwayView: React.FC<PathwayViewProps> = ({ userId }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [summary, setSummary] = useState<PerformanceSummary>({
    totalCases: 0,
    avgScore: null,
    topBlindSpot: null,
    lastWindow: getNextFocusWindow(),
    weeklyErrors: 0,
    lastUpdatedLabel: 'Atualizando...'
  });
  const [caseOfDay, setCaseOfDay] = useState<string>('');
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [gamification, setGamification] = useState<GamificationState | null>(null);

  const isMonday = new Date().getDay() === 1;

  useEffect(() => {
    if (!userId) {
      setSummary(prev => ({ ...prev, lastUpdatedLabel: 'Sem sessão ativa' }));
      return;
    }

    const fetchPathwayData = async () => {
      const { start, end } = getWeekRange();

      const remoteGamification = await fetchRemoteGamificationState(userId);
      const localGamification = loadGamificationState();
      const activeGamification = remoteGamification ?? localGamification;
      setGamification(activeGamification);

      const loginDateKey = activeGamification.lastActivityDate ?? getLocalDateKey();

      const [{ data: results }, { data: errors }, { data: existingCheckpoints }] = await Promise.all([
        supabase
          .from('simulation_results')
          .select('created_at, subject, final_score')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(120),
        supabase
          .from('error_reports')
          .select('created_at, subject')
          .eq('user_id', userId)
          .gte('created_at', start.toISOString())
          .lte('created_at', end.toISOString()),
        supabase
          .from('pathway_checkpoints')
          .select('generated_for_date, title, focus, status, window_label, note, sort_order')
          .eq('user_id', userId)
          .order('sort_order', { ascending: true })
      ]);

      const totalCases = results?.length ?? 0;
      const avgScore = results && results.length
        ? Math.round(results.reduce((acc, row) => acc + (row.final_score || 0), 0) / results.length)
        : null;

      const subjectScores = new Map<string, { total: number; count: number }>();
      results?.forEach(row => {
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

      const weeklyErrors = errors?.length ?? 0;
      const lastUpdatedLabel = `Atualizado em ${formatDateKeyPt(loginDateKey)}`;

      const nextSummary: PerformanceSummary = {
        totalCases,
        avgScore,
        topBlindSpot,
        lastWindow: getNextFocusWindow(),
        weeklyErrors,
        lastUpdatedLabel
      };
      setSummary(nextSummary);

      if (isMonday) {
        const subjectCount = new Map<string, number>();
        errors?.forEach(error => {
          if (!error.subject) return;
          const key = error.subject;
          subjectCount.set(key, (subjectCount.get(key) ?? 0) + 1);
        });
        let topErrorSubject: string | null = null;
        let maxCount = 0;
        subjectCount.forEach((count, key) => {
          if (count > maxCount) {
            maxCount = count;
            topErrorSubject = key;
          }
        });
        setCaseOfDay(topErrorSubject ? `Caso do Dia: ${topErrorSubject}` : 'Caso do Dia: Revisão crítica');
      } else {
        setCaseOfDay('Caso do Dia disponível toda segunda-feira.');
      }

      const hasBadEncoding = (existingCheckpoints ?? []).some(row => {
        const payload = `${row.title} ${row.focus} ${row.note} ${row.window_label}`;
        return /\\u00C3|\\uFFFD/.test(payload);
      });
      const existingDate = existingCheckpoints?.[0]?.generated_for_date ?? null;
      const shouldRegenerate = !existingDate || existingDate !== loginDateKey || hasBadEncoding;

      if (shouldRegenerate) {
        const generated = buildCheckpoints(nextSummary, loginDateKey);
        const rows = generated.map((checkpoint, index) => ({
          user_id: userId,
          sort_order: index + 1,
          title: checkpoint.title,
          focus: checkpoint.focus,
          status: checkpoint.status,
          window_label: checkpoint.window,
          note: checkpoint.note,
          source: 'auto',
          generated_for_date: loginDateKey
        }));

        await supabase.from('pathway_checkpoints').delete().eq('user_id', userId);
        await supabase.from('pathway_checkpoints').insert(rows);
        setCheckpoints(generated);
        return;
      }

      const restored = (existingCheckpoints ?? []).map(row => ({
        title: row.title,
        focus: row.focus,
        status: row.status as CheckpointStatus,
        window: row.window_label,
        note: row.note
      }));
      setCheckpoints(restored.length ? restored : buildCheckpoints(nextSummary, loginDateKey));
    };

    fetchPathwayData();
  }, [userId, isMonday]);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.pathway-hero-chip', {
        opacity: 0,
        y: 12,
        duration: 0.6,
        stagger: 0.12,
        ease: 'power2.out'
      });

      gsap.utils.toArray<HTMLElement>('.pathway-node').forEach((node, index) => {
        gsap.from(node, {
          scrollTrigger: {
            trigger: node,
            start: 'top 80%'
          },
          opacity: 0,
          y: 18,
          duration: 0.5,
          delay: index * 0.05,
          ease: 'power2.out'
        });
      });

      gsap.utils.toArray<HTMLElement>('.pathway-panel').forEach((panel, index) => {
        gsap.from(panel, {
          scrollTrigger: {
            trigger: panel,
            start: 'top 85%'
          },
          opacity: 0,
          y: 16,
          duration: 0.5,
          delay: index * 0.08,
          ease: 'power2.out'
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const prestige = gamification?.medPoints ?? summary.totalCases * 20;
  const levelLabel = getLevelLabel(prestige);
  const progressValue = Math.min(100, Math.max(0, summary.avgScore ?? 0));

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#eaf0f7]"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-10 h-56 w-56 rounded-full bg-[#c1bcfa]/40 blur-3xl" />
        <div className="absolute right-6 top-24 h-72 w-72 rounded-full bg-[#18cf91]/20 blur-[90px]" />
        <div className="absolute bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-white/80 via-white/30 to-transparent" />
      </div>

      <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-10 pt-8">
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr,0.9fr]">
          <div>
            <div className="pathway-hero-chip inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#741cd9] shadow-[0_12px_30px_rgba(116,28,217,0.2)]">
              Escalada Clínica | Pathway
            </div>
            <h1 className="mt-4 text-3xl font-bold text-[#003322] sm:text-4xl">
              O calendário adaptativo que reage aos seus dados em tempo real.
            </h1>
            <p className="mt-3 max-w-xl text-base text-[#003322]/75">
              A montanha do conhecimento se reconfigura a cada 24 horas. O caminho prioriza seus pontos cegos,
              respeita seu ritmo e protege sua retenção de longo prazo.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {[
                'Reorganização diária',
                'Nodes vítreos',
                'Repetição espaçada',
                'HUD sincronizada'
              ].map((item) => (
                <span key={item} className="pathway-hero-chip glass-chip inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-[#003322]/80">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/70 p-6 shadow-[0_24px_60px_rgba(116,28,217,0.18)] backdrop-blur-xl">
            <div className="absolute inset-0">
              <div className="absolute -right-10 top-6 h-32 w-32 rounded-full bg-[#741cd9]/10 blur-2xl" />
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#eaf0f7] via-transparent to-transparent" />
            </div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#003322]/60">Sua subida</p>
                  <h2 className="text-2xl font-bold text-[#003322]">Nível {levelLabel}</h2>
                </div>
                <span className="rounded-full border border-[#18cf91]/40 bg-[#18cf91]/20 px-3 py-1 text-xs font-semibold text-[#0f8c63]">
                  Prestígio {prestige} MP
                </span>
              </div>
              <div className="mt-6">
                <div className="flex items-center justify-between text-xs font-semibold text-[#003322]/70">
                  <span>Progressão da montanha</span>
                  <span>{progressValue}%</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-white/70">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-[#741cd9] to-[#18cf91]"
                    style={{ width: `${progressValue}%` }}
                  />
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="glass-chip rounded-2xl px-4 py-3 text-sm text-[#003322]/80">
                  Próximo checkpoint
                  <div className="mt-1 text-base font-semibold text-[#003322]">
                    {summary.topBlindSpot ?? 'Defina um alvo'}
                  </div>
                </div>
                <div className="glass-chip rounded-2xl px-4 py-3 text-sm text-[#003322]/80">
                  Janela sugerida
                  <div className="mt-1 text-base font-semibold text-[#003322]">{summary.lastWindow}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-14">
        <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="pathway-panel relative overflow-hidden rounded-3xl border border-white/70 bg-white/70 p-6 shadow-[0_24px_60px_rgba(116,28,217,0.16)] backdrop-blur-xl">
            <div className="absolute inset-0">
              <div className="absolute -top-10 right-4 h-24 w-24 rounded-full bg-[#18cf91]/15 blur-2xl" />
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#eaf0f7] via-transparent to-transparent" />
            </div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[#003322]">Trilha da GáveaXR</h3>
                <span className="rounded-full border border-[#741cd9]/30 bg-[#741cd9]/10 px-3 py-1 text-xs font-semibold text-[#5b16ad]">
                  {summary.lastUpdatedLabel}
                </span>
              </div>

              <div className="mt-6 relative border-l-2 border-[#741cd9]/25 pl-6">
                {(checkpoints.length ? checkpoints : buildCheckpoints(summary, getLocalDateKey())).map((checkpoint) => (
                  <div key={normalizeCheckpointTitle(checkpoint.title)} className="pathway-node relative mb-6 last:mb-0">
                    <span
                      className={`absolute -left-[14px] top-1 h-5 w-5 rounded-full border border-white ${statusStyles[checkpoint.status].dot}`}
                    />
                    <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-[0_10px_30px_rgba(116,28,217,0.12)]">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h4 className="text-base font-semibold text-[#003322]">{normalizeCheckpointTitle(checkpoint.title)}</h4>
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[checkpoint.status].badge}`}>
                          {statusStyles[checkpoint.status].text}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-[#003322]/80">{checkpoint.focus}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#003322]/70">
                        <span className="rounded-full border border-[#c1bcfa]/40 bg-white/60 px-3 py-1">
                          {checkpoint.window}
                        </span>
                        <span>{checkpoint.note}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="pathway-panel rounded-3xl border border-white/70 bg-white/70 p-6 shadow-[0_18px_50px_rgba(116,28,217,0.14)] backdrop-blur-xl">
              <h3 className="text-lg font-bold text-[#003322]">Motor adaptativo (IA)</h3>
              <p className="mt-2 text-sm text-[#003322]/70">
                Gemini 3 Flash cruza performance, frequência e retenção para rearranjar o Pathway a cada 24h.
              </p>
              <div className="mt-4 space-y-3 text-sm text-[#003322]/80">
                <div className="glass-chip rounded-2xl px-4 py-3">
                  <span className="font-semibold text-[#003322]">Performance histórica</span>
                  <p className="text-xs text-[#003322]/70">{summary.totalCases} casos avaliados recentemente.</p>
                </div>
                <div className="glass-chip rounded-2xl px-4 py-3">
                  <span className="font-semibold text-[#003322]">Frequência de estudo</span>
                  <p className="text-xs text-[#003322]/70">Janela sugerida: {summary.lastWindow}.</p>
                </div>
                <div className="glass-chip rounded-2xl px-4 py-3">
                  <span className="font-semibold text-[#003322]">Retenção longa</span>
                  <p className="text-xs text-[#003322]/70">Revisões espaçadas para evitar queda.</p>
                </div>
              </div>
            </div>

            <div className="pathway-panel rounded-3xl border border-white/70 bg-white/70 p-6 shadow-[0_18px_50px_rgba(116,28,217,0.14)] backdrop-blur-xl">
              <h3 className="text-lg font-bold text-[#003322]">Segundas de Soberania</h3>
              <p className="mt-2 text-sm text-[#003322]/70">
                O acesso a novos temas fica bloqueado até resolver o Caso do Dia.
              </p>
              <div className="mt-4 rounded-2xl border border-[#741cd9]/20 bg-[#eaf0f7] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#741cd9]/70">Caso do dia</p>
                    <p className="text-base font-semibold text-[#003322]">{caseOfDay || 'Carregando...'}</p>
                  </div>
                  <span className="rounded-full border border-[#741cd9]/35 bg-[#741cd9]/10 px-3 py-1 text-xs font-semibold text-[#5b16ad]">
                    {isMonday ? 'Bloqueado' : 'Agendado'}
                  </span>
                </div>
                <p className="mt-3 text-xs text-[#003322]/70">{summary.weeklyErrors} erros na semana anterior.</p>
              </div>
            </div>

            <div className="pathway-panel rounded-3xl border border-white/70 bg-white/70 p-6 shadow-[0_18px_50px_rgba(116,28,217,0.14)] backdrop-blur-xl">
              <h3 className="text-lg font-bold text-[#003322]">Checkpoints adaptativos</h3>
              <p className="mt-2 text-sm text-[#003322]/70">
                A cada 5 casos, o caminho reorganiza. Temas dominados vão para bolhas menores.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {['Trauma', 'Intensivismo', 'Sepse', 'Pediatria', 'Neuro'].map((tema) => (
                  <span key={tema} className="rounded-full border border-[#18cf91]/30 bg-[#18cf91]/10 px-3 py-1 font-semibold text-[#0f8c63]">
                    {tema}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default PathwayView;

