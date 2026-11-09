# Performance Blueprint — Landing Pages Estáticas

Blueprint técnico (checklist de build) para novas landing pages seguirem o mesmo
padrão de estrutura e performance desta página, que vem pontuando muito bem no
PageSpeed / Core Web Vitals.

> **Regra de ouro deste documento:** aqui **não se definem cores de marca**.
> A estrutura é agnóstica de identidade. Cada projeto preenche apenas o bloco
> `:root { --color-* }` e a `@font-face`. Trocar esses dois pontos reveste a
> página com a identidade de outra marca sem mexer na estrutura.

---

## 1. Como usar

1. Copie o **Boilerplate HTML** (seção 7) para o novo `index.html` / `pagina.html`.
2. Preencha somente:
   - o bloco `:root { ... }` (seção 2) com os tokens da marca;
   - os `@font-face` apontando para as fontes self-hosted do projeto;
   - conteúdo (título, meta tags, textos, links).
3. Percorra o **Checklist final** (seção 8) antes de publicar.

Nenhuma regra estrutural deste documento deve ser alterada por causa de cor.
Cor = tokens. Estrutura = igual em todos os projetos.

---

## 2. Design tokens genéricos (agnósticos de marca)

Defina apenas os tokens abaixo no `:root`. **Nunca** espalhe hex pelo CSS:
todo valor de marca deve ser referenciado por `var(--token)`.

| Token                   | Papel                                        | Exemplo (placeholder)   |
| ----------------------- | -------------------------------------------- | ----------------------- |
| `--color-bg`            | Fundo base da página                         | `#<BG>`                 |
| `--color-surface`       | Fundo de cards / superfícies elevadas        | `#<SURFACE>`            |
| `--color-surface-soft`  | Fundo secundário (faixas, gradientes)        | `#<SURFACE_2>`          |
| `--color-text`          | Texto principal                              | `#<TEXT>`               |
| `--color-text-muted`    | Texto secundário / parágrafos                | `#<TEXT_MUTED>`         |
| `--color-primary`       | Cor de destaque (CTA, ícones, links)         | `#<PRIMARY>`            |
| `--color-primary-strong`| Variante escura do destaque (hover/gradiente)| `#<PRIMARY_2>`          |
| `--color-on-primary`    | Texto sobre a cor primária                   | `#<ON_PRIMARY>`         |
| `--font-titles`         | Fonte de títulos                             | `'<TitleFont>', ...`    |
| `--font-body`           | Fonte de corpo                               | `'<BodyFont>', ...`     |
| `--radius-sm/md/lg`     | Raios de borda                               | `6px / 8px / 16px`      |
| `--shadow-*`            | Sombras (podem usar cor derivada do primário)| `0 4px 20px rgba(...)`  |
| `--transition-fast`     | Transição rápida                             | `all .2s cubic-bezier(.4,0,.2,1)` |
| `--transition-smooth`   | Transição suave                              | `all .4s cubic-bezier(.4,0,.2,1)` |

Recomendações neutras (não são cor de marca):
- Contraste mínimo **AA** entre `--color-text` e `--color-bg`.
- Overlays/"glass" usam transparência da própria cor: `rgba(<R>,<G>,<B>,.7)` derivado do token.

---

## 3. Checklist de performance (o que garantiu a nota)

### Fontes
- [ ] Fontes **self-hosted** (`.woff2`, variáveis/subsetadas), sem depender de Google Fonts.
- [ ] `@font-face` com `font-display: optional` (evita FOUT/CLS e rejeita a fonte se lenta).
- [ ] `preload` das fontes críticas: `as="font" type="font/woff2" crossorigin`.

### CSS
- [ ] **Critical CSS inline** no `<head>` (só o above-the-fold: reset, header, hero).
- [ ] CSS completo carregado **assíncrono**:
  `rel="preload" as="style" onload="this.onload=null;this.rel='stylesheet'"`.
- [ ] Fallback `<noscript><link rel="stylesheet" ...></noscript>`.
- [ ] Preferir CSS enxuto; evitar frameworks pesados quando HTML estático basta.

