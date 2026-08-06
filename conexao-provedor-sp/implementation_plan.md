# Plano de Implementação — Conexão Provedor SP

Este documento descreve a estrutura de desenvolvimento, as diretrizes de design e a validação necessárias para criar a Landing Page do evento **Conexão Provedor SP - LP - 01 - 30.07.2026**. O desenvolvimento seguirá estritamente as regras de UX/UI do arquivo [.agents/AGENTS.md](file:///d:/IXC-SOFT/Conexão Provedor SP/Conexão Provedor SP - LP - 01 - 30.07.2026/.agents/AGENTS.md).

---

## User Review Required

> [!IMPORTANT]
> **Definição de Preço dos Passaportes**
> Na cópia fornecida em `copy.txt`, os preços do **Passaporte Insider** e do **Passaporte Starter** estão demarcados como `R$ XXX,XX`. 
> *   Deseja manter `R$ XXX,XX` literalmente ou devemos substituí-los por valores específicos (ex: `R$ 297,00` e `R$ 197,00`)?
> *   *Nota:* De acordo com a regra de integridade de copy, não alteraremos sem a sua autorização.

> [!NOTE]
> **Geração de Imagens (Assets)**
> Como a pasta `/assets` está vazia, planejamos gerar imagens reais e corporativas com nossa ferramenta de inteligência artificial (`generate_image`) para a Hero e para as fotos da Galeria (1 a 4). 

---

## Estrutura da Landing Page

A página será estruturada de forma semântica em um único arquivo HTML `index.html` e um arquivo CSS `style.css` na raiz do workspace.

### Detalhamento das Seções:

1.  **Header & Hero Section (1ª Dobra):**
    *   **Esquerda:** Logotipo (texto/SVG), Título principal `<h1>Conexão Provedor</h1>`, data/local em destaque e subtítulo tecnológico, além de um badge discreto informando "Em breve: Campina Grande - PB".
    *   **Direita:** Imagem premium do evento com um glow radial `#00E8D7` desfocado atrás (profundidade em relação ao fundo `#4C5464`).
    *   **CTA:** Botão "Garantir ingresso" ancorando para a seção de passaportes.

2.  **O Encontro (2ª Dobra):**
    *   Título `<h2>` focado na evolução de resultados.
    *   Apresentação em grid de 3 colunas para os temas principais (Inadimplência, Churn e Reforma Tributária), utilizando cards translúcidos sutis (vidro escuro sobre o background único).

3.  **Passaportes (3ª Dobra):**
    *   Grid com 3 cards:
        1.  *Passaporte Insider:* Com destaque especial, badge "Mais Vendido" ou "Exclusivo Clientes IXC Soft", benefícios listados com checkmarks `#00E8D7` e destaque ao bônus do treinamento fechado no dia 17/09.
        2.  *Passaporte Starter:* Card corporativo e limpo.
        3.  *Campina Grande:* Card desabilitado ou com visual de "Em Breve / Pré-venda" com visual futurista.

4.  **Última Edição (4ª Dobra):**
    *   Player de vídeo estilizado fictício (com thumbnail premium de tecnologia e ícone de play com efeito de pulso de brilho).
    *   Galeria de 4 fotos em formato grid responsivo. Cada foto conterá uma legenda flutuante sobreposta ao passar o mouse.

5.  **Agenda (5ª Dobra):**
    *   Layout minimalista e tecnológico dividindo as informações de local ("Onde") e datas ("Quando").

6.  **Redes Sociais & Rodapé (6ª Dobra):**
    *   Ícones SVG unificados (com a mesma espessura de traço e tamanho de 24px) para Instagram, Facebook, LinkedIn e YouTube.
    *   Copyright e créditos IXC Soft.

---

## Design Tokens e Estilização (CSS)

Seguindo estritamente as especificações do arquivo `estilo.txt` e o prompt:

*   **Background Principal:** `#4C5464` (fundo único por toda a página).
*   **Cor de Destaque / Elementos Principais:** `#00E8D7` (utilizado para CTAs primários, bordas ativas, glows e links).
*   **Tipografia:** Montserrat (carregada do Google Fonts) com pesos 400 (regular), 600 (semi-bold) e 700 (bold).
*   **Linhas Separadoras de Seções:**
    ```css
    .section-divider {
        height: 1px;
        width: 100%;
        background: radial-gradient(circle, rgba(0, 232, 215, 0.4) 0%, rgba(0, 232, 215, 0) 70%);
        margin: 64px 0;
    }
    ```

---

## Assets a Serem Gerados (Via AI `generate_image`)

Para criar um design de alta fidelidade e acabamento premium (Stripe/Vercel level):
1.  `hero_event_image.png`: Uma imagem abstrata e tecnológica contendo conexões de rede 3D de alta qualidade, fibras ópticas brilhantes em azul e ciano, transmitindo a ideia de "Conexão Provedor".
2.  `gallery_photo_1.png`: Representação de palestra com slide na tela em ambiente corporativo moderno.
3.  `gallery_photo_2.png`: Networking moderno em evento de tecnologia de ponta.
4.  `gallery_photo_3.png`: Consultoria e conversa com especialistas em tecnologia.
5.  `gallery_photo_4.png`: Servidores, cabos de fibra óptica de última geração e equipamentos modernos de datacenter.

---

## Interações e Micro-animações

*   **CTAs:** Efeito de glow sutil ao passar o mouse, com transição suave de 0.3s.
*   **Cards de Passaporte e Galeria:** Leve elevação vertical (`transform: translateY(-4px)`) com sombra difusa e aumento discreto de opacidade de bordas.
*   **Scroll Suave:** Scroll animado ao clicar no botão "Garantir ingresso".

---

## Plano de Verificação

### Testes Visuais e Responsividade
*   **Desktop:** 1440px
*   **Tablet:** 1024px, 810px, 768px
*   **Mobile:** 390px, 375px, 360px
*   Garantir a ausência de overflow horizontal (`overflow-x: hidden` no `body`).

### Deploy e Publicação
*   Deploy no Surge (exemplo: `conexao-provedor-sp.surge.sh` ou domínio similar).
*   Geração do link público e testável direto da Landing Page.
