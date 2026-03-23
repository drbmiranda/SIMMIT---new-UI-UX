import React from 'react';
import { MedicalSubject } from '../types';
import { SIMMIT_COMMANDS } from '../constants';
import SimmitLogo from './SimmitLogo';

interface StudentWelcomeModalProps {
  onStart: () => void;
  subject: MedicalSubject;
}

const StudentWelcomeModal: React.FC<StudentWelcomeModalProps> = ({ onStart, subject }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#eaf0f7]/90 p-4 backdrop-blur-sm">
      <div className="simmit-card flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl p-4 text-[#003322] sm:max-h-[min(90vh,860px)] sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <SimmitLogo size="sm" subtitle={"Instru\u00e7\u00f5es de simula\u00e7\u00e3o: rumo \u00e0 soberania cl\u00ednica"} />
          <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#003322]">
            {subject}
          </span>
        </div>

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="space-y-4 text-sm text-[#003322]/70 sm:text-base">
            <p>{"Bem-vindo. Voc\u00ea est\u00e1 prestes a assumir o comando de um caso cl\u00ednico real. Sua miss\u00e3o \u00e9 diagnosticar e manejar o paciente utilizando racioc\u00ednio cl\u00ednico estrat\u00e9gico e agilidade t\u00e9cnica."}</p>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-[#003322]">{"Como operar seu PAINEL:"}</h3>
              <ul className="space-y-2 pl-4">
                <li><span className="font-semibold text-[#003322]">{"Atendimento h\u00edbrido:"}</span> {"converse naturalmente com o paciente para realizar a anamnese, mas utilize o PAINEL para todas as a\u00e7\u00f5es t\u00e9cnicas."}</li>
                <li><span className="font-semibold text-[#003322]">{"Exame f\u00edsico e sinais vitais:"}</span> {"acesse o painel para solicitar inspe\u00e7\u00e3o, palpa\u00e7\u00e3o, percuss\u00e3o, ausculta e monitoramento de sinais vitais em tempo real."}</li>
                <li><span className="font-semibold text-[#003322]">{"Investiga\u00e7\u00e3o diagn\u00f3stica:"}</span> {"utilize os menus de laborat\u00f3rio, imagem e exames funcionais para solicitar exames complementares espec\u00edficos."}</li>
                <li><span className="font-semibold text-[#003322]">{"Interven\u00e7\u00e3o e manejo:"}</span> {"no menu de procedimentos, execute a\u00e7\u00f5es cr\u00edticas como IOT, acessos vasculares ou medica\u00e7\u00f5es de suporte avan\u00e7ado."}</li>
                <li><span className="font-semibold text-[#003322]">{"Performance em tempo real:"}</span> {"sua pontua\u00e7\u00e3o oscila conforme a precis\u00e3o das condutas. Erros e acertos moldam seu dashboard final."}</li>
                <li><span className="font-semibold text-[#003322]">{"Encerramento obrigat\u00f3rio:"}</span> {"para receber seu feedback detalhado e salvar sua evolu\u00e7\u00e3o, encerre o caso pelo PAINEL com "}<span className="rounded bg-white/10 px-1 font-semibold">{SIMMIT_COMMANDS.closeCase}</span>.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-[#003322]/10 pt-4 sm:mt-6 sm:pt-6">
          <button onClick={onStart} className="simmit-button w-full rounded-xl px-8 py-3 text-sm font-semibold text-white sm:w-auto">{"Entendi, iniciar simula\u00e7\u00e3o"}</button>
        </div>
      </div>
    </div>
  );
};

export default StudentWelcomeModal;