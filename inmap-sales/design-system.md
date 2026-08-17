# Inmap Sales — Design System

**Versão 1.1 · Fusão entre a energia de microinterações do site de referência (NectArr/B2B Growth template) e o Manual de Marca Inmap Sales V6 · Adicionada seção 2.6 (Responsividade obrigatória)**

---

## 1. Visão Geral & Princípios

Inmap Sales é o "parceiro de vendas" das empresas que usam o IXC Provedor: um CRM geoinformado, jovem, direto e confiável. O site de referência analisado usa uma linguagem de motion muito específica — cards que flutuam suavemente, textos que entram em *clip-in* e *fade-up* escalonados, chat bubbles que reagem em cascata no hover, botões com halo de brilho ("shine") e leve *scale-down* ao clique. Essa energia é ótima: comunica dinamismo e proximidade sem parecer barulhenta. Nós a mantemos **inteiramente na camada de comportamento**, mas trocamos toda a camada visual (cor, tipografia, forma) pela identidade Inmap Sales — azul-marinho confiável (`#002554`), laranja enérgico da marca (`#EE7D00`/`#F6A500`), cantos levemente arredondados (não pill-shaped em excesso) e a dupla tipográfica Montserrat (títulos) + Roboto (corpo).

**Princípios:**
1. **Confiança primeiro, energia depois.** Motion nunca compete com legibilidade: durações curtas (150–500ms), sem bounce exagerado.
2. **Herói + Criador.** Componentes "resolvem" (estados claros, feedback imediato) e "inovam" (microinterações que surpreendem sem distrair — halo, flutuação sutil, chips animados).
3. **Tom de voz em todo lugar que há copy.** Botões, erros, vazios e tooltips falam como um parceiro descontraído e direto, nunca robótico.
4. **Acessível e responsivo por padrão, não como adendo.** Contraste, foco visível, `prefers-reduced-motion` e comportamento em todos os breakpoints (ver 2.6) são requisitos de aceite de qualquer componente ou dobra — não algo a lembrar ou pedir depois, e não precisa ser reescrito prompt a prompt: está fixado aqui.

---

## 2. Foundations

### 2.1 Cores

#### Paleta de marca

| Token | Hex | Uso |
|---|---|---|
| `color.brand.navy` | `#002554` | Cor institucional (IXC Soft), fundos escuros, texto sobre claro |
| `color.brand.orange-600` | `#EE7D00` | Laranja escuro do logo — CTA primário, ícones de destaque |
| `color.brand.orange-400` | `#F6A500` | Laranja claro do logo — gradientes, hover, ilustração |
| `color.support.green` | `#8EDD00` | Sucesso, badges "conectado/ativo" |
| `color.support.purple` | `#4F0EA1` | Apoio criativo — tags, gráficos, elementos secundários |
| `color.support.yellow` | `#F4C500` | Alerta/destaque leve |
| `color.support.red` | `#D50040` | Erro, estados destrutivos |

#### Escalas de tinta/sombra (tints & shades)

Cada cor principal ganha uma escala de 50 (quase branco) a 900 (quase preto), gerada por mistura direta com branco/preto a partir do tom-base da marca (destacado em **negrito** = hex oficial do manual). Use para hover/active states, fundos sutis, gráficos e ilustrações — sem inventar tons fora da família.

