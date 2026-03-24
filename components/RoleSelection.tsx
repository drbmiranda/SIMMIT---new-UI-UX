import React from 'react';
import { Profile, UserRole } from '../types';

import homeLogo from '../design-SIMMIT/logo.svg';
import cardSimmit from '../design-SIMMIT/figma-sections/02-home-screen/assets/card-simmit.png';
import cardTheory from '../design-SIMMIT/figma-sections/02-home-screen/assets/card-theory.png';
import cardPathway from '../design-SIMMIT/figma-sections/02-home-screen/assets/card-pathway.png';
import iconFire from '../design-SIMMIT/figma-sections/02-home-screen/assets/icon-fire.svg';
import iconBolt from '../design-SIMMIT/figma-sections/02-home-screen/assets/icon-bolt.svg';

interface RoleSelectionProps {
  onSelectRole: (role: UserRole) => void;
  onSelectSimmit: () => void;
  profile?: Profile | null;
}

const getDisplayName = (profile?: Profile | null) => {
  const fullName = profile?.full_name?.trim();
  if (!fullName) return 'médico(a)';
  return fullName.split(/\s+/)[0];
};

const RoleCard: React.FC<{ title: string; description: string; image: string; badge: string; onClick: () => void; }> = ({ title, description, image, badge, onClick }) => (
  <button onClick={onClick} className="relative min-h-[260px] w-full overflow-hidden rounded-[28px] border border-white/70 text-left shadow-[0_20px_40px_rgba(2,6,23,0.2)] focus:outline-none focus:ring-4 focus:ring-[#741cd9]/30">
    <img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
    <div className="relative z-10 flex h-full flex-col justify-between p-5">
      <span className="inline-flex w-fit rounded-full border border-white/60 bg-white/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">{badge}</span>
      <div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="mt-2 text-sm text-white/90">{description}</p>
      </div>
    </div>
  </button>
);

const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelectRole, onSelectSimmit, profile }) => {
  const displayName = getDisplayName(profile);

  return (
    <div className="mx-auto flex h-full w-full max-w-6xl flex-col px-4 pb-8 pt-6 text-[#020617] sm:px-6">
      <div className="rounded-3xl border border-white/70 bg-[radial-gradient(ellipse_at_top_left,#f8fafc_40%,#e3d1f7_62%,#d1f5e9_100%)] p-5 shadow-[0_24px_64px_rgba(116,28,217,0.16)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3"><img src={homeLogo} alt="SIMMIT" className="h-9 w-auto" /></div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-slate-800"><img src={iconFire} alt="" className="h-4 w-4" />4</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-slate-800"><img src={iconBolt} alt="" className="h-4 w-4" />130 MP</span>
          </div>
        </div>

        <h2 className="mt-8 text-center font-title text-3xl text-[#020617] sm:text-4xl">Bem-vindo(a), {displayName}. Como posso ajudar você hoje?</h2>
      </div>

      <div className="mt-6 grid flex-grow gap-4 md:grid-cols-3">
        <RoleCard title="SIMMIT" description="Inicie sua simulação clínica e treine seu raciocínio em tempo real." image={cardSimmit} badge="SIM" onClick={onSelectSimmit} />
        <RoleCard title="IA para provas teóricas" description="Gerador por PDF, banco de questões e flashcards em um só lugar." image={cardTheory} badge="AI" onClick={() => onSelectRole('question_generator')} />
        <RoleCard title="SIMMIT Pathway" description="Calendário adaptativo e progressão clínica personalizada." image={cardPathway} badge="PATH" onClick={() => onSelectRole('pathway')} />
      </div>
    </div>
  );
};

export default RoleSelection;
