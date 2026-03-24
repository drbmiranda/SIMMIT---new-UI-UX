
import { MedicalSubject, MultipleChoiceQuestion } from './types';

export const APP_TITLE = "SIMMIT AI QUEST";

export const MEDICAL_SUBJECTS: MedicalSubject[] = [
  'Cl\u00ednica M\u00e9dica',
  'Cl\u00ednica Cir\u00fargica',
  'Medicina Preventiva',
  'Pediatria',
  'Ginecologia e Obstetr\u00edcia',
];

export const SIMMIT_COMMANDS = {
  examGeneral: 'SIMMIT ESTADO GERAL',
  examVitals: 'SIMMIT SINAIS VITAIS',
  examInspection: 'SIMMIT INSPE\u00c7\u00c3O',
  examPalpation: 'SIMMIT PALPA\u00c7\u00c3O',
  examPercussion: 'SIMMIT PERCUSS\u00c3O',
  examAuscultation: 'SIMMIT AUSCULTA',
  examPhysical: 'SIMMIT EXAME F\u00cdSICO',
  labResults: 'SIMMIT RESULTADOS DE EXAMES LABORATORIAIS',
  imageResults: 'SIMMIT RESULTADOS DE EXAMES DE IMAGEM',
  closeCase: 'SIMMIT ENCERRAR CASO',
} as const;

// Usado pelo fluxo do aluno para obter os critÃ©rios de avaliaÃ§Ã£o para o feedback.
// Usado para gerar casos OSCE em JSON.
export const SYSTEM_INSTRUCTION_TEACHER_JSON = `Voce e um gerador de estacoes de simulacao medica para Exames Clinicos Objetivos Estruturados (OSCE).
Sua unica funcao e criar cenarios clinicos dentro de uma especialidade especifica e retornar como um objeto JSON.

**REGRAS ESTRITAS:**
1. **NAO** escreva nenhum texto antes ou depois do objeto JSON. Sua resposta deve ser **APENAS** o JSON.
2. O JSON deve seguir exatamente esta estrutura:
   {
     "cenarioDoAluno": "Descricao concisa da situacao, queixa principal e sinais vitais.",
     "tarefasDoAluno": ["Array de strings com as tarefas do medico, como 'Realizar anamnese focada.'"],
     "instrucoesDoPaciente": "Descricao detalhada para o paciente simulado (IA), incluindo personalidade, historico e respostas.",
     "criteriosDeAvaliacao": ["Array de strings com o checklist de avaliacao, como 'Apresentou-se adequadamente?'"],
     "fichaDoPaciente": {
       "nome": "Nome completo do paciente exatamente como deve aparecer na ficha.",
       "idade": 45,
       "sexo": "Masculino ou Feminino",
       "queixaPrincipal": "Primeira queixa apresentada na abertura do caso, em uma frase curta e fixa."
     }
   }
3. Ao receber uma solicitacao de modificacao, gere um **NOVO** objeto JSON completo com a modificacao incorporada.
4. Garanta coerencia clinica e demografica:
   - Obstetricia/Ginecologia: paciente do sexo feminino em idade fertil ou gestante.
   - Pediatria: nome, idade e linguagem compativeis com crianca ou adolescente.
   - Clinica/Cirurgia/Preventiva: perfil condizente com a patologia.
5. A fichaDoPaciente e obrigatoria e deve ser a fonte de verdade da ficha clinica.
6. Garanta consistencia absoluta entre fichaDoPaciente, cenarioDoAluno e instrucoesDoPaciente:
   - o nome deve ser identico nos tres campos
   - a idade deve ser a mesma nos tres campos
   - o sexo deve ser coerente com o caso inteiro
   - queixaPrincipal deve resumir a primeira queixa apresentada na abertura do caso e nao pode mudar depois

Gere o primeiro caso quando solicitado.`;

export const SYSTEM_INSTRUCTION_STUDENT = `Voce e uma IA de simulacao medica atuando como Paciente Simulado (PS) em um cenario OSCE gamificado.

**REGRAS ESTRITAS:**
1. **PERSONA DO PACIENTE:** Voce nao deve inventar um caso clinico. Aguarde as instrucoes detalhadas sobre sua persona, historico e forma de resposta.
2. **NUNCA SAIA DO PERSONAGEM:** Voce e sempre o paciente. Nao assuma o papel de medico, tutor, professor ou avaliador fora das tags de pontuacao. Se o medico pedir diagnostico, conduta, explicacoes tecnicas ou "a resposta", diga que nao sabe e que isso deve ser decidido pelo medico responsavel.
3. **INTERACAO REALISTA:** Apos receber as instrucoes, atue como o paciente. Responda as perguntas e intervencoes de forma realista e nao forneca informacoes nao solicitadas.
4. **GAMIFICACAO E PONTUACAO:**
   - Para cada resposta, avalie a ultima acao do medico com base no checklist de avaliacao recebido.
   - Anexe uma tag de pontuacao obrigatoria ao final de sua resposta no formato: [PONTUACAO: <pontos>, <justificativa>].
   - Use valores positivos para acoes corretas, negativos para erros ou omissoes e 0 para acoes neutras.
5. **RESULTADOS DE EXAMES:** Quando o medico solicitar um exame, responda como o paciente consentindo e, imediatamente depois, anexe a tag [RESULTADO_EXAME: <descricao detalhada do resultado>].
6. **FIM DO CASO:** Quando o medico concluir as tarefas principais ou digitar "SIMMIT ENCERRAR CASO", declare o fim da simulacao com a frase: "O caso esta concluido."`;

export const FEEDBACK_PROMPT_TEMPLATE = (chatHistory: string, osceCriteria: string) => `
VocÃª Ã© um preceptor de medicina avaliando um(a) mÃ©dico(a) em uma simulaÃ§Ã£o OSCE.

**Tarefa:**
Com base no **CHECKLIST DE AVALIAÃ‡ÃƒO OSCE** e na **TRANSCRIÃ‡ÃƒO DA SIMULAÃ‡ÃƒO** fornecidos abaixo, forneÃ§a uma avaliaÃ§Ã£o de desempenho.

**CHECKLIST DE AVALIAÃ‡ÃƒO OSCE:**
${osceCriteria}

**TRANSCRIÃ‡ÃƒO DA SIMULAÃ‡ÃƒO:**
${chatHistory}

**Formato da Resposta:**
Responda **APENAS** com um objeto JSON vÃ¡lido, sem nenhum outro texto antes ou depois. O JSON deve ter a seguinte estrutura:
{
  "feedback": "Escreva aqui uma anÃ¡lise detalhada e construtiva. Comece com os pontos fortes e depois aponte as Ã¡reas para melhoria, citando exemplos da transcriÃ§Ã£o."
}
`;

export const INITIAL_PLAYER_MESSAGE = "Iniciar novo caso.";
export const IMAGE_PROMPT_REGEX = /\[IMAGE_PROMPT:\s*(.*?)\s*\]/i;
export const EXAM_RESULT_REGEX = /\[RESULTADO_EXAME:\s*([\s\S]*?)\s*\]/i;
// Corrected regex to handle positive signs (+) and added 'g' flag
export const SCORE_CHANGE_REGEX = /\[PONTUACAO:\s*([+-]?\d+),\s*([^\]]+)\]/gi;
export const CASE_FINISHED_REGEX = /O caso estÃ¡ concluÃ­do/i;
export const OSCE_CRITERIA_REGEX = /###\s*\[CRIT[^\]]*CHECKLIST\]\s*([\s\S]*)/i;
export const STUDENT_SCENARIO_REGEX = /###\s*\[CEN[^\]]*ALUNO\]\s*([\s\S]*?)(?=###|$)/i;
export const PATIENT_INSTRUCTIONS_REGEX = /###\s*\[INSTR[^\]]*PACIENTE SIMULADO\]\s*([\s\S]*?)(?=###|$)/i;

export const CLINICA_MEDICA_CASE_TITLES = [
  "Febre, rigidez de nuca e rebaixamento do nÃ­vel de consciÃªncia em adulto jovem",
  "Idoso com confusÃ£o mental e febre sem sinais menÃ­ngeos evidentes",
  "Homem imunossuprimido com cefaleia persistente e lÃ­quor turvo",
  "Paciente HIV+ com sinais neurolÃ³gicos focais e lesÃ£o ocupante de espaÃ§o",
  "Adolescente com meningite bacteriana confirmada por punÃ§Ã£o lombar",
  "Mulher com lesÃ£o cutÃ¢nea herpÃ©tica e sintomas neurolÃ³gicos agudos",
  "Homem de 40 anos com febre, convulsÃ£o e imagem com edema temporal",
  "Paciente com febre prolongada e dor lombar - suspeita de abscesso epidural",
  "Meningite por criptococo em paciente com Aids avanÃ§ada",
  "Jovem com meningite viral leve e contato recente com quadro gripal",
  "Meningite por Listeria em idoso com comorbidades",
  "Tuberculose menÃ­ngea em paciente de Ã¡rea endÃªmica",
  "Jovem com febre e dÃ©ficit motor sÃºbito - suspeita de encefalite autoimune",
  "EpisÃ³dios convulsivos e delÃ­rio em paciente com herpes simples tipo 1",
  "Paciente alcoÃ³latra com infecÃ§Ã£o de SNC e abscesso cerebral",
  "Meningoencefalite em paciente com histÃ³rico de camping e exposiÃ§Ã£o a carrapato",
  "Mulher jovem com cefaleia pulsÃ¡til unilateral associada a nÃ¡useas",
  "Homem com cefaleia sÃºbita e intensa - pior dor da vida",
  "Idosa com cefaleia crÃ´nica e alteraÃ§Ã£o visual - suspeita de arterite temporal",
  "Estudante com cefaleia tensional recorrente em perÃ­odos de estresse",
  "Homem com cefaleia e ptose palpebral - investigar lesÃ£o expansiva",
  "Paciente com cefaleia matinal e vÃ´mitos - hipertensÃ£o intracraniana?",
  "Mulher com histÃ³rico de enxaqueca que apresenta padrÃ£o de dor novo",
  "Cefaleia em salvas em jovem fumante - dor orbitÃ¡ria intensa",
  "Cefaleia em paciente HIV+ com sinais menÃ­ngeos",
  "Cefaleia refrÃ¡tÃ¡ria em paciente com hipertensÃ£o arterial descontrolada",
  "Paciente com sinusite frontal e cefaleia frontal progressiva",
  "Cefaleia apÃ³s punÃ§Ã£o lombar - hipotensÃ£o liquÃ³rica",
  "Cefaleia sÃºbita apÃ³s esforÃ§o fÃ­sico intenso - suspeita de dissecÃ§Ã£o arterial",
  "Idoso com febre, tosse produtiva e infiltrado em lobo inferior",
  "Paciente com dispneia sÃºbita e dor pleurÃ­tica - pneumonia ou TEP?",
  "Homem tabagista com febre e consolidaÃ§Ã£o lobar no raio-X",
  "Mulher com pneumonia e confusÃ£o mental - CURB-65 elevado",
  "Jovem com quadro gripal e evoluÃ§Ã£o para pneumonia bacteriana",
  "Paciente com comorbidades e pneumonia com derrame pleural",
  "Paciente internado com piora clÃ­nica apÃ³s antibioticoterapia inicial",
  "Mulher com pneumonia de repetiÃ§Ã£o - investigar imunodeficiÃªncia",
  "Homem em situaÃ§Ã£o de rua com pneumonia por Klebsiella pneumoniae",
  "Ferimento com objeto contaminado - indicaÃ§Ã£o de imunoglobulina para tÃ©tano?",
  "Acidente com material pÃ©rfuro-cortante - esquema para HIV e HBV",
  "ExposiÃ§Ã£o ocupacional a paciente com tuberculose bacilÃ­fera",
  "Profissional de saÃºde com contato ocular com secreÃ§Ãµes - conduta imediata",
  "Homem agredido por animal nÃ£o vacinado - protocolo antirrÃ¡bico",
  "Mulher vÃ­tima de violÃªncia sexual - imunizaÃ§Ãµes e profilaxias indicadas",
  "Paciente com contato Ã­ntimo recente com caso confirmado de hepatite A",
  "Acidente com agulha em paciente HBsAg+ - esquema vacinal incompleto",
  "Pessoa que sofreu mordida humana profunda - cobertura antibiÃ³tica e vacinaÃ§Ã£o",
  "Febre, dor e edema em joelho direito de inÃ­cio sÃºbito",
  "Homem com gota prÃ©via e nova dor articular - diferencial com artrite sÃ©ptica",
  "Paciente imunossuprimido com monoartrite dolorosa e sinais inflamatÃ³rios",
  "Mulher com prÃ³tese de quadril e febre - infecÃ§Ã£o articular protÃ©tica",
  "Artrite sÃ©ptica em usuÃ¡rio de drogas injetÃ¡veis com febre alta",
  "Dor articular e sinais flogÃ­sticos apÃ³s procedimento ortopÃ©dico recente",
  "Artrite sÃ©ptica poliarticular em paciente com lÃºpus",
  "Paciente idoso com dor em ombro, febre e rigidez - sepse articular atÃ­pica",
  "Jovem com artrite sÃ©ptica gonocÃ³cica confirmada",
  "Homem inconsciente apÃ³s ingestÃ£o de benzodiazepÃ­nico",
  "Adolescente com intoxicaÃ§Ã£o alcoÃ³lica aguda e hipoglicemia",
  "IngestÃ£o acidental de paracetamol em dose tÃ³xica",
  "IntoxicaÃ§Ã£o por organofosforado em trabalhador rural",
  "Idoso com intoxicaÃ§Ã£o digitÃ¡lica - bradicardia e nÃ¡useas",
  "Tentativa de suicÃ­dio com antidepressivos tricÃ­clicos - sinais de cardiotoxicidade",
  "InalaÃ§Ã£o de monÃ³xido de carbono em ambiente fechado",
  "Mulher com uso excessivo de AINEs e insuficiÃªncia renal aguda",
  "IntoxicaÃ§Ã£o por cocaÃ­na com dor torÃ¡cica e arritmia",
  "Taquicardia supraventricular em paciente jovem com palpitaÃ§Ãµes",
  "FibrilaÃ§Ã£o atrial em paciente com hipertireoidismo nÃ£o tratado",
  "Flutter atrial em paciente com doenÃ§a pulmonar crÃ´nica",
  "Taquicardia ventricular em paciente pÃ³s-infarto",
  "Paciente com sÃ­ndrome de Wolff-Parkinson-White e prÃ©-excitaÃ§Ã£o",
  "Arritmia com instabilidade hemodinÃ¢mica em pronto-socorro",
  "Taquicardia sinusal persistente - avaliar causas secundÃ¡rias",
  "Paciente com FA recÃ©m-diagnosticada e risco tromboembÃ³lico alto",
  "TV polimÃ³rfica associada a uso de medicamentos QT-prolongadores",
  "Paciente com infecÃ§Ã£o urinÃ¡ria complicada em uso de antibiÃ³tico oral",
  "Homem com pneumonia e falha ao tratamento inicial empÃ­rico",
  "Caso de celulite com expansÃ£o rÃ¡pida e critÃ©rios de internaÃ§Ã£o",
  "InfecÃ§Ã£o intra-abdominal pÃ³s-operatÃ³ria - seleÃ§Ã£o de antibioticoterapia",
  "Uso racional de antibiÃ³ticos em paciente com sepse urinÃ¡ria",
  "Homem com osteomielite crÃ´nica em reabilitaÃ§Ã£o ortopÃ©dica",
  "Paciente alÃ©rgico Ã  penicilina com infecÃ§Ã£o estreptocÃ³cica",
  "Mulher com pielonefrite e bacteremia - esquema antibiÃ³tico adequado",
  "Paciente com infecÃ§Ã£o hospitalar por bactÃ©ria multirresistente",
  "DÃ©ficit motor sÃºbito em hemicorpo direito e disartria",
  "Idoso com AVE isquÃªmico agudo e janela para trombÃ³lise",
  "AVE hemorrÃ¡gico em paciente com hipertensÃ£o nÃ£o controlada",
  "Paciente jovem com AVE e investigaÃ§Ã£o de trombofilia",
  "Mulher com AVC isquÃªmico apÃ³s uso de contraceptivo hormonal",
  "Paciente com episÃ³dio isquÃªmico transitÃ³rio (AIT) e fatores de risco cardiovascular",
  "Rebaixamento sÃºbito do nÃ­vel de consciÃªncia em paciente com anticoagulaÃ§Ã£o",
  "Paciente com AVE em territÃ³rio vertebrobasilar e ataxia",
  "Sequela motora apÃ³s AVC - encaminhamento para reabilitaÃ§Ã£o precoce",
  "Bradicardia sinusal assintomÃ¡tica em atleta de alta performance",
  "Bloqueio atrioventricular de 2Âº grau sintomÃ¡tico",
  "Bradicardia extrema em paciente idoso com sÃ­ncope",
  "Uso de betabloqueador em paciente com bradicardia e hipotensÃ£o",
  "Paciente com marca-passo e episÃ³dios de tontura",
  "Bloqueio cardÃ­aco completo em paciente com lÃºpus",
];

export const PEDIATRIA_CASE_TITLES = [
  "RecÃ©m-nascido com icterÃ­cia prolongada em aleitamento exclusivo",
  "MÃ£e com mastite puerperal e dÃºvidas sobre manter a amamentaÃ§Ã£o",
  "Lactente com perda de peso nas primeiras semanas de vida",
  "Dor e fissuras mamilares em mÃ£e primÃ­para durante as mamadas",
  "Aleitamento materno exclusivo e evacuaÃ§Ãµes explosivas: normalidade ou alergia?",
  "Lactente de 2 meses com esquema vacinal atrasado",
  "Escolar com histÃ³rico de contato com sarampo e vacinaÃ§Ã£o incompleta",
  "Febre alta e dor no local apÃ³s aplicaÃ§Ã£o da DTP",
  "Adolescente com esquema vacinal incompleto para hepatite B",
  "ReaÃ§Ã£o alÃ©rgica cutÃ¢nea apÃ³s aplicaÃ§Ã£o de trÃ­plice viral",
  "MÃ£e com dÃºvidas sobre seguranÃ§a da vacina contra HPV",
  "Escolar sem reforÃ§o de tÃ©tano apÃ³s corte com objeto enferrujado",
  "Lactente prematuro e dÃºvidas sobre calendÃ¡rio vacinal",
  "Migrante venezuelano sem registro vacinal",
  "Lactente HIV positivo e esquema vacinal adaptado",
  "CrianÃ§a com convulsÃ£o febril apÃ³s vacina",
  "Adolescente com recusa familiar Ã  vacinaÃ§Ã£o contra COVID-19",
  "RecÃ©m-nascido filho de mÃ£e HBsAg positiva - conduta ao nascimento",
  "PopulaÃ§Ã£o ribeirinha com baixa cobertura vacinal",
  "Escolar com varicela leve apÃ³s contato vacinal recente",
  "ReforÃ§o da vacina trÃ­plice viral em adolescente com surto na escola",
  "Escolar com reaÃ§Ãµes adversas apÃ³s BCG - investigar complicaÃ§Ãµes",
  "PrÃ©-escolar com esquema vacinal irregular devido a pandemia",
  "Diarreia aguda com sinais de desidrataÃ§Ã£o em lactente de 8 meses",
  "VÃ´mitos incoercÃ­veis e sonolÃªncia em crianÃ§a de 3 anos",
  "ConstipaÃ§Ã£o intestinal crÃ´nica em prÃ©-escolar",
  "Dor abdominal difusa e fezes mucossanguinolentas",
  "Escolar com diarreia crÃ´nica e baixo ganho ponderal",
  "Diarreia apÃ³s uso de antibiÃ³ticos - suspeita de colite",
  "PrÃ©-escolar com vÃ´mitos apÃ³s introduÃ§Ã£o alimentar",
  "DesidrataÃ§Ã£o hipertÃ´nica em lactente com febre e diarreia",
  "Lactente com flatulÃªncia e distensÃ£o apÃ³s fÃ³rmulas",
  "Adolescente com diarreia aquosa e histÃ³rico de viagem recente",
  "RecÃ©m-nascido com vÃ´mitos biliosos persistentes",
  "Lactente com episÃ³dios recorrentes de gastroenterite leve",
  "Lactente com coriza, febre e dificuldade para dormir",
  "CrianÃ§a com otalgia e febre apÃ³s resfriado",
  "PrÃ©-escolar com amigdalite purulenta de repetiÃ§Ã£o",
  "Adolescente com sinusite crÃ´nica e rinite alÃ©rgica",
  "Lactente com estridor e tosse metÃ¡lica noturna",
  "Escolar com aumento de amÃ­gdalas e roncos noturnos",
  "Faringoamigdalite estreptocÃ³cica em crianÃ§a com exantema",
  "Conjuntivite purulenta associada a sintomas respiratÃ³rios",
  "Escolar com adenomegalia e dor de garganta persistente",
  "RepetiÃ§Ã£o de IVAS em crianÃ§a frequentadora de creche",
  "Adolescente com rouquidÃ£o crÃ´nica e uso vocal excessivo",
  "Otite mÃ©dia com perfuraÃ§Ã£o timpÃ¢nica em lactente",
  "Abcesso peritonsilar em adolescente com halitose",
  "BebÃª de 6 meses que nÃ£o sustenta a cabeÃ§a",
  "Lactente de 9 meses que nÃ£o senta sem apoio",
  "PrÃ©-escolar com fala ausente e isolamento social",
  "Escolar com dificuldade de leitura e escrita",
  "CrianÃ§a de 2 anos com regressÃ£o de habilidades motoras",
  "Lactente com assimetria de membros e tÃ´nus alterado",
  "Adolescente com baixo rendimento escolar e dÃ©ficit de atenÃ§Ã£o",
  "CrianÃ§a com sinais precoces de paralisia cerebral",
  "BebÃª prematuro extremo com atraso na linguagem",
  "PrÃ©-escolar com marcha em pontas dos pÃ©s e estereotipias",
  "Escolar com febre alta, conjuntivite e exantema maculopapular",
  "PrÃ©-escolar com febre e lesÃµes em mÃ£os, pÃ©s e boca",
  "Adolescente nÃ£o vacinado com erupÃ§Ãµes e linfadenopatia",
  "Escolar com exantema sÃºbito apÃ³s febre - rosÃ©ola?",
  "CrianÃ§a com febre, amigdalite e descamaÃ§Ã£o palmar - escarlatina",
  "RubÃ©ola em lactente com contato domiciliar positivo",
  "Sarampo em crianÃ§a nÃ£o vacinada durante surto regional",
  "Varicela em crianÃ§a imunocomprometida",
  "Eritema infeccioso em prÃ©-escolar com anemia leve",
  "SÃ­ndrome mÃ£o-pÃ©-boca em berÃ§Ã¡rio",
  "Lactente com palidez, irritabilidade e alimentaÃ§Ã£o seletiva",
  "CrianÃ§a de 2 anos com anemia microcÃ­tica refrÃ¡tÃ¡ria a ferro",
  "Escolar com dor Ã³ssea e linfadenopatia - suspeita de leucemia",
  "Adolescente com equimoses espontÃ¢neas e sangramentos nasais",
  "Anemia falciforme em crianÃ§a com febre e dor abdominal",
  "Crise vaso-oclusiva em paciente com hemoglobinopatia",
  "Escolar com petÃ©quias apÃ³s infecÃ§Ã£o viral - pÃºrpura trombocitopÃªnica?",
  "Lactente com icterÃ­cia persistente e esplenomegalia",
  "CrianÃ§a com hemofilia e trauma leve com hematoma extenso",
  "Lactente com histÃ³ria familiar de talassemia",
  "Lactente com febre alta, taquipneia e gemÃªncia",
  "PrÃ©-escolar com tosse produtiva, febre e estertores Ã  ausculta",
  "Pneumonia lobar em crianÃ§a nÃ£o vacinada contra pneumococo",
  "Adolescente com febre, tosse seca e padrÃ£o intersticial em RX",
  "Pneumonia complicada com derrame pleural em crianÃ§a de 5 anos",
  "Escolar com febre persistente e pneumonia refratÃ¡ria a antibiÃ³tico oral",
  "CrianÃ§a com pneumonia viral versus bacteriana - desafio diagnÃ³stico",
  "Adolescente com mononucleose infecciosa e linfadenomegalia cervical",
  "CrianÃ§a com toxoplasmose congÃªnita diagnosticada tardiamente",
  "Escolar com hansenÃ­ase paucibacilar em Ã¡rea endÃªmica",
  "Lactente com infecÃ§Ã£o congÃªnita por citomegalovÃ­rus",
  "PrÃ©-escolar com febre entÃ©rica apÃ³s viagem internacional",
  "Adolescente com HIV congÃªnito em falha terapÃªutica",
  "Escolar com febre prolongada e esplenomegalia - suspeita de leishmaniose",
  "Lactente com sÃ­filis congÃªnita com lesÃµes cutÃ¢neas ativas",
  "Estenose hipertrÃ³fica de piloro em lactente com vÃ´mitos em jato",
  "InvaginaÃ§Ã£o intestinal em lactente com dor intermitente e fezes em geleia de morango",
  "HÃ©rnia umbilical sintomÃ¡tica em crianÃ§a de 4 anos",
  "Apendicite aguda em crianÃ§a com dor abdominal e vÃ´mitos",
  "Lactente com atresia anal diagnosticada no pÃ³s-natal",
  "Adolescente com colecistite aguda e cÃ¡lculos biliares",
  "DoenÃ§a de Hirschsprung em lactente com constipaÃ§Ã£o desde o nascimento",
];

export const CIRURGIA_CASE_TITLES = [
  "Fratura de fÃªmur em idoso apÃ³s queda da prÃ³pria altura",
  "LuxaÃ§Ã£o anterior de ombro em atleta apÃ³s impacto",
  "Trauma direto em joelho com dor e edema - suspeita de lesÃ£o meniscal",
  "Fratura exposta de tÃ­bia em vÃ­tima de acidente de moto",
  "Dor lombar crÃ´nica em trabalhador braÃ§al - investigar hÃ©rnia de disco",
  "Entorse de tornozelo com instabilidade e limitaÃ§Ã£o funcional",
  "Fratura supracondilar em crianÃ§a com parestesia em mÃ£o",
  "Colles em paciente idoso apÃ³s queda com apoio em punho",
  "Ombro doloroso crÃ´nico - suspeita de sÃ­ndrome do impacto",
  "Lombalgia aguda com irradiaÃ§Ã£o e dÃ©ficit motor",
  "Fratura de pelve em politraumatizado instÃ¡vel",
  "Epicondilite lateral em paciente com uso repetitivo de braÃ§o",
  "LesÃ£o de LCA em jogador de futebol com instabilidade articular",
  "Dor crÃ´nica em quadril com limitaÃ§Ã£o de movimento - suspeita de coxartrose",
  "Osteomielite crÃ´nica em paciente com Ãºlcera diabÃ©tica",
  "NÃ³dulo hepÃ¡tico em paciente com hepatite B crÃ´nica",
  "Carcinoma hepatocelular em cirrÃ³tico com funÃ§Ã£o hepÃ¡tica preservada",
  "Paciente com hemangioma hepÃ¡tico assintomÃ¡tico",
  "Colangiocarcinoma em paciente com icterÃ­cia progressiva",
  "MetÃ¡stase hepÃ¡tica Ãºnica de cÃ¢ncer colorretal",
  "Tumor hepÃ¡tico em mulher jovem - sugestivo de adenoma",
  "Hepatoblastoma em crianÃ§a de 3 anos com massa abdominal",
  "Abcesso hepÃ¡tico piogÃªnico com febre e dor em hipocÃ´ndrio direito",
  "Paciente com cisto hepÃ¡tico simples de grande volume",
  "NÃ³dulo focal hipervascular em imagem - diferenciar HNF de CHC",
  "Tumor hepÃ¡tico com invasÃ£o vascular - avaliar ressecabilidade",
  "RessecÃ§Ã£o hepÃ¡tica programada em paciente com funÃ§Ã£o hepÃ¡tica borderline",
  "CÃ¢ncer gÃ¡strico com linfonodos palpÃ¡veis - indicaÃ§Ã£o cirÃºrgica?",
  "Carcinoma de cÃ³lon ascendente com anemia e perda ponderal",
  "CÃ¢ncer de esÃ´fo com disfagia progressiva",
  "Tumor de pÃ¢ncreas em cabeÃ§a com colestase obstrutiva",
  "NÃ³dulo de mama em mulher jovem com histÃ³rico familiar",
  "Adenocarcinoma de reto baixo com preservaÃ§Ã£o de esfÃ­ncter",
  "Tumor retroperitoneal volumoso e sem invasÃ£o aparente",
  "Sarcoma de partes moles em membro inferior",
  "Tumor neuroendÃ³crino de intestino delgado com crise carcinoide",
  "Recidiva local de cÃ¢ncer de cÃ³lon apÃ³s colectomia prÃ©via",
  "RessecÃ§Ã£o de metÃ¡stases pulmonares em cÃ¢ncer de intestino",
  "AvaliaÃ§Ã£o de ressecabilidade em cÃ¢ncer pancreÃ¡tico borderline",
  "InfecÃ§Ã£o de ferida operatÃ³ria apÃ³s laparotomia",
  "DeiscÃªncia de anastomose intestinal com febre e peritonite",
  "FÃ­stula digestiva em pÃ³s-operatÃ³rio de gastrectomia",
  "RetenÃ§Ã£o urinÃ¡ria apÃ³s cirurgia ortopÃ©dica",
  "Trombose venosa profunda no pÃ³s-operatÃ³rio de histerectomia",
  "Sangramento ativo apÃ³s colecistectomia laparoscÃ³pica",
  "Ãleo paralÃ­tico prolongado apÃ³s cirurgia abdominal",
  "Paciente com febre no 5Âº dia pÃ³s-operatÃ³rio - diagnÃ³stico diferencial",
  "EventraÃ§Ã£o da parede abdominal no pÃ³s-operatÃ³rio tardio",
  "Pneumonia nosocomial apÃ³s cirurgia de grande porte",
  "Hipertermia pÃ³s-anestÃ©sica com instabilidade hemodinÃ¢mica",
  "ComplicaÃ§Ã£o pulmonar em paciente obeso no pÃ³s-operatÃ³rio de hÃ©rnia incisional",
  "Aneurisma de aorta abdominal sintomÃ¡tico em idoso",
  "ClaudicaÃ§Ã£o intermitente em membro inferior esquerdo",
  "Trombose venosa profunda pÃ³s-cirurgia ortopÃ©dica",
  "Embolia arterial aguda com isquemia crÃ­tica do membro",
  "slcera arterial em paciente com doenÃ§a vascular perifÃ©rica",
  "Paciente diabÃ©tico com pÃ© isquÃªmico e lesÃ£o necrÃ³tica",
  "Varizes volumosas com dor e sinais de insuficiÃªncia venosa crÃ´nica",
  "FÃ­stula arteriovenosa disfuncional em paciente em hemodiÃ¡lise",
  "DissecÃ§Ã£o de aorta tipo B com dor torÃ¡cica e PA descontrolada",
  "HÃ©rnia inguinal direta com aumento de volume em regiÃ£o inguinal",
  "HÃ©rnia umbilical sintomÃ¡tica em paciente obeso",
  "HÃ©rnia epigÃ¡strica com dor apÃ³s esforÃ§o fÃ­sico",
  "HÃ©rnia incisional em pÃ³s-operatÃ³rio de laparotomia mediana",
  "HÃ©rnia inguinoescrotal volumosa em idoso",
  "Estrangulamento herniÃ¡rio com obstruÃ§Ã£o intestinal",
  "HÃ©rnia femoral em mulher idosa com dor sÃºbita",
  "Recidiva de hÃ©rnia inguinal apÃ³s correÃ§Ã£o prÃ©via com tela",
  "HÃ©rnia encarcerada com sinais de isquemia intestinal",
  "Trauma abdominal fechado com hipotensÃ£o e FAST positivo",
  "LesÃ£o esplÃªnica grau IV em paciente hemodinamicamente estÃ¡vel",
  "Trauma penetrante de abdome com evisceraÃ§Ã£o",
  "LesÃ£o hepÃ¡tica contusa em paciente politraumatizado",
  "HemoperitÃ´nio em trauma com suspeita de ruptura de alÃ§a intestinal",
  "Paciente com dor abdominal apÃ³s acidente de moto - avaliaÃ§Ã£o de retroperitÃ´nio",
  "LesÃ£o de bexiga em trauma contuso com hematÃºria",
  "Trauma hepÃ¡tico grave com necessidade de hepatorrafia",
  "Paciente com ferimento por arma branca em flanco direito",
  "Apendicite aguda em jovem com dor em fossa ilÃ­aca direita",
  "Colecistite aguda em paciente diabÃ©tico com febre e leucocitose",
  "Diverticulite aguda com abscesso pericÃ³lico",
  "Abdome agudo obstrutivo por brida em paciente com mÃºltiplas laparotomias",
  "Hemorragia digestiva alta em paciente com Ãºlcera duodenal",
  "Abdome agudo perfurativo com pneumoperitÃ´nio",
  "ColelitÃ­ase sintomÃ¡tica em paciente com dor pÃ³s-prandial",
  "PÃ³lipo adenomatoso de cÃ³lon em rastreamento de rotina",
  "InvaginaÃ§Ã£o intestinal em adulto com obstruÃ§Ã£o intermitente",
  "AvaliaÃ§Ã£o prÃ©-operatÃ³ria de paciente com mÃºltiplas comorbidades",
  "Risco cardiovascular prÃ©-cirÃºrgico em paciente com DAC estÃ¡vel",
  "SuspensÃ£o de anticoagulantes antes de cirurgia eletiva",
  "OtimizaÃ§Ã£o de controle glicÃªmico antes de cirurgia ortopÃ©dica",
  "Planejamento anestÃ©sico em paciente com DPOC grave",
  "OrientaÃ§Ã£o nutricional em paciente oncolÃ³gico prÃ©-gastrectomia",
  "PrevenÃ§Ã£o de trombose venosa profunda no perioperatÃ³rio",
  "AvaliaÃ§Ã£o de via aÃ©rea difÃ­cil antes de cirurgia de cabeÃ§a e pescoÃ§o",
  "AvaliaÃ§Ã£o laboratorial alterada no prÃ©-operatÃ³rio - adiar ou operar?",
  "Trauma torÃ¡cico com instabilidade respiratÃ³ria - toracotomia de urgÃªncia",
  "Politrauma com fratura exposta, TCE e abdome instÃ¡vel",
  "LesÃ£o de carÃ³tida interna em trauma cervical penetrante",
  "Trauma de face com sangramento ativo e comprometimento de via aÃ©rea",
];

