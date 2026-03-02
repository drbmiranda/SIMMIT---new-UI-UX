# �Y�� AGENTS.md �?" MENU DE INTERVEN�?�.ES E SOBERANIA CLÍNICA (V.2)
**Projeto:** SIMMIT-beta
**Local:** `C:\dev\SIMMIT-beta`

Este documento define a estrutura de dados, UX e lógica de animação para o menu de solicitações e o protocolo de **Exame Físico Estruturado**. O objetivo é garantir que o aluno execute a propedêutica completa antes da tomada de decisão.

---

## �YZ� 1. IDENTIDADE VISUAL E BRANDING (PURPLE NEON)
* **SIMMIT Purple:** Cor oficial `#8B5CF6`.
* **UI FLIP (GSAP):** O nome **SIMMIT** em roxo deve realizar o **Flip** para o topo do menu de exame físico, servindo como o "Preceptor" que observa a manobra.

---

## �Y", 2. ESTRUTURA DO EXAME FÍSICO (PROPED�SUTICA)
Diferente de exames laboratoriais, o Exame Físico é dividido por manobras fundamentais. Cada comando solicita à IA uma descrição detalhada.

### A. Avaliação Global (Primeira Impressão)
* **Estado Geral:** (Ex: BEG, regular estado, fáscies de dor, nível de consciência).
* **Sinais Vitais:** (Interface com o Monitor Multiparamétrico).

### B. Manobras Propedêuticas (Comandos SIMMIT)
O menu deve disparar comandos específicos para o Gemini processar:
* **SIMMIT INSPE�?�fO:** Descrição visual (estática e dinâmica) do segmento escolhido.
* **SIMMIT PALPA�?�fO:** Textura, temperatura, massas, dor à palpação superficial/profunda e frêmitos.
* **SIMMIT PERCUSS�fO:** Sons (claro pulmonar, macicez, timpanismo).
* **SIMMIT AUSCULTA:** Sons fisiológicos e adventícios (Murmúrio vesicular, bulhas cardíacas, ruídos hidroaéreos).

---

## �Y", 3. MENU DE SOLICITA�?�.ES (SISTEMAS)

### A. Menu Laboratorial 
* **Hematológico/Imuno:** Hemograma, Tipagem, VHS, PCR.
* **Metabólico/Glicêmico:** Glicemia, HbA1c, Insulina.
* **Lipídico/Cardio:** Perfil Lipídico, Troponina, Lactato.
* **Renal/Eletrólitos:** Ureia, Creatinina, Eletrólitos (Na, K, Ca, Mg, P), TFG.
* **Hepático/Biliar:** TGO/TGP, GGT, FA, Bilirrubinas, Albumina.
* **Hormonal/Vitaminas:** TSH, T4L, Cortisol, Vit D, B12.

### B. Menu de Imagem 
* **Ultrassom (Eco):** Doppler, Abdominal/Pélvico, Ecocardiograma.
* **Radiografia (Raio-X):** Tórax, �"ssea, Mamografia.
* **Tomografia (TC):** Crânio, Angio-TC, Tórax/Abdome.
* **Ressonância (RM):** Encéfalo, Osteoarticular, Angiorressonância.

### C. Procedimentos & Suporte 
* **Vias Aéreas:** IOT, VNI, Cricotiroidostomia.
* **Acessos:** CVC, PAI, Intraósseo.
* **Drenagem:** Tórax, Paracentese, Punção Lombar.

---

## �Y�? 4. CELEBRA�?�fO E PROGRESS ANIMATION
* **Micro-Dopamina:** Ao realizar uma ausculta e detectar um achado (ex: Estertores), um **Badge Roxo** de "Raciocínio Clínico" surge com `framer-motion`.
* **Progress Bar:** Cada manobra do exame físico preenche uma sub-barra de "Anamnese Completa".
* **Victory Splash:** Ao encerrar o caso, o **SIMMIT** centraliza via **GSAP Flip** e explode em partículas roxas caso o diagnóstico bata com os achados do Exame Físico.

---

## �Y�� 5. L�"GICA DE IA (GEMINI 3 FLASH)
* **Prompt Engine:** Quando o usuário clica em "Ausculta", o sistema injeta no contexto: *"O usuário está realizando a ausculta agora. Descreva os sons baseando-se na patologia definida."*
* **Response:** A IA deve retornar a descrição sem asteriscos, precedida por **SIMMIT**.

---

## �Y>�️ 6. REGRAS T�?CNICAS (VITE/REACT)
* **Bottom Sheet:** O menu de exame físico e solicitações deve ser um Drawer (puxável) para facilitar o uso com o polegar no mobile.
* **GSAP Timeline:** Sequenciar a abertura do menu: 1. `Blur` no fundo -> 2. `Slide-up` do menu -> 3. `Logo Flip`.

---

## �Y"< CHECKLIST DE IMPLEMENTA�?�fO
1. [ ] O menu contém as 4 manobras (Inspeção, Palpação, Percussão, Ausculta)?
2. [ ] O nome **SIMMIT** em roxo executa o **Flip** ao abrir o menu?
3. [ ] Cada clique em manobra propedêutica gasta a Stamina correspondente?
4. [ ] O feedback da IA para o exame físico é visualmente diferente das falas do paciente?

---
**Mentalidade:** "O exame físico é a arte de ouvir o corpo. O SIMMIT é a ferramenta que traduz essa arte em maestria médica."