### Imagem LCP (hero)
- [ ] `preload as="image" fetchpriority="high"` com `imagesrcset` + `imagesizes`.
- [ ] `<picture>` com **WebP** em pelo menos 2 larguras (ex.: 280w / 420w).
- [ ] `width` e `height` explícitos no `<img>`.
- [ ] `aspect-ratio` no CSS do container/imagem (reserva espaço → anti-CLS).
- [ ] Otimizar/redimensionar as imagens antes de subir (arquivos de poucos KB).

### JavaScript e terceiros
- [ ] `preconnect` para domínios de terceiros (ex.: tag/analytics).
- [ ] Tags de analytics/ads (gtag) **não bloqueiam**: injetar o script só após
      interação (`click` / `touchstart`, `{ once: true }`).
- [ ] Registrar a conversão cedo (`gtag_report_conversion`) sem carregar o gtag ainda.
- [ ] Nenhum JS de layout; scripts no fim do `<body>`.

### Ícones e assets
- [ ] Ícones como **SVG inline** (sem icon font, sem requests extras).
- [ ] Favicon como **SVG `data:` URI** inline (zero request).
- [ ] Sem `@import` de CSS; sem downloads desnecessários.

### Infra
- [ ] `vercel.json` com `rewrites` para URLs limpas (sem `.html`).
- [ ] Sem dependências/build quando o projeto for HTML estático puro.

---

## 4. Anatomia da página (ordem das seções)

1. **Header fixo** — logo + botão CTA compacto.
2. **Hero** — badge de prova social + `h1` + subtítulo + CTA principal + imagem LCP.
3. **Diferenciais** — 3 cards curtos (ícone SVG + título + 1 frase).
4. **Serviços** — grid de cards + CTA.
5. **Prova social** — depoimentos + link para avaliações externas.
6. **Footer** — marca, contato, links de política.
7. **Botão flutuante** — CTA WhatsApp fixo, com `aria-label`.

Convenções:
- CTAs externos: `target="_blank" rel="noopener"`.
- Botões só-ícone sempre com `aria-label`.
- 1 único `h1` por página; hierarquia `h2`/`h3` coerente.
- Meta tags: `title`, `description`, `canonical`, Open Graph e Twitter Card.

---

## 5. Convenções de tags de marketing

- Definir `dataLayer`/`gtag()` inline (stub) no `<head>` — **sem** carregar o script.
- Script real (`gtag.js`) injetado uma única vez, na primeira interação.
- Cada CTA chama `gtag_report_conversion()` no `onclick`.
- IDs dos CTAs nomeados (`btn-header-*`, `btn-hero-*`, `btn-*-whatsapp`) para rastreio.

---

## 6. Regras de estrutura sem cores (resumo)

| Faça                                             | Não faça                                 |
| ------------------------------------------------ | ---------------------------------------- |
| Referenciar `var(--color-*)` em todo o CSS       | Escrever hex direto nos componentes      |
| Concentrar identidade no `:root{}` e `@font-face`| Duplicar valores de cor em vários lugares|
| Descrever papéis ("primário", "texto", "fundo")  | Nomear tokens pela cor (`--azul-certo`)  |
| Derivar sombras/overlays do token primário       | Fixar RGB mágico arbitrário              |

---

## 7. Boilerplate HTML