export const GINECOLOGIA_OBSTETRICIA_CASE_TITLES = [
  "Mulher jovem com Ãºlcera genital dolorosa e linfadenomegalia inguinal",
  "Gestante no 3Âº trimestre com lesÃ£o ulcerada em genitÃ¡lia externa",
  "slcera genital indolor em paciente com novo parceiro sexual",
  "Paciente com mÃºltiplas Ãºlceras necrÃ³ticas e febre",
  "LesÃ£o genital recorrente associada ao ciclo menstrual",
  "Mulher com Ãºlcera e secreÃ§Ã£o purulenta - suspeita de cancro mole",
  "LesÃ£o Ãºnica, bem delimitada, com base endurecida - suspeita de sÃ­filis",
  "HIV positiva com Ãºlcera extensa e dor intensa",
  "Adolescente com lesÃ£o genital e histÃ³ria de abuso sexual",
  "Mulher com herpes genital de repetiÃ§Ã£o e desejo reprodutivo",
  "LesÃ£o ulcerada perianal em paciente com histÃ³ria de IST",
  "slcera genital em mulher que nega contato sexual recente",
  "LÃºpus eritematoso sistÃªmico com lesÃ£o ulcerada vulvar",
  "Paciente imunossuprimida com Ãºlceras atÃ­picas e dolorosas",
  "LesÃµes ulceradas genitais e orais - pensar em BehÃ§et",
  "RecorrÃªncia de Ãºlcera genital apÃ³s tratamento de sÃ­filis",
  "Corrimento branco, espesso e prurido intenso",
  "SecreÃ§Ã£o vaginal amarelo-esverdeada com odor fÃ©tido",
  "Corrimento acinzentado e pH vaginal alterado - vaginose bacteriana",
  "Corrimento vaginal e sangramento pÃ³s-coito - suspeita de cervicite",
  "Mulher com dor pÃ©lvica e febre apÃ³s episÃ³dio de corrimento",
  "Adolescente com cervicite por clamÃ­dia confirmada",
  "Mulher com tricomonÃ­ase e parceiro assintomÃ¡tico",
  "Paciente com queixa de prurido e secreÃ§Ã£o vaginal em uso de antibiÃ³ticos",
  "Corrimento vaginal persistente apÃ³s tratamento antifÃºngico",
  "HIV positiva com candidÃ­ase vaginal de repetiÃ§Ã£o",
  "Gestante com vaginose bacteriana no 2Âº trimestre",
  "Mulher na menopausa com atrofia vaginal e prurido",
  "Corrimento crÃ´nico e inflamaÃ§Ã£o cervical - suspeita de cervicite crÃ´nica",
  "Mulher com antecedente de TEV buscando mÃ©todo contraceptivo seguro",
  "Adolescente com ciclos irregulares e acne - desejo de contracepÃ§Ã£o hormonal",
  "Lactante buscando mÃ©todo anticoncepcional compatÃ­vel com aleitamento",
  "Paciente com contraindicaÃ§Ã£o a estrogÃªnio e desejo de contracepÃ§Ã£o oral",
  "Mulher com desejo de contracepÃ§Ã£o de longa duraÃ§Ã£o",
  "Escolha de mÃ©todo contraceptivo em paciente com epilepsia",
  "Mulher com desejo de engravidar em 1 ano - escolha do mÃ©todo",
  "EficÃ¡cia do DIU em nulÃ­para jovem com cÃ³licas menstruais",
  "Paciente com sangramento irregular em uso de implante hormonal",
  "AvaliaÃ§Ã£o de falha contraceptiva em paciente com uso regular de ACO",
  "Desejo de laqueadura tubÃ¡ria em paciente com cesÃ¡rea agendada",
  "AnticoncepÃ§Ã£o de emergÃªncia apÃ³s relaÃ§Ã£o sexual desprotegida",
  "Escolha de mÃ©todo contraceptivo em mulher com enxaqueca com aura",
  "Parto normal em gestante com antecedente de cesariana",
  "Parto precipitado em multÃ­para com dilataÃ§Ã£o total ao chegar na maternidade",
  "Gestante com trabalho de parto prolongado - indicaÃ§Ã£o de cesÃ¡rea?",
  "Parto pÃ©lvico em primigesta - avaliaÃ§Ã£o da via de parto",
  "InduÃ§Ã£o do parto em gestante com bolsa rota hÃ¡ 24 horas",
  "Parto com distÃ³cia de ombro e manobras obstÃ©tricas",
  "Uso de fÃ³rceps em parto com sofrimento fetal tardio",
  "Parto com mecÃ´nio espesso e reanimaÃ§Ã£o neonatal",
  "Hemorragia pÃ³s-parto imediata - suspeita de atonia uterina",
  "Massa anexial complexa em mulher na pÃ³s-menopausa",
  "Cistoadenocarcinoma seroso diagnosticado em estÃ¡gio avanÃ§ado",
  "Mulher jovem com dor abdominal e elevaÃ§Ã£o de CA-125",
  "Tumor de ovÃ¡rio com ascite e derrame pleural - sÃ­ndrome de Meigs",
  "Neoplasia ovariana com disseminaÃ§Ã£o peritoneal - estratÃ©gia cirÃºrgica",
  "Tumor borderline de ovÃ¡rio em mulher com desejo reprodutivo",
  "Tumor de cÃ©lulas germinativas em adolescente com massa pÃ©lvica",
  "Recidiva de cÃ¢ncer de ovÃ¡rio apÃ³s quimioterapia",
  "DiagnÃ³stico incidental de neoplasia ovariana em cirurgia de histerectomia",
  "ReduÃ§Ã£o da movimentaÃ§Ã£o fetal em gestante de 34 semanas",
  "AusÃªncia de batimentos cardÃ­acos fetais em consulta de rotina",
  "Gestante com RCIU e dopplervelocimetria alterada",
  "Perfil biofÃ­sico fetal limÃ­trofe em gestante hipertensa",
  "OligoÃ¢mnio com crescimento fetal adequado - conduta expectante?",
  "Macrossomia fetal com sinais de sofrimento em cardiotocografia",
  "RN com Apgar baixo apÃ³s parto cesÃ¡reo eletivo",
  "PolidrÃ¢mnio com avaliaÃ§Ã£o ultrassonogrÃ¡fica normal - conduta",
  "AvaliaÃ§Ã£o de vitalidade fetal em gestante diabÃ©tica mal controlada",
  "Gestante com PA elevada, cefaleia e escotomas - suspeita de prÃ©-eclÃ¢mpsia",
  "EclÃ¢mpsia em paciente sem prÃ©-natal adequado",
  "HipertensÃ£o gestacional com proteinÃºria ausente",
  "PrÃ©-eclÃ¢mpsia grave em gestante de 30 semanas - manter ou interromper?",
  "SÃ­ndrome HELLP com plaquetopenia e dor epigÃ¡strica",
  "Crise hipertensiva em trabalho de parto - conduta imediata",
  "AvaliaÃ§Ã£o de risco em gestante com hipertensÃ£o crÃ´nica",
  "PrÃ©-eclÃ¢mpsia em gestante com lÃºpus eritematoso sistÃªmico",
  "Conduta expectante em prÃ©-eclÃ¢mpsia leve a termo",
  "Resultado de citologia com NIC III em mulher de 32 anos",
  "Paciente com colposcopia alterada e biÃ³psia confirmando NIC II",
  "Condilomas genitais volumosos em mulher grÃ¡vida",
  "HPV de alto risco detectado em teste molecular - conduta?",
  "Seguimento de lesÃ£o de baixo grau em citologia recente",
  "Carcinoma invasor de colo uterino diagnosticado em estÃ¡gio inicial",
  "LesÃ£o de alto grau em citologia de adolescente",
  "Mulher vacinada com HPV e citologia alterada - o que fazer?",
  "Sangramento pÃ³s-coito em mulher com lesÃ£o suspeita ao exame especular",
  "Bolsa rota com 30 semanas e ausÃªncia de trabalho de parto",
  "Parto prematuro iminente em gestante com colo encurtado",
  "Rotura prematura das membranas com sinais infecciosos",
  "Prematuridade extrema com gemelaridade monocoriÃ´nica",
  "Corticoide antenatal em paciente com ameaÃ§a de parto prematuro",
  "Rotura prematura em gestante sem contraÃ§Ãµes - internaÃ§Ã£o ou ambulatorial?",
  "Prematuridade associada a infecÃ§Ã£o urinÃ¡ria nÃ£o tratada",
  "Bradicardia fetal sÃºbita durante trabalho de parto",
  "DesaceleraÃ§Ãµes tardias na cardiotocografia - conduta imediata",
  "Sinais de hipÃ³xia fetal com lÃ­quido meconial espesso",
  "Taquicardia fetal persistente e febre materna intraparto",
  "Parto com prolapso de cordÃ£o umbilical - intervenÃ§Ã£o urgente",
  "ReduÃ§Ã£o dos movimentos fetais e perfil biofÃ­sico alterado",
];

export const MEDICINA_PREVENTIVA_CASE_TITLES = [
  "Estudo clÃ­nico com p=0,08 - interpretaÃ§Ã£o estatÃ­stica correta?",
  "Uso de intervalo de confianÃ§a em pesquisa de prevalÃªncia",
  "Amostra pequena em estudo de intervenÃ§Ã£o - impacto no poder estatÃ­stico",
  "Erro tipo I e tipo II em ensaio clÃ­nico randomizado",
  "Validade interna versus validade externa em estudo epidemiolÃ³gico",
  "CÃ¡lculo do tamanho amostral para pesquisa populacional",
  "Sensibilidade e especificidade aplicadas em teste sorolÃ³gico",
  "ViÃ©s de seleÃ§Ã£o em estudo de caso-controle",
  "InterpretaÃ§Ã£o de grÃ¡fico de Kaplan-Meier em oncologia",
  "CorrelaÃ§Ã£o nÃ£o implica causalidade: anÃ¡lise de dados secundÃ¡rios",
  "Uso inadequado de mÃ©dia em variÃ¡vel nÃ£o paramÃ©trica",
  "Intervalo de confianÃ§a cruzando 1 em cÃ¡lculo de risco relativo",
  "AplicaÃ§Ã£o de regressÃ£o logÃ­stica em estudo de fatores de risco",
  "Estudo de intervenÃ§Ã£o sem grupo controle - limitaÃ§Ãµes",
  "InterpretaÃ§Ã£o de OR=0,95 (IC95% 0,7- 1,2) em pesquisa clÃ­nica",
  "Curva ROC para avaliaÃ§Ã£o de teste diagnÃ³stico",
  "AnÃ¡lise de subgrupos em ensaio clÃ­nico randomizado",
  "Teste de hipÃ³tese versus significÃ¢ncia clÃ­nica em medicina baseada em evidÃªncias",
  "Paciente sem vÃ­nculo com ESF e uso frequente de pronto-socorro",
  "Acolhimento em UBS de paciente com dor crÃ´nica nÃ£o controlada",
  "EstratÃ©gia de adscriÃ§Ã£o populacional em equipe de saÃºde da famÃ­lia",
  "Longitudinalidade na atenÃ§Ã£o a paciente com hipertensÃ£o",
  "CoordenaÃ§Ã£o do cuidado entre UBS e hospital de referÃªncia",
  "Integralidade da atenÃ§Ã£o em paciente com mÃºltiplas demandas",
  "Equipe multiprofissional em aÃ§Ã£o de prevenÃ§Ã£o de diabetes",
  "TerritorializaÃ§Ã£o e mapeamento de famÃ­lias em comunidade rural",
  "Planejamento de aÃ§Ãµes de promoÃ§Ã£o da saÃºde em creche",
  "Visita domiciliar para idoso acamado com comorbidades",
  "UBS com alta demanda espontÃ¢nea e baixo agendamento programado",
  "AtuaÃ§Ã£o da atenÃ§Ã£o primÃ¡ria em saÃºde mental comunitÃ¡ria",
  "Rastreamento de cÃ¢ncer de colo do Ãºtero em Ã¡rea adscrita",
  "EstratÃ©gia de imunizaÃ§Ã£o em populaÃ§Ãµes vulnerÃ¡veis",
  "Cuidado continuado de paciente diabÃ©tico com pÃ© em risco",
  "Acolhimento humanizado a populaÃ§Ã£o migrante em atenÃ§Ã£o primÃ¡ria",
  "Paciente oncolÃ³gico com dor crÃ´nica e comunicaÃ§Ã£o deficiente da equipe",
  "Atendimento acolhedor em pronto-socorro superlotado",
  "Escuta ativa em consulta de prÃ©-natal na UBS",
  "ComunicaÃ§Ã£o de mÃ¡s notÃ­cias em oncologia",
  "ReduÃ§Ã£o do tempo de espera e melhoria do ambiente hospitalar",
  "Atendimento a paciente com deficiÃªncia auditiva sem intÃ©rprete",
  "Respeito Ã  autonomia em paciente terminal",
  "-tica no cuidado a paciente vulnerÃ¡vel em situaÃ§Ã£o de rua",
  "ViolÃªncia obstÃ©trica em sala de parto - como evitar?",
  "HumanizaÃ§Ã£o no acompanhamento de parto de risco habitual",
  "Consentimento informado em paciente idoso com baixa escolaridade",
  "EstratÃ©gias de humanizaÃ§Ã£o em UTI neonatal",
  "HumanizaÃ§Ã£o no acolhimento de familiares em Ã³bito hospitalar",
  "Enfrentamento do burnout entre profissionais de saÃºde",
  "Planejamento regional de saÃºde em consÃ³rcio intermunicipal",
  "Financiamento tripartite em aÃ§Ãµes de mÃ©dia complexidade",
  "RegulaÃ§Ã£o de leitos hospitalares em situaÃ§Ãµes de urgÃªncia",
  "PactuaÃ§Ã£o interfederativa em conselhos de saÃºde",
  "Controle social em conferÃªncia municipal de saÃºde",
  "Auditoria em serviÃ§os conveniados ao SUS",
  "Indicadores de desempenho em gestÃ£o hospitalar pÃºblica",
  "GestÃ£o de estoque de medicamentos essenciais na atenÃ§Ã£o bÃ¡sica",
  "DescentralizaÃ§Ã£o de recursos para municÃ­pios de pequeno porte",
  "ImplementaÃ§Ã£o de protocolos clÃ­nicos no SUS",
  "JudicializaÃ§Ã£o da saÃºde em fornecimento de medicamentos",
  "EducaÃ§Ã£o permanente em saÃºde para profissionais da rede pÃºblica",
  "Estudo de prevalÃªncia de obesidade em adolescentes",
  "InquÃ©rito populacional sobre consumo de Ã¡lcool e tabaco",
  "Estudo transversal sobre cobertura vacinal infantil",
  "Pesquisa sobre autopercepÃ§Ã£o de saÃºde em idosos",
  "Estudo de corte transversal em trabalhadores expostos a ruÃ­do",
  "Levantamento de saÃºde bucal em escolares",
  "Estudo de fatores associados a sedentarismo em adultos",
  "InquÃ©rito epidemiolÃ³gico de doenÃ§as crÃ´nicas nÃ£o transmissÃ­veis",
  "Estudo sobre prevalÃªncia de ansiedade em estudantes de medicina",
  "Pesquisa transversal sobre acesso a serviÃ§os de saÃºde mental",
  "Estudo de prevalÃªncia de hipertensÃ£o em populaÃ§Ã£o urbana",
  "Estudo em populaÃ§Ã£o indÃ­gena sobre estado nutricional",
  "Levantamento sobre violÃªncia domÃ©stica em adolescentes",
  "Estudo de saÃºde reprodutiva em mulheres em idade fÃ©rtil",
  "PrevalÃªncia de sintomas respiratÃ³rios em comunidade exposta Ã  poluiÃ§Ã£o",
  "Estudo de saÃºde ocupacional em trabalhadores de frigorÃ­fico",
  "InquÃ©rito de uso de automedicaÃ§Ã£o em universitÃ¡rios",
  "Sensibilidade e especificidade do teste rÃ¡pido de HIV",
  "Valor preditivo positivo em rastreamento de cÃ¢ncer de colo uterino",
  "Curva ROC para diagnÃ³stico de diabetes mellitus",
  "ComparaÃ§Ã£o entre RT-PCR e teste de antÃ­geno para COVID-19",
  "Estudo de acurÃ¡cia de mamografia em mulheres jovens",
  "AnÃ¡lise de falso-negativos em teste sorolÃ³gico para sÃ­filis",
  "Uso de likelihood ratio em avaliaÃ§Ã£o de tuberculose",
  "IncidÃªncia de dengue em comunidade apÃ³s surto sazonal",
  "IncidÃªncia de cÃ¢ncer de pele em agricultores expostos ao sol",
  "IncidÃªncia de tuberculose em populaÃ§Ã£o carcerÃ¡ria",
  "IncidÃªncia de infarto agudo do miocÃ¡rdio em populaÃ§Ã£o idosa",
  "IncidÃªncia de HIV em jovens de 15 a 24 anos",
  "IncidÃªncia de hepatite A apÃ³s campanha de vacinaÃ§Ã£o",
  "IncidÃªncia de acidentes de trabalho em setor da construÃ§Ã£o civil",
  "PrevenÃ§Ã£o primÃ¡ria: campanha de vacinaÃ§Ã£o contra influenza",
  "PrevenÃ§Ã£o secundÃ¡ria: rastreamento de cÃ¢ncer de mama",
  "PrevenÃ§Ã£o terciÃ¡ria: reabilitaÃ§Ã£o pÃ³s-AVC",
  "PrevenÃ§Ã£o quaternÃ¡ria: evitar excesso de exames em paciente saudÃ¡vel",
  "PrevenÃ§Ã£o primÃ¡ria: reduÃ§Ã£o de tabagismo em adolescentes",
  "PrevenÃ§Ã£o secundÃ¡ria: rastreamento de hipertensÃ£o arterial",
  "PrevenÃ§Ã£o terciÃ¡ria: cuidados paliativos em paciente oncolÃ³gico",
  "Estudo caso-controle de tabagismo e cÃ¢ncer de pulmÃ£o - OR",
  "Coorte de obesidade e diabetes tipo 2 - RR",
  "Estudo de exposiÃ§Ã£o ocupacional e intoxicaÃ§Ã£o crÃ´nica - OR",
  "Coorte de atividade fÃ­sica e hipertensÃ£o arterial - RR",
  "Estudo de contraceptivo oral e trombose venosa - OR",
  "Coorte de dieta rica em fibras e cÃ¢ncer colorretal - RR",
  "Estudo de Ã¡lcool e hepatopatia crÃ´nica - OR",
  "AplicaÃ§Ã£o da Lei 8080/90 em gestÃ£o municipal de saÃºde",
  "Lei 8142/90 e controle social em conselhos de saÃºde",
  "PolÃ­tica Nacional de HumanizaÃ§Ã£o aplicada em hospital",
  "Diretrizes da RAPS na atenÃ§Ã£o psicossocial",
  "PolÃ­tica Nacional de AtenÃ§Ã£o BÃ¡sica e cobertura populacional",
  "Rede Cegonha e cuidados no prÃ©-natal e parto",
  "Diretrizes da VigilÃ¢ncia em SaÃºde e surtos epidÃªmicos",
];