| Escala | Navy | Laranja | Verde | Roxo | Amarelo | Vermelho |
|---|---|---|---|---|---|---|
| 50 | `#F2F4F6` | `#FEF9F2` | `#F9FDF2` | `#F6F3FA` | `#FEFCF2` | `#FDF2F5` |
| 100 | `#E0E5EA` | `#FDEFE0` | `#F1FBE0` | `#EAE2F4` | `#FEF8E0` | `#FAE0E8` |
| 200 | `#B8C2CF` | `#FADBB8` | `#DFF5B8` | `#CEBCE5` | `#FCEFB8` | `#F3B8CA` |
| 300 | `#8F9FB4` | `#F8C68F` | `#CDF08F` | `#B295D6` | `#FAE58F` | `#ED8FAB` |
| 400 | `#526B8B` | `#F3A752` | `#B2E852` | `#875BBF` | `#F8D852` | `#E2527D` |
| 500 | `#29486F` | `#F19229` | `#A0E229` | `#6B35B0` | `#F6CE29` | `#DC295F` |
| **600** | **`#002554`** | **`#EE7D00`** | **`#8EDD00`** | **`#4F0EA1`** | **`#F4C500`** | **`#D50040`** |
| 700 | `#001F47` | `#C86900` | `#77BA00` | `#420C87` | `#CDA500` | `#B30036` |
| 800 | `#001939` | `#A25500` | `#619600` | `#360A6D` | `#A68600` | `#91002C` |
| 900 | `#00132C` | `#7C4100` | `#4A7300` | `#290754` | `#7F6600` | `#6F0021` |

Guia rápido de uso:
- **50–100:** fundos de badge/alert, hover de item de lista.
- **200–300:** bordas decorativas, ilustrações, gráficos (fatias de chart).
- **400–500:** estados de hover/active de elementos que já usam a cor 600 em repouso.
- **600:** cor oficial da marca — ação primária, ícone de destaque.
- **700–900:** texto sobre fundo claro quando a 600 não bate contraste (ex. laranja 700 `#C86900` ainda é mais seguro que `#EE7D00` para texto ≥16px), ou fundo escuro/dark mode.

#### Neutros

| Token | Hex | Uso |
|---|---|---|
| `color.neutral.900` | `#191919` | Texto principal sobre fundo claro |
| `color.neutral.200` | `#E2E0DC` | Fundo cinza claro, divisores, cards secundários |
| `color.neutral.0` | `#FFFFFF` | Fundo base, texto sobre escuro |

#### Variantes acessíveis (texto/UI)

O manual define `#F6A500` (laranja claro) como cor "de logo", mas sobre fundo branco ele **falha** em contraste de texto (≈1.9:1). Regra: **laranja claro é decorativo, nunca texto**. Para link/texto laranja, use a variante escurecida abaixo.

| Token | Hex | Contraste sobre branco | Uso |
|---|---|---|---|
| `color.brand.orange-600` (`#EE7D00`) | — | 2.7:1 | Ainda insuficiente para texto pequeno — usar só ≥24px/bold (3:1 UI) ou sobre navy |
| `color.text.orange-accessible` | `#B85E00` | 4.6:1 ✅ AA | Links e texto laranja sobre branco |
| `color.text.purple-accessible` | `#4F0EA1` | 8.9:1 ✅ AAA | Texto roxo sobre branco (já passa nativamente) |
| `color.text.green-on-white` | `#4B7A00` | 4.9:1 ✅ AA | Texto "sucesso" sobre branco (verde puro `#8EDD00` só decorativo/ícone) |
| `color.text.red-accessible` | `#D50040` | 5.6:1 ✅ AA | Texto de erro sobre branco (passa nativamente) |
| `color.text.yellow-on-dark` | `#F4C500` sobre `#191919` | 9.8:1 ✅ AAA | Amarelo só funciona como texto sobre fundo escuro |

#### Matriz de contraste (combinações aprovadas)

| Fundo | Texto | Contraste | Nível |
|---|---|---|---|
| `#FFFFFF` | `#191919` | 17.5:1 | AAA |
| `#FFFFFF` | `#002554` | 14.7:1 | AAA |
| `#002554` | `#FFFFFF` | 14.7:1 | AAA |
| `#002554` | `#F6A500` (laranja claro) | 7.1:1 | AAA — aqui o laranja claro pode ser texto |
| `#E2E0DC` | `#191919` | 14.9:1 | AAA |
| `#FFFFFF` | `#B85E00` (laranja acessível) | 4.6:1 | AA |
| `#EE7D00` | `#FFFFFF` | 2.9:1 | Falha para texto pequeno — só título ≥24px/700 (3:1 UI/large text) |
| `#8EDD00` | `#191919` | 12.4:1 | AAA — texto escuro sobre chip verde, ok |

