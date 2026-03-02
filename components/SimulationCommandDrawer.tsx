import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { SIMMIT_COMMANDS } from '../constants';

gsap.registerPlugin(Flip);

type DrawerSection = 'exame' | 'laboratorio' | 'imagem' | 'procedimentos';

type BubbleBurst = {
  id: number;
  x: number;
  y: number;
};

interface SimulationCommandDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  onCommand: (command: string, cost?: number) => void;
  stamina: number;
  disabled?: boolean;
}

const SimulationCommandDrawer: React.FC<SimulationCommandDrawerProps> = ({
  isOpen,
  onToggle,
  onCommand,
  stamina,
  disabled = false,
}) => {
  const [activeSection, setActiveSection] = useState<DrawerSection>('exame');
  const [burstParticles, setBurstParticles] = useState<BubbleBurst[]>([]);
  const drawerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!isOpen) return;

    const ctx = gsap.context(() => {
      if (backdropRef.current) {
        gsap.fromTo(
          backdropRef.current,
          { opacity: 0, backdropFilter: 'blur(0px)' },
          { opacity: 1, backdropFilter: 'blur(10px)', duration: 0.2, ease: 'power2.out' }
        );
      }
      if (drawerRef.current) {
        gsap.fromTo(
          drawerRef.current,
          { y: 120, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.35, ease: 'power3.out' }
        );
      }

      const flipState = window.__simmitFlipState;
      if (flipState) {
        Flip.from(flipState, {
          duration: 0.6,
          ease: 'power3.out',
          absolute: true,
        });
      }
    }, drawerRef);

    return () => ctx.revert();
  }, [isOpen]);

  const spawnBurst = (event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const id = Date.now();
    setBurstParticles((prev) => [...prev, { id, x, y }]);
    window.setTimeout(() => {
      setBurstParticles((prev) => prev.filter((particle) => particle.id !== id));
    }, 700);
  };

  const handleAction = (event: React.MouseEvent, command: string, cost: number) => {
    spawnBurst(event);
    onCommand(command, cost);
  };

  const examActions = useMemo(
    () => [
      { id: 'estado-geral', label: 'Estado Geral', cmd: SIMMIT_COMMANDS.examGeneral, cost: 4, badge: 'EG' },
      { id: 'sinais-vitais', label: 'Sinais Vitais', cmd: SIMMIT_COMMANDS.examVitals, cost: 4, badge: 'SV' },
      { id: 'inspecao', label: 'Inspeção', cmd: SIMMIT_COMMANDS.examInspection, cost: 6, badge: 'IN' },
      { id: 'palpacao', label: 'Palpação', cmd: SIMMIT_COMMANDS.examPalpation, cost: 6, badge: 'PA' },
      { id: 'percussao', label: 'Percussão', cmd: SIMMIT_COMMANDS.examPercussion, cost: 6, badge: 'PE' },
      { id: 'ausculta', label: 'Ausculta', cmd: SIMMIT_COMMANDS.examAuscultation, cost: 6, badge: 'AU' },
    ],
    []
  );

  const labActions = useMemo(
    () => [
      'Hemograma',
      'Tipagem sanguínea',
      'VHS',
      'PCR',
      'Glicemia',
      'HbA1c',
      'Insulina',
      'Perfil lipídico',
      'Troponina',
      'Lactato',
      'Ureia',
      'Creatinina',
      'Sódio',
      'Potássio',
      'Cálcio',
      'Magnésio',
      'Fósforo',
      'TFG',
      'TGO',
      'TGP',
      'GGT',
      'FA',
      'Bilirrubinas',
      'Albumina',
      'TSH',
      'T4L',
      'Cortisol',
      'Vitamina D',
      'B12',
    ],
    []
  );

  const imageActions = useMemo(
    () => [
      'Ultrassom com Doppler',
      'Ultrassom Abdominal/Pélvico',
      'Ecocardiograma',
      'Raio-X de Tórax',
      'Raio-X Ósseo',
      'Mamografia',
      'TC de Crânio',
      'Angio-TC',
      'TC de Tórax/Abdome',
      'RM de Encéfalo',
      'RM Osteoarticular',
      'Angiorressonância',
    ],
    []
  );

  const procedureActions = useMemo(
    () => [
      'Intubação orotraqueal (IOT)',
      'Ventilação não invasiva (VNI)',
      'Cricotireoidostomia',
      'Acesso venoso central (CVC)',
      'Punção arterial (PAI)',
      'Acesso intraósseo',
      'Drenagem de tórax',
      'Paracentese',
      'Punção lombar',
    ],
    []
  );

  const sectionButton = (id: DrawerSection, label: string, tag: string) => (
    <button
      key={id}
      type="button"
      onClick={() => setActiveSection(id)}
      className={`aero-gloss flex items-center gap-2 rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] transition ${
        activeSection === id
          ? 'bg-gradient-to-r from-[#741cd9] to-[#18cf91] text-white'
          : 'border border-white/50 bg-white/40 text-[#003322]/70 hover:border-[#741cd9]/60'
      }`}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/60 bg-white/70 text-[9px] font-bold text-[#741cd9] shadow-[0_4px_10px_rgba(116,28,217,0.35)]">
        {tag}
      </span>
      {label}
    </button>
  );

  const listContainerClass = 'max-h-[46vh] overflow-y-auto pr-1';

  return (
    <div className="fixed bottom-0 left-0 z-40 w-full">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="mx-auto mb-2 flex h-2 w-12 items-center justify-center rounded-full bg-[#003322]/20 transition-opacity hover:opacity-100"
      />

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="backdrop"
              ref={backdropRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onToggle}
              className="fixed inset-0 z-30 bg-white/10"
            />
            <motion.div
              key="drawer"
              ref={drawerRef}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 22, stiffness: 140 }}
              className="relative z-40 rounded-t-3xl border-t border-white/50 bg-white/70 px-5 pb-6 pt-5 shadow-[0_-10px_40px_rgba(193,188,250,0.5)] backdrop-blur-md"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2
                  data-flip-id="simmit-logo"
                  className="font-exo text-lg font-bold tracking-[0.35em] text-[#741cd9]"
                >
                  SIMMIT <span className="ml-2 font-mono text-[10px] text-[#003322]/60">PROPEDÊUTICA</span>
                </h2>
                <div className="rounded-full border border-white/60 bg-white/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#003322]">
                  {stamina} STAMINA
                </div>
              </div>

              <div className="mb-5 flex flex-wrap gap-2">
                {sectionButton('exame', 'Exame Físico', 'EX')}
                {sectionButton('laboratorio', 'Laboratório', 'LB')}
                {sectionButton('imagem', 'Imagem', 'IM')}
                {sectionButton('procedimentos', 'Procedimentos', 'ER')}
              </div>

              {activeSection === 'exame' && (
                <div>
                  <div className="mb-4 text-[10px] uppercase tracking-[0.4em] text-[#003322]/60">Propedêutica</div>
                  <div className={`grid grid-cols-2 gap-3 ${listContainerClass}`}>
                    {examActions.map((action) => (
                      <motion.button
                        key={action.id}
                        type="button"
                        whileTap={{ scale: 0.94 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 14 }}
                        onClick={(event) => handleAction(event, action.cmd, action.cost)}
                        disabled={disabled}
                        className="relative overflow-hidden group flex items-center gap-3 rounded-2xl border border-white/60 bg-white/60 p-4 text-left transition-all hover:border-[#741cd9] hover:bg-[#d1e8d9] disabled:opacity-50 aero-gloss"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/60 bg-white/70 text-xs font-bold text-[#003322] group-hover:border-[#741cd9] group-hover:text-[#741cd9]">
                          {action.badge}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#003322]">{action.label}</p>
                          <p className="text-xs text-[#003322]/60">SIMMIT {action.label.toUpperCase()}</p>
                        </div>
                        {burstParticles.map((particle) => (
                          <span
                            key={particle.id}
                            className="absolute h-2 w-2 rounded-full bg-[#741cd9]/80"
                            style={{ left: particle.x, top: particle.y }}
                          />
                        ))}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'laboratorio' && (
                <div>
                  <div className="mb-4 text-[10px] uppercase tracking-[0.4em] text-[#003322]/60">Painel Laboratorial</div>
                  <div className={`grid grid-cols-2 gap-2 ${listContainerClass}`}>
                    {labActions.map((label) => (
                      <motion.button
                        key={label}
                        type="button"
                        whileTap={{ scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 16 }}
                        onClick={(event) => handleAction(event, `SIMMIT LABORATÓRIO: ${label}`, 6)}
                        disabled={disabled}
                        className="relative overflow-hidden flex items-center gap-2 rounded-xl border border-white/60 bg-white/60 px-3 py-3 text-left text-xs font-semibold text-[#003322] transition hover:border-[#741cd9]/60 hover:bg-[#d1e8d9] aero-gloss"
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/60 bg-white/80 text-[9px] font-bold text-[#741cd9] shadow-[0_4px_10px_rgba(116,28,217,0.35)]">
                          LAB
                        </span>
                        <span>{label}</span>
                        {burstParticles.map((particle) => (
                          <span
                            key={particle.id}
                            className="absolute h-2 w-2 rounded-full bg-[#18cf91]/80"
                            style={{ left: particle.x, top: particle.y }}
                          />
                        ))}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'imagem' && (
                <div>
                  <div className="mb-4 text-[10px] uppercase tracking-[0.4em] text-[#003322]/60">Radiologia</div>
                  <div className={`grid grid-cols-2 gap-2 ${listContainerClass}`}>
                    {imageActions.map((label) => (
                      <motion.button
                        key={label}
                        type="button"
                        whileTap={{ scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 16 }}
                        onClick={(event) => handleAction(event, `SIMMIT IMAGEM: ${label}`, 6)}
                        disabled={disabled}
                        className="relative overflow-hidden flex items-center gap-2 rounded-xl border border-white/60 bg-white/60 px-3 py-3 text-left text-xs font-semibold text-[#003322] transition hover:border-[#741cd9]/60 hover:bg-[#d1e8d9] aero-gloss"
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/60 bg-white/80 text-[9px] font-bold text-[#741cd9] shadow-[0_4px_10px_rgba(116,28,217,0.35)]">
                          IMG
                        </span>
                        <span>{label}</span>
                        {burstParticles.map((particle) => (
                          <span
                            key={particle.id}
                            className="absolute h-2 w-2 rounded-full bg-[#741cd9]/80"
                            style={{ left: particle.x, top: particle.y }}
                          />
                        ))}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'procedimentos' && (
                <div>
                  <div className="mb-4 text-[10px] uppercase tracking-[0.4em] text-[#003322]/60">ER / UTI</div>
                  <div className={`grid grid-cols-2 gap-2 ${listContainerClass}`}>
                    {procedureActions.map((label) => (
                      <motion.button
                        key={label}
                        type="button"
                        whileTap={{ scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 16 }}
                        onClick={(event) => handleAction(event, `SIMMIT PROCEDIMENTO: ${label}`, 8)}
                        disabled={disabled}
                        className="relative overflow-hidden flex items-center gap-2 rounded-xl border border-white/60 bg-white/60 px-3 py-3 text-left text-xs font-semibold text-[#003322] transition hover:border-[#741cd9]/60 hover:bg-[#d1e8d9] aero-gloss"
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/60 bg-white/80 text-[9px] font-bold text-[#741cd9] shadow-[0_4px_10px_rgba(116,28,217,0.35)]">
                          ER
                        </span>
                        <span>{label}</span>
                        {burstParticles.map((particle) => (
                          <span
                            key={particle.id}
                            className="absolute h-2 w-2 rounded-full bg-[#18cf91]/80"
                            style={{ left: particle.x, top: particle.y }}
                          />
                        ))}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-5 border-t border-white/60 pt-4">
                <button
                  type="button"
                  onClick={() => onCommand(SIMMIT_COMMANDS.closeCase, 0)}
                  disabled={disabled}
                  className="w-full rounded-xl border border-white/60 bg-white/60 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-[#003322] transition hover:bg-[#d1e8d9] disabled:opacity-50 aero-gloss"
                >
                  Encerrar Caso
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SimulationCommandDrawer;
