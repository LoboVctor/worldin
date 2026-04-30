# Worldin — Melhorias de UI/UX e Funcionalidade

Plano para implementar 10 alterações solicitadas no sistema Worldin.

---

## Alterações Propostas

### 1. Background do Login com Troca Automática + Zoom Gradual
**Arquivos:** [login.css](file:///c:/Users/Victor%20Lobo/Desktop/Nova%20pasta/worldin/Projeto/apps/frontend/src/app/auth/login/login.css)

- Adicionar animação CSS `@keyframes zoomIn` que faz zoom gradual (scale 1.0 → 1.15) durante 5s
- Combinar com a transição de opacidade já existente
- A troca de imagens já funciona a cada 5s via `setInterval` no `login.ts` — sem alteração no TS

---

### 2. Validação de Email Mais Detalhada
**Arquivos:** [login.html](file:///c:/Users/Victor%20Lobo/Desktop/Nova%20pasta/worldin/Projeto/apps/frontend/src/app/auth/login/login.html), [register.html](file:///c:/Users/Victor%20Lobo/Desktop/Nova%20pasta/worldin/Projeto/apps/frontend/src/app/auth/register/register.html), [login.ts](file:///c:/Users/Victor%20Lobo/Desktop/Nova%20pasta/worldin/Projeto/apps/frontend/src/app/auth/login/login.ts), [register.ts](file:///c:/Users/Victor%20Lobo/Desktop/Nova%20pasta/worldin/Projeto/apps/frontend/src/app/auth/register/register.ts)

- Adicionar validador custom `emailDomainValidator` que verifica se o domínio tem pelo menos um ponto (ex: rejeita `aa@aa`, aceita `aa@aa.com`)
- Mostrar mensagens separadas: "E-mail obrigatório", "Formato de e-mail inválido (ex: nome@dominio.com)"
- `maxlength="50"` já existe no HTML do login; garantir no register também

---

### 3. Limitar Email a 50 caracteres no Front
**Arquivos:** [login.html](file:///c:/Users/Victor%20Lobo/Desktop/Nova%20pasta/worldin/Projeto/apps/frontend/src/app/auth/login/login.html), [register.html](file:///c:/Users/Victor%20Lobo/Desktop/Nova%20pasta/worldin/Projeto/apps/frontend/src/app/auth/register/register.html)

- Já há `maxlength="50"` no login e register. Verificar e garantir que está correto em todos os campos de email do sistema (profile também).

---

### 4. Verificação de CPF em Uso (ao sair do campo)
**Arquivos:** [register.ts](file:///c:/Users/Victor%20Lobo/Desktop/Nova%20pasta/worldin/Projeto/apps/frontend/src/app/auth/register/register.ts), [register.html](file:///c:/Users/Victor%20Lobo/Desktop/Nova%20pasta/worldin/Projeto/apps/frontend/src/app/auth/register/register.html)

- Criar endpoint backend `GET /users/check-cpf/:cpf` que retorna `{ available: boolean }`
- No `register.ts`, adicionar método `checkCpfAvailability()` chamado no evento `(blur)` do campo CPF
- Mostrar aviso vermelho "CPF já está em uso" abaixo do campo

**Backend:** [users.controller.ts](file:///c:/Users/Victor%20Lobo/Desktop/Nova%20pasta/worldin/Projeto/apps/backend/src/users/users.controller.ts)

---

### 5. Landing Page de Onboarding
**Arquivos:** `[NEW] onboarding/onboarding.ts`, `[NEW] onboarding/onboarding.html`, `[NEW] onboarding/onboarding.css`, [app.routes.ts](file:///c:/Users/Victor%20Lobo/Desktop/Nova%20pasta/worldin/Projeto/apps/frontend/src/app/app.routes.ts)

- Página sucinta com 3-4 slides/steps explicando as funcionalidades:
  1. "Explore o Mundo" — pesquise intercâmbios por país, cidade, preço
  2. "Mapa Interativo" — veja destinos no globo 3D
  3. "Avaliações Reais" — leia relatos de alunos reais
  4. "Comece Agora" — botão para ir à home
- Mostrada após primeiro login (flag `onboarding_done` no `localStorage`)
- Design com stepper horizontal, animações suaves, fundo escuro premium

---

### 6. Filtro de Preço com Slider de Intervalo
**Arquivos:** [home.html](file:///c:/Users/Victor%20Lobo/Desktop/Nova%20pasta/worldin/Projeto/apps/frontend/src/app/home/home.html), [home.ts](file:///c:/Users/Victor%20Lobo/Desktop/Nova%20pasta/worldin/Projeto/apps/frontend/src/app/home/home.ts), [home.css](file:///c:/Users/Victor%20Lobo/Desktop/Nova%20pasta/worldin/Projeto/apps/frontend/src/app/home/home.css)

- Substituir o `<select>` de faixa de preço por um **dual-range slider** customizado com CSS puro
- Dois thumbs (mín e máx) com valores exibidos em tempo real: "R$ 0 — R$ 50.000"
- Atualizar `applyFilters()` para usar `priceMin` e `priceMax` em vez de `priceRange`

---

### 7. Mostrar Imagem no Card de Detalhes do Intercâmbio
**Arquivos:** [intercambio.html](file:///c:/Users/Victor%20Lobo/Desktop/Nova%20pasta/worldin/Projeto/apps/frontend/src/app/intercambio/intercambio.html)

- Na seção de detalhes (linha 109), o código já tem `*ngIf="intercambioDetail.imagem"` mas o fallback só mostra um ícone. 
- Adicionar fallback com imagem gerada automaticamente como nos cards da home: `https://loremflickr.com/800/600/` + cidade + país

---

### 8. Botão "Voltar" no Card de Intercâmbio
**Arquivos:** [intercambio.html](file:///c:/Users/Victor%20Lobo/Desktop/Nova%20pasta/worldin/Projeto/apps/frontend/src/app/intercambio/intercambio.html)

- Adicionar botão `← Voltar` acima do card de detalhes que navega de volta para `/home`
- Estilo `btn-outline-light` com ícone `bi-arrow-left`

---

### 9. Toggle Light/Dark Mode
**Arquivos:** [home.html](file:///c:/Users/Victor%20Lobo/Desktop/Nova%20pasta/worldin/Projeto/apps/frontend/src/app/home/home.html), [intercambio.html](file:///c:/Users/Victor%20Lobo/Desktop/Nova%20pasta/worldin/Projeto/apps/frontend/src/app/intercambio/intercambio.html), [styles.css](file:///c:/Users/Victor%20Lobo/Desktop/Nova%20pasta/worldin/Projeto/apps/frontend/src/styles.css), [app.ts](file:///c:/Users/Victor%20Lobo/Desktop/Nova%20pasta/worldin/Projeto/apps/frontend/src/app/app.ts), [app.html](file:///c:/Users/Victor%20Lobo/Desktop/Nova%20pasta/worldin/Projeto/apps/frontend/src/app/app.html), `[NEW] theme.service.ts`

- Criar `ThemeService` com toggle e persistência no `localStorage`
- Definir variáveis CSS para light mode em `[data-theme="light"]` no `styles.css`
- Adicionar botão de toggle (ícone sol/lua) na navbar de home, intercambio e profile

---

### 10. URL de Imagem Opcional no Intercâmbio
**Arquivos:** [intercambio.ts](file:///c:/Users/Victor%20Lobo/Desktop/Nova%20pasta/worldin/Projeto/apps/frontend/src/app/intercambio/intercambio.ts)

- Remover `Validators.required` do campo `imagem` no `intercambioForm`
- A entity no backend já tem `nullable: true` para imagem

---

### 11. Mapa 3D com Globe.gl
**Arquivos:** [home.ts](file:///c:/Users/Victor%20Lobo/Desktop/Nova%20pasta/worldin/Projeto/apps/frontend/src/app/home/home.ts), [home.html](file:///c:/Users/Victor%20Lobo/Desktop/Nova%20pasta/worldin/Projeto/apps/frontend/src/app/home/home.html), [home.css](file:///c:/Users/Victor%20Lobo/Desktop/Nova%20pasta/worldin/Projeto/apps/frontend/src/app/home/home.css), [index.html](file:///c:/Users/Victor%20Lobo/Desktop/Nova%20pasta/worldin/Projeto/apps/frontend/src/index.html)

- Instalar `globe.gl` (via npm) e substituir o mapa Leaflet por um globo 3D interativo
- Renderizar pins/marcadores nos destinos de intercâmbio
- Popup ao clicar num pin com título, preço, estrelas e link "Ver Detalhes"
- Visual escuro inspirado na referência (fundo estrelado, terra com luzes de cidades)

---

## Verificação

### Testes Manuais
- Testar troca de imagens no login com zoom
- Tentar cadastrar com email `aa@aa` — deve rejeitar
- Tentar digitar mais de 50 caracteres no email — deve bloquear
- Cadastrar CPF duplicado — aviso deve aparecer ao sair do campo
- Primeiro login → landing page de onboarding
- Testar slider de preço arrastando os thumbs
- Abrir card de intercâmbio sem imagem — fallback deve aparecer
- Botão voltar no card de intercâmbio
- Toggle light/dark mode
- Criar intercâmbio sem URL de imagem — deve funcionar
- Globo 3D exibindo marcadores nos destinos