**Regra de bordas/ícones de estado (3:1 mínimo):** bordas de input, ícones outline e divisores de foco usam no mínimo `#767676`-equivalente de contraste; nunca cinza `#E2E0DC` puro como único indicador de estado.

### 2.2 Tipografia

- **Display/Títulos:** Montserrat 600–800 — usar em H1–H3, CTAs, badges de destaque.
- **Corpo/UI:** Roboto 400–500 — parágrafos, labels, inputs, tabelas.
- **Escala modular (base 16px, ratio 1.25):**

| Token | Tamanho | Peso | Line-height | Uso |
|---|---|---|---|---|
| `text.display` | 56px / 3.5rem | Montserrat 800 | 1.05 | Hero |
| `text.h1` | 40px / 2.5rem | Montserrat 700 | 1.1 | Título de página |
| `text.h2` | 32px / 2rem | Montserrat 700 | 1.15 | Título de seção |
| `text.h3` | 24px / 1.5rem | Montserrat 600 | 1.25 | Título de card |
| `text.body-lg` | 18px | Roboto 400 | 1.6 | Intro/subtítulo |
| `text.body` | 16px | Roboto 400 | 1.6 | Corpo padrão |
| `text.body-sm` | 14px | Roboto 400 | 1.5 | Legendas, metadados |
| `text.caption` | 12px | Roboto 500 | 1.4 | Badges, timestamps (mínimo absoluto — evitar abaixo disso) |

**Regras de acessibilidade tipográfica:** nunca abaixo de 12px; corpo de texto nunca abaixo de 16px em fluxo de leitura longo; `line-height` mínimo 1.5 no corpo (WCAG 1.4.8); permitir zoom até 200% sem quebra (usar `rem`/`%`, nunca `px` fixo em containers de texto).

### 2.3 Espaçamento & Grid

Base **8px**. Escala: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128`.

- Grid de 12 colunas, `max-width: 1440px`, gutter 32px (desktop) / 16px (mobile).
- Breakpoints: `sm 640` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1440`.
- Raio de borda (deriva do "pin" de mapa da marca — formas suaves, não totalmente pill): `radius.sm 8px` · `radius.md 12px` · `radius.lg 20px` · `radius.full 999px` (reservado para badges/avatares/toggle, nunca para cards grandes — isso é do template de referência, não da marca).

### 2.4 Animação & Motion

Extraído do site de referência e adaptado com durações mais contidas (a marca é "confiável" antes de "descontraída"):

| Token | Valor | Uso |
|---|---|---|
| `ease.standard` | `cubic-bezier(0.25, 1, 0.5, 1)` | Entradas, hover de cards, botões |
| `ease.out` | `ease-out` | Fade/slide simples |
| `ease.in-out-slow` | `cubic-bezier(0.4, 0, 0.6, 1)` | Pulsos e loops longos |
| `duration.instant` | 100ms | Feedback de clique (`:active`) |
| `duration.fast` | 200ms | Hover de link/ícone |
| `duration.base` | 300ms | Hover de card, transform |
| `duration.moderate` | 400ms | Botão com shine/glass |
| `duration.slow` | 600–800ms | Entrada de seção (fade-up, clip-in) |
| `duration.ambient` | 4–6s | Float/pulse decorativos, loop infinito |

**Padrões de microinteração (herdados da referência, com timing recalibrado):**
- **Entrada de seção:** `fadeUp` — `opacity 0→1`, `translateY 16px→0`, 600ms `ease-out`, com `stagger` de 100–150ms entre filhos.
- **Hover de card:** `scale(1.01)` + sombra +1 nível, 300ms `ease.standard`. Nunca `scale` > 1.02 (evita jitter de texto).
- **Hover de botão primário:** troca de tom de fundo (não de cor de marca) + leve brilho diagonal (shine) opcional em CTAs hero, 400ms.
- **Clique de botão:** `scale(0.98)`, 100–150ms — feedback tátil imediato.
- **Ícone de seta em link/CTA:** `translateX(4px)` no hover do grupo, 200ms.
- **Indicador "ao vivo" (status dot):** `pulse` suave de opacidade, 4s loop — reservado a estados reais (ex.: "SDR ativo agora"), nunca decorativo puro.
- **Elemento flutuante (ilustração/card de prova social):** `float` translateY ±6px, 6s `ease-in-out infinite` — só em elementos não-interativos e não-textuais.

