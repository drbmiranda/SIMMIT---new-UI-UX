import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { UserStatus, Database } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface OnboardingFormProps {
    onComplete: () => void;
}

const ProgressBar: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    const steps = ['Perfil', 'Concluído'];
    return (
        <div className="progress-bar max-w-sm mx-auto">
            {steps.map((label, index) => {
                const stepIndex = index + 1;
                let statusClass = '';
                if (stepIndex < currentStep) statusClass = 'completed';
                if (stepIndex === currentStep) statusClass = 'active';

                return (
                    <div key={label} className={`progress-step ${statusClass}`}>
                        <div className="step-circle">
                            {stepIndex < currentStep ? '✓' : stepIndex}
                        </div>
                        <div className="step-label">{label}</div>
                    </div>
                );
            })}
        </div>
    );
};

const OnboardingForm: React.FC<OnboardingFormProps> = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [status, setStatus] = useState<UserStatus | null>(null);
    const [fullName, setFullName] = useState('');
    const [crm, setCrm] = useState('');
    const [registrationNumber, setRegistrationNumber] = useState('');
    const [university, setUniversity] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
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
            if (!user) throw new Error("Usuário não encontrado. Por favor, faça login novamente.");

            const profileData = {
                id: user.id,
                full_name: fullName,
                status: status!,
                crm: status === 'Médico(a)' ? crm : null,
                registration_number: status === 'Estudante' ? registrationNumber : null,
                university: status === 'Estudante' ? university : null,
            };

            const { error: insertError } = await supabase.from('profiles').insert([profileData]);

            if (insertError) throw insertError;

            setStep(2);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro ao salvar seu perfil.";
            setError(errorMessage);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="w-full max-w-md mx-auto animate-fade-in">
                        <h2 className="font-title text-3xl text-white mb-6 text-center">Seu Perfil Profissional</h2>
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-2">Nome Completo</label>
                                <input type="text" id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full p-3 bg-white/5 border border-white/10 backdrop-blur-xl rounded-md text-white focus:ring-2 focus:ring-teal-400 outline-none" placeholder="Seu nome completo" required />
                            </div>
                            <div className="status-selector">
                                <p className="text-sm font-medium text-slate-300 mb-2">Eu sou...</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <input type="radio" id="student" name="status" value="Estudante" checked={status === 'Estudante'} onChange={() => setStatus('Estudante')} />
                                        <label htmlFor="student">
                                            <h3 className="font-bold text-slate-100">🎓 Estudante</h3>
                                        </label>
                                    </div>
                                    <div>
                                        <input type="radio" id="doctor" name="status" value="Médico(a)" checked={status === 'Médico(a)'} onChange={() => setStatus('Médico(a)')} />
                                        <label htmlFor="doctor">
                                            <h3 className="font-bold text-slate-100">⚕️ Médico(a)</h3>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            {status === 'Estudante' && (
                                <div className="space-y-4 animate-fade-in">
                                    <div>
                                        <label htmlFor="registrationNumber" className="block text-sm font-medium text-slate-300 mb-2">Número de Matrícula</label>
                                        <input type="text" id="registrationNumber" value={registrationNumber} onChange={e => setRegistrationNumber(e.target.value)} className="w-full p-3 bg-white/5 border border-white/10 backdrop-blur-xl rounded-md text-white focus:ring-2 focus:ring-teal-400 outline-none" placeholder="Sua matrícula" required />
                                    </div>
                                    <div>
                                        <label htmlFor="university" className="block text-sm font-medium text-slate-300 mb-2">Nome da Faculdade</label>
                                        <input type="text" id="university" value={university} onChange={e => setUniversity(e.target.value)} className="w-full p-3 bg-white/5 border border-white/10 backdrop-blur-xl rounded-md text-white focus:ring-2 focus:ring-teal-400 outline-none" placeholder="Sua instituição de ensino" required />
                                    </div>
                                </div>
                            )}
                            {status === 'Médico(a)' && (
                                <div className="animate-fade-in">
                                    <label htmlFor="crm" className="block text-sm font-medium text-slate-300 mb-2">CRM (com estado)</label>
                                    <input type="text" id="crm" value={crm} onChange={e => setCrm(e.target.value)} className="w-full p-3 bg-white/5 border border-white/10 backdrop-blur-xl rounded-md text-white focus:ring-2 focus:ring-teal-400 outline-none" placeholder="Ex: 123456/SP" required />
                                </div>
                            )}
                        </div>
                         {error && <p className="mt-4 text-sm text-red-400 text-center">{error}</p>}
                        <div className="mt-8 flex justify-end items-center">
                            <button onClick={handleSaveProfile} disabled={loading || !isStepValid()} className="px-6 py-3 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-500 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                                {loading && <LoadingSpinner size="sm" color="text-white" />}<span className={loading ? 'ml-2' : ''}>Salvar e Continuar</span>
                            </button>
                        </div>
                    </div>
                );
            case 2:
                 return (
                    <div className="text-center animate-fade-in">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="font-title text-3xl sm:text-4xl text-white mb-4">Tudo Pronto!</h2>
                        <p className="text-slate-300 max-w-xl mx-auto mb-8">Seu perfil foi criado com sucesso. Agora você está pronto(a) para começar sua jornada de aprendizado e simulações.</p>
                        <button onClick={onComplete} className="px-8 py-3 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-500 transition shadow-lg">Ir para o App</button>
                    </div>
                );
            default:
                return null;
        }
    };
    
    return (
        <div className="h-full flex flex-col items-center justify-center p-4 sm:p-6">
            <ProgressBar currentStep={step} />
            {renderStep()}
        </div>
    );
};

export default OnboardingForm;