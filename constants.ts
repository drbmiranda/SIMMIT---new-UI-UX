
import { MedicalSubject, MultipleChoiceQuestion } from './types';

export const APP_TITLE = "SIMMIT AI QUEST";

export const MEDICAL_SUBJECTS: MedicalSubject[] = [
  'Clínica Médica',
  'Clínica Cirúrgica',
  'Medicina Preventiva',
  'Pediatria',
  'Ginecologia e Obstetrícia',
];

export const SIMMIT_COMMANDS = {
  examGeneral: 'SIMMIT ESTADO GERAL',
  examVitals: 'SIMMIT SINAIS VITAIS',
  examInspection: 'SIMMIT INSPE-fO',
  examPalpation: 'SIMMIT PALPA-fO',
  examPercussion: 'SIMMIT PERCUSSfO',
  examAuscultation: 'SIMMIT AUSCULTA',
  examPhysical: 'SIMMIT EXAME FÍSICO',
  labResults: 'SIMMIT RESULTADOS DE EXAMES LABORATORIAIS',
  imageResults: 'SIMMIT RESULTADOS DE EXAMES DE IMAGEM',
  closeCase: 'SIMMIT ENCERRAR CASO',
} as const;

// Usado pelo fluxo do aluno para obter os critérios de avaliação para o feedback.
// Usado para gerar casos OSCE em JSON.
export const SYSTEM_INSTRUCTION_TEACHER_JSON = `Você é um gerador de estações de simulação médica para Exames Clínicos Objetivos Estraturados (OSCE).
Sua única função é criar cenários clínicos dentro de uma especialidade específica e retornar como um objeto JSON.

**REGRAS ESTRITAS:**
1.  **NfO** escreva nenhum texto antes ou depois do objeto JSON. Sua resposta deve ser **APENAS** o JSON.
2.  O JSON deve seguir exatamente esta estrutura:
    {
      "cenarioDoAluno": "Descrição concisa da situação, queixa principal e sinais vitais.",
      "tarefasDoAluno": ["Array de strings com as tarefas do aluno, como 'Realizar anamnese focada.'"],
      "instrucoesDoPaciente": "Descrição detalhada para o paciente simulado (IA), incluindo personalidade, histórico e respostas.",
      "criteriosDeAvaliacao": ["Array de strings com o checklist de avaliação, como 'Apresentou-se adequadamente?'"]
    }
3.  Ao receber uma solicitação de modificação (ex: "mude a idade para 75 anos"), gere um **NOVO** objeto JSON completo com a modificação incorporada.

Gere o primeiro caso quando solicitado.`;


export const SYSTEM_INSTRUCTION_STUDENT = `Você é uma IA de simulação médica atuando como um Paciente Simulado (PS) em um cenário OSCE gamificado.

**REGRAS ESTRITAS:**
1.  **PERSONA DO PACIENTE:** Você **NfO DEVE** inventar um caso clínico. Você receberá instruções detalhadas sobre a sua persona, histórico e como deve responder, além do checklist de avaliação. Siga essas instruções **ESTRITAMENTE**. Sua primeira tarefa é aguardar essas instruções para se preparar.
2.  **NUNCA SAIR DO PERSONAGEM:** Você é SEMPRE o paciente. Não assuma papel de médico, professor, tutor ou avaliador fora das tags de pontuação. Se o aluno pedir diagnóstico, conduta, explicações técnicas ou "a resposta", diga que não sabe e que isso deve ser decidido pelo médico/aluno.
3.  **INTERA-fO REALISTA:** Após receber as instruções, atue como o paciente. Responda às perguntas e ações do aluno de forma realista. Não forneça informações não solicitadas.
4.  **GAMIFICA-fO E PONTUA-fO:**
    - Para **CADA** resposta que você der, avalie a última ação do aluno com base no checklist de avaliação que você recebeu.
    - Anexe uma tag de pontuação **OBRIGAT"RIA** ao final de sua resposta. A tag deve ter o formato: \`[PONTUACAO: <pontos>, <justificativa>]\`.
    - **<pontos>**: Um número. Use valores positivos para ações corretas (ex: +10 para uma pergunta chave), negativos para erros ou omissões (ex: -5 para uma manobra errada), e 0 para ações neutras ou conversas.
    - **<justificativa>**: Uma frase curta e clara explicando o porquê da pontuação (ex: "Perguntou sobre histórico familiar", "Não checou os pulsos").
    - **Exemplo de Resposta:** "Sim, doutor, a dor começou há dois dias. - uma dor forte no peito. [PONTUACAO: +10, Caracterizou a dor corretamente]"
5.  **Resultados de Exames:** Quando o aluno solicitar um exame, responda como o paciente consentindo (ex: 'Claro, doutor.'). IMEDIATAMENTE AP"S, anexe o resultado na tag: \`[RESULTADO_EXAME: <descrição detalhada do resultado>]\`.
6.  **Fim do Caso:** Quando o aluno concluir as tarefas principais ou digitar "SIMMIT ENCERRAR CASO", declare o fim da simulação com a frase: "O caso está concluído."`;

export const FEEDBACK_PROMPT_TEMPLATE = (chatHistory: string, osceCriteria: string) => `
Você é um preceptor de medicina avaliando um aluno em uma simulação OSCE.

**Tarefa:**
Com base no **CHECKLIST DE AVALIA-fO OSCE** e na **TRANSCRI-fO DA SIMULA-fO** fornecidos abaixo, forneça uma avaliação de desempenho.

**CHECKLIST DE AVALIA-fO OSCE:**
${osceCriteria}

**TRANSCRI-fO DA SIMULA-fO:**
${chatHistory}

**Formato da Resposta:**
Responda **APENAS** com um objeto JSON válido, sem nenhum outro texto antes ou depois. O JSON deve ter a seguinte estrutura:
{
  "feedback": "Escreva aqui uma análise detalhada e construtiva. Comece com os pontos fortes e depois aponte as áreas para melhoria, citando exemplos da transcrição."
}
`;

export const INITIAL_PLAYER_MESSAGE = "Iniciar novo caso.";
export const IMAGE_PROMPT_REGEX = /\[IMAGE_PROMPT:\s*(.*?)\s*\]/i;
export const EXAM_RESULT_REGEX = /\[RESULTADO_EXAME:\s*([\s\S]*?)\s*\]/i;
// Corrected regex to handle positive signs (+) and added 'g' flag
export const SCORE_CHANGE_REGEX = /\[PONTUACAO:\s*([+-]?\d+),\s*([^\]]+)\]/gi;
export const CASE_FINISHED_REGEX = /O caso está concluído/i;
export const OSCE_CRITERIA_REGEX = /###\s*\[CRIT[^\]]*CHECKLIST\]\s*([\s\S]*)/i;
export const STUDENT_SCENARIO_REGEX = /###\s*\[CEN[^\]]*ALUNO\]\s*([\s\S]*?)(?=###|$)/i;
export const PATIENT_INSTRUCTIONS_REGEX = /###\s*\[INSTR[^\]]*PACIENTE SIMULADO\]\s*([\s\S]*?)(?=###|$)/i;

export const CLINICA_MEDICA_CASE_TITLES = [
  "Febre, rigidez de nuca e rebaixamento do nível de consciência em adulto jovem",
  "Idoso com confusão mental e febre sem sinais meníngeos evidentes",
  "Homem imunossuprimido com cefaleia persistente e líquor turvo",
  "Paciente HIV+ com sinais neurológicos focais e lesão ocupante de espaço",
  "Adolescente com meningite bacteriana confirmada por punção lombar",
  "Mulher com lesão cutânea herpética e sintomas neurológicos agudos",
  "Homem de 40 anos com febre, convulsão e imagem com edema temporal",
  "Paciente com febre prolongada e dor lombar - suspeita de abscesso epidural",
  "Meningite por criptococo em paciente com Aids avançada",
  "Jovem com meningite viral leve e contato recente com quadro gripal",
  "Meningite por Listeria em idoso com comorbidades",
  "Tuberculose meníngea em paciente de área endêmica",
  "Jovem com febre e déficit motor súbito - suspeita de encefalite autoimune",
  "Episódios convulsivos e delírio em paciente com herpes simples tipo 1",
  "Paciente alcoólatra com infecção de SNC e abscesso cerebral",
  "Meningoencefalite em paciente com histórico de camping e exposição a carrapato",
  "Mulher jovem com cefaleia pulsátil unilateral associada a náuseas",
  "Homem com cefaleia súbita e intensa - pior dor da vida",
  "Idosa com cefaleia crônica e alteração visual - suspeita de arterite temporal",
  "Estudante com cefaleia tensional recorrente em períodos de estresse",
  "Homem com cefaleia e ptose palpebral - investigar lesão expansiva",
  "Paciente com cefaleia matinal e vômitos - hipertensão intracraniana?",
  "Mulher com histórico de enxaqueca que apresenta padrão de dor novo",
  "Cefaleia em salvas em jovem fumante - dor orbitária intensa",
  "Cefaleia em paciente HIV+ com sinais meníngeos",
  "Cefaleia refrátária em paciente com hipertensão arterial descontrolada",
  "Paciente com sinusite frontal e cefaleia frontal progressiva",
  "Cefaleia após punção lombar - hipotensão liquórica",
  "Cefaleia súbita após esforço físico intenso - suspeita de dissecção arterial",
  "Idoso com febre, tosse produtiva e infiltrado em lobo inferior",
  "Paciente com dispneia súbita e dor pleurítica - pneumonia ou TEP?",
  "Homem tabagista com febre e consolidação lobar no raio-X",
  "Mulher com pneumonia e confusão mental - CURB-65 elevado",
  "Jovem com quadro gripal e evolução para pneumonia bacteriana",
  "Paciente com comorbidades e pneumonia com derrame pleural",
  "Paciente internado com piora clínica após antibioticoterapia inicial",
  "Mulher com pneumonia de repetição - investigar imunodeficiência",
  "Homem em situação de rua com pneumonia por Klebsiella pneumoniae",
  "Ferimento com objeto contaminado - indicação de imunoglobulina para tétano?",
  "Acidente com material pérfuro-cortante - esquema para HIV e HBV",
  "Exposição ocupacional a paciente com tuberculose bacilífera",
  "Profissional de saúde com contato ocular com secreções - conduta imediata",
  "Homem agredido por animal não vacinado - protocolo antirrábico",
  "Mulher vítima de violência sexual - imunizações e profilaxias indicadas",
  "Paciente com contato íntimo recente com caso confirmado de hepatite A",
  "Acidente com agulha em paciente HBsAg+ - esquema vacinal incompleto",
  "Pessoa que sofreu mordida humana profunda - cobertura antibiótica e vacinação",
  "Febre, dor e edema em joelho direito de início súbito",
  "Homem com gota prévia e nova dor articular - diferencial com artrite séptica",
  "Paciente imunossuprimido com monoartrite dolorosa e sinais inflamatórios",
  "Mulher com prótese de quadril e febre - infecção articular protética",
  "Artrite séptica em usuário de drogas injetáveis com febre alta",
  "Dor articular e sinais flogísticos após procedimento ortopédico recente",
  "Artrite séptica poliarticular em paciente com lúpus",
  "Paciente idoso com dor em ombro, febre e rigidez - sepse articular atípica",
  "Jovem com artrite séptica gonocócica confirmada",
  "Homem inconsciente após ingestão de benzodiazepínico",
  "Adolescente com intoxicação alcoólica aguda e hipoglicemia",
  "Ingestão acidental de paracetamol em dose tóxica",
  "Intoxicação por organofosforado em trabalhador rural",
  "Idoso com intoxicação digitálica - bradicardia e náuseas",
  "Tentativa de suicídio com antidepressivos tricíclicos - sinais de cardiotoxicidade",
  "Inalação de monóxido de carbono em ambiente fechado",
  "Mulher com uso excessivo de AINEs e insuficiência renal aguda",
  "Intoxicação por cocaína com dor torácica e arritmia",
  "Taquicardia supraventricular em paciente jovem com palpitações",
  "Fibrilação atrial em paciente com hipertireoidismo não tratado",
  "Flutter atrial em paciente com doença pulmonar crônica",
  "Taquicardia ventricular em paciente pós-infarto",
  "Paciente com síndrome de Wolff-Parkinson-White e pré-excitação",
  "Arritmia com instabilidade hemodinâmica em pronto-socorro",
  "Taquicardia sinusal persistente - avaliar causas secundárias",
  "Paciente com FA recém-diagnosticada e risco tromboembólico alto",
  "TV polimórfica associada a uso de medicamentos QT-prolongadores",
  "Paciente com infecção urinária complicada em uso de antibiótico oral",
  "Homem com pneumonia e falha ao tratamento inicial empírico",
  "Caso de celulite com expansão rápida e critérios de internação",
  "Infecção intra-abdominal pós-operatória - seleção de antibioticoterapia",
  "Uso racional de antibióticos em paciente com sepse urinária",
  "Homem com osteomielite crônica em reabilitação ortopédica",
  "Paciente alérgico à penicilina com infecção estreptocócica",
  "Mulher com pielonefrite e bacteremia - esquema antibiótico adequado",
  "Paciente com infecção hospitalar por bactéria multirresistente",
  "Déficit motor súbito em hemicorpo direito e disartria",
  "Idoso com AVE isquêmico agudo e janela para trombólise",
  "AVE hemorrágico em paciente com hipertensão não controlada",
  "Paciente jovem com AVE e investigação de trombofilia",
  "Mulher com AVC isquêmico após uso de contraceptivo hormonal",
  "Paciente com episódio isquêmico transitório (AIT) e fatores de risco cardiovascular",
  "Rebaixamento súbito do nível de consciência em paciente com anticoagulação",
  "Paciente com AVE em território vertebrobasilar e ataxia",
  "Sequela motora após AVC - encaminhamento para reabilitação precoce",
  "Bradicardia sinusal assintomática em atleta de alta performance",
  "Bloqueio atrioventricular de 2º grau sintomático",
  "Bradicardia extrema em paciente idoso com síncope",
  "Uso de betabloqueador em paciente com bradicardia e hipotensão",
  "Paciente com marca-passo e episódios de tontura",
  "Bloqueio cardíaco completo em paciente com lúpus",
];

export const PEDIATRIA_CASE_TITLES = [
  "Recém-nascido com icterícia prolongada em aleitamento exclusivo",
  "Mãe com mastite puerperal e dúvidas sobre manter a amamentação",
  "Lactente com perda de peso nas primeiras semanas de vida",
  "Dor e fissuras mamilares em mãe primípara durante as mamadas",
  "Aleitamento materno exclusivo e evacuações explosivas: normalidade ou alergia?",
  "Lactente de 2 meses com esquema vacinal atrasado",
  "Escolar com histórico de contato com sarampo e vacinação incompleta",
  "Febre alta e dor no local após aplicação da DTP",
  "Adolescente com esquema vacinal incompleto para hepatite B",
  "Reação alérgica cutânea após aplicação de tríplice viral",
  "Mãe com dúvidas sobre segurança da vacina contra HPV",
  "Escolar sem reforço de tétano após corte com objeto enferrujado",
  "Lactente prematuro e dúvidas sobre calendário vacinal",
  "Migrante venezuelano sem registro vacinal",
  "Lactente HIV positivo e esquema vacinal adaptado",
  "Criança com convulsão febril após vacina",
  "Adolescente com recusa familiar à vacinação contra COVID-19",
  "Recém-nascido filho de mãe HBsAg positiva - conduta ao nascimento",
  "População ribeirinha com baixa cobertura vacinal",
  "Escolar com varicela leve após contato vacinal recente",
  "Reforço da vacina tríplice viral em adolescente com surto na escola",
  "Escolar com reações adversas após BCG - investigar complicações",
  "Pré-escolar com esquema vacinal irregular devido a pandemia",
  "Diarreia aguda com sinais de desidratação em lactente de 8 meses",
  "Vômitos incoercíveis e sonolência em criança de 3 anos",
  "Constipação intestinal crônica em pré-escolar",
  "Dor abdominal difusa e fezes mucossanguinolentas",
  "Escolar com diarreia crônica e baixo ganho ponderal",
  "Diarreia após uso de antibióticos - suspeita de colite",
  "Pré-escolar com vômitos após introdução alimentar",
  "Desidratação hipertônica em lactente com febre e diarreia",
  "Lactente com flatulência e distensão após fórmulas",
  "Adolescente com diarreia aquosa e histórico de viagem recente",
  "Recém-nascido com vômitos biliosos persistentes",
  "Lactente com episódios recorrentes de gastroenterite leve",
  "Lactente com coriza, febre e dificuldade para dormir",
  "Criança com otalgia e febre após resfriado",
  "Pré-escolar com amigdalite purulenta de repetição",
  "Adolescente com sinusite crônica e rinite alérgica",
  "Lactente com estridor e tosse metálica noturna",
  "Escolar com aumento de amígdalas e roncos noturnos",
  "Faringoamigdalite estreptocócica em criança com exantema",
  "Conjuntivite purulenta associada a sintomas respiratórios",
  "Escolar com adenomegalia e dor de garganta persistente",
  "Repetição de IVAS em criança frequentadora de creche",
  "Adolescente com rouquidão crônica e uso vocal excessivo",
  "Otite média com perfuração timpânica em lactente",
  "Abcesso peritonsilar em adolescente com halitose",
  "Bebê de 6 meses que não sustenta a cabeça",
  "Lactente de 9 meses que não senta sem apoio",
  "Pré-escolar com fala ausente e isolamento social",
  "Escolar com dificuldade de leitura e escrita",
  "Criança de 2 anos com regressão de habilidades motoras",
  "Lactente com assimetria de membros e tônus alterado",
  "Adolescente com baixo rendimento escolar e déficit de atenção",
  "Criança com sinais precoces de paralisia cerebral",
  "Bebê prematuro extremo com atraso na linguagem",
  "Pré-escolar com marcha em pontas dos pés e estereotipias",
  "Escolar com febre alta, conjuntivite e exantema maculopapular",
  "Pré-escolar com febre e lesões em mãos, pés e boca",
  "Adolescente não vacinado com erupções e linfadenopatia",
  "Escolar com exantema súbito após febre - roséola?",
  "Criança com febre, amigdalite e descamação palmar - escarlatina",
  "Rubéola em lactente com contato domiciliar positivo",
  "Sarampo em criança não vacinada durante surto regional",
  "Varicela em criança imunocomprometida",
  "Eritema infeccioso em pré-escolar com anemia leve",
  "Síndrome mão-pé-boca em berçário",
  "Lactente com palidez, irritabilidade e alimentação seletiva",
  "Criança de 2 anos com anemia microcítica refrátária a ferro",
  "Escolar com dor óssea e linfadenopatia - suspeita de leucemia",
  "Adolescente com equimoses espontâneas e sangramentos nasais",
  "Anemia falciforme em criança com febre e dor abdominal",
  "Crise vaso-oclusiva em paciente com hemoglobinopatia",
  "Escolar com petéquias após infecção viral - púrpura trombocitopênica?",
  "Lactente com icterícia persistente e esplenomegalia",
  "Criança com hemofilia e trauma leve com hematoma extenso",
  "Lactente com história familiar de talassemia",
  "Lactente com febre alta, taquipneia e gemência",
  "Pré-escolar com tosse produtiva, febre e estertores à ausculta",
  "Pneumonia lobar em criança não vacinada contra pneumococo",
  "Adolescente com febre, tosse seca e padrão intersticial em RX",
  "Pneumonia complicada com derrame pleural em criança de 5 anos",
  "Escolar com febre persistente e pneumonia refratária a antibiótico oral",
  "Criança com pneumonia viral versus bacteriana - desafio diagnóstico",
  "Adolescente com mononucleose infecciosa e linfadenomegalia cervical",
  "Criança com toxoplasmose congênita diagnosticada tardiamente",
  "Escolar com hanseníase paucibacilar em área endêmica",
  "Lactente com infecção congênita por citomegalovírus",
  "Pré-escolar com febre entérica após viagem internacional",
  "Adolescente com HIV congênito em falha terapêutica",
  "Escolar com febre prolongada e esplenomegalia - suspeita de leishmaniose",
  "Lactente com sífilis congênita com lesões cutâneas ativas",
  "Estenose hipertrófica de piloro em lactente com vômitos em jato",
  "Invaginação intestinal em lactente com dor intermitente e fezes em geleia de morango",
  "Hérnia umbilical sintomática em criança de 4 anos",
  "Apendicite aguda em criança com dor abdominal e vômitos",
  "Lactente com atresia anal diagnosticada no pós-natal",
  "Adolescente com colecistite aguda e cálculos biliares",
  "Doença de Hirschsprung em lactente com constipação desde o nascimento",
];

export const CIRURGIA_CASE_TITLES = [
  "Fratura de fêmur em idoso após queda da própria altura",
  "Luxação anterior de ombro em atleta após impacto",
  "Trauma direto em joelho com dor e edema - suspeita de lesão meniscal",
  "Fratura exposta de tíbia em vítima de acidente de moto",
  "Dor lombar crônica em trabalhador braçal - investigar hérnia de disco",
  "Entorse de tornozelo com instabilidade e limitação funcional",
  "Fratura supracondilar em criança com parestesia em mão",
  "Colles em paciente idoso após queda com apoio em punho",
  "Ombro doloroso crônico - suspeita de síndrome do impacto",
  "Lombalgia aguda com irradiação e déficit motor",
  "Fratura de pelve em politraumatizado instável",
  "Epicondilite lateral em paciente com uso repetitivo de braço",
  "Lesão de LCA em jogador de futebol com instabilidade articular",
  "Dor crônica em quadril com limitação de movimento - suspeita de coxartrose",
  "Osteomielite crônica em paciente com úlcera diabética",
  "Nódulo hepático em paciente com hepatite B crônica",
  "Carcinoma hepatocelular em cirrótico com função hepática preservada",
  "Paciente com hemangioma hepático assintomático",
  "Colangiocarcinoma em paciente com icterícia progressiva",
  "Metástase hepática única de câncer colorretal",
  "Tumor hepático em mulher jovem - sugestivo de adenoma",
  "Hepatoblastoma em criança de 3 anos com massa abdominal",
  "Abcesso hepático piogênico com febre e dor em hipocôndrio direito",
  "Paciente com cisto hepático simples de grande volume",
  "Nódulo focal hipervascular em imagem - diferenciar HNF de CHC",
  "Tumor hepático com invasão vascular - avaliar ressecabilidade",
  "Ressecção hepática programada em paciente com função hepática borderline",
  "Câncer gástrico com linfonodos palpáveis - indicação cirúrgica?",
  "Carcinoma de cólon ascendente com anemia e perda ponderal",
  "Câncer de esôfo com disfagia progressiva",
  "Tumor de pâncreas em cabeça com colestase obstrutiva",
  "Nódulo de mama em mulher jovem com histórico familiar",
  "Adenocarcinoma de reto baixo com preservação de esfíncter",
  "Tumor retroperitoneal volumoso e sem invasão aparente",
  "Sarcoma de partes moles em membro inferior",
  "Tumor neuroendócrino de intestino delgado com crise carcinoide",
  "Recidiva local de câncer de cólon após colectomia prévia",
  "Ressecção de metástases pulmonares em câncer de intestino",
  "Avaliação de ressecabilidade em câncer pancreático borderline",
  "Infecção de ferida operatória após laparotomia",
  "Deiscência de anastomose intestinal com febre e peritonite",
  "Fístula digestiva em pós-operatório de gastrectomia",
  "Retenção urinária após cirurgia ortopédica",
  "Trombose venosa profunda no pós-operatório de histerectomia",
  "Sangramento ativo após colecistectomia laparoscópica",
  "Íleo paralítico prolongado após cirurgia abdominal",
  "Paciente com febre no 5º dia pós-operatório - diagnóstico diferencial",
  "Eventração da parede abdominal no pós-operatório tardio",
  "Pneumonia nosocomial após cirurgia de grande porte",
  "Hipertermia pós-anestésica com instabilidade hemodinâmica",
  "Complicação pulmonar em paciente obeso no pós-operatório de hérnia incisional",
  "Aneurisma de aorta abdominal sintomático em idoso",
  "Claudicação intermitente em membro inferior esquerdo",
  "Trombose venosa profunda pós-cirurgia ortopédica",
  "Embolia arterial aguda com isquemia crítica do membro",
  "slcera arterial em paciente com doença vascular periférica",
  "Paciente diabético com pé isquêmico e lesão necrótica",
  "Varizes volumosas com dor e sinais de insuficiência venosa crônica",
  "Fístula arteriovenosa disfuncional em paciente em hemodiálise",
  "Dissecção de aorta tipo B com dor torácica e PA descontrolada",
  "Hérnia inguinal direta com aumento de volume em região inguinal",
  "Hérnia umbilical sintomática em paciente obeso",
  "Hérnia epigástrica com dor após esforço físico",
  "Hérnia incisional em pós-operatório de laparotomia mediana",
  "Hérnia inguinoescrotal volumosa em idoso",
  "Estrangulamento herniário com obstrução intestinal",
  "Hérnia femoral em mulher idosa com dor súbita",
  "Recidiva de hérnia inguinal após correção prévia com tela",
  "Hérnia encarcerada com sinais de isquemia intestinal",
  "Trauma abdominal fechado com hipotensão e FAST positivo",
  "Lesão esplênica grau IV em paciente hemodinamicamente estável",
  "Trauma penetrante de abdome com evisceração",
  "Lesão hepática contusa em paciente politraumatizado",
  "Hemoperitônio em trauma com suspeita de ruptura de alça intestinal",
  "Paciente com dor abdominal após acidente de moto - avaliação de retroperitônio",
  "Lesão de bexiga em trauma contuso com hematúria",
  "Trauma hepático grave com necessidade de hepatorrafia",
  "Paciente com ferimento por arma branca em flanco direito",
  "Apendicite aguda em jovem com dor em fossa ilíaca direita",
  "Colecistite aguda em paciente diabético com febre e leucocitose",
  "Diverticulite aguda com abscesso pericólico",
  "Abdome agudo obstrutivo por brida em paciente com múltiplas laparotomias",
  "Hemorragia digestiva alta em paciente com úlcera duodenal",
  "Abdome agudo perfurativo com pneumoperitônio",
  "Colelitíase sintomática em paciente com dor pós-prandial",
  "Pólipo adenomatoso de cólon em rastreamento de rotina",
  "Invaginação intestinal em adulto com obstrução intermitente",
  "Avaliação pré-operatória de paciente com múltiplas comorbidades",
  "Risco cardiovascular pré-cirúrgico em paciente com DAC estável",
  "Suspensão de anticoagulantes antes de cirurgia eletiva",
  "Otimização de controle glicêmico antes de cirurgia ortopédica",
  "Planejamento anestésico em paciente com DPOC grave",
  "Orientação nutricional em paciente oncológico pré-gastrectomia",
  "Prevenção de trombose venosa profunda no perioperatório",
  "Avaliação de via aérea difícil antes de cirurgia de cabeça e pescoço",
  "Avaliação laboratorial alterada no pré-operatório - adiar ou operar?",
  "Trauma torácico com instabilidade respiratória - toracotomia de urgência",
  "Politrauma com fratura exposta, TCE e abdome instável",
  "Lesão de carótida interna em trauma cervical penetrante",
  "Trauma de face com sangramento ativo e comprometimento de via aérea",
];