**Regra global `prefers-reduced-motion`:**

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .float, .pulse-slow, .animate-bounce { animation: none !important; }
}
```

Todo componente com animação de entrada deve também renderizar corretamente com `opacity:1`/posição final quando reduzido — a animação é um "extra", não um pré-requisito de conteúdo visível.

### 2.5 Sombras & Elevação

| Token | Valor | Uso |
|---|---|---|
| `elevation.0` | nenhuma | Elementos no plano base |
| `elevation.1` | `0 1px 2px rgba(0,37,84,0.06)` | Inputs, chips |
| `elevation.2` | `0 4px 12px rgba(0,37,84,0.08)` | Cards em repouso |
| `elevation.3` | `0 8px 24px rgba(0,37,84,0.12)` | Cards em hover, popovers |
| `elevation.4` | `0 16px 40px rgba(0,37,84,0.16)` | Modais, dropdowns abertos |
| `elevation.focus` | `0 0 0 3px #FFFFFF, 0 0 0 6px #002554` | Anel de foco sobre qualquer fundo |

Z-index: `base 0` · `dropdown 100` · `sticky-nav 200` · `overlay 900` · `modal 1000` · `toast 1100`.

---

### 2.6 Responsividade (obrigatório em toda dobra/componente)

**Não é opcional e não precisa ser repetido em cada prompt — é requisito de aceite de qualquer entrega, no mesmo nível de prioridade que acessibilidade (ver Princípio 4).**

**Abordagem:** mobile-first. Construir a partir de 375px e escalar para cima, nunca o contrário.

**Breakpoints de teste obrigatórios:**
| Breakpoint | Largura | Contexto |
|---|---|---|
| `xs` | 375px | Mobile padrão (iPhone SE/mini) |
| `sm` | 640px | Mobile grande / phablet |
| `md` | 768px | Tablet retrato |
| `lg` | 1024px | Tablet paisagem / laptop pequeno |
| `xl` | 1280px | Desktop padrão |
| `2xl` | 1440px | Desktop grande (`max-width` do grid) |

Toda dobra entregue deve ser conferida visualmente nesses 6 pontos antes de aprovação — não só "encolher a janela e ver se não quebra".

**Regras de layout:**
- Grids de 2+ colunas colapsam para **1 coluna abaixo de 900px** (breakpoint entre `md` e `lg`, ajustar caso a caso conforme conteúdo).
- Nenhum elemento de texto ou imagem pode causar `overflow-x` horizontal em nenhum breakpoint — `overflow-x: hidden` no `body` é rede de segurança, não solução.
- Seções com fundo de destaque (dobras dark, blocos de CTA) mantêm o mesmo `border-radius` em mobile, mas reduzem o `padding` interno proporcionalmente (ex.: `64px 56px` desktop → `40px 24px` mobile).

**Regras de tipografia fluida:**
- `text.display` (56px) e `text.h1` (40px) devem reduzir em mobile — usar `clamp()` em vez de breakpoint fixo sempre que possível: ex. `font-size: clamp(28px, 6vw, 56px)`.
- Nunca reduzir corpo de texto (`text.body`) abaixo de 16px, mesmo em mobile (regra de acessibilidade 2.2 continua valendo).

**Regras de mídia:**
- Imagens e vídeos sempre com `max-width: 100%`, `height: auto` (ou `object-fit: cover` dentro de container com `aspect-ratio` definido) — nunca dimensão fixa em `px` que force scroll.
- Vídeos de hero/demonstração: carregar versão comprimida único para todos os tamanhos (não é necessário source set por breakpoint neste projeto), mas o container deve se adaptar via `aspect-ratio`, não `height` fixa.