> Substitua somente os `#<PLACEHOLDER>`, nomes de fonte e conteúdo.
> A estrutura abaixo já segue todos os padrões de performance.

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <!-- Tag de terceiros: apenas preconnect + stub. Script real só após interação. -->
    <link rel="preconnect" href="https://www.googletagmanager.com">
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
    </script>
    <script>
    function gtag_report_conversion(url) {
      var callback = function () {
        if (typeof(url) != 'undefined') { window.location = url; }
      };
      gtag('event', 'conversion', {
          'send_to': '<CONVERSION_ID>',
          'value': 1.0,
          'currency': 'BRL',
          'event_callback': callback
      });
      return false;
    }
    </script>

    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- SEO -->
    <title><TITULO> | <MARCA></title>
    <meta name="description" content="<DESCRICAO>">
    <meta name="keywords" content="<PALAVRAS-CHAVE>">
    <link rel="canonical" href="https://<DOMINIO>/<slug>">

    <!-- Open Graph / Twitter (usar URL absoluta da imagem) -->
    <meta property="og:title" content="<TITULO>">
    <meta property="og:description" content="<DESCRICAO>">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://<DOMINIO>/<slug>">
    <meta property="og:image" content="https://<DOMINIO>/Public/<HERO>">
    <meta property="og:image:width" content="420">
    <meta property="og:image:height" content="525">
    <meta property="og:image:type" content="image/webp">
    <meta property="og:locale" content="pt_BR">
    <meta property="og:site_name" content="<MARCA>">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<TITULO>">
    <meta name="twitter:description" content="<DESCRICAO>">
    <meta name="twitter:image" content="https://<DOMINIO>/Public/<HERO>">

    <!-- Favicon SVG inline (zero request) -->
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2220%22 fill=%22%23<BG%22/><circle cx=%2250%22 cy=%2250%22 r=%2222%22 fill=%22%23<PRIMARY>%22/></svg>">

    <!-- LCP: preload da hero com srcset responsivo -->
    <link rel="preload" as="image" fetchpriority="high"
          href="Public/<HERO>"
          imagesrcset="Public/<HERO>-280.webp 280w, Public/<HERO> 420w"
          imagesizes="(max-width: 768px) 280px, 420px">

    <!-- Fontes self-hosted (preload das críticas) -->
    <link rel="preload" href="Public/fonts/<BodyFont>.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="Public/fonts/<TitleFont>.woff2" as="font" type="font/woff2" crossorigin>

    <!-- Critical CSS inline (above-the-fold: tokens, reset, header, hero) -->
    <style>
        @font-face{font-family:'<BodyFont>';font-style:normal;font-weight:300 700;font-display:optional;src:url('Public/fonts/<BodyFont>.woff2') format('woff2')}
        @font-face{font-family:'<TitleFont>';font-style:normal;font-weight:400 800;font-display:optional;src:url('Public/fonts/<TitleFont>.woff2') format('woff2')}

        /* ===== TOKENS — única fonte de cor da marca ===== */
        :root{
            --color-bg:#<BG>;
            --color-surface:#<SURFACE>;
            --color-surface-soft:#<SURFACE_2>;
            --color-text:#<TEXT>;
            --color-text-muted:#<TEXT_MUTED>;
            --color-primary:#<PRIMARY>;
            --color-primary-strong:#<PRIMARY_2>;
            --color-on-primary:#<ON_PRIMARY>;
            --font-titles:'<TitleFont>',-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
            --font-body:'<BodyFont>',-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
            --radius-sm:6px;--radius-md:8px;--radius-lg:16px;
            --transition-fast:all .2s cubic-bezier(.4,0,.2,1);
            --transition-smooth:all .4s cubic-bezier(.4,0,.2,1);
        }

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth;text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased}
        body{background-color:var(--color-bg);color:var(--color-text);font-family:var(--font-body);font-size:16px;line-height:1.6;overflow-x:hidden}
        .container{width:100%;max-width:1200px;margin:0 auto;padding:0 20px}

        .btn-cta{display:inline-flex;align-items:center;justify-content:center;gap:10px;font-family:var(--font-titles);font-weight:700;font-size:1rem;text-transform:uppercase;letter-spacing:.5px;text-decoration:none;padding:16px 32px;border-radius:var(--radius-md);border:none;cursor:pointer;transition:var(--transition-smooth);box-shadow:0 4px 20px rgba(0,0,0,.4)}
        .btn-main{background:linear-gradient(135deg,var(--color-primary),var(--color-primary-strong));color:var(--color-on-primary)}
        .icon-whatsapp{width:20px;height:20px}

        .main-header{background-color:var(--color-bg);border-bottom:1px solid rgba(255,255,255,.05);position:fixed;top:0;left:0;right:0;z-index:100;padding:15px 0;transition:var(--transition-fast)}
        .header-container{display:flex;justify-content:space-between;align-items:center}

        .hero-section{position:relative;padding-top:150px;padding-bottom:80px;background:linear-gradient(180deg,var(--color-bg),var(--color-surface));overflow:hidden}
        .hero-container{display:grid;grid-template-columns:1.1fr .9fr;gap:40px;align-items:center}
        .hero-title{font-family:var(--font-titles);font-size:3.2rem;font-weight:800;line-height:1.15;letter-spacing:-1px}
        .hero-subtitle{font-size:1.15rem;color:var(--color-text-muted);margin-bottom:35px;max-width:580px}
        .hero-image-wrapper{grid-column:2;display:flex;justify-content:center;align-items:center;width:100%;max-width:420px;aspect-ratio:4/5}
        .hero-image{width:100%;max-width:420px;aspect-ratio:4/5;object-fit:cover;border-radius:var(--radius-lg)}

        @media(max-width:768px){
            .hero-container{grid-template-columns:1fr;text-align:center;gap:25px}
            .hero-title{font-size:2.1rem;letter-spacing:-.5px}
            .hero-image-wrapper{max-width:280px}
            .btn-cta{width:100%;max-width:320px}
        }
    </style>

    <!-- CSS completo assíncrono -->
    <link rel="preload" href="style.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="style.css"></noscript>
