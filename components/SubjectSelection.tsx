import React from 'react';
import { MedicalSubject } from '../types';
import SimmitLogo from './SimmitLogo';
import subjectMedicalClinic from '../design-SIMMIT/subject-selection/subject-medical-clinic.png';
import subjectSurgical from '../design-SIMMIT/subject-selection/subject-surgical.png';
import subjectPreventive from '../design-SIMMIT/subject-selection/subject-preventive.png';
import subjectPediatrics from '../design-SIMMIT/subject-selection/subject-pediatrics.png';
import subjectGynecology from '../design-SIMMIT/subject-selection/subject-gynecology.png';

interface SubjectSelectionProps {
  onSelectSubject: (subject: MedicalSubject) => void;
  onGoHome: () => void;
}

const SUBJECT_META: Record<MedicalSubject, { label: string; image: string; cardClassName: string; imageClassName: string }> = {
  'Clínica Médica': {
    label: 'Clínica Médica',
    image: subjectMedicalClinic,
    cardClassName: 'from-[#9a7300] to-[#ffeb80]',
    imageClassName: 'right-2 top-1/2 h-[96px] -translate-y-1/2',
  },
  'Clínica Cirúrgica': {
    label: 'Clínica Cirúrgica',
    image: subjectSurgical,
    cardClassName: 'from-[#1f7a27] to-[#a7f3d0]',
    imageClassName: 'right-1 top-1/2 h-[88px] -translate-y-1/2',
  },
  'Medicina Preventiva': {
    label: 'Medicina Preventiva',
    image: subjectPreventive,
    cardClassName: 'from-[#991b34] to-[#f9a8d4]',
    imageClassName: 'right-6 top-1/2 h-[92px] -translate-y-1/2',
  },
  Pediatria: {
    label: 'Pediatria',
    image: subjectPediatrics,
    cardClassName: 'from-[#5b21b6] to-[#c084fc]',
    imageClassName: 'right-4 top-1/2 h-[86px] -translate-y-1/2',
  },
  'Ginecologia e Obstetrícia': {
    label: 'Ginecologia e Obstetrícia',
    image: subjectGynecology,
    cardClassName: 'from-[#1e293b] to-[#cbd5e1]',
    imageClassName: 'right-6 top-1/2 h-[90px] -translate-y-1/2',
  },
};

const SubjectCard: React.FC<{ title: MedicalSubject; onClick: () => void; centered?: boolean }> = ({ title, onClick, centered = false }) => {
  const meta = SUBJECT_META[title];

  return (
    <button
      onClick={onClick}
      className={`group relative h-[83px] overflow-hidden rounded-[19px] bg-gradient-to-r ${meta.cardClassName} px-5 text-left shadow-[0_18px_32px_rgba(15,23,42,0.10)] ${centered ? 'mx-auto w-full max-w-[348px]' : 'w-full'}`}
    >
      <span className="relative z-10 flex h-full max-w-[58%] items-center text-[17px] font-semibold leading-6 text-white">
        {meta.label}
      </span>
      <img src={meta.image} alt={meta.label} className={`pointer-events-none absolute ${meta.imageClassName} w-auto object-contain`} />
    </button>
  );
};

const SubjectSelection: React.FC<SubjectSelectionProps> = ({ onSelectSubject }) => {
  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),rgba(244,246,251,0.98)_30%,rgba(225,214,255,0.78)_72%,rgba(214,246,233,0.65)_100%)] text-[#061033]">
      <div className="mx-auto max-w-[1280px] px-10 pb-20 pt-6">
        <header className="flex items-center justify-between border-b border-white/55 pb-7">
          <SimmitLogo size="md" />
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-slate-800">4</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-slate-800">130 MP</span>
          </div>
        </header>

        <section className="mx-auto mt-12 max-w-[760px] text-center">
          <h1 className="text-[29px] font-bold uppercase tracking-[0.02em]">Escolha a especialidade</h1>
          <p className="mt-3 text-[18px] text-[#061033]/85">Selecione a área de estudo para sua próxima simulação OSCE.</p>
        </section>

        <section className="mx-auto mt-10 max-w-[720px] space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <SubjectCard title="Clínica Médica" onClick={() => onSelectSubject('Clínica Médica')} />
            <SubjectCard title="Clínica Cirúrgica" onClick={() => onSelectSubject('Clínica Cirúrgica')} />
            <SubjectCard title="Medicina Preventiva" onClick={() => onSelectSubject('Medicina Preventiva')} />
            <SubjectCard title="Pediatria" onClick={() => onSelectSubject('Pediatria')} />
          </div>
          <SubjectCard title="Ginecologia e Obstetrícia" onClick={() => onSelectSubject('Ginecologia e Obstetrícia')} centered />
        </section>
      </div>
    </div>
  );
};

export default SubjectSelection;
