# LC Montagem — Landing Page

Landing page estática de alta conversão para montagem e desmontagem de móveis na Grande São Paulo.

- Stack: HTML, CSS e JavaScript puro, sem framework e sem dependências de runtime.
- Foco: Core Web Vitals, acessibilidade, SEO local e conversão via WhatsApp.
- Identidade: fundo escuro, verde-limão e tipografia Sora + Inter self-hosted.

## Estrutura

```text
.
├── data/
│   ├── site.config.json      # marca, domínio, WhatsApp, SEO e analytics
│   ├── faq.json              # perguntas frequentes
│   └── reviews.json          # 9 slots de avaliações reais
├── src/
│   ├── critical.css          # CSS crítico inline
│   ├── index.template.html   # template da página principal
│   └── privacidade.template.html
├── assets/
│   ├── fonts/                # Sora e Inter variáveis (woff2)
│   ├── img/                  # logo e hero otimizados (WebP/JPEG)
│   ├── js/app.js             # analytics sob interação + evento de WhatsApp
│   └── og/lc-montagem-og.png # imagem Open Graph 1200x630
├── build.mjs                 # gerador estático sem dependências
├── vercel.json               # rewrite, cache e headers de segurança
├── index.html                # gerado
├── privacidade.html          # gerado
├── robots.txt                # gerado
└── sitemap.xml               # gerado
```

## Build e pré-visualização

Requisitos: Node.js 18+ (testado com Node 24) e Python apenas para o preview local.

```bash
node build.mjs
python -m http.server 8080 --bind 127.0.0.1
```

Abra `http://127.0.0.1:8080/`.

O build valida `data/reviews.json`, injeta o CSS crítico, o FAQ, os schemas JSON-LD, o favicon e a configuração pública. Ele gera `index.html`, `privacidade.html`, `robots.txt` e `sitemap.xml`.

## Imagens

- `assets/img/logo-lc-montagem.png`: logo horizontal otimizada (480×185, PNG transparente, ~68 KB).
- `assets/img/logo-lc-montagem-original.png`: arquivo original da logo, preservado.
- `assets/img/hero-montagem-moveis-{480,720,1080}.webp`: variantes quadradas do hero para `srcset`.
- `assets/img/hero-montagem-moveis.jpg`: fallback JPEG 1080×1080.
- `assets/img/hero-montagem-moveis-original.webp`: foto original quadrada, preservada.

O hero usa `<picture>`, `srcset`, `sizes`, `width`/`height` explícitos, `fetchpriority="high"` e preload. A imagem é exibida em `1:1` com `object-fit: cover` dentro do card do hero.

## Configuração central

Edite `data/site.config.json` antes de publicar:

- `siteUrl`: domínio definitivo.
- `whatsapp.phone`: número com DDI e DDD, somente dígitos.
- `whatsapp.message`: mensagem inicial.
- `seo.title` e `seo.description`.
- `environment`: use `production` para `index,follow`; qualquer outro valor gera `noindex,nofollow`.
- `analytics`: IDs e conversão.

O link de WhatsApp é montado a partir desses campos. A mensagem atual é:

```text
Olá, te encontrei no Google e gostaria de um orçamento.
```

## Analytics e conversão

O analytics começa **desativado** (`analytics.enabled: false`) e sem IDs. Nenhum script de terceiros é carregado no acesso inicial.

Quando ativado, o script é injetado apenas na primeira interação (`click`, `touchstart` ou `keydown`):

- Com `gtmId`: carrega o Google Tag Manager.
- Sem `gtmId`, com `ga4Id` ou `googleAdsId`: carrega `gtag.js` diretamente.
- O evento `whatsapp_click` é enviado com `cta_location`, `service`, `page_location` e `page_path`.
- Para Google Ads, configure a conversão no GTM/GA4 e use o evento `whatsapp_click` como gatilho. O campo `googleAdsConversionLabel` está reservado para o ID de conversão.

CTAs rastreados:

| ID | Local |
| --- | --- |
| `btn-header-whatsapp` | Header |
| `btn-hero-whatsapp` | Hero |
| `btn-services-whatsapp` | Serviços |
| `btn-howto-whatsapp` | Como solicitar |
| `btn-region-whatsapp` | Região |
| `btn-final-whatsapp` | CTA final |
| `btn-footer-whatsapp` | Footer |
| `btn-floating-whatsapp` | Botão flutuante |

## Avaliações

`data/reviews.json` contém exatamente 9 slots e o build exige essa quantidade. Uma avaliação só é renderizada quando tiver `verified: true` **e** `published: true`. Enquanto não houver nenhuma publicada, a seção fica oculta e nenhum schema de `Review` ou `aggregateRating` é gerado. Não preencha com depoimentos inventados.

## Pendências antes de publicar

- [x] Logo oficial integrada no header, footer e página de privacidade.
- [x] Imagem Open Graph regenerada com a logo e a foto oficiais.
- [ ] Revisar visualmente a logo no header, o enquadramento do hero e a imagem Open Graph em um monitor real.
- [ ] Confirmar o texto alternativo da foto do hero com o cliente.
- [ ] Confirmar o domínio definitivo em `data/site.config.json` e no `vercel.json`, se necessário.
- [ ] Preencher os IDs reais de GTM/GA4/Google Ads e ativar `analytics.enabled`.
- [ ] Publicar avaliações reais e verificadas em `data/reviews.json`.
- [ ] Completar a identificação cadastral e o canal do encarregado de dados na política de privacidade.
- [ ] Validar o link de WhatsApp e a mensagem em um aparelho real.
- [ ] Revisar textos, serviços e áreas atendidas com o cliente.

## Deploy

O projeto é compatível com Vercel ou qualquer hospedagem estática. O `vercel.json` inclui:

- rewrite de `/privacidade` para `/privacidade.html`;
- cache longo para `/assets/*`;
- headers `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` e `Permissions-Policy`.

Para publicar na Vercel, importe a pasta do projeto e mantenha o build command vazio ou use `node build.mjs` caso queira regenerar os arquivos no deploy. O diretório de saída é a raiz do projeto.

## Validações executadas

- Lighthouse mobile: Performance 98, Acessibilidade 100, Boas práticas 100, SEO 100.
- Lighthouse desktop: Performance 100, Acessibilidade 100, Boas práticas 100, SEO 100.
- Privacidade mobile: Acessibilidade 100, Boas práticas 100, SEO 100.
- LCP mobile: ~2,3 s; CLS: 0; TBT: ~10 ms em execução local.
- Sem rolagem horizontal em 320, 360, 390, 430, 768, 1024 e 1440 px.
- Logo e hero carregados; `srcset` seleciona 480/720/1080 conforme viewport e DPR; hero sempre em 1:1.
- 8 CTAs de WhatsApp com a URL exata, `target="_blank"` e `rel="noopener noreferrer"`.
- Evento `whatsapp_click` validado nos modos desativado, GTM, GA4 direto e Google Ads direto.
- `html-validate`: sem erros.
- JSONs, sitemap e JSON-LD válidos; sem IDs duplicados; sem scripts ou fontes externas no carregamento inicial.
