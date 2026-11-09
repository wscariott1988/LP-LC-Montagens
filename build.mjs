import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const readJson = (path) => JSON.parse(read(path));
const write = (path, content) => {
  const target = resolve(root, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content, 'utf8');
};

const config = readJson('data/site.config.json');
const faqs = readJson('data/faq.json');
const reviews = readJson('data/reviews.json');

const siteUrl = config.domain.replace(/\/+$/, '');
const whatsappUrl = `https://wa.me/${config.whatsapp.phone}?text=${encodeURIComponent(config.whatsapp.message)}`;
const year = String(new Date().getFullYear());
const privacyUpdated = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date());
const isProduction = config.environment === 'production';
const robotsMeta = isProduction ? 'index,follow' : 'noindex,nofollow';
const ogImage = siteUrl + config.seo.ogImage;

if (!/^\d{12,15}$/.test(config.whatsapp.phone)) {
  throw new Error('O telefone do WhatsApp deve conter apenas dígitos, com DDI e DDD.');
}

if (!config.whatsapp.message.trim()) {
  throw new Error('A mensagem oficial do WhatsApp está vazia.');
}

if (!Array.isArray(faqs) || faqs.length === 0) {
  throw new Error('data/faq.json precisa conter pelo menos uma pergunta.');
}

if (!Array.isArray(reviews) || reviews.length !== 9) {
  throw new Error('data/reviews.json precisa conter exatamente 9 posições.');
}

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const escapeAttr = (value) => escapeHtml(value).replaceAll('`', '&#96;');

function formatDate(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pt-BR').format(date);
}

const faqHtml = faqs.map((faq, index) => {
  return [
    `          <details class="faq-item" id="${escapeAttr(faq.id)}" name="faq"${index === 0 ? ' open' : ''}>`,
    '            <summary>',
    `              <span class="faq-q">${escapeHtml(faq.question)}</span>`,
    '              <span class="faq-icon" aria-hidden="true"></span>',
    '            </summary>',
    `            <div class="faq-answer"><p>${escapeHtml(faq.answer)}</p></div>`,
    '          </details>'
  ].join('\n');
}).join('\n');

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  inLanguage: 'pt-BR',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer
    }
  }))
};

const publishedReviews = reviews.filter((review) => review.published === true);

if (publishedReviews.length > 9) {
  throw new Error('O componente suporta no máximo 9 avaliações.');
}

for (const review of publishedReviews) {
  const missing = ['id', 'name', 'rating', 'text', 'source', 'sourceUrl'].filter((field) => {
    const value = review[field];
    return value === undefined || value === null || value === '';
  });

  if (missing.length > 0) {
    throw new Error(`Avaliação ${review.id || '(sem id)'} publicada com campos vazios: ${missing.join(', ')}.`);
  }

  if (review.verified !== true) {
    throw new Error(`Avaliação ${review.id} só pode ser publicada se estiver verificada.`);
  }

  if (!Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5) {
    throw new Error(`Avaliação ${review.id} tem nota inválida. Use um inteiro de 1 a 5.`);
  }
}

function renderStars(rating) {
  const stars = [];

  for (let index = 1; index <= 5; index += 1) {
    stars.push(`<svg class="${index <= rating ? '' : 'is-empty'}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="m12 2.6 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9L12 2.6Z"/></svg>`);
  }

  return stars.join('');
}

const reviewsCards = publishedReviews.map((review) => {
  const date = formatDate(review.date);

  return [
    '          <article class="review-card">',
    `            <div class="review-stars" role="img" aria-label="Nota ${review.rating} de 5">${renderStars(review.rating)}</div>`,
    `            <blockquote>${escapeHtml(review.text)}</blockquote>`,
    '            <div class="review-meta">',
    `              <strong>${escapeHtml(review.name)}</strong>`,
    `              <span>${escapeHtml(review.source)}${date ? ` · ${escapeHtml(date)}` : ''}</span>`,
    `              <a class="review-source" href="${escapeAttr(review.sourceUrl)}" target="_blank" rel="nofollow noopener noreferrer">Ver avaliação original</a>`,
    '            </div>',
    '          </article>'
  ].join('\n');
}).join('\n');

const faviconSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#050605"/><rect x="7" y="7" width="50" height="50" rx="11" fill="#B4F000"/><text x="32" y="43" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="800" text-anchor="middle" fill="#101408">LC</text></svg>';
const faviconDataUri = 'data:image/svg+xml,' + encodeURIComponent(faviconSvg);

const publicConfig = {
  brand: config.brand,
  siteUrl,
  environment: config.environment,
  analytics: config.analytics
};

const tokens = {
  BRAND: config.brand,
  SLOGAN: config.slogan,
  SITE_URL: siteUrl,
  CANONICAL: `${siteUrl}/`,
  PRIVACY_URL: `${siteUrl}/privacidade.html`,
  OG_IMAGE: ogImage,
  META_TITLE: config.seo.title,
  META_DESCRIPTION: config.seo.description,
  META_KEYWORDS: config.seo.keywords,
  ROBOTS_META: robotsMeta,
  WHATSAPP_URL: whatsappUrl,
  WHATSAPP_PHONE: config.whatsapp.phone,
  WHATSAPP_PHONE_DISPLAY: config.whatsapp.phoneDisplay,
  YEAR: year,
  PRIVACY_UPDATED: privacyUpdated,
  SITE_CONFIG_JSON: JSON.stringify(publicConfig).replaceAll('<', '\\u003c'),
  CRITICAL_CSS: read('src/critical.css').trim(),
  FAVICON_DATA_URI: faviconDataUri,
  FAQ_HTML: faqHtml,
  FAQ_SCHEMA_JSON: JSON.stringify(faqSchema).replaceAll('<', '\\u003c'),
  REVIEWS_CARDS: reviewsCards || '          <!-- Nenhuma avaliação publicada. Preencha data/reviews.json e defina published=true. -->',
  REVIEWS_HIDDEN: publishedReviews.length === 0 ? 'hidden' : ''
};

function applyTokens(template, tokenMap) {
  let output = template;

  for (const [key, value] of Object.entries(tokenMap)) {
    output = output.split(`{{${key}}}`).join(value);
  }

  const leftover = output.match(/\{\{[A-Z0-9_]+\}\}/g);

  if (leftover) {
    throw new Error(`Tokens não substituídos: ${[...new Set(leftover)].join(', ')}`);
  }

  return output;
}

const indexHtml = applyTokens(read('src/index.template.html'), tokens);
const privacyHtml = applyTokens(read('src/privacidade.template.html'), tokens);

write('index.html', indexHtml);
write('privacidade.html', privacyHtml);

const robots = isProduction
  ? `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`
  : `User-agent: *\nDisallow: /\n`;

write('robots.txt', robots);

const today = new Date().toISOString().slice(0, 10);
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  '  <url>',
  `    <loc>${siteUrl}/</loc>`,
  `    <lastmod>${today}</lastmod>`,
  '    <changefreq>monthly</changefreq>',
  '    <priority>1.0</priority>',
  '  </url>',
  '  <url>',
  `    <loc>${siteUrl}/privacidade.html</loc>`,
  `    <lastmod>${today}</lastmod>`,
  '    <changefreq>yearly</changefreq>',
  '    <priority>0.3</priority>',
  '  </url>',
  '</urlset>',
  ''
].join('\n');

write('sitemap.xml', sitemap);

console.log('Build concluído.');
console.log(`WhatsApp: ${whatsappUrl}`);
console.log(`Avaliações publicadas: ${publishedReviews.length} de 9`);
console.log(`Ambiente: ${config.environment} (${robotsMeta})`);