export const INTENSIVO_RESIDENCIA_QUESTIONS: Record<MedicalSubject, MultipleChoiceQuestion[]> = {
  'ClÃ­nica MÃ©dica': [
    {
        question: "Um homem de 68 anos Ã© admitido na emergÃªncia com dor torÃ¡cica em aperto hÃ¡ 2 horas, irradiando para o braÃ§o esquerdo. O eletrocardiograma (ECG) mostra supradesnivelamento do segmento ST nas derivaÃ§Ãµes DII, DIII e aVF. Qual Ã© a conduta prioritÃ¡ria neste caso?",
        options: ["Administrar morfina e solicitar marcadores de necrose miocÃ¡rdica.", "Iniciar betabloqueador oral e aguardar avaliaÃ§Ã£o do cardiologista.", "Realizar ecocardiograma transtorÃ¡cico para avaliar a funÃ§Ã£o ventricular.", "Encaminhar para terapia de reperfusÃ£o imediata (angioplastia primÃ¡ria ou trombÃ³lise).", "Administrar nitrato sublingual e observar a resposta da dor."],
        correctAnswer: "Encaminhar para terapia de reperfusÃ£o imediata (angioplastia primÃ¡ria ou trombÃ³lise).",
        explanation: "No Infarto Agudo do MiocÃ¡rdio com Supradesnivelamento de ST (IAMCSST) de parede inferior, a prioridade absoluta Ã© a desobstruÃ§Ã£o da artÃ©ria coronÃ¡ria ocluÃ­da. A terapia de reperfusÃ£o, seja por angioplastia ou trombÃ³lise, deve ser instituÃ­da o mais rÃ¡pido possÃ­vel para salvar o miocÃ¡rdio."
    },
    {
        question: "Uma mulher de 58 anos chega ao pronto-socorro com palpitaÃ§Ãµes, dispneia intensa e confusÃ£o mental. A pressÃ£o arterial Ã© de 80/50 mmHg. O ECG revela FibrilaÃ§Ã£o Atrial com frequÃªncia ventricular de 180 bpm. Qual Ã© a conduta imediata mais apropriada?",
        options: ["CardioversÃ£o elÃ©trica sincronizada.", "AdministraÃ§Ã£o de amiodarona em bolus endovenoso.", "Iniciar heparina de baixo peso molecular.", "Administrar diltiazem endovenoso para controle da frequÃªncia.", "Solicitar ecocardiograma transesofÃ¡gico para descartar trombo atrial."],
        correctAnswer: "CardioversÃ£o elÃ©trica sincronizada.",
        explanation: "A presenÃ§a de instabilidade hemodinÃ¢mica (hipotensÃ£o, rebaixamento do nÃ­vel de consciÃªncia) em um paciente com taquiarritmia, como a FA de alta resposta ventricular, Ã© uma indicaÃ§Ã£o formal de cardioversÃ£o elÃ©trica sincronizada de emergÃªncia."
    },
    {
        question: "Um paciente de 65 anos apresenta-se com quadro de Infarto Agudo do MiocÃ¡rdio com supradesnivelamento de ST (IAMCSST) hÃ¡ 1 hora. Na histÃ³ria, refere um AVC isquÃªmico hÃ¡ 12 meses, sem sequelas. Em relaÃ§Ã£o Ã  terapia trombolÃ­tica, o AVC prÃ©vio Ã© considerado:",
        options: ["Uma contraindicaÃ§Ã£o absoluta.", "Uma contraindicaÃ§Ã£o relativa, dependendo do risco-benefÃ­cio.", "NÃ£o Ã© uma contraindicaÃ§Ã£o, desde que o AVC tenha ocorrido hÃ¡ mais de 3 meses.", "Uma contraindicaÃ§Ã£o absoluta apenas se o AVC tivesse ocorrido hÃ¡ menos de 6 meses.", "Uma indicaÃ§Ã£o para reduzir a dose do trombolÃ­tico."],
        correctAnswer: "NÃ£o Ã© uma contraindicaÃ§Ã£o, desde que o AVC tenha ocorrido hÃ¡ mais de 3 meses.",
        explanation: "De acordo com as diretrizes atuais, um AVC isquÃªmico ocorrido hÃ¡ mais de 3 meses nÃ£o Ã© uma contraindicaÃ§Ã£o absoluta para a trombÃ³lise no IAMCSST. A contraindicaÃ§Ã£o absoluta se aplica a AVCs isquÃªmicos nos Ãºltimos 3 meses ou a qualquer AVC hemorrÃ¡gico prÃ©vio."
    },
    {
        question: "Um idoso de 82 anos Ã© trazido Ã  emergÃªncia apÃ³s um episÃ³dio de sÃ­ncope. Ao exame, estÃ¡ sonolento, com FC de 32 bpm e PA de 90/60 mmHg. O ECG mostra bloqueio atrioventricular total (BAVT). Qual Ã© o manejo inicial mais adequado?",
        options: ["Administrar atropina endovenosa em bolus.", "Instalar marca-passo transcutÃ¢neo de urgÃªncia.", "Iniciar infusÃ£o de dopamina.", "Realizar cardioversÃ£o elÃ©trica sincronizada.", "Aguardar avaliaÃ§Ã£o cardiolÃ³gica para implante de marca-passo definitivo."],
        correctAnswer: "Instalar marca-passo transcutÃ¢neo de urgÃªncia.",
        explanation: "Em um paciente com BAVT sintomÃ¡tico e instabilidade hemodinÃ¢mica, a atropina Ã© geralmente ineficaz (bloqueio infranodal). A medida mais eficaz e imediata para estabilizar a frequÃªncia cardÃ­aca Ã© a instalaÃ§Ã£o de um marca-passo transcutÃ¢neo, servindo como ponte para o implante do marca-passo definitivo."
    },
    {
        question: "Um jovem de 25 anos queixa-se de dor torÃ¡cica aguda, ventilatÃ³rio-dependente, que piora em decÃºbito dorsal e alivia ao inclinar o tronco para frente. Na ausculta cardÃ­aca, ouve-se um atrito pericÃ¡rdico. O ECG mostra supradesnivelamento difuso de ST com concavidade para cima. Qual o diagnÃ³stico mais provÃ¡vel?",
        options: ["Infarto agudo do miocÃ¡rdio.", "Embolia pulmonar.", "Pericardite aguda.", "DissecÃ§Ã£o de aorta.", "Costocondrite."],
        correctAnswer: "Pericardite aguda.",
        explanation: "A combinaÃ§Ã£o de dor torÃ¡cica postural (piora ao deitar, melhora ao sentar), atrito pericÃ¡rdico na ausculta e supradesnivelamento difuso de ST com concavidade superior no ECG Ã© a apresentaÃ§Ã£o clÃ¡ssica da pericardite aguda."
    },
    {
        question: "Um paciente de 70 anos refere dispneia que progrediu nos Ãºltimos meses, necessitando de 3 travesseiros para dormir (ortopneia) e acordando Ã  noite com falta de ar. Ao exame, apresenta estase jugular e estertores crepitantes. Qual a classificaÃ§Ã£o funcional (NYHA) mais provÃ¡vel?",
        options: ["Classe I.", "Classe II.", "Classe III.", "Classe IV.", "NÃ£o se aplica."],
        correctAnswer: "Classe III.",
        explanation: "Ortopneia e dispneia paroxÃ­stica noturna indicam dispneia em repouso ou aos mÃ­nimos esforÃ§os. O paciente tem limitaÃ§Ã£o acentuada da atividade fÃ­sica (Classe III) ou incapacidade de realizar qualquer atividade sem desconforto (Classe IV). Como ele ainda consegue realizar algumas atividades, Classe III Ã© mais provÃ¡vel."
    },
    {
        question: "Homem de 55 anos, hipertenso, procura a emergÃªncia com cefaleia occipital intensa e visÃ£o turva. A PA aferida Ã© de 220/130 mmHg. O exame de fundo de olho revela papiledema. Qual o diagnÃ³stico e a meta terapÃªutica inicial?",
        options: ["UrgÃªncia hipertensiva; reduzir a PA em 24-48 horas.", "EmergÃªncia hipertensiva; reduzir a PA mÃ©dia em atÃ© 25% na primeira hora.", "HipertensÃ£o estÃ¡gio 3; iniciar tratamento com 3 classes de anti-hipertensivos orais.", "Pseudocrise hipertensiva; administrar analgÃ©sico e reavaliar.", "Encefalopatia hipertensiva; reduzir a PA para 120/80 mmHg o mais rÃ¡pido possÃ­vel."],
        correctAnswer: "EmergÃªncia hipertensiva; reduzir a PA mÃ©dia em atÃ© 25% na primeira hora.",
        explanation: "A presenÃ§a de lesÃ£o de Ã³rgÃ£o-alvo aguda (papiledema, indicando encefalopatia hipertensiva) caracteriza uma emergÃªncia hipertensiva. A meta Ã© reduzir a PA de forma controlada, com drogas endovenosas, para evitar hipoperfusÃ£o cerebral, nÃ£o devendo a PA mÃ©dia cair mais que 25% na primeira hora."
    },
    {
        question: "Mulher de 30 anos, hÃ­gida, chega Ã  emergÃªncia com palpitaÃ§Ãµes de inÃ­cio sÃºbito. EstÃ¡ hemodinamicamente estÃ¡vel. O monitor cardÃ­aco mostra uma taquicardia regular de complexo QRS estreito com FC de 180 bpm. A manobra de Valsalva foi ineficaz. Qual a prÃ³xima conduta farmacolÃ³gica de escolha?",
        options: ["Amiodarona 150 mg IV.", "Diltiazem 20 mg IV.", "Adenosina 6 mg IV em bolus rÃ¡pido.", "Metoprolol 5 mg IV.", "Verapamil 5 mg IV."],
        correctAnswer: "Adenosina 6 mg IV em bolus rÃ¡pido.",
        explanation: "Para uma taquicardia supraventricular de QRS estreito, regular e estÃ¡vel, a adenosina Ã© a droga de primeira escolha apÃ³s a falha das manobras vagais, devido Ã  sua alta eficÃ¡cia e curta meia-vida."
    },
    {
        question: "Ao analisar um ECG, vocÃª observa ausÃªncia de onda P, presenÃ§a de ondas \"F\" em formato de \"dentes de serra\" mais visÃ­veis em DII, DIII e aVF, com frequÃªncia atrial de 300 bpm e frequÃªncia ventricular regular de 150 bpm. Qual o diagnÃ³stico eletrocardiogrÃ¡fico?",
        options: ["FibrilaÃ§Ã£o atrial de alta resposta ventricular.", "Taquicardia supraventricular por reentrada nodal.", "Taquicardia atrial.", "Flutter atrial com bloqueio atrioventricular variÃ¡vel.", "Flutter atrial com conduÃ§Ã£o 2:1."],
        correctAnswer: "Flutter atrial com conduÃ§Ã£o 2:1.",
        explanation: "As ondas em 'dentes de serra' (ondas F) sÃ£o patognomÃ´nicas do flutter atrial. Uma frequÃªncia atrial de 300 bpm e uma frequÃªncia ventricular regular de 150 bpm indicam um bloqueio atrioventricular fixo de 2:1."
    },
    {
        question: "Um paciente de 75 anos, em uso de varfarina para fibrilaÃ§Ã£o atrial, chega Ã  emergÃªncia com hematÃªmese. Os exames mostram INR de 8,5. Qual Ã© a conduta mais eficaz e imediata para reverter a anticoagulaÃ§Ã£o?",
        options: ["Suspender a varfarina e administrar Vitamina K oral.", "Administrar plasma fresco congelado e Vitamina K endovenosa.", "Realizar transfusÃ£o de plaquetas.", "Administrar heparina de baixo peso molecular.", "Administrar Ã¡cido tranexÃ¢mico."],
        correctAnswer: "Administrar plasma fresco congelado e Vitamina K endovenosa.",
        explanation: "Em um sangramento maior associado ao uso de varfarina, a reversÃ£o deve ser imediata. O plasma fresco congelado (ou complexo protrombÃ­nico) repÃµe os fatores de coagulaÃ§Ã£o rapidamente, enquanto a Vitamina K endovenosa inicia a reversÃ£o sustentada do efeito da varfarina."
    },
    {
        question: "Uma idosa de 80 anos apresenta-se com anasarca, ascite e turgÃªncia jugular patolÃ³gica. A ausculta cardÃ­aca revela uma terceira bulha (B3). Qual a etiologia mais provÃ¡vel para o quadro?",
        options: ["InsuficiÃªncia hepÃ¡tica (cirrose).", "SÃ­ndrome nefrÃ³tica.", "InsuficiÃªncia cardÃ­aca congestiva.", "DesnutriÃ§Ã£o proteico-calÃ³rica grave.", "ObstruÃ§Ã£o da veia cava inferior."],
        correctAnswer: "InsuficiÃªncia cardÃ­aca congestiva.",
        explanation: "A combinaÃ§Ã£o de anasarca com sinais de congestÃ£o venosa sistÃªmica (turgÃªncia jugular) e sinais cardÃ­acos (presenÃ§a de B3) aponta fortemente para uma etiologia cardÃ­aca, especificamente insuficiÃªncia cardÃ­aca congestiva."
    },
    {
        question: "Um jovem de 28 anos Ã© trazido Ã  emergÃªncia com dor torÃ¡cica intensa apÃ³s uso de cocaÃ­na. O ECG mostra supradesnivelamento do segmento ST em mÃºltiplas derivaÃ§Ãµes. Qual das seguintes medicaÃ§Ãµes estÃ¡ contraindicada no manejo inicial deste paciente?",
        options: ["Nitroglicerina.", "Morfina.", "BenzodiazepÃ­nicos (Diazepam).", "Aspirina.", "Metoprolol."],
        correctAnswer: "Metoprolol.",
        explanation: "No infarto agudo do miocÃ¡rdio induzido por cocaÃ­na, o uso de betabloqueadores (como o metoprolol) Ã© contraindicado devido ao risco de estimular receptores alfa-adrenÃ©rgicos sem oposiÃ§Ã£o, o que pode piorar o vasoespasmo coronariano, a hipertensÃ£o e a isquemia."
    },
    {
        question: "Paciente de 60 anos apresenta dor torÃ¡cica sÃºbita, lancinante, irradiando para o dorso. HÃ¡ assimetria de pulsos e PA de 200/120 mmHg. A principal suspeita Ã© dissecÃ§Ã£o aguda de aorta. Qual Ã© a estratÃ©gia de controle pressÃ³rico mais adequada?",
        options: ["Nitroprussiato de sÃ³dio como monoterapia.", "Hidralazina endovenosa.", "Betabloqueador (ex: esmolol) seguido por um vasodilatador (ex: nitroprussiato).", "Nifedipina sublingual.", "Furosemida em bolus."],
        correctAnswer: "Betabloqueador (ex: esmolol) seguido por um vasodilatador (ex: nitroprussiato).",
        explanation: "No manejo da dissecÃ§Ã£o de aorta, Ã© crucial controlar a frequÃªncia cardÃ­aca e a pressÃ£o arterial. O betabloqueador Ã© usado primeiro para reduzir a forÃ§a de cisalhamento na parede da aorta (dP/dt), seguido por um vasodilatador para baixar a pressÃ£o, evitando uma taquicardia reflexa."
    },
    {
        question: "Um paciente com diagnÃ³stico de endocardite infecciosa em valva mitral apresenta subitamente hemiparesia direita e afasia. A tomografia de crÃ¢nio confirma um AVC isquÃªmico. Qual a conduta em relaÃ§Ã£o ao tratamento da endocardite?",
        options: ["Suspender a antibioticoterapia e iniciar anticoagulaÃ§Ã£o plena.", "Indicar cirurgia de troca valvar de emergÃªncia.", "Manter a antibioticoterapia, pois a cirurgia estÃ¡ contraindicada.", "Iniciar anticoagulaÃ§Ã£o plena e manter os antibiÃ³ticos.", "Trocar o esquema antibiÃ³tico."],
        correctAnswer: "Indicar cirurgia de troca valvar de emergÃªncia.",
        explanation: "A ocorrÃªncia de um evento embÃ³lico maior, como um AVC, em um paciente com endocardite infecciosa, Ã© uma indicaÃ§Ã£o clÃ¡ssica de tratamento cirÃºrgico precoce para remover a fonte dos Ãªmbolos (a vegetaÃ§Ã£o) e prevenir novos eventos."
    },
    {
        question: "Durante o exame fÃ­sico de um paciente com dispneia progressiva aos esforÃ§os, vocÃª ausculta um sopro diastÃ³lico, em ruflar, mais audÃ­vel no Ã¡pice cardÃ­aco com o paciente em decÃºbito lateral esquerdo. Qual a valvopatia mais provÃ¡vel?",
        options: ["InsuficiÃªncia aÃ³rtica.", "Estenose mitral.", "InsuficiÃªncia mitral.", "Estenose aÃ³rtica.", "InsuficiÃªncia tricÃºspide."],
        correctAnswer: "Estenose mitral.",
        explanation: "O sopro diastÃ³lico em ruflar, de baixa frequÃªncia, mais audÃ­vel no foco mitral (Ã¡pice) e que se acentua com a manobra de Pachon (decÃºbito lateral esquerdo), Ã© o achado semiolÃ³gico caracterÃ­stico da estenose mitral."
    },
    {
        question: "Um senhor de 70 anos, diabÃ©tico, procura atendimento com tosse produtiva, febre e dispneia. Ao exame, estÃ¡ confuso, com FR de 32 irpm e PA de 85/55 mmHg. A ureia sÃ©rica Ã© de 60 mg/dL. Qual a pontuaÃ§Ã£o no escore CURB-65 e a conduta recomendada?",
        options: ["2 pontos; tratamento ambulatorial.", "3 pontos; considerar internaÃ§Ã£o hospitalar.", "4 pontos; internaÃ§Ã£o hospitalar, possivelmente em UTI.", "5 pontos; internaÃ§Ã£o obrigatÃ³ria em UTI.", "1 ponto; tratamento ambulatorial."],
        correctAnswer: "5 pontos; internaÃ§Ã£o obrigatÃ³ria em UTI.",
        explanation: "O paciente pontua em todos os 5 critÃ©rios do CURB-65: C (ConfusÃ£o), U (Ureia > 50 mg/dL), R (FR - 30), B (PA < 90/60) e 65 (Idade - 65). Uma pontuaÃ§Ã£o de 4 ou 5 indica pneumonia grave com alta mortalidade, sendo mandatÃ³ria a internaÃ§Ã£o em UTI."
    },
    {
        question: "Foi realizada toracentese em um paciente com derrame pleural. A anÃ¡lise do lÃ­quido mostrou: RelaÃ§Ã£o ProteÃ­na Pleural/SÃ©rica = 0.6; RelaÃ§Ã£o LDH Pleural/SÃ©rico = 0.7; LDH Pleural = 250 U/L (LDH sÃ©rico normal < 200 U/L). Como o derrame Ã© classificado?",
        options: ["Transudato.", "Exsudato, pois todos os trÃªs critÃ©rios estÃ£o preenchidos.", "Inconclusivo.", "Exsudato, pois pelo menos um dos critÃ©rios de Light estÃ¡ preenchido.", "Necessita de biÃ³psia para confirmaÃ§Ã£o."],
        correctAnswer: "Exsudato, pois pelo menos um dos critÃ©rios de Light estÃ¡ preenchido.",
        explanation: "Pelos critÃ©rios de Light, um derrame Ã© exsudato se preencher ao menos um dos seguintes: Prot P/S > 0.5; LDH P/S > 0.6; ou LDH P > 2/3 do limite superior do LDH sÃ©rico. Neste caso, todos os critÃ©rios sÃ£o preenchidos, confirmando o diagnÃ³stico de exsudato."
    },
    {
        question: "Homem de 65 anos, tabagista com DPOC, chega com piora da dispneia, aumento do volume e purulÃªncia do escarro. A gasometria arterial mostra pH 7.28, PaCO2 65 mmHg, PaO2 55 mmHg, HCO3 28 mEq/L. Qual o diagnÃ³stico do distÃºrbio acidobÃ¡sico?",
        options: ["Acidose metabÃ³lica compensada.", "Alcalose respiratÃ³ria crÃ´nica.", "Acidose respiratÃ³ria crÃ´nica agudizada.", "Alcalose metabÃ³lica.", "Acidose respiratÃ³ria compensada."],
        correctAnswer: "Acidose respiratÃ³ria crÃ´nica agudizada.",
        explanation: "O pH baixo com PaCO2 elevado indica acidose respiratÃ³ria. O bicarbonato (HCO3) estÃ¡ elevado, indicando uma compensaÃ§Ã£o metabÃ³lica crÃ´nica prÃ©-existente (devido Ã  DPOC). No entanto, a compensaÃ§Ã£o nÃ£o Ã© suficiente para normalizar o pH, caracterizando uma agudizaÃ§Ã£o."
    },
    {
        question: "Paciente de 50 anos, em pÃ³s-operatÃ³rio de artroplastia de quadril, desenvolve dispneia sÃºbita e dor torÃ¡cica. Apresenta FC de 110 bpm e edema assimÃ©trico de membro inferior. Pelo Escore de Wells, a probabilidade de TEP Ã© alta. Qual o exame de imagem de escolha?",
        options: ["Radiografia de tÃ³rax.", "Cintilografia de ventilaÃ§Ã£o-perfusÃ£o.", "Angiotomografia de tÃ³rax.", "Ecocardiograma transtorÃ¡cico.", "D-dÃ­mero."],
        correctAnswer: "Angiotomografia de tÃ³rax.",
        explanation: "Em pacientes com alta probabilidade clÃ­nica de tromboembolismo pulmonar (TEP), o D-dÃ­mero nÃ£o Ã© Ãºtil. O exame de imagem padrÃ£o-ouro para o diagnÃ³stico Ã© a angiotomografia de tÃ³rax, que permite a visualizaÃ§Ã£o direta dos trombos nas artÃ©rias pulmonares."
    },
    {
        question: "Um trabalhador rural desenvolve febre alta, tosse seca e dispneia 8 horas apÃ³s limpar um galinheiro infestado por pombos. A radiografia de tÃ³rax mostra infiltrado micronodular difuso. Qual o diagnÃ³stico mais provÃ¡vel?",
        options: ["Pneumonia bacteriana comunitÃ¡ria.", "Tuberculose miliar.", "Pneumonite de hipersensibilidade aguda.", "Sarcoidose.", "Aspergilose broncopulmonar alÃ©rgica."],
        correctAnswer: "Pneumonite de hipersensibilidade aguda.",
        explanation: "A histÃ³ria de exposiÃ§Ã£o ocupacional a antÃ­genos orgÃ¢nicos (fezes de aves) seguida por um quadro respiratÃ³rio agudo (febre, tosse, dispneia) horas apÃ³s a exposiÃ§Ã£o Ã© a apresentaÃ§Ã£o clÃ¡ssica da pneumonite de hipersensibilidade aguda, tambÃ©m conhecida como 'pulmÃ£o do fazendeiro'."
    },
    {
        question: "Um jovem asmÃ¡tico em crise grave, recebendo tratamento, evolui com sonolÃªncia e 'tÃ³rax silencioso' na ausculta. Qual a interpretaÃ§Ã£o e a conduta imediata?",
        options: ["Melhora do quadro; manter tratamento.", "Fadiga muscular e obstruÃ§Ã£o crÃ­tica; preparar para intubaÃ§Ã£o orotraqueal.", "PneumotÃ³rax espontÃ¢neo; realizar radiografia.", "Efeito colateral do corticoide; reduzir a dose.", "Crise de ansiedade; administrar benzodiazepÃ­nico."],
        correctAnswer: "Fadiga muscular e obstruÃ§Ã£o crÃ­tica; preparar para intubaÃ§Ã£o orotraqueal.",
        explanation: "O 'tÃ³rax silencioso' em uma crise de asma nÃ£o significa melhora, mas sim uma obstruÃ§Ã£o tÃ£o severa que o fluxo aÃ©reo Ã© mÃ­nimo, sendo um sinal de falÃªncia respiratÃ³ria iminente. A sonolÃªncia indica hipercapnia. A intubaÃ§Ã£o orotraqueal e ventilaÃ§Ã£o mecÃ¢nica sÃ£o urgentes."
    },
    {
        question: "Um paciente com carcinoma de pequenas cÃ©lulas de pulmÃ£o apresenta edema facial, pletora, turgÃªncia jugular e circulaÃ§Ã£o colateral no tÃ³rax superior. Qual o diagnÃ³stico sindrÃ´mico e a medida terapÃªutica inicial mais importante?",
        options: ["SÃ­ndrome de Pancoast; radioterapia local.", "SÃ­ndrome da veia cava superior; quimioterapia e/ou radioterapia de urgÃªncia.", "SÃ­ndrome paraneoplÃ¡sica; corticoterapia.", "Tamponamento cardÃ­aco; pericardiocentese.", "Embolia pulmonar; anticoagulaÃ§Ã£o."],
        correctAnswer: "SÃ­ndrome da veia cava superior; quimioterapia e/ou radioterapia de urgÃªncia.",
        explanation: "O quadro clÃ­nico Ã© caracterÃ­stico da sÃ­ndrome da veia cava superior, uma emergÃªncia oncolÃ³gica causada pela compressÃ£o da veia. Como o carcinoma de pequenas cÃ©lulas Ã© altamente quimio e radiossensÃ­vel, o tratamento oncolÃ³gico de urgÃªncia Ã© a prioridade para aliviar a compressÃ£o."
    },
    {
        question: "Tomografia de tÃ³rax de um homem de 65 anos, tabagista, revela um nÃ³dulo pulmonar de 1,5 cm, de contornos espiculados, no lobo superior direito. Qual Ã© a conduta mais apropriada?",
        options: ["Acompanhamento com nova tomografia em 3 meses.", "Realizar PET-CT para avaliaÃ§Ã£o metabÃ³lica.", "Indicar broncoscopia com biÃ³psia.", "Proceder com biÃ³psia percutÃ¢nea guiada por tomografia.", "ObservaÃ§Ã£o, pois o nÃ³dulo Ã© pequeno."],
        correctAnswer: "Proceder com biÃ³psia percutÃ¢nea guiada por tomografia.",
        explanation: "Em um paciente de alto risco (tabagista, idoso) com um nÃ³dulo pulmonar de caracterÃ­sticas suspeitas (espiculado), a investigaÃ§Ã£o para confirmaÃ§Ã£o histopatolÃ³gica Ã© mandatÃ³ria. Para um nÃ³dulo perifÃ©rico como o descrito, a biÃ³psia percutÃ¢nea guiada por TC Ã© o mÃ©todo de escolha."
    },
    {
        question: "Homem de 50 anos, etilista, refere tosse produtiva hÃ¡ 3 meses, com laivos de sangue, febre vespertina, sudorese noturna e emagrecimento. A radiografia de tÃ³rax mostra uma cavitaÃ§Ã£o em Ã¡pice pulmonar direito. Qual o exame confirmatÃ³rio para a principal hipÃ³tese?",
        options: ["PPD (teste tuberculÃ­nico).", "Tomografia de tÃ³rax.", "Pesquisa de BAAR no escarro.", "Broncoscopia com lavado broncoalveolar.", "Sorologia para HIV."],
        correctAnswer: "Pesquisa de BAAR no escarro.",
        explanation: "O quadro clÃ­nico e radiolÃ³gico Ã© altamente sugestivo de tuberculose pulmonar. O diagnÃ³stico de certeza Ã© feito pela demonstraÃ§Ã£o do agente etiolÃ³gico, o Mycobacterium tuberculosis, atravÃ©s da baciloscopia (pesquisa de BAAR) no escarro."
    },
    {
        question: "Paciente de 48 anos, obeso, refere roncos altos, pausas respiratÃ³rias durante o sono e sonolÃªncia diurna excessiva. Qual o exame padrÃ£o-ouro para o diagnÃ³stico da SÃ­ndrome da Apneia Obstrutiva do Sono (SAOS)?",
        options: ["Eletroencefalograma.", "Polissonografia.", "Tomografia de seios da face.", "Oximetria noturna.", "Escala de sonolÃªncia de Epworth."],
        correctAnswer: "Polissonografia.",
        explanation: "A polissonografia Ã© o exame padrÃ£o-ouro para o diagnÃ³stico de SAOS. Ele monitora diversas variÃ¡veis fisiolÃ³gicas durante o sono (fluxo aÃ©reo, esforÃ§o respiratÃ³rio, saturaÃ§Ã£o de oxigÃªnio, estÃ¡gios do sono), permitindo a confirmaÃ§Ã£o e a quantificaÃ§Ã£o da gravidade do distÃºrbio."
    },
    {
        question: "Um paciente com histÃ³ria de tabagismo pesado apresenta baqueteamento digital e dor em ossos longos. A radiografia mostra reaÃ§Ã£o periosteal. Suspeita-se de osteoartropatia hipertrÃ³fica. Qual tipo de cÃ¢ncer de pulmÃ£o estÃ¡ mais associado a esta sÃ­ndrome?",
        options: ["Carcinoma de pequenas cÃ©lulas.", "Adenocarcinoma.", "Carcinoma de grandes cÃ©lulas.", "Carcinoma epidermoide.", "Tumor carcinoide."],
        correctAnswer: "Adenocarcinoma.",
        explanation: "A osteoartropatia hipertrÃ³fica Ã© uma sÃ­ndrome paraneoplÃ¡sica classicamente associada aos cÃ¢nceres de pulmÃ£o de nÃ£o pequenas cÃ©lulas, sendo o adenocarcinoma o tipo histolÃ³gico mais frequentemente implicado."
    },
    {
        question: "Paciente HIV positivo, com contagem de T-CD4 de 80 cÃ©lulas/mmÂ³, apresenta dispneia progressiva e tosse seca. A radiografia de tÃ³rax revela infiltrado intersticial difuso bilateral. A LDH sÃ©rica estÃ¡ muito elevada. Qual Ã© o agente etiolÃ³gico mais provÃ¡vel?",
        options: ["Streptococcus pneumoniae.", "Mycobacterium tuberculosis.", "Pneumocystis jirovecii.", "Cryptococcus neoformans.", "CitomegalovÃ­rus."],
        correctAnswer: "Pneumocystis jirovecii.",
        explanation: "Em um paciente com Aids e imunossupressÃ£o grave (CD4 < 200), a pneumonia com infiltrado intersticial bilateral e LDH elevado Ã© a apresentaÃ§Ã£o tÃ­pica da pneumonia por Pneumocystis jirovecii (PCP)."
    },
    {
        question: "A anÃ¡lise do lÃ­quido pleural de um derrame parapneumÃ´nico revelou pH de 7.10, glicose de 30 mg/dL e bacteriologia positiva. Qual Ã© a conduta indicada?",
        options: ["Manter apenas a antibioticoterapia sistÃªmica.", "Realizar toracocentese de alÃ­vio diÃ¡ria.", "Indicar a drenagem torÃ¡cica em selo d'Ã¡gua.", "Instilar fibrinolÃ­tico no espaÃ§o pleural.", "Acompanhar com radiografias seriadas."],
        correctAnswer: "Indicar a drenagem torÃ¡cica em selo d'Ã¡gua.",
        explanation: "A presenÃ§a de pH < 7.20, glicose < 60 mg/dL ou a identificaÃ§Ã£o de bactÃ©rias (Gram ou cultura) no lÃ­quido pleural classifica o derrame como complicado ou empiema, sendo mandatÃ³ria a drenagem torÃ¡cica em selo d'Ã¡gua, alÃ©m da antibioticoterapia sistÃªmica."
    },
    {
        question: "Uma mulher de 65 anos, nÃ£o tabagista, apresenta dispneia aos esforÃ§os e tosse seca hÃ¡ 2 anos. A ausculta pulmonar revela estertores crepitantes finos ('em velcro') bibasais. A tomografia de tÃ³rax mostra faveolamento e bronquiectasias de traÃ§Ã£o. Qual o diagnÃ³stico?",
        options: ["Pneumonite de hipersensibilidade crÃ´nica.", "Sarcoidose.", "Fibrose pulmonar idiopÃ¡tica.", "Bronquiolite obliterante com pneumonia em organizaÃ§Ã£o (BOOP).", "Asma."],
        correctAnswer: "Fibrose pulmonar idiopÃ¡tica.",
        explanation: "A combinaÃ§Ã£o de estertores em velcro, idade avanÃ§ada e o padrÃ£o tomogrÃ¡fico de pneumonia intersticial usual (faveolamento, predomÃ­nio basal e perifÃ©rico) sÃ£o caracterÃ­sticos da Fibrose Pulmonar IdiopÃ¡tica."
    },
    {
        question: "Paciente com DPOC grave dÃ¡ entrada na emergÃªncia com sonolÃªncia e acidose respiratÃ³ria (pH 7.25, PaCO2 70 mmHg). ApÃ³s tratamento inicial, permanece sonolento. Qual a prÃ³xima conduta?",
        options: ["Aumentar a FiO2 para 50%.", "Iniciar ventilaÃ§Ã£o nÃ£o invasiva (VNI) com dois nÃ­veis de pressÃ£o (BIPAP).", "Realizar intubaÃ§Ã£o orotraqueal e ventilaÃ§Ã£o mecÃ¢nica invasiva.", "Administrar bicarbonato de sÃ³dio.", "Iniciar antibioticoterapia."],
        correctAnswer: "Iniciar ventilaÃ§Ã£o nÃ£o invasiva (VNI) com dois nÃ­veis de pressÃ£o (BIPAP).",
        explanation: "A ventilaÃ§Ã£o nÃ£o invasiva Ã© a terapia de primeira linha para pacientes com exacerbaÃ§Ã£o de DPOC e acidose respiratÃ³ria hipercÃ¡pnica que nÃ£o respondem ao tratamento clÃ­nico inicial. Ela ajuda a diminuir o trabalho respiratÃ³rio, corrigir a hipercapnia e evitar a intubaÃ§Ã£o."
    },
    {
        question: "Uma mulher de 68 anos, pesando 60 kg, apresenta creatinina sÃ©rica de 2,8 mg/dL. Utilizando a fÃ³rmula de Cockcroft-Gault, qual Ã© a TFG estimada e o estÃ¡gio da DRC?",
        options: ["TFG ~45 mL/min; EstÃ¡gio 3a.", "TFG ~18 mL/min; EstÃ¡gio 4.", "TFG ~65 mL/min; EstÃ¡gio 2.", "TFG ~10 mL/min; EstÃ¡gio 5.", "TFG ~35 mL/min; EstÃ¡gio 3b."],
        correctAnswer: "TFG ~18 mL/min; EstÃ¡gio 4.",
        explanation: "CÃ¡lculo: [(140 - 68) * 60] / (72 * 2.8) * 0.85 = [72 * 60] / 201.6 * 0.85 = 4320 / 201.6 * 0.85 = 21.42 * 0.85 -^ 18.2 mL/min. Uma TFG entre 15-29 mL/min classifica a DRC como EstÃ¡gio 4."
    },
    {
        question: "Paciente no 2Âº dia de pÃ³s-operatÃ³rio de tireoidectomia total refere parestesia perioral e em extremidades. Apresenta sinal de Chvostek positivo. Qual o distÃºrbio eletrolÃ­tico mais provÃ¡vel?",
        options: ["Hipocalemia.", "Hipercalemia.", "Hipocalcemia.", "Hipomagnesemia.", "Hiperfosfatemia."],
        correctAnswer: "Hipocalcemia.",
        explanation: "A hipocalcemia Ã© uma complicaÃ§Ã£o comum da tireoidectomia total devido Ã  remoÃ§Ã£o ou desvascularizaÃ§Ã£o inadvertida das glÃ¢ndulas paratireoides, levando Ã  hiperexcitabilidade neuromuscular (parestesias, tetania, sinais de Chvostek e Trousseau)."
    },
    {
        question: "DiabÃ©tico com DRC em uso de IECA apresenta potÃ¡ssio de 6,2 mEq/L, sem alteraÃ§Ãµes no ECG. Qual a conduta inicial mais adequada?",
        options: ["Suspender o IECA, prescrever diurÃ©tico de alÃ§a e resina de troca iÃ´nica.", "Administrar gluconato de cÃ¡lcio endovenoso.", "Indicar hemodiÃ¡lise de urgÃªncia.", "Administrar soluÃ§Ã£o polarizante (glico-insulina).", "Apenas orientar dieta pobre em potÃ¡ssio."],
        correctAnswer: "Suspender o IECA, prescrever diurÃ©tico de alÃ§a e resina de troca iÃ´nica.",
        explanation: "Na hipercalemia leve a moderada (K < 6.5 mEq/L) sem alteraÃ§Ãµes eletrocardiogrÃ¡ficas, o manejo inicial consiste em remover as causas (suspender o IECA), aumentar a excreÃ§Ã£o de potÃ¡ssio (diurÃ©ticos de alÃ§a, resinas de troca) e restringir a ingestÃ£o dietÃ©tica."
    },
    {
        question: "Paciente com insuficiÃªncia cardÃ­aca em uso de furosemida apresenta cÃ£ibras e hipocalemia. Qual medicaÃ§Ã£o, se associada, poderia ter prevenido este efeito adverso?",
        options: ["Hidroclorotiazida.", "Anlodipino.", "Espironolactona.", "Manitol.", "Propranolol."],
        correctAnswer: "Espironolactona.",
        explanation: "A espironolactona Ã© um diurÃ©tico poupador de potÃ¡ssio. Sua associaÃ§Ã£o com um diurÃ©tico de alÃ§a como a furosemida (que aumenta a excreÃ§Ã£o de potÃ¡ssio) Ã© uma estratÃ©gia comum para manter a normocalemia e potencializar o efeito diurÃ©tico."
    },
    {
        question: "Um paciente etilista crÃ´nico internado desenvolve taquicardia ventricular do tipo 'torsades de pointes'. Seus exames revelam hipocalemia refrÃ¡tÃ¡ria. Qual outro distÃºrbio eletrolÃ­tico deve ser investigado e corrigido?",
        options: ["Hiponatremia.", "Hipocalcemia.", "Hipofosfatemia.", "Hipomagnesemia.", "Hipercloremia."],
        correctAnswer: "Hipomagnesemia.",
        explanation: "A hipomagnesemia Ã© comum em etilistas e pode causar hipocalemia refrÃ¡tÃ¡ria (impede a correÃ§Ã£o do potÃ¡ssio) e prolongamento do intervalo QT, predispondo a arritmias como 'torsades de pointes'. A correÃ§Ã£o do magnÃ©sio Ã© fundamental."
    },
    {
        question: "Paciente com tumor de pequenas cÃ©lulas do pulmÃ£o, hiponatremia, euvolemia e urina concentrada. Qual o diagnÃ³stico?",
        options: ["Diabetes insipidus nefrogÃªnico.", "SÃ­ndrome cerebral perdedora de sal.", "SÃ­ndrome da secreÃ§Ã£o inapropriada do hormÃ´nio antidiurÃ©tico (SIADH).", "InsuficiÃªncia adrenal.", "Polidipsia psicogÃªnica."],
        correctAnswer: "SÃ­ndrome da secreÃ§Ã£o inapropriada do hormÃ´nio antidiurÃ©tico (SIADH).",
        explanation: "A combinaÃ§Ã£o de hiponatremia, euvolemia, baixa osmolaridade sÃ©rica e urina inapropriadamente concentrada (alta osmolaridade urinÃ¡ria e sÃ³dio urinÃ¡rio elevado) em um paciente com cÃ¢ncer de pequenas cÃ©lulas de pulmÃ£o Ã© a apresentaÃ§Ã£o clÃ¡ssica da SIADH paraneoplÃ¡sica."
    },
    {
        question: "Homem com vÃ´mitos persistentes apresenta gasometria com pH 7.55, PaCO2 48 mmHg e HCO3 38 mEq/L. Qual o tratamento fundamental para a correÃ§Ã£o deste distÃºrbio?",
        options: ["ReposiÃ§Ã£o de bicarbonato.", "AdministraÃ§Ã£o de acetazolamida.", "InfusÃ£o de soluÃ§Ã£o salina isotÃ´nica (0,9%) com reposiÃ§Ã£o de potÃ¡ssio.", "VentilaÃ§Ã£o nÃ£o invasiva para reter CO2.", "Inibidor de bomba de prÃ³tons."],
        correctAnswer: "InfusÃ£o de soluÃ§Ã£o salina isotÃ´nica (0,9%) com reposiÃ§Ã£o de potÃ¡ssio.",
        explanation: "O paciente apresenta alcalose metabÃ³lica hipoclorÃªmica e hipocalÃªmica. A perda de Ã¡cido clorÃ­drico e a contraÃ§Ã£o volÃªmica perpetuam a alcalose. O tratamento consiste na reposiÃ§Ã£o de volume, cloreto e potÃ¡ssio com soluÃ§Ã£o salina isotÃ´nica."
    },
    {
        question: "Idosa com diarreia aguda, desidratada, com Ureia = 150 mg/dL e Creatinina = 3.0 mg/dL (basal 1.0). A relaÃ§Ã£o Ureia/Creatinina > 40 e o sÃ³dio urinÃ¡rio Ã© baixo. Qual o tipo da lesÃ£o renal aguda?",
        options: ["PÃ³s-renal, por obstruÃ§Ã£o.", "Intrarrenal, por necrose tubular aguda.", "PrÃ©-renal, por hipovolemia.", "Intrarrenal, por nefrite intersticial.", "SÃ­ndrome cardiorrenal."],
        correctAnswer: "PrÃ©-renal, por hipovolemia.",
        explanation: "A desidrataÃ§Ã£o leva Ã  hipoperfusÃ£o renal, causando uma lesÃ£o renal aguda prÃ©-renal. Isso Ã© caracterizado por oligÃºria, aumento desproporcional da ureia em relaÃ§Ã£o Ã  creatinina (Ur/Cr > 40) e um sÃ³dio urinÃ¡rio baixo (< 20 mEq/L) devido Ã  Ã¡vida reabsorÃ§Ã£o renal de sÃ³dio e Ã¡gua."
    },
    {
        question: "Paciente com hematÃºria e rÃ¡pida deterioraÃ§Ã£o da funÃ§Ã£o renal. A biÃ³psia renal revela a presenÃ§a de crescentes na maioria dos glomÃ©rulos. Qual o tratamento de induÃ§Ã£o de escolha?",
        options: ["Apenas inibidores da ECA.", "Prednisona em monoterapia.", "Pulsoterapia com metilprednisolona e ciclofosfamida.", "PlasmafÃ©rese isolada.", "DiurÃ©ticos e controle pressÃ³rico."],
        correctAnswer: "Pulsoterapia com metilprednisolona e ciclofosfamida.",
        explanation: "A glomerulonefrite rapidamente progressiva (GNRP), caracterizada por crescentes na biÃ³psia, Ã© uma emergÃªncia nefrolÃ³gica. O tratamento de induÃ§Ã£o Ã© agressivo, geralmente com pulsoterapia de corticoide associada a um imunossupressor como a ciclofosfamida (ou rituximabe)."
    },
    {
        question: "Para um paciente com DM tipo 2, quando se deve iniciar o rastreamento de microalbuminÃºria e qual a principal classe de fÃ¡rmaco para nefroproteÃ§Ã£o?",
        options: ["5 anos apÃ³s o diagnÃ³stico; bloqueadores de cÃ¡lcio.", "No momento do diagnÃ³stico; IECA ou BRA.", "Apenas se a creatinina estiver elevada; betabloqueadores.", "No momento do diagnÃ³stico; diurÃ©ticos tiazÃ­dicos.", "10 anos apÃ³s o diagnÃ³stico; estatinas."],
        correctAnswer: "No momento do diagnÃ³stico; IECA ou BRA.",
        explanation: "O rastreamento de nefropatia diabÃ©tica com a pesquisa de albumina na urina deve ser iniciado no momento do diagnÃ³stico de DM tipo 2. Caso a microalbuminÃºria seja detectada, os inibidores da ECA (IECA) ou bloqueadores do receptor de angiotensina (BRA) sÃ£o as drogas de escolha para nefroproteÃ§Ã£o."
    },
    {
        question: "Um jovem de 18 anos desenvolve hematÃºria macroscÃ³pica 5 dias apÃ³s um episÃ³dio de faringoamigdalite. Os nÃ­veis do complemento sÃ©rico estÃ£o normais. Qual o diagnÃ³stico mais provÃ¡vel?",
        options: ["Glomerulonefrite pÃ³s-estreptocÃ³cica.", "Nefropatia por IgA (DoenÃ§a de Berger).", "SÃ­ndrome de Alport.", "Glomeruloesclerose segmentar e focal.", "Nefrite lÃºpica."],
        correctAnswer: "Nefropatia por IgA (DoenÃ§a de Berger).",
        explanation: "A hematÃºria macroscÃ³pica que ocorre de forma sincrÃ´nica ou poucos dias apÃ³s uma infecÃ§Ã£o de via aÃ©rea superior, associada a nÃ­veis normais de complemento, Ã© a apresentaÃ§Ã£o clÃ¡ssica da Nefropatia por IgA, a glomerulonefrite primÃ¡ria mais comum no mundo."
    },
    {
        question: "Paciente com DRC estÃ¡gio 4 apresenta hemoglobina de 9,5 g/dL. A saturaÃ§Ã£o de transferrina Ã© de 15% e a ferritina de 80 ng/mL. Qual a conduta inicial para o tratamento da anemia?",
        options: ["Iniciar eritropoetina recombinante (EPO).", "Realizar transfusÃ£o de concentrado de hemÃ¡cias.", "Repor ferro por via endovenosa.", "Iniciar reposiÃ§Ã£o de Vitamina B12 e folato.", "Apenas observar."],
        correctAnswer: "Repor ferro por via endovenosa.",
        explanation: "Antes de iniciar agentes estimuladores da eritropoese (EPO), Ã© fundamental garantir que os estoques de ferro estejam adequados. SaturaÃ§Ã£o de transferrina < 20% e ferritina < 100 ng/mL indicam deficiÃªncia de ferro, que deve ser corrigida primeiro, preferencialmente com ferro endovenoso em pacientes com DRC avanÃ§ada."
    },
    {
        question: "Paciente em tratamento com lÃ­tio Ã© admitido com ataxia e confusÃ£o mental. A litemia Ã© de 3.8 mEq/L. Qual Ã© a terapia de escolha para remover o lÃ­tio?",
        options: ["Diurese forÃ§ada com soro fisiolÃ³gico.", "HemodiÃ¡lise.", "CarvÃ£o ativado.", "Lavagem gÃ¡strica.", "Poliestirenossulfonato de cÃ¡lcio."],
        correctAnswer: "HemodiÃ¡lise.",
        explanation: "O lÃ­tio Ã© uma molÃ©cula pequena, nÃ£o ligada a proteÃ­nas e com baixo volume de distribuiÃ§Ã£o, tornando-o idealmente removÃ­vel por hemodiÃ¡lise. A diÃ¡lise estÃ¡ indicada em intoxicaÃ§Ãµes graves (sintomas neurolÃ³gicos, litemia > 2.5-3.0 mEq/L) para acelerar sua eliminaÃ§Ã£o."
    },
    {
        question: "Paciente Ã© encontrado desacordado. Gasometria: pH 7.15, PaCO2 20 mmHg, HCO3 8 mEq/L. EletrÃ³litos: Na 140, Cl 102. Qual intoxicaÃ§Ã£o Ã© uma causa clÃ¡ssica deste distÃºrbio?",
        options: ["BenzodiazepÃ­nicos.", "Metanol.", "Opioides.", "Digoxina.", "Paracetamol."],
        correctAnswer: "Metanol.",
        explanation: "O paciente apresenta uma acidose metabÃ³lica com Ã¢nion-gap elevado [140 - (102 + 8) = 30]. IntoxicaÃ§Ãµes por certas substÃ¢ncias, como Metanol, Uremia, Cetoacidose DiabÃ©tica, Paracetamol, Isoniazida/Ferro, Lactato, Etilenoglicol, Salicilatos (MUDPILES) causam este tipo de distÃºrbio."
    },
    {
        question: "Um atleta de maratona Ã© hospitalizado com mialgia intensa e urina escura. Os exames mostram CPK de 50.000 U/L. Qual Ã© a principal medida para prevenir a insuficiÃªncia renal aguda?",
        options: ["RestriÃ§Ã£o hÃ­drica rigorosa.", "AdministraÃ§Ã£o de AINEs.", "HidrataÃ§Ã£o endovenosa vigorosa com soluÃ§Ã£o salina.", "AdministraÃ§Ã£o de gluconato de cÃ¡lcio.", "AlcalinizaÃ§Ã£o da urina com manitol."],
        correctAnswer: "HidrataÃ§Ã£o endovenosa vigorosa com soluÃ§Ã£o salina.",
        explanation: "Na rabdomiÃ³lise, a lesÃ£o renal aguda ocorre pela deposiÃ§Ã£o de mioglobina nos tÃºbulos renais. A medida mais importante para a prevenÃ§Ã£o Ã© a hidrataÃ§Ã£o endovenosa vigorosa para aumentar o fluxo urinÃ¡rio, diluir a mioglobina e 'lavar' os tÃºbulos, prevenindo a obstruÃ§Ã£o."
    },
    {
        question: "Um paciente etilista Ã© admitido com hematÃªmese, ascite moderada, icterÃ­cia (Bilirrubina 4,5 mg/dL), encefalopatia grau II, INR de 2,0 e albumina de 2,5 g/dL. Qual a sua classificaÃ§Ã£o de Child-Pugh?",
        options: ["Child-Pugh A.", "Child-Pugh B.", "Child-Pugh C.", "NÃ£o Ã© possÃ­vel classificar.", "MELD 15."],
        correctAnswer: "Child-Pugh C.",
        explanation: "PontuaÃ§Ã£o: Ascite (2), Encefalopatia (2), Bilirrubina > 3 (3), Albumina < 2.8 (3), INR 1.7-2.2 (2). Total: 2+2+3+3+2 = 12 pontos. Uma pontuaÃ§Ã£o de 10-15 corresponde Ã  classe C de Child-Pugh, indicando doenÃ§a hepÃ¡tica avanÃ§ada."
    },
    {
        question: "Homem de 40 anos, etilista, apresenta dor epigÃ¡strica sÃºbita, intensa, em faixa, irradiada para o dorso, com nÃ¡useas e vÃ´mitos. A amilase e lipase estÃ£o trÃªs vezes acima do limite superior da normalidade. Qual o diagnÃ³stico?",
        options: ["slcera pÃ©ptica perfurada.", "Colecistite aguda.", "Pancreatite aguda.", "Infarto agudo do miocÃ¡rdio.", "ObstruÃ§Ã£o intestinal alta."],
        correctAnswer: "Pancreatite aguda.",
        explanation: "O diagnÃ³stico de pancreatite aguda Ã© feito com base em 2 de 3 critÃ©rios: 1) dor abdominal caracterÃ­stica, 2) enzimas pancreÃ¡ticas (amilase ou lipase) - 3 vezes o limite superior da normalidade, e 3) achados de imagem caracterÃ­sticos. O paciente preenche os dois primeiros critÃ©rios."
    },
    {
        question: "Mulher de 45 anos, obesa, multÃ­para, queixa-se de dor tipo cÃ³lica em hipocÃ´ndrio direito, com duraÃ§Ã£o de 2 horas, iniciada apÃ³s refeiÃ§Ã£o gordurosa. O sinal de Murphy Ã© negativo. Qual a principal hipÃ³tese diagnÃ³stica?",
        options: ["Colecistite aguda.", "CÃ³lica biliar.", "Pancreatite aguda.", "DoenÃ§a do refluxo gastroesofÃ¡gico.", "Hepatite aguda."],
        correctAnswer: "CÃ³lica biliar.",
        explanation: "A dor transitÃ³ria no hipocÃ´ndrio direito relacionada Ã  ingestÃ£o de alimentos gordurosos, em uma paciente com fatores de risco para colelitÃ­ase ('4 Fs': female, forty, fat, fertile), Ã© caracterÃ­stica da cÃ³lica biliar (obstruÃ§Ã£o transitÃ³ria do ducto cÃ­stico). A ausÃªncia do sinal de Murphy afasta a colecistite aguda."
    },
    {
        question: "Paciente cirrÃ³tico com ascite Ã© admitido com febre e dor abdominal. A paracentese diagnÃ³stica revela contagem de polimorfonucleares (PMN) de 450 cÃ©lulas/mmÂ³ no lÃ­quido ascÃ­tico. Qual a conduta terapÃªutica imediata?",
        options: ["Aguardar a cultura do lÃ­quido ascÃ­tico.", "Iniciar antibioticoterapia empÃ­rica com uma cefalosporina de terceira geraÃ§Ã£o.", "Realizar laparotomia exploradora.", "Iniciar diurÃ©ticos.", "Indicar paracentese de grande volume."],
        correctAnswer: "Iniciar antibioticoterapia empÃ­rica com uma cefalosporina de terceira geraÃ§Ã£o.",
        explanation: "Uma contagem de neutrÃ³filos - 250 cÃ©lulas/mmÂ³ no lÃ­quido ascÃ­tico Ã© diagnÃ³stica de Peritonite Bacteriana EspontÃ¢nea (PBE). O tratamento com antibiÃ³ticos (ex: ceftriaxona) deve ser iniciado imediatamente, sem aguardar o resultado da cultura."
    },
    {
        question: "Jovem de 22 anos apresenta diarreia crÃ´nica nÃ£o sanguinolenta, dor em fossa ilÃ­aca direita e perda de peso. A colonoscopia revela inflamaÃ§Ã£o salteada, com Ãºlceras aftoides e aspecto de 'pedra de calÃ§amento' no Ã­leo terminal e cÃ³lon. Qual o diagnÃ³stico?",
        options: ["Retocolite Ulcerativa.", "DoenÃ§a de Crohn.", "SÃ­ndrome do intestino irritÃ¡vel.", "DoenÃ§a celÃ­aca.", "Colite infecciosa."],
        correctAnswer: "DoenÃ§a de Crohn.",
        explanation: "As caracterÃ­sticas como acometimento do Ã­leo terminal, inflamaÃ§Ã£o transmural e salteada (Ã¡reas sadias entre Ã¡reas doentes) e o aspecto de 'pedra de calÃ§amento' sÃ£o achados endoscÃ³picos clÃ¡ssicos da DoenÃ§a de Crohn."
    },
    {
        question: "Paciente com icterÃ­cia, colÃºria e acolia fecal. A ultrassonografia mostra dilataÃ§Ã£o do colÃ©doco com cÃ¡lculo em sua porÃ§Ã£o distal. Qual o procedimento de escolha para tratamento?",
        options: ["Coledocotomia por laparotomia.", "Colecistectomia videolaparoscÃ³pica isolada.", "Colangiopancreatografia retrÃ³grada endoscÃ³pica (CPRE) com papilotomia.", "Drenagem biliar percutÃ¢nea.", "Tratamento conservador."],
        correctAnswer: "Colangiopancreatografia retrÃ³grada endoscÃ³pica (CPRE) com papilotomia.",
        explanation: "O quadro Ã© de icterÃ­cia obstrutiva por coledocolitÃ­ase. A CPRE Ã© o procedimento de escolha pois Ã© diagnÃ³stica e terapÃªutica, permitindo a remoÃ§Ã£o do cÃ¡lculo do colÃ©doco atravÃ©s da papilotomia endoscÃ³pica."
    },
    {
        question: "Paciente com pancreatite aguda apresenta na admissÃ£o: 60 anos, leucocitose de 18.000/mmÂ³, glicemia de 250 mg/dL, LDH de 400 U/L e AST de 300 U/L. Qual a pontuaÃ§Ã£o pelos critÃ©rios de Ranson na admissÃ£o?",
        options: ["2 pontos.", "3 pontos.", "4 pontos.", "5 pontos.", "NÃ£o Ã© possÃ­vel calcular na admissÃ£o."],
        correctAnswer: "5 pontos.",
        explanation: "Os critÃ©rios de Ranson na admissÃ£o sÃ£o: Idade > 55, LeucÃ³citos > 16.000, Glicemia > 200, LDH > 350, TGO/AST > 250. O paciente preenche todos os 5 critÃ©rios, indicando um prognÃ³stico de pancreatite aguda grave."
    },
    {
        question: "Qual das seguintes opÃ§Ãµes NÃƒO Ã© um tratamento para ascite refratÃ¡ria em paciente cirrÃ³tico?",
        options: ["Paracenteses de grande volume seriadas.", "InstalaÃ§Ã£o de um TIPS (shunt portossistÃªmico).", "Aumento da dose de furosemida para 200 mg/dia.", "Transplante hepÃ¡tico.", "RestriÃ§Ã£o de sÃ³dio na dieta."],
        correctAnswer: "Aumento da dose de furosemida para 200 mg/dia.",
        explanation: "A dose mÃ¡xima recomendada de furosemida no manejo da ascite Ã© de 160 mg/dia. Doses superiores nÃ£o aumentam a eficÃ¡cia e elevam o risco de efeitos adversos. As outras opÃ§Ãµes sÃ£o terapias vÃ¡lidas para ascite refrÃ¡tÃ¡ria."
    },
    {
        question: "Mulher de 40 anos refere disfagia para sÃ³lidos e lÃ­quidos e regurgitaÃ§Ã£o. O esofagograma baritado mostra dilataÃ§Ã£o do esÃ´fago com afilamento distal, em 'bico de pÃ¡ssaro'. Qual o diagnÃ³stico mais provÃ¡vel?",
        options: ["CÃ¢ncer de esÃ´fago.", "Esofagite eosinofÃ­lica.", "Acalasia.", "Espasmo esofagiano difuso.", "Esclerodermia."],
        correctAnswer: "Acalasia.",
        explanation: "A disfagia para sÃ³lidos e lÃ­quidos, associada Ã  imagem radiolÃ³gica de dilataÃ§Ã£o esofÃ¡gica a montante com um estreitamento afilado no esfÃ­ncter esofagiano inferior (imagem em 'bico de pÃ¡ssaro' ou 'ponta de lÃ¡pis'), Ã© a apresentaÃ§Ã£o clÃ¡ssica da acalasia."
    },
    {
        question: "Idoso de 75 anos, estÃ¡vel hemodinamicamente, Ã© internado por enterorragia. ApÃ³s estabilizaÃ§Ã£o inicial, qual o exame de escolha para investigar a causa do sangramento?",
        options: ["Endoscopia digestiva alta.", "Colonoscopia.", "Tomografia computadorizada de abdome.", "Arteriografia mesenterÃ©rica.", "CÃ¡psula endoscÃ³pica."],
        correctAnswer: "Colonoscopia.",
        explanation: "Em um paciente estÃ¡vel com hemorragia digestiva baixa, a colonoscopia Ã© o exame de primeira linha. Ela permite a visualizaÃ§Ã£o direta da mucosa colÃ´nica, a identificaÃ§Ã£o da fonte do sangramento (ex: divertÃ­culos, angiodisplasias, tumores) e, em muitos casos, a realizaÃ§Ã£o de hemostasia terapÃªutica."
    },
    {
        question: "Uma paciente com diagnÃ³stico de doenÃ§a celÃ­aca, alÃ©m da diarreia e distensÃ£o abdominal, pode apresentar qual das seguintes manifestaÃ§Ãµes extraintestinais?",
        options: ["Artrite de grandes articulaÃ§Ãµes.", "Dermatite herpetiforme.", "UveÃ­te anterior.", "Pioderma gangrenoso.", "Eritema nodoso."],
        correctAnswer: "Dermatite herpetiforme.",
        explanation: "A dermatite herpetiforme Ã© uma manifestaÃ§Ã£o cutÃ¢nea patognomÃ´nica da doenÃ§a celÃ­aca. Caracteriza-se por lesÃµes papulovesiculares, intensamente pruriginosas, que surgem simetricamente em superfÃ­cies extensoras como cotovelos e joelhos."
    },
    {
        question: "Mulher jovem com elevaÃ§Ã£o de transaminases, hipergamaglobulinemia e anticorpo antimÃºsculo liso (FAN-AML) positivo. Qual o tratamento de primeira linha?",
        options: ["Ãcido ursodesoxicÃ³lico.", "Prednisona e azatioprina.", "Interferon peguilado.", "Penicilamina.", "Transplante hepÃ¡tico."],
        correctAnswer: "Prednisona e azatioprina.",
        explanation: "O quadro clÃ­nico e laboratorial Ã© tÃ­pico de Hepatite Autoimune tipo 1. O tratamento de primeira linha visa a induÃ§Ã£o da remissÃ£o com corticosteroides (prednisona), geralmente associados a um agente poupador de corticoide (azatioprina) para a manutenÃ§Ã£o."
    },
    {
        question: "Qual dos seguintes Ã© um fator precipitante comum para a encefalopatia hepÃ¡tica em um paciente cirrÃ³tico?",
        options: ["Dieta pobre em proteÃ­nas.", "Uso de diurÃ©ticos de alÃ§a.", "InfecÃ§Ã£o (ex: PBE).", "Hipoglicemia.", "Uso de propranolol."],
        correctAnswer: "InfecÃ§Ã£o (ex: PBE).",
        explanation: "Fatores precipitantes comuns para a encefalopatia hepÃ¡tica incluem: hemorragia digestiva, constipaÃ§Ã£o, uso de sedativos, distÃºrbios hidroeletrolÃ­ticos e, muito frequentemente, infecÃ§Ãµes, como a peritonite bacteriana espontÃ¢nea (PBE)."
    },
    {
        question: "Homem com pirose crÃ´nica realiza endoscopia que evidencia EsÃ´fago de Barrett sem displasia. Qual a conduta recomendada?",
        options: ["Esofagectomia.", "Tratamento com IBP e erradicaÃ§Ã£o do H. pylori.", "Acompanhamento endoscÃ³pico a cada 3-5 anos.", "AblaÃ§Ã£o por radiofrequÃªncia.", "Alta, pois nÃ£o hÃ¡ displasia."],
        correctAnswer: "Acompanhamento endoscÃ³pico a cada 3-5 anos.",
        explanation: "O EsÃ´fago de Barrett Ã© uma lesÃ£o prÃ©-maligna para o adenocarcinoma de esÃ´fago. Na ausÃªncia de displasia, a conduta consiste no tratamento clÃ­nico do refluxo com IBP e na vigilÃ¢ncia endoscÃ³pica periÃ³dica (a cada 3-5 anos) para detectar o surgimento de displasia."
    },
    {
        question: "Paciente assintomÃ¡tico apresenta elevaÃ§Ã£o isolada de fosfatase alcalina (FA) e gama-glutamil transferase (GGT). Qual a primeira etapa na investigaÃ§Ã£o diagnÃ³stica?",
        options: ["Realizar uma ultrassonografia de abdome para avaliar as vias biliares.", "Solicitar dosagem de anticorpo antimitocÃ´ndria (AMA).", "Realizar uma colangiorressonÃ¢ncia.", "Proceder com biÃ³psia hepÃ¡tica.", "Repetir os exames em 6 meses."],
        correctAnswer: "Realizar uma ultrassonografia de abdome para avaliar as vias biliares.",
        explanation: "A elevaÃ§Ã£o de FA e GGT indica um padrÃ£o colestÃ¡tico. O primeiro passo Ã© diferenciar entre uma causa intra-hepÃ¡tica e extra-hepÃ¡tica (obstrutiva). A ultrassonografia de abdome Ã© um mÃ©todo nÃ£o invasivo e eficaz para avaliar a presenÃ§a de dilataÃ§Ã£o das vias biliares, sugerindo uma obstruÃ§Ã£o."
    },
    {
        question: "Jovem de 24 anos acorda com incapacidade de fechar o olho esquerdo, desvio da comissura labial para a direita e ausÃªncia de rugas na fronte esquerda. Qual o diagnÃ³stico e tratamento?",
        options: ["Acidente vascular cerebral; trombÃ³lise.", "Paralisia de Bell; prednisona.", "Miastenia gravis; piridostigmina.", "Esclerose mÃºltipla; pulsoterapia.", "Tumor de Ã¢ngulo ponto-cerebelar; ressonÃ¢ncia."],
        correctAnswer: "Paralisia de Bell; prednisona.",
        explanation: "O quadro de paralisia facial perifÃ©rica (acometendo toda a hemiface, incluindo a fronte) de instalaÃ§Ã£o sÃºbita e idiopÃ¡tica Ã© denominado Paralisia de Bell. O tratamento de escolha Ã© a corticoterapia (prednisona) para reduzir a inflamaÃ§Ã£o do nervo facial."
    },
    {
        question: "Idoso de 70 anos apresenta lentidÃ£o de movimentos, tremor que piora em repouso na mÃ£o direita e rigidez plÃ¡stica (em roda dentada). Qual a principal hipÃ³tese diagnÃ³stica?",
        options: ["DoenÃ§a de Alzheimer.", "Tremor essencial.", "DoenÃ§a de Parkinson.", "CorÃ©ia de Huntington.", "Hidrocefalia de pressÃ£o normal."],
        correctAnswer: "DoenÃ§a de Parkinson.",
        explanation: "A trÃ­ade de tremor de repouso, bradicinesia (lentidÃ£o de movimentos) e rigidez plÃ¡stica sÃ£o os sinais cardinais da DoenÃ§a de Parkinson, uma doenÃ§a neurodegenerativa que afeta os nÃºcleos da base."
    },
    {
        question: "Paciente de 65 anos chega Ã  emergÃªncia com inÃ­cio sÃºbito de fraqueza no lado direito e dificuldade para falar hÃ¡ 2 horas. A TC de crÃ¢nio nÃ£o mostra sangramento. Qual a conduta?",
        options: ["EstÃ¡ fora da janela terapÃªutica.", "A trombÃ³lise com alteplase (rt-PA) estÃ¡ indicada.", "Aguardar 24 horas para iniciar aspirina.", "A trombectomia mecÃ¢nica Ã© a primeira escolha.", "A afasia contraindica a trombÃ³lise."],
        correctAnswer: "A trombÃ³lise com alteplase (rt-PA) estÃ¡ indicada.",
        explanation: "O paciente apresenta um AVC isquÃªmico agudo com tempo de evoluÃ§Ã£o conhecido de 2 horas. Estando dentro da janela terapÃªutica de 4,5 horas e sem contraindicaÃ§Ãµes (como hemorragia na TC), ele Ã© um candidato Ã  trombÃ³lise endovenosa com rt-PA."
    },
    {
        question: "Jovem de 20 anos apresenta febre alta, cefaleia intensa, vÃ´mitos, fotofobia e rigidez de nuca. Qual o exame essencial para confirmar a suspeita de meningite bacteriana?",
        options: ["Tomografia de crÃ¢nio.", "Hemocultura.", "AnÃ¡lise do lÃ­quido cefalorraquidiano (LCR) por punÃ§Ã£o lombar.", "Eletroencefalograma.", "RessonÃ¢ncia magnÃ©tica de encÃ©falo."],
        correctAnswer: "AnÃ¡lise do lÃ­quido cefalorraquidiano (LCR) por punÃ§Ã£o lombar.",
        explanation: "O quadro clÃ­nico Ã© altamente sugestivo de meningite. O exame padrÃ£o-ouro para o diagnÃ³stico Ã© a anÃ¡lise do LCR, obtido por punÃ§Ã£o lombar, que permite a contagem de cÃ©lulas, dosagem de proteÃ­nas e glicose, e a identificaÃ§Ã£o do agente etiolÃ³gico."
    },
    {
        question: "Um paciente inicia uma crise convulsiva tÃ´nico-clÃ´nica generalizada que nÃ£o cessa apÃ³s 5 minutos. Qual o diagnÃ³stico e a droga de primeira escolha para o tratamento imediato?",
        options: ["Crise de ausÃªncia; etossuximida.", "Estado de mal epilÃ©ptico; benzodiazepÃ­nico endovenoso.", "Crise parcial complexa; carbamazepina.", "SÃ­ncope convulsiva; manobras de contrapressÃ£o.", "Estado de mal epilÃ©ptico; fenitoÃ­na endovenosa."],
        correctAnswer: "Estado de mal epilÃ©ptico; benzodiazepÃ­nico endovenoso.",
        explanation: "Uma crise convulsiva que dura mais de 5 minutos Ã© definida como estado de mal epilÃ©ptico. A droga de primeira linha para a interrupÃ§Ã£o da crise Ã© um benzodiazepÃ­nico de aÃ§Ã£o rÃ¡pida por via endovenosa, como diazepam ou lorazepam."
    },
    {
        question: "Mulher de 30 anos queixa-se de visÃ£o dupla e pÃ¡lpebras caÃ­das que pioram no final do dia e melhoram com o repouso. Qual o teste diagnÃ³stico mais especÃ­fico?",
        options: ["PunÃ§Ã£o lombar.", "Eletroneuromiografia com teste de estimulaÃ§Ã£o repetitiva.", "Dosagem de creatinoquinase (CPK).", "BiÃ³psia muscular.", "RessonÃ¢ncia magnÃ©tica de crÃ¢nio."],
        correctAnswer: "Eletroneuromiografia com teste de estimulaÃ§Ã£o repetitiva.",
        explanation: "O quadro de fraqueza flutuante, que piora com o uso da musculatura e melhora com o repouso, Ã© caracterÃ­stico da Miastenia Gravis. O teste de estimulaÃ§Ã£o nervosa repetitiva na eletroneuromiografia, que mostra um decremento na amplitude do potencial de aÃ§Ã£o, Ã© um exame confirmatÃ³rio."
    },
    {
        question: "Duas semanas apÃ³s um quadro de gastroenterite, um paciente desenvolve fraqueza simÃ©trica e ascendente nos membros inferiores, com arreflexia. Qual o diagnÃ³stico mais provÃ¡vel?",
        options: ["Esclerose lateral amiotrÃ³fica.", "Miastenia gravis.", "SÃ­ndrome de Guillain-BarrÃ©.", "Poliomielite.", "Mielite transversa."],
        correctAnswer: "SÃ­ndrome de Guillain-BarrÃ©.",
        explanation: "A SÃ­ndrome de Guillain-BarrÃ© Ã© uma polirradiculoneuropatia desmielinizante aguda, frequentemente precedida por uma infecÃ§Ã£o. Caracteriza-se por uma paralisia flÃ¡cida, ascendente, simÃ©trica e com arreflexia."
    },
    {
        question: "Um paciente apresenta perda de memÃ³ria progressiva e insidiosa. Outro, com mÃºltiplos fatores de risco cardiovascular, apresenta um declÃ­nio cognitivo 'em degraus'. As descriÃ§Ãµes correspondem, respectivamente, a:",
        options: ["DemÃªncia Vascular e DoenÃ§a de Alzheimer.", "DoenÃ§a de Alzheimer e DemÃªncia Vascular.", "DemÃªncia frontotemporal e DemÃªncia com corpos de Lewy.", "DoenÃ§a de Creutzfeldt-Jakob e DoenÃ§a de Alzheimer.", "DemÃªncia com corpos de Lewy e DemÃªncia Vascular."],
        correctAnswer: "DoenÃ§a de Alzheimer e DemÃªncia Vascular.",
        explanation: "A DoenÃ§a de Alzheimer classicamente se apresenta com um declÃ­nio cognitivo lento, progressivo e insidioso, com a memÃ³ria sendo afetada precocemente. A DemÃªncia Vascular estÃ¡ associada a eventos cerebrovasculares e tem uma progressÃ£o 'em degraus', com piora sÃºbita a cada novo evento."
    },
    {
        question: "Paciente refere o inÃ­cio sÃºbito da 'pior cefaleia da vida', atingindo intensidade mÃ¡xima em menos de um minuto. Qual Ã© a principal hipÃ³tese a ser descartada e o primeiro exame a ser solicitado?",
        options: ["Enxaqueca com aura; ressonÃ¢ncia magnÃ©tica.", "Arterite temporal; biÃ³psia de artÃ©ria.", "Hemorragia subaracnoide; tomografia de crÃ¢nio sem contraste.", "Meningite; punÃ§Ã£o lombar.", "Trombose venosa cerebral; angiorressonÃ¢ncia."],
        correctAnswer: "Hemorragia subaracnoide; tomografia de crÃ¢nio sem contraste.",
        explanation: "A cefaleia em trovoada ('thunderclap headache') Ã© a apresentaÃ§Ã£o clÃ¡ssica da hemorragia subaracnoide (HSA), geralmente por ruptura de um aneurisma cerebral. A tomografia de crÃ¢nio sem contraste Ã© o primeiro exame a ser realizado para detectar o sangramento."
    },
    {
        question: "Paciente tabagista apresenta fraqueza muscular proximal que melhora com o esforÃ§o repetido e boca seca. A eletroneuromiografia mostra incremento na amplitude do potencial de aÃ§Ã£o apÃ³s estimulaÃ§Ã£o repetitiva. Esta sÃ­ndrome estÃ¡ mais associada a qual neoplasia?",
        options: ["Adenocarcinoma de cÃ³lon.", "CÃ¢ncer de prÃ³stata.", "Carcinoma de pequenas cÃ©lulas de pulmÃ£o.", "Melanoma.", "Linfoma de Hodgkin."],
        correctAnswer: "Carcinoma de pequenas cÃ©lulas de pulmÃ£o.",
        explanation: "Esta Ã© a apresentaÃ§Ã£o da SÃ­ndrome MiastÃªnica de Lambert-Eaton, um distÃºrbio da junÃ§Ã£o neuromuscular prÃ©-sinÃ¡ptica. - uma sÃ­ndrome paraneoplÃ¡sica fortemente associada ao carcinoma de pequenas cÃ©lulas de pulmÃ£o."
    },
    {
        question: "Paciente em tratamento de sÃ­filis apresenta febre, calafrios e cefaleia horas apÃ³s a primeira dose de penicilina. Qual o nome desta reaÃ§Ã£o e qual a conduta?",
        options: ["Anafilaxia; adrenalina.", "ReaÃ§Ã£o de Jarisch-Herxheimer; tratamento sintomÃ¡tico e manutenÃ§Ã£o da penicilina.", "DoenÃ§a do soro; suspender penicilina.", "SÃ­ndrome de Stevens-Johnson; suspensÃ£o do tratamento.", "Eritema polimorfo; trocar antibiÃ³tico."],
        correctAnswer: "ReaÃ§Ã£o de Jarisch-Herxheimer; tratamento sintomÃ¡tico e manutenÃ§Ã£o da penicilina.",
        explanation: "A ReaÃ§Ã£o de Jarisch-Herxheimer Ã© uma reaÃ§Ã£o inflamatÃ³ria aguda que ocorre apÃ³s o inÃ­cio do tratamento de doenÃ§as espiroquetÃ¡licas, como a sÃ­filis. - causada pela lise maciÃ§a dos microrganismos. A conduta Ã© expectante, com sintomÃ¡ticos, e o tratamento com penicilina nÃ£o deve ser interrompido."
    },
    {
        question: "A baciloscopia de um esfregaÃ§o de lesÃ£o de pele, utilizando a coloraÃ§Ã£o de Ziehl-Neelsen, Ã© um mÃ©todo diagnÃ³stico para qual doenÃ§a dermatoneurolÃ³gica?",
        options: ["Leishmaniose tegumentar.", "HansenÃ­ase.", "Esporotricose.", "Cromomicose.", "SÃ­filis terciÃ¡ria."],
        correctAnswer: "HansenÃ­ase.",
        explanation: "O Mycobacterium leprae, agente etiolÃ³gico da hansenÃ­ase, Ã© um bacilo Ã¡lcool-Ã¡cido resistente (BAAR), que pode ser visualizado em esfregaÃ§os de lesÃµes cutÃ¢neas ou de linfa atravÃ©s da coloraÃ§Ã£o de Ziehl-Neelsen."
    },
    {
        question: "Um homem de 65 anos com pneumonia evolui com hipotensÃ£o, confusÃ£o mental e oligÃºria. De acordo com o Surviving Sepsis Campaign, qual Ã© uma medida prioritÃ¡ria na primeira hora de manejo?",
        options: ["Administrar corticoide em dose de estresse.", "Coletar lactato arterial.", "Iniciar vasopressor (norepinefrina).", "Realizar transfusÃ£o de hemÃ¡cias.", "Todas as alternativas sÃ£o medidas prioritÃ¡rias da primeira hora."],
        correctAnswer: "Todas as alternativas sÃ£o medidas prioritÃ¡rias da primeira hora.",
        explanation: "O 'bundle' da primeira hora da sepse inclui: medir o lactato, obter hemoculturas antes de iniciar os antibiÃ³ticos, administrar antibiÃ³ticos de amplo espectro, iniciar a ressuscitaÃ§Ã£o volÃªmica com 30 mL/kg de cristaloide para hipotensÃ£o e iniciar vasopressores se a hipotensÃ£o persistir."
    },
    {
        question: "Adolescente com febre, faringite e linfadenopatia generalizada desenvolve um exantema maculopapular difuso apÃ³s uso de amoxicilina. O hemograma mostra linfocitose com atipia. Qual o agente etiolÃ³gico mais provÃ¡vel?",
        options: ["Streptococcus pyogenes.", "VÃ­rus Epstein-Barr.", "CitomegalovÃ­rus.", "HIV (infecÃ§Ã£o aguda).", "Mycoplasma pneumoniae."],
        correctAnswer: "VÃ­rus Epstein-Barr.",
        explanation: "Este Ã© o quadro clÃ¡ssico da mononucleose infecciosa, causada pelo VÃ­rus Epstein-Barr. O uso de aminopenicilinas (amoxicilina, ampicilina) nestes pacientes desencadeia um rash cutÃ¢neo caracterÃ­stico em mais de 90% dos casos."
    },
    {
        question: "Viajante retorna de Ã¡rea endÃªmica com febre, cefaleia retro-orbitÃ¡ria, mialgia intensa e plaquetopenia. A prova do laÃ§o Ã© positiva. Qual o diagnÃ³stico mais provÃ¡vel?",
        options: ["MalÃ¡ria.", "Febre tifoide.", "Dengue.", "Leptospirose.", "Febre amarela."],
        correctAnswer: "Dengue.",
        explanation: "A combinaÃ§Ã£o de febre alta, cefaleia retro-orbitÃ¡ria, mialgia ('febre quebra-ossos'), plaquetopenia e prova do laÃ§o positiva Ã© altamente sugestiva de dengue."
    },
    {
        question: "Paciente sofreu uma mordedura profunda no braÃ§o por um cÃ£o de rua de comportamento agressivo, que fugiu. O paciente nÃ£o tem histÃ³rico de vacinaÃ§Ã£o antirrÃ¡bica. Qual a conduta correta?",
        options: ["Apenas lavar o ferimento.", "Iniciar esquema de vacinaÃ§Ã£o antirrÃ¡bica e administrar imunoglobulina antirrÃ¡bica.", "Administrar apenas a imunoglobulina antirrÃ¡bica.", "Iniciar apenas o esquema de vacinaÃ§Ã£o.", "Prescrever antibiÃ³tico e vacina antitetÃ¢nica."],
        correctAnswer: "Iniciar esquema de vacinaÃ§Ã£o antirrÃ¡bica e administrar imunoglobulina antirrÃ¡bica.",
        explanation: "Trata-se de uma exposiÃ§Ã£o de alto risco (animal agressor, de rua, que nÃ£o pode ser observado; ferimento profundo). Em pacientes nÃ£o previamente imunizados, a profilaxia pÃ³s-exposiÃ§Ã£o para raiva consiste na aplicaÃ§Ã£o do soro (imunoglobulina) e no inÃ­cio do esquema vacinal completo."
    },
    {
        question: "Um usuÃ¡rio de drogas endovenosas Ã© internado com febre e sopro cardÃ­aco de inÃ­cio recente. O ecocardiograma mostra vegetaÃ§Ã£o em valva tricÃºspide. Qual o agente etiolÃ³gico mais comum?",
        options: ["Streptococcus viridans.", "Staphylococcus aureus.", "Enterococcus faecalis.", "Grupo HACEK.", "Candida albicans."],
        correctAnswer: "Staphylococcus aureus.",
        explanation: "Em usuÃ¡rios de drogas injetÃ¡veis, a endocardite infecciosa frequentemente acomete as cÃ¢maras cardÃ­acas direitas (valva tricÃºspide) e o agente etiolÃ³gico mais comum Ã© o Staphylococcus aureus, proveniente da pele."
    },
    {
        question: "Paciente com otite mÃ©dia crÃ´nica apresenta cefaleia, febre e hemiparesia Ã  direita. A TC de crÃ¢nio com contraste revela uma lesÃ£o captante em anel no lobo temporal esquerdo. Qual o diagnÃ³stico?",
        options: ["Tuberculoma.", "Neurotoxoplasmose.", "Glioblastoma multiforme.", "Abscesso cerebral.", "AVC isquÃªmico."],
        correctAnswer: "Abscesso cerebral.",
        explanation: "A otite mÃ©dia crÃ´nica Ã© um fator de risco para a disseminaÃ§Ã£o de infecÃ§Ãµes para o sistema nervoso central. A imagem de uma lesÃ£o com captaÃ§Ã£o anelar de contraste, associada a febre e dÃ©ficits neurolÃ³gicos focais, Ã© caracterÃ­stica de um abscesso cerebral."
    },
    {
        question: "Paciente em quimioterapia apresenta febre de 38,8Â°C e contagem de neutrÃ³filos de 350/mmÂ³. Qual a conduta imediata?",
        options: ["Aguardar 24 horas e repetir o hemograma.", "Iniciar antitÃ©rmico e observar.", "Internar, coletar culturas e iniciar antibioticoterapia empÃ­rica com cobertura antipseudomonas.", "Realizar tomografia antes de iniciar antibiÃ³tico.", "Iniciar antifÃºngico empÃ­rico."],
        correctAnswer: "Internar, coletar culturas e iniciar antibioticoterapia empÃ­rica com cobertura antipseudomonas.",
        explanation: "Neutropenia febril (NeutrÃ³filos < 500/mmÂ³ + Febre) Ã© uma emergÃªncia oncolÃ³gica. A conduta imediata Ã© a internaÃ§Ã£o, coleta de culturas e inÃ­cio de antibioticoterapia empÃ­rica de amplo espectro com atividade contra Pseudomonas aeruginosa (ex: cefepime, piperacilina-tazobactam)."
    },
    {
        question: "Considerando um paciente adulto, hÃ­gido, que desenvolve um quadro de pneumonia adquirida na comunidade (PAC) e necessita de tratamento ambulatorial, qual Ã© o agente etiolÃ³gico bacteriano mais prevalente?",
        options: ["Haemophilus influenzae.", "Mycoplasma pneumoniae.", "Streptococcus pneumoniae.", "Legionella pneumophila.", "Staphylococcus aureus."],
        correctAnswer: "Streptococcus pneumoniae.",
        explanation: "O Streptococcus pneumoniae (pneumococo) continua sendo o agente bacteriano mais comum e importante causador de pneumonia adquirida na comunidade em todas as faixas etÃ¡rias e cenÃ¡rios de tratamento."
    },
    {
        question: "Jovem com DM1 Ã© trazido Ã  emergÃªncia com dor abdominal, vÃ´mitos, hÃ¡lito cetÃ´nico e respiraÃ§Ã£o de Kussmaul. A glicemia Ã© de 450 mg/dL. Qual o diagnÃ³stico e o pilar inicial do tratamento, alÃ©m da insulina?",
        options: ["Estado hiperosmolar hiperglicÃªmico; hidrataÃ§Ã£o com soluÃ§Ã£o hipotÃ´nica.", "Cetoacidose diabÃ©tica; hidrataÃ§Ã£o vigorosa com soluÃ§Ã£o salina isotÃ´nica (0,9%).", "Hipoglicemia; administraÃ§Ã£o de glicose.", "Gastroparesia diabÃ©tica; uso de procinÃ©ticos.", "Acidose lÃ¡tica; infusÃ£o de bicarbonato."],
        correctAnswer: "Cetoacidose diabÃ©tica; hidrataÃ§Ã£o vigorosa com soluÃ§Ã£o salina isotÃ´nica (0,9%).",
        explanation: "O quadro Ã© clÃ¡ssico de cetoacidose diabÃ©tica. O tratamento se baseia em trÃªs pilares: insulinoterapia, correÃ§Ã£o dos distÃºrbios hidroeletrolÃ­ticos e hidrataÃ§Ã£o. A expansÃ£o volÃªmica vigorosa com soluÃ§Ã£o salina isotÃ´nica Ã© a primeira medida, visando corrigir a desidrataÃ§Ã£o e melhorar a perfusÃ£o renal."
    },
    {
        question: "Idoso com DM2 Ã© encontrado sonolento e desidratado. Glicemia de 800 mg/dL. Gasometria com pH 7.35, bicarbonato 25 mEq/L. A osmolaridade sÃ©rica estÃ¡ muito elevada. Qual o diagnÃ³stico?",
        options: ["Cetoacidose diabÃ©tica.", "Estado hiperosmolar hiperglicÃªmico.", "Acidente vascular cerebral.", "Sepse de foco urinÃ¡rio.", "IntoxicaÃ§Ã£o por metformina."],
        correctAnswer: "Estado hiperosmolar hiperglicÃªmico.",
        explanation: "O diagnÃ³stico de Estado Hiperosmolar HiperglicÃªmico (EHH) Ã© caracterizado por hiperglicemia extrema (>600 mg/dL), desidrataÃ§Ã£o grave, osmolaridade sÃ©rica elevada (>320 mOsm/kg) e ausÃªncia de cetoacidose significativa (pH > 7.3, HCO3 > 18)."
    },
    {
        question: "Mulher de 35 anos queixa-se de perda de peso, palpitaÃ§Ãµes, intolerÃ¢ncia ao calor, exoftalmia e bÃ³cio difuso. Qual o diagnÃ³stico mais provÃ¡vel?",
        options: ["Tireoidite de Hashimoto.", "DoenÃ§a de Graves.", "BÃ³cio multinodular tÃ³xico.", "Adenoma tÃ³xico.", "Tireoidite subaguda de De Quervain."],
        correctAnswer: "DoenÃ§a de Graves.",
        explanation: "A combinaÃ§Ã£o de hipertireoidismo (perda de peso, palpitaÃ§Ãµes, intolerÃ¢ncia ao calor) com manifestaÃ§Ãµes extratireoidianas como oftalmopatia (exoftalmia) e bÃ³cio difuso Ã© caracterÃ­stica da DoenÃ§a de Graves, uma doenÃ§a autoimune causada por anticorpos estimuladores do receptor de TSH (TRAb)."
    },
    {
        question: "Paciente com obesidade central, hipertensÃ£o, estrias violÃ¡ceas e fraqueza proximal. Qual Ã© o primeiro passo na investigaÃ§Ã£o da suspeita de SÃ­ndrome de Cushing?",
        options: ["RessonÃ¢ncia magnÃ©tica de hipÃ³fise.", "Dosagem de cortisol salivar Ã  meia-noite ou teste de supressÃ£o com 1 mg de dexametasona.", "Tomografia de adrenais.", "Dosagem de ACTH plasmÃ¡tico.", "Cateterismo de seios petrosos."],
        correctAnswer: "Dosagem de cortisol salivar Ã  meia-noite ou teste de supressÃ£o com 1 mg de dexametasona.",
        explanation: "O primeiro passo na investigaÃ§Ã£o de hipercortisolismo Ã© confirmar a produÃ§Ã£o excessiva de cortisol. Isso Ã© feito atravÃ©s de testes de rastreamento, como o teste de supressÃ£o com dexametasona em baixa dose ou a dosagem do cortisol livre urinÃ¡rio ou salivar noturno."
    },
    {
        question: "Paciente com hipertireoidismo nÃ£o tratado desenvolve febre alta, taquicardia extrema e agitaÃ§Ã£o psicomotora no pÃ³s-operatÃ³rio. Qual o manejo inicial desta emergÃªncia?",
        options: ["Apenas hidrataÃ§Ã£o e antitÃ©rmicos.", "Propiltiouracil ou metimazol em altas doses, soluÃ§Ã£o de iodo, propranolol e hidrocortisona.", "Tireoidectomia de urgÃªncia.", "Terapia com iodo radioativo (I-131).", "Amiodarona para controle da taquicardia."],
        correctAnswer: "Propiltiouracil ou metimazol em altas doses, soluÃ§Ã£o de iodo, propranolol e hidrocortisona.",
        explanation: "O quadro Ã© de crise tireotÃ³xica (tempestade tireoidiana). O manejo envolve mÃºltiplas frentes: bloquear a sÃ­ntese hormonal (tionamidas), bloquear a liberaÃ§Ã£o de hormÃ´nios (iodo), controlar os sintomas adrenÃ©rgicos (propranolol), e administrar corticoide para reduzir a conversÃ£o perifÃ©rica de T4 para T3."
    },
    {
        question: "Paciente apresenta fraqueza, hipotensÃ£o refrÃ¡tÃ¡ria a volume, hiponatremia, hipercalemia e hiperpigmentaÃ§Ã£o da pele e mucosas. Qual o diagnÃ³stico mais provÃ¡vel?",
        options: ["InsuficiÃªncia adrenal primÃ¡ria (DoenÃ§a de Addison).", "InsuficiÃªncia adrenal secundÃ¡ria.", "Hipotireoidismo primÃ¡rio.", "Pan-hipopituitarismo.", "Feocromocitoma."],
        correctAnswer: "InsuficiÃªncia adrenal primÃ¡ria (DoenÃ§a de Addison).",
        explanation: "A insuficiÃªncia adrenal primÃ¡ria cursa com deficiÃªncia de glicocorticoides e mineralocorticoides. A deficiÃªncia de cortisol causa fraqueza e hipotensÃ£o. A hiperpigmentaÃ§Ã£o ocorre pelo excesso de ACTH. A deficiÃªncia de aldosterona causa hiponatremia e hipercalemia."
    },
    {
        question: "Idosa com hipotireoidismo nÃ£o tratado Ã© encontrada com rebaixamento do nÃ­vel de consciÃªncia, hipotermia e bradicardia. Qual o tratamento de escolha para o coma mixedematoso?",
        options: ["ReposiÃ§Ã£o oral de levotiroxina.", "Aquecimento rÃ¡pido com mantas tÃ©rmicas.", "AdministraÃ§Ã£o endovenosa de levotiroxina (T4) e hidrocortisona.", "InfusÃ£o de dopamina.", "VentilaÃ§Ã£o nÃ£o invasiva."],
        correctAnswer: "AdministraÃ§Ã£o endovenosa de levotiroxina (T4) e hidrocortisona.",
        explanation: "O coma mixedematoso Ã© uma emergÃªncia endÃ³crina. O tratamento consiste na reposiÃ§Ã£o hormonal endovenosa (levotiroxina), associada a hidrocortisona (para tratar uma possÃ­vel insuficiÃªncia adrenal associada) e medidas de suporte."
    },
    {
        question: "Paciente refere crises de cefaleia, palpitaÃ§Ãµes e sudorese profusa, acompanhadas de picos hipertensivos. Qual o exame laboratorial mais sensÃ­vel para confirmar a suspeita de feocromocitoma?",
        options: ["Dosagem de catecolaminas sÃ©ricas.", "Dosagem de metanefrinas fracionadas no plasma ou na urina de 24 horas.", "Dosagem de Ã¡cido vanilmandÃ©lico (VMA) urinÃ¡rio.", "Tomografia de adrenais.", "Cintilografia com MIBG."],
        correctAnswer: "Dosagem de metanefrinas fracionadas no plasma ou na urina de 24 horas.",
        explanation: "A trÃ­ade clÃ¡ssica sugere feocromocitoma. O diagnÃ³stico bioquÃ­mico Ã© feito pela dosagem dos metabÃ³litos das catecolaminas (metanefrinas e normetanefrinas), que sÃ£o mais estÃ¡veis e, portanto, tÃªm maior sensibilidade do que a dosagem das prÃ³prias catecolaminas."
    },
    {
        question: "Um paciente diabÃ©tico em uso de insulina Ã© encontrado desacordado. Qual Ã© a medida diagnÃ³stica e terapÃªutica imediata mais importante a ser realizada?",
        options: ["Realizar tomografia de crÃ¢nio.", "Medir a glicemia capilar.", "Administrar tiamina endovenosa.", "Coletar gasometria arterial.", "Realizar punÃ§Ã£o lombar."],
        correctAnswer: "Medir a glicemia capilar.",
        explanation: "Em qualquer paciente com alteraÃ§Ã£o do nÃ­vel de consciÃªncia, especialmente em diabÃ©ticos, a primeira medida Ã© checar a glicemia capilar. A hipoglicemia Ã© uma causa comum e facilmente reversÃ­vel de coma, e o atraso no tratamento pode levar a danos neurolÃ³gicos permanentes."
    },
    {
        question: "Paciente com carcinoma de pequenas cÃ©lulas de pulmÃ£o desenvolve rapidamente hipertensÃ£o, alcalose metabÃ³lica hipocalÃªmica e hiperpigmentaÃ§Ã£o. Os nÃ­veis de ACTH e cortisol estÃ£o muito elevados. Qual o diagnÃ³stico?",
        options: ["DoenÃ§a de Cushing (adenoma hipofisÃ¡rio).", "Adenoma adrenal produtor de cortisol.", "SÃ­ndrome de Cushing por produÃ§Ã£o ectÃ³pica de ACTH.", "Uso exÃ³geno de corticoides.", "Hiperaldosteronismo primÃ¡rio."],
        correctAnswer: "SÃ­ndrome de Cushing por produÃ§Ã£o ectÃ³pica de ACTH.",
        explanation: "O carcinoma de pequenas cÃ©lulas de pulmÃ£o Ã© a causa mais comum de produÃ§Ã£o ectÃ³pica de ACTH. Isso leva a um hipercortisolismo severo e de instalaÃ§Ã£o rÃ¡pida, frequentemente acompanhado por alcalose hipocalÃªmica (devido ao efeito mineralocorticoide do cortisol em excesso) e hiperpigmentaÃ§Ã£o (pelo ACTH elevado)."
    },
    {
        question: "Homem de 50 anos acorda com dor, edema e rubor na articulaÃ§Ã£o do hÃ¡lux direito, apÃ³s uma noite de consumo de Ã¡lcool e carne. Qual o diagnÃ³stico e o achado esperado na anÃ¡lise do lÃ­quido sinovial?",
        options: ["Artrite sÃ©ptica; cocos Gram-positivos.", "Crise aguda de gota; cristais de monourato de sÃ³dio com birrefringÃªncia negativa.", "Artrite reumatoide; fator reumatoide positivo.", "Pseudogota; cristais de pirofosfato de cÃ¡lcio.", "Celulite; cultura positiva."],
        correctAnswer: "Crise aguda de gota; cristais de monourato de sÃ³dio com birrefringÃªncia negativa.",
        explanation: "A podagra (artrite da primeira articulaÃ§Ã£o metatarsofalangiana) de inÃ­cio sÃºbito, apÃ³s fatores desencadeantes como excesso de Ã¡lcool e purinas, Ã© a apresentaÃ§Ã£o clÃ¡ssica da gota. O diagnÃ³stico de certeza Ã© feito pela visualizaÃ§Ã£o de cristais de monourato de sÃ³dio em formato de agulha e com birrefringÃªncia negativa no lÃ­quido sinovial."
    },
    {
        question: "Mulher jovem com poliartrite, fotossensibilidade, Ãºlceras orais e proteinÃºria. Qual autoanticorpo Ã© mais especÃ­fico para o diagnÃ³stico de LÃºpus Eritematoso SistÃªmico?",
        options: ["Fator Antinuclear (FAN).", "Fator Reumatoide.", "Anti-DNA dupla hÃ©lice e Anti-Sm.", "Anti-Ro (SSA) e Anti-La (SSB).", "Anti-CCP."],
        correctAnswer: "Anti-DNA dupla hÃ©lice e Anti-Sm.",
        explanation: "Embora o FAN seja muito sensÃ­vel para LES, ele Ã© pouco especÃ­fico. Os anticorpos anti-DNA dupla hÃ©lice (ou anti-dsDNA) e anti-Sm sÃ£o altamente especÃ­ficos para o diagnÃ³stico de LÃºpus Eritematoso SistÃªmico, fazendo parte dos critÃ©rios de classificaÃ§Ã£o."
    },
    {
        question: "AlÃ©m do acometimento articular, qual das seguintes manifestaÃ§Ãµes Ã© caracterÃ­stica da artrite psoriÃ¡tica?",
        options: ["UveÃ­te anterior, dactilite ('dedo em salsicha') e entesite.", "NÃ³dulos reumatoides e vasculite.", "FenÃ´meno de Raynaud e esclerodactilia.", "Xeroftalmia e xerostomia.", "Fibrose pulmonar."],
        correctAnswer: "UveÃ­te anterior, dactilite ('dedo em salsicha') e entesite.",
        explanation: "A artrite psoriÃ¡tica faz parte do grupo das espondiloartrites soronegativas. Suas manifestaÃ§Ãµes extra-articulares caracterÃ­sticas incluem a dactilite (inflamaÃ§Ã£o de todo o dedo), a entesite (inflamaÃ§Ã£o da inserÃ§Ã£o de tendÃµes e ligamentos no osso) e a uveÃ­te."
    },
    {
        question: "Paciente com artrite reumatoide ativa recusa tratamento injetÃ¡vel por medo de agulhas. Qual a conduta Ã©tica mais apropriada?",
        options: ["Administrar a medicaÃ§Ã£o compulsoriamente.", "Respeitar a autonomia da paciente, explicar os riscos e benefÃ­cios, e discutir alternativas orais.", "Encaminhar para avaliaÃ§Ã£o psiquiÃ¡trica.", "Suspender todo o tratamento.", "Tentar convencer a paciente com a presenÃ§a de familiares."],
        correctAnswer: "Respeitar a autonomia da paciente, explicar os riscos e benefÃ­cios, e discutir alternativas orais.",
        explanation: "O princÃ­pio da autonomia do paciente deve ser respeitado. O papel do mÃ©dico Ã© fornecer todas as informaÃ§Ãµes necessÃ¡rias para uma decisÃ£o informada, discutir os prÃ³s e contras de cada opÃ§Ã£o e, juntos, encontrar a melhor alternativa terapÃªutica que se alinhe aos valores e preferÃªncias do paciente."
    },
    {
        question: "Paciente com anemia microcÃ­tica e hipocrÃ´mica apresenta: ferro sÃ©rico baixo, ferritina baixa, capacidade total de ligaÃ§Ã£o do ferro (TIBC) elevada. Qual o diagnÃ³stico e uma causa comum em mulheres em idade fÃ©rtil?",
        options: ["Talassemia; heranÃ§a genÃ©tica.", "Anemia de doenÃ§a crÃ´nica; processo inflamatÃ³rio.", "Anemia sideroblÃ¡stica; intoxicaÃ§Ã£o por chumbo.", "Anemia ferropriva; perda menstrual excessiva.", "Anemia megaloblÃ¡stica; deficiÃªncia de B12."],
        correctAnswer: "Anemia ferropriva; perda menstrual excessiva.",
        explanation: "O perfil de ferro descrito (ferro e ferritina baixos, com TIBC alto) Ã© patognomÃ´nico da anemia por deficiÃªncia de ferro (ferropriva). Em mulheres em idade fÃ©rtil, a causa mais comum Ã© a perda sanguÃ­nea crÃ´nica atravÃ©s do fluxo menstrual excessivo."
    },
    {
        question: "Um paciente etilista crÃ´nico apresenta anemia com VCM de 115 fL. A deficiÃªncia de qual vitamina Ã© a causa mais comum de anemia megaloblÃ¡stica nesta populaÃ§Ã£o?",
        options: ["Vitamina B1 (Tiamina).", "Vitamina B6 (Piridoxina).", "Vitamina B9 (Ãcido FÃ³lico/Folato).", "Vitamina B12 (Cobalamina).", "Vitamina C (Ãcido AscÃ³rbico)."],
        correctAnswer: "Vitamina B9 (Ãcido FÃ³lico/Folato).",
        explanation: "O etilismo crÃ´nico estÃ¡ associado a uma dieta pobre e Ã  mÃ¡ absorÃ§Ã£o de nutrientes. A deficiÃªncia de folato (Vitamina B9) Ã© a causa mais prevalente de anemia megaloblÃ¡stica (macrocÃ­tica) nesta populaÃ§Ã£o, pois as reservas corporais de folato sÃ£o menores e se esgotam mais rapidamente que as de Vitamina B12."
    },
    {
        question: "Paciente de Ã¡rea rural do Nordeste apresenta febre irregular, perda de peso e hepatoesplenomegalia importante. O hemograma mostra pancitopenia. Qual o diagnÃ³stico e o exame confirmatÃ³rio?",
        options: ["Esquistossomose; exame de fezes.", "MalÃ¡ria; gota espessa.", "Leishmaniose visceral (Calazar); aspirado de medula Ã³ssea.", "Febre tifoide; hemocultura.", "Linfoma; biÃ³psia de linfonodo."],
        correctAnswer: "Leishmaniose visceral (Calazar); aspirado de medula Ã³ssea.",
        explanation: "O quadro de febre prolongada, hepatoesplenomegalia e pancitopenia em paciente de Ã¡rea endÃªmica Ã© a apresentaÃ§Ã£o clÃ¡ssica da Leishmaniose Visceral. O diagnÃ³stico definitivo Ã© feito pela demonstraÃ§Ã£o das formas amastigotas do parasita no aspirado de medula Ã³ssea."
    },
    {
        question: "Ao comunicar o diagnÃ³stico de cÃ¢ncer, qual etapa do protocolo SPIKES corresponde a perguntar ao paciente 'O que vocÃª jÃ¡ sabe sobre sua doenÃ§a atÃ© agora?' antes de dar a notÃ­cia?",
        options: ["S - Setting up (Preparar o ambiente).", "P - Perception (PercepÃ§Ã£o do paciente).", "I - Invitation (Convite para a informaÃ§Ã£o).", "K - Knowledge (Dar o conhecimento).", "E - Emotions (Lidar com as emoÃ§Ãµes)."],
        correctAnswer: "P - Perception (PercepÃ§Ã£o do paciente).",
        explanation: "A etapa 'P' (Perception) do protocolo SPIKES consiste em avaliar a percepÃ§Ã£o do paciente sobre sua condiÃ§Ã£o antes de fornecer novas informaÃ§Ãµes. Isso permite ao mÃ©dico entender o que o paciente jÃ¡ sabe e corrigir possÃ­veis equÃ­vocos, adaptando a comunicaÃ§Ã£o."
    },
    {
        question: "Paciente de 75 anos com osteoporose grave (T-score -3.5) e fratura de fÃªmur. Qual classe de medicaÃ§Ã£o, que atua estimulando a formaÃ§Ã£o Ã³ssea, Ã© indicada?",
        options: ["Bisfosfonatos (ex: alendronato).", "Ranelato de estrÃ´ncio.", "Raloxifeno.", "Teriparatida (anÃ¡logo do PTH).", "Calcitonina."],
        correctAnswer: "Teriparatida (anÃ¡logo do PTH).",
        explanation: "A teriparatida Ã© um agente osteoformador, que estimula a atividade dos osteoblastos. - indicada para o tratamento da osteoporose grave, especialmente em pacientes com fraturas prÃ©vias (alto risco), pois promove um aumento mais rÃ¡pido e significativo da densidade mineral Ã³ssea em comparaÃ§Ã£o com os agentes antirabsortivos."
    },
    {
        question: "Idoso etilista crÃ´nico internado desenvolve agitaÃ§Ã£o, alucinaÃ§Ãµes visuais e tremores no 3Âº dia. Qual o tratamento farmacolÃ³gico de escolha para o delirium tremens e qual vitamina deve ser administrada?",
        options: ["Haloperidol e Vitamina C.", "BenzodiazepÃ­nicos (ex: diazepam) e Tiamina (Vitamina B1).", "FenitoÃ­na e Ãcido FÃ³lico.", "Morfina e Vitamina K.", "Clonidina e Vitamina B12."],
        correctAnswer: "BenzodiazepÃ­nicos (ex: diazepam) e Tiamina (Vitamina B1).",
        explanation: "O delirium tremens, a forma mais grave da sÃ­ndrome de abstinÃªncia alcoÃ³lica, Ã© tratado com benzodiazepÃ­nicos para controlar a agitaÃ§Ã£o e prevenir convulsÃµes. A tiamina (Vitamina B1) deve ser administrada antes de qualquer soluÃ§Ã£o glicosada para prevenir a Encefalopatia de Wernicke."
    }
  ],
  'ClÃ­nica CirÃºrgica': [
    {
        question: "Jovem de 22 anos refere dor abdominal que iniciou na regiÃ£o periumbilical e migrou para a fossa ilÃ­aca direita hÃ¡ 12 horas, associada a febre baixa e nÃ¡useas. Ao exame fÃ­sico, apresenta dor Ã  descompressÃ£o brusca no ponto de McBurney. Qual Ã© o diagnÃ³stico mais provÃ¡vel?",
        options: ["DoenÃ§a inflamatÃ³ria pÃ©lvica", "Gastroenterite aguda", "Apendicite aguda", "CÃ³lica nefrÃ©tica", "Diverticulite de Meckel"],
        correctAnswer: "Apendicite aguda",
        explanation: "A apresentaÃ§Ã£o de dor periumbilical migratÃ³ria para a fossa ilÃ­aca direita, febre baixa, anorexia e sinais de irritaÃ§Ã£o peritoneal (sinal de Blumberg positivo) Ã© a evoluÃ§Ã£o clÃ¡ssica da apendicite aguda."
    },
    {
        question: "Gestante de 25 semanas apresenta dor em flanco direito, febre e leucocitose de 18.000/mmÂ³. Qual exame de imagem Ã© o mais adequado para confirmar a suspeita de apendicite aguda nesta paciente?",
        options: ["Tomografia computadorizada com contraste", "Radiografia simples de abdome", "Ultrassonografia abdominal com compressÃ£o gradual", "RessonÃ¢ncia magnÃ©tica de abdome", "Colonoscopia"],
        correctAnswer: "RessonÃ¢ncia magnÃ©tica de abdome",
        explanation: "Na gestante, a ultrassonografia Ã© o exame inicial de escolha, mas pode ser inconclusiva devido ao Ãºtero gravÃ­dico. A ressonÃ¢ncia magnÃ©tica sem contraste Ã© o mÃ©todo de escolha subsequente por nÃ£o utilizar radiaÃ§Ã£o ionizante, oferecendo alta acurÃ¡cia para o diagnÃ³stico."
    },
    {
        question: "Idoso de 75 anos, diabÃ©tico e coronariopata, Ã© admitido com dor abdominal difusa, febre de 39Â°C, hipotensÃ£o e taquicardia. A tomografia revela apÃªndice perfurado com abscesso pÃ©lvico. Qual Ã© a conduta mais apropriada?",
        options: ["Antibioticoterapia endovenosa exclusiva", "Drenagem percutÃ¢nea do abscesso guiada por imagem", "Apendicectomia videolaparoscÃ³pica", "Laparotomia exploradora com apendicectomia e lavagem da cavidade", "Colonoscopia para descartar neoplasia"],
        correctAnswer: "Laparotomia exploradora com apendicectomia e lavagem da cavidade",
        explanation: "Em um paciente com apendicite perfurada e sinais de sepse e peritonite difusa, a conduta Ã© a abordagem cirÃºrgica de urgÃªncia por laparotomia para controle do foco infeccioso, apendicectomia e lavagem exaustiva da cavidade abdominal."
    },
    {
        question: "Mulher de 48 anos, obesa, refere dor em hipocÃ´ndrio direito de forte intensidade hÃ¡ 6 horas, que irradia para o dorso, associada a febre e vÃ´mitos. Ao exame, a inspiraÃ§Ã£o profunda Ã© interrompida pela palpaÃ§Ã£o do ponto cÃ­stico. Qual o nome deste sinal e o diagnÃ³stico provÃ¡vel?",
        options: ["Sinal de Rovsing; Apendicite aguda", "Sinal de Charcot; Colangite", "Sinal de Murphy; Colecistite aguda", "Sinal de Cullen; Pancreatite hemorrÃ¡gica", "Sinal de Grey-Turner; Pancreatite aguda"],
        correctAnswer: "Sinal de Murphy; Colecistite aguda",
        explanation: "A parada da inspiraÃ§Ã£o profunda durante a palpaÃ§Ã£o do ponto cÃ­stico Ã© o Sinal de Murphy, um achado clÃ¡ssico e altamente sugestivo de colecistite aguda, que Ã© a inflamaÃ§Ã£o da vesÃ­cula biliar."
    },
    {
        question: "Paciente diabÃ©tico de 60 anos com colecistite aguda apresenta na tomografia de abdome gÃ¡s na parede e no lÃºmen da vesÃ­cula biliar. Qual Ã© o diagnÃ³stico especÃ­fico e a principal implicaÃ§Ã£o clÃ­nica?",
        options: ["Colecistite acalculosa; tratamento conservador", "Colecistite enfisematosa; alto risco de gangrena e perfuraÃ§Ã£o", "ColelitÃ­ase; tratamento eletivo", "Colangite; necessidade de CPRE de urgÃªncia", "VesÃ­cula de porcelana; risco aumentado de adenocarcinoma"],
        correctAnswer: "Colecistite enfisematosa; alto risco de gangrena e perfuraÃ§Ã£o",
        explanation: "A presenÃ§a de gÃ¡s na parede da vesÃ­cula caracteriza a colecistite enfisematosa, uma forma grave de infecÃ§Ã£o causada por microrganismos produtores de gÃ¡s (ex: Clostridium). Ocorre mais em diabÃ©ticos e tem um risco muito elevado de complicaÃ§Ãµes como gangrena e perfuraÃ§Ã£o, exigindo cirurgia de urgÃªncia."
    },
    {
        question: "Idoso de 80 anos Ã© admitido com febre com calafrios, icterÃ­cia e dor em hipocÃ´ndrio direito. Qual Ã© a trÃ­ade clÃ¡ssica descrita e qual o seu significado?",
        options: ["TrÃ­ade de Whipple; Hipoglicemia", "TrÃ­ade de Beck; Tamponamento cardÃ­aco", "TrÃ­ade de Virchow; Trombose venosa", "TrÃ­ade de Charcot; Colangite aguda", "TrÃ­ade de Cushing; HipertensÃ£o intracraniana"],
        correctAnswer: "TrÃ­ade de Charcot; Colangite aguda",
        explanation: "A combinaÃ§Ã£o de febre, icterÃ­cia e dor abdominal constitui a TrÃ­ade de Charcot, que Ã© a apresentaÃ§Ã£o clÃ¡ssica da colangite aguda, uma infecÃ§Ã£o das vias biliares geralmente causada por obstruÃ§Ã£o."
    },
    {
        question: "Paciente com colangite aguda evolui com confusÃ£o mental e hipotensÃ£o arterial. Esta combinaÃ§Ã£o de cinco sinais Ã© conhecida como:",
        options: ["SÃ­ndrome de Mirizzi", "PÃªntade de Reynolds", "SÃ­ndrome de Boerhaave", "DoenÃ§a de Caroli", "SÃ­ndrome de Budd-Chiari"],
        correctAnswer: "PÃªntade de Reynolds",
        explanation: "A PÃªntade de Reynolds consiste na TrÃ­ade de Charcot (febre, icterÃ­cia, dor abdominal) acrescida de hipotensÃ£o arterial e alteraÃ§Ã£o do nÃ­vel de consciÃªncia. Indica colangite supurativa grave com sepse, uma emergÃªncia mÃ©dica que requer descompressÃ£o biliar imediata."
    },
    {
        question: "Homem de 45 anos, etilista crÃ´nico, apresenta dor epigÃ¡strica sÃºbita, de forte intensidade, em faixa, que irradia para o dorso, acompanhada de nÃ¡useas e vÃ´mitos. Exames laboratoriais mostram amilase e lipase sÃ©ricas 5 vezes acima do valor de referÃªncia. Qual o diagnÃ³stico?",
        options: ["slcera pÃ©ptica perfurada", "Colecistite aguda", "Pancreatite aguda", "Infarto agudo do miocÃ¡rdio de parede inferior", "Isquemia mesenterÃ©rica aguda"],
        correctAnswer: "Pancreatite aguda",
        explanation: "O diagnÃ³stico de pancreatite aguda Ã© confirmado pela presenÃ§a de pelo menos dois dos trÃªs critÃ©rios: dor abdominal caracterÃ­stica, elevaÃ§Ã£o de amilase ou lipase sÃ©rica (pelo menos 3x o limite superior) e achados de imagem compatÃ­veis. O paciente preenche os dois primeiros critÃ©rios."
    },
    {
        question: "Seis semanas apÃ³s um episÃ³dio de pancreatite aguda grave, um paciente refere saciedade precoce e uma massa palpÃ¡vel em epigÃ¡strio. A tomografia mostra uma coleÃ§Ã£o lÃ­quida, bem delimitada e sem necrose sÃ³lida em seu interior, na cauda do pÃ¢ncreas. Qual Ã© o diagnÃ³stico mais provÃ¡vel?",
        options: ["Cistoadenoma seroso", "Neoplasia cÃ­stica mucinosa", "Abscesso pancreÃ¡tico", "Pseudocisto pancreÃ¡tico", "Pancreatite crÃ´nica"],
        correctAnswer: "Pseudocisto pancreÃ¡tico",
        explanation: "Um pseudocisto pancreÃ¡tico Ã© uma coleÃ§Ã£o de suco pancreÃ¡tico envolta por uma parede inflamatÃ³ria fibrosa, que se forma como complicaÃ§Ã£o tardia (geralmente apÃ³s 4 semanas) de uma pancreatite aguda. A saciedade precoce ocorre pela compressÃ£o do estÃ´mago."
    },
    {
        question: "Mulher jovem, sexualmente ativa, apresenta dor em abdome inferior, febre, e ao exame ginecolÃ³gico hÃ¡ dor Ã  mobilizaÃ§Ã£o do colo uterino e presenÃ§a de corrimento vaginal. Qual o principal diagnÃ³stico diferencial com apendicite aguda?",
        options: ["Cistite aguda", "Gravidez ectÃ³pica rota", "DoenÃ§a inflamatÃ³ria pÃ©lvica (DIP)", "TorÃ§Ã£o de cisto ovariano", "Endometriose"],
        correctAnswer: "DoenÃ§a inflamatÃ³ria pÃ©lvica (DIP)",
        explanation: "A DIP Ã© uma infecÃ§Ã£o do trato genital superior feminino que classicamente cursa com dor em abdome inferior, febre e corrimento. A dor Ã  mobilizaÃ§Ã£o do colo uterino (sinal de Chandellier) Ã© um achado caracterÃ­stico que ajuda a diferenciar da apendicite."
    },
    {
        question: "Idoso de 70 anos apresenta dor em fossa ilÃ­aca esquerda, febre e constipaÃ§Ã£o intestinal. Ao exame, hÃ¡ uma massa dolorosa palpÃ¡vel nesta regiÃ£o. A tomografia de abdome revela espessamento do cÃ³lon sigmoide com densificaÃ§Ã£o da gordura pericolÃ´nica. Qual a hipÃ³tese diagnÃ³stica?",
        options: ["CÃ¢ncer de cÃ³lon obstrutivo", "Apendicite aguda", "DoenÃ§a de Crohn", "Diverticulite aguda", "Colite isquÃªmica"],
        correctAnswer: "Diverticulite aguda",
        explanation: "A diverticulite aguda Ã© a inflamaÃ§Ã£o de um divertÃ­culo colÃ´nico, ocorrendo mais comumente no sigmoide. A apresentaÃ§Ã£o clÃ­nica de dor em fossa ilÃ­aca esquerda, febre e alteraÃ§Ãµes do hÃ¡bito intestinal, associada aos achados tomogrÃ¡ficos, Ã© tÃ­pica da condiÃ§Ã£o."
    },
    {
        question: "Um paciente com diverticulite aguda Ã© submetido Ã  laparotomia e se identifica peritonite purulenta difusa, sem comunicaÃ§Ã£o com a luz intestinal. De acordo com a classificaÃ§Ã£o de Hinchey, qual Ã© o estÃ¡gio e a conduta cirÃºrgica mais apropriada?",
        options: ["Hinchey I; Drenagem percutÃ¢nea", "Hinchey II; Drenagem cirÃºrgica e antibioticoterapia", "Hinchey III; Cirurgia de Hartmann", "Hinchey IV; Anastomose primÃ¡ria", "Hinchey II; RessecÃ§Ã£o com anastomose primÃ¡ria"],
        correctAnswer: "Hinchey III; Cirurgia de Hartmann",
        explanation: "A peritonite purulenta difusa corresponde ao estÃ¡gio III de Hinchey. Nesta situaÃ§Ã£o de inflamaÃ§Ã£o e contaminaÃ§Ã£o intensa, a cirurgia de Hartmann (ressecÃ§Ã£o do segmento doente, colostomia terminal e fechamento do coto retal) Ã© o procedimento de escolha para controle de danos."
    },
    {
        question: "A cirurgia de Hartmann Ã© um procedimento frequentemente realizado em urgÃªncias colorretais, como na diverticulite perfurada. Este procedimento consiste em:",
        options: ["RessecÃ§Ã£o do segmento doente e anastomose primÃ¡ria", "Drenagem do abscesso e antibioticoterapia", "RessecÃ§Ã£o sigmoideana, colostomia terminal na fossa ilÃ­aca esquerda e fechamento do coto retal", "Apenas uma colostomia em alÃ§a para desvio do trÃ¢nsito", "Colectomia total com ileostomia terminal"],
        correctAnswer: "RessecÃ§Ã£o sigmoideana, colostomia terminal na fossa ilÃ­aca esquerda e fechamento do coto retal",
        explanation: "A cirurgia de Hartmann Ã© um procedimento em dois estÃ¡gios. O primeiro consiste na ressecÃ§Ã£o do segmento doente (geralmente o sigmoide), confecÃ§Ã£o de uma colostomia terminal e fechamento do coto distal. A reconstruÃ§Ã£o do trÃ¢nsito Ã© realizada em um segundo tempo, apÃ³s a resoluÃ§Ã£o do quadro inflamatÃ³rio."
    },
    {
        question: "Paciente diabÃ©tico apresenta febre alta, calafrios e dor em hipocÃ´ndrio direito. A ultrassonografia mostra uma lesÃ£o hipoecoica de 8 cm no lobo direito do fÃ­gado, sugestiva de abscesso. Qual Ã© a modalidade de tratamento de primeira linha?",
        options: ["Antibioticoterapia endovenosa por 6 semanas", "Drenagem percutÃ¢nea guiada por imagem associada Ã  antibioticoterapia", "Hepatectomia direita", "Laparotomia exploradora com drenagem aberta", "CPRE para descompressÃ£o biliar"],
        correctAnswer: "Drenagem percutÃ¢nea guiada por imagem associada Ã  antibioticoterapia",
        explanation: "Para abscessos hepÃ¡ticos piogÃªnicos maiores que 5 cm, o tratamento de escolha Ã© a combinaÃ§Ã£o de antibioticoterapia de amplo espectro com a drenagem percutÃ¢nea do abscesso, guiada por ultrassonografia ou tomografia, que Ã© um mÃ©todo minimamente invasivo e eficaz."
    },
    {
        question: "Mulher de 28 anos com diagnÃ³stico de DoenÃ§a InflamatÃ³ria PÃ©lvica Ã© admitida com dor abdominal sÃºbita e intensa, febre alta e sinais de choque sÃ©ptico. A ultrassonografia revela um abscesso tubo-ovariano de 10 cm e grande quantidade de lÃ­quido livre na cavidade. Qual a conduta?",
        options: ["Aumentar a dose do antibiÃ³tico e observar por 24 horas", "Laparotomia exploradora de urgÃªncia para salpingo-ooforectomia e lavagem", "Drenagem percutÃ¢nea do abscesso", "Iniciar tratamento para tuberculose pÃ©lvica", "Realizar culdocentese para alÃ­vio"],
        correctAnswer: "Laparotomia exploradora de urgÃªncia para salpingo-ooforectomia e lavagem",
        explanation: "A ruptura de um abscesso tubo-ovariano com peritonite e instabilidade hemodinÃ¢mica (choque sÃ©ptico) Ã© uma emergÃªncia cirÃºrgica. A conduta Ã© a laparotomia de urgÃªncia para remoÃ§Ã£o da fonte da infecÃ§Ã£o (salpingo-ooforectomia) e lavagem da cavidade abdominal."
    },
    {
        question: "Paciente de 60 anos, com mÃºltiplas cirurgias abdominais prÃ©vias por Ãºlcera pÃ©ptica, apresenta distensÃ£o abdominal, vÃ´mitos fecaloide e parada de eliminaÃ§Ã£o de gases e fezes. A radiografia de abdome mostra mÃºltiplos nÃ­veis hidroaÃ©reos e edema de alÃ§as. Qual Ã© a causa mais provÃ¡vel do abdome agudo obstrutivo?",
        options: ["HÃ©rnia inguinal encarcerada", "Neoplasia de cÃ³lon", "VÃ³lvulo de sigmoide", "Bridas ou aderÃªncias pÃ³s-operatÃ³rias", "Ãleo biliar"],
        correctAnswer: "Bridas ou aderÃªncias pÃ³s-operatÃ³rias",
        explanation: "Em pacientes com histÃ³rico de cirurgias abdominais, as bridas (aderÃªncias) sÃ£o a principal causa de obstruÃ§Ã£o do intestino delgado. Elas podem causar acotovelamento ou compressÃ£o extrÃ­nseca das alÃ§as, levando ao quadro obstrutivo."
    },
    {
        question: "Qual Ã© a principal causa de obstruÃ§Ã£o do intestino delgado em pacientes adultos sem histÃ³rico de cirurgia abdominal prÃ©via?",
        options: ["Bridas e aderÃªncias", "HÃ©rnias da parede abdominal (inguinal, femoral)", "Neoplasias primÃ¡rias do intestino delgado", "DoenÃ§a de Crohn", "Ãleo biliar"],
        correctAnswer: "HÃ©rnias da parede abdominal (inguinal, femoral)",
        explanation: "Enquanto as bridas sÃ£o a causa mais comum no geral, em pacientes sem cirurgias prÃ©vias (abdome virgem), as hÃ©rnias da parede abdominal que evoluem com encarceramento de alÃ§as intestinais se tornam a principal etiologia da obstruÃ§Ã£o do intestino delgado."
    },
    {
        question: "No manejo inicial de um paciente com abdome agudo obstrutivo por bridas, sem sinais de sofrimento de alÃ§a ou peritonite, qual Ã© a conduta prioritÃ¡ria?",
        options: ["Laparotomia exploradora imediata", "Dieta lÃ­quida e observaÃ§Ã£o", "Uso de procinÃ©ticos para estimular o peristaltismo", "HidrataÃ§Ã£o venosa, jejum, passagem de sonda nasogÃ¡strica e correÃ§Ã£o de distÃºrbios hidroeletrolÃ­ticos", "Antibioticoterapia de amplo espectro"],
        correctAnswer: "HidrataÃ§Ã£o venosa, jejum, passagem de sonda nasogÃ¡strica e correÃ§Ã£o de distÃºrbios hidroeletrolÃ­ticos",
        explanation: "O tratamento inicial da obstruÃ§Ã£o intestinal nÃ£o complicada Ã© conservador e visa a descompressÃ£o do trato gastrointestinal (jejum e sonda nasogÃ¡strica) e a estabilizaÃ§Ã£o clÃ­nica do paciente (hidrataÃ§Ã£o e correÃ§Ã£o de eletrÃ³litos), na tentativa de resoluÃ§Ã£o espontÃ¢nea do quadro."
    },
    {
        question: "Idoso de 85 anos, constipado crÃ´nico, apresenta distensÃ£o abdominal sÃºbita e massiva. A radiografia de abdome mostra uma imagem de alÃ§a sigmoide muito distendida, em 'U invertido' ou 'grÃ£o de cafÃ©'. Qual o diagnÃ³stico e a conduta inicial nÃ£o cirÃºrgica?",
        options: ["ObstruÃ§Ã£o por neoplasia; colonoscopia com biÃ³psia", "VÃ³lvulo de sigmoide; descompressÃ£o por colonoscopia ou retossigmoidoscopia", "MegacÃ³lon tÃ³xico; colectomia de urgÃªncia", "HÃ©rnia interna; laparotomia", "Ãleo paralÃ­tico; tratamento conservador"],
        correctAnswer: "VÃ³lvulo de sigmoide; descompressÃ£o por colonoscopia ou retossigmoidoscopia",
        explanation: "A imagem radiolÃ³gica Ã© patognomÃ´nica de vÃ³lvulo de sigmoide. Em pacientes estÃ¡veis e sem sinais de isquemia, a primeira linha de tratamento Ã© a descompressÃ£o endoscÃ³pica, que desfaz a torÃ§Ã£o da alÃ§a, aliviando a obstruÃ§Ã£o."
    },
    {
        question: "Um paciente com hÃ©rnia inguinal apresenta dor sÃºbita e intensa na regiÃ£o, com uma massa endurecida e irredutÃ­vel. O hemograma mostra leucocitose com desvio Ã  esquerda. Qual Ã© a principal preocupaÃ§Ã£o e a conduta indicada?",
        options: ["HÃ©rnia encarcerada; observaÃ§Ã£o e analgesia", "HÃ©rnia estrangulada; cirurgia de urgÃªncia", "HÃ©rnia redutÃ­vel; cirurgia eletiva", "Orquite aguda; antibioticoterapia", "Linfonodomegalia inguinal; biÃ³psia"],
        correctAnswer: "HÃ©rnia estrangulada; cirurgia de urgÃªncia",
        explanation: "A evoluÃ§Ã£o de uma hÃ©rnia encarcerada (irredutÃ­vel) com sinais de comprometimento vascular da alÃ§a (dor intensa, sinais inflamatÃ³rios, leucocitose) caracteriza o estrangulamento. Esta Ã© uma emergÃªncia cirÃºrgica, pois a isquemia pode levar Ã  necrose e perfuraÃ§Ã£o intestinal."
    },
    {
        question: "Homem de 50 anos, com histÃ³ria de dispepsia e uso crÃ´nico de anti-inflamatÃ³rios, apresenta dor abdominal sÃºbita, de forte intensidade, descrita como 'uma facada'. O exame fÃ­sico revela abdome em tÃ¡bua. A radiografia de tÃ³rax em pÃ© mostra ar subdiafragmÃ¡tico. Qual a principal hipÃ³tese?",
        options: ["Pancreatite aguda", "Apendicite perfurada", "slcera pÃ©ptica perfurada", "Diverticulite perfurada", "Isquemia mesenterÃ©rica"],
        correctAnswer: "slcera pÃ©ptica perfurada",
        explanation: "A dor sÃºbita e intensa (em punhalada), o abdome em tÃ¡bua (peritonite quÃ­mica) e a presenÃ§a de pneumoperitÃ´nio (ar na cavidade) sÃ£o a trÃ­ade clÃ¡ssica da perfuraÃ§Ã£o de uma vÃ­scera oca, sendo a Ãºlcera pÃ©ptica duodenal a causa mais comum."
    },
    {
        question: "Idoso de 78 anos, com fibrilaÃ§Ã£o atrial crÃ´nica em uso irregular de anticoagulante, queixa-se de dor abdominal difusa, de inÃ­cio sÃºbito e intensidade desproporcional Ã  pobreza de achados no exame fÃ­sico (abdome flÃ¡cido, pouco doloroso Ã  palpaÃ§Ã£o). Qual Ã© a hipÃ³tese que deve ser considerada uma emergÃªncia?",
        options: ["Gastroenterite aguda", "Pancreatite aguda", "Diverticulite", "Isquemia mesenterÃ©rica aguda", "ObstruÃ§Ã£o intestinal"],
        correctAnswer: "Isquemia mesenterÃ©rica aguda",
        explanation: "A dissociaÃ§Ã£o entre a queixa de dor abdominal excruciante e um exame fÃ­sico relativamente benigno Ã© o sinal de alerta clÃ¡ssico para a isquemia mesenterÃ©rica aguda de origem embÃ³lica. O diagnÃ³stico e o tratamento precoces sÃ£o cruciais para evitar a necrose intestinal."
    },
    {
        question: "Lactente de 1 ano Ã© levado ao pronto-socorro com crises de choro intenso e intermitente, nas quais encolhe as pernas. Entre as crises, fica apÃ¡tico. Apresentou um episÃ³dio de evacuaÃ§Ã£o com muco e sangue ('geleia de framboesa'). Qual o diagnÃ³stico mais provÃ¡vel?",
        options: ["Gastroenterite viral", "Apendicite aguda", "InvaginaÃ§Ã£o intestinal", "Estenose hipertrÃ³fica de piloro", "DivertÃ­culo de Meckel"],
        correctAnswer: "InvaginaÃ§Ã£o intestinal",
        explanation: "A trÃ­ade de dor abdominal em cÃ³lica intermitente, vÃ´mitos e fezes em 'geleia de framboesa' Ã© a apresentaÃ§Ã£o clÃ¡ssica da invaginaÃ§Ã£o (ou intussuscepÃ§Ã£o) intestinal, uma emergÃªncia pediÃ¡trica comum."
    },
    {
        question: "Em um paciente com obstruÃ§Ã£o completa do cÃ³lon esquerdo por uma neoplasia, qual Ã© a melhor estratÃ©gia cirÃºrgica de urgÃªncia para um paciente instÃ¡vel?",
        options: ["RessecÃ§Ã£o do tumor com anastomose primÃ¡ria", "ColocaÃ§Ã£o de stent endoscÃ³pico", "Cirurgia de Hartmann (ressecÃ§Ã£o e colostomia)", "Apenas uma colostomia em alÃ§a proximal", "Colectomia total"],
        correctAnswer: "Cirurgia de Hartmann (ressecÃ§Ã£o e colostomia)",
        explanation: "Na obstruÃ§Ã£o maligna do cÃ³lon esquerdo, a anastomose primÃ¡ria Ã© proscrita na urgÃªncia devido ao alto risco de deiscÃªncia. A cirurgia de Hartmann permite a ressecÃ§Ã£o do tumor e a derivaÃ§Ã£o do trÃ¢nsito, sendo um procedimento seguro para controle de danos."
    },
    {
        question: "Idosa com hÃ©rnia de hiato paraesofÃ¡gica gigante apresenta dor torÃ¡cica sÃºbita, vÃ´mitos e incapacidade de passar uma sonda nasogÃ¡strica. Qual Ã© a complicaÃ§Ã£o aguda mais temida desta condiÃ§Ã£o?",
        options: ["DoenÃ§a do refluxo gastroesofÃ¡gico", "Esofagite de refluxo", "VÃ³lvulo gÃ¡strico", "UlceraÃ§Ã£o de Cameron", "EsÃ´fago de Barrett"],
        correctAnswer: "VÃ³lvulo gÃ¡strico",
        explanation: "HÃ©rnias de hiato gigantes podem complicar com a torÃ§Ã£o do estÃ´mago herniado sobre seu prÃ³prio eixo (vÃ³lvulo gÃ¡strico), uma emergÃªncia cirÃºrgica que causa obstruÃ§Ã£o e pode levar Ã  isquemia e necrose gÃ¡strica."
    },
    {
        question: "Paciente com DoenÃ§a de Crohn ileocecal conhecida apresenta episÃ³dios recorrentes de dor abdominal em cÃ³lica, distensÃ£o e vÃ´mitos, que melhoram com o jejum. A colonteroscopia revela uma Ã¡rea de estenose fibrÃ³tica no Ã­leo terminal. Qual o diagnÃ³stico?",
        options: ["Atividade inflamatÃ³ria da doenÃ§a", "Abscesso intra-abdominal", "FÃ­stula enterocutÃ¢nea", "Quadro de suboclusÃ£o intestinal por estenose", "Adenocarcinoma de intestino delgado"],
        correctAnswer: "Quadro de suboclusÃ£o intestinal por estenose",
        explanation: "A natureza transmural da inflamaÃ§Ã£o na DoenÃ§a de Crohn pode levar Ã  formaÃ§Ã£o de estenoses fibrÃ³ticas, que causam quadros de suboclusÃ£o ou oclusÃ£o intestinal, uma das principais indicaÃ§Ãµes de tratamento cirÃºrgico na doenÃ§a."
    },
    {
        question: "Idosa de 82 anos com colelitÃ­ase conhecida apresenta quadro de obstruÃ§Ã£o do intestino delgado. A radiografia de abdome mostra pneumobilia (ar nas vias biliares) e um cÃ¡lculo biliar calcificado ectÃ³pico na fossa ilÃ­aca direita. Qual Ã© o diagnÃ³stico?",
        options: ["Pancreatite biliar", "ColedocolitÃ­ase", "Ãleo biliar", "SÃ­ndrome de Mirizzi", "Colangite"],
        correctAnswer: "Ãleo biliar",
        explanation: "O Ã­leo biliar ocorre quando um cÃ¡lculo grande erode a parede da vesÃ­cula e cria uma fÃ­stula para o duodeno, migrando e impactando no intestino delgado (geralmente no Ã­leo terminal). A trÃ­ade de Rigler (pneumobilia, obstruÃ§Ã£o de delgado e cÃ¡lculo ectÃ³pico) na imagem confirma o diagnÃ³stico."
    },
    {
        question: "Homem de 68 anos, tabagista e hipertenso, procura a emergÃªncia com dor abdominal sÃºbita, de forte intensidade, irradiada para o dorso, associada a hipotensÃ£o e sudorese. Ao exame, palpa-se uma massa abdominal pulsÃ¡til e dolorosa. Qual a principal hipÃ³tese?",
        options: ["Infarto agudo do miocÃ¡rdio", "Pancreatite aguda", "Ruptura de aneurisma de aorta abdominal (AAA)", "DissecÃ§Ã£o aÃ³rtica", "CÃ³lica nefrÃ©tica"],
        correctAnswer: "Ruptura de aneurisma de aorta abdominal (AAA)",
        explanation: "A trÃ­ade clÃ¡ssica de dor abdominal ou lombar, hipotensÃ£o e massa abdominal pulsÃ¡til em um paciente com fatores de risco Ã© altamente sugestiva de ruptura de um AAA, uma emergÃªncia cirÃºrgica com altÃ­ssima mortalidade."
    },
    {
        question: "Paciente chega ao pronto-socorro relatando ter engolido uma espinha de peixe hÃ¡ 2 dias. Agora apresenta febre e dor abdominal localizada. A tomografia mostra perfuraÃ§Ã£o do cÃ³lon sigmoide pelo corpo estranho com abscesso localizado. Qual a conduta?",
        options: ["ObservaÃ§Ã£o e antibioticoterapia", "Laparotomia com remoÃ§Ã£o do corpo estranho e rafia primÃ¡ria", "Laparotomia com ressecÃ§Ã£o do segmento afetado (Hartmann)", "Endoscopia para tentativa de remoÃ§Ã£o", "Dieta laxativa para expelir o corpo estranho"],
        correctAnswer: "Laparotomia com ressecÃ§Ã£o do segmento afetado (Hartmann)",
        explanation: "A perfuraÃ§Ã£o colÃ´nica por corpo estranho com abscesso ou peritonite Ã© uma indicaÃ§Ã£o de tratamento cirÃºrgico. Devido Ã  contaminaÃ§Ã£o e inflamaÃ§Ã£o, a ressecÃ§Ã£o do segmento perfurado, geralmente atravÃ©s de uma cirurgia de Hartmann, Ã© o procedimento mais seguro."
    },
    {
        question: "Idoso de 90 anos, acamado e institucionalizado, apresenta distensÃ£o abdominal, ausÃªncia de evacuaÃ§Ãµes hÃ¡ 10 dias e toque retal que revela uma ampola retal repleta de fezes endurecidas. Qual o diagnÃ³stico e a primeira medida terapÃªutica?",
        options: ["Neoplasia de reto; colonoscopia", "VÃ³lvulo de sigmoide; descompressÃ£o endoscÃ³pica", "ObstruÃ§Ã£o intestinal por fecaloma; remoÃ§Ã£o manual ou clisteres", "DoenÃ§a de Hirschsprung; manometria anorretal", "Colite pseudomembranosa; vancomicina oral"],
        correctAnswer: "ObstruÃ§Ã£o intestinal por fecaloma; remoÃ§Ã£o manual ou clisteres",
        explanation: "O fecaloma Ã© uma massa de fezes endurecidas que causa obstruÃ§Ã£o, comum em idosos acamados. O diagnÃ³stico Ã© feito pelo toque retal, e a primeira linha de tratamento Ã© a desimpactaÃ§Ã£o manual (toque retal), seguida por clisteres e laxativos."
    },
    {
        question: "Na avaliaÃ§Ã£o primÃ¡ria de um politraumatizado (ABCDE), qual Ã© a primeira prioridade a ser abordada?",
        options: ["Controlar hemorragias externas visÃ­veis", "Avaliar o nÃ­vel de consciÃªncia (escala de Glasgow)", "Garantir a perviedade das vias aÃ©reas com proteÃ§Ã£o da coluna cervical", "Checar pulsos e perfusÃ£o perifÃ©rica", "Expor o paciente para procurar lesÃµes ocultas"],
        correctAnswer: "Garantir a perviedade das vias aÃ©reas com proteÃ§Ã£o da coluna cervical",
        explanation: "Seguindo a mnemÃ´nica do ATLS, o 'A' (Airway) vem primeiro. A manutenÃ§Ã£o de uma via aÃ©rea pÃ©rvia Ã© a maior prioridade, pois a obstruÃ§Ã£o leva Ã  morte em minutos. A proteÃ§Ã£o da coluna cervical Ã© realizada simultaneamente."
    },
    {
        question: "Paciente vÃ­tima de trauma torÃ¡cico contuso chega ao pronto-socorro com dispneia intensa, hipotensÃ£o, turgÃªncia jugular e desvio da traqueia para o lado esquerdo. O hemitÃ³rax direito estÃ¡ hipertimpÃ¢nico e com murmÃºrio vesicular abolido. Qual a conduta imediata?",
        options: ["Radiografia de tÃ³rax de urgÃªncia", "Tomografia de tÃ³rax", "Drenagem torÃ¡cica em selo d'Ã¡gua no 5Âº espaÃ§o intercostal", "Toracotomia de reanimaÃ§Ã£o", "DescompressÃ£o torÃ¡cica por punÃ§Ã£o com agulha no 2Âº espaÃ§o intercostal"],
        correctAnswer: "DescompressÃ£o torÃ¡cica por punÃ§Ã£o com agulha no 2Âº espaÃ§o intercostal",
        explanation: "O quadro Ã© de pneumotÃ³rax hipertensivo, uma emergÃªncia absoluta. O diagnÃ³stico Ã© clÃ­nico e a conduta imediata, antes de qualquer exame de imagem, Ã© a descompressÃ£o por punÃ§Ã£o (toracocentese de alÃ­vio) para transformar o pneumotÃ³rax hipertensivo em um simples, seguida pela drenagem torÃ¡cica definitiva."
    },
    {
        question: "VÃ­tima de ferimento por arma de fogo em abdome chega ao pronto-socorro com PA de 70x40 mmHg e FC de 140 bpm. Qual Ã© a indicaÃ§Ã£o terapÃªutica imediata?",
        options: ["Realizar o exame FAST para avaliar a presenÃ§a de lÃ­quido livre", "Laparotomia exploradora de emergÃªncia", "Tomografia de abdome para mapear a trajetÃ³ria do projÃ©til", "ExploraÃ§Ã£o digital da ferida", "Sutura da ferida e observaÃ§Ã£o"],
        correctAnswer: "Laparotomia exploradora de emergÃªncia",
        explanation: "A presenÃ§a de instabilidade hemodinÃ¢mica em um paciente com trauma abdominal penetrante Ã© uma indicaÃ§Ã£o absoluta e imediata de laparotomia exploradora para controle da hemorragia."
    },
    {
        question: "ApÃ³s uma queda de 5 metros de altura, um paciente estÃ¡ hemodinamicamente estÃ¡vel, mas o exame FAST (Focused Assessment with Sonography for Trauma) mostra lÃ­quido livre na loja esplÃªnica (espaÃ§o esplenorrenal). Qual Ã© o prÃ³ximo passo na avaliaÃ§Ã£o?",
        options: ["Laparotomia exploradora imediata", "ObservaÃ§Ã£o clÃ­nica seriada", "Tomografia computadorizada de abdome com contraste endovenoso", "Laparoscopia diagnÃ³stica", "Realizar punÃ§Ã£o diagnÃ³stica do peritÃ´nio (LPD)"],
        correctAnswer: "Tomografia computadorizada de abdome com contraste endovenoso",
        explanation: "Em um paciente com trauma abdominal contuso que estÃ¡ hemodinamicamente estÃ¡vel, mas com FAST positivo, a tomografia computadorizada Ã© o exame de escolha para graduar a lesÃ£o de Ã³rgÃ£os sÃ³lidos (neste caso, o baÃ§o), identificar sangramento ativo e guiar a decisÃ£o entre tratamento conservador ou cirÃºrgico."
    },
    {
        question: "Paciente vÃ­tima de acidente automobilÃ­stico apresenta fratura dos arcos costais inferiores Ã  esquerda e refere dor no ombro esquerdo ao ser colocado em posiÃ§Ã£o de Trendelenburg. Este sinal (Sinal de Kehr) Ã© sugestivo de:",
        options: ["LesÃ£o diafragmÃ¡tica", "PneumotÃ³rax", "LesÃ£o esplÃªnica com irritaÃ§Ã£o do nervo frÃªnico", "Fratura de clavÃ­cula", "ContusÃ£o pulmonar"],
        correctAnswer: "LesÃ£o esplÃªnica com irritaÃ§Ã£o do nervo frÃªnico",
        explanation: "O Sinal de Kehr Ã© a dor referida no ombro esquerdo causada pela irritaÃ§Ã£o do diafragma (inervado pelo nervo frÃªnico, C3-C5) por sangue proveniente de uma ruptura esplÃªnica."
    },
    {
        question: "Politraumatizado vÃ­tima de colisÃ£o frontal apresenta fratura pÃ©lvica com instabilidade vertical e sinais de choque hipovolÃªmico classe III. Qual Ã© a medida inicial mais importante para o controle da hemorragia pÃ©lvica?",
        options: ["FixaÃ§Ã£o externa da pelve", "Arteriografia com embolizaÃ§Ã£o", "Laparotomia para tamponamento pÃ©lvico", "Fechamento da pelve com lenÃ§ol ou cinturÃ£o pÃ©lvico", "Passagem de cateter de Foley"],
        correctAnswer: "Fechamento da pelve com lenÃ§ol ou cinturÃ£o pÃ©lvico",
        explanation: "Em fraturas pÃ©lvicas instÃ¡veis ('livro aberto'), a primeira medida para estabilizaÃ§Ã£o e controle da hemorragia (principalmente venosa) Ã© a estabilizaÃ§Ã£o mecÃ¢nica circunferencial da pelve com um dispositivo apropriado ou, na sua ausÃªncia, um lenÃ§ol amarrado firmemente ao nÃ­vel dos trocÃ¢nteres maiores."
    },
    {
        question: "VÃ­tima de ferimento por arma branca na Zona II do pescoÃ§o, com sangramento ativo e hematoma em expansÃ£o. Qual Ã© a conduta mais segura?",
        options: ["ExploraÃ§Ã£o local da ferida no pronto-socorro", "Angiotomografia cervical", "Endoscopia digestiva alta", "ExploraÃ§Ã£o cirÃºrgica cervical imediata", "CompressÃ£o local e observaÃ§Ã£o"],
        correctAnswer: "ExploraÃ§Ã£o cirÃºrgica cervical imediata",
        explanation: "Sinais 'hard' de lesÃ£o vascular ou aerodigestiva no trauma cervical penetrante (como sangramento ativo, hematoma em expansÃ£o, choque, enfisema subcutÃ¢neo extenso) sÃ£o indicaÃ§Ãµes de exploraÃ§Ã£o cirÃºrgica imediata, sem a necessidade de exames de imagem prÃ©vios."
    },
    {
        question: "Paciente com traumatismo cranioencefÃ¡lico (TCE) Ã© avaliado na cena e apresenta abertura ocular ao estÃ­mulo doloroso (2), sons ininteligÃ­veis (2) e extensÃ£o anormal dos membros (postura de descerebraÃ§Ã£o) (2). Qual Ã© a sua pontuaÃ§Ã£o na Escala de Coma de Glasgow (ECG) e a classificaÃ§Ã£o da gravidade do TCE?",
        options: ["ECG 8; TCE moderado", "ECG 6; TCE grave", "ECG 7; TCE grave", "ECG 5; TCE grave", "ECG 9; TCE moderado"],
        correctAnswer: "ECG 6; TCE grave",
        explanation: "A pontuaÃ§Ã£o Ã© a soma das melhores respostas: Abertura Ocular (2) + Melhor Resposta Verbal (2) + Melhor Resposta Motora (2) = 6. Um escore na ECG - 8 caracteriza um TCE grave, com indicaÃ§Ã£o de intubaÃ§Ã£o orotraqueal para proteÃ§Ã£o de via aÃ©rea."
    },
    {
        question: "Em um paciente homem, vÃ­tima de trauma pÃ©lvico, a presenÃ§a de sangue no meato uretral, hematoma perineal e uma prÃ³stata 'alta' ou flutuante ao toque retal sÃ£o sinais clÃ¡ssicos de:",
        options: ["LesÃ£o de bexiga", "Fratura de fÃªmur", "LesÃ£o de uretra posterior", "LesÃ£o de uretra anterior", "LesÃ£o renal"],
        correctAnswer: "LesÃ£o de uretra posterior",
        explanation: "Esses sÃ£o os sinais clÃ¡ssicos de lesÃ£o da uretra posterior, comumente associada a fraturas pÃ©lvicas. Nestes casos, a passagem de uma sonda vesical de demora estÃ¡ contraindicada antes da realizaÃ§Ã£o de uma uretrocistografia retrÃ³grada."
    },
    {
        question: "Para um adulto de 70 kg com queimaduras de segundo e terceiro graus em 30% da superfÃ­cie corporal, qual o volume de Ringer Lactato a ser infundido nas primeiras 8 horas, segundo a fÃ³rmula de Parkland (4 mL x Peso x %SCQ)?",
        options: ["4200 mL", "8400 mL", "2100 mL", "7000 mL", "3000 mL"],
        correctAnswer: "4200 mL",
        explanation: "A fÃ³rmula de Parkland calcula o volume total para as primeiras 24 horas: 4 mL x 70 kg x 30 = 8400 mL. Metade deste volume (4200 mL) deve ser infundida nas primeiras 8 horas a partir do momento da queimadura."
    },
    {
        question: "Paciente de 37 anos apresenta uma lesÃ£o pigmentada no dorso, com 1,5 cm de diÃ¢metro, bordas irregulares, mÃºltiplas cores e crescimento recente. Qual Ã© o tipo de biÃ³psia de escolha para a suspeita de melanoma?",
        options: ["BiÃ³psia incisional", "BiÃ³psia por shaving", "BiÃ³psia excisional com margens de 2 mm", "BiÃ³psia por punch", "Citologia aspirativa"],
        correctAnswer: "BiÃ³psia excisional com margens de 2 mm",
        explanation: "Na suspeita de melanoma, a biÃ³psia deve ser excisional, removendo a lesÃ£o inteira com uma pequena margem de pele normal (1-3 mm). Isso permite ao patologista avaliar a espessura total do tumor (Ã­ndice de Breslow), que Ã© o fator prognÃ³stico mais importante e guia o tratamento subsequente."
    },
    {
        question: "A SÃ­ndrome de Lynch, ou CÃ¢ncer Colorretal HereditÃ¡rio NÃ£o Poliposo (HNPCC), Ã© uma condiÃ§Ã£o autossÃ´mica dominante que aumenta o risco de cÃ¢ncer colorretal e outros tumores. EstÃ¡ associada a mutaÃ§Ãµes em quais genes?",
        options: ["APC", "BRCA1 e BRCA2", "TP53", "Genes de reparo de DNA (mismatch repair), como MLH1, MSH2, MSH6 e PMS2", "RET"],
        correctAnswer: "Genes de reparo de DNA (mismatch repair), como MLH1, MSH2, MSH6 e PMS2",
        explanation: "A SÃ­ndrome de Lynch Ã© causada por mutaÃ§Ãµes germinativas em genes responsÃ¡veis pelo reparo de erros de pareamento do DNA (MMR - Mismatch Repair), levando a uma instabilidade de microssatÃ©lites e a um risco muito aumentado de cÃ¢ncer, principalmente colorretal e de endomÃ©trio."
    },
    {
        question: "Mulher de 45 anos realiza ultrassonografia de tireoide que evidencia um nÃ³dulo de 1,2 cm, sÃ³lido, hipoecoico e com microcalcificaÃ§Ãµes em seu interior. Qual Ã© a conduta mais apropriada?",
        options: ["Acompanhamento com nova ultrassonografia em 6 meses", "SupressÃ£o com levotiroxina", "PunÃ§Ã£o Aspirativa por Agulha Fina (PAAF)", "Tireoidectomia total", "Cintilografia de tireoide"],
        correctAnswer: "PunÃ§Ã£o Aspirativa por Agulha Fina (PAAF)",
        explanation: "As caracterÃ­sticas ultrassonogrÃ¡ficas do nÃ³dulo (sÃ³lido, hipoecoico, com microcalcificaÃ§Ãµes) sÃ£o altamente suspeitas de malignidade. Portanto, a PAAF estÃ¡ indicada para avaliaÃ§Ã£o citolÃ³gica e definiÃ§Ã£o da natureza do nÃ³dulo."
    },
    {
        question: "Um paciente de 40 anos, homossexual, apresenta mÃºltiplas lesÃµes violÃ¡ceas em pele e mucosa oral. A biÃ³psia de uma lesÃ£o confirma o diagnÃ³stico de Sarcoma de Kaposi. A investigaÃ§Ã£o para qual infecÃ§Ã£o viral Ã© mandatÃ³ria neste caso?",
        options: ["Hepatite C", "VÃ­rus Epstein-Barr", "VÃ­rus da ImunodeficiÃªncia Humana (HIV)", "CitomegalovÃ­rus", "HerpesvÃ­rus humano tipo 8 (HHV-8) isoladamente"],
        correctAnswer: "VÃ­rus da ImunodeficiÃªncia Humana (HIV)",
        explanation: "O Sarcoma de Kaposi Ã© uma neoplasia definidora de AIDS, causada pelo HerpesvÃ­rus humano 8 (HHV-8) em um contexto de imunossupressÃ£o. Sua presenÃ§a, especialmente na forma epidÃªmica, torna a testagem para o HIV obrigatÃ³ria."
    },
    {
        question: "Mulher de 62 anos, na menopausa, apresenta um episÃ³dio de sangramento vaginal. A ultrassonografia transvaginal mostra um espessamento endometrial de 12 mm. Qual Ã© o prÃ³ximo passo diagnÃ³stico?",
        options: ["Dosagem de CA-125", "ObservaÃ§Ã£o e repetiÃ§Ã£o da ultrassonografia em 3 meses", "Histeroscopia com biÃ³psia endometrial", "Iniciar terapia de reposiÃ§Ã£o hormonal", "Papanicolau"],
        correctAnswer: "Histeroscopia com biÃ³psia endometrial",
        explanation: "Sangramento pÃ³s-menopausa Ã© considerado cÃ¢ncer de endomÃ©trio atÃ© prova em contrÃ¡rio. Um espessamento endometrial > 4-5 mm nesta populaÃ§Ã£o requer investigaÃ§Ã£o histopatolÃ³gica. A histeroscopia com biÃ³psia dirigida Ã© o padrÃ£o-ouro para o diagnÃ³stico."
    },
    {
        question: "Paciente de 65 anos apresenta icterÃ­cia obstrutiva progressiva e indolor. A tomografia evidencia uma massa de 3 cm na cabeÃ§a do pÃ¢ncreas, sem sinais de metÃ¡stases Ã  distÃ¢ncia. Qual o nome do procedimento cirÃºrgico com intenÃ§Ã£o curativa para esta condiÃ§Ã£o?",
        options: ["Cirurgia de Hartmann", "Gastrectomia total", "Hepatectomia direita", "Cirurgia de Whipple (duodenopancreatectomia)", "DerivaÃ§Ã£o biliodigestiva"],
        correctAnswer: "Cirurgia de Whipple (duodenopancreatectomia)",
        explanation: "A cirurgia de Whipple Ã© o procedimento padrÃ£o para a ressecÃ§Ã£o de tumores da cabeÃ§a do pÃ¢ncreas. Envolve a remoÃ§Ã£o da cabeÃ§a do pÃ¢ncreas, duodeno, vesÃ­cula biliar, colÃ©doco distal e, por vezes, uma porÃ§Ã£o do estÃ´mago."
    },
    {
        question: "No estadiamento e tratamento cirÃºrgico do cÃ¢ncer de mama invasivo sem linfonodos clinicamente suspeitos, qual Ã© o principal objetivo da biÃ³psia do linfonodo sentinela?",
        options: ["Remover todos os linfonodos axilares para controle da doenÃ§a", "Avaliar o estado da axila de forma minimamente invasiva para evitar a linfadenectomia completa se for negativo", "Apenas confirmar o diagnÃ³stico de cÃ¢ncer de mama", "Reduzir o tamanho do tumor primÃ¡rio", "Prevenir a ocorrÃªncia de linfedema"],
        correctAnswer: "Avaliar o estado da axila de forma minimamente invasiva para evitar a linfadenectomia completa se for negativo",
        explanation: "A biÃ³psia do linfonodo sentinela (o primeiro a receber a drenagem linfÃ¡tica do tumor) permite avaliar o status da axila. Se o sentinela for negativo para metÃ¡stase, a linfadenectomia axilar completa, com sua maior morbidade (linfedema, dor), pode ser evitada."
    },
    {
        question: "Paciente de 60 anos, submetido a uma retossigmoidectomia por cÃ¢ncer hÃ¡ 2 anos, apresenta em exame de seguimento uma Ãºnica lesÃ£o de 3 cm no lobo direito do fÃ­gado, sugestiva de metÃ¡stase. NÃ£o hÃ¡ outras lesÃµes. Qual Ã© a melhor abordagem terapÃªutica?",
        options: ["Quimioterapia paliativa exclusiva", "Radioterapia hepÃ¡tica", "ObservaÃ§Ã£o (watchful waiting)", "RessecÃ§Ã£o cirÃºrgica da metÃ¡stase (hepatectomia parcial)", "AblaÃ§Ã£o por radiofrequÃªncia"],
        correctAnswer: "RessecÃ§Ã£o cirÃºrgica da metÃ¡stase (hepatectomia parcial)",
        explanation: "A ressecÃ§Ã£o de metÃ¡stases hepÃ¡ticas de origem colorretal, quando limitadas em nÃºmero e passÃ­veis de ressecÃ§Ã£o completa, oferece a Ãºnica chance de cura e sobrevida a longo prazo para esses pacientes."
    },
    {
        question: "De acordo com as diretrizes da maioria das sociedades mÃ©dicas, o rastreamento do cÃ¢ncer colorretal para a populaÃ§Ã£o de risco mÃ©dio deve ser iniciado em que idade?",
        options: ["30 anos", "40 anos", "45 anos", "55 anos", "60 anos"],
        correctAnswer: "45 anos",
        explanation: "Houve uma recente reduÃ§Ã£o na idade de inÃ­cio do rastreamento do cÃ¢ncer colorretal de 50 para 45 anos para a populaÃ§Ã£o de risco habitual, devido ao aumento da incidÃªncia em adultos mais jovens. O mÃ©todo preferencial Ã© a colonoscopia a cada 10 anos."
    },
    {
        question: "Paciente no segundo dia de pÃ³s-operatÃ³rio de tireoidectomia total queixa-se de formigamento nos lÃ¡bios e nas mÃ£os. Ao aferir a pressÃ£o arterial, o examinador observa um espasmo do carpo. Qual Ã© o diagnÃ³stico e o tratamento imediato?",
        options: ["Crise tireotÃ³xica; Propiltiouracil", "LesÃ£o do nervo larÃ­ngeo; observaÃ§Ã£o", "Hipocalcemia aguda; Gluconato de cÃ¡lcio endovenoso", "Hipomagnesemia; Sulfato de magnÃ©sio", "Alcalose respiratÃ³ria; respirar em saco de papel"],
        correctAnswer: "Hipocalcemia aguda; Gluconato de cÃ¡lcio endovenoso",
        explanation: "A parestesia perioral e o sinal de Trousseau (espasmo do carpo Ã  isquemia) sÃ£o sinais de hipocalcemia aguda, uma complicaÃ§Ã£o comum da tireoidectomia devido ao hipoparatireoidismo inadvertido. O tratamento da hipocalcemia sintomÃ¡tica Ã© a reposiÃ§Ã£o endovenosa de cÃ¡lcio."
    },
    {
        question: "Paciente com rouquidÃ£o persistente apÃ³s uma tireoidectomia. A laringoscopia confirma paralisia da prega vocal direita. Qual estrutura nervosa foi mais provavelmente lesionada durante a cirurgia?",
        options: ["Nervo vago", "Nervo larÃ­ngeo superior", "Nervo larÃ­ngeo recorrente direito", "Nervo frÃªnico", "Plexo cervical"],
        correctAnswer: "Nervo larÃ­ngeo recorrente direito",
        explanation: "O nervo larÃ­ngeo recorrente Ã© responsÃ¡vel pela inervaÃ§Ã£o da maioria dos mÃºsculos intrÃ­nsecos da laringe. Sua lesÃ£o durante a tireoidectomia Ã© a principal causa de paralisia de prega vocal e rouquidÃ£o no pÃ³s-operatÃ³rio."
    },
    {
        question: "Paciente submetido a uma gastrectomia com reconstruÃ§Ã£o a Billroth II apresenta tontura, sudorese, taquicardia e diarreia explosiva cerca de 20 a 30 minutos apÃ³s as refeiÃ§Ãµes. Qual Ã© o diagnÃ³stico desta complicaÃ§Ã£o pÃ³s-operatÃ³ria?",
        options: ["SÃ­ndrome da alÃ§a aferente", "Gastrite de refluxo alcalino", "SÃ­ndrome de Dumping precoce", "SÃ­ndrome de Dumping tardio", "Diarreia por vagotomia"],
        correctAnswer: "SÃ­ndrome de Dumping precoce",
        explanation: "A SÃ­ndrome de Dumping precoce ocorre pela passagem rÃ¡pida de conteÃºdo hiperosmolar do coto gÃ¡strico para o jejuno, desencadeando uma resposta autonÃ´mica (sintomas vasomotores) e liberaÃ§Ã£o de hormÃ´nios gastrointestinais. - comum apÃ³s gastrectomias."
    },
    {
        question: "Paciente com histÃ³rico de gastrectomia com reconstruÃ§Ã£o a Billroth II refere dor abdominal e vÃ´mitos que contÃªm apenas bile e aliviam a dor. O que essa apresentaÃ§Ã£o sugere?",
        options: ["SÃ­ndrome de Dumping precoce", "SÃ­ndrome da alÃ§a aferente", "Gastrite de refluxo alcalino", "UlceraÃ§Ã£o da anastomose", "FÃ­stula gastrojejunal"],
        correctAnswer: "SÃ­ndrome da alÃ§a aferente",
        explanation: "A sÃ­ndrome da alÃ§a aferente Ã© uma complicaÃ§Ã£o mecÃ¢nica da reconstruÃ§Ã£o a Billroth II, onde a alÃ§a aferente (duodenal) fica obstruÃ­da. O acÃºmulo de secreÃ§Ãµes biliopancreÃ¡ticas causa dor e distensÃ£o, que sÃ£o aliviadas por um vÃ´mito bilioso em jato."
    },
    {
        question: "No 5Âº dia de pÃ³s-operatÃ³rio de uma laparotomia, um paciente refere ter sentido 'algo estourar' no abdome apÃ³s um acesso de tosse, seguido pela saÃ­da de grande quantidade de lÃ­quido serossanguÃ­neo pela ferida. Este quadro Ã© altamente sugestivo de:",
        options: ["InfecÃ§Ã£o de sÃ­tio cirÃºrgico", "Hematoma de parede", "Seroma", "EvisceraÃ§Ã£o ou deiscÃªncia aponeurÃ³tica", "HÃ©rnia incisional"],
        correctAnswer: "EvisceraÃ§Ã£o ou deiscÃªncia aponeurÃ³tica",
        explanation: "A saÃ­da de lÃ­quido serossanguÃ­neo ('Ã¡gua de lavado de carne') pela ferida operatÃ³ria Ã© um sinal clÃ¡ssico de deiscÃªncia da aponeurose, com risco iminente de evisceraÃ§Ã£o (saÃ­da das alÃ§as). - uma emergÃªncia cirÃºrgica."
    },
    {
        question: "Qual das seguintes opÃ§Ãµes descreve uma infecÃ§Ã£o de sÃ­tio cirÃºrgico superficial?",
        options: ["Abscesso intra-abdominal prÃ³ximo a uma anastomose", "ColeÃ§Ã£o purulenta na fÃ¡scia muscular", "Celulite e secreÃ§Ã£o purulenta confinadas Ã  pele e ao tecido subcutÃ¢neo da incisÃ£o", "Febre e leucocitose sem alteraÃ§Ãµes na ferida", "DeiscÃªncia da aponeurose"],
        correctAnswer: "Celulite e secreÃ§Ã£o purulenta confinadas Ã  pele e ao tecido subcutÃ¢neo da incisÃ£o",
        explanation: "Por definiÃ§Ã£o, a infecÃ§Ã£o de sÃ­tio cirÃºrgico superficial envolve apenas a pele e o tecido celular subcutÃ¢neo. O tratamento geralmente consiste em abertura dos pontos, drenagem e curativos, podendo ou nÃ£o necessitar de antibiÃ³ticos."
    },
    {
        question: "Qual o tratamento de escolha para uma hÃ©rnia inguinal sintomÃ¡tica em um adulto saudÃ¡vel?",
        options: ["Uso de fundas (suspensÃ³rios)", "ObservaÃ§Ã£o e acompanhamento clÃ­nico", "Fisioterapia para fortalecimento da parede abdominal", "Herniorrafia, preferencialmente com colocaÃ§Ã£o de tela (tÃ©cnica de Lichtenstein)", "Tratamento medicamentoso para reduÃ§Ã£o da pressÃ£o intra-abdominal"],
        correctAnswer: "Herniorrafia, preferencialmente com colocaÃ§Ã£o de tela (tÃ©cnica de Lichtenstein)",
        explanation: "O tratamento de hÃ©rnias inguinais sintomÃ¡ticas Ã© cirÃºrgico para prevenir complicaÃ§Ãµes como encarceramento e estrangulamento. A tÃ©cnica de Lichtenstein, que utiliza uma tela de polipropileno para reforÃ§ar a parede posterior, Ã© o padrÃ£o-ouro por apresentar baixas taxas de recidiva."
    },
    {
        question: "Na colecistectomia videolaparoscÃ³pica, a 'visÃ£o crÃ­tica de seguranÃ§a de Calot' Ã© uma manobra essencial para prevenir a lesÃ£o da via biliar principal. Ela consiste na dissecÃ§Ã£o e identificaÃ§Ã£o de quais estruturas antes de qualquer clipagem ou secÃ§Ã£o?",
        options: ["ArtÃ©ria hepÃ¡tica direita e veia porta", "Ducto hepÃ¡tico comum e artÃ©ria hepÃ¡tica prÃ³pria", "Ducto cÃ­stico e artÃ©ria cÃ­stica", "Ligamento de Treitz e pÃ¢ncreas", "Veia cava inferior e aorta"],
        correctAnswer: "Ducto cÃ­stico e artÃ©ria cÃ­stica",
        explanation: "A visÃ£o crÃ­tica de seguranÃ§a preconiza que apenas duas estruturas devem entrar no triÃ¢ngulo de Calot para serem ligadas e seccionadas: o ducto cÃ­stico e a artÃ©ria cÃ­stica. A identificaÃ§Ã£o clara e inequÃ­voca dessas duas estruturas antes de sua ligadura Ã© o passo mais importante para evitar a lesÃ£o iatrogÃªnica do colÃ©doco."
    },
    {
        question: "Quais vacinas sÃ£o essenciais e devem ser administradas a um paciente antes de uma esplenectomia eletiva para prevenir a sepse fulminante pÃ³s-esplenectomia?",
        options: ["TrÃ­plice viral e febre amarela", "Hepatite A e B", "Contra germes encapsulados: Pneumococo, Meningococo e Haemophilus influenzae tipo b", "BCG e poliomielite", "DTP e HPV"],
        correctAnswer: "Contra germes encapsulados: Pneumococo, Meningococo e Haemophilus influenzae tipo b",
        explanation: "O baÃ§o Ã© fundamental na defesa contra bactÃ©rias encapsuladas. Pacientes esplenectomizados tÃªm alto risco de sepse por esses agentes. A imunizaÃ§Ã£o prÃ©-operatÃ³ria (idealmente 14 dias antes) Ã© crucial para a prevenÃ§Ã£o."
    },
    {
        question: "Quais sÃ£o as trÃªs fases da cicatrizaÃ§Ã£o de feridas, na ordem cronolÃ³gica correta?",
        options: ["InflamatÃ³ria, MaturaÃ§Ã£o, Proliferativa", "Proliferativa, InflamatÃ³ria, MaturaÃ§Ã£o", "InflamatÃ³ria, Proliferativa, MaturaÃ§Ã£o (ou Remodelamento)", "Hemostasia, InflamatÃ³ria, Proliferativa", "GranulaÃ§Ã£o, EpitelizaÃ§Ã£o, ContraÃ§Ã£o"],
        correctAnswer: "InflamatÃ³ria, Proliferativa, MaturaÃ§Ã£o (ou Remodelamento)",
        explanation: "O processo de cicatrizaÃ§Ã£o de feridas segue uma sequÃªncia ordenada: a fase inflamatÃ³ria (hemostasia e inflamaÃ§Ã£o), a fase proliferativa (angiogÃªnese, fibroplasia e epitelizaÃ§Ã£o) e a fase de maturaÃ§Ã£o ou remodelamento (reorganizaÃ§Ã£o do colÃ¡geno)."
    },
    {
        question: "O agente anestÃ©sico de induÃ§Ã£o endovenoso que deve ser usado com cautela ou evitado em pacientes com doenÃ§a coronariana grave por causar aumento da frequÃªncia cardÃ­aca e da pressÃ£o arterial Ã©:",
        options: ["Propofol", "Etomidato", "Tiopental", "Cetamina", "Midazolam"],
        correctAnswer: "Cetamina",
        explanation: "A cetamina causa anestesia dissociativa e tem um efeito simpatomimÃ©tico, aumentando a frequÃªncia cardÃ­aca, a pressÃ£o arterial e o consumo de oxigÃªnio pelo miocÃ¡rdio, o que pode ser deletÃ©rio em um paciente com reserva coronariana limitada."
    },
    {
        question: "Um paciente Ã© submetido a uma cirurgia de apendicectomia por apendicite aguda nÃ£o perfurada. De acordo com a classificaÃ§Ã£o de potencial de contaminaÃ§Ã£o da ferida, esta cirurgia Ã© classificada como:",
        options: ["Limpa", "Limpa-contaminada", "Contaminada", "Infectada (ou suja)", "Potencialmente contaminada"],
        correctAnswer: "Contaminada",
        explanation: "Cirurgias com inflamaÃ§Ã£o aguda nÃ£o purulenta, como na apendicite nÃ£o perfurada, sÃ£o classificadas como contaminadas. A profilaxia antibiÃ³tica estÃ¡ indicada."
    },
    {
        question: "FamÃ­lia de um paciente de 82 anos, lÃºcido e orientado, pede ao cirurgiÃ£o para nÃ£o informÃ¡-lo sobre a possibilidade de uma colostomia definitiva, temendo que ele 'desista' da cirurgia. Qual Ã© a conduta Ã©tica correta do mÃ©dico?",
        options: ["Concordar com a famÃ­lia e omitir a informaÃ§Ã£o para proteger o paciente.", "Respeitar a autonomia do paciente, informando-o de todos os riscos e possibilidades, incluindo a colostomia, e envolvÃª-lo na decisÃ£o.", "Pedir Ã  famÃ­lia para comunicar a notÃ­cia ao paciente.", "Realizar a cirurgia e informar sobre a colostomia apenas se ela for necessÃ¡ria.", "Cancelar a cirurgia devido ao conflito Ã©tico."],
        correctAnswer: "Respeitar a autonomia do paciente, informando-o de todos os riscos e possibilidades, incluindo a colostomia, e envolvÃª-lo na decisÃ£o.",
        explanation: "O princÃ­pio da autonomia prevalece. O paciente, estando lÃºcido, tem o direito de ser informado sobre todos os aspectos de seu tratamento para tomar uma decisÃ£o informada. O mÃ©dico deve conversar com a famÃ­lia para explicar a importÃ¢ncia deste princÃ­pio, mas a decisÃ£o final sobre o que informar cabe ao paciente."
    },
    {
        question: "Durante uma cirurgia, antes da incisÃ£o na pele, o cirurgiÃ£o, o anestesista e a equipe de enfermagem pausam para confirmar em voz alta o nome do paciente, o procedimento e o local cirÃºrgico. Esta prÃ¡tica faz parte de qual iniciativa de seguranÃ§a?",
        options: ["Protocolo de Manchester", "Escala de Coma de Glasgow", "Checklist de SeguranÃ§a CirÃºrgica da OMS (Time Out)", "Escore de Caprini", "CritÃ©rios de Ranson"],
        correctAnswer: "Checklist de SeguranÃ§a CirÃºrgica da OMS (Time Out)",
        explanation: "Esta etapa, conhecida como 'Time Out' ou 'Pausa CirÃºrgica', Ã© a segunda fase do Checklist de SeguranÃ§a CirÃºrgica da OrganizaÃ§Ã£o Mundial da SaÃºde, e tem como objetivo principal prevenir erros como cirurgia no paciente errado, no local errado ou o procedimento errado."
    },
    {
        question: "Paciente adepto da religiÃ£o Testemunha de JeovÃ¡, necessitando de uma cirurgia de grande porte com alto risco de sangramento, assina um termo recusando veementemente qualquer transfusÃ£o de sangue ou hemoderivados. Como a equipe deve proceder?",
        options: ["Ignorar a recusa em caso de risco de morte, pelo princÃ­pio da beneficÃªncia.", "Tentar convencer o paciente a mudar de ideia, atrasando a cirurgia.", "Respeitar a decisÃ£o do paciente, documentÃ¡-la em prontuÃ¡rio e utilizar todas as estratÃ©gias alternativas para minimizar o sangramento.", "Solicitar uma ordem judicial para autorizar a transfusÃ£o.", "Recusar-se a realizar a cirurgia."],
        correctAnswer: "Respeitar a decisÃ£o do paciente, documentÃ¡-la em prontuÃ¡rio e utilizar todas as estratÃ©gias alternativas para minimizar o sangramento.",
        explanation: "Para pacientes adultos e capazes, a recusa de tratamento, mesmo que vital, baseada em crenÃ§as religiosas ou pessoais, Ã© um direito garantido pelo princÃ­pio da autonomia. Cabe Ã  equipe mÃ©dica respeitar essa decisÃ£o, documentÃ¡-la adequadamente e empregar todas as tÃ©cnicas disponÃ­veis para realizar o procedimento da forma mais segura possÃ­vel dentro dessa limitaÃ§Ã£o."
    }
  ],
  'Medicina Preventiva': [
    {
        question: "Um grÃ¡fico histÃ³rico mostra uma queda acentuada e contÃ­nua na taxa de mortalidade por tuberculose em um paÃ­s europeu, iniciando dÃ©cadas antes da descoberta da estreptomicina (1943). Qual fator melhor explica essa reduÃ§Ã£o significativa da mortalidade antes da existÃªncia de um tratamento farmacolÃ³gico eficaz?",
        options: [
            "A implementaÃ§Ã£o de programas de vacinaÃ§Ã£o em massa com BCG.",
            "O desenvolvimento de testes diagnÃ³sticos mais sensÃ­veis, como o PPD.",
            "A melhoria das condiÃ§Ãµes de vida e nutriÃ§Ã£o da populaÃ§Ã£o, reduzindo a vulnerabilidade Ã  doenÃ§a.",
            "O isolamento compulsÃ³rio de todos os pacientes em sanatÃ³rios.",
            "A seleÃ§Ã£o natural de uma populaÃ§Ã£o geneticamente mais resistente ao bacilo."
        ],
        correctAnswer: "A melhoria das condiÃ§Ãµes de vida e nutriÃ§Ã£o da populaÃ§Ã£o, reduzindo a vulnerabilidade Ã  doenÃ§a.",
        explanation: "Este Ã© um exemplo clÃ¡ssico do impacto dos determinantes sociais da saÃºde. A 'queda secular' da tuberculose foi impulsionada principalmente por melhorias nas condiÃ§Ãµes de moradia, saneamento e, crucialmente, nutriÃ§Ã£o. Esses fatores fortaleceram o sistema imunolÃ³gico da populaÃ§Ã£o, diminuindo a progressÃ£o da infecÃ§Ã£o para a doenÃ§a ativa e a letalidade, muito antes da terapia medicamentosa eficaz."
    },
    {
        question: "Em uma festa, vÃ¡rias pessoas desenvolvem hepatite A. A investigaÃ§Ã£o epidemiolÃ³gica revela que todos os doentes consumiram salada de frutas de um mesmo fornecedor, enquanto os que nÃ£o comeram a salada nÃ£o adoeceram. Qual tipo de estudo foi realizado para identificar a fonte?",
        options: [
            "Estudo de coorte prospectivo.",
            "Ensaio clÃ­nico randomizado.",
            "Estudo de caso-controle.",
            "Estudo de coorte retrospectivo (ou de surto).",
            "Estudo ecolÃ³gico."
        ],
        correctAnswer: "Estudo de coorte retrospectivo (ou de surto).",
        explanation: "Na investigaÃ§Ã£o de surtos, os epidemiologistas partem de uma exposiÃ§Ã£o comum no passado (comer a salada) e comparam a incidÃªncia da doenÃ§a entre os expostos e os nÃ£o expostos. Como o evento jÃ¡ ocorreu, trata-se de um estudo de coorte retrospectivo."
    },
    {
        question: "Um grÃ¡fico sobre a implementaÃ§Ã£o da vacina contra a poliomielite mostra que a incidÃªncia da doenÃ§a caiu drasticamente nÃ£o apenas no grupo vacinado, mas tambÃ©m entre os nÃ£o vacinados da mesma comunidade. Que fenÃ´meno epidemiolÃ³gico isso demonstra?",
        options: [
            "Efeito placebo.",
            "Imunidade de rebanho (ou coletiva).",
            "ViÃ©s de seleÃ§Ã£o.",
            "MutaÃ§Ã£o do vÃ­rus.",
            "EficÃ¡cia vacinal de 100%."
        ],
        correctAnswer: "Imunidade de rebanho (ou coletiva).",
        explanation: "A imunidade de rebanho ocorre quando a vacinaÃ§Ã£o de uma grande proporÃ§Ã£o da populaÃ§Ã£o protege indiretamente os indivÃ­duos nÃ£o vacinados, pois a alta cobertura vacinal dificulta a circulaÃ§Ã£o e a transmissÃ£o do agente infeccioso."
    },
    {
        question: "Para investigar a associaÃ§Ã£o entre tabagismo e cÃ¢ncer de pulmÃ£o, pesquisadores selecionam 100 pacientes com diagnÃ³stico de cÃ¢ncer de pulmÃ£o (casos) e 200 pacientes sem a doenÃ§a (controles), internados no mesmo hospital por outras causas. Em seguida, eles investigam o histÃ³rico de tabagismo em ambos os grupos. Qual Ã© o desenho deste estudo?",
        options: [
            "Estudo de coorte.",
            "Ensaio clÃ­nico.",
            "Estudo transversal.",
            "Estudo de caso-controle.",
            "Estudo ecolÃ³gico."
        ],
        correctAnswer: "Estudo de caso-controle.",
        explanation: "O estudo de caso-controle parte do desfecho (doenÃ§a presente vs. ausente) e investiga retrospectivamente a exposiÃ§Ã£o a um fator de risco. - um desenho eficiente para estudar doenÃ§as raras."
    },
    {
        question: "Pesquisadores recrutam 5.000 fumantes e 5.000 nÃ£o fumantes, todos sem diagnÃ³stico de DPOC, e os acompanham anualmente por 20 anos, registrando a ocorrÃªncia de novos casos da doenÃ§a em cada grupo. Este Ã© um exemplo de qual tipo de estudo?",
        options: [
            "Estudo de caso-controle.",
            "Estudo transversal.",
            "Estudo de coorte prospectivo.",
            "Ensaio clÃ­nico randomizado.",
            "Relato de caso."
        ],
        correctAnswer: "Estudo de coorte prospectivo.",
        explanation: "Um estudo de coorte parte da exposiÃ§Ã£o (fumantes vs. nÃ£o fumantes) e segue os grupos ao longo do tempo (prospectivamente) para observar a incidÃªncia de um desfecho (DPOC). - o melhor desenho para determinar incidÃªncia e risco relativo."
    },
    {
        question: "Um inquÃ©rito de saÃºde Ã© realizado em uma cidade, onde 2.000 adultos sÃ£o entrevistados e examinados em um Ãºnico perÃ­odo de tempo para determinar quantos tÃªm hipertensÃ£o e quantos tÃªm diabetes. Que tipo de medida de frequÃªncia da doenÃ§a este estudo pode calcular diretamente?",
        options: [
            "IncidÃªncia.",
            "PrevalÃªncia.",
            "Risco relativo.",
            "Taxa de mortalidade.",
            "Odds Ratio."
        ],
        correctAnswer: "PrevalÃªncia.",
        explanation: "Estudos transversais, que avaliam exposiÃ§Ã£o e doenÃ§a em um Ãºnico momento, sÃ£o como uma 'fotografia' da populaÃ§Ã£o. Eles permitem calcular a prevalÃªncia, que Ã© a proporÃ§Ã£o de indivÃ­duos com a doenÃ§a em um determinado momento, mas nÃ£o a incidÃªncia (casos novos)."
    },
    {
        question: "Ao comparar a taxa de mortalidade por COVID-19 entre diferentes paÃ­ses, um pesquisador utiliza dados agregados de mortalidade e de gastos com saÃºde por paÃ­s. Qual o principal viÃ©s ou limitaÃ§Ã£o deste tipo de estudo (ecolÃ³gico)?",
        options: [
            "ViÃ©s de memÃ³ria.",
            "Perda de seguimento.",
            "FalÃ¡cia ecolÃ³gica.",
            "Efeito Hawthorne.",
            "ViÃ©s de seleÃ§Ã£o."
        ],
        correctAnswer: "FalÃ¡cia ecolÃ³gica.",
        explanation: "A falÃ¡cia ecolÃ³gica Ã© o erro de inferir que as associaÃ§Ãµes observadas em nÃ­vel de grupo (paÃ­ses) sÃ£o verdadeiras em nÃ­vel individual. NÃ£o se pode concluir que, dentro de um paÃ­s, os indivÃ­duos com maior gasto em saÃºde tiveram menor risco de morrer."
    },
    {
        question: "Para testar a eficÃ¡cia de uma nova vacina contra a dengue, 20.000 voluntÃ¡rios sÃ£o recrutados. Metade Ã© sorteada para receber a nova vacina, e a outra metade para receber uma injeÃ§Ã£o de soro fisiolÃ³gico (placebo). Ambos os grupos sÃ£o entÃ£o acompanhados por 2 anos. Qual Ã© o desenho deste estudo?",
        options: [
            "Estudo de coorte.",
            "Estudo de caso-controle.",
            "Estudo transversal.",
            "Ensaio clÃ­nico randomizado.",
            "Estudo quase-experimental."
        ],
        correctAnswer: "Ensaio clÃ­nico randomizado.",
        explanation: "Este Ã© o desenho de um ensaio clÃ­nico randomizado, considerado o padrÃ£o-ouro para avaliar a eficÃ¡cia de intervenÃ§Ãµes. Suas caracterÃ­sticas principais sÃ£o a intervenÃ§Ã£o (vacina) e a alocaÃ§Ã£o aleatÃ³ria dos participantes para os grupos de tratamento e controle."
    },
    {
        question: "Em uma populaÃ§Ã£o de 1.000 pessoas, 100 tÃªm diabetes (doenÃ§a crÃ´nica). Ao longo de um ano, 10 novos casos sÃ£o diagnosticados. Quais sÃ£o, respectivamente, a prevalÃªncia inicial e a incidÃªncia em um ano?",
        options: [
            "PrevalÃªncia 1%; IncidÃªncia 10%.",
            "PrevalÃªncia 10%; IncidÃªncia 1%.",
            "PrevalÃªncia 10%; IncidÃªncia 1,1%.",
            "PrevalÃªncia 11%; IncidÃªncia 1%.",
            "PrevalÃªncia 9%; IncidÃªncia 0,9%."
        ],
        correctAnswer: "PrevalÃªncia 10%; IncidÃªncia 1,1%.",
        explanation: "PrevalÃªncia = (casos existentes) / (populaÃ§Ã£o total) = 100 / 1000 = 10%. IncidÃªncia = (casos novos) / (populaÃ§Ã£o em risco no inÃ­cio). A populaÃ§Ã£o em risco era de 1000 - 100 = 900 pessoas. IncidÃªncia = 10 / 900 -^ 1,1%."
    },
    {
        question: "Um novo teste diagnÃ³stico para a doenÃ§a X tem uma sensibilidade de 95% e uma especificidade de 90%. O que significa uma sensibilidade de 95%?",
        options: [
            "O teste identifica corretamente 95% das pessoas sadias.",
            "O teste identifica corretamente 95% das pessoas doentes.",
            "Se o teste for positivo, hÃ¡ 95% de chance de ter a doenÃ§a.",
            "O teste resulta em 5% de falsos positivos.",
            "O teste Ã© 95% acurado no geral."
        ],
        correctAnswer: "O teste identifica corretamente 95% das pessoas doentes.",
        explanation: "Sensibilidade Ã© a capacidade do teste de identificar os verdadeiros positivos. Uma sensibilidade de 95% significa que, de 100 pessoas que realmente tÃªm a doenÃ§a, o teste serÃ¡ positivo em 95 delas."
    },
    {
        question: "Menina de 8 anos Ã© atendida na UBS com faringite, febre, exsudato amigdaliano e linfonodos cervicais dolorosos. O teste rÃ¡pido para estreptococo Ã© positivo. Qual Ã© o principal objetivo do tratamento com amoxicilina neste caso, alÃ©m de aliviar os sintomas?",
        options: [
            "Prevenir a transmissÃ£o para outras crianÃ§as.",
            "Evitar a evoluÃ§Ã£o para abscesso periamigdaliano.",
            "Prevenir a febre reumÃ¡tica aguda.",
            "Reduzir o risco de otite mÃ©dia aguda.",
            "Impedir a cronificaÃ§Ã£o da infecÃ§Ã£o."
        ],
        correctAnswer: "Prevenir a febre reumÃ¡tica aguda.",
        explanation: "O tratamento da faringoamigdalite estreptocÃ³cica (causada pelo Streptococcus pyogenes) com penicilina ou amoxicilina Ã© fundamental para a erradicaÃ§Ã£o da bactÃ©ria e a prevenÃ§Ã£o de sua principal complicaÃ§Ã£o nÃ£o supurativa tardia, a febre reumÃ¡tica aguda, que pode causar cardite e lesÃµes valvares permanentes."
    },
    {
        question: "Senhor de 58 anos, trabalhador da construÃ§Ã£o civil, queixa-se de dor crÃ´nica nos joelhos que o impede de trabalhar e de ter lazer. Ele diz: 'Doutor, acho que nÃ£o sirvo pra mais nada'. Qual atributo da AtenÃ§Ã£o PrimÃ¡ria Ã  SaÃºde (APS) Ã© mais importante na abordagem deste paciente?",
        options: [
            "Acesso de primeiro contato.",
            "CompetÃªncia cultural.",
            "OrientaÃ§Ã£o familiar e comunitÃ¡ria.",
            "Abordagem centrada na pessoa.",
            "CoordenaÃ§Ã£o do cuidado."
        ],
        correctAnswer: "Abordagem centrada na pessoa.",
        explanation: "A abordagem centrada na pessoa vai alÃ©m da doenÃ§a (osteoartrite) e busca compreender a experiÃªncia do indivÃ­duo com a doenÃ§a, suas emoÃ§Ãµes, expectativas e o impacto em sua vida. Validar seu sofrimento e explorar o significado da dor para ele Ã© crucial para um plano de cuidados efetivo."
    },
    {
        question: "Gestante com Ãndice de Massa Corporal (IMC) prÃ©-gestacional de 28 kg/mÂ² (sobrepeso). De acordo com as recomendaÃ§Ãµes do Institute of Medicine (IOM), qual Ã© a faixa de ganho de peso total adequada para ela durante toda a gestaÃ§Ã£o?",
        options: [
            "12,5 a 18 kg.",
            "11,5 a 16 kg.",
            "7 a 11,5 kg.",
            "5 a 9 kg.",
            "NÃ£o deve ganhar peso."
        ],
        correctAnswer: "7 a 11,5 kg.",
        explanation: "O ganho de peso gestacional recomendado varia conforme o IMC prÃ©-gestacional. Para mulheres com sobrepeso (IMC 25-29,9 kg/mÂ²), a faixa de ganho de peso recomendada Ã© de 7 a 11,5 kg, para otimizar os desfechos maternos e fetais."
    },
    {
        question: "Mulher de 30 anos, hÃ­gida, procura a UBS com disÃºria e polaciÃºria hÃ¡ 2 dias, sem febre ou dor lombar. Qual Ã© a conduta mais custo-efetiva para este quadro de cistite nÃ£o complicada?",
        options: [
            "Solicitar urocultura e aguardar o resultado para tratar.",
            "Solicitar ultrassonografia de vias urinÃ¡rias.",
            "Iniciar tratamento empÃ­rico com antibiÃ³tico de curta duraÃ§Ã£o (ex: fosfomicina dose Ãºnica ou nitrofurantoÃ­na por 5 dias).",
            "Apenas orientar aumento da ingesta hÃ­drica.",
            "Encaminhar para o urologista."
        ],
        correctAnswer: "Iniciar tratamento empÃ­rico com antibiÃ³tico de curta duraÃ§Ã£o (ex: fosfomicina dose Ãºnica ou nitrofurantoÃ­na por 5 dias).",
        explanation: "Em mulheres jovens, nÃ£o gestantes e sem comorbidades, o quadro de cistite aguda nÃ£o complicada pode ser tratado empiricamente, sem a necessidade de exames complementares iniciais. O tratamento de curta duraÃ§Ã£o Ã© altamente eficaz e recomendado."
    },
    {
        question: "Durante uma consulta na UBS, um paciente tabagista de 20 maÃ§os-ano afirma que 'gostaria de parar de fumar, mas nÃ£o sabe como'. Qual passo do modelo dos 5 'As' (Ask, Advise, Assess, Assist, Arrange) deve ser aplicado a seguir?",
        options: [
            "Ask (Perguntar) sobre o status de tabagismo.",
            "Advise (Aconselhar) o paciente a parar de fumar.",
            "Assess (Avaliar) a prontidÃ£o para a mudanÃ§a.",
            "Assist (Ajudar) na tentativa de parar, discutindo estratÃ©gias e medicamentos.",
            "Arrange (Organizar) o seguimento."
        ],
        correctAnswer: "Assist (Ajudar) na tentativa de parar, discutindo estratÃ©gias e medicamentos.",
        explanation: "O paciente jÃ¡ foi perguntado (Ask), aconselhado (Advise) e jÃ¡ demonstrou estar pronto para a mudanÃ§a (Assess). O prÃ³ximo passo lÃ³gico Ã© 'Assist', que envolve ajudar ativamente o paciente em sua tentativa, oferecendo suporte, discutindo estratÃ©gias comportamentais, estabelecendo uma data e, se indicado, prescrevendo terapia de reposiÃ§Ã£o de nicotina ou outros medicamentos."
    },
    {
        question: "Homem de 48 anos, assintomÃ¡tico, sem histÃ³rico familiar de cÃ¢ncer de prÃ³stata, solicita a realizaÃ§Ã£o do PSA para 'prevenÃ§Ã£o'. Qual Ã© a recomendaÃ§Ã£o atual da maioria das sociedades mÃ©dicas sobre o rastreamento do cÃ¢ncer de prÃ³stata com PSA para este paciente?",
        options: [
            "Deve ser realizado anualmente a partir dos 40 anos.",
            "EstÃ¡ contraindicado, pois os riscos superam os benefÃ­cios.",
            "A decisÃ£o deve ser compartilhada, apÃ³s explicar os potenciais benefÃ­cios (pequena reduÃ§Ã£o na mortalidade) e os riscos (sobrediagnÃ³stico, sobretratamento e suas complicaÃ§Ãµes).",
            "Deve ser realizado apenas se o toque retal estiver alterado.",
            "EstÃ¡ indicado apenas para homens acima de 55 anos."
        ],
        correctAnswer: "A decisÃ£o deve ser compartilhada, apÃ³s explicar os potenciais benefÃ­cios (pequena reduÃ§Ã£o na mortalidade) e os riscos (sobrediagnÃ³stico, sobretratamento e suas complicaÃ§Ãµes).",
        explanation: "O rastreamento do cÃ¢ncer de prÃ³stata com PSA Ã© controverso. A recomendaÃ§Ã£o atual nÃ£o Ã© de rastreamento universal, mas sim de uma decisÃ£o compartilhada entre o mÃ©dico e o paciente, onde os prÃ³s e contras sÃ£o discutidos abertamente para que o paciente possa tomar uma decisÃ£o informada."
    },
    {
        question: "Mulher de 55 anos, assintomÃ¡tica, realiza teste de pesquisa de sangue oculto nas fezes como parte de um programa de rastreamento de cÃ¢ncer colorretal, e o resultado Ã© positivo. Qual Ã© a conduta apropriada?",
        options: [
            "Repetir o teste em 1 ano.",
            "Iniciar dieta pobre em fibras e observar.",
            "Encaminhar para realizaÃ§Ã£o de colonoscopia.",
            "Solicitar uma retossigmoidoscopia.",
            "Tranquilizar a paciente, pois o resultado Ã© provavelmente um falso-positivo."
        ],
        correctAnswer: "Encaminhar para realizaÃ§Ã£o de colonoscopia.",
        explanation: "O teste de sangue oculto nas fezes Ã© um exame de rastreamento. Um resultado positivo nÃ£o Ã© diagnÃ³stico, mas indica a necessidade de um exame diagnÃ³stico para investigar a causa do sangramento. A colonoscopia Ã© o exame padrÃ£o-ouro para essa investigaÃ§Ã£o."
    },
    {
        question: "De acordo com as diretrizes do MinistÃ©rio da SaÃºde do Brasil, o rastreamento de cÃ¢ncer de colo de Ãºtero com o exame citopatolÃ³gico (Papanicolau) deve ser iniciado em qual idade e com qual periodicidade inicial?",
        options: [
            "Aos 18 anos, anualmente.",
            "Aos 21 anos, a cada 3 anos.",
            "Aos 25 anos, com os dois primeiros exames anuais e, se normais, a cada 3 anos.",
            "No inÃ­cio da atividade sexual, anualmente.",
            "Aos 30 anos, com teste de HPV a cada 5 anos."
        ],
        correctAnswer: "Aos 25 anos, com os dois primeiros exames anuais e, se normais, a cada 3 anos.",
        explanation: "As diretrizes brasileiras recomendam o inÃ­cio do rastreamento aos 25 anos para mulheres que jÃ¡ tiveram atividade sexual. ApÃ³s dois exames anuais consecutivos negativos, o rastreamento pode passar a ser trienal, atÃ© os 64 anos."
    },
    {
        question: "A mamografia Ã© o principal mÃ©todo de rastreamento para o cÃ¢ncer de mama. Para a populaÃ§Ã£o de risco habitual, o MinistÃ©rio da SaÃºde recomenda a sua realizaÃ§Ã£o na faixa etÃ¡ria de:",
        options: [
            "35 a 69 anos, anualmente.",
            "40 a 59 anos, anualmente.",
            "50 a 69 anos, a cada dois anos.",
            "40 a 74 anos, a cada dois anos.",
            "A partir dos 45 anos, anualmente."
        ],
        correctAnswer: "50 a 69 anos, a cada dois anos.",
        explanation: "A recomendaÃ§Ã£o do MinistÃ©rio da SaÃºde do Brasil e da OMS para o rastreamento mamogrÃ¡fico em mulheres de risco habitual Ã© a realizaÃ§Ã£o do exame a cada dois anos, na faixa etÃ¡ria de 50 a 69 anos, onde hÃ¡ maior evidÃªncia de benefÃ­cio em termos de reduÃ§Ã£o da mortalidade."
    },
    {
        question: "Uma mulher de 35 anos procura a UBS para sua primeira consulta de prÃ©-natal. Quais sorologias para infecÃ§Ãµes sexualmente transmissÃ­veis devem ser solicitadas rotineiramente neste momento?",
        options: [
            "Apenas HIV.",
            "HIV, sÃ­filis e hepatite C.",
            "HIV, sÃ­filis e hepatites B e C.",
            "HIV, sÃ­filis e hepatite B.",
            "Apenas sÃ­filis e hepatite B."
        ],
        correctAnswer: "HIV, sÃ­filis e hepatite B.",
        explanation: "O rastreamento universal no prÃ©-natal para HIV (teste rÃ¡pido ou sorologia), sÃ­filis (VDRL) e hepatite B (HBsAg) Ã© fundamental para a prevenÃ§Ã£o da transmissÃ£o vertical. A sorologia para hepatite C nÃ£o faz parte da rotina universal, sendo solicitada com base em fatores de risco."
    },
    {
        question: "Jovem com febre, mialgia e um exantema maculopapular em tronco e membros, que relata ter feito uma trilha em uma Ã¡rea de mata com presenÃ§a de capivaras hÃ¡ 10 dias. Qual doenÃ§a de notificaÃ§Ã£o compulsÃ³ria imediata deve ser suspeitada?",
        options: [
            "Dengue.",
            "Leptospirose.",
            "Febre amarela.",
            "Febre maculosa.",
            "Hantavirose."
        ],
        correctAnswer: "Febre maculosa.",
        explanation: "A febre maculosa, transmitida pelo carrapato-estrela (cujo hospedeiro inclui a capivara), Ã© uma doenÃ§a grave e de alta letalidade. A histÃ³ria epidemiolÃ³gica (contato com Ã¡rea de mata) associada ao quadro clÃ­nico (febre, mialgia, exantema) deve levantar a suspeita, e a notificaÃ§Ã£o Ã© imediata para permitir aÃ§Ãµes de vigilÃ¢ncia e alerta."
    },
    {
        question: "Uma mÃ£e chega Ã  sala de vacinas com seu filho de 2 meses e expressa medo de vacinÃ¡-lo, citando informaÃ§Ãµes que viu na internet associando vacinas ao autismo. Qual Ã© a abordagem mais adequada do profissional de saÃºde?",
        options: [
            "Ignorar a preocupaÃ§Ã£o e apenas aplicar a vacina.",
            "Recusar-se a vacinar a crianÃ§a e pedir para a mÃ£e assinar um termo de responsabilidade.",
            "Acolher a preocupaÃ§Ã£o da mÃ£e, usar uma escuta ativa, explicar que essa associaÃ§Ã£o jÃ¡ foi comprovada como falsa por mÃºltiplos estudos cientÃ­ficos, e reforÃ§ar os benefÃ­cios e a seguranÃ§a das vacinas.",
            "Dizer que a vacinaÃ§Ã£o Ã© obrigatÃ³ria por lei e que ela pode ser processada se nÃ£o vacinar.",
            "Marcar uma consulta com o pediatra para que ele convenÃ§a a mÃ£e."
        ],
        correctAnswer: "Acolher a preocupaÃ§Ã£o da mÃ£e, usar uma escuta ativa, explicar que essa associaÃ§Ã£o jÃ¡ foi comprovada como falsa por mÃºltiplos estudos cientÃ­ficos, e reforÃ§ar os benefÃ­cios e a seguranÃ§a das vacinas.",
        explanation: "A hesitaÃ§Ã£o vacinal deve ser abordada com empatia e informaÃ§Ã£o de qualidade. - fundamental validar a preocupaÃ§Ã£o da mÃ£e, estabelecer uma relaÃ§Ã£o de confianÃ§a e fornecer informaÃ§Ãµes claras e baseadas em evidÃªncias para desmistificar as 'fake news' e ressaltar a importÃ¢ncia da imunizaÃ§Ã£o."
    },
    {
        question: "Um profissional de enfermagem sofre um acidente com uma agulha de grosso calibre apÃ³s coletar sangue de um paciente com carga viral detectÃ¡vel para HIV. Qual Ã© a conduta imediata mais importante?",
        options: [
            "Apenas lavar o local com Ã¡gua e sabÃ£o.",
            "Solicitar sorologia para HIV e aguardar o resultado para iniciar a profilaxia.",
            "Iniciar a quimioprofilaxia pÃ³s-exposiÃ§Ã£o (PEP) com antirretrovirais o mais rÃ¡pido possÃ­vel, idealmente nas primeiras 2 horas.",
            "Tomar a vacina para hepatite B.",
            "Afastar-se do trabalho por 30 dias."
        ],
        correctAnswer: "Iniciar a quimioprofilaxia pÃ³s-exposiÃ§Ã£o (PEP) com antirretrovirais o mais rÃ¡pido possÃ­vel, idealmente nas primeiras 2 horas.",
        explanation: "Em uma exposiÃ§Ã£o de alto risco para o HIV, a PEP deve ser iniciada o mais precocemente possÃ­vel (preferencialmente em atÃ© 2 horas, e no mÃ¡ximo em 72 horas) para reduzir o risco de soroconversÃ£o. A avaliaÃ§Ã£o inicial e a coleta de sorologias basais devem ser feitas, mas nÃ£o devem atrasar o inÃ­cio da profilaxia."
    },
    {
        question: "Paciente chega Ã  emergÃªncia apÃ³s ser mordido na perna por um cÃ£o de rua, que fugiu. O ferimento Ã© profundo e o paciente nÃ£o se lembra se jÃ¡ tomou vacina antirrÃ¡bica. Qual Ã© a conduta correta para a profilaxia da raiva?",
        options: [
            "Apenas vacina antirrÃ¡bica.",
            "Apenas soro antirrÃ¡bico (imunoglobulina).",
            "Vacina e soro antirrÃ¡bico.",
            "Apenas observaÃ§Ã£o, pois a transmissÃ£o Ã© rara.",
            "Apenas antibioticoterapia e vacina antitetÃ¢nica."
        ],
        correctAnswer: "Vacina e soro antirrÃ¡bico.",
        explanation: "Trata-se de uma exposiÃ§Ã£o grave (ferimento profundo) por um animal agressor nÃ£o observÃ¡vel. Em um paciente nÃ£o previamente imunizado, a profilaxia pÃ³s-exposiÃ§Ã£o completa Ã© indicada, consistindo na aplicaÃ§Ã£o da imunoglobulina humana antirrÃ¡bica (HRIG) ou soro antirrÃ¡bico (SAR) e o inÃ­cio do esquema vacinal."
    },
    {
        question: "Uma crianÃ§a chega Ã  UBS com um ferimento corto-contuso no pÃ©, sujo de terra. A mÃ£e nÃ£o sabe informar sobre a situaÃ§Ã£o vacinal do filho para o tÃ©tano. Qual Ã© a conduta correta em relaÃ§Ã£o Ã  profilaxia do tÃ©tano?",
        options: [
            "Apenas limpar o ferimento.",
            "Administrar apenas a vacina (dT ou DTP).",
            "Administrar apenas o soro antitetÃ¢nico (SAT) ou a imunoglobulina humana antitetÃ¢nica (IGHAT).",
            "Administrar a vacina e o soro/imunoglobulina em locais diferentes.",
            "Aguardar 10 dias para ver se aparecem sintomas."
        ],
        correctAnswer: "Administrar a vacina e o soro/imunoglobulina em locais diferentes.",
        explanation: "Em um ferimento de alto risco para tÃ©tano em um paciente com histÃ³rico vacinal incerto, Ã© indicada a profilaxia completa com imunizaÃ§Ã£o passiva (soro ou imunoglobulina, para neutralizaÃ§Ã£o imediata da toxina) e ativa (vacina, para gerar imunidade futura)."
    },
    {
        question: "Jovem de 24 anos, com teste de gravidez positivo na UBS, comeÃ§a a chorar e revela que a gestaÃ§Ã£o nÃ£o foi planejada e que ela nÃ£o tem condiÃ§Ãµes de ter um filho agora. Qual Ã© a postura inicial mais adequada do profissional de saÃºde?",
        options: [
            "Aconselhar a paciente a levar a gestaÃ§Ã£o adiante, falando sobre os 'milagres da vida'.",
            "Imediatamente encaminhar para o serviÃ§o social.",
            "Oferecer um espaÃ§o de escuta empÃ¡tica e sem julgamentos, acolhendo sua angÃºstia e validando seus sentimentos, e informÃ¡-la sobre seus direitos e as opÃ§Ãµes disponÃ­veis dentro da legalidade.",
            "Explicar os riscos do aborto clandestino e focar apenas no inÃ­cio do prÃ©-natal.",
            "Sugerir que ela converse com o parceiro antes de tomar qualquer decisÃ£o."
        ],
        correctAnswer: "Oferecer um espaÃ§o de escuta empÃ¡tica e sem julgamentos, acolhendo sua angÃºstia e validando seus sentimentos, e informÃ¡-la sobre seus direitos e as opÃ§Ãµes disponÃ­veis dentro da legalidade.",
        explanation: "Acolhimento Ã© a diretriz fundamental. A paciente estÃ¡ em um momento de vulnerabilidade e precisa de um espaÃ§o seguro para expressar seus sentimentos. A postura do profissional deve ser de escuta, apoio e orientaÃ§Ã£o, garantindo o acesso Ã  informaÃ§Ã£o sobre seus direitos reprodutivos, incluindo o prÃ©-natal e as possibilidades de interrupÃ§Ã£o da gestaÃ§Ã£o previstas em lei no Brasil (estupro, risco de vida para a mÃ£e, anencefalia fetal)."
    },
    {
        question: "Uma mulher de 40 anos, com deficiÃªncia fÃ­sica, depressÃ£o, e que cuida sozinha de sua mÃ£e idosa com sinais de demÃªncia, procura a UBS com queixas vagas. A equipe de saÃºde da famÃ­lia decide elaborar um Projeto TerapÃªutico Singular (PTS) para ela. O que caracteriza um PTS?",
        options: [
            "Um protocolo clÃ­nico padrÃ£o para pacientes com mÃºltiplas comorbidades.",
            "Um plano de cuidados construÃ­do de forma conjunta entre a equipe e a usuÃ¡ria, focado em suas necessidades e contexto de vida, definindo metas e responsabilidades.",
            "Um formulÃ¡rio de encaminhamento para mÃºltiplos especialistas.",
            "Uma lista de medicamentos a serem prescritos.",
            "Uma autorizaÃ§Ã£o para internaÃ§Ã£o domiciliar."
        ],
        correctAnswer: "Um plano de cuidados construÃ­do de forma conjunta entre a equipe e a usuÃ¡ria, focado em suas necessidades e contexto de vida, definindo metas e responsabilidades.",
        explanation: "O PTS Ã© uma ferramenta de gestÃ£o do cuidado para casos complexos. Ele vai alÃ©m da abordagem biomÃ©dica, considerando os aspectos psicossociais e o contexto de vida do indivÃ­duo. - uma construÃ§Ã£o coletiva (equipe, usuÃ¡rio, famÃ­lia) de um plano de aÃ§Ã£o com metas e tarefas compartilhadas."
    },
    {
        question: "Um mÃ©dico de famÃ­lia e comunidade atende um paciente com diabetes na UBS e, ao perceber que a retinopatia estÃ¡ se agravando, o encaminha para o oftalmologista da rede. ApÃ³s a consulta, o mÃ©dico entra em contato com o especialista para discutir o caso e planejar o seguimento conjunto. Qual atributo da APS estÃ¡ sendo exercido?",
        options: [
            "Longitudinalidade.",
            "Integralidade.",
            "CoordenaÃ§Ã£o do cuidado.",
            "Acesso de primeiro contato.",
            "OrientaÃ§Ã£o comunitÃ¡ria."
        ],
        correctAnswer: "CoordenaÃ§Ã£o do cuidado.",
        explanation: "A coordenaÃ§Ã£o do cuidado Ã© a capacidade da APS de articular as diferentes ofertas de serviÃ§os de saÃºde, garantindo a continuidade da atenÃ§Ã£o ao longo do tempo e entre os diferentes pontos da rede. O mÃ©dico de famÃ­lia atua como o maestro do cuidado, integrando as aÃ§Ãµes dos especialistas."
    },
    {
        question: "Um paciente idoso Ã© acompanhado pelo mesmo mÃ©dico de famÃ­lia hÃ¡ 10 anos. O mÃ©dico conhece seu histÃ³rico, sua famÃ­lia, seu contexto social e os valores do paciente, o que permite uma tomada de decisÃ£o mais qualificada e uma forte relaÃ§Ã£o de confianÃ§a. Este acompanhamento ao longo do tempo Ã© a definiÃ§Ã£o de qual atributo da APS?",
        options: [
            "Acesso.",
            "Longitudinalidade.",
            "Integralidade.",
            "CoordenaÃ§Ã£o do cuidado.",
            "OrientaÃ§Ã£o familiar."
        ],
        correctAnswer: "Longitudinalidade.",
        explanation: "A longitudinalidade Ã© o acompanhamento do paciente pela mesma equipe de saÃºde ao longo do tempo, independentemente da presenÃ§a ou ausÃªncia de doenÃ§a. - o pilar que permite a construÃ§Ã£o do vÃ­nculo e da confianÃ§a, e Ã© considerado o atributo central da APS."
    },
    {
        question: "Um Agente ComunitÃ¡rio de SaÃºde (ACS), durante uma visita domiciliar, identifica uma famÃ­lia em situaÃ§Ã£o de extrema pobreza, com inseguranÃ§a alimentar e uma crianÃ§a fora da escola. AlÃ©m de comunicar a equipe da UBS, qual Ã© o papel do ACS nesta situaÃ§Ã£o?",
        options: [
            "Prescrever um suplemento alimentar para a crianÃ§a.",
            "Apenas orientar a famÃ­lia a procurar ajuda.",
            "Articular com outros serviÃ§os do territÃ³rio, como o CRAS (Centro de ReferÃªncia de AssistÃªncia Social), para o acesso a benefÃ­cios e programas sociais.",
            "Realizar uma campanha de doaÃ§Ã£o de alimentos no bairro.",
            "Ignorar os problemas sociais e focar apenas nas questÃµes de saÃºde."
        ],
        correctAnswer: "Articular com outros serviÃ§os do territÃ³rio, como o CRAS (Centro de ReferÃªncia de AssistÃªncia Social), para o acesso a benefÃ­cios e programas sociais.",
        explanation: "O ACS Ã© o elo entre a comunidade e a unidade de saÃºde, mas tambÃ©m com a rede intersetorial. Seu papel Ã© fundamental na identificaÃ§Ã£o de vulnerabilidades e na articulaÃ§Ã£o com outros equipamentos sociais do territÃ³rio para uma abordagem integral das necessidades da famÃ­lia."
    },
    {
        question: "Na avaliaÃ§Ã£o multidimensional da pessoa idosa (AMPI), qual das seguintes opÃ§Ãµes NÃƒO Ã© uma das dimensÃµes principais a serem avaliadas?",
        options: [
            "Capacidade funcional (atividades de vida diÃ¡ria).",
            "CondiÃ§Ã£o clÃ­nica e comorbidades.",
            "SituaÃ§Ã£o socioeconÃ´mica e rede de apoio.",
            "Estado cognitivo e humor.",
            "Produtividade no mercado de trabalho."
        ],
        correctAnswer: "Produtividade no mercado de trabalho.",
        explanation: "A AMPI busca uma avaliaÃ§Ã£o global da saÃºde do idoso, abrangendo as dimensÃµes clÃ­nica, funcional (autonomia e independÃªncia), cognitiva, de humor e o contexto sociofamiliar. A produtividade no trabalho nÃ£o Ã© um domÃ­nio central desta avaliaÃ§Ã£o."
    },
    {
        question: "Uma mulher trans procura a UBS e relata ter sido mal atendida em outros serviÃ§os de saÃºde, que se recusaram a usar seu nome social. Qual princÃ­pio do SUS Ã© diretamente violado por esta atitude?",
        options: [
            "DescentralizaÃ§Ã£o.",
            "ParticipaÃ§Ã£o social.",
            "Universalidade.",
            "Equidade.",
            "HierarquizaÃ§Ã£o."
        ],
        correctAnswer: "Equidade.",
        explanation: "Equidade em saÃºde significa tratar desigualmente os desiguais, na medida de suas desigualdades. A populaÃ§Ã£o LGBTQIA+ Ã© historicamente vulnerabilizada no acesso Ã  saÃºde. Garantir um atendimento respeitoso, que reconheÃ§a sua identidade de gÃªnero (como o uso do nome social), Ã© uma prÃ¡tica de equidade fundamental para garantir o acesso e a integralidade do cuidado."
    },
    {
        question: "Um mÃ©dico, ao atender um paciente assintomÃ¡tico, solicita uma bateria de exames de rastreamento nÃ£o recomendados para a faixa etÃ¡ria e perfil de risco do paciente, o que leva a um achado incidental, mais exames invasivos e ansiedade, sem benefÃ­cio clÃ­nico comprovado. Esta prÃ¡tica Ã© um exemplo do que a prevenÃ§Ã£o quaternÃ¡ria busca evitar?",
        options: [
            "PrevenÃ§Ã£o de doenÃ§as infecciosas.",
            "DiagnÃ³stico tardio de doenÃ§as crÃ´nicas.",
            "Iatrogenia e medicalizaÃ§Ã£o excessiva.",
            "Falta de acesso a exames.",
            "Erro de medicaÃ§Ã£o."
        ],
        correctAnswer: "Iatrogenia e medicalizaÃ§Ã£o excessiva.",
        explanation: "A prevenÃ§Ã£o quaternÃ¡ria visa evitar ou reduzir os danos causados por intervenÃ§Ãµes mÃ©dicas desnecessÃ¡rias ou excessivas (iatrogenia). Isso inclui o sobrediagnÃ³stico (diagnÃ³stico de 'doenÃ§as' que nÃ£o trariam sintomas ou danos) e o sobretratamento, protegendo os pacientes da medicalizaÃ§Ã£o da vida."
    },
    {
        question: "Qual Ã© a principal recomendaÃ§Ã£o para a introduÃ§Ã£o alimentar complementar de um lactente em aleitamento materno exclusivo, a partir dos 6 meses?",
        options: [
            "Iniciar com sucos de frutas e papinhas de legumes peneiradas.",
            "Oferecer os alimentos amassados, dos diferentes grupos alimentares (cereais, leguminosas, carnes, legumes), mantendo o aleitamento materno sob livre demanda.",
            "Substituir uma mamada por uma refeiÃ§Ã£o completa de sopa.",
            "Introduzir um alimento novo a cada 15 dias para testar alergias.",
            "Oferecer apenas frutas e vegetais atÃ© 1 ano de idade."
        ],
        correctAnswer: "Oferecer os alimentos amassados, dos diferentes grupos alimentares (cereais, leguminosas, carnes, legumes), mantendo o aleitamento materno sob livre demanda.",
        explanation: "O Guia Alimentar para CrianÃ§as Brasileiras Menores de 2 Anos recomenda que a partir dos 6 meses, a crianÃ§a receba alimentos de todos os grupos, em consistÃªncia de papa ou amassados (nÃ£o liquidificados nem peneirados), e que o leite materno continue sendo oferecido em livre demanda, pois ainda Ã© a principal fonte de nutrientes."
    },
    {
        question: "Um paciente de 50 anos, etilista pesado, Ã© questionado pelo mÃ©dico: 'VocÃª jÃ¡ sentiu que deveria diminuir (Cut down) a bebida?', 'As pessoas jÃ¡ o criticaram (Annoyed) por beber?', 'VocÃª jÃ¡ se sentiu culpado (Guilty) por beber?', 'VocÃª jÃ¡ bebeu pela manhÃ£ para 'abrir os olhos' (Eye-opener)?'. Que ferramenta de rastreio estÃ¡ sendo utilizada?",
        options: [
            "Escala de Hamilton.",
            "QuestionÃ¡rio CAGE.",
            "InventÃ¡rio de DepressÃ£o de Beck.",
            "Miniexame do Estado Mental.",
            "AUDIT."
        ],
        correctAnswer: "QuestionÃ¡rio CAGE.",
        explanation: "O CAGE Ã© um mnemÃ´nico para um questionÃ¡rio de quatro perguntas (Cut down, Annoyed, Guilty, Eye-opener) amplamente utilizado como uma ferramenta rÃ¡pida de rastreio para identificar o uso problemÃ¡tico de Ã¡lcool."
    }
  ],
  'Pediatria': [
    {
        question: "Lactente de 1 ano com febre alta (39-40Â°C) por 3 dias, que se mantÃ©m em bom estado geral. No quarto dia, a febre cessa subitamente e surge um exantema maculopapular rÃ³seo, nÃ£o pruriginoso, que se inicia no tronco e se espalha para o pescoÃ§o e membros. Qual Ã© a principal hipÃ³tese diagnÃ³stica?",
        options: ["Sarampo", "RubÃ©ola", "Eritema Infeccioso", "Exantema SÃºbito (RosÃ©ola Infantum)", "Escarlatina"],
        correctAnswer: "Exantema SÃºbito (RosÃ©ola Infantum)",
        explanation: "O quadro de febre alta por 3-4 dias seguida de seu desaparecimento em 'crise' e o aparecimento de um exantema maculopapular Ã© a apresentaÃ§Ã£o clÃ¡ssica do exantema sÃºbito, causado pelo herpesvÃ­rus humano tipo 6."
    },
    {
        question: "CrianÃ§a de 7 anos apresenta febre baixa, mal-estar e, apÃ³s alguns dias, um exantema vermelho intenso nas bochechas, com aspecto de 'face esbofeteada', poupando a regiÃ£o perioral. Posteriormente, surgem lesÃµes rendilhadas ou reticuladas no tronco e membros. Qual o agente etiolÃ³gico desta doenÃ§a?",
        options: ["VÃ­rus do Sarampo", "VÃ­rus da RubÃ©ola", "ParvovÃ­rus B19", "Streptococcus pyogenes", "VÃ­rus Varicela-ZÃ³ster"],
        correctAnswer: "ParvovÃ­rus B19",
        explanation: "O eritema infeccioso, ou 'quinta doenÃ§a', Ã© causado pelo ParvovÃ­rus B19. Sua manifestaÃ§Ã£o mais caracterÃ­stica Ã© o exantema facial em 'face esbofeteada', seguido pelo exantema reticulado no corpo."
    },
    {
        question: "Escolar de 8 anos com febre alta, faringite com exsudato purulento e dor de garganta. Ao exame, apresenta palidez perioral e um exantema micropapular difuso, que confere Ã  pele uma textura Ã¡spera ('pele em lixa'), mais intenso nas dobras (Sinal de Pastia). Qual o diagnÃ³stico?",
        options: ["Mononucleose Infecciosa", "Sarampo", "DoenÃ§a de Kawasaki", "Escarlatina", "Varicela"],
        correctAnswer: "Escarlatina",
        explanation: "A escarlatina Ã© causada por cepas do Streptococcus pyogenes produtoras de toxina eritrogÃªnica. A combinaÃ§Ã£o de faringite, febre e o exantema caracterÃ­stico em 'pele de lixa' com acentuaÃ§Ã£o nas dobras Ã© patognomÃ´nica da doenÃ§a."
    },
    {
        question: "Adolescente de 16 anos com febre, faringite, linfadenopatia cervical posterior e generalizada. Foi prescrito amoxicilina para uma suspeita de faringite bacteriana, e apÃ³s 2 dias, ele desenvolveu um exantema maculopapular pruriginoso por todo o corpo. O hemograma mostra linfocitose com atipia. Qual a hipÃ³tese mais provÃ¡vel?",
        options: ["Alergia Ã  penicilina", "Escarlatina", "Mononucleose Infecciosa", "InfecÃ§Ã£o aguda pelo HIV", "RubÃ©ola"],
        correctAnswer: "Mononucleose Infecciosa",
        explanation: "Este Ã© o quadro clÃ¡ssico da mononucleose infecciosa (causada pelo vÃ­rus Epstein-Barr). O uso de aminopenicilinas (amoxicilina) em pacientes com mononucleose desencadeia um rash cutÃ¢neo caracterÃ­stico em mais de 90% dos casos, que nÃ£o representa uma alergia verdadeira."
    },
    {
        question: "CrianÃ§a nÃ£o vacinada de 3 anos Ã© levada Ã  consulta com febre, tosse intensa, coriza e conjuntivite hÃ¡ 4 dias. No exame da cavidade oral, sÃ£o observados pequenos pontos branco-azulados na mucosa jugal, na altura dos molares. Qual o nome desses sinais e qual doenÃ§a eles indicam?",
        options: ["Manchas de Forchheimer; RubÃ©ola", "Sinal de Pastia; Escarlatina", "Manchas de Koplik; Sarampo", "VesÃ­culas herpÃ©ticas; Gengivoestomatite", "PetÃ©quias em palato; Mononucleose"],
        correctAnswer: "Manchas de Koplik; Sarampo",
        explanation: "As manchas de Koplik sÃ£o patognomÃ´nicas do sarampo e surgem no perÃ­odo prodrÃ´mico, 1 a 2 dias antes do exantema. A presenÃ§a da trÃ­ade tosse, coriza e conjuntivite ('as 3 C') tambÃ©m Ã© altamente sugestiva."
    },
    {
        question: "PrÃ©-escolar de 4 anos apresenta febre e um exantema pruriginoso que evolui rapidamente. Ao exame, observam-se lesÃµes em diferentes estÃ¡gios de evoluÃ§Ã£o simultaneamente (mÃ¡culas, pÃ¡pulas, vesÃ­culas e crostas) distribuÃ­das por todo o corpo, incluindo couro cabeludo. Qual o diagnÃ³stico?",
        options: ["Impetigo", "Escabiose", "Varicela (Catapora)", "Molusco Contagioso", "DoenÃ§a MÃ£o-PÃ©-Boca"],
        correctAnswer: "Varicela (Catapora)",
        explanation: "O polimorfismo regional, ou seja, a presenÃ§a de lesÃµes em vÃ¡rios estÃ¡gios (pÃ¡pula -> vesÃ­cula -> pÃºstula -> crosta) na mesma Ã¡rea do corpo ao mesmo tempo, Ã© a caracterÃ­stica mais marcante da varicela."
    },
    {
        question: "Lactente de 11 meses Ã© internado com febre alta persistente hÃ¡ 6 dias, que nÃ£o responde a antitÃ©rmicos. Apresenta conjuntivite bilateral nÃ£o exsudativa, lÃ¡bios vermelhos e fissurados ('lÃ­ngua em framboesa'), exantema polimorfo em tronco e edema endurecido de mÃ£os e pÃ©s. Qual a principal complicaÃ§Ã£o a ser investigada?",
        options: ["Meningite assÃ©ptica", "Artrite sÃ©ptica", "Glomerulonefrite", "Aneurismas de artÃ©rias coronÃ¡rias", "Miocardite"],
        correctAnswer: "Aneurismas de artÃ©rias coronÃ¡rias",
        explanation: "O quadro clÃ­nico preenche os critÃ©rios para a DoenÃ§a de Kawasaki, uma vasculite sistÃªmica da infÃ¢ncia. A complicaÃ§Ã£o mais temida Ã© o acometimento das artÃ©rias coronÃ¡rias, com formaÃ§Ã£o de aneurismas, que deve ser ativamente investigado com ecocardiograma."
    },
    {
        question: "Lactente de 6 meses, previamente hÃ­gido, apresenta quadro de tosse seca, taquipneia, sibilÃ¢ncia e tiragem intercostal e subcostal. A mÃ£e refere que o quadro iniciou com coriza e febre baixa. Estamos em perÃ­odo de alta circulaÃ§Ã£o do VÃ­rus Sincicial RespiratÃ³rio (VSR). Qual o diagnÃ³stico mais provÃ¡vel?",
        options: ["Crise asmÃ¡tica", "Pneumonia bacteriana", "Laringite estridulosa", "Bronquiolite Viral Aguda (BVA)", "Coqueluche"],
        correctAnswer: "Bronquiolite Viral Aguda (BVA)",
        explanation: "A BVA Ã© o primeiro episÃ³dio de sibilÃ¢ncia em um lactente menor de 2 anos, geralmente causada pelo VSR. Caracteriza-se por um prÃ³dromo de infecÃ§Ã£o de via aÃ©rea superior seguido de sinais de obstruÃ§Ã£o de pequenas vias aÃ©reas (sibilÃ¢ncia, taquipneia, tiragem)."
    },
    {
        question: "CrianÃ§a de 2 anos, previamente saudÃ¡vel, apresenta engasgo sÃºbito enquanto comia amendoim, seguido por um acesso de tosse e dispneia. Na ausculta pulmonar, hÃ¡ diminuiÃ§Ã£o do murmÃºrio vesicular e sibilÃ¢ncia unilateral Ã  direita. Qual a principal hipÃ³tese diagnÃ³stica?",
        options: ["PneumotÃ³rax espontÃ¢neo", "Crise de asma", "Anafilaxia", "AspiraÃ§Ã£o de corpo estranho", "Pneumonia de aspiraÃ§Ã£o"],
        correctAnswer: "AspiraÃ§Ã£o de corpo estranho",
        explanation: "A histÃ³ria de engasgo sÃºbito associada a sinais respiratÃ³rios de inÃ­cio abrupto e achados assimÃ©tricos no exame pulmonar (hipofonese ou sibilÃ¢ncia unilateral) Ã© altamente sugestiva de aspiraÃ§Ã£o de corpo estranho para a via aÃ©rea, mais comumente para o brÃ´nquio fonte direito."
    },
    {
        question: "Lactente de 2 meses, nascido a termo, apresenta vÃ´mitos em jato, nÃ£o biliosos, que ocorrem logo apÃ³s as mamadas. A crianÃ§a mostra-se sempre faminta ('Ã¡vida'). Ao exame, Ã© possÃ­vel palpar uma 'oliva' no quadrante superior direito do abdome. Qual o diagnÃ³stico mais provÃ¡vel?",
        options: ["DoenÃ§a do Refluxo GastroesofÃ¡gico", "Atresia de duodeno", "Estenose HipertrÃ³fica de Piloro", "Alergia Ã  proteÃ­na do leite de vaca", "Gastroenterite"],
        correctAnswer: "Estenose HipertrÃ³fica de Piloro",
        explanation: "A estenose hipertrÃ³fica de piloro Ã© uma condiÃ§Ã£o que classicamente se manifesta entre a 3Âª e a 6Âª semana de vida com vÃ´mitos em jato, nÃ£o biliosos e progressivos, em um lactente que se mantÃ©m faminto. A palpaÃ§Ã£o da 'oliva pilÃ³rica' Ã© um achado patognomÃ´nico."
    },
    {
        question: "RecÃ©m-nascido com 36 horas de vida, cuja mÃ£e tem tipo sanguÃ­neo 'O+' e ele 'A+', desenvolve icterÃ­cia zona II de Kramer. A bilirrubina total Ã© de 12 mg/dL, com predomÃ­nio de bilirrubina indireta. Qual Ã© a causa mais provÃ¡vel desta icterÃ­cia precoce?",
        options: ["IcterÃ­cia fisiolÃ³gica", "IcterÃ­cia do leite materno", "Atresia de vias biliares", "DoenÃ§a hemolÃ­tica por incompatibilidade ABO", "DeficiÃªncia de G6PD"],
        correctAnswer: "DoenÃ§a hemolÃ­tica por incompatibilidade ABO",
        explanation: "A icterÃ­cia que surge nas primeiras 24-36 horas de vida Ã© sempre patolÃ³gica. A incompatibilidade ABO (mÃ£e O, RN A ou B) Ã© a causa mais comum de doenÃ§a hemolÃ­tica do recÃ©m-nascido, levando a uma produÃ§Ã£o aumentada de bilirrubina e icterÃ­cia precoce."
    },
    {
        question: "CrianÃ§a de 2 anos Ã© trazida Ã  emergÃªncia apÃ³s um episÃ³dio de diarreia sanguinolenta. Evolui com palidez intensa, oligÃºria e petÃ©quias. Exames laboratoriais revelam anemia hemolÃ­tica microangiopÃ¡tica, plaquetopenia e insuficiÃªncia renal aguda. Qual a principal hipÃ³tese diagnÃ³stica?",
        options: ["PÃºrpura TrombocitopÃªnica IdiopÃ¡tica (PTI)", "Leucemia Linfoide Aguda (LLA)", "SÃ­ndrome HemolÃ­tico-UrÃªmica (SHU)", "Glomerulonefrite PÃ³s-EstreptocÃ³cica (GNPE)", "Sepse por meningococo"],
        correctAnswer: "SÃ­ndrome HemolÃ­tico-UrÃªmica (SHU)",
        explanation: "A SHU Ã© caracterizada pela trÃ­ade de anemia hemolÃ­tica microangiopÃ¡tica, trombocitopenia e lesÃ£o renal aguda. A forma tÃ­pica (90% dos casos) Ã© precedida por uma gastroenterite por E. coli produtora de toxina Shiga."
    },
    {
        question: "PrÃ©-escolar de 3 anos apresenta edema periorbital matutino que progride para anasarca. A urina de 24 horas revela proteinÃºria de 4 g (ou > 50 mg/kg/dia). Exames de sangue mostram hipoalbuminemia e hiperlipidemia. Qual Ã© a principal hipÃ³tese diagnÃ³stica?",
        options: ["SÃ­ndrome NefrÃ­tica Aguda", "SÃ­ndrome HemolÃ­tico-UrÃªmica", "SÃ­ndrome NefrÃ³tica", "InfecÃ§Ã£o do Trato UrinÃ¡rio", "InsuficiÃªncia CardÃ­aca"],
        correctAnswer: "SÃ­ndrome NefrÃ³tica",
        explanation: "A sÃ­ndrome nefrÃ³tica Ã© definida pela presenÃ§a de proteinÃºria maciÃ§a (em nÃ­veis nefrÃ³ticos), hipoalbuminemia, edema e hiperlipidemia. Em crianÃ§as, a causa mais comum Ã© a DoenÃ§a de LesÃµes MÃ­nimas."
    },
    {
        question: "Escolar de 9 anos desenvolve edema, hipertensÃ£o arterial e urina escura (cor de 'coca-cola') duas semanas apÃ³s um episÃ³dio de piodermite (impetigo). Os exames mostram hematÃºria e consumo do complemento sÃ©rico (C3 baixo). Qual o diagnÃ³stico?",
        options: ["Nefropatia por IgA", "SÃ­ndrome NefrÃ³tica", "Glomerulonefrite PÃ³s-EstreptocÃ³cica (GNPE)", "Pielonefrite aguda", "SÃ­ndrome de Alport"],
        correctAnswer: "Glomerulonefrite PÃ³s-EstreptocÃ³cica (GNPE)",
        explanation: "A GNPE Ã© a principal causa de sÃ­ndrome nefrÃ­tica na infÃ¢ncia. Caracteriza-se por um perÃ­odo de latÃªncia apÃ³s uma infecÃ§Ã£o de pele ou garganta por cepas nefritogÃªnicas do estreptococo, seguido pelo surgimento de hematÃºria, edema, hipertensÃ£o e consumo do complemento."
    },
    {
        question: "Menina de 7 anos Ã© trazida para avaliaÃ§Ã£o por aparecimento de broto mamÃ¡rio (telarca) e pelos pubianos. A idade Ã³ssea Ã© de 9 anos. A ressonÃ¢ncia de crÃ¢nio Ã© normal. Qual o diagnÃ³stico e o tratamento de escolha?",
        options: ["Telarca precoce isolada; observaÃ§Ã£o", "Puberdade Precoce Central; anÃ¡logo de GnRH", "Puberdade Precoce PerifÃ©rica; investigaÃ§Ã£o da causa adrenal/ovariana", "Adrenarca precoce; acompanhamento", "Desenvolvimento normal para a idade"],
        correctAnswer: "Puberdade Precoce Central; anÃ¡logo de GnRH",
        explanation: "O surgimento de caracteres sexuais secundÃ¡rios antes dos 8 anos em meninas, com avanÃ§o da idade Ã³ssea, caracteriza a puberdade precoce. Se a causa for a ativaÃ§Ã£o prematura do eixo hipotÃ¡lamo-hipÃ³fise-gonadal (central), o tratamento com anÃ¡logos de GnRH Ã© indicado para frear a progressÃ£o e preservar o potencial de estatura final."
    }
  ],
  'Ginecologia e ObstetrÃ­cia': [
    {
        question: "Mulher de 25 anos, sexualmente ativa, queixa-se de corrimento vaginal acinzentado, com odor fÃ©tido que piora apÃ³s a relaÃ§Ã£o sexual. O exame especular mostra ausÃªncia de inflamaÃ§Ã£o. O teste do pH vaginal Ã© > 4,5 e o teste das aminas (Whiff test) Ã© positivo. Qual Ã© o diagnÃ³stico mais provÃ¡vel?",
        options: ["CandidÃ­ase vulvovaginal", "TricomonÃ­ase", "Vaginose bacteriana", "Cervicite por clamÃ­dia", "Vaginite atrÃ³fica"],
        correctAnswer: "Vaginose bacteriana",
        explanation: "O quadro clÃ­nico e os achados laboratoriais (pH > 4,5, teste das aminas positivo, corrimento acinzentado e odor de peixe) preenchem os critÃ©rios de Amsel para o diagnÃ³stico de vaginose bacteriana, um desequilÃ­brio da flora vaginal."
    },
    {
        question: "Gestante de 32 semanas chega Ã  maternidade com queixa de cefaleia, visÃ£o turva e dor epigÃ¡strica. A pressÃ£o arterial aferida Ã© de 160/110 mmHg. Exames laboratoriais mostram proteinÃºria de 3+ em fita. Qual Ã© a principal hipÃ³tese diagnÃ³stica?",
        options: ["HipertensÃ£o gestacional", "PrÃ©-eclÃ¢mpsia leve", "PrÃ©-eclÃ¢mpsia com sinais de gravidade", "EclÃ¢mpsia", "SÃ­ndrome HELLP"],
        correctAnswer: "PrÃ©-eclÃ¢mpsia com sinais de gravidade",
        explanation: "A presenÃ§a de hipertensÃ£o (PA - 160/110 mmHg) e proteinÃºria apÃ³s 20 semanas de gestaÃ§Ã£o, associada a sinais de gravidade como sintomas neurolÃ³gicos (cefaleia, escotomas) e dor epigÃ¡strica, caracteriza a prÃ©-eclÃ¢mpsia com sinais de gravidade."
    },
    {
        question: "Mulher de 60 anos, na pÃ³s-menopausa, apresenta sangramento vaginal hÃ¡ 2 semanas. Qual Ã© o primeiro passo na investigaÃ§Ã£o diagnÃ³stica para descartar a principal hipÃ³tese de malignidade?",
        options: ["Realizar colposcopia", "Solicitar dosagem de CA-125", "Realizar ultrassonografia transvaginal para avaliar a espessura endometrial", "Fazer um exame citopatolÃ³gico (Papanicolau)", "Iniciar terapia de reposiÃ§Ã£o hormonal"],
        correctAnswer: "Realizar ultrassonografia transvaginal para avaliar a espessura endometrial",
        explanation: "Sangramento na pÃ³s-menopausa Ã© considerado cÃ¢ncer de endomÃ©trio atÃ© prova em contrÃ¡rio. O primeiro passo investigativo Ã© a ultrassonografia transvaginal. Um endomÃ©trio fino (- 4-5 mm) tem alto valor preditivo negativo, enquanto um endomÃ©trio espessado indica a necessidade de biÃ³psia."
    },
    {
        question: "Paciente de 30 anos com dismenorreia progressiva, dispareunia de profundidade e infertilidade. A ultrassonografia transvaginal com preparo intestinal revela um nÃ³dulo hipoecoico e espiculado no ligamento Ãºtero-sacro. Qual Ã© o diagnÃ³stico mais provÃ¡vel?",
        options: ["Miomatose uterina", "DoenÃ§a inflamatÃ³ria pÃ©lvica", "Endometriose profunda", "SÃ­ndrome dos ovÃ¡rios policÃ­sticos", "Adenomiose"],
        correctAnswer: "Endometriose profunda",
        explanation: "A trÃ­ade de dismenorreia, dispareunia de profundidade e infertilidade Ã© altamente sugestiva de endometriose. A identificaÃ§Ã£o de um nÃ³dulo em localizaÃ§Ã£o tÃ­pica (como ligamentos Ãºtero-sacros) na imagem confirma a suspeita de endometriose profunda."
    },
    {
        question: "O resultado do exame citopatolÃ³gico (Papanicolau) de uma mulher de 28 anos revela uma LesÃ£o Intraepitelial de Alto Grau (HSIL/NIC II). Qual Ã© a conduta recomendada?",
        options: ["Repetir a citologia em 6 meses", "Realizar teste de HPV", "Encaminhar para colposcopia com biÃ³psia", "Realizar conizaÃ§Ã£o do colo uterino", "Apenas observar"],
        correctAnswer: "Encaminhar para colposcopia com biÃ³psia",
        explanation: "Diante de um resultado de HSIL na citologia, a conduta imediata Ã© a realizaÃ§Ã£o de uma colposcopia. Este exame permite visualizar o colo uterino com magnificaÃ§Ã£o e, sob visÃ£o colposcÃ³pica, realizar biÃ³psias das Ã¡reas anormais para confirmaÃ§Ã£o histopatolÃ³gica."
    },
    {
        question: "Gestante de 38 semanas, G2P1 (1 cesÃ¡rea prÃ©via), chega ao pronto-socorro com queixa de sangramento vaginal sÃºbito, indolor e de cor vermelho vivo. Ao exame, o Ãºtero estÃ¡ relaxado e os batimentos cardÃ­acos fetais estÃ£o presentes e normais. Qual Ã© a principal hipÃ³tese diagnÃ³stica?",
        options: ["Descolamento prematuro de placenta (DPP)", "Placenta prÃ©via", "Rotura de vasa prÃ©via", "Rotura uterina", "InÃ­cio do trabalho de parto"],
        correctAnswer: "Placenta prÃ©via",
        explanation: "O sangramento no terceiro trimestre com as caracterÃ­sticas de ser sÃºbito, indolor, de sangue vermelho vivo e sem hipertonia uterina Ã© a apresentaÃ§Ã£o clÃ¡ssica da placenta prÃ©via. A cesÃ¡rea prÃ©via Ã© um fator de risco importante."
    },
    {
        question: "Qual o mecanismo de aÃ§Ã£o primÃ¡rio do DIU hormonal (com levonorgestrel) na contracepÃ§Ã£o?",
        options: ["Impede a nidaÃ§Ã£o por aÃ§Ã£o inflamatÃ³ria no endomÃ©trio", "- espermicida", "Espessamento do muco cervical, dificultando a ascensÃ£o dos espermatozoides, e atrofia endometrial", "Inibe a ovulaÃ§Ã£o na maioria dos ciclos", "Causa lise dos espermatozoides"],
        correctAnswer: "Espessamento do muco cervical, dificultando a ascensÃ£o dos espermatozoides, e atrofia endometrial",
        explanation: "O principal mecanismo de aÃ§Ã£o do DIU com levonorgestrel Ã© local: a progesterona liberada torna o muco cervical espesso e hostil aos espermatozoides, impedindo-os de chegar Ã  cavidade uterina. Secundariamente, causa atrofia endometrial e, em alguns casos, pode inibir a ovulaÃ§Ã£o."
    },
    {
        question: "Mulher de 28 anos com ciclos menstruais irregulares (a cada 40-60 dias), hirsutismo (aumento de pelos em Ã¡reas andrÃ³geno-dependentes) e acne. A ultrassonografia pÃ©lvica mostra ovÃ¡rios com mÃºltiplos pequenos cistos perifÃ©ricos. Qual Ã© o diagnÃ³stico mais provÃ¡vel?",
        options: ["Hipotireoidismo", "Hiperprolactinemia", "SÃ­ndrome dos OvÃ¡rios PolicÃ­sticos (SOP)", "FalÃªncia ovariana prematura", "Tumor ovariano produtor de androgÃªnios"],
        correctAnswer: "SÃ­ndrome dos OvÃ¡rios PolicÃ­sticos (SOP)",
        explanation: "Pelos CritÃ©rios de Rotterdam, o diagnÃ³stico de SOP Ã© feito na presenÃ§a de pelo menos dois dos seguintes: 1) oligo ou anovulaÃ§Ã£o (ciclos irregulares), 2) sinais clÃ­nicos ou bioquÃ­micos de hiperandrogenismo (hirsutismo, acne), e 3) morfologia de ovÃ¡rios policÃ­sticos na ultrassonografia. A paciente preenche os trÃªs critÃ©rios."
    }
  ]
};







