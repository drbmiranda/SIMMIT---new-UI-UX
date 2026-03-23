# 🛠️ AGENTS.md — PROTOCOLO DE DEBUG & REFINAMENTO (DEMO DAY)
**Projeto:** SIMMIT-beta | **Caminho Local:** `C:\dev\SIMMIT-beta`

Este documento define as regras de correção crítica para a versão final do SIMMIT. O objetivo é eliminar bugs de interface, garantir a personalização correta do usuário e implementar feedbacks de gamificação impossíveis de ignorar.

---

## 🔡 1. INTEGRIDADE LINGUÍSTICA (PT-BR)
* **Encoding:** Todo o projeto deve utilizar estritamente `UTF-8`.
* **Zero Bugs de Acento:** Nenhuma página (Home, Dashboard, Pathway, Flashcards, Questões) pode apresentar caracteres corrompidos.
* **Revisão:** Validar todos os arquivos `.json` e `.tsx` para garantir que "Simulação", "Ação" e "Intervenção" e afins estejam grafados corretamente em todos os componentes.

---

## 👤 2. PERSONALIZAÇÃO DE USUÁRIO (SOBERANIA DO NOME)
* **Boas-vindas na Home:** Substituir o texto estático "Bom dia Dra. B" por uma saudação dinâmica.
    * *Lógica:* `Bem-vindo(a), {user_name}`.
* **Feedback do Preceptor:** A IA nunca deve utilizar o termo "aluno".
    * *Regra de Ouro:* Referir-se sempre como `Dr. {user_name}` ou `Dra. {user_name}` conforme o perfil identificado.
* **Onboarding:** Corrigir a desformatação das perguntas de triagem no primeiro acesso via Google Login. O layout deve seguir o **Style Guide Frutiger Aero** e cores da marca ja presentes no app. (vítreo e centralizado).

---

## 🏥 3. CONSISTÊNCIA CLÍNICA E NARRATIVA
O Gemini 3 Flash deve manter a coerência biológica e demográfica em todos os cenários:
* **Ficha vs. Caso:** O nome do paciente deve ser idêntico na Ficha Clínica, na Queixa Principal e no diálogo do Chat.
* **Especialidade x Demografia:**
    * **Obstetrícia/GO:** Somente pacientes do sexo feminino em idade fértil/gestantes.
    * **Pediatria:** Nomes e idades obrigatoriamente infantis/adolescentes.
    * **Clínica/Cirurgia/Preventiva:** Idades, nomes e perfis condizentes com a patologia (ex: idoso para ICC, jovem para apendicite).

---

## 📱 4. UX/UI MOBILE (CHAT E INTERAÇÃO)
O chat deve ser otimizado para a máxima área útil em dispositivos móveis:
* **Full Screen Chat:** Na versão mobile e desktop, o chat ocupa 100% da tela (`100dvh`).
* **Input Dinâmico:** A barra de digitação deve crescer verticalmente (auto-expand) conforme o volume de texto.
* **Botão "+" :** Substituir o botão "Painel de Exame" pelo símbolo **"+"**. Ele deve abrir o Menu de Intervenções com animação **Framer Motion**.

---

## ✨ 5. FEEDBACK VISUAL CENTRALIZADO (PONTUAÇÃO)
Para garantir o reforço positivo (ou correção) imediato, o sistema de pontos deve ser intrusivo:
* **Central Pop-up:** Os pontos por interação (ex: `0`, `+10`, `+20`, `-10`) devem aparecer **no centro exato da tela**, tanto no Mobile quanto no Desktop.
* **Animação (GSAP):** Utilizar um efeito de `Spring Ease` onde o número surge, pulsa e desaparece, tornando impossível para o usuário não notar o feedback.
* **Estilo:** Glow em **Lavender Mist (#c1bcfa)** para pontos positivos e tons de alerta para negativos.

---

## 📋 CHECKLIST DE AUDITORIA PRÉ-DEMO
1. [ ] O nome do usuário aparece corretamente na Home e no Feedback?
2. [ ] A IA utilizou "Dr./Dra." em vez de "aluno" em todas as instâncias?
3. [ ] Os pacientes de GO e Pediatria são condizentes com as especialidades?
4. [ ] O botão "+" no mobile abre o menu e a barra de digitação expande corretamente?
5. [ ] **Auditoria de Feedback:** Os pontos de interação aparecem no centro da tela com animação fluida?
6. [ ] **Auditoria Linguística:** Todos os acentos e símbolos PT-BR estão renderizando sem erros?

---
**Mentalidade de Debug:** "No Demo Day, cada acento correto e cada feedback centralizado reforça a autoridade médica da plataforma. O SIMMIT deve ser impecável, fluido e visualmente recompensador."