export const GINECOLOGIA_OBSTETRICIA_CASE_TITLES = [
  "Mulher jovem com úlcera genital dolorosa e linfadenomegalia inguinal",
  "Gestante no 3º trimestre com lesão ulcerada em genitália externa",
  "slcera genital indolor em paciente com novo parceiro sexual",
  "Paciente com múltiplas úlceras necróticas e febre",
  "Lesão genital recorrente associada ao ciclo menstrual",
  "Mulher com úlcera e secreção purulenta - suspeita de cancro mole",
  "Lesão única, bem delimitada, com base endurecida - suspeita de sífilis",
  "HIV positiva com úlcera extensa e dor intensa",
  "Adolescente com lesão genital e história de abuso sexual",
  "Mulher com herpes genital de repetição e desejo reprodutivo",
  "Lesão ulcerada perianal em paciente com história de IST",
  "slcera genital em mulher que nega contato sexual recente",
  "Lúpus eritematoso sistêmico com lesão ulcerada vulvar",
  "Paciente imunossuprimida com úlceras atípicas e dolorosas",
  "Lesões ulceradas genitais e orais - pensar em Behçet",
  "Recorrência de úlcera genital após tratamento de sífilis",
  "Corrimento branco, espesso e prurido intenso",
  "Secreção vaginal amarelo-esverdeada com odor fétido",
  "Corrimento acinzentado e pH vaginal alterado - vaginose bacteriana",
  "Corrimento vaginal e sangramento pós-coito - suspeita de cervicite",
  "Mulher com dor pélvica e febre após episódio de corrimento",
  "Adolescente com cervicite por clamídia confirmada",
  "Mulher com tricomoníase e parceiro assintomático",
  "Paciente com queixa de prurido e secreção vaginal em uso de antibióticos",
  "Corrimento vaginal persistente após tratamento antifúngico",
  "HIV positiva com candidíase vaginal de repetição",
  "Gestante com vaginose bacteriana no 2º trimestre",
  "Mulher na menopausa com atrofia vaginal e prurido",
  "Corrimento crônico e inflamação cervical - suspeita de cervicite crônica",
  "Mulher com antecedente de TEV buscando método contraceptivo seguro",
  "Adolescente com ciclos irregulares e acne - desejo de contracepção hormonal",
  "Lactante buscando método anticoncepcional compatível com aleitamento",
  "Paciente com contraindicação a estrogênio e desejo de contracepção oral",
  "Mulher com desejo de contracepção de longa duração",
  "Escolha de método contraceptivo em paciente com epilepsia",
  "Mulher com desejo de engravidar em 1 ano - escolha do método",
  "Eficácia do DIU em nulípara jovem com cólicas menstruais",
  "Paciente com sangramento irregular em uso de implante hormonal",
  "Avaliação de falha contraceptiva em paciente com uso regular de ACO",
  "Desejo de laqueadura tubária em paciente com cesárea agendada",
  "Anticoncepção de emergência após relação sexual desprotegida",
  "Escolha de método contraceptivo em mulher com enxaqueca com aura",
  "Parto normal em gestante com antecedente de cesariana",
  "Parto precipitado em multípara com dilatação total ao chegar na maternidade",
  "Gestante com trabalho de parto prolongado - indicação de cesárea?",
  "Parto pélvico em primigesta - avaliação da via de parto",
  "Indução do parto em gestante com bolsa rota há 24 horas",
  "Parto com distócia de ombro e manobras obstétricas",
  "Uso de fórceps em parto com sofrimento fetal tardio",
  "Parto com mecônio espesso e reanimação neonatal",
  "Hemorragia pós-parto imediata - suspeita de atonia uterina",
  "Massa anexial complexa em mulher na pós-menopausa",
  "Cistoadenocarcinoma seroso diagnosticado em estágio avançado",
  "Mulher jovem com dor abdominal e elevação de CA-125",
  "Tumor de ovário com ascite e derrame pleural - síndrome de Meigs",
  "Neoplasia ovariana com disseminação peritoneal - estratégia cirúrgica",
  "Tumor borderline de ovário em mulher com desejo reprodutivo",
  "Tumor de células germinativas em adolescente com massa pélvica",
  "Recidiva de câncer de ovário após quimioterapia",
  "Diagnóstico incidental de neoplasia ovariana em cirurgia de histerectomia",
  "Redução da movimentação fetal em gestante de 34 semanas",
  "Ausência de batimentos cardíacos fetais em consulta de rotina",
  "Gestante com RCIU e dopplervelocimetria alterada",
  "Perfil biofísico fetal limítrofe em gestante hipertensa",
  "Oligoâmnio com crescimento fetal adequado - conduta expectante?",
  "Macrossomia fetal com sinais de sofrimento em cardiotocografia",
  "RN com Apgar baixo após parto cesáreo eletivo",
  "Polidrâmnio com avaliação ultrassonográfica normal - conduta",
  "Avaliação de vitalidade fetal em gestante diabética mal controlada",
  "Gestante com PA elevada, cefaleia e escotomas - suspeita de pré-eclâmpsia",
  "Eclâmpsia em paciente sem pré-natal adequado",
  "Hipertensão gestacional com proteinúria ausente",
  "Pré-eclâmpsia grave em gestante de 30 semanas - manter ou interromper?",
  "Síndrome HELLP com plaquetopenia e dor epigástrica",
  "Crise hipertensiva em trabalho de parto - conduta imediata",
  "Avaliação de risco em gestante com hipertensão crônica",
  "Pré-eclâmpsia em gestante com lúpus eritematoso sistêmico",
  "Conduta expectante em pré-eclâmpsia leve a termo",
  "Resultado de citologia com NIC III em mulher de 32 anos",
  "Paciente com colposcopia alterada e biópsia confirmando NIC II",
  "Condilomas genitais volumosos em mulher grávida",
  "HPV de alto risco detectado em teste molecular - conduta?",
  "Seguimento de lesão de baixo grau em citologia recente",
  "Carcinoma invasor de colo uterino diagnosticado em estágio inicial",
  "Lesão de alto grau em citologia de adolescente",
  "Mulher vacinada com HPV e citologia alterada - o que fazer?",
  "Sangramento pós-coito em mulher com lesão suspeita ao exame especular",
  "Bolsa rota com 30 semanas e ausência de trabalho de parto",
  "Parto prematuro iminente em gestante com colo encurtado",
  "Rotura prematura das membranas com sinais infecciosos",
  "Prematuridade extrema com gemelaridade monocoriônica",
  "Corticoide antenatal em paciente com ameaça de parto prematuro",
  "Rotura prematura em gestante sem contrações - internação ou ambulatorial?",
  "Prematuridade associada a infecção urinária não tratada",
  "Bradicardia fetal súbita durante trabalho de parto",
  "Desacelerações tardias na cardiotocografia - conduta imediata",
  "Sinais de hipóxia fetal com líquido meconial espesso",
  "Taquicardia fetal persistente e febre materna intraparto",
  "Parto com prolapso de cordão umbilical - intervenção urgente",
  "Redução dos movimentos fetais e perfil biofísico alterado",
];

export const MEDICINA_PREVENTIVA_CASE_TITLES = [
  "Estudo clínico com p=0,08 - interpretação estatística correta?",
  "Uso de intervalo de confiança em pesquisa de prevalência",
  "Amostra pequena em estudo de intervenção - impacto no poder estatístico",
  "Erro tipo I e tipo II em ensaio clínico randomizado",
  "Validade interna versus validade externa em estudo epidemiológico",
  "Cálculo do tamanho amostral para pesquisa populacional",
  "Sensibilidade e especificidade aplicadas em teste sorológico",
  "Viés de seleção em estudo de caso-controle",
  "Interpretação de gráfico de Kaplan-Meier em oncologia",
  "Correlação não implica causalidade: análise de dados secundários",
  "Uso inadequado de média em variável não paramétrica",
  "Intervalo de confiança cruzando 1 em cálculo de risco relativo",
  "Aplicação de regressão logística em estudo de fatores de risco",
  "Estudo de intervenção sem grupo controle - limitações",
  "Interpretação de OR=0,95 (IC95% 0,7- 1,2) em pesquisa clínica",
  "Curva ROC para avaliação de teste diagnóstico",
  "Análise de subgrupos em ensaio clínico randomizado",
  "Teste de hipótese versus significância clínica em medicina baseada em evidências",
  "Paciente sem vínculo com ESF e uso frequente de pronto-socorro",
  "Acolhimento em UBS de paciente com dor crônica não controlada",
  "Estratégia de adscrição populacional em equipe de saúde da família",
  "Longitudinalidade na atenção a paciente com hipertensão",
  "Coordenação do cuidado entre UBS e hospital de referência",
  "Integralidade da atenção em paciente com múltiplas demandas",
  "Equipe multiprofissional em ação de prevenção de diabetes",
  "Territorialização e mapeamento de famílias em comunidade rural",
  "Planejamento de ações de promoção da saúde em creche",
  "Visita domiciliar para idoso acamado com comorbidades",
  "UBS com alta demanda espontânea e baixo agendamento programado",
  "Atuação da atenção primária em saúde mental comunitária",
  "Rastreamento de câncer de colo do útero em área adscrita",
  "Estratégia de imunização em populações vulneráveis",
  "Cuidado continuado de paciente diabético com pé em risco",
  "Acolhimento humanizado a população migrante em atenção primária",
  "Paciente oncológico com dor crônica e comunicação deficiente da equipe",
  "Atendimento acolhedor em pronto-socorro superlotado",
  "Escuta ativa em consulta de pré-natal na UBS",
  "Comunicação de más notícias em oncologia",
  "Redução do tempo de espera e melhoria do ambiente hospitalar",
  "Atendimento a paciente com deficiência auditiva sem intérprete",
  "Respeito à autonomia em paciente terminal",
  "-tica no cuidado a paciente vulnerável em situação de rua",
  "Violência obstétrica em sala de parto - como evitar?",
  "Humanização no acompanhamento de parto de risco habitual",
  "Consentimento informado em paciente idoso com baixa escolaridade",
  "Estratégias de humanização em UTI neonatal",
  "Humanização no acolhimento de familiares em óbito hospitalar",
  "Enfrentamento do burnout entre profissionais de saúde",
  "Planejamento regional de saúde em consórcio intermunicipal",
  "Financiamento tripartite em ações de média complexidade",
  "Regulação de leitos hospitalares em situações de urgência",
  "Pactuação interfederativa em conselhos de saúde",
  "Controle social em conferência municipal de saúde",
  "Auditoria em serviços conveniados ao SUS",
  "Indicadores de desempenho em gestão hospitalar pública",
  "Gestão de estoque de medicamentos essenciais na atenção básica",
  "Descentralização de recursos para municípios de pequeno porte",
  "Implementação de protocolos clínicos no SUS",
  "Judicialização da saúde em fornecimento de medicamentos",
  "Educação permanente em saúde para profissionais da rede pública",
  "Estudo de prevalência de obesidade em adolescentes",
  "Inquérito populacional sobre consumo de álcool e tabaco",
  "Estudo transversal sobre cobertura vacinal infantil",
  "Pesquisa sobre autopercepção de saúde em idosos",
  "Estudo de corte transversal em trabalhadores expostos a ruído",
  "Levantamento de saúde bucal em escolares",
  "Estudo de fatores associados a sedentarismo em adultos",
  "Inquérito epidemiológico de doenças crônicas não transmissíveis",
  "Estudo sobre prevalência de ansiedade em estudantes de medicina",
  "Pesquisa transversal sobre acesso a serviços de saúde mental",
  "Estudo de prevalência de hipertensão em população urbana",
  "Estudo em população indígena sobre estado nutricional",
  "Levantamento sobre violência doméstica em adolescentes",
  "Estudo de saúde reprodutiva em mulheres em idade fértil",
  "Prevalência de sintomas respiratórios em comunidade exposta à poluição",
  "Estudo de saúde ocupacional em trabalhadores de frigorífico",
  "Inquérito de uso de automedicação em universitários",
  "Sensibilidade e especificidade do teste rápido de HIV",
  "Valor preditivo positivo em rastreamento de câncer de colo uterino",
  "Curva ROC para diagnóstico de diabetes mellitus",
  "Comparação entre RT-PCR e teste de antígeno para COVID-19",
  "Estudo de acurácia de mamografia em mulheres jovens",
  "Análise de falso-negativos em teste sorológico para sífilis",
  "Uso de likelihood ratio em avaliação de tuberculose",
  "Incidência de dengue em comunidade após surto sazonal",
  "Incidência de câncer de pele em agricultores expostos ao sol",
  "Incidência de tuberculose em população carcerária",
  "Incidência de infarto agudo do miocárdio em população idosa",
  "Incidência de HIV em jovens de 15 a 24 anos",
  "Incidência de hepatite A após campanha de vacinação",
  "Incidência de acidentes de trabalho em setor da construção civil",
  "Prevenção primária: campanha de vacinação contra influenza",
  "Prevenção secundária: rastreamento de câncer de mama",
  "Prevenção terciária: reabilitação pós-AVC",
  "Prevenção quaternária: evitar excesso de exames em paciente saudável",
  "Prevenção primária: redução de tabagismo em adolescentes",
  "Prevenção secundária: rastreamento de hipertensão arterial",
  "Prevenção terciária: cuidados paliativos em paciente oncológico",
  "Estudo caso-controle de tabagismo e câncer de pulmão - OR",
  "Coorte de obesidade e diabetes tipo 2 - RR",
  "Estudo de exposição ocupacional e intoxicação crônica - OR",
  "Coorte de atividade física e hipertensão arterial - RR",
  "Estudo de contraceptivo oral e trombose venosa - OR",
  "Coorte de dieta rica em fibras e câncer colorretal - RR",
  "Estudo de álcool e hepatopatia crônica - OR",
  "Aplicação da Lei 8080/90 em gestão municipal de saúde",
  "Lei 8142/90 e controle social em conselhos de saúde",
  "Política Nacional de Humanização aplicada em hospital",
  "Diretrizes da RAPS na atenção psicossocial",
  "Política Nacional de Atenção Básica e cobertura populacional",
  "Rede Cegonha e cuidados no pré-natal e parto",
  "Diretrizes da Vigilância em Saúde e surtos epidêmicos",
];

