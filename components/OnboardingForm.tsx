import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { UserStatus } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface OnboardingFormProps {
  onComplete: () => void;
  initialFullName?: string;
}

const STEPS = ['Perfil', 'Concluído'];

const ProgressBar: React.FC<{ currentStep: number }> = ({ currentStep }) => (
  <div className="mx-auto flex w-full max-w-md items-center justify-center gap-4">
    {STEPS.map((label, index) => {
      const stepIndex = index + 1;
      const isActive = stepIndex === currentStep;
      const isCompleted = stepIndex < currentStep;

      return (
        <div key={label} className="flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold shadow-[0_10px_30px_rgba(116,28,217,0.18)] ${isCompleted ? 'border-[#18cf91] bg-[#18cf91] text-white' : isActive ? 'border-white/80 bg-white/78 text-[#741cd9]' : 'border-white/40 bg-white/35 text-[#7b8798]'}`}>
            {isCompleted ? '✓' : stepIndex}
          </div>
          <span className={`text-sm font-semibold ${isActive ? 'text-[#061033]' : 'text-[#6f7d94]'}`}>{label}</span>
          {index < STEPS.length - 1 && <div className="hidden h-px w-10 bg-white/70 sm:block" />}
        </div>
      );
    })}
  </div>
);

const OnboardingForm: React.FC<OnboardingFormProps> = ({ onComplete, initialFullName }) => {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<UserStatus | null>(null);
  const [fullName, setFullName] = useState(initialFullName?.trim() || '');
  const [crm, setCrm] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [university, setUniversity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialFullName?.trim()) {
      setFullName((prev) => prev.trim() || initialFullName.trim());
    }
  }, [initialFullName]);

  const isStepValid = () => {
    if (!fullName.trim() || !status) return false;
    if (status === 'Médico(a)' && !crm.trim()) return false;
    if (status === 'Estudante' && (!registrationNumber.trim() || !university.trim())) return false;
    return true;
  };

  const handleSaveProfile = async () => {
    if (!isStepValid()) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não encontrado. Faça login novamente.');

      const profileData = {
        id: user.id,
        full_name: fullName.trim(),
        status: status!,
        crm: status === 'Médico(a)' ? crm.trim() : null,
        registration_number: status === 'Estudante' ? registrationNumber.trim() : null,
        university: status === 'Estudante' ? university.trim() : null,
      };

      const { error: insertError } = await supabase.from('profiles').insert([profileData]);
      if (insertError) throw insertError;

      setStep(2);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro ao salvar seu perfil.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-3xl rounded-[36px] border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.97),rgba(248,250,252,0.95)_42%,rgba(237,226,252,0.9)_74%,rgba(223,248,237,0.92)_100%)] p-6 text-[#003322] shadow-[0_30px_80px_rgba(116,28,217,0.18)] backdrop-blur-xl sm:p-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#741cd9]">Primeiro acesso</p>
          <h1 className="mt-3 text-3xl font-semibold text-[#061033] sm:text-4xl">Configure seu perfil clínico</h1>
          <p className="mt-3 text-sm leading-7 text-[#526179] sm:text-base">Complete sua triagem inicial com um layout centralizado, vítreo e pronto para o Demo Day.</p>
        </div>

        <div className="mt-8"><ProgressBar currentStep={step} /></div>

        {step === 1 && (
          <div className="mx-auto mt-8 w-full max-w-xl rounded-[32px] border border-white/80 bg-white/62 p-6 shadow-[0_18px_50px_rgba(6,16,51,0.08)] backdrop-blur-xl sm:p-7">
            <div className="space-y-5">
              <div>
                <label htmlFor="fullName" className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7b8798]">Nome completo</label>
                <input type="text" id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-2 w-full rounded-[20px] border border-white/85 bg-white/92 px-4 py-3.5 text-base text-[#061033] outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] focus:border-[#741cd9]/40" placeholder="Seu nome completo" required />
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7b8798]">Como você se identifica?</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <button type="button" onClick={() => setStatus('Estudante')} className={`rounded-[24px] border px-5 py-4 text-left transition ${status === 'Estudante' ? 'border-[#741cd9]/35 bg-white text-[#061033] shadow-[0_16px_34px_rgba(116,28,217,0.12)]' : 'border-white/70 bg-white/56 text-[#526179]'}`}>
                    <p className="text-sm font-semibold">Estudante</p>
                    <p className="mt-1 text-sm text-inherit/80">Informe matrícula e faculdade.</p>
                  </button>
                  <button type="button" onClick={() => setStatus('Médico(a)')} className={`rounded-[24px] border px-5 py-4 text-left transition ${status === 'Médico(a)' ? 'border-[#18cf91]/40 bg-white text-[#061033] shadow-[0_16px_34px_rgba(24,207,145,0.12)]' : 'border-white/70 bg-white/56 text-[#526179]'}`}>
                    <p className="text-sm font-semibold">Médico(a)</p>
                    <p className="mt-1 text-sm text-inherit/80">Informe CRM com o estado.</p>
                  </button>
                </div>
              </div>

              {status === 'Estudante' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="registrationNumber" className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7b8798]">Número de matrícula</label>
                    <input type="text" id="registrationNumber" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} className="mt-2 w-full rounded-[20px] border border-white/85 bg-white/92 px-4 py-3.5 text-base text-[#061033] outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] focus:border-[#741cd9]/40" placeholder="Sua matrícula" required />
                  </div>
                  <div>
                    <label htmlFor="university" className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7b8798]">Faculdade</label>
                    <input type="text" id="university" value={university} onChange={(e) => setUniversity(e.target.value)} className="mt-2 w-full rounded-[20px] border border-white/85 bg-white/92 px-4 py-3.5 text-base text-[#061033] outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] focus:border-[#741cd9]/40" placeholder="Sua instituição de ensino" required />
                  </div>
                </div>
              )}

              {status === 'Médico(a)' && (
                <div>
                  <label htmlFor="crm" className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7b8798]">CRM</label>
                  <input type="text" id="crm" value={crm} onChange={(e) => setCrm(e.target.value)} className="mt-2 w-full rounded-[20px] border border-white/85 bg-white/92 px-4 py-3.5 text-base text-[#061033] outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] focus:border-[#741cd9]/40" placeholder="Ex.: 123456/SP" required />
                </div>
              )}
            </div>

            {error && <p className="mt-5 rounded-[18px] bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

            <div className="mt-8 flex justify-end">
              <button onClick={handleSaveProfile} disabled={loading || !isStepValid()} className="inline-flex items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#4d5d8f_0%,#5d36d1_45%,#31c9a3_100%)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_34px_rgba(93,54,209,0.22)] disabled:opacity-60">
                {loading && <LoadingSpinner size="sm" color="text-white" />}
                <span className={loading ? 'ml-2' : ''}>Salvar e continuar</span>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mx-auto mt-8 max-w-xl rounded-[32px] border border-white/80 bg-white/62 p-8 text-center shadow-[0_18px_50px_rgba(6,16,51,0.08)] backdrop-blur-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(135deg,#dff8ee,#efe5ff)] text-2xl shadow-[0_16px_34px_rgba(116,28,217,0.12)]">✓</div>
            <h2 className="mt-5 text-3xl font-semibold text-[#061033]">Tudo pronto</h2>
            <p className="mt-3 text-sm leading-7 text-[#526179]">Seu perfil está pronto. Agora começa a experiência clínica que separa curiosidade de excelência. No SIMMIT, você atende pacientes simulados com a IA de simulação clínica mais avançada do mundo e treina raciocínio, comunicação e tomada de decisão em um nível que parece real. Entre agora e sinta como é evoluir com uma plataforma feita para quem quer performar como médico de excelência.</p>
            <button onClick={onComplete} className="mt-7 inline-flex items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#4d5d8f_0%,#5d36d1_45%,#31c9a3_100%)] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_18px_34px_rgba(93,54,209,0.22)]">Ir para o app</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingForm;
