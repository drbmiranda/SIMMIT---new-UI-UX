import React, { useEffect, useState } from 'react';
import { Profile } from '../types';
import StudentDashboard from './StudentDashboard';
import { supabase } from '../services/supabaseClient';

interface ProfilePanelProps {
  isOpen: boolean;
  email: string | null;
  profile: Profile | null;
  onClose: () => void;
  onStartTutorial: () => void;
  onLogout: () => void;
  variant?: 'modal' | 'dock';
}

const PANEL_BACKGROUND = 'radial-gradient(265.82% 126.76% at 14.14% 0%, #F8FAFC 40.22%, #E3D1F7 61.67%, #D1F5E9 100%)';

const ProfilePanel: React.FC<ProfilePanelProps> = ({
  isOpen,
  email,
  profile,
  onClose,
  onLogout,
  variant = 'modal',
}) => {
  const [displayName, setDisplayName] = useState(profile?.full_name ?? 'Aluno(a)');
  const [draftName, setDraftName] = useState(profile?.full_name ?? 'Aluno(a)');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  useEffect(() => {
    const nextName = profile?.full_name ?? 'Aluno(a)';
    setDisplayName(nextName);
    setDraftName(nextName);
  }, [profile?.full_name]);



  const handleSaveProfile = async () => {
    if (!profile?.id) return;
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const { error } = await supabase.from('profiles').update({ full_name: draftName }).eq('id', profile.id);
      if (error) throw error;
      setDisplayName(draftName);
      setSaveMessage('Perfil atualizado com sucesso.');
      setTimeout(() => setIsEditProfileOpen(false), 700);
    } catch (err) {
      setSaveMessage(err instanceof Error ? err.message : 'Não foi possível salvar o perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenEditProfile = () => {
    setDraftName(displayName);
    setSaveMessage(null);
    setIsEditProfileOpen(true);
  };

  const panelContent = (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl border border-white/60 shadow-[0_20px_60px_rgba(193,188,250,0.45)] backdrop-blur-xl text-[#003322]"
      style={{ background: PANEL_BACKGROUND }}
    >
      <div className="flex items-center justify-between gap-4 border-b border-white/60 bg-white/65 px-6 py-4 backdrop-blur-xl">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#741cd9]">Perfil</p>
          <h3 className="text-lg font-semibold text-[#003322]">{displayName}</h3>
          <p className="text-sm text-[#003322]/70">Logado como: {email ?? 'não identificado'}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenEditProfile}
            className="inline-flex items-center justify-center rounded-full border border-[#741cd9]/18 bg-white/82 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#741cd9] shadow-sm hover:bg-white"
          >
            Editar perfil
          </button>
          {variant === 'modal' && (
            <button
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/60 text-[#003322] hover:bg-white/80"
              aria-label="Fechar perfil"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-5">
        <StudentDashboard profile={profile ? { ...profile, full_name: displayName } : profile} />

        <div className="mt-6 rounded-[28px] border border-white/80 bg-white/72 p-6 shadow-[0_24px_70px_rgba(6,16,51,0.09)] backdrop-blur-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#741cd9]">Sessão</p>
          <h3 className="mt-2 text-2xl font-bold text-[#061033]">Encerrar sessão</h3>
          <p className="mt-2 text-sm text-[#003322]/70">Use o botão abaixo para sair da sua conta com segurança.</p>
          <button
            onClick={onLogout}
            className="mt-5 inline-flex w-full items-center justify-center rounded-[18px] border border-[#741cd9]/30 bg-white px-4 py-4 text-sm font-semibold uppercase tracking-[0.24em] text-[#741cd9] shadow-sm transition hover:bg-[#f7f2ff]"
          >
            Sair da conta
          </button>
        </div>
      </div>

      {isEditProfileOpen && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#003322]/18 p-6 backdrop-blur-sm">
          <div className="w-full max-w-[620px] rounded-[32px] border border-white/75 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.98),rgba(248,250,252,0.96)_40%,rgba(241,233,251,0.92)_74%,rgba(233,249,242,0.92)_100%)] p-7 shadow-[0_28px_90px_rgba(6,16,51,0.18)] backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#741cd9]">Editar perfil</p>
                <h3 className="mt-2 text-2xl font-bold text-[#061033]">Atualize seu nome</h3>
                <p className="mt-2 text-sm text-[#003322]/70">Pop-up oficial da dashboard para personalização do perfil.</p>
              </div>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/75 text-[#003322]"
                aria-label="Fechar edição de perfil"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-7">
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7b8798]">Nome exibido</label>
                  <input
                    type="text"
                    value={draftName}
                    onChange={(event) => setDraftName(event.target.value)}
                    className="mt-2 w-full rounded-[20px] border border-white/85 bg-white/92 px-4 py-3.5 text-base text-[#061033] outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] focus:border-[#741cd9]/40"
                    placeholder="Seu nome completo"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7b8798]">E-mail</label>
                  <div className="mt-2 rounded-[20px] border border-white/85 bg-[#f8fbff] px-4 py-3.5 text-sm text-[#003322]/72">{email ?? 'n?o identificado'}</div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving || !draftName.trim()}
                    className="inline-flex items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#4d5d8f_0%,#5d36d1_45%,#31c9a3_100%)] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_18px_34px_rgba(93,54,209,0.22)] disabled:opacity-60"
                  >
                    {isSaving ? 'Salvando...' : 'Salvar altera??es'}
                  </button>
                  <button
                    onClick={() => setIsEditProfileOpen(false)}
                    className="inline-flex items-center justify-center rounded-[18px] border border-white/85 bg-white px-5 py-3.5 text-sm font-semibold text-[#061033] shadow-sm"
                  >
                    Cancelar
                  </button>
                  {saveMessage && <span className="text-sm text-[#003322]/72">{saveMessage}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (variant === 'dock') return panelContent;
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <button className="absolute inset-0 bg-[#003322]/40 backdrop-blur-sm" aria-label="Fechar perfil" onClick={onClose} />
      <div className="relative z-10 h-[94vh] w-[96vw] max-w-6xl">{panelContent}</div>
    </div>
  );
};

export default ProfilePanel;