export const INTENSIVO_RESIDENCIA_QUESTIONS: Record<MedicalSubject, MultipleChoiceQuestion[]> = {
  'Clínica Médica': [
    {
        question: "Um homem de 68 anos é admitido na emergência com dor torácica em aperto há 2 horas, irradiando para o braço esquerdo. O eletrocardiograma (ECG) mostra supradesnivelamento do segmento ST nas derivações DII, DIII e aVF. Qual é a conduta prioritária neste caso?",
        options: ["Administrar morfina e solicitar marcadores de necrose miocárdica.", "Iniciar betabloqueador oral e aguardar avaliação do cardiologista.", "Realizar ecocardiograma transtorácico para avaliar a função ventricular.", "Encaminhar para terapia de reperfusão imediata (angioplastia primária ou trombólise).", "Administrar nitrato sublingual e observar a resposta da dor."],
        correctAnswer: "Encaminhar para terapia de reperfusão imediata (angioplastia primária ou trombólise).",
        explanation: "No Infarto Agudo do Miocárdio com Supradesnivelamento de ST (IAMCSST) de parede inferior, a prioridade absoluta é a desobstrução da artéria coronária ocluída. A terapia de reperfusão, seja por angioplastia ou trombólise, deve ser instituída o mais rápido possível para salvar o miocárdio."
    },
    {
        question: "Uma mulher de 58 anos chega ao pronto-socorro com palpitações, dispneia intensa e confusão mental. A pressão arterial é de 80/50 mmHg. O ECG revela Fibrilação Atrial com frequência ventricular de 180 bpm. Qual é a conduta imediata mais apropriada?",
        options: ["Cardioversão elétrica sincronizada.", "Administração de amiodarona em bolus endovenoso.", "Iniciar heparina de baixo peso molecular.", "Administrar diltiazem endovenoso para controle da frequência.", "Solicitar ecocardiograma transesofágico para descartar trombo atrial."],
        correctAnswer: "Cardioversão elétrica sincronizada.",
        explanation: "A presença de instabilidade hemodinâmica (hipotensão, rebaixamento do nível de consciência) em um paciente com taquiarritmia, como a FA de alta resposta ventricular, é uma indicação formal de cardioversão elétrica sincronizada de emergência."
    },
    {
        question: "Um paciente de 65 anos apresenta-se com quadro de Infarto Agudo do Miocárdio com supradesnivelamento de ST (IAMCSST) há 1 hora. Na história, refere um AVC isquêmico há 12 meses, sem sequelas. Em relação à terapia trombolítica, o AVC prévio é considerado:",
        options: ["Uma contraindicação absoluta.", "Uma contraindicação relativa, dependendo do risco-benefício.", "Não é uma contraindicação, desde que o AVC tenha ocorrido há mais de 3 meses.", "Uma contraindicação absoluta apenas se o AVC tivesse ocorrido há menos de 6 meses.", "Uma indicação para reduzir a dose do trombolítico."],
        correctAnswer: "Não é uma contraindicação, desde que o AVC tenha ocorrido há mais de 3 meses.",
        explanation: "De acordo com as diretrizes atuais, um AVC isquêmico ocorrido há mais de 3 meses não é uma contraindicação absoluta para a trombólise no IAMCSST. A contraindicação absoluta se aplica a AVCs isquêmicos nos últimos 3 meses ou a qualquer AVC hemorrágico prévio."
    },
    {
        question: "Um idoso de 82 anos é trazido à emergência após um episódio de síncope. Ao exame, está sonolento, com FC de 32 bpm e PA de 90/60 mmHg. O ECG mostra bloqueio atrioventricular total (BAVT). Qual é o manejo inicial mais adequado?",
        options: ["Administrar atropina endovenosa em bolus.", "Instalar marca-passo transcutâneo de urgência.", "Iniciar infusão de dopamina.", "Realizar cardioversão elétrica sincronizada.", "Aguardar avaliação cardiológica para implante de marca-passo definitivo."],
        correctAnswer: "Instalar marca-passo transcutâneo de urgência.",
        explanation: "Em um paciente com BAVT sintomático e instabilidade hemodinâmica, a atropina é geralmente ineficaz (bloqueio infranodal). A medida mais eficaz e imediata para estabilizar a frequência cardíaca é a instalação de um marca-passo transcutâneo, servindo como ponte para o implante do marca-passo definitivo."
    },
    {
        question: "Um jovem de 25 anos queixa-se de dor torácica aguda, ventilatório-dependente, que piora em decúbito dorsal e alivia ao inclinar o tronco para frente. Na ausculta cardíaca, ouve-se um atrito pericárdico. O ECG mostra supradesnivelamento difuso de ST com concavidade para cima. Qual o diagnóstico mais provável?",
        options: ["Infarto agudo do miocárdio.", "Embolia pulmonar.", "Pericardite aguda.", "Dissecção de aorta.", "Costocondrite."],
        correctAnswer: "Pericardite aguda.",
        explanation: "A combinação de dor torácica postural (piora ao deitar, melhora ao sentar), atrito pericárdico na ausculta e supradesnivelamento difuso de ST com concavidade superior no ECG é a apresentação clássica da pericardite aguda."
    },
    {
        question: "Um paciente de 70 anos refere dispneia que progrediu nos últimos meses, necessitando de 3 travesseiros para dormir (ortopneia) e acordando à noite com falta de ar. Ao exame, apresenta estase jugular e estertores crepitantes. Qual a classificação funcional (NYHA) mais provável?",
        options: ["Classe I.", "Classe II.", "Classe III.", "Classe IV.", "Não se aplica."],
        correctAnswer: "Classe III.",
        explanation: "Ortopneia e dispneia paroxística noturna indicam dispneia em repouso ou aos mínimos esforços. O paciente tem limitação acentuada da atividade física (Classe III) ou incapacidade de realizar qualquer atividade sem desconforto (Classe IV). Como ele ainda consegue realizar algumas atividades, Classe III é mais provável."
    },
    {
        question: "Homem de 55 anos, hipertenso, procura a emergência com cefaleia occipital intensa e visão turva. A PA aferida é de 220/130 mmHg. O exame de fundo de olho revela papiledema. Qual o diagnóstico e a meta terapêutica inicial?",
        options: ["Urgência hipertensiva; reduzir a PA em 24-48 horas.", "Emergência hipertensiva; reduzir a PA média em até 25% na primeira hora.", "Hipertensão estágio 3; iniciar tratamento com 3 classes de anti-hipertensivos orais.", "Pseudocrise hipertensiva; administrar analgésico e reavaliar.", "Encefalopatia hipertensiva; reduzir a PA para 120/80 mmHg o mais rápido possível."],
        correctAnswer: "Emergência hipertensiva; reduzir a PA média em até 25% na primeira hora.",
        explanation: "A presença de lesão de órgão-alvo aguda (papiledema, indicando encefalopatia hipertensiva) caracteriza uma emergência hipertensiva. A meta é reduzir a PA de forma controlada, com drogas endovenosas, para evitar hipoperfusão cerebral, não devendo a PA média cair mais que 25% na primeira hora."
    },
    {
        question: "Mulher de 30 anos, hígida, chega à emergência com palpitações de início súbito. Está hemodinamicamente estável. O monitor cardíaco mostra uma taquicardia regular de complexo QRS estreito com FC de 180 bpm. A manobra de Valsalva foi ineficaz. Qual a próxima conduta farmacológica de escolha?",
        options: ["Amiodarona 150 mg IV.", "Diltiazem 20 mg IV.", "Adenosina 6 mg IV em bolus rápido.", "Metoprolol 5 mg IV.", "Verapamil 5 mg IV."],
        correctAnswer: "Adenosina 6 mg IV em bolus rápido.",
        explanation: "Para uma taquicardia supraventricular de QRS estreito, regular e estável, a adenosina é a droga de primeira escolha após a falha das manobras vagais, devido à sua alta eficácia e curta meia-vida."
    },
    {
        question: "Ao analisar um ECG, você observa ausência de onda P, presença de ondas \"F\" em formato de \"dentes de serra\" mais visíveis em DII, DIII e aVF, com frequência atrial de 300 bpm e frequência ventricular regular de 150 bpm. Qual o diagnóstico eletrocardiográfico?",
        options: ["Fibrilação atrial de alta resposta ventricular.", "Taquicardia supraventricular por reentrada nodal.", "Taquicardia atrial.", "Flutter atrial com bloqueio atrioventricular variável.", "Flutter atrial com condução 2:1."],
        correctAnswer: "Flutter atrial com condução 2:1.",
        explanation: "As ondas em 'dentes de serra' (ondas F) são patognomônicas do flutter atrial. Uma frequência atrial de 300 bpm e uma frequência ventricular regular de 150 bpm indicam um bloqueio atrioventricular fixo de 2:1."
    },
    {
        question: "Um paciente de 75 anos, em uso de varfarina para fibrilação atrial, chega à emergência com hematêmese. Os exames mostram INR de 8,5. Qual é a conduta mais eficaz e imediata para reverter a anticoagulação?",
        options: ["Suspender a varfarina e administrar Vitamina K oral.", "Administrar plasma fresco congelado e Vitamina K endovenosa.", "Realizar transfusão de plaquetas.", "Administrar heparina de baixo peso molecular.", "Administrar ácido tranexâmico."],
        correctAnswer: "Administrar plasma fresco congelado e Vitamina K endovenosa.",
        explanation: "Em um sangramento maior associado ao uso de varfarina, a reversão deve ser imediata. O plasma fresco congelado (ou complexo protrombínico) repõe os fatores de coagulação rapidamente, enquanto a Vitamina K endovenosa inicia a reversão sustentada do efeito da varfarina."
    },
    {
        question: "Uma idosa de 80 anos apresenta-se com anasarca, ascite e turgência jugular patológica. A ausculta cardíaca revela uma terceira bulha (B3). Qual a etiologia mais provável para o quadro?",
        options: ["Insuficiência hepática (cirrose).", "Síndrome nefrótica.", "Insuficiência cardíaca congestiva.", "Desnutrição proteico-calórica grave.", "Obstrução da veia cava inferior."],
        correctAnswer: "Insuficiência cardíaca congestiva.",
        explanation: "A combinação de anasarca com sinais de congestão venosa sistêmica (turgência jugular) e sinais cardíacos (presença de B3) aponta fortemente para uma etiologia cardíaca, especificamente insuficiência cardíaca congestiva."
    },
    {
        question: "Um jovem de 28 anos é trazido à emergência com dor torácica intensa após uso de cocaína. O ECG mostra supradesnivelamento do segmento ST em múltiplas derivações. Qual das seguintes medicações está contraindicada no manejo inicial deste paciente?",
        options: ["Nitroglicerina.", "Morfina.", "Benzodiazepínicos (Diazepam).", "Aspirina.", "Metoprolol."],
        correctAnswer: "Metoprolol.",
        explanation: "No infarto agudo do miocárdio induzido por cocaína, o uso de betabloqueadores (como o metoprolol) é contraindicado devido ao risco de estimular receptores alfa-adrenérgicos sem oposição, o que pode piorar o vasoespasmo coronariano, a hipertensão e a isquemia."
    },
    {
        question: "Paciente de 60 anos apresenta dor torácica súbita, lancinante, irradiando para o dorso. Há assimetria de pulsos e PA de 200/120 mmHg. A principal suspeita é dissecção aguda de aorta. Qual é a estratégia de controle pressórico mais adequada?",
        options: ["Nitroprussiato de sódio como monoterapia.", "Hidralazina endovenosa.", "Betabloqueador (ex: esmolol) seguido por um vasodilatador (ex: nitroprussiato).", "Nifedipina sublingual.", "Furosemida em bolus."],
        correctAnswer: "Betabloqueador (ex: esmolol) seguido por um vasodilatador (ex: nitroprussiato).",
        explanation: "No manejo da dissecção de aorta, é crucial controlar a frequência cardíaca e a pressão arterial. O betabloqueador é usado primeiro para reduzir a força de cisalhamento na parede da aorta (dP/dt), seguido por um vasodilatador para baixar a pressão, evitando uma taquicardia reflexa."
    },
    {
        question: "Um paciente com diagnóstico de endocardite infecciosa em valva mitral apresenta subitamente hemiparesia direita e afasia. A tomografia de crânio confirma um AVC isquêmico. Qual a conduta em relação ao tratamento da endocardite?",
        options: ["Suspender a antibioticoterapia e iniciar anticoagulação plena.", "Indicar cirurgia de troca valvar de emergência.", "Manter a antibioticoterapia, pois a cirurgia está contraindicada.", "Iniciar anticoagulação plena e manter os antibióticos.", "Trocar o esquema antibiótico."],
        correctAnswer: "Indicar cirurgia de troca valvar de emergência.",
        explanation: "A ocorrência de um evento embólico maior, como um AVC, em um paciente com endocardite infecciosa, é uma indicação clássica de tratamento cirúrgico precoce para remover a fonte dos êmbolos (a vegetação) e prevenir novos eventos."
    },
    {
        question: "Durante o exame físico de um paciente com dispneia progressiva aos esforços, você ausculta um sopro diastólico, em ruflar, mais audível no ápice cardíaco com o paciente em decúbito lateral esquerdo. Qual a valvopatia mais provável?",
        options: ["Insuficiência aórtica.", "Estenose mitral.", "Insuficiência mitral.", "Estenose aórtica.", "Insuficiência tricúspide."],
        correctAnswer: "Estenose mitral.",
        explanation: "O sopro diastólico em ruflar, de baixa frequência, mais audível no foco mitral (ápice) e que se acentua com a manobra de Pachon (decúbito lateral esquerdo), é o achado semiológico característico da estenose mitral."
    },
    {
        question: "Um senhor de 70 anos, diabético, procura atendimento com tosse produtiva, febre e dispneia. Ao exame, está confuso, com FR de 32 irpm e PA de 85/55 mmHg. A ureia sérica é de 60 mg/dL. Qual a pontuação no escore CURB-65 e a conduta recomendada?",
        options: ["2 pontos; tratamento ambulatorial.", "3 pontos; considerar internação hospitalar.", "4 pontos; internação hospitalar, possivelmente em UTI.", "5 pontos; internação obrigatória em UTI.", "1 ponto; tratamento ambulatorial."],
        correctAnswer: "5 pontos; internação obrigatória em UTI.",
        explanation: "O paciente pontua em todos os 5 critérios do CURB-65: C (Confusão), U (Ureia > 50 mg/dL), R (FR - 30), B (PA < 90/60) e 65 (Idade - 65). Uma pontuação de 4 ou 5 indica pneumonia grave com alta mortalidade, sendo mandatória a internação em UTI."
    },
    {
        question: "Foi realizada toracentese em um paciente com derrame pleural. A análise do líquido mostrou: Relação Proteína Pleural/Sérica = 0.6; Relação LDH Pleural/Sérico = 0.7; LDH Pleural = 250 U/L (LDH sérico normal < 200 U/L). Como o derrame é classificado?",
        options: ["Transudato.", "Exsudato, pois todos os três critérios estão preenchidos.", "Inconclusivo.", "Exsudato, pois pelo menos um dos critérios de Light está preenchido.", "Necessita de biópsia para confirmação."],
        correctAnswer: "Exsudato, pois pelo menos um dos critérios de Light está preenchido.",
        explanation: "Pelos critérios de Light, um derrame é exsudato se preencher ao menos um dos seguintes: Prot P/S > 0.5; LDH P/S > 0.6; ou LDH P > 2/3 do limite superior do LDH sérico. Neste caso, todos os critérios são preenchidos, confirmando o diagnóstico de exsudato."
    },
    {
        question: "Homem de 65 anos, tabagista com DPOC, chega com piora da dispneia, aumento do volume e purulência do escarro. A gasometria arterial mostra pH 7.28, PaCO2 65 mmHg, PaO2 55 mmHg, HCO3 28 mEq/L. Qual o diagnóstico do distúrbio acidobásico?",
        options: ["Acidose metabólica compensada.", "Alcalose respiratória crônica.", "Acidose respiratória crônica agudizada.", "Alcalose metabólica.", "Acidose respiratória compensada."],
        correctAnswer: "Acidose respiratória crônica agudizada.",
        explanation: "O pH baixo com PaCO2 elevado indica acidose respiratória. O bicarbonato (HCO3) está elevado, indicando uma compensação metabólica crônica pré-existente (devido à DPOC). No entanto, a compensação não é suficiente para normalizar o pH, caracterizando uma agudização."
    },
    {
        question: "Paciente de 50 anos, em pós-operatório de artroplastia de quadril, desenvolve dispneia súbita e dor torácica. Apresenta FC de 110 bpm e edema assimétrico de membro inferior. Pelo Escore de Wells, a probabilidade de TEP é alta. Qual o exame de imagem de escolha?",
        options: ["Radiografia de tórax.", "Cintilografia de ventilação-perfusão.", "Angiotomografia de tórax.", "Ecocardiograma transtorácico.", "D-dímero."],
        correctAnswer: "Angiotomografia de tórax.",
        explanation: "Em pacientes com alta probabilidade clínica de tromboembolismo pulmonar (TEP), o D-dímero não é útil. O exame de imagem padrão-ouro para o diagnóstico é a angiotomografia de tórax, que permite a visualização direta dos trombos nas artérias pulmonares."
    },
    {
        question: "Um trabalhador rural desenvolve febre alta, tosse seca e dispneia 8 horas após limpar um galinheiro infestado por pombos. A radiografia de tórax mostra infiltrado micronodular difuso. Qual o diagnóstico mais provável?",
        options: ["Pneumonia bacteriana comunitária.", "Tuberculose miliar.", "Pneumonite de hipersensibilidade aguda.", "Sarcoidose.", "Aspergilose broncopulmonar alérgica."],
        correctAnswer: "Pneumonite de hipersensibilidade aguda.",
        explanation: "A história de exposição ocupacional a antígenos orgânicos (fezes de aves) seguida por um quadro respiratório agudo (febre, tosse, dispneia) horas após a exposição é a apresentação clássica da pneumonite de hipersensibilidade aguda, também conhecida como 'pulmão do fazendeiro'."
    },
    {
        question: "Um jovem asmático em crise grave, recebendo tratamento, evolui com sonolência e 'tórax silencioso' na ausculta. Qual a interpretação e a conduta imediata?",
        options: ["Melhora do quadro; manter tratamento.", "Fadiga muscular e obstrução crítica; preparar para intubação orotraqueal.", "Pneumotórax espontâneo; realizar radiografia.", "Efeito colateral do corticoide; reduzir a dose.", "Crise de ansiedade; administrar benzodiazepínico."],
        correctAnswer: "Fadiga muscular e obstrução crítica; preparar para intubação orotraqueal.",
        explanation: "O 'tórax silencioso' em uma crise de asma não significa melhora, mas sim uma obstrução tão severa que o fluxo aéreo é mínimo, sendo um sinal de falência respiratória iminente. A sonolência indica hipercapnia. A intubação orotraqueal e ventilação mecânica são urgentes."
    },
    {
        question: "Um paciente com carcinoma de pequenas células de pulmão apresenta edema facial, pletora, turgência jugular e circulação colateral no tórax superior. Qual o diagnóstico sindrômico e a medida terapêutica inicial mais importante?",
        options: ["Síndrome de Pancoast; radioterapia local.", "Síndrome da veia cava superior; quimioterapia e/ou radioterapia de urgência.", "Síndrome paraneoplásica; corticoterapia.", "Tamponamento cardíaco; pericardiocentese.", "Embolia pulmonar; anticoagulação."],
        correctAnswer: "Síndrome da veia cava superior; quimioterapia e/ou radioterapia de urgência.",
        explanation: "O quadro clínico é característico da síndrome da veia cava superior, uma emergência oncológica causada pela compressão da veia. Como o carcinoma de pequenas células é altamente quimio e radiossensível, o tratamento oncológico de urgência é a prioridade para aliviar a compressão."
    },
    {
        question: "Tomografia de tórax de um homem de 65 anos, tabagista, revela um nódulo pulmonar de 1,5 cm, de contornos espiculados, no lobo superior direito. Qual é a conduta mais apropriada?",
        options: ["Acompanhamento com nova tomografia em 3 meses.", "Realizar PET-CT para avaliação metabólica.", "Indicar broncoscopia com biópsia.", "Proceder com biópsia percutânea guiada por tomografia.", "Observação, pois o nódulo é pequeno."],
        correctAnswer: "Proceder com biópsia percutânea guiada por tomografia.",
        explanation: "Em um paciente de alto risco (tabagista, idoso) com um nódulo pulmonar de características suspeitas (espiculado), a investigação para confirmação histopatológica é mandatória. Para um nódulo periférico como o descrito, a biópsia percutânea guiada por TC é o método de escolha."
    },
    {
        question: "Homem de 50 anos, etilista, refere tosse produtiva há 3 meses, com laivos de sangue, febre vespertina, sudorese noturna e emagrecimento. A radiografia de tórax mostra uma cavitação em ápice pulmonar direito. Qual o exame confirmatório para a principal hipótese?",
        options: ["PPD (teste tuberculínico).", "Tomografia de tórax.", "Pesquisa de BAAR no escarro.", "Broncoscopia com lavado broncoalveolar.", "Sorologia para HIV."],
        correctAnswer: "Pesquisa de BAAR no escarro.",
        explanation: "O quadro clínico e radiológico é altamente sugestivo de tuberculose pulmonar. O diagnóstico de certeza é feito pela demonstração do agente etiológico, o Mycobacterium tuberculosis, através da baciloscopia (pesquisa de BAAR) no escarro."
    },
    {
        question: "Paciente de 48 anos, obeso, refere roncos altos, pausas respiratórias durante o sono e sonolência diurna excessiva. Qual o exame padrão-ouro para o diagnóstico da Síndrome da Apneia Obstrutiva do Sono (SAOS)?",
        options: ["Eletroencefalograma.", "Polissonografia.", "Tomografia de seios da face.", "Oximetria noturna.", "Escala de sonolência de Epworth."],
        correctAnswer: "Polissonografia.",
        explanation: "A polissonografia é o exame padrão-ouro para o diagnóstico de SAOS. Ele monitora diversas variáveis fisiológicas durante o sono (fluxo aéreo, esforço respiratório, saturação de oxigênio, estágios do sono), permitindo a confirmação e a quantificação da gravidade do distúrbio."
    },
    {
        question: "Um paciente com história de tabagismo pesado apresenta baqueteamento digital e dor em ossos longos. A radiografia mostra reação periosteal. Suspeita-se de osteoartropatia hipertrófica. Qual tipo de câncer de pulmão está mais associado a esta síndrome?",
        options: ["Carcinoma de pequenas células.", "Adenocarcinoma.", "Carcinoma de grandes células.", "Carcinoma epidermoide.", "Tumor carcinoide."],
        correctAnswer: "Adenocarcinoma.",
        explanation: "A osteoartropatia hipertrófica é uma síndrome paraneoplásica classicamente associada aos cânceres de pulmão de não pequenas células, sendo o adenocarcinoma o tipo histológico mais frequentemente implicado."
    },
    {
        question: "Paciente HIV positivo, com contagem de T-CD4 de 80 células/mm³, apresenta dispneia progressiva e tosse seca. A radiografia de tórax revela infiltrado intersticial difuso bilateral. A LDH sérica está muito elevada. Qual é o agente etiológico mais provável?",
        options: ["Streptococcus pneumoniae.", "Mycobacterium tuberculosis.", "Pneumocystis jirovecii.", "Cryptococcus neoformans.", "Citomegalovírus."],
        correctAnswer: "Pneumocystis jirovecii.",
        explanation: "Em um paciente com Aids e imunossupressão grave (CD4 < 200), a pneumonia com infiltrado intersticial bilateral e LDH elevado é a apresentação típica da pneumonia por Pneumocystis jirovecii (PCP)."
    },
    {
        question: "A análise do líquido pleural de um derrame parapneumônico revelou pH de 7.10, glicose de 30 mg/dL e bacteriologia positiva. Qual é a conduta indicada?",
        options: ["Manter apenas a antibioticoterapia sistêmica.", "Realizar toracocentese de alívio diária.", "Indicar a drenagem torácica em selo d'água.", "Instilar fibrinolítico no espaço pleural.", "Acompanhar com radiografias seriadas."],
        correctAnswer: "Indicar a drenagem torácica em selo d'água.",
        explanation: "A presença de pH < 7.20, glicose < 60 mg/dL ou a identificação de bactérias (Gram ou cultura) no líquido pleural classifica o derrame como complicado ou empiema, sendo mandatória a drenagem torácica em selo d'água, além da antibioticoterapia sistêmica."
    },
    {
        question: "Uma mulher de 65 anos, não tabagista, apresenta dispneia aos esforços e tosse seca há 2 anos. A ausculta pulmonar revela estertores crepitantes finos ('em velcro') bibasais. A tomografia de tórax mostra faveolamento e bronquiectasias de tração. Qual o diagnóstico?",
        options: ["Pneumonite de hipersensibilidade crônica.", "Sarcoidose.", "Fibrose pulmonar idiopática.", "Bronquiolite obliterante com pneumonia em organização (BOOP).", "Asma."],
        correctAnswer: "Fibrose pulmonar idiopática.",
        explanation: "A combinação de estertores em velcro, idade avançada e o padrão tomográfico de pneumonia intersticial usual (faveolamento, predomínio basal e periférico) são característicos da Fibrose Pulmonar Idiopática."
    },
    {
        question: "Paciente com DPOC grave dá entrada na emergência com sonolência e acidose respiratória (pH 7.25, PaCO2 70 mmHg). Após tratamento inicial, permanece sonolento. Qual a próxima conduta?",
        options: ["Aumentar a FiO2 para 50%.", "Iniciar ventilação não invasiva (VNI) com dois níveis de pressão (BIPAP).", "Realizar intubação orotraqueal e ventilação mecânica invasiva.", "Administrar bicarbonato de sódio.", "Iniciar antibioticoterapia."],
        correctAnswer: "Iniciar ventilação não invasiva (VNI) com dois níveis de pressão (BIPAP).",
        explanation: "A ventilação não invasiva é a terapia de primeira linha para pacientes com exacerbação de DPOC e acidose respiratória hipercápnica que não respondem ao tratamento clínico inicial. Ela ajuda a diminuir o trabalho respiratório, corrigir a hipercapnia e evitar a intubação."
    },
    {
        question: "Uma mulher de 68 anos, pesando 60 kg, apresenta creatinina sérica de 2,8 mg/dL. Utilizando a fórmula de Cockcroft-Gault, qual é a TFG estimada e o estágio da DRC?",
        options: ["TFG ~45 mL/min; Estágio 3a.", "TFG ~18 mL/min; Estágio 4.", "TFG ~65 mL/min; Estágio 2.", "TFG ~10 mL/min; Estágio 5.", "TFG ~35 mL/min; Estágio 3b."],
        correctAnswer: "TFG ~18 mL/min; Estágio 4.",
        explanation: "Cálculo: [(140 - 68) * 60] / (72 * 2.8) * 0.85 = [72 * 60] / 201.6 * 0.85 = 4320 / 201.6 * 0.85 = 21.42 * 0.85 -^ 18.2 mL/min. Uma TFG entre 15-29 mL/min classifica a DRC como Estágio 4."
    },
    {
        question: "Paciente no 2º dia de pós-operatório de tireoidectomia total refere parestesia perioral e em extremidades. Apresenta sinal de Chvostek positivo. Qual o distúrbio eletrolítico mais provável?",
        options: ["Hipocalemia.", "Hipercalemia.", "Hipocalcemia.", "Hipomagnesemia.", "Hiperfosfatemia."],
        correctAnswer: "Hipocalcemia.",
        explanation: "A hipocalcemia é uma complicação comum da tireoidectomia total devido à remoção ou desvascularização inadvertida das glândulas paratireoides, levando à hiperexcitabilidade neuromuscular (parestesias, tetania, sinais de Chvostek e Trousseau)."
    },
    {
        question: "Diabético com DRC em uso de IECA apresenta potássio de 6,2 mEq/L, sem alterações no ECG. Qual a conduta inicial mais adequada?",
        options: ["Suspender o IECA, prescrever diurético de alça e resina de troca iônica.", "Administrar gluconato de cálcio endovenoso.", "Indicar hemodiálise de urgência.", "Administrar solução polarizante (glico-insulina).", "Apenas orientar dieta pobre em potássio."],
        correctAnswer: "Suspender o IECA, prescrever diurético de alça e resina de troca iônica.",
        explanation: "Na hipercalemia leve a moderada (K < 6.5 mEq/L) sem alterações eletrocardiográficas, o manejo inicial consiste em remover as causas (suspender o IECA), aumentar a excreção de potássio (diuréticos de alça, resinas de troca) e restringir a ingestão dietética."
    },
    {
        question: "Paciente com insuficiência cardíaca em uso de furosemida apresenta cãibras e hipocalemia. Qual medicação, se associada, poderia ter prevenido este efeito adverso?",
        options: ["Hidroclorotiazida.", "Anlodipino.", "Espironolactona.", "Manitol.", "Propranolol."],
        correctAnswer: "Espironolactona.",
        explanation: "A espironolactona é um diurético poupador de potássio. Sua associação com um diurético de alça como a furosemida (que aumenta a excreção de potássio) é uma estratégia comum para manter a normocalemia e potencializar o efeito diurético."
    },
    {
        question: "Um paciente etilista crônico internado desenvolve taquicardia ventricular do tipo 'torsades de pointes'. Seus exames revelam hipocalemia refrátária. Qual outro distúrbio eletrolítico deve ser investigado e corrigido?",
        options: ["Hiponatremia.", "Hipocalcemia.", "Hipofosfatemia.", "Hipomagnesemia.", "Hipercloremia."],
        correctAnswer: "Hipomagnesemia.",
        explanation: "A hipomagnesemia é comum em etilistas e pode causar hipocalemia refrátária (impede a correção do potássio) e prolongamento do intervalo QT, predispondo a arritmias como 'torsades de pointes'. A correção do magnésio é fundamental."
    },
    {
        question: "Paciente com tumor de pequenas células do pulmão, hiponatremia, euvolemia e urina concentrada. Qual o diagnóstico?",
        options: ["Diabetes insipidus nefrogênico.", "Síndrome cerebral perdedora de sal.", "Síndrome da secreção inapropriada do hormônio antidiurético (SIADH).", "Insuficiência adrenal.", "Polidipsia psicogênica."],
        correctAnswer: "Síndrome da secreção inapropriada do hormônio antidiurético (SIADH).",
        explanation: "A combinação de hiponatremia, euvolemia, baixa osmolaridade sérica e urina inapropriadamente concentrada (alta osmolaridade urinária e sódio urinário elevado) em um paciente com câncer de pequenas células de pulmão é a apresentação clássica da SIADH paraneoplásica."
    },
    {
        question: "Homem com vômitos persistentes apresenta gasometria com pH 7.55, PaCO2 48 mmHg e HCO3 38 mEq/L. Qual o tratamento fundamental para a correção deste distúrbio?",
        options: ["Reposição de bicarbonato.", "Administração de acetazolamida.", "Infusão de solução salina isotônica (0,9%) com reposição de potássio.", "Ventilação não invasiva para reter CO2.", "Inibidor de bomba de prótons."],
        correctAnswer: "Infusão de solução salina isotônica (0,9%) com reposição de potássio.",
        explanation: "O paciente apresenta alcalose metabólica hipoclorêmica e hipocalêmica. A perda de ácido clorídrico e a contração volêmica perpetuam a alcalose. O tratamento consiste na reposição de volume, cloreto e potássio com solução salina isotônica."
    },
    {
        question: "Idosa com diarreia aguda, desidratada, com Ureia = 150 mg/dL e Creatinina = 3.0 mg/dL (basal 1.0). A relação Ureia/Creatinina > 40 e o sódio urinário é baixo. Qual o tipo da lesão renal aguda?",
        options: ["Pós-renal, por obstrução.", "Intrarrenal, por necrose tubular aguda.", "Pré-renal, por hipovolemia.", "Intrarrenal, por nefrite intersticial.", "Síndrome cardiorrenal."],
        correctAnswer: "Pré-renal, por hipovolemia.",
        explanation: "A desidratação leva à hipoperfusão renal, causando uma lesão renal aguda pré-renal. Isso é caracterizado por oligúria, aumento desproporcional da ureia em relação à creatinina (Ur/Cr > 40) e um sódio urinário baixo (< 20 mEq/L) devido à ávida reabsorção renal de sódio e água."
    },
    {
        question: "Paciente com hematúria e rápida deterioração da função renal. A biópsia renal revela a presença de crescentes na maioria dos glomérulos. Qual o tratamento de indução de escolha?",
        options: ["Apenas inibidores da ECA.", "Prednisona em monoterapia.", "Pulsoterapia com metilprednisolona e ciclofosfamida.", "Plasmaférese isolada.", "Diuréticos e controle pressórico."],
        correctAnswer: "Pulsoterapia com metilprednisolona e ciclofosfamida.",
        explanation: "A glomerulonefrite rapidamente progressiva (GNRP), caracterizada por crescentes na biópsia, é uma emergência nefrológica. O tratamento de indução é agressivo, geralmente com pulsoterapia de corticoide associada a um imunossupressor como a ciclofosfamida (ou rituximabe)."
    },
    {
        question: "Para um paciente com DM tipo 2, quando se deve iniciar o rastreamento de microalbuminúria e qual a principal classe de fármaco para nefroproteção?",
        options: ["5 anos após o diagnóstico; bloqueadores de cálcio.", "No momento do diagnóstico; IECA ou BRA.", "Apenas se a creatinina estiver elevada; betabloqueadores.", "No momento do diagnóstico; diuréticos tiazídicos.", "10 anos após o diagnóstico; estatinas."],
        correctAnswer: "No momento do diagnóstico; IECA ou BRA.",
        explanation: "O rastreamento de nefropatia diabética com a pesquisa de albumina na urina deve ser iniciado no momento do diagnóstico de DM tipo 2. Caso a microalbuminúria seja detectada, os inibidores da ECA (IECA) ou bloqueadores do receptor de angiotensina (BRA) são as drogas de escolha para nefroproteção."
    },
    {
        question: "Um jovem de 18 anos desenvolve hematúria macroscópica 5 dias após um episódio de faringoamigdalite. Os níveis do complemento sérico estão normais. Qual o diagnóstico mais provável?",
        options: ["Glomerulonefrite pós-estreptocócica.", "Nefropatia por IgA (Doença de Berger).", "Síndrome de Alport.", "Glomeruloesclerose segmentar e focal.", "Nefrite lúpica."],
        correctAnswer: "Nefropatia por IgA (Doença de Berger).",
        explanation: "A hematúria macroscópica que ocorre de forma sincrônica ou poucos dias após uma infecção de via aérea superior, associada a níveis normais de complemento, é a apresentação clássica da Nefropatia por IgA, a glomerulonefrite primária mais comum no mundo."
    },
    {
        question: "Paciente com DRC estágio 4 apresenta hemoglobina de 9,5 g/dL. A saturação de transferrina é de 15% e a ferritina de 80 ng/mL. Qual a conduta inicial para o tratamento da anemia?",
        options: ["Iniciar eritropoetina recombinante (EPO).", "Realizar transfusão de concentrado de hemácias.", "Repor ferro por via endovenosa.", "Iniciar reposição de Vitamina B12 e folato.", "Apenas observar."],
        correctAnswer: "Repor ferro por via endovenosa.",
        explanation: "Antes de iniciar agentes estimuladores da eritropoese (EPO), é fundamental garantir que os estoques de ferro estejam adequados. Saturação de transferrina < 20% e ferritina < 100 ng/mL indicam deficiência de ferro, que deve ser corrigida primeiro, preferencialmente com ferro endovenoso em pacientes com DRC avançada."
    },
    {
        question: "Paciente em tratamento com lítio é admitido com ataxia e confusão mental. A litemia é de 3.8 mEq/L. Qual é a terapia de escolha para remover o lítio?",
        options: ["Diurese forçada com soro fisiológico.", "Hemodiálise.", "Carvão ativado.", "Lavagem gástrica.", "Poliestirenossulfonato de cálcio."],
        correctAnswer: "Hemodiálise.",
        explanation: "O lítio é uma molécula pequena, não ligada a proteínas e com baixo volume de distribuição, tornando-o idealmente removível por hemodiálise. A diálise está indicada em intoxicações graves (sintomas neurológicos, litemia > 2.5-3.0 mEq/L) para acelerar sua eliminação."
    },
    {
        question: "Paciente é encontrado desacordado. Gasometria: pH 7.15, PaCO2 20 mmHg, HCO3 8 mEq/L. Eletrólitos: Na 140, Cl 102. Qual intoxicação é uma causa clássica deste distúrbio?",
        options: ["Benzodiazepínicos.", "Metanol.", "Opioides.", "Digoxina.", "Paracetamol."],
        correctAnswer: "Metanol.",
        explanation: "O paciente apresenta uma acidose metabólica com ânion-gap elevado [140 - (102 + 8) = 30]. Intoxicações por certas substâncias, como Metanol, Uremia, Cetoacidose Diabética, Paracetamol, Isoniazida/Ferro, Lactato, Etilenoglicol, Salicilatos (MUDPILES) causam este tipo de distúrbio."
    },
    {
        question: "Um atleta de maratona é hospitalizado com mialgia intensa e urina escura. Os exames mostram CPK de 50.000 U/L. Qual é a principal medida para prevenir a insuficiência renal aguda?",
        options: ["Restrição hídrica rigorosa.", "Administração de AINEs.", "Hidratação endovenosa vigorosa com solução salina.", "Administração de gluconato de cálcio.", "Alcalinização da urina com manitol."],
        correctAnswer: "Hidratação endovenosa vigorosa com solução salina.",
        explanation: "Na rabdomiólise, a lesão renal aguda ocorre pela deposição de mioglobina nos túbulos renais. A medida mais importante para a prevenção é a hidratação endovenosa vigorosa para aumentar o fluxo urinário, diluir a mioglobina e 'lavar' os túbulos, prevenindo a obstrução."
    },
    {
        question: "Um paciente etilista é admitido com hematêmese, ascite moderada, icterícia (Bilirrubina 4,5 mg/dL), encefalopatia grau II, INR de 2,0 e albumina de 2,5 g/dL. Qual a sua classificação de Child-Pugh?",
        options: ["Child-Pugh A.", "Child-Pugh B.", "Child-Pugh C.", "Não é possível classificar.", "MELD 15."],
        correctAnswer: "Child-Pugh C.",
        explanation: "Pontuação: Ascite (2), Encefalopatia (2), Bilirrubina > 3 (3), Albumina < 2.8 (3), INR 1.7-2.2 (2). Total: 2+2+3+3+2 = 12 pontos. Uma pontuação de 10-15 corresponde à classe C de Child-Pugh, indicando doença hepática avançada."
    },
    {
        question: "Homem de 40 anos, etilista, apresenta dor epigástrica súbita, intensa, em faixa, irradiada para o dorso, com náuseas e vômitos. A amilase e lipase estão três vezes acima do limite superior da normalidade. Qual o diagnóstico?",
        options: ["slcera péptica perfurada.", "Colecistite aguda.", "Pancreatite aguda.", "Infarto agudo do miocárdio.", "Obstrução intestinal alta."],
        correctAnswer: "Pancreatite aguda.",
        explanation: "O diagnóstico de pancreatite aguda é feito com base em 2 de 3 critérios: 1) dor abdominal característica, 2) enzimas pancreáticas (amilase ou lipase) - 3 vezes o limite superior da normalidade, e 3) achados de imagem característicos. O paciente preenche os dois primeiros critérios."
    },
    {
        question: "Mulher de 45 anos, obesa, multípara, queixa-se de dor tipo cólica em hipocôndrio direito, com duração de 2 horas, iniciada após refeição gordurosa. O sinal de Murphy é negativo. Qual a principal hipótese diagnóstica?",
        options: ["Colecistite aguda.", "Cólica biliar.", "Pancreatite aguda.", "Doença do refluxo gastroesofágico.", "Hepatite aguda."],
        correctAnswer: "Cólica biliar.",
        explanation: "A dor transitória no hipocôndrio direito relacionada à ingestão de alimentos gordurosos, em uma paciente com fatores de risco para colelitíase ('4 Fs': female, forty, fat, fertile), é característica da cólica biliar (obstrução transitória do ducto cístico). A ausência do sinal de Murphy afasta a colecistite aguda."
    },
    {
        question: "Paciente cirrótico com ascite é admitido com febre e dor abdominal. A paracentese diagnóstica revela contagem de polimorfonucleares (PMN) de 450 células/mm³ no líquido ascítico. Qual a conduta terapêutica imediata?",
        options: ["Aguardar a cultura do líquido ascítico.", "Iniciar antibioticoterapia empírica com uma cefalosporina de terceira geração.", "Realizar laparotomia exploradora.", "Iniciar diuréticos.", "Indicar paracentese de grande volume."],
        correctAnswer: "Iniciar antibioticoterapia empírica com uma cefalosporina de terceira geração.",
        explanation: "Uma contagem de neutrófilos - 250 células/mm³ no líquido ascítico é diagnóstica de Peritonite Bacteriana Espontânea (PBE). O tratamento com antibióticos (ex: ceftriaxona) deve ser iniciado imediatamente, sem aguardar o resultado da cultura."
    },
    {
        question: "Jovem de 22 anos apresenta diarreia crônica não sanguinolenta, dor em fossa ilíaca direita e perda de peso. A colonoscopia revela inflamação salteada, com úlceras aftoides e aspecto de 'pedra de calçamento' no íleo terminal e cólon. Qual o diagnóstico?",
        options: ["Retocolite Ulcerativa.", "Doença de Crohn.", "Síndrome do intestino irritável.", "Doença celíaca.", "Colite infecciosa."],
        correctAnswer: "Doença de Crohn.",
        explanation: "As características como acometimento do íleo terminal, inflamação transmural e salteada (áreas sadias entre áreas doentes) e o aspecto de 'pedra de calçamento' são achados endoscópicos clássicos da Doença de Crohn."
    },
    {
        question: "Paciente com icterícia, colúria e acolia fecal. A ultrassonografia mostra dilatação do colédoco com cálculo em sua porção distal. Qual o procedimento de escolha para tratamento?",
        options: ["Coledocotomia por laparotomia.", "Colecistectomia videolaparoscópica isolada.", "Colangiopancreatografia retrógrada endoscópica (CPRE) com papilotomia.", "Drenagem biliar percutânea.", "Tratamento conservador."],
        correctAnswer: "Colangiopancreatografia retrógrada endoscópica (CPRE) com papilotomia.",
        explanation: "O quadro é de icterícia obstrutiva por coledocolitíase. A CPRE é o procedimento de escolha pois é diagnóstica e terapêutica, permitindo a remoção do cálculo do colédoco através da papilotomia endoscópica."
    },
    {
        question: "Paciente com pancreatite aguda apresenta na admissão: 60 anos, leucocitose de 18.000/mm³, glicemia de 250 mg/dL, LDH de 400 U/L e AST de 300 U/L. Qual a pontuação pelos critérios de Ranson na admissão?",
        options: ["2 pontos.", "3 pontos.", "4 pontos.", "5 pontos.", "Não é possível calcular na admissão."],
        correctAnswer: "5 pontos.",
        explanation: "Os critérios de Ranson na admissão são: Idade > 55, Leucócitos > 16.000, Glicemia > 200, LDH > 350, TGO/AST > 250. O paciente preenche todos os 5 critérios, indicando um prognóstico de pancreatite aguda grave."
    },
    {
        question: "Qual das seguintes opções NfO é um tratamento para ascite refrátária em paciente cirrótico?",
        options: ["Paracenteses de grande volume seriadas.", "Instalação de um TIPS (shunt portossistêmico).", "Aumento da dose de furosemida para 200 mg/dia.", "Transplante hepático.", "Restrição de sódio na dieta."],
        correctAnswer: "Aumento da dose de furosemida para 200 mg/dia.",
        explanation: "A dose máxima recomendada de furosemida no manejo da ascite é de 160 mg/dia. Doses superiores não aumentam a eficácia e elevam o risco de efeitos adversos. As outras opções são terapias válidas para ascite refrátária."
    },
    {
        question: "Mulher de 40 anos refere disfagia para sólidos e líquidos e regurgitação. O esofagograma baritado mostra dilatação do esôfago com afilamento distal, em 'bico de pássaro'. Qual o diagnóstico mais provável?",
        options: ["Câncer de esôfago.", "Esofagite eosinofílica.", "Acalasia.", "Espasmo esofagiano difuso.", "Esclerodermia."],
        correctAnswer: "Acalasia.",
        explanation: "A disfagia para sólidos e líquidos, associada à imagem radiológica de dilatação esofágica a montante com um estreitamento afilado no esfíncter esofagiano inferior (imagem em 'bico de pássaro' ou 'ponta de lápis'), é a apresentação clássica da acalasia."
    },
    {
        question: "Idoso de 75 anos, estável hemodinamicamente, é internado por enterorragia. Após estabilização inicial, qual o exame de escolha para investigar a causa do sangramento?",
        options: ["Endoscopia digestiva alta.", "Colonoscopia.", "Tomografia computadorizada de abdome.", "Arteriografia mesenterérica.", "Cápsula endoscópica."],
        correctAnswer: "Colonoscopia.",
        explanation: "Em um paciente estável com hemorragia digestiva baixa, a colonoscopia é o exame de primeira linha. Ela permite a visualização direta da mucosa colônica, a identificação da fonte do sangramento (ex: divertículos, angiodisplasias, tumores) e, em muitos casos, a realização de hemostasia terapêutica."
    },
    {
        question: "Uma paciente com diagnóstico de doença celíaca, além da diarreia e distensão abdominal, pode apresentar qual das seguintes manifestações extraintestinais?",
        options: ["Artrite de grandes articulações.", "Dermatite herpetiforme.", "Uveíte anterior.", "Pioderma gangrenoso.", "Eritema nodoso."],
        correctAnswer: "Dermatite herpetiforme.",
        explanation: "A dermatite herpetiforme é uma manifestação cutânea patognomônica da doença celíaca. Caracteriza-se por lesões papulovesiculares, intensamente pruriginosas, que surgem simetricamente em superfícies extensoras como cotovelos e joelhos."
    },
    {
        question: "Mulher jovem com elevação de transaminases, hipergamaglobulinemia e anticorpo antimúsculo liso (FAN-AML) positivo. Qual o tratamento de primeira linha?",
        options: ["Ácido ursodesoxicólico.", "Prednisona e azatioprina.", "Interferon peguilado.", "Penicilamina.", "Transplante hepático."],
        correctAnswer: "Prednisona e azatioprina.",
        explanation: "O quadro clínico e laboratorial é típico de Hepatite Autoimune tipo 1. O tratamento de primeira linha visa a indução da remissão com corticosteroides (prednisona), geralmente associados a um agente poupador de corticoide (azatioprina) para a manutenção."
    },
    {
        question: "Qual dos seguintes é um fator precipitante comum para a encefalopatia hepática em um paciente cirrótico?",
        options: ["Dieta pobre em proteínas.", "Uso de diuréticos de alça.", "Infecção (ex: PBE).", "Hipoglicemia.", "Uso de propranolol."],
        correctAnswer: "Infecção (ex: PBE).",
        explanation: "Fatores precipitantes comuns para a encefalopatia hepática incluem: hemorragia digestiva, constipação, uso de sedativos, distúrbios hidroeletrolíticos e, muito frequentemente, infecções, como a peritonite bacteriana espontânea (PBE)."
    },
    {
        question: "Homem com pirose crônica realiza endoscopia que evidencia Esôfago de Barrett sem displasia. Qual a conduta recomendada?",
        options: ["Esofagectomia.", "Tratamento com IBP e erradicação do H. pylori.", "Acompanhamento endoscópico a cada 3-5 anos.", "Ablação por radiofrequência.", "Alta, pois não há displasia."],
        correctAnswer: "Acompanhamento endoscópico a cada 3-5 anos.",
        explanation: "O Esôfago de Barrett é uma lesão pré-maligna para o adenocarcinoma de esôfago. Na ausência de displasia, a conduta consiste no tratamento clínico do refluxo com IBP e na vigilância endoscópica periódica (a cada 3-5 anos) para detectar o surgimento de displasia."
    },
    {
        question: "Paciente assintomático apresenta elevação isolada de fosfatase alcalina (FA) e gama-glutamil transferase (GGT). Qual a primeira etapa na investigação diagnóstica?",
        options: ["Realizar uma ultrassonografia de abdome para avaliar as vias biliares.", "Solicitar dosagem de anticorpo antimitocôndria (AMA).", "Realizar uma colangiorressonância.", "Proceder com biópsia hepática.", "Repetir os exames em 6 meses."],
        correctAnswer: "Realizar uma ultrassonografia de abdome para avaliar as vias biliares.",
        explanation: "A elevação de FA e GGT indica um padrão colestático. O primeiro passo é diferenciar entre uma causa intra-hepática e extra-hepática (obstrutiva). A ultrassonografia de abdome é um método não invasivo e eficaz para avaliar a presença de dilatação das vias biliares, sugerindo uma obstrução."
    },
    {
        question: "Jovem de 24 anos acorda com incapacidade de fechar o olho esquerdo, desvio da comissura labial para a direita e ausência de rugas na fronte esquerda. Qual o diagnóstico e tratamento?",
        options: ["Acidente vascular cerebral; trombólise.", "Paralisia de Bell; prednisona.", "Miastenia gravis; piridostigmina.", "Esclerose múltipla; pulsoterapia.", "Tumor de ângulo ponto-cerebelar; ressonância."],
        correctAnswer: "Paralisia de Bell; prednisona.",
        explanation: "O quadro de paralisia facial periférica (acometendo toda a hemiface, incluindo a fronte) de instalação súbita e idiopática é denominado Paralisia de Bell. O tratamento de escolha é a corticoterapia (prednisona) para reduzir a inflamação do nervo facial."
    },
    {
        question: "Idoso de 70 anos apresenta lentidão de movimentos, tremor que piora em repouso na mão direita e rigidez plástica (em roda dentada). Qual a principal hipótese diagnóstica?",
        options: ["Doença de Alzheimer.", "Tremor essencial.", "Doença de Parkinson.", "Coréia de Huntington.", "Hidrocefalia de pressão normal."],
        correctAnswer: "Doença de Parkinson.",
        explanation: "A tríade de tremor de repouso, bradicinesia (lentidão de movimentos) e rigidez plástica são os sinais cardinais da Doença de Parkinson, uma doença neurodegenerativa que afeta os núcleos da base."
    },
    {
        question: "Paciente de 65 anos chega à emergência com início súbito de fraqueza no lado direito e dificuldade para falar há 2 horas. A TC de crânio não mostra sangramento. Qual a conduta?",
        options: ["Está fora da janela terapêutica.", "A trombólise com alteplase (rt-PA) está indicada.", "Aguardar 24 horas para iniciar aspirina.", "A trombectomia mecânica é a primeira escolha.", "A afasia contraindica a trombólise."],
        correctAnswer: "A trombólise com alteplase (rt-PA) está indicada.",
        explanation: "O paciente apresenta um AVC isquêmico agudo com tempo de evolução conhecido de 2 horas. Estando dentro da janela terapêutica de 4,5 horas e sem contraindicações (como hemorragia na TC), ele é um candidato à trombólise endovenosa com rt-PA."
    },
    {
        question: "Jovem de 20 anos apresenta febre alta, cefaleia intensa, vômitos, fotofobia e rigidez de nuca. Qual o exame essencial para confirmar a suspeita de meningite bacteriana?",
        options: ["Tomografia de crânio.", "Hemocultura.", "Análise do líquido cefalorraquidiano (LCR) por punção lombar.", "Eletroencefalograma.", "Ressonância magnética de encéfalo."],
        correctAnswer: "Análise do líquido cefalorraquidiano (LCR) por punção lombar.",
        explanation: "O quadro clínico é altamente sugestivo de meningite. O exame padrão-ouro para o diagnóstico é a análise do LCR, obtido por punção lombar, que permite a contagem de células, dosagem de proteínas e glicose, e a identificação do agente etiológico."
    },
    {
        question: "Um paciente inicia uma crise convulsiva tônico-clônica generalizada que não cessa após 5 minutos. Qual o diagnóstico e a droga de primeira escolha para o tratamento imediato?",
        options: ["Crise de ausência; etossuximida.", "Estado de mal epiléptico; benzodiazepínico endovenoso.", "Crise parcial complexa; carbamazepina.", "Síncope convulsiva; manobras de contrapressão.", "Estado de mal epiléptico; fenitoína endovenosa."],
        correctAnswer: "Estado de mal epiléptico; benzodiazepínico endovenoso.",
        explanation: "Uma crise convulsiva que dura mais de 5 minutos é definida como estado de mal epiléptico. A droga de primeira linha para a interrupção da crise é um benzodiazepínico de ação rápida por via endovenosa, como diazepam ou lorazepam."
    },
    {
        question: "Mulher de 30 anos queixa-se de visão dupla e pálpebras caídas que pioram no final do dia e melhoram com o repouso. Qual o teste diagnóstico mais específico?",
        options: ["Punção lombar.", "Eletroneuromiografia com teste de estimulação repetitiva.", "Dosagem de creatinoquinase (CPK).", "Biópsia muscular.", "Ressonância magnética de crânio."],
        correctAnswer: "Eletroneuromiografia com teste de estimulação repetitiva.",
        explanation: "O quadro de fraqueza flutuante, que piora com o uso da musculatura e melhora com o repouso, é característico da Miastenia Gravis. O teste de estimulação nervosa repetitiva na eletroneuromiografia, que mostra um decremento na amplitude do potencial de ação, é um exame confirmatório."
    },
    {
        question: "Duas semanas após um quadro de gastroenterite, um paciente desenvolve fraqueza simétrica e ascendente nos membros inferiores, com arreflexia. Qual o diagnóstico mais provável?",
        options: ["Esclerose lateral amiotrófica.", "Miastenia gravis.", "Síndrome de Guillain-Barré.", "Poliomielite.", "Mielite transversa."],
        correctAnswer: "Síndrome de Guillain-Barré.",
        explanation: "A Síndrome de Guillain-Barré é uma polirradiculoneuropatia desmielinizante aguda, frequentemente precedida por uma infecção. Caracteriza-se por uma paralisia flácida, ascendente, simétrica e com arreflexia."
    },
    {
        question: "Um paciente apresenta perda de memória progressiva e insidiosa. Outro, com múltiplos fatores de risco cardiovascular, apresenta um declínio cognitivo 'em degraus'. As descrições correspondem, respectivamente, a:",
        options: ["Demência Vascular e Doença de Alzheimer.", "Doença de Alzheimer e Demência Vascular.", "Demência frontotemporal e Demência com corpos de Lewy.", "Doença de Creutzfeldt-Jakob e Doença de Alzheimer.", "Demência com corpos de Lewy e Demência Vascular."],
        correctAnswer: "Doença de Alzheimer e Demência Vascular.",
        explanation: "A Doença de Alzheimer classicamente se apresenta com um declínio cognitivo lento, progressivo e insidioso, com a memória sendo afetada precocemente. A Demência Vascular está associada a eventos cerebrovasculares e tem uma progressão 'em degraus', com piora súbita a cada novo evento."
    },
    {
        question: "Paciente refere o início súbito da 'pior cefaleia da vida', atingindo intensidade máxima em menos de um minuto. Qual é a principal hipótese a ser descartada e o primeiro exame a ser solicitado?",
        options: ["Enxaqueca com aura; ressonância magnética.", "Arterite temporal; biópsia de artéria.", "Hemorragia subaracnoide; tomografia de crânio sem contraste.", "Meningite; punção lombar.", "Trombose venosa cerebral; angiorressonância."],
        correctAnswer: "Hemorragia subaracnoide; tomografia de crânio sem contraste.",
        explanation: "A cefaleia em trovoada ('thunderclap headache') é a apresentação clássica da hemorragia subaracnoide (HSA), geralmente por ruptura de um aneurisma cerebral. A tomografia de crânio sem contraste é o primeiro exame a ser realizado para detectar o sangramento."
    },
    {
        question: "Paciente tabagista apresenta fraqueza muscular proximal que melhora com o esforço repetido e boca seca. A eletroneuromiografia mostra incremento na amplitude do potencial de ação após estimulação repetitiva. Esta síndrome está mais associada a qual neoplasia?",
        options: ["Adenocarcinoma de cólon.", "Câncer de próstata.", "Carcinoma de pequenas células de pulmão.", "Melanoma.", "Linfoma de Hodgkin."],
        correctAnswer: "Carcinoma de pequenas células de pulmão.",
        explanation: "Esta é a apresentação da Síndrome Miastênica de Lambert-Eaton, um distúrbio da junção neuromuscular pré-sináptica. - uma síndrome paraneoplásica fortemente associada ao carcinoma de pequenas células de pulmão."
    },
    {
        question: "Paciente em tratamento de sífilis apresenta febre, calafrios e cefaleia horas após a primeira dose de penicilina. Qual o nome desta reação e qual a conduta?",
        options: ["Anafilaxia; adrenalina.", "Reação de Jarisch-Herxheimer; tratamento sintomático e manutenção da penicilina.", "Doença do soro; suspender penicilina.", "Síndrome de Stevens-Johnson; suspensão do tratamento.", "Eritema polimorfo; trocar antibiótico."],
        correctAnswer: "Reação de Jarisch-Herxheimer; tratamento sintomático e manutenção da penicilina.",
        explanation: "A Reação de Jarisch-Herxheimer é uma reação inflamatória aguda que ocorre após o início do tratamento de doenças espiroquetálicas, como a sífilis. - causada pela lise maciça dos microrganismos. A conduta é expectante, com sintomáticos, e o tratamento com penicilina não deve ser interrompido."
    },
    {
        question: "A baciloscopia de um esfregaço de lesão de pele, utilizando a coloração de Ziehl-Neelsen, é um método diagnóstico para qual doença dermatoneurológica?",
        options: ["Leishmaniose tegumentar.", "Hanseníase.", "Esporotricose.", "Cromomicose.", "Sífilis terciária."],
        correctAnswer: "Hanseníase.",
        explanation: "O Mycobacterium leprae, agente etiológico da hanseníase, é um bacilo álcool-ácido resistente (BAAR), que pode ser visualizado em esfregaços de lesões cutâneas ou de linfa através da coloração de Ziehl-Neelsen."
    },
    {
        question: "Um homem de 65 anos com pneumonia evolui com hipotensão, confusão mental e oligúria. De acordo com o Surviving Sepsis Campaign, qual é uma medida prioritária na primeira hora de manejo?",
        options: ["Administrar corticoide em dose de estresse.", "Coletar lactato arterial.", "Iniciar vasopressor (norepinefrina).", "Realizar transfusão de hemácias.", "Todas as alternativas são medidas prioritárias da primeira hora."],
        correctAnswer: "Todas as alternativas são medidas prioritárias da primeira hora.",
        explanation: "O 'bundle' da primeira hora da sepse inclui: medir o lactato, obter hemoculturas antes de iniciar os antibióticos, administrar antibióticos de amplo espectro, iniciar a ressuscitação volêmica com 30 mL/kg de cristaloide para hipotensão e iniciar vasopressores se a hipotensão persistir."
    },
    {
        question: "Adolescente com febre, faringite e linfadenopatia generalizada desenvolve um exantema maculopapular difuso após uso de amoxicilina. O hemograma mostra linfocitose com atipia. Qual o agente etiológico mais provável?",
        options: ["Streptococcus pyogenes.", "Vírus Epstein-Barr.", "Citomegalovírus.", "HIV (infecção aguda).", "Mycoplasma pneumoniae."],
        correctAnswer: "Vírus Epstein-Barr.",
        explanation: "Este é o quadro clássico da mononucleose infecciosa, causada pelo Vírus Epstein-Barr. O uso de aminopenicilinas (amoxicilina, ampicilina) nestes pacientes desencadeia um rash cutâneo característico em mais de 90% dos casos."
    },
    {
        question: "Viajante retorna de área endêmica com febre, cefaleia retro-orbitária, mialgia intensa e plaquetopenia. A prova do laço é positiva. Qual o diagnóstico mais provável?",
        options: ["Malária.", "Febre tifoide.", "Dengue.", "Leptospirose.", "Febre amarela."],
        correctAnswer: "Dengue.",
        explanation: "A combinação de febre alta, cefaleia retro-orbitária, mialgia ('febre quebra-ossos'), plaquetopenia e prova do laço positiva é altamente sugestiva de dengue."
    },
    {
        question: "Paciente sofreu uma mordedura profunda no braço por um cão de rua de comportamento agressivo, que fugiu. O paciente não tem histórico de vacinação antirrábica. Qual a conduta correta?",
        options: ["Apenas lavar o ferimento.", "Iniciar esquema de vacinação antirrábica e administrar imunoglobulina antirrábica.", "Administrar apenas a imunoglobulina antirrábica.", "Iniciar apenas o esquema de vacinação.", "Prescrever antibiótico e vacina antitetânica."],
        correctAnswer: "Iniciar esquema de vacinação antirrábica e administrar imunoglobulina antirrábica.",
        explanation: "Trata-se de uma exposição de alto risco (animal agressor, de rua, que não pode ser observado; ferimento profundo). Em pacientes não previamente imunizados, a profilaxia pós-exposição para raiva consiste na aplicação do soro (imunoglobulina) e no início do esquema vacinal completo."
    },
    {
        question: "Um usuário de drogas endovenosas é internado com febre e sopro cardíaco de início recente. O ecocardiograma mostra vegetação em valva tricúspide. Qual o agente etiológico mais comum?",
        options: ["Streptococcus viridans.", "Staphylococcus aureus.", "Enterococcus faecalis.", "Grupo HACEK.", "Candida albicans."],
        correctAnswer: "Staphylococcus aureus.",
        explanation: "Em usuários de drogas injetáveis, a endocardite infecciosa frequentemente acomete as câmaras cardíacas direitas (valva tricúspide) e o agente etiológico mais comum é o Staphylococcus aureus, proveniente da pele."
    },
    {
        question: "Paciente com otite média crônica apresenta cefaleia, febre e hemiparesia à direita. A TC de crânio com contraste revela uma lesão captante em anel no lobo temporal esquerdo. Qual o diagnóstico?",
        options: ["Tuberculoma.", "Neurotoxoplasmose.", "Glioblastoma multiforme.", "Abscesso cerebral.", "AVC isquêmico."],
        correctAnswer: "Abscesso cerebral.",
        explanation: "A otite média crônica é um fator de risco para a disseminação de infecções para o sistema nervoso central. A imagem de uma lesão com captação anelar de contraste, associada a febre e déficits neurológicos focais, é característica de um abscesso cerebral."
    },
    {
        question: "Paciente em quimioterapia apresenta febre de 38,8°C e contagem de neutrófilos de 350/mm³. Qual a conduta imediata?",
        options: ["Aguardar 24 horas e repetir o hemograma.", "Iniciar antitérmico e observar.", "Internar, coletar culturas e iniciar antibioticoterapia empírica com cobertura antipseudomonas.", "Realizar tomografia antes de iniciar antibiótico.", "Iniciar antifúngico empírico."],
        correctAnswer: "Internar, coletar culturas e iniciar antibioticoterapia empírica com cobertura antipseudomonas.",
        explanation: "Neutropenia febril (Neutrófilos < 500/mm³ + Febre) é uma emergência oncológica. A conduta imediata é a internação, coleta de culturas e início de antibioticoterapia empírica de amplo espectro com atividade contra Pseudomonas aeruginosa (ex: cefepime, piperacilina-tazobactam)."
    },
    {
        question: "Considerando um paciente adulto, hígido, que desenvolve um quadro de pneumonia adquirida na comunidade (PAC) e necessita de tratamento ambulatorial, qual é o agente etiológico bacteriano mais prevalente?",
        options: ["Haemophilus influenzae.", "Mycoplasma pneumoniae.", "Streptococcus pneumoniae.", "Legionella pneumophila.", "Staphylococcus aureus."],
        correctAnswer: "Streptococcus pneumoniae.",
        explanation: "O Streptococcus pneumoniae (pneumococo) continua sendo o agente bacteriano mais comum e importante causador de pneumonia adquirida na comunidade em todas as faixas etárias e cenários de tratamento."
    },
    {
        question: "Jovem com DM1 é trazido à emergência com dor abdominal, vômitos, hálito cetônico e respiração de Kussmaul. A glicemia é de 450 mg/dL. Qual o diagnóstico e o pilar inicial do tratamento, além da insulina?",
        options: ["Estado hiperosmolar hiperglicêmico; hidratação com solução hipotônica.", "Cetoacidose diabética; hidratação vigorosa com solução salina isotônica (0,9%).", "Hipoglicemia; administração de glicose.", "Gastroparesia diabética; uso de procinéticos.", "Acidose lática; infusão de bicarbonato."],
        correctAnswer: "Cetoacidose diabética; hidratação vigorosa com solução salina isotônica (0,9%).",
        explanation: "O quadro é clássico de cetoacidose diabética. O tratamento se baseia em três pilares: insulinoterapia, correção dos distúrbios hidroeletrolíticos e hidratação. A expansão volêmica vigorosa com solução salina isotônica é a primeira medida, visando corrigir a desidratação e melhorar a perfusão renal."
    },
    {
        question: "Idoso com DM2 é encontrado sonolento e desidratado. Glicemia de 800 mg/dL. Gasometria com pH 7.35, bicarbonato 25 mEq/L. A osmolaridade sérica está muito elevada. Qual o diagnóstico?",
        options: ["Cetoacidose diabética.", "Estado hiperosmolar hiperglicêmico.", "Acidente vascular cerebral.", "Sepse de foco urinário.", "Intoxicação por metformina."],
        correctAnswer: "Estado hiperosmolar hiperglicêmico.",
        explanation: "O diagnóstico de Estado Hiperosmolar Hiperglicêmico (EHH) é caracterizado por hiperglicemia extrema (>600 mg/dL), desidratação grave, osmolaridade sérica elevada (>320 mOsm/kg) e ausência de cetoacidose significativa (pH > 7.3, HCO3 > 18)."
    },
    {
        question: "Mulher de 35 anos queixa-se de perda de peso, palpitações, intolerância ao calor, exoftalmia e bócio difuso. Qual o diagnóstico mais provável?",
        options: ["Tireoidite de Hashimoto.", "Doença de Graves.", "Bócio multinodular tóxico.", "Adenoma tóxico.", "Tireoidite subaguda de De Quervain."],
        correctAnswer: "Doença de Graves.",
        explanation: "A combinação de hipertireoidismo (perda de peso, palpitações, intolerância ao calor) com manifestações extratireoidianas como oftalmopatia (exoftalmia) e bócio difuso é característica da Doença de Graves, uma doença autoimune causada por anticorpos estimuladores do receptor de TSH (TRAb)."
    },
    {
        question: "Paciente com obesidade central, hipertensão, estrias violáceas e fraqueza proximal. Qual é o primeiro passo na investigação da suspeita de Síndrome de Cushing?",
        options: ["Ressonância magnética de hipófise.", "Dosagem de cortisol salivar à meia-noite ou teste de supressão com 1 mg de dexametasona.", "Tomografia de adrenais.", "Dosagem de ACTH plasmático.", "Cateterismo de seios petrosos."],
        correctAnswer: "Dosagem de cortisol salivar à meia-noite ou teste de supressão com 1 mg de dexametasona.",
        explanation: "O primeiro passo na investigação de hipercortisolismo é confirmar a produção excessiva de cortisol. Isso é feito através de testes de rastreamento, como o teste de supressão com dexametasona em baixa dose ou a dosagem do cortisol livre urinário ou salivar noturno."
    },
    {
        question: "Paciente com hipertireoidismo não tratado desenvolve febre alta, taquicardia extrema e agitação psicomotora no pós-operatório. Qual o manejo inicial desta emergência?",
        options: ["Apenas hidratação e antitérmicos.", "Propiltiouracil ou metimazol em altas doses, solução de iodo, propranolol e hidrocortisona.", "Tireoidectomia de urgência.", "Terapia com iodo radioativo (I-131).", "Amiodarona para controle da taquicardia."],
        correctAnswer: "Propiltiouracil ou metimazol em altas doses, solução de iodo, propranolol e hidrocortisona.",
        explanation: "O quadro é de crise tireotóxica (tempestade tireoidiana). O manejo envolve múltiplas frentes: bloquear a síntese hormonal (tionamidas), bloquear a liberação de hormônios (iodo), controlar os sintomas adrenérgicos (propranolol), e administrar corticoide para reduzir a conversão periférica de T4 para T3."
    },
    {
        question: "Paciente apresenta fraqueza, hipotensão refrátária a volume, hiponatremia, hipercalemia e hiperpigmentação da pele e mucosas. Qual o diagnóstico mais provável?",
        options: ["Insuficiência adrenal primária (Doença de Addison).", "Insuficiência adrenal secundária.", "Hipotireoidismo primário.", "Pan-hipopituitarismo.", "Feocromocitoma."],
        correctAnswer: "Insuficiência adrenal primária (Doença de Addison).",
        explanation: "A insuficiência adrenal primária cursa com deficiência de glicocorticoides e mineralocorticoides. A deficiência de cortisol causa fraqueza e hipotensão. A hiperpigmentação ocorre pelo excesso de ACTH. A deficiência de aldosterona causa hiponatremia e hipercalemia."
    },
    {
        question: "Idosa com hipotireoidismo não tratado é encontrada com rebaixamento do nível de consciência, hipotermia e bradicardia. Qual o tratamento de escolha para o coma mixedematoso?",
        options: ["Reposição oral de levotiroxina.", "Aquecimento rápido com mantas térmicas.", "Administração endovenosa de levotiroxina (T4) e hidrocortisona.", "Infusão de dopamina.", "Ventilação não invasiva."],
        correctAnswer: "Administração endovenosa de levotiroxina (T4) e hidrocortisona.",
        explanation: "O coma mixedematoso é uma emergência endócrina. O tratamento consiste na reposição hormonal endovenosa (levotiroxina), associada a hidrocortisona (para tratar uma possível insuficiência adrenal associada) e medidas de suporte."
    },
    {
        question: "Paciente refere crises de cefaleia, palpitações e sudorese profusa, acompanhadas de picos hipertensivos. Qual o exame laboratorial mais sensível para confirmar a suspeita de feocromocitoma?",
        options: ["Dosagem de catecolaminas séricas.", "Dosagem de metanefrinas fracionadas no plasma ou na urina de 24 horas.", "Dosagem de ácido vanilmandélico (VMA) urinário.", "Tomografia de adrenais.", "Cintilografia com MIBG."],
        correctAnswer: "Dosagem de metanefrinas fracionadas no plasma ou na urina de 24 horas.",
        explanation: "A tríade clássica sugere feocromocitoma. O diagnóstico bioquímico é feito pela dosagem dos metabólitos das catecolaminas (metanefrinas e normetanefrinas), que são mais estáveis e, portanto, têm maior sensibilidade do que a dosagem das próprias catecolaminas."
    },
    {
        question: "Um paciente diabético em uso de insulina é encontrado desacordado. Qual é a medida diagnóstica e terapêutica imediata mais importante a ser realizada?",
        options: ["Realizar tomografia de crânio.", "Medir a glicemia capilar.", "Administrar tiamina endovenosa.", "Coletar gasometria arterial.", "Realizar punção lombar."],
        correctAnswer: "Medir a glicemia capilar.",
        explanation: "Em qualquer paciente com alteração do nível de consciência, especialmente em diabéticos, a primeira medida é checar a glicemia capilar. A hipoglicemia é uma causa comum e facilmente reversível de coma, e o atraso no tratamento pode levar a danos neurológicos permanentes."
    },
    {
        question: "Paciente com carcinoma de pequenas células de pulmão desenvolve rapidamente hipertensão, alcalose metabólica hipocalêmica e hiperpigmentação. Os níveis de ACTH e cortisol estão muito elevados. Qual o diagnóstico?",
        options: ["Doença de Cushing (adenoma hipofisário).", "Adenoma adrenal produtor de cortisol.", "Síndrome de Cushing por produção ectópica de ACTH.", "Uso exógeno de corticoides.", "Hiperaldosteronismo primário."],
        correctAnswer: "Síndrome de Cushing por produção ectópica de ACTH.",
        explanation: "O carcinoma de pequenas células de pulmão é a causa mais comum de produção ectópica de ACTH. Isso leva a um hipercortisolismo severo e de instalação rápida, frequentemente acompanhado por alcalose hipocalêmica (devido ao efeito mineralocorticoide do cortisol em excesso) e hiperpigmentação (pelo ACTH elevado)."
    },
    {
        question: "Homem de 50 anos acorda com dor, edema e rubor na articulação do hálux direito, após uma noite de consumo de álcool e carne. Qual o diagnóstico e o achado esperado na análise do líquido sinovial?",
        options: ["Artrite séptica; cocos Gram-positivos.", "Crise aguda de gota; cristais de monourato de sódio com birrefringência negativa.", "Artrite reumatoide; fator reumatoide positivo.", "Pseudogota; cristais de pirofosfato de cálcio.", "Celulite; cultura positiva."],
        correctAnswer: "Crise aguda de gota; cristais de monourato de sódio com birrefringência negativa.",
        explanation: "A podagra (artrite da primeira articulação metatarsofalangiana) de início súbito, após fatores desencadeantes como excesso de álcool e purinas, é a apresentação clássica da gota. O diagnóstico de certeza é feito pela visualização de cristais de monourato de sódio em formato de agulha e com birrefringência negativa no líquido sinovial."
    },
    {
        question: "Mulher jovem com poliartrite, fotossensibilidade, úlceras orais e proteinúria. Qual autoanticorpo é mais específico para o diagnóstico de Lúpus Eritematoso Sistêmico?",
        options: ["Fator Antinuclear (FAN).", "Fator Reumatoide.", "Anti-DNA dupla hélice e Anti-Sm.", "Anti-Ro (SSA) e Anti-La (SSB).", "Anti-CCP."],
        correctAnswer: "Anti-DNA dupla hélice e Anti-Sm.",
        explanation: "Embora o FAN seja muito sensível para LES, ele é pouco específico. Os anticorpos anti-DNA dupla hélice (ou anti-dsDNA) e anti-Sm são altamente específicos para o diagnóstico de Lúpus Eritematoso Sistêmico, fazendo parte dos critérios de classificação."
    },
    {
        question: "Além do acometimento articular, qual das seguintes manifestações é característica da artrite psoriática?",
        options: ["Uveíte anterior, dactilite ('dedo em salsicha') e entesite.", "Nódulos reumatoides e vasculite.", "Fenômeno de Raynaud e esclerodactilia.", "Xeroftalmia e xerostomia.", "Fibrose pulmonar."],
        correctAnswer: "Uveíte anterior, dactilite ('dedo em salsicha') e entesite.",
        explanation: "A artrite psoriática faz parte do grupo das espondiloartrites soronegativas. Suas manifestações extra-articulares características incluem a dactilite (inflamação de todo o dedo), a entesite (inflamação da inserção de tendões e ligamentos no osso) e a uveíte."
    },
    {
        question: "Paciente com artrite reumatoide ativa recusa tratamento injetável por medo de agulhas. Qual a conduta ética mais apropriada?",
        options: ["Administrar a medicação compulsoriamente.", "Respeitar a autonomia da paciente, explicar os riscos e benefícios, e discutir alternativas orais.", "Encaminhar para avaliação psiquiátrica.", "Suspender todo o tratamento.", "Tentar convencer a paciente com a presença de familiares."],
        correctAnswer: "Respeitar a autonomia da paciente, explicar os riscos e benefícios, e discutir alternativas orais.",
        explanation: "O princípio da autonomia do paciente deve ser respeitado. O papel do médico é fornecer todas as informações necessárias para uma decisão informada, discutir os prós e contras de cada opção e, juntos, encontrar a melhor alternativa terapêutica que se alinhe aos valores e preferências do paciente."
    },
    {
        question: "Paciente com anemia microcítica e hipocrômica apresenta: ferro sérico baixo, ferritina baixa, capacidade total de ligação do ferro (TIBC) elevada. Qual o diagnóstico e uma causa comum em mulheres em idade fértil?",
        options: ["Talassemia; herança genética.", "Anemia de doença crônica; processo inflamatório.", "Anemia sideroblástica; intoxicação por chumbo.", "Anemia ferropriva; perda menstrual excessiva.", "Anemia megaloblástica; deficiência de B12."],
        correctAnswer: "Anemia ferropriva; perda menstrual excessiva.",
        explanation: "O perfil de ferro descrito (ferro e ferritina baixos, com TIBC alto) é patognomônico da anemia por deficiência de ferro (ferropriva). Em mulheres em idade fértil, a causa mais comum é a perda sanguínea crônica através do fluxo menstrual excessivo."
    },
    {
        question: "Um paciente etilista crônico apresenta anemia com VCM de 115 fL. A deficiência de qual vitamina é a causa mais comum de anemia megaloblástica nesta população?",
        options: ["Vitamina B1 (Tiamina).", "Vitamina B6 (Piridoxina).", "Vitamina B9 (Ácido Fólico/Folato).", "Vitamina B12 (Cobalamina).", "Vitamina C (Ácido Ascórbico)."],
        correctAnswer: "Vitamina B9 (Ácido Fólico/Folato).",
        explanation: "O etilismo crônico está associado a uma dieta pobre e à má absorção de nutrientes. A deficiência de folato (Vitamina B9) é a causa mais prevalente de anemia megaloblástica (macrocítica) nesta população, pois as reservas corporais de folato são menores e se esgotam mais rapidamente que as de Vitamina B12."
    },
    {
        question: "Paciente de área rural do Nordeste apresenta febre irregular, perda de peso e hepatoesplenomegalia importante. O hemograma mostra pancitopenia. Qual o diagnóstico e o exame confirmatório?",
        options: ["Esquistossomose; exame de fezes.", "Malária; gota espessa.", "Leishmaniose visceral (Calazar); aspirado de medula óssea.", "Febre tifoide; hemocultura.", "Linfoma; biópsia de linfonodo."],
        correctAnswer: "Leishmaniose visceral (Calazar); aspirado de medula óssea.",
        explanation: "O quadro de febre prolongada, hepatoesplenomegalia e pancitopenia em paciente de área endêmica é a apresentação clássica da Leishmaniose Visceral. O diagnóstico definitivo é feito pela demonstração das formas amastigotas do parasita no aspirado de medula óssea."
    },
    {
        question: "Ao comunicar o diagnóstico de câncer, qual etapa do protocolo SPIKES corresponde a perguntar ao paciente 'O que você já sabe sobre sua doença até agora?' antes de dar a notícia?",
        options: ["S - Setting up (Preparar o ambiente).", "P - Perception (Percepção do paciente).", "I - Invitation (Convite para a informação).", "K - Knowledge (Dar o conhecimento).", "E - Emotions (Lidar com as emoções)."],
        correctAnswer: "P - Perception (Percepção do paciente).",
        explanation: "A etapa 'P' (Perception) do protocolo SPIKES consiste em avaliar a percepção do paciente sobre sua condição antes de fornecer novas informações. Isso permite ao médico entender o que o paciente já sabe e corrigir possíveis equívocos, adaptando a comunicação."
    },
    {
        question: "Paciente de 75 anos com osteoporose grave (T-score -3.5) e fratura de fêmur. Qual classe de medicação, que atua estimulando a formação óssea, é indicada?",
        options: ["Bisfosfonatos (ex: alendronato).", "Ranelato de estrôncio.", "Raloxifeno.", "Teriparatida (análogo do PTH).", "Calcitonina."],
        correctAnswer: "Teriparatida (análogo do PTH).",
        explanation: "A teriparatida é um agente osteoformador, que estimula a atividade dos osteoblastos. - indicada para o tratamento da osteoporose grave, especialmente em pacientes com fraturas prévias (alto risco), pois promove um aumento mais rápido e significativo da densidade mineral óssea em comparação com os agentes antirabsortivos."
    },
    {
        question: "Idoso etilista crônico internado desenvolve agitação, alucinações visuais e tremores no 3º dia. Qual o tratamento farmacológico de escolha para o delirium tremens e qual vitamina deve ser administrada?",
        options: ["Haloperidol e Vitamina C.", "Benzodiazepínicos (ex: diazepam) e Tiamina (Vitamina B1).", "Fenitoína e Ácido Fólico.", "Morfina e Vitamina K.", "Clonidina e Vitamina B12."],
        correctAnswer: "Benzodiazepínicos (ex: diazepam) e Tiamina (Vitamina B1).",
        explanation: "O delirium tremens, a forma mais grave da síndrome de abstinência alcoólica, é tratado com benzodiazepínicos para controlar a agitação e prevenir convulsões. A tiamina (Vitamina B1) deve ser administrada antes de qualquer solução glicosada para prevenir a Encefalopatia de Wernicke."
    }
  ],
  'Clínica Cirúrgica': [
    {
        question: "Jovem de 22 anos refere dor abdominal que iniciou na região periumbilical e migrou para a fossa ilíaca direita há 12 horas, associada a febre baixa e náuseas. Ao exame físico, apresenta dor à descompressão brusca no ponto de McBurney. Qual é o diagnóstico mais provável?",
        options: ["Doença inflamatória pélvica", "Gastroenterite aguda", "Apendicite aguda", "Cólica nefrética", "Diverticulite de Meckel"],
        correctAnswer: "Apendicite aguda",
        explanation: "A apresentação de dor periumbilical migratória para a fossa ilíaca direita, febre baixa, anorexia e sinais de irritação peritoneal (sinal de Blumberg positivo) é a evolução clássica da apendicite aguda."
    },
    {
        question: "Gestante de 25 semanas apresenta dor em flanco direito, febre e leucocitose de 18.000/mm³. Qual exame de imagem é o mais adequado para confirmar a suspeita de apendicite aguda nesta paciente?",
        options: ["Tomografia computadorizada com contraste", "Radiografia simples de abdome", "Ultrassonografia abdominal com compressão gradual", "Ressonância magnética de abdome", "Colonoscopia"],
        correctAnswer: "Ressonância magnética de abdome",
        explanation: "Na gestante, a ultrassonografia é o exame inicial de escolha, mas pode ser inconclusiva devido ao útero gravídico. A ressonância magnética sem contraste é o método de escolha subsequente por não utilizar radiação ionizante, oferecendo alta acurácia para o diagnóstico."
    },
    {
        question: "Idoso de 75 anos, diabético e coronariopata, é admitido com dor abdominal difusa, febre de 39°C, hipotensão e taquicardia. A tomografia revela apêndice perfurado com abscesso pélvico. Qual é a conduta mais apropriada?",
        options: ["Antibioticoterapia endovenosa exclusiva", "Drenagem percutânea do abscesso guiada por imagem", "Apendicectomia videolaparoscópica", "Laparotomia exploradora com apendicectomia e lavagem da cavidade", "Colonoscopia para descartar neoplasia"],
        correctAnswer: "Laparotomia exploradora com apendicectomia e lavagem da cavidade",
        explanation: "Em um paciente com apendicite perfurada e sinais de sepse e peritonite difusa, a conduta é a abordagem cirúrgica de urgência por laparotomia para controle do foco infeccioso, apendicectomia e lavagem exaustiva da cavidade abdominal."
    },
    {
        question: "Mulher de 48 anos, obesa, refere dor em hipocôndrio direito de forte intensidade há 6 horas, que irradia para o dorso, associada a febre e vômitos. Ao exame, a inspiração profunda é interrompida pela palpação do ponto cístico. Qual o nome deste sinal e o diagnóstico provável?",
        options: ["Sinal de Rovsing; Apendicite aguda", "Sinal de Charcot; Colangite", "Sinal de Murphy; Colecistite aguda", "Sinal de Cullen; Pancreatite hemorrágica", "Sinal de Grey-Turner; Pancreatite aguda"],
        correctAnswer: "Sinal de Murphy; Colecistite aguda",
        explanation: "A parada da inspiração profunda durante a palpação do ponto cístico é o Sinal de Murphy, um achado clássico e altamente sugestivo de colecistite aguda, que é a inflamação da vesícula biliar."
    },
    {
        question: "Paciente diabético de 60 anos com colecistite aguda apresenta na tomografia de abdome gás na parede e no lúmen da vesícula biliar. Qual é o diagnóstico específico e a principal implicação clínica?",
        options: ["Colecistite acalculosa; tratamento conservador", "Colecistite enfisematosa; alto risco de gangrena e perfuração", "Colelitíase; tratamento eletivo", "Colangite; necessidade de CPRE de urgência", "Vesícula de porcelana; risco aumentado de adenocarcinoma"],
        correctAnswer: "Colecistite enfisematosa; alto risco de gangrena e perfuração",
        explanation: "A presença de gás na parede da vesícula caracteriza a colecistite enfisematosa, uma forma grave de infecção causada por microrganismos produtores de gás (ex: Clostridium). Ocorre mais em diabéticos e tem um risco muito elevado de complicações como gangrena e perfuração, exigindo cirurgia de urgência."
    },
    {
        question: "Idoso de 80 anos é admitido com febre com calafrios, icterícia e dor em hipocôndrio direito. Qual é a tríade clássica descrita e qual o seu significado?",
        options: ["Tríade de Whipple; Hipoglicemia", "Tríade de Beck; Tamponamento cardíaco", "Tríade de Virchow; Trombose venosa", "Tríade de Charcot; Colangite aguda", "Tríade de Cushing; Hipertensão intracraniana"],
        correctAnswer: "Tríade de Charcot; Colangite aguda",
        explanation: "A combinação de febre, icterícia e dor abdominal constitui a Tríade de Charcot, que é a apresentação clássica da colangite aguda, uma infecção das vias biliares geralmente causada por obstrução."
    },
    {
        question: "Paciente com colangite aguda evolui com confusão mental e hipotensão arterial. Esta combinação de cinco sinais é conhecida como:",
        options: ["Síndrome de Mirizzi", "Pêntade de Reynolds", "Síndrome de Boerhaave", "Doença de Caroli", "Síndrome de Budd-Chiari"],
        correctAnswer: "Pêntade de Reynolds",
        explanation: "A Pêntade de Reynolds consiste na Tríade de Charcot (febre, icterícia, dor abdominal) acrescida de hipotensão arterial e alteração do nível de consciência. Indica colangite supurativa grave com sepse, uma emergência médica que requer descompressão biliar imediata."
    },
    {
        question: "Homem de 45 anos, etilista crônico, apresenta dor epigástrica súbita, de forte intensidade, em faixa, que irradia para o dorso, acompanhada de náuseas e vômitos. Exames laboratoriais mostram amilase e lipase séricas 5 vezes acima do valor de referência. Qual o diagnóstico?",
        options: ["slcera péptica perfurada", "Colecistite aguda", "Pancreatite aguda", "Infarto agudo do miocárdio de parede inferior", "Isquemia mesenterérica aguda"],
        correctAnswer: "Pancreatite aguda",
        explanation: "O diagnóstico de pancreatite aguda é confirmado pela presença de pelo menos dois dos três critérios: dor abdominal característica, elevação de amilase ou lipase sérica (pelo menos 3x o limite superior) e achados de imagem compatíveis. O paciente preenche os dois primeiros critérios."
    },
    {
        question: "Seis semanas após um episódio de pancreatite aguda grave, um paciente refere saciedade precoce e uma massa palpável em epigástrio. A tomografia mostra uma coleção líquida, bem delimitada e sem necrose sólida em seu interior, na cauda do pâncreas. Qual é o diagnóstico mais provável?",
        options: ["Cistoadenoma seroso", "Neoplasia cística mucinosa", "Abscesso pancreático", "Pseudocisto pancreático", "Pancreatite crônica"],
        correctAnswer: "Pseudocisto pancreático",
        explanation: "Um pseudocisto pancreático é uma coleção de suco pancreático envolta por uma parede inflamatória fibrosa, que se forma como complicação tardia (geralmente após 4 semanas) de uma pancreatite aguda. A saciedade precoce ocorre pela compressão do estômago."
    },
    {
        question: "Mulher jovem, sexualmente ativa, apresenta dor em abdome inferior, febre, e ao exame ginecológico há dor à mobilização do colo uterino e presença de corrimento vaginal. Qual o principal diagnóstico diferencial com apendicite aguda?",
        options: ["Cistite aguda", "Gravidez ectópica rota", "Doença inflamatória pélvica (DIP)", "Torção de cisto ovariano", "Endometriose"],
        correctAnswer: "Doença inflamatória pélvica (DIP)",
        explanation: "A DIP é uma infecção do trato genital superior feminino que classicamente cursa com dor em abdome inferior, febre e corrimento. A dor à mobilização do colo uterino (sinal de Chandellier) é um achado característico que ajuda a diferenciar da apendicite."
    },
    {
        question: "Idoso de 70 anos apresenta dor em fossa ilíaca esquerda, febre e constipação intestinal. Ao exame, há uma massa dolorosa palpável nesta região. A tomografia de abdome revela espessamento do cólon sigmoide com densificação da gordura pericolônica. Qual a hipótese diagnóstica?",
        options: ["Câncer de cólon obstrutivo", "Apendicite aguda", "Doença de Crohn", "Diverticulite aguda", "Colite isquêmica"],
        correctAnswer: "Diverticulite aguda",
        explanation: "A diverticulite aguda é a inflamação de um divertículo colônico, ocorrendo mais comumente no sigmoide. A apresentação clínica de dor em fossa ilíaca esquerda, febre e alterações do hábito intestinal, associada aos achados tomográficos, é típica da condição."
    },
    {
        question: "Um paciente com diverticulite aguda é submetido à laparotomia e se identifica peritonite purulenta difusa, sem comunicação com a luz intestinal. De acordo com a classificação de Hinchey, qual é o estágio e a conduta cirúrgica mais apropriada?",
        options: ["Hinchey I; Drenagem percutânea", "Hinchey II; Drenagem cirúrgica e antibioticoterapia", "Hinchey III; Cirurgia de Hartmann", "Hinchey IV; Anastomose primária", "Hinchey II; Ressecção com anastomose primária"],
        correctAnswer: "Hinchey III; Cirurgia de Hartmann",
        explanation: "A peritonite purulenta difusa corresponde ao estágio III de Hinchey. Nesta situação de inflamação e contaminação intensa, a cirurgia de Hartmann (ressecção do segmento doente, colostomia terminal e fechamento do coto retal) é o procedimento de escolha para controle de danos."
    },
    {
        question: "A cirurgia de Hartmann é um procedimento frequentemente realizado em urgências colorretais, como na diverticulite perfurada. Este procedimento consiste em:",
        options: ["Ressecção do segmento doente e anastomose primária", "Drenagem do abscesso e antibioticoterapia", "Ressecção sigmoideana, colostomia terminal na fossa ilíaca esquerda e fechamento do coto retal", "Apenas uma colostomia em alça para desvio do trânsito", "Colectomia total com ileostomia terminal"],
        correctAnswer: "Ressecção sigmoideana, colostomia terminal na fossa ilíaca esquerda e fechamento do coto retal",
        explanation: "A cirurgia de Hartmann é um procedimento em dois estágios. O primeiro consiste na ressecção do segmento doente (geralmente o sigmoide), confecção de uma colostomia terminal e fechamento do coto distal. A reconstrução do trânsito é realizada em um segundo tempo, após a resolução do quadro inflamatório."
    },
    {
        question: "Paciente diabético apresenta febre alta, calafrios e dor em hipocôndrio direito. A ultrassonografia mostra uma lesão hipoecoica de 8 cm no lobo direito do fígado, sugestiva de abscesso. Qual é a modalidade de tratamento de primeira linha?",
        options: ["Antibioticoterapia endovenosa por 6 semanas", "Drenagem percutânea guiada por imagem associada à antibioticoterapia", "Hepatectomia direita", "Laparotomia exploradora com drenagem aberta", "CPRE para descompressão biliar"],
        correctAnswer: "Drenagem percutânea guiada por imagem associada à antibioticoterapia",
        explanation: "Para abscessos hepáticos piogênicos maiores que 5 cm, o tratamento de escolha é a combinação de antibioticoterapia de amplo espectro com a drenagem percutânea do abscesso, guiada por ultrassonografia ou tomografia, que é um método minimamente invasivo e eficaz."
    },
    {
        question: "Mulher de 28 anos com diagnóstico de Doença Inflamatória Pélvica é admitida com dor abdominal súbita e intensa, febre alta e sinais de choque séptico. A ultrassonografia revela um abscesso tubo-ovariano de 10 cm e grande quantidade de líquido livre na cavidade. Qual a conduta?",
        options: ["Aumentar a dose do antibiótico e observar por 24 horas", "Laparotomia exploradora de urgência para salpingo-ooforectomia e lavagem", "Drenagem percutânea do abscesso", "Iniciar tratamento para tuberculose pélvica", "Realizar culdocentese para alívio"],
        correctAnswer: "Laparotomia exploradora de urgência para salpingo-ooforectomia e lavagem",
        explanation: "A ruptura de um abscesso tubo-ovariano com peritonite e instabilidade hemodinâmica (choque séptico) é uma emergência cirúrgica. A conduta é a laparotomia de urgência para remoção da fonte da infecção (salpingo-ooforectomia) e lavagem da cavidade abdominal."
    },
    {
        question: "Paciente de 60 anos, com múltiplas cirurgias abdominais prévias por úlcera péptica, apresenta distensão abdominal, vômitos fecaloide e parada de eliminação de gases e fezes. A radiografia de abdome mostra múltiplos níveis hidroaéreos e edema de alças. Qual é a causa mais provável do abdome agudo obstrutivo?",
        options: ["Hérnia inguinal encarcerada", "Neoplasia de cólon", "Vólvulo de sigmoide", "Bridas ou aderências pós-operatórias", "Íleo biliar"],
        correctAnswer: "Bridas ou aderências pós-operatórias",
        explanation: "Em pacientes com histórico de cirurgias abdominais, as bridas (aderências) são a principal causa de obstrução do intestino delgado. Elas podem causar acotovelamento ou compressão extrínseca das alças, levando ao quadro obstrutivo."
    },
    {
        question: "Qual é a principal causa de obstrução do intestino delgado em pacientes adultos sem histórico de cirurgia abdominal prévia?",
        options: ["Bridas e aderências", "Hérnias da parede abdominal (inguinal, femoral)", "Neoplasias primárias do intestino delgado", "Doença de Crohn", "Íleo biliar"],
        correctAnswer: "Hérnias da parede abdominal (inguinal, femoral)",
        explanation: "Enquanto as bridas são a causa mais comum no geral, em pacientes sem cirurgias prévias (abdome virgem), as hérnias da parede abdominal que evoluem com encarceramento de alças intestinais se tornam a principal etiologia da obstrução do intestino delgado."
    },
    {
        question: "No manejo inicial de um paciente com abdome agudo obstrutivo por bridas, sem sinais de sofrimento de alça ou peritonite, qual é a conduta prioritária?",
        options: ["Laparotomia exploradora imediata", "Dieta líquida e observação", "Uso de procinéticos para estimular o peristaltismo", "Hidratação venosa, jejum, passagem de sonda nasogástrica e correção de distúrbios hidroeletrolíticos", "Antibioticoterapia de amplo espectro"],
        correctAnswer: "Hidratação venosa, jejum, passagem de sonda nasogástrica e correção de distúrbios hidroeletrolíticos",
        explanation: "O tratamento inicial da obstrução intestinal não complicada é conservador e visa a descompressão do trato gastrointestinal (jejum e sonda nasogástrica) e a estabilização clínica do paciente (hidratação e correção de eletrólitos), na tentativa de resolução espontânea do quadro."
    },
    {
        question: "Idoso de 85 anos, constipado crônico, apresenta distensão abdominal súbita e massiva. A radiografia de abdome mostra uma imagem de alça sigmoide muito distendida, em 'U invertido' ou 'grão de café'. Qual o diagnóstico e a conduta inicial não cirúrgica?",
        options: ["Obstrução por neoplasia; colonoscopia com biópsia", "Vólvulo de sigmoide; descompressão por colonoscopia ou retossigmoidoscopia", "Megacólon tóxico; colectomia de urgência", "Hérnia interna; laparotomia", "Íleo paralítico; tratamento conservador"],
        correctAnswer: "Vólvulo de sigmoide; descompressão por colonoscopia ou retossigmoidoscopia",
        explanation: "A imagem radiológica é patognomônica de vólvulo de sigmoide. Em pacientes estáveis e sem sinais de isquemia, a primeira linha de tratamento é a descompressão endoscópica, que desfaz a torção da alça, aliviando a obstrução."
    },
    {
        question: "Um paciente com hérnia inguinal apresenta dor súbita e intensa na região, com uma massa endurecida e irredutível. O hemograma mostra leucocitose com desvio à esquerda. Qual é a principal preocupação e a conduta indicada?",
        options: ["Hérnia encarcerada; observação e analgesia", "Hérnia estrangulada; cirurgia de urgência", "Hérnia redutível; cirurgia eletiva", "Orquite aguda; antibioticoterapia", "Linfonodomegalia inguinal; biópsia"],
        correctAnswer: "Hérnia estrangulada; cirurgia de urgência",
        explanation: "A evolução de uma hérnia encarcerada (irredutível) com sinais de comprometimento vascular da alça (dor intensa, sinais inflamatórios, leucocitose) caracteriza o estrangulamento. Esta é uma emergência cirúrgica, pois a isquemia pode levar à necrose e perfuração intestinal."
    },
    {
        question: "Homem de 50 anos, com história de dispepsia e uso crônico de anti-inflamatórios, apresenta dor abdominal súbita, de forte intensidade, descrita como 'uma facada'. O exame físico revela abdome em tábua. A radiografia de tórax em pé mostra ar subdiafragmático. Qual a principal hipótese?",
        options: ["Pancreatite aguda", "Apendicite perfurada", "slcera péptica perfurada", "Diverticulite perfurada", "Isquemia mesenterérica"],
        correctAnswer: "slcera péptica perfurada",
        explanation: "A dor súbita e intensa (em punhalada), o abdome em tábua (peritonite química) e a presença de pneumoperitônio (ar na cavidade) são a tríade clássica da perfuração de uma víscera oca, sendo a úlcera péptica duodenal a causa mais comum."
    },
    {
        question: "Idoso de 78 anos, com fibrilação atrial crônica em uso irregular de anticoagulante, queixa-se de dor abdominal difusa, de início súbito e intensidade desproporcional à pobreza de achados no exame físico (abdome flácido, pouco doloroso à palpação). Qual é a hipótese que deve ser considerada uma emergência?",
        options: ["Gastroenterite aguda", "Pancreatite aguda", "Diverticulite", "Isquemia mesenterérica aguda", "Obstrução intestinal"],
        correctAnswer: "Isquemia mesenterérica aguda",
        explanation: "A dissociação entre a queixa de dor abdominal excruciante e um exame físico relativamente benigno é o sinal de alerta clássico para a isquemia mesenterérica aguda de origem embólica. O diagnóstico e o tratamento precoces são cruciais para evitar a necrose intestinal."
    },
    {
        question: "Lactente de 1 ano é levado ao pronto-socorro com crises de choro intenso e intermitente, nas quais encolhe as pernas. Entre as crises, fica apático. Apresentou um episódio de evacuação com muco e sangue ('geleia de framboesa'). Qual o diagnóstico mais provável?",
        options: ["Gastroenterite viral", "Apendicite aguda", "Invaginação intestinal", "Estenose hipertrófica de piloro", "Divertículo de Meckel"],
        correctAnswer: "Invaginação intestinal",
        explanation: "A tríade de dor abdominal em cólica intermitente, vômitos e fezes em 'geleia de framboesa' é a apresentação clássica da invaginação (ou intussuscepção) intestinal, uma emergência pediátrica comum."
    },
    {
        question: "Em um paciente com obstrução completa do cólon esquerdo por uma neoplasia, qual é a melhor estratégia cirúrgica de urgência para um paciente instável?",
        options: ["Ressecção do tumor com anastomose primária", "Colocação de stent endoscópico", "Cirurgia de Hartmann (ressecção e colostomia)", "Apenas uma colostomia em alça proximal", "Colectomia total"],
        correctAnswer: "Cirurgia de Hartmann (ressecção e colostomia)",
        explanation: "Na obstrução maligna do cólon esquerdo, a anastomose primária é proscrita na urgência devido ao alto risco de deiscência. A cirurgia de Hartmann permite a ressecção do tumor e a derivação do trânsito, sendo um procedimento seguro para controle de danos."
    },
    {
        question: "Idosa com hérnia de hiato paraesofágica gigante apresenta dor torácica súbita, vômitos e incapacidade de passar uma sonda nasogástrica. Qual é a complicação aguda mais temida desta condição?",
        options: ["Doença do refluxo gastroesofágico", "Esofagite de refluxo", "Vólvulo gástrico", "Ulceração de Cameron", "Esôfago de Barrett"],
        correctAnswer: "Vólvulo gástrico",
        explanation: "Hérnias de hiato gigantes podem complicar com a torção do estômago herniado sobre seu próprio eixo (vólvulo gástrico), uma emergência cirúrgica que causa obstrução e pode levar à isquemia e necrose gástrica."
    },
    {
        question: "Paciente com Doença de Crohn ileocecal conhecida apresenta episódios recorrentes de dor abdominal em cólica, distensão e vômitos, que melhoram com o jejum. A colonteroscopia revela uma área de estenose fibrótica no íleo terminal. Qual o diagnóstico?",
        options: ["Atividade inflamatória da doença", "Abscesso intra-abdominal", "Fístula enterocutânea", "Quadro de suboclusão intestinal por estenose", "Adenocarcinoma de intestino delgado"],
        correctAnswer: "Quadro de suboclusão intestinal por estenose",
        explanation: "A natureza transmural da inflamação na Doença de Crohn pode levar à formação de estenoses fibróticas, que causam quadros de suboclusão ou oclusão intestinal, uma das principais indicações de tratamento cirúrgico na doença."
    },
    {
        question: "Idosa de 82 anos com colelitíase conhecida apresenta quadro de obstrução do intestino delgado. A radiografia de abdome mostra pneumobilia (ar nas vias biliares) e um cálculo biliar calcificado ectópico na fossa ilíaca direita. Qual é o diagnóstico?",
        options: ["Pancreatite biliar", "Coledocolitíase", "Íleo biliar", "Síndrome de Mirizzi", "Colangite"],
        correctAnswer: "Íleo biliar",
        explanation: "O íleo biliar ocorre quando um cálculo grande erode a parede da vesícula e cria uma fístula para o duodeno, migrando e impactando no intestino delgado (geralmente no íleo terminal). A tríade de Rigler (pneumobilia, obstrução de delgado e cálculo ectópico) na imagem confirma o diagnóstico."
    },
    {
        question: "Homem de 68 anos, tabagista e hipertenso, procura a emergência com dor abdominal súbita, de forte intensidade, irradiada para o dorso, associada a hipotensão e sudorese. Ao exame, palpa-se uma massa abdominal pulsátil e dolorosa. Qual a principal hipótese?",
        options: ["Infarto agudo do miocárdio", "Pancreatite aguda", "Ruptura de aneurisma de aorta abdominal (AAA)", "Dissecção aórtica", "Cólica nefrética"],
        correctAnswer: "Ruptura de aneurisma de aorta abdominal (AAA)",
        explanation: "A tríade clássica de dor abdominal ou lombar, hipotensão e massa abdominal pulsátil em um paciente com fatores de risco é altamente sugestiva de ruptura de um AAA, uma emergência cirúrgica com altíssima mortalidade."
    },
    {
        question: "Paciente chega ao pronto-socorro relatando ter engolido uma espinha de peixe há 2 dias. Agora apresenta febre e dor abdominal localizada. A tomografia mostra perfuração do cólon sigmoide pelo corpo estranho com abscesso localizado. Qual a conduta?",
        options: ["Observação e antibioticoterapia", "Laparotomia com remoção do corpo estranho e rafia primária", "Laparotomia com ressecção do segmento afetado (Hartmann)", "Endoscopia para tentativa de remoção", "Dieta laxativa para expelir o corpo estranho"],
        correctAnswer: "Laparotomia com ressecção do segmento afetado (Hartmann)",
        explanation: "A perfuração colônica por corpo estranho com abscesso ou peritonite é uma indicação de tratamento cirúrgico. Devido à contaminação e inflamação, a ressecção do segmento perfurado, geralmente através de uma cirurgia de Hartmann, é o procedimento mais seguro."
    },
    {
        question: "Idoso de 90 anos, acamado e institucionalizado, apresenta distensão abdominal, ausência de evacuações há 10 dias e toque retal que revela uma ampola retal repleta de fezes endurecidas. Qual o diagnóstico e a primeira medida terapêutica?",
        options: ["Neoplasia de reto; colonoscopia", "Vólvulo de sigmoide; descompressão endoscópica", "Obstrução intestinal por fecaloma; remoção manual ou clisteres", "Doença de Hirschsprung; manometria anorretal", "Colite pseudomembranosa; vancomicina oral"],
        correctAnswer: "Obstrução intestinal por fecaloma; remoção manual ou clisteres",
        explanation: "O fecaloma é uma massa de fezes endurecidas que causa obstrução, comum em idosos acamados. O diagnóstico é feito pelo toque retal, e a primeira linha de tratamento é a desimpactação manual (toque retal), seguida por clisteres e laxativos."
    },
    {
        question: "Na avaliação primária de um politraumatizado (ABCDE), qual é a primeira prioridade a ser abordada?",
        options: ["Controlar hemorragias externas visíveis", "Avaliar o nível de consciência (escala de Glasgow)", "Garantir a perviedade das vias aéreas com proteção da coluna cervical", "Checar pulsos e perfusão periférica", "Expor o paciente para procurar lesões ocultas"],
        correctAnswer: "Garantir a perviedade das vias aéreas com proteção da coluna cervical",
        explanation: "Seguindo a mnemônica do ATLS, o 'A' (Airway) vem primeiro. A manutenção de uma via aérea pérvia é a maior prioridade, pois a obstrução leva à morte em minutos. A proteção da coluna cervical é realizada simultaneamente."
    },
    {
        question: "Paciente vítima de trauma torácico contuso chega ao pronto-socorro com dispneia intensa, hipotensão, turgência jugular e desvio da traqueia para o lado esquerdo. O hemitórax direito está hipertimpânico e com murmúrio vesicular abolido. Qual a conduta imediata?",
        options: ["Radiografia de tórax de urgência", "Tomografia de tórax", "Drenagem torácica em selo d'água no 5º espaço intercostal", "Toracotomia de reanimação", "Descompressão torácica por punção com agulha no 2º espaço intercostal"],
        correctAnswer: "Descompressão torácica por punção com agulha no 2º espaço intercostal",
        explanation: "O quadro é de pneumotórax hipertensivo, uma emergência absoluta. O diagnóstico é clínico e a conduta imediata, antes de qualquer exame de imagem, é a descompressão por punção (toracocentese de alívio) para transformar o pneumotórax hipertensivo em um simples, seguida pela drenagem torácica definitiva."
    },
    {
        question: "Vítima de ferimento por arma de fogo em abdome chega ao pronto-socorro com PA de 70x40 mmHg e FC de 140 bpm. Qual é a indicação terapêutica imediata?",
        options: ["Realizar o exame FAST para avaliar a presença de líquido livre", "Laparotomia exploradora de emergência", "Tomografia de abdome para mapear a trajetória do projétil", "Exploração digital da ferida", "Sutura da ferida e observação"],
        correctAnswer: "Laparotomia exploradora de emergência",
        explanation: "A presença de instabilidade hemodinâmica em um paciente com trauma abdominal penetrante é uma indicação absoluta e imediata de laparotomia exploradora para controle da hemorragia."
    },
    {
        question: "Após uma queda de 5 metros de altura, um paciente está hemodinamicamente estável, mas o exame FAST (Focused Assessment with Sonography for Trauma) mostra líquido livre na loja esplênica (espaço esplenorrenal). Qual é o próximo passo na avaliação?",
        options: ["Laparotomia exploradora imediata", "Observação clínica seriada", "Tomografia computadorizada de abdome com contraste endovenoso", "Laparoscopia diagnóstica", "Realizar punção diagnóstica do peritônio (LPD)"],
        correctAnswer: "Tomografia computadorizada de abdome com contraste endovenoso",
        explanation: "Em um paciente com trauma abdominal contuso que está hemodinamicamente estável, mas com FAST positivo, a tomografia computadorizada é o exame de escolha para graduar a lesão de órgãos sólidos (neste caso, o baço), identificar sangramento ativo e guiar a decisão entre tratamento conservador ou cirúrgico."
    },
    {
        question: "Paciente vítima de acidente automobilístico apresenta fratura dos arcos costais inferiores à esquerda e refere dor no ombro esquerdo ao ser colocado em posição de Trendelenburg. Este sinal (Sinal de Kehr) é sugestivo de:",
        options: ["Lesão diafragmática", "Pneumotórax", "Lesão esplênica com irritação do nervo frênico", "Fratura de clavícula", "Contusão pulmonar"],
        correctAnswer: "Lesão esplênica com irritação do nervo frênico",
        explanation: "O Sinal de Kehr é a dor referida no ombro esquerdo causada pela irritação do diafragma (inervado pelo nervo frênico, C3-C5) por sangue proveniente de uma ruptura esplênica."
    },
    {
        question: "Politraumatizado vítima de colisão frontal apresenta fratura pélvica com instabilidade vertical e sinais de choque hipovolêmico classe III. Qual é a medida inicial mais importante para o controle da hemorragia pélvica?",
        options: ["Fixação externa da pelve", "Arteriografia com embolização", "Laparotomia para tamponamento pélvico", "Fechamento da pelve com lençol ou cinturão pélvico", "Passagem de cateter de Foley"],
        correctAnswer: "Fechamento da pelve com lençol ou cinturão pélvico",
        explanation: "Em fraturas pélvicas instáveis ('livro aberto'), a primeira medida para estabilização e controle da hemorragia (principalmente venosa) é a estabilização mecânica circunferencial da pelve com um dispositivo apropriado ou, na sua ausência, um lençol amarrado firmemente ao nível dos trocânteres maiores."
    },
    {
        question: "Vítima de ferimento por arma branca na Zona II do pescoço, com sangramento ativo e hematoma em expansão. Qual é a conduta mais segura?",
        options: ["Exploração local da ferida no pronto-socorro", "Angiotomografia cervical", "Endoscopia digestiva alta", "Exploração cirúrgica cervical imediata", "Compressão local e observação"],
        correctAnswer: "Exploração cirúrgica cervical imediata",
        explanation: "Sinais 'hard' de lesão vascular ou aerodigestiva no trauma cervical penetrante (como sangramento ativo, hematoma em expansão, choque, enfisema subcutâneo extenso) são indicações de exploração cirúrgica imediata, sem a necessidade de exames de imagem prévios."
    },
    {
        question: "Paciente com traumatismo cranioencefálico (TCE) é avaliado na cena e apresenta abertura ocular ao estímulo doloroso (2), sons ininteligíveis (2) e extensão anormal dos membros (postura de descerebração) (2). Qual é a sua pontuação na Escala de Coma de Glasgow (ECG) e a classificação da gravidade do TCE?",
        options: ["ECG 8; TCE moderado", "ECG 6; TCE grave", "ECG 7; TCE grave", "ECG 5; TCE grave", "ECG 9; TCE moderado"],
        correctAnswer: "ECG 6; TCE grave",
        explanation: "A pontuação é a soma das melhores respostas: Abertura Ocular (2) + Melhor Resposta Verbal (2) + Melhor Resposta Motora (2) = 6. Um escore na ECG - 8 caracteriza um TCE grave, com indicação de intubação orotraqueal para proteção de via aérea."
    },
    {
        question: "Em um paciente homem, vítima de trauma pélvico, a presença de sangue no meato uretral, hematoma perineal e uma próstata 'alta' ou flutuante ao toque retal são sinais clássicos de:",
        options: ["Lesão de bexiga", "Fratura de fêmur", "Lesão de uretra posterior", "Lesão de uretra anterior", "Lesão renal"],
        correctAnswer: "Lesão de uretra posterior",
        explanation: "Esses são os sinais clássicos de lesão da uretra posterior, comumente associada a fraturas pélvicas. Nestes casos, a passagem de uma sonda vesical de demora está contraindicada antes da realização de uma uretrocistografia retrógrada."
    },
    {
        question: "Para um adulto de 70 kg com queimaduras de segundo e terceiro graus em 30% da superfície corporal, qual o volume de Ringer Lactato a ser infundido nas primeiras 8 horas, segundo a fórmula de Parkland (4 mL x Peso x %SCQ)?",
        options: ["4200 mL", "8400 mL", "2100 mL", "7000 mL", "3000 mL"],
        correctAnswer: "4200 mL",
        explanation: "A fórmula de Parkland calcula o volume total para as primeiras 24 horas: 4 mL x 70 kg x 30 = 8400 mL. Metade deste volume (4200 mL) deve ser infundida nas primeiras 8 horas a partir do momento da queimadura."
    },
    {
        question: "Paciente de 37 anos apresenta uma lesão pigmentada no dorso, com 1,5 cm de diâmetro, bordas irregulares, múltiplas cores e crescimento recente. Qual é o tipo de biópsia de escolha para a suspeita de melanoma?",
        options: ["Biópsia incisional", "Biópsia por shaving", "Biópsia excisional com margens de 2 mm", "Biópsia por punch", "Citologia aspirativa"],
        correctAnswer: "Biópsia excisional com margens de 2 mm",
        explanation: "Na suspeita de melanoma, a biópsia deve ser excisional, removendo a lesão inteira com uma pequena margem de pele normal (1-3 mm). Isso permite ao patologista avaliar a espessura total do tumor (índice de Breslow), que é o fator prognóstico mais importante e guia o tratamento subsequente."
    },
    {
        question: "A Síndrome de Lynch, ou Câncer Colorretal Hereditário Não Poliposo (HNPCC), é uma condição autossômica dominante que aumenta o risco de câncer colorretal e outros tumores. Está associada a mutações em quais genes?",
        options: ["APC", "BRCA1 e BRCA2", "TP53", "Genes de reparo de DNA (mismatch repair), como MLH1, MSH2, MSH6 e PMS2", "RET"],
        correctAnswer: "Genes de reparo de DNA (mismatch repair), como MLH1, MSH2, MSH6 e PMS2",
        explanation: "A Síndrome de Lynch é causada por mutações germinativas em genes responsáveis pelo reparo de erros de pareamento do DNA (MMR - Mismatch Repair), levando a uma instabilidade de microssatélites e a um risco muito aumentado de câncer, principalmente colorretal e de endométrio."
    },
    {
        question: "Mulher de 45 anos realiza ultrassonografia de tireoide que evidencia um nódulo de 1,2 cm, sólido, hipoecoico e com microcalcificações em seu interior. Qual é a conduta mais apropriada?",
        options: ["Acompanhamento com nova ultrassonografia em 6 meses", "Supressão com levotiroxina", "Punção Aspirativa por Agulha Fina (PAAF)", "Tireoidectomia total", "Cintilografia de tireoide"],
        correctAnswer: "Punção Aspirativa por Agulha Fina (PAAF)",
        explanation: "As características ultrassonográficas do nódulo (sólido, hipoecoico, com microcalcificações) são altamente suspeitas de malignidade. Portanto, a PAAF está indicada para avaliação citológica e definição da natureza do nódulo."
    },
    {
        question: "Um paciente de 40 anos, homossexual, apresenta múltiplas lesões violáceas em pele e mucosa oral. A biópsia de uma lesão confirma o diagnóstico de Sarcoma de Kaposi. A investigação para qual infecção viral é mandatória neste caso?",
        options: ["Hepatite C", "Vírus Epstein-Barr", "Vírus da Imunodeficiência Humana (HIV)", "Citomegalovírus", "Herpesvírus humano tipo 8 (HHV-8) isoladamente"],
        correctAnswer: "Vírus da Imunodeficiência Humana (HIV)",
        explanation: "O Sarcoma de Kaposi é uma neoplasia definidora de AIDS, causada pelo Herpesvírus humano 8 (HHV-8) em um contexto de imunossupressão. Sua presença, especialmente na forma epidêmica, torna a testagem para o HIV obrigatória."
    },
    {
        question: "Mulher de 62 anos, na menopausa, apresenta um episódio de sangramento vaginal. A ultrassonografia transvaginal mostra um espessamento endometrial de 12 mm. Qual é o próximo passo diagnóstico?",
        options: ["Dosagem de CA-125", "Observação e repetição da ultrassonografia em 3 meses", "Histeroscopia com biópsia endometrial", "Iniciar terapia de reposição hormonal", "Papanicolau"],
        correctAnswer: "Histeroscopia com biópsia endometrial",
        explanation: "Sangramento pós-menopausa é considerado câncer de endométrio até prova em contrário. Um espessamento endometrial > 4-5 mm nesta população requer investigação histopatológica. A histeroscopia com biópsia dirigida é o padrão-ouro para o diagnóstico."
    },
    {
        question: "Paciente de 65 anos apresenta icterícia obstrutiva progressiva e indolor. A tomografia evidencia uma massa de 3 cm na cabeça do pâncreas, sem sinais de metástases à distância. Qual o nome do procedimento cirúrgico com intenção curativa para esta condição?",
        options: ["Cirurgia de Hartmann", "Gastrectomia total", "Hepatectomia direita", "Cirurgia de Whipple (duodenopancreatectomia)", "Derivação biliodigestiva"],
        correctAnswer: "Cirurgia de Whipple (duodenopancreatectomia)",
        explanation: "A cirurgia de Whipple é o procedimento padrão para a ressecção de tumores da cabeça do pâncreas. Envolve a remoção da cabeça do pâncreas, duodeno, vesícula biliar, colédoco distal e, por vezes, uma porção do estômago."
    },
    {
        question: "No estadiamento e tratamento cirúrgico do câncer de mama invasivo sem linfonodos clinicamente suspeitos, qual é o principal objetivo da biópsia do linfonodo sentinela?",
        options: ["Remover todos os linfonodos axilares para controle da doença", "Avaliar o estado da axila de forma minimamente invasiva para evitar a linfadenectomia completa se for negativo", "Apenas confirmar o diagnóstico de câncer de mama", "Reduzir o tamanho do tumor primário", "Prevenir a ocorrência de linfedema"],
        correctAnswer: "Avaliar o estado da axila de forma minimamente invasiva para evitar a linfadenectomia completa se for negativo",
        explanation: "A biópsia do linfonodo sentinela (o primeiro a receber a drenagem linfática do tumor) permite avaliar o status da axila. Se o sentinela for negativo para metástase, a linfadenectomia axilar completa, com sua maior morbidade (linfedema, dor), pode ser evitada."
    },
    {
        question: "Paciente de 60 anos, submetido a uma retossigmoidectomia por câncer há 2 anos, apresenta em exame de seguimento uma única lesão de 3 cm no lobo direito do fígado, sugestiva de metástase. Não há outras lesões. Qual é a melhor abordagem terapêutica?",
        options: ["Quimioterapia paliativa exclusiva", "Radioterapia hepática", "Observação (watchful waiting)", "Ressecção cirúrgica da metástase (hepatectomia parcial)", "Ablação por radiofrequência"],
        correctAnswer: "Ressecção cirúrgica da metástase (hepatectomia parcial)",
        explanation: "A ressecção de metástases hepáticas de origem colorretal, quando limitadas em número e passíveis de ressecção completa, oferece a única chance de cura e sobrevida a longo prazo para esses pacientes."
    },
    {
        question: "De acordo com as diretrizes da maioria das sociedades médicas, o rastreamento do câncer colorretal para a população de risco médio deve ser iniciado em que idade?",
        options: ["30 anos", "40 anos", "45 anos", "55 anos", "60 anos"],
        correctAnswer: "45 anos",
        explanation: "Houve uma recente redução na idade de início do rastreamento do câncer colorretal de 50 para 45 anos para a população de risco habitual, devido ao aumento da incidência em adultos mais jovens. O método preferencial é a colonoscopia a cada 10 anos."
    },
    {
        question: "Paciente no segundo dia de pós-operatório de tireoidectomia total queixa-se de formigamento nos lábios e nas mãos. Ao aferir a pressão arterial, o examinador observa um espasmo do carpo. Qual é o diagnóstico e o tratamento imediato?",
        options: ["Crise tireotóxica; Propiltiouracil", "Lesão do nervo laríngeo; observação", "Hipocalcemia aguda; Gluconato de cálcio endovenoso", "Hipomagnesemia; Sulfato de magnésio", "Alcalose respiratória; respirar em saco de papel"],
        correctAnswer: "Hipocalcemia aguda; Gluconato de cálcio endovenoso",
        explanation: "A parestesia perioral e o sinal de Trousseau (espasmo do carpo à isquemia) são sinais de hipocalcemia aguda, uma complicação comum da tireoidectomia devido ao hipoparatireoidismo inadvertido. O tratamento da hipocalcemia sintomática é a reposição endovenosa de cálcio."
    },
    {
        question: "Paciente com rouquidão persistente após uma tireoidectomia. A laringoscopia confirma paralisia da prega vocal direita. Qual estrutura nervosa foi mais provavelmente lesionada durante a cirurgia?",
        options: ["Nervo vago", "Nervo laríngeo superior", "Nervo laríngeo recorrente direito", "Nervo frênico", "Plexo cervical"],
        correctAnswer: "Nervo laríngeo recorrente direito",
        explanation: "O nervo laríngeo recorrente é responsável pela inervação da maioria dos músculos intrínsecos da laringe. Sua lesão durante a tireoidectomia é a principal causa de paralisia de prega vocal e rouquidão no pós-operatório."
    },
    {
        question: "Paciente submetido a uma gastrectomia com reconstrução a Billroth II apresenta tontura, sudorese, taquicardia e diarreia explosiva cerca de 20 a 30 minutos após as refeições. Qual é o diagnóstico desta complicação pós-operatória?",
        options: ["Síndrome da alça aferente", "Gastrite de refluxo alcalino", "Síndrome de Dumping precoce", "Síndrome de Dumping tardio", "Diarreia por vagotomia"],
        correctAnswer: "Síndrome de Dumping precoce",
        explanation: "A Síndrome de Dumping precoce ocorre pela passagem rápida de conteúdo hiperosmolar do coto gástrico para o jejuno, desencadeando uma resposta autonômica (sintomas vasomotores) e liberação de hormônios gastrointestinais. - comum após gastrectomias."
    },
    {
        question: "Paciente com histórico de gastrectomia com reconstrução a Billroth II refere dor abdominal e vômitos que contêm apenas bile e aliviam a dor. O que essa apresentação sugere?",
        options: ["Síndrome de Dumping precoce", "Síndrome da alça aferente", "Gastrite de refluxo alcalino", "Ulceração da anastomose", "Fístula gastrojejunal"],
        correctAnswer: "Síndrome da alça aferente",
        explanation: "A síndrome da alça aferente é uma complicação mecânica da reconstrução a Billroth II, onde a alça aferente (duodenal) fica obstruída. O acúmulo de secreções biliopancreáticas causa dor e distensão, que são aliviadas por um vômito bilioso em jato."
    },
    {
        question: "No 5º dia de pós-operatório de uma laparotomia, um paciente refere ter sentido 'algo estourar' no abdome após um acesso de tosse, seguido pela saída de grande quantidade de líquido serossanguíneo pela ferida. Este quadro é altamente sugestivo de:",
        options: ["Infecção de sítio cirúrgico", "Hematoma de parede", "Seroma", "Evisceração ou deiscência aponeurótica", "Hérnia incisional"],
        correctAnswer: "Evisceração ou deiscência aponeurótica",
        explanation: "A saída de líquido serossanguíneo ('água de lavado de carne') pela ferida operatória é um sinal clássico de deiscência da aponeurose, com risco iminente de evisceração (saída das alças). - uma emergência cirúrgica."
    },
    {
        question: "Qual das seguintes opções descreve uma infecção de sítio cirúrgico superficial?",
        options: ["Abscesso intra-abdominal próximo a uma anastomose", "Coleção purulenta na fáscia muscular", "Celulite e secreção purulenta confinadas à pele e ao tecido subcutâneo da incisão", "Febre e leucocitose sem alterações na ferida", "Deiscência da aponeurose"],
        correctAnswer: "Celulite e secreção purulenta confinadas à pele e ao tecido subcutâneo da incisão",
        explanation: "Por definição, a infecção de sítio cirúrgico superficial envolve apenas a pele e o tecido celular subcutâneo. O tratamento geralmente consiste em abertura dos pontos, drenagem e curativos, podendo ou não necessitar de antibióticos."
    },
    {
        question: "Qual o tratamento de escolha para uma hérnia inguinal sintomática em um adulto saudável?",
        options: ["Uso de fundas (suspensórios)", "Observação e acompanhamento clínico", "Fisioterapia para fortalecimento da parede abdominal", "Herniorrafia, preferencialmente com colocação de tela (técnica de Lichtenstein)", "Tratamento medicamentoso para redução da pressão intra-abdominal"],
        correctAnswer: "Herniorrafia, preferencialmente com colocação de tela (técnica de Lichtenstein)",
        explanation: "O tratamento de hérnias inguinais sintomáticas é cirúrgico para prevenir complicações como encarceramento e estrangulamento. A técnica de Lichtenstein, que utiliza uma tela de polipropileno para reforçar a parede posterior, é o padrão-ouro por apresentar baixas taxas de recidiva."
    },
    {
        question: "Na colecistectomia videolaparoscópica, a 'visão crítica de segurança de Calot' é uma manobra essencial para prevenir a lesão da via biliar principal. Ela consiste na dissecção e identificação de quais estruturas antes de qualquer clipagem ou secção?",
        options: ["Artéria hepática direita e veia porta", "Ducto hepático comum e artéria hepática própria", "Ducto cístico e artéria cística", "Ligamento de Treitz e pâncreas", "Veia cava inferior e aorta"],
        correctAnswer: "Ducto cístico e artéria cística",
        explanation: "A visão crítica de segurança preconiza que apenas duas estruturas devem entrar no triângulo de Calot para serem ligadas e seccionadas: o ducto cístico e a artéria cística. A identificação clara e inequívoca dessas duas estruturas antes de sua ligadura é o passo mais importante para evitar a lesão iatrogênica do colédoco."
    },
    {
        question: "Quais vacinas são essenciais e devem ser administradas a um paciente antes de uma esplenectomia eletiva para prevenir a sepse fulminante pós-esplenectomia?",
        options: ["Tríplice viral e febre amarela", "Hepatite A e B", "Contra germes encapsulados: Pneumococo, Meningococo e Haemophilus influenzae tipo b", "BCG e poliomielite", "DTP e HPV"],
        correctAnswer: "Contra germes encapsulados: Pneumococo, Meningococo e Haemophilus influenzae tipo b",
        explanation: "O baço é fundamental na defesa contra bactérias encapsuladas. Pacientes esplenectomizados têm alto risco de sepse por esses agentes. A imunização pré-operatória (idealmente 14 dias antes) é crucial para a prevenção."
    },
    {
        question: "Quais são as três fases da cicatrização de feridas, na ordem cronológica correta?",
        options: ["Inflamatória, Maturação, Proliferativa", "Proliferativa, Inflamatória, Maturação", "Inflamatória, Proliferativa, Maturação (ou Remodelamento)", "Hemostasia, Inflamatória, Proliferativa", "Granulação, Epitelização, Contração"],
        correctAnswer: "Inflamatória, Proliferativa, Maturação (ou Remodelamento)",
        explanation: "O processo de cicatrização de feridas segue uma sequência ordenada: a fase inflamatória (hemostasia e inflamação), a fase proliferativa (angiogênese, fibroplasia e epitelização) e a fase de maturação ou remodelamento (reorganização do colágeno)."
    },
    {
        question: "O agente anestésico de indução endovenoso que deve ser usado com cautela ou evitado em pacientes com doença coronariana grave por causar aumento da frequência cardíaca e da pressão arterial é:",
        options: ["Propofol", "Etomidato", "Tiopental", "Cetamina", "Midazolam"],
        correctAnswer: "Cetamina",
        explanation: "A cetamina causa anestesia dissociativa e tem um efeito simpatomimético, aumentando a frequência cardíaca, a pressão arterial e o consumo de oxigênio pelo miocárdio, o que pode ser deletério em um paciente com reserva coronariana limitada."
    },
    {
        question: "Um paciente é submetido a uma cirurgia de apendicectomia por apendicite aguda não perfurada. De acordo com a classificação de potencial de contaminação da ferida, esta cirurgia é classificada como:",
        options: ["Limpa", "Limpa-contaminada", "Contaminada", "Infectada (ou suja)", "Potencialmente contaminada"],
        correctAnswer: "Contaminada",
        explanation: "Cirurgias com inflamação aguda não purulenta, como na apendicite não perfurada, são classificadas como contaminadas. A profilaxia antibiótica está indicada."
    },
    {
        question: "Família de um paciente de 82 anos, lúcido e orientado, pede ao cirurgião para não informá-lo sobre a possibilidade de uma colostomia definitiva, temendo que ele 'desista' da cirurgia. Qual é a conduta ética correta do médico?",
        options: ["Concordar com a família e omitir a informação para proteger o paciente.", "Respeitar a autonomia do paciente, informando-o de todos os riscos e possibilidades, incluindo a colostomia, e envolvê-lo na decisão.", "Pedir à família para comunicar a notícia ao paciente.", "Realizar a cirurgia e informar sobre a colostomia apenas se ela for necessária.", "Cancelar a cirurgia devido ao conflito ético."],
        correctAnswer: "Respeitar a autonomia do paciente, informando-o de todos os riscos e possibilidades, incluindo a colostomia, e envolvê-lo na decisão.",
        explanation: "O princípio da autonomia prevalece. O paciente, estando lúcido, tem o direito de ser informado sobre todos os aspectos de seu tratamento para tomar uma decisão informada. O médico deve conversar com a família para explicar a importância deste princípio, mas a decisão final sobre o que informar cabe ao paciente."
    },
    {
        question: "Durante uma cirurgia, antes da incisão na pele, o cirurgião, o anestesista e a equipe de enfermagem pausam para confirmar em voz alta o nome do paciente, o procedimento e o local cirúrgico. Esta prática faz parte de qual iniciativa de segurança?",
        options: ["Protocolo de Manchester", "Escala de Coma de Glasgow", "Checklist de Segurança Cirúrgica da OMS (Time Out)", "Escore de Caprini", "Critérios de Ranson"],
        correctAnswer: "Checklist de Segurança Cirúrgica da OMS (Time Out)",
        explanation: "Esta etapa, conhecida como 'Time Out' ou 'Pausa Cirúrgica', é a segunda fase do Checklist de Segurança Cirúrgica da Organização Mundial da Saúde, e tem como objetivo principal prevenir erros como cirurgia no paciente errado, no local errado ou o procedimento errado."
    },
    {
        question: "Paciente adepto da religião Testemunha de Jeová, necessitando de uma cirurgia de grande porte com alto risco de sangramento, assina um termo recusando veementemente qualquer transfusão de sangue ou hemoderivados. Como a equipe deve proceder?",
        options: ["Ignorar a recusa em caso de risco de morte, pelo princípio da beneficência.", "Tentar convencer o paciente a mudar de ideia, atrasando a cirurgia.", "Respeitar a decisão do paciente, documentá-la em prontuário e utilizar todas as estratégias alternativas para minimizar o sangramento.", "Solicitar uma ordem judicial para autorizar a transfusão.", "Recusar-se a realizar a cirurgia."],
        correctAnswer: "Respeitar a decisão do paciente, documentá-la em prontuário e utilizar todas as estratégias alternativas para minimizar o sangramento.",
        explanation: "Para pacientes adultos e capazes, a recusa de tratamento, mesmo que vital, baseada em crenças religiosas ou pessoais, é um direito garantido pelo princípio da autonomia. Cabe à equipe médica respeitar essa decisão, documentá-la adequadamente e empregar todas as técnicas disponíveis para realizar o procedimento da forma mais segura possível dentro dessa limitação."
    }
  ],
  'Medicina Preventiva': [
    {
        question: "Um gráfico histórico mostra uma queda acentuada e contínua na taxa de mortalidade por tuberculose em um país europeu, iniciando décadas antes da descoberta da estreptomicina (1943). Qual fator melhor explica essa redução significativa da mortalidade antes da existência de um tratamento farmacológico eficaz?",
        options: [
            "A implementação de programas de vacinação em massa com BCG.",
            "O desenvolvimento de testes diagnósticos mais sensíveis, como o PPD.",
            "A melhoria das condições de vida e nutrição da população, reduzindo a vulnerabilidade à doença.",
            "O isolamento compulsório de todos os pacientes em sanatórios.",
            "A seleção natural de uma população geneticamente mais resistente ao bacilo."
        ],
        correctAnswer: "A melhoria das condições de vida e nutrição da população, reduzindo a vulnerabilidade à doença.",
        explanation: "Este é um exemplo clássico do impacto dos determinantes sociais da saúde. A 'queda secular' da tuberculose foi impulsionada principalmente por melhorias nas condições de moradia, saneamento e, crucialmente, nutrição. Esses fatores fortaleceram o sistema imunológico da população, diminuindo a progressão da infecção para a doença ativa e a letalidade, muito antes da terapia medicamentosa eficaz."
    },
    {
        question: "Em uma festa, várias pessoas desenvolvem hepatite A. A investigação epidemiológica revela que todos os doentes consumiram salada de frutas de um mesmo fornecedor, enquanto os que não comeram a salada não adoeceram. Qual tipo de estudo foi realizado para identificar a fonte?",
        options: [
            "Estudo de coorte prospectivo.",
            "Ensaio clínico randomizado.",
            "Estudo de caso-controle.",
            "Estudo de coorte retrospectivo (ou de surto).",
            "Estudo ecológico."
        ],
        correctAnswer: "Estudo de coorte retrospectivo (ou de surto).",
        explanation: "Na investigação de surtos, os epidemiologistas partem de uma exposição comum no passado (comer a salada) e comparam a incidência da doença entre os expostos e os não expostos. Como o evento já ocorreu, trata-se de um estudo de coorte retrospectivo."
    },
    {
        question: "Um gráfico sobre a implementação da vacina contra a poliomielite mostra que a incidência da doença caiu drasticamente não apenas no grupo vacinado, mas também entre os não vacinados da mesma comunidade. Que fenômeno epidemiológico isso demonstra?",
        options: [
            "Efeito placebo.",
            "Imunidade de rebanho (ou coletiva).",
            "Viés de seleção.",
            "Mutação do vírus.",
            "Eficácia vacinal de 100%."
        ],
        correctAnswer: "Imunidade de rebanho (ou coletiva).",
        explanation: "A imunidade de rebanho ocorre quando a vacinação de uma grande proporção da população protege indiretamente os indivíduos não vacinados, pois a alta cobertura vacinal dificulta a circulação e a transmissão do agente infeccioso."
    },
    {
        question: "Para investigar a associação entre tabagismo e câncer de pulmão, pesquisadores selecionam 100 pacientes com diagnóstico de câncer de pulmão (casos) e 200 pacientes sem a doença (controles), internados no mesmo hospital por outras causas. Em seguida, eles investigam o histórico de tabagismo em ambos os grupos. Qual é o desenho deste estudo?",
        options: [
            "Estudo de coorte.",
            "Ensaio clínico.",
            "Estudo transversal.",
            "Estudo de caso-controle.",
            "Estudo ecológico."
        ],
        correctAnswer: "Estudo de caso-controle.",
        explanation: "O estudo de caso-controle parte do desfecho (doença presente vs. ausente) e investiga retrospectivamente a exposição a um fator de risco. - um desenho eficiente para estudar doenças raras."
    },
    {
        question: "Pesquisadores recrutam 5.000 fumantes e 5.000 não fumantes, todos sem diagnóstico de DPOC, e os acompanham anualmente por 20 anos, registrando a ocorrência de novos casos da doença em cada grupo. Este é um exemplo de qual tipo de estudo?",
        options: [
            "Estudo de caso-controle.",
            "Estudo transversal.",
            "Estudo de coorte prospectivo.",
            "Ensaio clínico randomizado.",
            "Relato de caso."
        ],
        correctAnswer: "Estudo de coorte prospectivo.",
        explanation: "Um estudo de coorte parte da exposição (fumantes vs. não fumantes) e segue os grupos ao longo do tempo (prospectivamente) para observar a incidência de um desfecho (DPOC). - o melhor desenho para determinar incidência e risco relativo."
    },
    {
        question: "Um inquérito de saúde é realizado em uma cidade, onde 2.000 adultos são entrevistados e examinados em um único período de tempo para determinar quantos têm hipertensão e quantos têm diabetes. Que tipo de medida de frequência da doença este estudo pode calcular diretamente?",
        options: [
            "Incidência.",
            "Prevalência.",
            "Risco relativo.",
            "Taxa de mortalidade.",
            "Odds Ratio."
        ],
        correctAnswer: "Prevalência.",
        explanation: "Estudos transversais, que avaliam exposição e doença em um único momento, são como uma 'fotografia' da população. Eles permitem calcular a prevalência, que é a proporção de indivíduos com a doença em um determinado momento, mas não a incidência (casos novos)."
    },
    {
        question: "Ao comparar a taxa de mortalidade por COVID-19 entre diferentes países, um pesquisador utiliza dados agregados de mortalidade e de gastos com saúde por país. Qual o principal viés ou limitação deste tipo de estudo (ecológico)?",
        options: [
            "Viés de memória.",
            "Perda de seguimento.",
            "Falácia ecológica.",
            "Efeito Hawthorne.",
            "Viés de seleção."
        ],
        correctAnswer: "Falácia ecológica.",
        explanation: "A falácia ecológica é o erro de inferir que as associações observadas em nível de grupo (países) são verdadeiras em nível individual. Não se pode concluir que, dentro de um país, os indivíduos com maior gasto em saúde tiveram menor risco de morrer."
    },
    {
        question: "Para testar a eficácia de uma nova vacina contra a dengue, 20.000 voluntários são recrutados. Metade é sorteada para receber a nova vacina, e a outra metade para receber uma injeção de soro fisiológico (placebo). Ambos os grupos são então acompanhados por 2 anos. Qual é o desenho deste estudo?",
        options: [
            "Estudo de coorte.",
            "Estudo de caso-controle.",
            "Estudo transversal.",
            "Ensaio clínico randomizado.",
            "Estudo quase-experimental."
        ],
        correctAnswer: "Ensaio clínico randomizado.",
        explanation: "Este é o desenho de um ensaio clínico randomizado, considerado o padrão-ouro para avaliar a eficácia de intervenções. Suas características principais são a intervenção (vacina) e a alocação aleatória dos participantes para os grupos de tratamento e controle."
    },
    {
        question: "Em uma população de 1.000 pessoas, 100 têm diabetes (doença crônica). Ao longo de um ano, 10 novos casos são diagnosticados. Quais são, respectivamente, a prevalência inicial e a incidência em um ano?",
        options: [
            "Prevalência 1%; Incidência 10%.",
            "Prevalência 10%; Incidência 1%.",
            "Prevalência 10%; Incidência 1,1%.",
            "Prevalência 11%; Incidência 1%.",
            "Prevalência 9%; Incidência 0,9%."
        ],
        correctAnswer: "Prevalência 10%; Incidência 1,1%.",
        explanation: "Prevalência = (casos existentes) / (população total) = 100 / 1000 = 10%. Incidência = (casos novos) / (população em risco no início). A população em risco era de 1000 - 100 = 900 pessoas. Incidência = 10 / 900 -^ 1,1%."
    },
    {
        question: "Um novo teste diagnóstico para a doença X tem uma sensibilidade de 95% e uma especificidade de 90%. O que significa uma sensibilidade de 95%?",
        options: [
            "O teste identifica corretamente 95% das pessoas sadias.",
            "O teste identifica corretamente 95% das pessoas doentes.",
            "Se o teste for positivo, há 95% de chance de ter a doença.",
            "O teste resulta em 5% de falsos positivos.",
            "O teste é 95% acurado no geral."
        ],
        correctAnswer: "O teste identifica corretamente 95% das pessoas doentes.",
        explanation: "Sensibilidade é a capacidade do teste de identificar os verdadeiros positivos. Uma sensibilidade de 95% significa que, de 100 pessoas que realmente têm a doença, o teste será positivo em 95 delas."
    },
    {
        question: "Menina de 8 anos é atendida na UBS com faringite, febre, exsudato amigdaliano e linfonodos cervicais dolorosos. O teste rápido para estreptococo é positivo. Qual é o principal objetivo do tratamento com amoxicilina neste caso, além de aliviar os sintomas?",
        options: [
            "Prevenir a transmissão para outras crianças.",
            "Evitar a evolução para abscesso periamigdaliano.",
            "Prevenir a febre reumática aguda.",
            "Reduzir o risco de otite média aguda.",
            "Impedir a cronificação da infecção."
        ],
        correctAnswer: "Prevenir a febre reumática aguda.",
        explanation: "O tratamento da faringoamigdalite estreptocócica (causada pelo Streptococcus pyogenes) com penicilina ou amoxicilina é fundamental para a erradicação da bactéria e a prevenção de sua principal complicação não supurativa tardia, a febre reumática aguda, que pode causar cardite e lesões valvares permanentes."
    },
    {
        question: "Senhor de 58 anos, trabalhador da construção civil, queixa-se de dor crônica nos joelhos que o impede de trabalhar e de ter lazer. Ele diz: 'Doutor, acho que não sirvo pra mais nada'. Qual atributo da Atenção Primária à Saúde (APS) é mais importante na abordagem deste paciente?",
        options: [
            "Acesso de primeiro contato.",
            "Competência cultural.",
            "Orientação familiar e comunitária.",
            "Abordagem centrada na pessoa.",
            "Coordenação do cuidado."
        ],
        correctAnswer: "Abordagem centrada na pessoa.",
        explanation: "A abordagem centrada na pessoa vai além da doença (osteoartrite) e busca compreender a experiência do indivíduo com a doença, suas emoções, expectativas e o impacto em sua vida. Validar seu sofrimento e explorar o significado da dor para ele é crucial para um plano de cuidados efetivo."
    },
    {
        question: "Gestante com Índice de Massa Corporal (IMC) pré-gestacional de 28 kg/m² (sobrepeso). De acordo com as recomendações do Institute of Medicine (IOM), qual é a faixa de ganho de peso total adequada para ela durante toda a gestação?",
        options: [
            "12,5 a 18 kg.",
            "11,5 a 16 kg.",
            "7 a 11,5 kg.",
            "5 a 9 kg.",
            "Não deve ganhar peso."
        ],
        correctAnswer: "7 a 11,5 kg.",
        explanation: "O ganho de peso gestacional recomendado varia conforme o IMC pré-gestacional. Para mulheres com sobrepeso (IMC 25-29,9 kg/m²), a faixa de ganho de peso recomendada é de 7 a 11,5 kg, para otimizar os desfechos maternos e fetais."
    },
    {
        question: "Mulher de 30 anos, hígida, procura a UBS com disúria e polaciúria há 2 dias, sem febre ou dor lombar. Qual é a conduta mais custo-efetiva para este quadro de cistite não complicada?",
        options: [
            "Solicitar urocultura e aguardar o resultado para tratar.",
            "Solicitar ultrassonografia de vias urinárias.",
            "Iniciar tratamento empírico com antibiótico de curta duração (ex: fosfomicina dose única ou nitrofurantoína por 5 dias).",
            "Apenas orientar aumento da ingesta hídrica.",
            "Encaminhar para o urologista."
        ],
        correctAnswer: "Iniciar tratamento empírico com antibiótico de curta duração (ex: fosfomicina dose única ou nitrofurantoína por 5 dias).",
        explanation: "Em mulheres jovens, não gestantes e sem comorbidades, o quadro de cistite aguda não complicada pode ser tratado empiricamente, sem a necessidade de exames complementares iniciais. O tratamento de curta duração é altamente eficaz e recomendado."
    },
    {
        question: "Durante uma consulta na UBS, um paciente tabagista de 20 maços-ano afirma que 'gostaria de parar de fumar, mas não sabe como'. Qual passo do modelo dos 5 'As' (Ask, Advise, Assess, Assist, Arrange) deve ser aplicado a seguir?",
        options: [
            "Ask (Perguntar) sobre o status de tabagismo.",
            "Advise (Aconselhar) o paciente a parar de fumar.",
            "Assess (Avaliar) a prontidão para a mudança.",
            "Assist (Ajudar) na tentativa de parar, discutindo estratégias e medicamentos.",
            "Arrange (Organizar) o seguimento."
        ],
        correctAnswer: "Assist (Ajudar) na tentativa de parar, discutindo estratégias e medicamentos.",
        explanation: "O paciente já foi perguntado (Ask), aconselhado (Advise) e já demonstrou estar pronto para a mudança (Assess). O próximo passo lógico é 'Assist', que envolve ajudar ativamente o paciente em sua tentativa, oferecendo suporte, discutindo estratégias comportamentais, estabelecendo uma data e, se indicado, prescrevendo terapia de reposição de nicotina ou outros medicamentos."
    },
    {
        question: "Homem de 48 anos, assintomático, sem histórico familiar de câncer de próstata, solicita a realização do PSA para 'prevenção'. Qual é a recomendação atual da maioria das sociedades médicas sobre o rastreamento do câncer de próstata com PSA para este paciente?",
        options: [
            "Deve ser realizado anualmente a partir dos 40 anos.",
            "Está contraindicado, pois os riscos superam os benefícios.",
            "A decisão deve ser compartilhada, após explicar os potenciais benefícios (pequena redução na mortalidade) e os riscos (sobrediagnóstico, sobretratamento e suas complicações).",
            "Deve ser realizado apenas se o toque retal estiver alterado.",
            "Está indicado apenas para homens acima de 55 anos."
        ],
        correctAnswer: "A decisão deve ser compartilhada, após explicar os potenciais benefícios (pequena redução na mortalidade) e os riscos (sobrediagnóstico, sobretratamento e suas complicações).",
        explanation: "O rastreamento do câncer de próstata com PSA é controverso. A recomendação atual não é de rastreamento universal, mas sim de uma decisão compartilhada entre o médico e o paciente, onde os prós e contras são discutidos abertamente para que o paciente possa tomar uma decisão informada."
    },
    {
        question: "Mulher de 55 anos, assintomática, realiza teste de pesquisa de sangue oculto nas fezes como parte de um programa de rastreamento de câncer colorretal, e o resultado é positivo. Qual é a conduta apropriada?",
        options: [
            "Repetir o teste em 1 ano.",
            "Iniciar dieta pobre em fibras e observar.",
            "Encaminhar para realização de colonoscopia.",
            "Solicitar uma retossigmoidoscopia.",
            "Tranquilizar a paciente, pois o resultado é provavelmente um falso-positivo."
        ],
        correctAnswer: "Encaminhar para realização de colonoscopia.",
        explanation: "O teste de sangue oculto nas fezes é um exame de rastreamento. Um resultado positivo não é diagnóstico, mas indica a necessidade de um exame diagnóstico para investigar a causa do sangramento. A colonoscopia é o exame padrão-ouro para essa investigação."
    },
    {
        question: "De acordo com as diretrizes do Ministério da Saúde do Brasil, o rastreamento de câncer de colo de útero com o exame citopatológico (Papanicolau) deve ser iniciado em qual idade e com qual periodicidade inicial?",
        options: [
            "Aos 18 anos, anualmente.",
            "Aos 21 anos, a cada 3 anos.",
            "Aos 25 anos, com os dois primeiros exames anuais e, se normais, a cada 3 anos.",
            "No início da atividade sexual, anualmente.",
            "Aos 30 anos, com teste de HPV a cada 5 anos."
        ],
        correctAnswer: "Aos 25 anos, com os dois primeiros exames anuais e, se normais, a cada 3 anos.",
        explanation: "As diretrizes brasileiras recomendam o início do rastreamento aos 25 anos para mulheres que já tiveram atividade sexual. Após dois exames anuais consecutivos negativos, o rastreamento pode passar a ser trienal, até os 64 anos."
    },
    {
        question: "A mamografia é o principal método de rastreamento para o câncer de mama. Para a população de risco habitual, o Ministério da Saúde recomenda a sua realização na faixa etária de:",
        options: [
            "35 a 69 anos, anualmente.",
            "40 a 59 anos, anualmente.",
            "50 a 69 anos, a cada dois anos.",
            "40 a 74 anos, a cada dois anos.",
            "A partir dos 45 anos, anualmente."
        ],
        correctAnswer: "50 a 69 anos, a cada dois anos.",
        explanation: "A recomendação do Ministério da Saúde do Brasil e da OMS para o rastreamento mamográfico em mulheres de risco habitual é a realização do exame a cada dois anos, na faixa etária de 50 a 69 anos, onde há maior evidência de benefício em termos de redução da mortalidade."
    },
    {
        question: "Uma mulher de 35 anos procura a UBS para sua primeira consulta de pré-natal. Quais sorologias para infecções sexualmente transmissíveis devem ser solicitadas rotineiramente neste momento?",
        options: [
            "Apenas HIV.",
            "HIV, sífilis e hepatite C.",
            "HIV, sífilis e hepatites B e C.",
            "HIV, sífilis e hepatite B.",
            "Apenas sífilis e hepatite B."
        ],
        correctAnswer: "HIV, sífilis e hepatite B.",
        explanation: "O rastreamento universal no pré-natal para HIV (teste rápido ou sorologia), sífilis (VDRL) e hepatite B (HBsAg) é fundamental para a prevenção da transmissão vertical. A sorologia para hepatite C não faz parte da rotina universal, sendo solicitada com base em fatores de risco."
    },
    {
        question: "Jovem com febre, mialgia e um exantema maculopapular em tronco e membros, que relata ter feito uma trilha em uma área de mata com presença de capivaras há 10 dias. Qual doença de notificação compulsória imediata deve ser suspeitada?",
        options: [
            "Dengue.",
            "Leptospirose.",
            "Febre amarela.",
            "Febre maculosa.",
            "Hantavirose."
        ],
        correctAnswer: "Febre maculosa.",
        explanation: "A febre maculosa, transmitida pelo carrapato-estrela (cujo hospedeiro inclui a capivara), é uma doença grave e de alta letalidade. A história epidemiológica (contato com área de mata) associada ao quadro clínico (febre, mialgia, exantema) deve levantar a suspeita, e a notificação é imediata para permitir ações de vigilância e alerta."
    },
    {
        question: "Uma mãe chega à sala de vacinas com seu filho de 2 meses e expressa medo de vaciná-lo, citando informações que viu na internet associando vacinas ao autismo. Qual é a abordagem mais adequada do profissional de saúde?",
        options: [
            "Ignorar a preocupação e apenas aplicar a vacina.",
            "Recusar-se a vacinar a criança e pedir para a mãe assinar um termo de responsabilidade.",
            "Acolher a preocupação da mãe, usar uma escuta ativa, explicar que essa associação já foi comprovada como falsa por múltiplos estudos científicos, e reforçar os benefícios e a segurança das vacinas.",
            "Dizer que a vacinação é obrigatória por lei e que ela pode ser processada se não vacinar.",
            "Marcar uma consulta com o pediatra para que ele convença a mãe."
        ],
        correctAnswer: "Acolher a preocupação da mãe, usar uma escuta ativa, explicar que essa associação já foi comprovada como falsa por múltiplos estudos científicos, e reforçar os benefícios e a segurança das vacinas.",
        explanation: "A hesitação vacinal deve ser abordada com empatia e informação de qualidade. - fundamental validar a preocupação da mãe, estabelecer uma relação de confiança e fornecer informações claras e baseadas em evidências para desmistificar as 'fake news' e ressaltar a importância da imunização."
    },
    {
        question: "Um profissional de enfermagem sofre um acidente com uma agulha de grosso calibre após coletar sangue de um paciente com carga viral detectável para HIV. Qual é a conduta imediata mais importante?",
        options: [
            "Apenas lavar o local com água e sabão.",
            "Solicitar sorologia para HIV e aguardar o resultado para iniciar a profilaxia.",
            "Iniciar a quimioprofilaxia pós-exposição (PEP) com antirretrovirais o mais rápido possível, idealmente nas primeiras 2 horas.",
            "Tomar a vacina para hepatite B.",
            "Afastar-se do trabalho por 30 dias."
        ],
        correctAnswer: "Iniciar a quimioprofilaxia pós-exposição (PEP) com antirretrovirais o mais rápido possível, idealmente nas primeiras 2 horas.",
        explanation: "Em uma exposição de alto risco para o HIV, a PEP deve ser iniciada o mais precocemente possível (preferencialmente em até 2 horas, e no máximo em 72 horas) para reduzir o risco de soroconversão. A avaliação inicial e a coleta de sorologias basais devem ser feitas, mas não devem atrasar o início da profilaxia."
    },
    {
        question: "Paciente chega à emergência após ser mordido na perna por um cão de rua, que fugiu. O ferimento é profundo e o paciente não se lembra se já tomou vacina antirrábica. Qual é a conduta correta para a profilaxia da raiva?",
        options: [
            "Apenas vacina antirrábica.",
            "Apenas soro antirrábico (imunoglobulina).",
            "Vacina e soro antirrábico.",
            "Apenas observação, pois a transmissão é rara.",
            "Apenas antibioticoterapia e vacina antitetânica."
        ],
        correctAnswer: "Vacina e soro antirrábico.",
        explanation: "Trata-se de uma exposição grave (ferimento profundo) por um animal agressor não observável. Em um paciente não previamente imunizado, a profilaxia pós-exposição completa é indicada, consistindo na aplicação da imunoglobulina humana antirrábica (HRIG) ou soro antirrábico (SAR) e o início do esquema vacinal."
    },
    {
        question: "Uma criança chega à UBS com um ferimento corto-contuso no pé, sujo de terra. A mãe não sabe informar sobre a situação vacinal do filho para o tétano. Qual é a conduta correta em relação à profilaxia do tétano?",
        options: [
            "Apenas limpar o ferimento.",
            "Administrar apenas a vacina (dT ou DTP).",
            "Administrar apenas o soro antitetânico (SAT) ou a imunoglobulina humana antitetânica (IGHAT).",
            "Administrar a vacina e o soro/imunoglobulina em locais diferentes.",
            "Aguardar 10 dias para ver se aparecem sintomas."
        ],
        correctAnswer: "Administrar a vacina e o soro/imunoglobulina em locais diferentes.",
        explanation: "Em um ferimento de alto risco para tétano em um paciente com histórico vacinal incerto, é indicada a profilaxia completa com imunização passiva (soro ou imunoglobulina, para neutralização imediata da toxina) e ativa (vacina, para gerar imunidade futura)."
    },
    {
        question: "Jovem de 24 anos, com teste de gravidez positivo na UBS, começa a chorar e revela que a gestação não foi planejada e que ela não tem condições de ter um filho agora. Qual é a postura inicial mais adequada do profissional de saúde?",
        options: [
            "Aconselhar a paciente a levar a gestação adiante, falando sobre os 'milagres da vida'.",
            "Imediatamente encaminhar para o serviço social.",
            "Oferecer um espaço de escuta empática e sem julgamentos, acolhendo sua angústia e validando seus sentimentos, e informá-la sobre seus direitos e as opções disponíveis dentro da legalidade.",
            "Explicar os riscos do aborto clandestino e focar apenas no início do pré-natal.",
            "Sugerir que ela converse com o parceiro antes de tomar qualquer decisão."
        ],
        correctAnswer: "Oferecer um espaço de escuta empática e sem julgamentos, acolhendo sua angústia e validando seus sentimentos, e informá-la sobre seus direitos e as opções disponíveis dentro da legalidade.",
        explanation: "Acolhimento é a diretriz fundamental. A paciente está em um momento de vulnerabilidade e precisa de um espaço seguro para expressar seus sentimentos. A postura do profissional deve ser de escuta, apoio e orientação, garantindo o acesso à informação sobre seus direitos reprodutivos, incluindo o pré-natal e as possibilidades de interrupção da gestação previstas em lei no Brasil (estupro, risco de vida para a mãe, anencefalia fetal)."
    },
    {
        question: "Uma mulher de 40 anos, com deficiência física, depressão, e que cuida sozinha de sua mãe idosa com sinais de demência, procura a UBS com queixas vagas. A equipe de saúde da família decide elaborar um Projeto Terapêutico Singular (PTS) para ela. O que caracteriza um PTS?",
        options: [
            "Um protocolo clínico padrão para pacientes com múltiplas comorbidades.",
            "Um plano de cuidados construído de forma conjunta entre a equipe e a usuária, focado em suas necessidades e contexto de vida, definindo metas e responsabilidades.",
            "Um formulário de encaminhamento para múltiplos especialistas.",
            "Uma lista de medicamentos a serem prescritos.",
            "Uma autorização para internação domiciliar."
        ],
        correctAnswer: "Um plano de cuidados construído de forma conjunta entre a equipe e a usuária, focado em suas necessidades e contexto de vida, definindo metas e responsabilidades.",
        explanation: "O PTS é uma ferramenta de gestão do cuidado para casos complexos. Ele vai além da abordagem biomédica, considerando os aspectos psicossociais e o contexto de vida do indivíduo. - uma construção coletiva (equipe, usuário, família) de um plano de ação com metas e tarefas compartilhadas."
    },
    {
        question: "Um médico de família e comunidade atende um paciente com diabetes na UBS e, ao perceber que a retinopatia está se agravando, o encaminha para o oftalmologista da rede. Após a consulta, o médico entra em contato com o especialista para discutir o caso e planejar o seguimento conjunto. Qual atributo da APS está sendo exercido?",
        options: [
            "Longitudinalidade.",
            "Integralidade.",
            "Coordenação do cuidado.",
            "Acesso de primeiro contato.",
            "Orientação comunitária."
        ],
        correctAnswer: "Coordenação do cuidado.",
        explanation: "A coordenação do cuidado é a capacidade da APS de articular as diferentes ofertas de serviços de saúde, garantindo a continuidade da atenção ao longo do tempo e entre os diferentes pontos da rede. O médico de família atua como o maestro do cuidado, integrando as ações dos especialistas."
    },
    {
        question: "Um paciente idoso é acompanhado pelo mesmo médico de família há 10 anos. O médico conhece seu histórico, sua família, seu contexto social e os valores do paciente, o que permite uma tomada de decisão mais qualificada e uma forte relação de confiança. Este acompanhamento ao longo do tempo é a definição de qual atributo da APS?",
        options: [
            "Acesso.",
            "Longitudinalidade.",
            "Integralidade.",
            "Coordenação do cuidado.",
            "Orientação familiar."
        ],
        correctAnswer: "Longitudinalidade.",
        explanation: "A longitudinalidade é o acompanhamento do paciente pela mesma equipe de saúde ao longo do tempo, independentemente da presença ou ausência de doença. - o pilar que permite a construção do vínculo e da confiança, e é considerado o atributo central da APS."
    },
    {
        question: "Um Agente Comunitário de Saúde (ACS), durante uma visita domiciliar, identifica uma família em situação de extrema pobreza, com insegurança alimentar e uma criança fora da escola. Além de comunicar a equipe da UBS, qual é o papel do ACS nesta situação?",
        options: [
            "Prescrever um suplemento alimentar para a criança.",
            "Apenas orientar a família a procurar ajuda.",
            "Articular com outros serviços do território, como o CRAS (Centro de Referência de Assistência Social), para o acesso a benefícios e programas sociais.",
            "Realizar uma campanha de doação de alimentos no bairro.",
            "Ignorar os problemas sociais e focar apenas nas questões de saúde."
        ],
        correctAnswer: "Articular com outros serviços do território, como o CRAS (Centro de Referência de Assistência Social), para o acesso a benefícios e programas sociais.",
        explanation: "O ACS é o elo entre a comunidade e a unidade de saúde, mas também com a rede intersetorial. Seu papel é fundamental na identificação de vulnerabilidades e na articulação com outros equipamentos sociais do território para uma abordagem integral das necessidades da família."
    },
    {
        question: "Na avaliação multidimensional da pessoa idosa (AMPI), qual das seguintes opções NfO é uma das dimensões principais a serem avaliadas?",
        options: [
            "Capacidade funcional (atividades de vida diária).",
            "Condição clínica e comorbidades.",
            "Situação socioeconômica e rede de apoio.",
            "Estado cognitivo e humor.",
            "Produtividade no mercado de trabalho."
        ],
        correctAnswer: "Produtividade no mercado de trabalho.",
        explanation: "A AMPI busca uma avaliação global da saúde do idoso, abrangendo as dimensões clínica, funcional (autonomia e independência), cognitiva, de humor e o contexto sociofamiliar. A produtividade no trabalho não é um domínio central desta avaliação."
    },
    {
        question: "Uma mulher trans procura a UBS e relata ter sido mal atendida em outros serviços de saúde, que se recusaram a usar seu nome social. Qual princípio do SUS é diretamente violado por esta atitude?",
        options: [
            "Descentralização.",
            "Participação social.",
            "Universalidade.",
            "Equidade.",
            "Hierarquização."
        ],
        correctAnswer: "Equidade.",
        explanation: "Equidade em saúde significa tratar desigualmente os desiguais, na medida de suas desigualdades. A população LGBTQIA+ é historicamente vulnerabilizada no acesso à saúde. Garantir um atendimento respeitoso, que reconheça sua identidade de gênero (como o uso do nome social), é uma prática de equidade fundamental para garantir o acesso e a integralidade do cuidado."
    },
    {
        question: "Um médico, ao atender um paciente assintomático, solicita uma bateria de exames de rastreamento não recomendados para a faixa etária e perfil de risco do paciente, o que leva a um achado incidental, mais exames invasivos e ansiedade, sem benefício clínico comprovado. Esta prática é um exemplo do que a prevenção quaternária busca evitar?",
        options: [
            "Prevenção de doenças infecciosas.",
            "Diagnóstico tardio de doenças crônicas.",
            "Iatrogenia e medicalização excessiva.",
            "Falta de acesso a exames.",
            "Erro de medicação."
        ],
        correctAnswer: "Iatrogenia e medicalização excessiva.",
        explanation: "A prevenção quaternária visa evitar ou reduzir os danos causados por intervenções médicas desnecessárias ou excessivas (iatrogenia). Isso inclui o sobrediagnóstico (diagnóstico de 'doenças' que não trariam sintomas ou danos) e o sobretratamento, protegendo os pacientes da medicalização da vida."
    },
    {
        question: "Qual é a principal recomendação para a introdução alimentar complementar de um lactente em aleitamento materno exclusivo, a partir dos 6 meses?",
        options: [
            "Iniciar com sucos de frutas e papinhas de legumes peneiradas.",
            "Oferecer os alimentos amassados, dos diferentes grupos alimentares (cereais, leguminosas, carnes, legumes), mantendo o aleitamento materno sob livre demanda.",
            "Substituir uma mamada por uma refeição completa de sopa.",
            "Introduzir um alimento novo a cada 15 dias para testar alergias.",
            "Oferecer apenas frutas e vegetais até 1 ano de idade."
        ],
        correctAnswer: "Oferecer os alimentos amassados, dos diferentes grupos alimentares (cereais, leguminosas, carnes, legumes), mantendo o aleitamento materno sob livre demanda.",
        explanation: "O Guia Alimentar para Crianças Brasileiras Menores de 2 Anos recomenda que a partir dos 6 meses, a criança receba alimentos de todos os grupos, em consistência de papa ou amassados (não liquidificados nem peneirados), e que o leite materno continue sendo oferecido em livre demanda, pois ainda é a principal fonte de nutrientes."
    },
    {
        question: "Um paciente de 50 anos, etilista pesado, é questionado pelo médico: 'Você já sentiu que deveria diminuir (Cut down) a bebida?', 'As pessoas já o criticaram (Annoyed) por beber?', 'Você já se sentiu culpado (Guilty) por beber?', 'Você já bebeu pela manhã para 'abrir os olhos' (Eye-opener)?'. Que ferramenta de rastreio está sendo utilizada?",
        options: [
            "Escala de Hamilton.",
            "Questionário CAGE.",
            "Inventário de Depressão de Beck.",
            "Miniexame do Estado Mental.",
            "AUDIT."
        ],
        correctAnswer: "Questionário CAGE.",
        explanation: "O CAGE é um mnemônico para um questionário de quatro perguntas (Cut down, Annoyed, Guilty, Eye-opener) amplamente utilizado como uma ferramenta rápida de rastreio para identificar o uso problemático de álcool."
    }
  ],
  'Pediatria': [
    {
        question: "Lactente de 1 ano com febre alta (39-40°C) por 3 dias, que se mantém em bom estado geral. No quarto dia, a febre cessa subitamente e surge um exantema maculopapular róseo, não pruriginoso, que se inicia no tronco e se espalha para o pescoço e membros. Qual é a principal hipótese diagnóstica?",
        options: ["Sarampo", "Rubéola", "Eritema Infeccioso", "Exantema Súbito (Roséola Infantum)", "Escarlatina"],
        correctAnswer: "Exantema Súbito (Roséola Infantum)",
        explanation: "O quadro de febre alta por 3-4 dias seguida de seu desaparecimento em 'crise' e o aparecimento de um exantema maculopapular é a apresentação clássica do exantema súbito, causado pelo herpesvírus humano tipo 6."
    },
    {
        question: "Criança de 7 anos apresenta febre baixa, mal-estar e, após alguns dias, um exantema vermelho intenso nas bochechas, com aspecto de 'face esbofeteada', poupando a região perioral. Posteriormente, surgem lesões rendilhadas ou reticuladas no tronco e membros. Qual o agente etiológico desta doença?",
        options: ["Vírus do Sarampo", "Vírus da Rubéola", "Parvovírus B19", "Streptococcus pyogenes", "Vírus Varicela-Zóster"],
        correctAnswer: "Parvovírus B19",
        explanation: "O eritema infeccioso, ou 'quinta doença', é causado pelo Parvovírus B19. Sua manifestação mais característica é o exantema facial em 'face esbofeteada', seguido pelo exantema reticulado no corpo."
    },
    {
        question: "Escolar de 8 anos com febre alta, faringite com exsudato purulento e dor de garganta. Ao exame, apresenta palidez perioral e um exantema micropapular difuso, que confere à pele uma textura áspera ('pele em lixa'), mais intenso nas dobras (Sinal de Pastia). Qual o diagnóstico?",
        options: ["Mononucleose Infecciosa", "Sarampo", "Doença de Kawasaki", "Escarlatina", "Varicela"],
        correctAnswer: "Escarlatina",
        explanation: "A escarlatina é causada por cepas do Streptococcus pyogenes produtoras de toxina eritrogênica. A combinação de faringite, febre e o exantema característico em 'pele de lixa' com acentuação nas dobras é patognomônica da doença."
    },
    {
        question: "Adolescente de 16 anos com febre, faringite, linfadenopatia cervical posterior e generalizada. Foi prescrito amoxicilina para uma suspeita de faringite bacteriana, e após 2 dias, ele desenvolveu um exantema maculopapular pruriginoso por todo o corpo. O hemograma mostra linfocitose com atipia. Qual a hipótese mais provável?",
        options: ["Alergia à penicilina", "Escarlatina", "Mononucleose Infecciosa", "Infecção aguda pelo HIV", "Rubéola"],
        correctAnswer: "Mononucleose Infecciosa",
        explanation: "Este é o quadro clássico da mononucleose infecciosa (causada pelo vírus Epstein-Barr). O uso de aminopenicilinas (amoxicilina) em pacientes com mononucleose desencadeia um rash cutâneo característico em mais de 90% dos casos, que não representa uma alergia verdadeira."
    },
    {
        question: "Criança não vacinada de 3 anos é levada à consulta com febre, tosse intensa, coriza e conjuntivite há 4 dias. No exame da cavidade oral, são observados pequenos pontos branco-azulados na mucosa jugal, na altura dos molares. Qual o nome desses sinais e qual doença eles indicam?",
        options: ["Manchas de Forchheimer; Rubéola", "Sinal de Pastia; Escarlatina", "Manchas de Koplik; Sarampo", "Vesículas herpéticas; Gengivoestomatite", "Petéquias em palato; Mononucleose"],
        correctAnswer: "Manchas de Koplik; Sarampo",
        explanation: "As manchas de Koplik são patognomônicas do sarampo e surgem no período prodrômico, 1 a 2 dias antes do exantema. A presença da tríade tosse, coriza e conjuntivite ('as 3 C') também é altamente sugestiva."
    },
    {
        question: "Pré-escolar de 4 anos apresenta febre e um exantema pruriginoso que evolui rapidamente. Ao exame, observam-se lesões em diferentes estágios de evolução simultaneamente (máculas, pápulas, vesículas e crostas) distribuídas por todo o corpo, incluindo couro cabeludo. Qual o diagnóstico?",
        options: ["Impetigo", "Escabiose", "Varicela (Catapora)", "Molusco Contagioso", "Doença Mão-Pé-Boca"],
        correctAnswer: "Varicela (Catapora)",
        explanation: "O polimorfismo regional, ou seja, a presença de lesões em vários estágios (pápula -> vesícula -> pústula -> crosta) na mesma área do corpo ao mesmo tempo, é a característica mais marcante da varicela."
    },
    {
        question: "Lactente de 11 meses é internado com febre alta persistente há 6 dias, que não responde a antitérmicos. Apresenta conjuntivite bilateral não exsudativa, lábios vermelhos e fissurados ('língua em framboesa'), exantema polimorfo em tronco e edema endurecido de mãos e pés. Qual a principal complicação a ser investigada?",
        options: ["Meningite asséptica", "Artrite séptica", "Glomerulonefrite", "Aneurismas de artérias coronárias", "Miocardite"],
        correctAnswer: "Aneurismas de artérias coronárias",
        explanation: "O quadro clínico preenche os critérios para a Doença de Kawasaki, uma vasculite sistêmica da infância. A complicação mais temida é o acometimento das artérias coronárias, com formação de aneurismas, que deve ser ativamente investigado com ecocardiograma."
    },
    {
        question: "Lactente de 6 meses, previamente hígido, apresenta quadro de tosse seca, taquipneia, sibilância e tiragem intercostal e subcostal. A mãe refere que o quadro iniciou com coriza e febre baixa. Estamos em período de alta circulação do Vírus Sincicial Respiratório (VSR). Qual o diagnóstico mais provável?",
        options: ["Crise asmática", "Pneumonia bacteriana", "Laringite estridulosa", "Bronquiolite Viral Aguda (BVA)", "Coqueluche"],
        correctAnswer: "Bronquiolite Viral Aguda (BVA)",
        explanation: "A BVA é o primeiro episódio de sibilância em um lactente menor de 2 anos, geralmente causada pelo VSR. Caracteriza-se por um pródromo de infecção de via aérea superior seguido de sinais de obstrução de pequenas vias aéreas (sibilância, taquipneia, tiragem)."
    },
    {
        question: "Criança de 2 anos, previamente saudável, apresenta engasgo súbito enquanto comia amendoim, seguido por um acesso de tosse e dispneia. Na ausculta pulmonar, há diminuição do murmúrio vesicular e sibilância unilateral à direita. Qual a principal hipótese diagnóstica?",
        options: ["Pneumotórax espontâneo", "Crise de asma", "Anafilaxia", "Aspiração de corpo estranho", "Pneumonia de aspiração"],
        correctAnswer: "Aspiração de corpo estranho",
        explanation: "A história de engasgo súbito associada a sinais respiratórios de início abrupto e achados assimétricos no exame pulmonar (hipofonese ou sibilância unilateral) é altamente sugestiva de aspiração de corpo estranho para a via aérea, mais comumente para o brônquio fonte direito."
    },
    {
        question: "Lactente de 2 meses, nascido a termo, apresenta vômitos em jato, não biliosos, que ocorrem logo após as mamadas. A criança mostra-se sempre faminta ('ávida'). Ao exame, é possível palpar uma 'oliva' no quadrante superior direito do abdome. Qual o diagnóstico mais provável?",
        options: ["Doença do Refluxo Gastroesofágico", "Atresia de duodeno", "Estenose Hipertrófica de Piloro", "Alergia à proteína do leite de vaca", "Gastroenterite"],
        correctAnswer: "Estenose Hipertrófica de Piloro",
        explanation: "A estenose hipertrófica de piloro é uma condição que classicamente se manifesta entre a 3ª e a 6ª semana de vida com vômitos em jato, não biliosos e progressivos, em um lactente que se mantém faminto. A palpação da 'oliva pilórica' é um achado patognomônico."
    },
    {
        question: "Recém-nascido com 36 horas de vida, cuja mãe tem tipo sanguíneo 'O+' e ele 'A+', desenvolve icterícia zona II de Kramer. A bilirrubina total é de 12 mg/dL, com predomínio de bilirrubina indireta. Qual é a causa mais provável desta icterícia precoce?",
        options: ["Icterícia fisiológica", "Icterícia do leite materno", "Atresia de vias biliares", "Doença hemolítica por incompatibilidade ABO", "Deficiência de G6PD"],
        correctAnswer: "Doença hemolítica por incompatibilidade ABO",
        explanation: "A icterícia que surge nas primeiras 24-36 horas de vida é sempre patológica. A incompatibilidade ABO (mãe O, RN A ou B) é a causa mais comum de doença hemolítica do recém-nascido, levando a uma produção aumentada de bilirrubina e icterícia precoce."
    },
    {
        question: "Criança de 2 anos é trazida à emergência após um episódio de diarreia sanguinolenta. Evolui com palidez intensa, oligúria e petéquias. Exames laboratoriais revelam anemia hemolítica microangiopática, plaquetopenia e insuficiência renal aguda. Qual a principal hipótese diagnóstica?",
        options: ["Púrpura Trombocitopênica Idiopática (PTI)", "Leucemia Linfoide Aguda (LLA)", "Síndrome Hemolítico-Urêmica (SHU)", "Glomerulonefrite Pós-Estreptocócica (GNPE)", "Sepse por meningococo"],
        correctAnswer: "Síndrome Hemolítico-Urêmica (SHU)",
        explanation: "A SHU é caracterizada pela tríade de anemia hemolítica microangiopática, trombocitopenia e lesão renal aguda. A forma típica (90% dos casos) é precedida por uma gastroenterite por E. coli produtora de toxina Shiga."
    },
    {
        question: "Pré-escolar de 3 anos apresenta edema periorbital matutino que progride para anasarca. A urina de 24 horas revela proteinúria de 4 g (ou > 50 mg/kg/dia). Exames de sangue mostram hipoalbuminemia e hiperlipidemia. Qual é a principal hipótese diagnóstica?",
        options: ["Síndrome Nefrítica Aguda", "Síndrome Hemolítico-Urêmica", "Síndrome Nefrótica", "Infecção do Trato Urinário", "Insuficiência Cardíaca"],
        correctAnswer: "Síndrome Nefrótica",
        explanation: "A síndrome nefrótica é definida pela presença de proteinúria maciça (em níveis nefróticos), hipoalbuminemia, edema e hiperlipidemia. Em crianças, a causa mais comum é a Doença de Lesões Mínimas."
    },
    {
        question: "Escolar de 9 anos desenvolve edema, hipertensão arterial e urina escura (cor de 'coca-cola') duas semanas após um episódio de piodermite (impetigo). Os exames mostram hematúria e consumo do complemento sérico (C3 baixo). Qual o diagnóstico?",
        options: ["Nefropatia por IgA", "Síndrome Nefrótica", "Glomerulonefrite Pós-Estreptocócica (GNPE)", "Pielonefrite aguda", "Síndrome de Alport"],
        correctAnswer: "Glomerulonefrite Pós-Estreptocócica (GNPE)",
        explanation: "A GNPE é a principal causa de síndrome nefrítica na infância. Caracteriza-se por um período de latência após uma infecção de pele ou garganta por cepas nefritogênicas do estreptococo, seguido pelo surgimento de hematúria, edema, hipertensão e consumo do complemento."
    },
    {
        question: "Menina de 7 anos é trazida para avaliação por aparecimento de broto mamário (telarca) e pelos pubianos. A idade óssea é de 9 anos. A ressonância de crânio é normal. Qual o diagnóstico e o tratamento de escolha?",
        options: ["Telarca precoce isolada; observação", "Puberdade Precoce Central; análogo de GnRH", "Puberdade Precoce Periférica; investigação da causa adrenal/ovariana", "Adrenarca precoce; acompanhamento", "Desenvolvimento normal para a idade"],
        correctAnswer: "Puberdade Precoce Central; análogo de GnRH",
        explanation: "O surgimento de caracteres sexuais secundários antes dos 8 anos em meninas, com avanço da idade óssea, caracteriza a puberdade precoce. Se a causa for a ativação prematura do eixo hipotálamo-hipófise-gonadal (central), o tratamento com análogos de GnRH é indicado para frear a progressão e preservar o potencial de estatura final."
    }
  ],
  'Ginecologia e Obstetrícia': [
    {
        question: "Mulher de 25 anos, sexualmente ativa, queixa-se de corrimento vaginal acinzentado, com odor fétido que piora após a relação sexual. O exame especular mostra ausência de inflamação. O teste do pH vaginal é > 4,5 e o teste das aminas (Whiff test) é positivo. Qual é o diagnóstico mais provável?",
        options: ["Candidíase vulvovaginal", "Tricomoníase", "Vaginose bacteriana", "Cervicite por clamídia", "Vaginite atrófica"],
        correctAnswer: "Vaginose bacteriana",
        explanation: "O quadro clínico e os achados laboratoriais (pH > 4,5, teste das aminas positivo, corrimento acinzentado e odor de peixe) preenchem os critérios de Amsel para o diagnóstico de vaginose bacteriana, um desequilíbrio da flora vaginal."
    },
    {
        question: "Gestante de 32 semanas chega à maternidade com queixa de cefaleia, visão turva e dor epigástrica. A pressão arterial aferida é de 160/110 mmHg. Exames laboratoriais mostram proteinúria de 3+ em fita. Qual é a principal hipótese diagnóstica?",
        options: ["Hipertensão gestacional", "Pré-eclâmpsia leve", "Pré-eclâmpsia com sinais de gravidade", "Eclâmpsia", "Síndrome HELLP"],
        correctAnswer: "Pré-eclâmpsia com sinais de gravidade",
        explanation: "A presença de hipertensão (PA - 160/110 mmHg) e proteinúria após 20 semanas de gestação, associada a sinais de gravidade como sintomas neurológicos (cefaleia, escotomas) e dor epigástrica, caracteriza a pré-eclâmpsia com sinais de gravidade."
    },
    {
        question: "Mulher de 60 anos, na pós-menopausa, apresenta sangramento vaginal há 2 semanas. Qual é o primeiro passo na investigação diagnóstica para descartar a principal hipótese de malignidade?",
        options: ["Realizar colposcopia", "Solicitar dosagem de CA-125", "Realizar ultrassonografia transvaginal para avaliar a espessura endometrial", "Fazer um exame citopatológico (Papanicolau)", "Iniciar terapia de reposição hormonal"],
        correctAnswer: "Realizar ultrassonografia transvaginal para avaliar a espessura endometrial",
        explanation: "Sangramento na pós-menopausa é considerado câncer de endométrio até prova em contrário. O primeiro passo investigativo é a ultrassonografia transvaginal. Um endométrio fino (- 4-5 mm) tem alto valor preditivo negativo, enquanto um endométrio espessado indica a necessidade de biópsia."
    },
    {
        question: "Paciente de 30 anos com dismenorreia progressiva, dispareunia de profundidade e infertilidade. A ultrassonografia transvaginal com preparo intestinal revela um nódulo hipoecoico e espiculado no ligamento útero-sacro. Qual é o diagnóstico mais provável?",
        options: ["Miomatose uterina", "Doença inflamatória pélvica", "Endometriose profunda", "Síndrome dos ovários policísticos", "Adenomiose"],
        correctAnswer: "Endometriose profunda",
        explanation: "A tríade de dismenorreia, dispareunia de profundidade e infertilidade é altamente sugestiva de endometriose. A identificação de um nódulo em localização típica (como ligamentos útero-sacros) na imagem confirma a suspeita de endometriose profunda."
    },
    {
        question: "O resultado do exame citopatológico (Papanicolau) de uma mulher de 28 anos revela uma Lesão Intraepitelial de Alto Grau (HSIL/NIC II). Qual é a conduta recomendada?",
        options: ["Repetir a citologia em 6 meses", "Realizar teste de HPV", "Encaminhar para colposcopia com biópsia", "Realizar conização do colo uterino", "Apenas observar"],
        correctAnswer: "Encaminhar para colposcopia com biópsia",
        explanation: "Diante de um resultado de HSIL na citologia, a conduta imediata é a realização de uma colposcopia. Este exame permite visualizar o colo uterino com magnificação e, sob visão colposcópica, realizar biópsias das áreas anormais para confirmação histopatológica."
    },
    {
        question: "Gestante de 38 semanas, G2P1 (1 cesárea prévia), chega ao pronto-socorro com queixa de sangramento vaginal súbito, indolor e de cor vermelho vivo. Ao exame, o útero está relaxado e os batimentos cardíacos fetais estão presentes e normais. Qual é a principal hipótese diagnóstica?",
        options: ["Descolamento prematuro de placenta (DPP)", "Placenta prévia", "Rotura de vasa prévia", "Rotura uterina", "Início do trabalho de parto"],
        correctAnswer: "Placenta prévia",
        explanation: "O sangramento no terceiro trimestre com as características de ser súbito, indolor, de sangue vermelho vivo e sem hipertonia uterina é a apresentação clássica da placenta prévia. A cesárea prévia é um fator de risco importante."
    },
    {
        question: "Qual o mecanismo de ação primário do DIU hormonal (com levonorgestrel) na contracepção?",
        options: ["Impede a nidação por ação inflamatória no endométrio", "- espermicida", "Espessamento do muco cervical, dificultando a ascensão dos espermatozoides, e atrofia endometrial", "Inibe a ovulação na maioria dos ciclos", "Causa lise dos espermatozoides"],
        correctAnswer: "Espessamento do muco cervical, dificultando a ascensão dos espermatozoides, e atrofia endometrial",
        explanation: "O principal mecanismo de ação do DIU com levonorgestrel é local: a progesterona liberada torna o muco cervical espesso e hostil aos espermatozoides, impedindo-os de chegar à cavidade uterina. Secundariamente, causa atrofia endometrial e, em alguns casos, pode inibir a ovulação."
    },
    {
        question: "Mulher de 28 anos com ciclos menstruais irregulares (a cada 40-60 dias), hirsutismo (aumento de pelos em áreas andrógeno-dependentes) e acne. A ultrassonografia pélvica mostra ovários com múltiplos pequenos cistos periféricos. Qual é o diagnóstico mais provável?",
        options: ["Hipotireoidismo", "Hiperprolactinemia", "Síndrome dos Ovários Policísticos (SOP)", "Falência ovariana prematura", "Tumor ovariano produtor de androgênios"],
        correctAnswer: "Síndrome dos Ovários Policísticos (SOP)",
        explanation: "Pelos Critérios de Rotterdam, o diagnóstico de SOP é feito na presença de pelo menos dois dos seguintes: 1) oligo ou anovulação (ciclos irregulares), 2) sinais clínicos ou bioquímicos de hiperandrogenismo (hirsutismo, acne), e 3) morfologia de ovários policísticos na ultrassonografia. A paciente preenche os três critérios."
    }
  ]
};




