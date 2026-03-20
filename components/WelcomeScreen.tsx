import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { getRuntimeEnv } from '../services/runtimeEnv';
import LoadingSpinner from './LoadingSpinner';
import loginArt from '../design-SIMMIT/MobileLOGIN.png';
import logoMark from '../design-SIMMIT/logo.svg';
import arrowDownIcon from '../design-SIMMIT/arrow-down-01-round.svg';

const WelcomeScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { VITE_APP_URL } = getRuntimeEnv();
  const productionAppUrl = (VITE_APP_URL || 'https://medsim-beta-775616705724.us-central1.run.app').replace(/\/$/, '');
  const [error, setError] = useState<string | null>(null);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);

  const handleGoogleLogin = async () => {
    if (!hasAcceptedTerms) {
      setError('Você precisa aceitar os Termos de Uso e a Política de Privacidade para continuar.');
      return;
    }

    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: import.meta.env.DEV ? 'http://localhost:3000' : productionAppUrl,
      },
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] overflow-hidden">
      {isPolicyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm" onClick={() => setIsPolicyModalOpen(false)}>
          <div className="w-full max-w-xl rounded-3xl border border-white/70 bg-white p-6 text-[#003322] shadow-[0_24px_64px_rgba(5,9,24,0.35)]" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Termos de uso e privacidade">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#741cd9]/80">Documentos legais</p>
                <h2 className="mt-2 text-xl font-bold text-slate-900">Termos de uso e política de privacidade</h2>
              </div>
              <button onClick={() => setIsPolicyModalOpen(false)} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600" aria-label="Fechar">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="mt-4 max-h-[50vh] space-y-3 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p>O SIMMIT é uma plataforma de simulação clínica com finalidade educacional.</p>
              <p>As respostas geradas por IA não substituem conduta médica para pacientes reais.</p>
              <p>Coletamos dados de conta e desempenho para personalizar a experiência, em conformidade com a LGPD.</p>
              <p>Você pode solicitar revisão, exportação ou exclusão dos seus dados mediante contato com a equipe da plataforma.</p>
            </div>

            <div className="mt-4 flex justify-end">
              <button onClick={() => setIsPolicyModalOpen(false)} className="rounded-xl bg-[#741CD9] px-4 py-2 text-sm font-semibold text-white">Entendi</button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto grid min-h-[100dvh] w-full max-w-[1280px] grid-cols-1 bg-[#f5f5f5] md:grid-cols-[1.35fr_1fr]">
        <section className="relative hidden overflow-hidden md:block">
          <img src={loginArt} alt="SIMMIT login" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(30,27,75,0.55),rgba(49,46,129,0.35),rgba(34,211,238,0.3))]" />
          <div className="relative flex h-full flex-col justify-between p-8 lg:p-10">
            <img src={logoMark} alt="SIMMIT" className="h-12 w-auto" />
            <div className="rounded-3xl border border-white/30 bg-slate-900/40 p-6 text-white backdrop-blur-lg">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/80">Você sabia?</p>
              <h2 className="mt-2 font-title text-3xl">SIMMIT AI QUEST</h2>
              <p className="mt-3 max-w-xl text-sm text-white/90 lg:text-base">Estudantes de medicina que treinam com simulação de forma frequente tendem a melhorar a confiança e o raciocínio clínico estruturado para estações de OSCE.</p>
            </div>
          </div>
        </section>

        <section className="relative flex items-center justify-center px-4 py-8 sm:px-6">
          <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white/92 p-6 shadow-[0_24px_64px_rgba(5,9,24,0.22)] backdrop-blur-lg sm:p-7">
            <div className="flex items-center justify-between gap-3"><img src={logoMark} alt="SIMMIT" className="h-9 w-auto md:hidden" /></div>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Bem-vindo ao SIMMIT AI QUEST</h1>
            <p className="mt-2 text-sm text-slate-600">Entre com Google para salvar progresso, pontuação e histórico de simulações.</p>

            <button onClick={handleGoogleLogin} disabled={loading || !hasAcceptedTerms} className="mt-5 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-[#741CD9] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(116,28,217,0.36)] focus:outline-none focus:ring-4 focus:ring-[#741cd9]/30 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? <LoadingSpinner size="sm" color="text-white" /> : (
                <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v8.51h12.8c-.57 3.39-2.21 6.22-4.78 8.12l7.63 5.91c4.47-4.14 7.07-10.12 7.07-17.99z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.63-5.91c-2.11 1.41-4.8 2.26-7.98 2.26-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
              )}
              <span>{loading ? 'Entrando...' : 'Entrar com Google'}</span>
            </button>

            <button type="button" onClick={() => setIsPolicyModalOpen(true)} className="mt-4 inline-flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/85 px-4 py-3 text-sm font-semibold text-slate-700">
              <span>Ver termos de uso e privacidade</span>
              <img src={arrowDownIcon} alt="" className="h-4 w-4" />
            </button>

            <label className="mt-4 flex items-start gap-3 text-left text-xs text-slate-700">
              <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#741cd9] focus:ring-2 focus:ring-[#741cd9]/50" checked={hasAcceptedTerms} onChange={(event) => { setHasAcceptedTerms(event.target.checked); if (event.target.checked) setError(null); }} />
              <span>Li e aceito os <button type="button" onClick={() => setIsPolicyModalOpen(true)} className="font-semibold text-[#741cd9] underline">termos de uso e política de privacidade</button> do SIMMIT.</span>
            </label>

            {error && <p className="mt-3 text-xs font-medium text-red-600">Erro: {error}</p>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default WelcomeScreen;