**Regras de interação/toque:**
- Toda área clicável (botão, link, ícone-ação, aba/tab) com no mínimo **44×44px** em qualquer breakpoint — já coberto em Botões (3.1), mas vale para *todo* elemento interativo, incluindo abas tipo "pastas" e itens de navbar mobile.
- Elementos com `:hover` como único indicador de estado precisam de equivalente em toque (ex. `:focus`/`:active` visível, ou o estado já aparente sem hover) — mobile não tem hover persistente.

**Regra de aceite:** nenhuma dobra é considerada "pronta" sem passar nos 6 breakpoints acima sem overflow, sem texto cortado, sem botão menor que 44px, e sem imagem/vídeo distorcido.

---

## 3. Components

### 3.1 Botões

**Anatomia:** container + label (Montserrat 600, 14–16px) + ícone opcional (leading/trailing).

**Variações:**
- **Primary** — fundo `#002554`, texto branco. CTA de conversão máxima.
- **Accent / CTA laranja** — fundo `linear-gradient(135deg, #C86900, #A25500)` (`--gradient-orange-cta`), texto branco. Contraste branco/#A25500 = **5,48:1 ✔ WCAG AA**. Uso: CTA hero principal, destaque máximo de conversão. **Não usar** o gradiente claro `#EE7D00→#F6A500` com texto branco — contraste 2,9:1/1,9:1, reprovado em AA.
- **Secondary/Outline** — borda `#002554` 1.5px, texto `#002554`, fundo transparente.
- **Ghost** — sem borda/fundo, texto `#002554`, sublinhado no hover.
- **Destructive** — fundo `#D50040`, texto branco.

**Estados:**
| Estado | Tratamento |
|---|---|
| Default | conforme variação |
| Hover | escurece 8% o fundo (`filter: brightness(0.92)`) + ícone trailing `translateX(4px)`, 200ms |
| Active/Pressed | `scale(0.98)`, 100ms |
| Focus-visible | anel duplo `elevation.focus`, nunca `outline: none` sem substituto |
| Disabled | opacidade 40%, `cursor: not-allowed`, remove hover/active |
| Loading | label some, spinner 16px substitui ícone; `aria-busy="true"`; botão permanece com mesma largura (evita layout shift) |

**Motion:** hover 200ms `ease.standard`; loading spinner `rotate 360deg linear infinite` 800ms — some no reduced-motion, substituído por texto "Carregando…".

**Copy (tom de voz):** verbos de ação diretos e próximos — *"Agende uma call estratégica"*, *"Falar com Especialista"*, nunca "Enviar" seco ou "Clique aqui".

**Acessibilidade:**
- `<button>` nativo sempre que dispara ação; `<a>` só quando navega.
- Ícone-apenas exige `aria-label`.
- Área mínima de toque 44×44px.
- Estado `disabled` também recebe `aria-disabled="true"` quando o elemento precisa continuar focável (ex. explicar por que está desabilitado via tooltip).

### 3.2 Cards

**Anatomia:** container com `radius.lg` (20px) + padding 24–32px + (ícone/imagem) + título Montserrat 600 + corpo Roboto + link/ação opcional.

**Variações:** Elevado (branco, `elevation.2`) · Contraste (fundo `#002554`, texto branco) · Destaque (fundo `#EE7D00`→`#F6A500` gradiente 135deg, reservado a 1 card por seção) · Ghost (borda 1px `#E2E0DC`, sem sombra).

**Estados:** Default (`elevation.2`) → Hover (`scale(1.01)` + `elevation.3`, 300ms `ease.standard`) → Focus (quando card é clicável por completo, `elevation.focus` + `role="link"`/`tabindex="0"`).

**Comportamento de animação:** entrada em viewport via `fadeUp` com stagger 100ms entre cards de uma mesma grid (usar `IntersectionObserver`, não scroll listener). Elementos internos (ex. bolhas de chat dentro do card, como no site de referência) podem ter delay incremental de 75ms cada no hover do card pai — mantém a "cascata" da referência, sem exagerar.

**Acessibilidade:** se o card todo é clicável, o link/heading interno deve ser o alvo real do foco (`<a>` envolvendo o card ou `stretched-link` pattern); nunca `onClick` em `<div>` sem `role`/`tabindex`/handler de teclado (`Enter`/`Space`).

