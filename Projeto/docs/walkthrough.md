# Worldin — Walkthrough das Alterações

## Resumo

Implementadas 11 melhorias de UI/UX e funcionalidade no sistema Worldin.

---

## 1. Background do Login com Zoom Automático

render_diffs(file:///c:/Users/Victor%20Lobo/Desktop/Nova%20pasta/worldin/Projeto/apps/frontend/src/app/auth/login/login.css)

- Animação CSS `@keyframes zoomIn` faz scale 1.0 → 1.15 em 5s
- Troca de imagens a cada 5s já existia via `setInterval`
- Adicionado `OnDestroy` para limpar o interval

---

## 2. Validação de Email (rejeita `aa@aa`)

render_diffs(file:///c:/Users/Victor%20Lobo/Desktop/Nova%20pasta/worldin/Projeto/apps/frontend/src/app/auth/login/login.ts)

- Criado `emailDomainValidator` estático que verifica se o domínio contém pelo menos um ponto
- Aplicado em login e register
- Mensagens de erro específicas: "E-mail obrigatório", "Formato inválido", "Domínio inválido"

---

## 3. Limite de 50 Caracteres no Email

- `maxlength="50"` já existia no login e register HTML
- Validador `Validators.maxLength(50)` confirmado em ambos os formulários

---

## 4. Verificação de CPF em Tempo Real

**Backend** — novo endpoint:

render_diffs(file:///c:/Users/Victor%20Lobo/Desktop/Nova%20pasta/worldin/Projeto/apps/backend/src/users/users.controller.ts)

**Frontend** — handler `(blur)`:

render_diffs(file:///c:/Users/Victor%20Lobo/Desktop/Nova%20pasta/worldin/Projeto/apps/frontend/src/app/auth/register/register.ts)

- `GET /users/check-cpf/:cpf` retorna `{ available: boolean }`
- No blur do campo CPF, faz chamada HTTP e mostra aviso "CPF já está em uso"

---

## 5. Landing Page de Onboarding

**Novos arquivos:**
- [onboarding.ts](file:///c:/Users/Victor%20Lobo/Desktop/Nova%20pasta/worldin/Projeto/apps/frontend/src/app/onboarding/onboarding.ts)
- [onboarding.html](file:///c:/Users/Victor%20Lobo/Desktop/Nova%20pasta/worldin/Projeto/apps/frontend/src/app/onboarding/onboarding.html)
- [onboarding.css](file:///c:/Users/Victor%20Lobo/Desktop/Nova%20pasta/worldin/Projeto/apps/frontend/src/app/onboarding/onboarding.css)

- 4 steps: Explore o Mundo, Mapa 3D, Avaliações Reais, Comece Agora
- Partículas flutuantes animadas, ícones pulsantes, dots de navegação
- Flag `worldin_onboarding_done` no localStorage
- Redirect pós-login: onboarding se novo, home se já visto

---

## 6. Slider de Faixa de Preço

render_diffs(file:///c:/Users/Victor%20Lobo/Desktop/Nova%20pasta/worldin/Projeto/apps/frontend/src/app/home/home.html)

- Dual-range slider com dois thumbs (mín/máx)
- Exibe valores em tempo real: `R$ 0 — R$ 50.000`
- Thumbs customizados com hover glow
- Filtro dinâmico aplica em tempo real

---

## 7. Imagem no Card de Detalhes

render_diffs(file:///c:/Users/Victor%20Lobo/Desktop/Nova%20pasta/worldin/Projeto/apps/frontend/src/app/intercambio/intercambio.html)

- Fallback: se sem imagem, usa `loremflickr.com` com cidade+país (igual à listagem)

---

## 8. Botão Voltar no Card de Intercâmbio

- Botão `← Voltar` adicionado acima do card de detalhes
- Navega para `/home` via `routerLink`

---

## 9. Toggle Light/Dark Mode

**Novo arquivo:**
- [theme.service.ts](file:///c:/Users/Victor%20Lobo/Desktop/Nova%20pasta/worldin/Projeto/apps/frontend/src/app/theme.service.ts)

render_diffs(file:///c:/Users/Victor%20Lobo/Desktop/Nova%20pasta/worldin/Projeto/apps/frontend/src/styles.css)

- `ThemeService` com `toggle()`, persistência em localStorage
- Atributo `data-theme="light|dark"` no `<html>`
- Variáveis CSS completas para light mode
- Botão sol/lua em **todas** as navbars (home, intercâmbio, profile)

---

## 10. URL de Imagem Opcional

render_diffs(file:///c:/Users/Victor%20Lobo/Desktop/Nova%20pasta/worldin/Projeto/apps/frontend/src/app/intercambio/intercambio.ts)

- Removido `Validators.required` do campo `imagem`
- Label atualizado: "Imagem (URL) — opcional"

---

## 11. Mapa 3D com Globe.gl

render_diffs(file:///c:/Users/Victor%20Lobo/Desktop/Nova%20pasta/worldin/Projeto/apps/frontend/src/app/home/home.ts)

- Substituído Leaflet por `globe.gl` (lazy loaded: 4.25MB chunk)
- Globo com textura noturna da Terra, fundo estrelado, atmosfera dourada
- Marcadores nos destinos com labels HTML interativos
- Click em marcador → navega para detalhes do intercâmbio
- Auto-rotação suave

---

## Verificação

- ✅ Frontend build: **sucesso** (main.js 2.11MB + globe.gl 4.25MB lazy)
- ✅ Backend TypeScript: **0 erros**
- Os servidores `ng serve` e `npm run start:dev` precisam ser reiniciados para refletir as alterações

---

## Histórico de Correções e Polimentos Adicionais

**1. Login Background**
- Removido o efeito de zoom do CSS do login, mantendo apenas a transição fade-in suave entre as imagens de fundo.

**2. Persistência de Foto de Perfil**
- Atualizado o backend (`auth.service.ts`) para incluir a `foto_perfil` no payload de resposta do login, garantindo que o localStorage retenha a imagem ao reiniciar a sessão.

**3. Perfil do Usuário**
- Formatada a exibição do CPF para o padrão `000.000.000-00`.
- Adicionado um botão "Voltar" (linkando para Home) no topo do card de perfil.

**4. Performance e Modos de Visão na Home**
- **Três visões** ativadas: "Mundo" (3D), "Mapa" (2D) e "Cards".
- **Performance extrema:** Refatorado o método `applyFilters`. Em vez de destruir e recriar o Canvas WebGL a cada input do slider de preço, agora injetamos os novos dados diretamente (`this.globe.pointsData()`), removendo completamente as travadas (lags).
- **Mundo:** Rotação suavizada para `0.2` de velocidade e adição de "Rings" propulsores para cada marcador, aumentando o tamanho das localidades (`size: 1.5`) para destaque visual.

**5. Ajustes de UI/UX**
- **Onboarding:** As 4 etapas agora renderizam imagens dedicadas (carregadas no array do Typescript) acima dos textos, além dos ícones.
- **Slider de preço:** Definido `max-width: 400px` para que a barra não fique exageradamente comprida em telas desktop, como solicitado.
- **Contraste de Texto:** Ajustadas as variáveis `--text-secondary` tanto para dark quanto para light mode, garantindo melhor legibilidade de fontes de subtítulos e descrições.