</head>
<body>

    <header class="main-header">
        <div class="container header-container">
            <div class="logo"><span class="logo-text"><MARCA></span></div>
            <a href="https://wa.me/<NUMERO>?text=<MSG>" class="btn-cta btn-main" id="btn-header-whatsapp"
               onclick="gtag_report_conversion();" target="_blank" rel="noopener" aria-label="Falar no WhatsApp">
                <!-- SVG inline do ícone de WhatsApp -->
                Orçamento
            </a>
        </div>
    </header>

    <section class="hero-section">
        <div class="container hero-container">
            <div class="hero-content">
                <h1 class="hero-title"><TITULO H1></h1>
                <p class="hero-subtitle"><SUBTITULO></p>
                <a href="https://wa.me/<NUMERO>?text=<MSG>" class="btn-cta btn-main" id="btn-hero-whatsapp"
                   onclick="gtag_report_conversion();" target="_blank" rel="noopener">
                    Solicitar Orçamento
                </a>
            </div>
            <div class="hero-image-wrapper">
                <picture>
                    <source srcset="Public/<HERO>-280.webp 280w, Public/<HERO> 420w"
                            sizes="(max-width: 768px) 280px, 420px" type="image/webp">
                    <img src="Public/<HERO>" alt="<ALT>" class="hero-image" fetchpriority="high"
                         width="420" height="525">
                </picture>
            </div>
        </div>
    </section>

    <!-- Diferenciais, Serviços, Prova social, Footer... -->
    <!-- Botão flutuante WhatsApp com aria-label -->

    <!-- gtag.js só após interação do usuário -->
    <script>
      function loadGTag() {
        var s = document.createElement('script');
        s.src = 'https://www.googletagmanager.com/gtag/js?id=<TAG_ID>';
        s.async = true;
        s.onload = function() {
          gtag('js', new Date());
          gtag('config', '<TAG_ID>');
        };
        document.head.appendChild(s);
      }
      document.addEventListener('click', loadGTag, { once: true });
      document.addEventListener('touchstart', loadGTag, { once: true });
    </script>

</body>
</html>
```

---

## 8. Checklist final antes de publicar

- [ ] Tokens definidos só no `:root`; nenhum hex solto no CSS.
- [ ] Contraste AA validado (`--color-text` × `--color-bg`).
- [ ] Critical CSS inline presente e cobre o above-the-fold.
- [ ] `style.css` carregando via `preload as="style"` + `<noscript>`.
- [ ] Fontes self-hosted, pré-carregadas com `crossorigin` e `font-display: optional`.
- [ ] Hero pré-carregado com `fetchpriority="high"` + `imagesrcset`/`imagesizes`.
- [ ] `<img>` do hero com `width`/`height` + `aspect-ratio`.
- [ ] Imagens em WebP, redimensionadas, arquivos leves.
- [ ] gtag/terceiros carregam só após interação.
- [ ] Ícones em SVG inline; favicon em `data:` URI.
- [ ] `canonical`, Open Graph e Twitter Card preenchidos com URL absoluta.
- [ ] CTAs externos com `target="_blank" rel="noopener"`; botões-ícone com `aria-label`.
- [ ] `vercel.json` com rewrite da nova rota (se aplicável).
- [ ] Rodar PageSpeed (mobile) e conferir LCP/CLS/TBT.
```