### 3.3 Inputs

**Anatomia:** label (Roboto 500, 14px) + campo (`radius.sm`, borda 1.5px `#E2E0DC`) + texto de ajuda/erro abaixo + ícone opcional.

**Estados:**
| Estado | Tratamento |
|---|---|
| Default | borda `#E2E0DC`, fundo branco |
| Hover | borda `#191919` a 40% |
| Focus | borda `#002554` 2px + `elevation.focus`, 150ms |
| Erro | borda `#D50040` + ícone alerta + mensagem: *"Ops, esse campo precisa de atenção: [motivo específico]"* |
| Disabled | fundo `#E2E0DC` 50%, texto opacidade 50% |
| Loading (validação assíncrona) | spinner 14px à direita, `aria-busy` |

**Acessibilidade:** `<label for>` sempre associado (nunca placeholder-como-label); erro usa `aria-invalid="true"` + `aria-describedby` apontando para o `id` da mensagem; mensagem de erro anunciada via `role="alert"` (região live).

### 3.4 Modais

**Anatomia:** overlay (`rgba(0,37,84,0.5)`) + painel centralizado `radius.lg`, `elevation.4`, max-width 560px + header (título + botão fechar) + corpo + footer de ações.

**Comportamento de animação:** overlay `fade` 200ms; painel `scale(0.96)→1` + `opacity 0→1`, 300ms `ease.standard`. Fechar é o inverso, mas em 150ms (saída sempre mais rápida que entrada).

**Acessibilidade (crítico):**
- `role="dialog"` `aria-modal="true"` `aria-labelledby` (título) `aria-describedby` (corpo, se aplicável).
- **Focus trap**: foco move para o primeiro elemento interativo ao abrir; `Tab`/`Shift+Tab` circulam só dentro do modal; `Esc` fecha; ao fechar, foco retorna ao elemento que abriu o modal.
- Fundo (`body`) recebe `inert` ou `aria-hidden="true"` enquanto o modal está aberto.
- Reduced motion: remove o `scale`, mantém só `opacity`.

### 3.5 Navbar

**Anatomia:** logo (esquerda) + navegação (centro, Montserrat 500, 14px) + ações (direita: login ghost + CTA accent).

**Comportamento de animação:** ao rolar, navbar recebe `elevation.1` + fundo opaco (era transparente/blur no topo) — transição 200ms `background-color, box-shadow`. Links recebem sublinhado animado (`transform: scaleX(0→1)`, `transform-origin: left`, 200ms) no hover, não troca de cor abrupta.

**Acessibilidade:**
- `<nav aria-label="Principal">`.
- Item ativo marcado com `aria-current="page"`.
- Menu mobile: botão hambúrguer com `aria-expanded` + `aria-controls`; ao abrir, foco vai para o primeiro link; painel é um `role="dialog"` se cobre a tela ou lista simples com trap se for drawer.

### 3.6 Badges / Status chips

Pequenos indicadores (`radius.full`, padding 4px 12px, `text.caption`). Cores por semântica: sucesso (`#4B7A00` texto sobre `#EAF7D6`), alerta (`#8A6A00` texto sobre `#FDF1CC`), erro (`#D50040` texto sobre `#FCE5EC`), neutro/ativo (`#002554` texto sobre `#E2E0DC`).

**Motion:** dot pulsante só quando representa estado real "em andamento" (ex. "SDR prospectando"), 4s loop, `aria-live="polite"` se o texto ao lado muda dinamicamente.

**Copy:** curto e afirmativo — *"Conectado"*, *"Reunião confirmada"*, *"Aguardando resposta"* — nunca jargão técnico ("status: 200", "pending_sync").

---

## 4. Exemplos de código

### 4.1 Tokens CSS (custom properties)

