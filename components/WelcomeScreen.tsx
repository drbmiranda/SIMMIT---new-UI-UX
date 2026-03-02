import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../services/supabaseClient';
import LoadingSpinner from './LoadingSpinner';
import SimmitLogo from './SimmitLogo';

const WelcomeScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

  const handleGoogleLogin = async () => {
    if (!hasAcceptedTerms) {
      setError('Você precisa aceitar os Termos de Uso e a Política de Privacidade para continuar.');
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: (import.meta.env.DEV ? 'http://localhost:3000' : window.location.origin),
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center px-4 py-8 text-white sm:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="simmit-orb absolute -top-20 left-6 h-40 w-40 rounded-full" />
        <div className="simmit-orb orb-delay absolute bottom-10 right-10 h-48 w-48 rounded-full" />
        <div className="simmit-scanline absolute left-0 top-1/3 h-[2px] w-full" />
      </div>

      <div className="relative grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="simmit-hero relative overflow-hidden rounded-3xl px-6 py-10 sm:px-10 sm:py-12"
        >
          <SimmitLogo
            size="lg"
            showBadge
            subtitle="Treino clínico com foco em performance e evolução real."
          />

          <div className="mt-10 max-w-xl">
            <p className="text-lg text-[#003322] sm:text-xl">
              Treine raciocínio clínico com simulações intensas, feedback imediato e uma jornada de
              evolução que parece jogo.
            </p>
            <p className="mt-4 text-sm text-[#003322]/70">
              Pensado para mobile. Responsivo. Focado em performance. Pronto para o seu próximo plantão.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl  bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Simulação</p>
              <p className="mt-2 text-lg font-semibold text-white">Paciente reativo em tempo real</p>
              <p className="mt-2 text-sm text-[#003322]/70">
                Aprenda sob pressão com respostas clínicas realistas e progressão contínua.
              </p>
            </div>
            <div className="rounded-2xl  bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Progresso</p>
              <p className="mt-2 text-lg font-semibold text-white">Vitórias visuais, foco no acerto</p>
              <p className="mt-2 text-sm text-[#003322]/70">
                Cada decisão certa gera evolução, feedback e celebração.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-[#003322]/70">
            <span className="rounded-full  bg-white/5 px-3 py-1">IA responsiva</span>
            <span className="rounded-full  bg-white/5 px-3 py-1">Feedback guiado</span>
            <span className="rounded-full  bg-white/5 px-3 py-1">Modo emergência</span>
          </div>
        </motion.section>

        <motion.aside
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.05 }}
          className="simmit-card rounded-3xl px-6 py-8 sm:px-8"
        >
          <h2 className="text-2xl font-semibold text-white">Acesso seguro</h2>
          <p className="mt-2 text-sm text-[#003322]/70">
            Conecte sua conta para salvar progresso, registrar performance e liberar as simulações.
          </p>

          <button
            onClick={handleGoogleLogin}
            disabled={loading || !hasAcceptedTerms}
            className="simmit-button mt-6 flex w-full items-center justify-center gap-3 rounded-xl px-6 py-4 text-sm font-semibold text-white transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#741cd9]/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <LoadingSpinner size="sm" color="text-white" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 48 48">
                <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v8.51h12.8c-.57 3.39-2.21 6.22-4.78 8.12l7.63 5.91c4.47-4.14 7.07-10.12 7.07-17.99z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.63-5.91c-2.11 1.41-4.8 2.26-7.98 2.26-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
            )}
            <span>{loading ? 'Aguarde...' : 'Entrar com Google'}</span>
          </button>

          <div className="mt-6 rounded-2xl  bg-white/5 p-4">
            <h3 className="text-sm font-semibold text-white">Termos de Uso e Política de Privacidade</h3>
            <div className="mt-3 max-h-64 space-y-3 overflow-y-auto pr-3 text-xs leading-relaxed text-[#003322] no-scrollbar">
              <p>
                Bem-vindo ao SIMMIT, uma plataforma de simulação clínica mobile de propriedade da Healthtech BRASIL.
                Ao utilizar nossos serviços, você concorda com os termos abaixo descritos.
              </p>
              <div>
                <p className="font-semibold text-white">1. Objeto e Funcionalidade</p>
                <p>
                  O SIMMIT é uma ferramenta de suporte educacional baseada em Inteligência Artificial, destinada ao
                  treinamento de raciocínio clínico e tomada de decisão.
                </p>
                <p className="mt-2">
                  Finalidade Educativa: O SIMMIT é um simulador. Os resultados, diagnósticos e condutas sugeridos pela IA
                  dentro do ambiente de simulação têm caráter estritamente educativo e de treinamento.
                </p>
                <p className="mt-2">
                  Isenção de Responsabilidade Clínica: A plataforma não deve ser utilizada para diagnóstico ou tratamento
                  de pacientes reais. A decisão clínica final em ambientes reais é de responsabilidade exclusiva do
                  profissional médico devidamente registrado.
                </p>
              </div>
              <div>
                <p className="font-semibold text-white">2. Propriedade Intelectual e Bases de Dados</p>
                <p>
                  O SIMMIT utiliza algoritmos proprietários e bases de dados de terceiros (literatura médica, diretrizes e
                  protocolos científicos) para gerar cenários realistas.
                </p>
                <p className="mt-2">
                  A Healthtech BRASIL detém total controle sobre a curadoria e o processamento desses dados dentro da
                  plataforma.
                </p>
                <p className="mt-2">
                  O usuário não adquire qualquer direito de propriedade sobre o conteúdo, código ou lógica de
                  funcionamento do SIMMIT.
                </p>
              </div>
              <div>
                <p className="font-semibold text-white">3. Privacidade e Proteção de Dados (LGPD)</p>
                <p className="mt-2">
                  Coleta de Dados: Coletamos informações de cadastro (nome, e-mail, ocupação) e dados de performance
                  (erros, acertos e tempo de resposta) para fins de personalização e melhoria da IA.
                </p>
                <p className="mt-2">
                  Desidentificação: Caso ocorra qualquer compartilhamento de dados agregados com parceiros tecnológicos
                  ou de pesquisa para o aprimoramento da plataforma, todos os dados serão obrigatoriamente
                  desidentificados. Nenhuma informação pessoal sensível será compartilhada de forma identificável.
                </p>
                <p className="mt-2">
                  Gestão de Dados: O usuário tem total controle sobre seus dados. A qualquer momento, você pode solicitar
                  a alteração ou a remoção definitiva de seus dados da nossa base de dados enviando um e-mail para:
                  drbmiranda@healthtechbr.io.
                </p>
              </div>
              <div>
                <p className="font-semibold text-white">4. Condições do Programa Pioneer (Beta)</p>
                <p className="mt-2">
                  Durante a fase Beta (Pioneer), o acesso pode ser oferecido de forma gratuita por tempo limitado.
                </p>
                <p className="mt-2">
                  Encerramento do Acesso Gratuito: O período de gratuidade é temporário e será encerrado na data estipulada
                  pela administração (previsto para a Quarta-feira de Cinzas). Após este período, a continuidade do acesso
                  estará sujeita aos planos de assinatura vigentes.
                </p>
                <p className="mt-2">
                  Estabilidade: Por se tratar de uma versão Beta, a plataforma pode passar por manutenções e ajustes
                  técnicos sem aviso prévio.
                </p>
              </div>
              <div>
                <p className="font-semibold text-white">5. Responsabilidades do Usuário</p>
                <p className="mt-2">Ao utilizar o SIMMIT, o usuário compromete-se a:</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Não realizar engenharia reversa na plataforma.</li>
                  <li>Não utilizar robôs ou scripts para extração de dados.</li>
                  <li>Fornecer informações verídicas no cadastro.</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-white">6. Foro</p>
                <p className="mt-2">
                  Para dirimir quaisquer controvérsias oriundas deste termo, as partes elegem o foro da Comarca de São
                  Paulo - SP.
                </p>
              </div>
            </div>
          </div>

          <label className="mt-4 flex items-start gap-3 text-left text-xs text-[#003322]">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-white/30 bg-white/10 text-[#741cd9] focus:ring-2 focus:ring-[#741cd9]/60"
              checked={hasAcceptedTerms}
              onChange={(event) => {
                setHasAcceptedTerms(event.target.checked);
                if (event.target.checked) {
                  setError(null);
                }
              }}
            />
            <span>
              Li e aceito os Termos de Uso e a Política de Privacidade do SIMMIT.
            </span>
          </label>

          {error && <p className="mt-4 text-xs text-red-300">{`Erro: ${error}`}</p>}
        </motion.aside>
      </div>
    </div>
  );
};

export default WelcomeScreen;