```css
:root {
  --color-navy: #002554;
  --color-orange-600: #EE7D00;   /* decorativo: gradient clip-text, glows, ícones sem texto */
  --color-orange-400: #F6A500;   /* decorativo: end do gradiente de logo, badges de fundo */
  /* Tons acessíveis — usar sempre que laranja for fundo com texto branco por cima */
  --color-orange-700: #C86900;   /* start: branco/#C86900 = 4,0:1 ✔ AA large */
  --color-orange-800: #A25500;   /* end:   branco/#A25500 = 5,48:1 ✔ AA */
  --gradient-orange-cta: linear-gradient(135deg, #C86900, #A25500); /* CTA com texto branco */
  --color-green: #8EDD00;
  --color-purple: #4F0EA1;
  --color-yellow: #F4C500;
  --color-red: #D50040;
  --color-neutral-900: #191919;
  --color-neutral-200: #E2E0DC;
  --text-orange-accessible: #B85E00;
  --text-green-accessible: #4B7A00;

  --font-display: 'Montserrat', sans-serif;
  --font-body: 'Roboto', sans-serif;

  --ease-standard: cubic-bezier(0.25, 1, 0.5, 1);
  --duration-fast: 200ms;
  --duration-base: 300ms;
  --duration-slow: 600ms;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;

  --elevation-2: 0 4px 12px rgba(0, 37, 84, 0.08);
  --elevation-3: 0 8px 24px rgba(0, 37, 84, 0.12);
  --focus-ring: 0 0 0 3px #fff, 0 0 0 6px var(--color-navy);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 4.2 Botão primário (CSS)

```css
.btn-primary {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 15px;
  color: #fff;
  background: var(--color-navy);
  border: none;
  border-radius: var(--radius-md);
  padding: 12px 24px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: filter var(--duration-fast) var(--ease-standard),
              transform var(--duration-fast) var(--ease-standard);
}
.btn-primary:hover { filter: brightness(0.92); }
.btn-primary:active { transform: scale(0.98); }
.btn-primary:focus-visible { box-shadow: var(--focus-ring); outline: none; }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-primary .icon { transition: transform var(--duration-fast); }
.btn-primary:hover .icon { transform: translateX(4px); }

@media (prefers-reduced-motion: reduce) {
  .btn-primary:hover .icon { transform: none; }
}
```

### 4.3 Card com entrada em cascata (Tailwind + CSS)

```html
<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
  <div class="reveal-card" style="animation-delay: 0ms">…</div>
  <div class="reveal-card" style="animation-delay: 100ms">…</div>
  <div class="reveal-card" style="animation-delay: 200ms">…</div>
</div>
```

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
.reveal-card {
  animation: fadeUp 600ms ease-out both;
  border-radius: var(--radius-lg);
  box-shadow: var(--elevation-2);
  transition: box-shadow var(--duration-base) var(--ease-standard),
              transform var(--duration-base) var(--ease-standard);
}
.reveal-card:hover {
  transform: scale(1.01);
  box-shadow: var(--elevation-3);
}
@media (prefers-reduced-motion: reduce) {
  .reveal-card { animation: none; opacity: 1; transform: none; }
}
```

### 4.4 Modal acessível (estrutura)

```html
<div class="overlay" data-state="open">
  <div role="dialog" aria-modal="true" aria-labelledby="modal-title" class="modal-panel">
    <header>
      <h2 id="modal-title">Agende sua call estratégica</h2>
      <button aria-label="Fechar modal" class="btn-ghost-icon">×</button>
    </header>
    <div class="modal-body">…</div>
  </div>
</div>
```

```css
.overlay { background: rgba(0, 37, 84, 0.5); transition: opacity 200ms; }
.modal-panel {
  border-radius: var(--radius-lg);
  box-shadow: var(--elevation-4);
  animation: modalIn var(--duration-base) var(--ease-standard) both;
}
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}
@media (prefers-reduced-motion: reduce) {
  .modal-panel { animation: none; }
}
```

### 4.5 Status dot com `aria-live`

```html
<span class="status-chip" role="status" aria-live="polite">
  <span class="dot" aria-hidden="true"></span>
  Conectado
</span>
```

```css
.dot {
  width: 8px; height: 8px; border-radius: 999px;
  background: var(--color-green);
  animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse { 50% { opacity: 0.4; } }
@media (prefers-reduced-motion: reduce) { .dot { animation: none; } }
```
