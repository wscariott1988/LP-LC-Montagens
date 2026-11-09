(function () {
  'use strict';

  var config = window.LC_CONFIG || {};
  var analytics = config.analytics || {};
  var analyticsRequested = false;

  function appendScript(src, onload) {
    var script = document.createElement('script');
    script.async = true;
    script.src = src;
    if (onload) {
      script.onload = onload;
    }
    document.head.appendChild(script);
  }

  function loadAnalytics() {
    if (analyticsRequested) {
      return;
    }

    analyticsRequested = true;

    if (!analytics.enabled) {
      return;
    }

    if (analytics.gtmId) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        'gtm.start': new Date().getTime(),
        event: 'gtm.js'
      });
      appendScript('https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(analytics.gtmId));
      return;
    }

    var primaryId = analytics.ga4Id || analytics.googleAdsId;

    if (!primaryId) {
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer.push(arguments);
    };

    appendScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(primaryId), function () {
      window.gtag('js', new Date());

      if (analytics.ga4Id) {
        window.gtag('config', analytics.ga4Id, { anonymize_ip: true });
      }

      if (analytics.googleAdsId) {
        window.gtag('config', analytics.googleAdsId);
      }
    });
  }

  document.addEventListener('click', loadAnalytics, { once: true });
  document.addEventListener('touchstart', loadAnalytics, { once: true, passive: true });
  document.addEventListener('keydown', loadAnalytics, { once: true });

  document.addEventListener('click', function (event) {
    var link = event.target && event.target.closest ? event.target.closest('a[data-cta-location]') : null;

    if (!link) {
      return;
    }

    var payload = {
      cta_location: link.getAttribute('data-cta-location') || 'unknown',
      service: link.getAttribute('data-service') || 'orcamento_geral',
      page_location: window.location.href,
      page_path: window.location.pathname
    };

    if (analytics.enabled && !analytics.gtmId && typeof window.gtag === 'function') {
      window.gtag('event', 'whatsapp_click', payload);
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'whatsapp_click',
      cta_location: payload.cta_location,
      service: payload.service,
      page_location: payload.page_location,
      page_path: payload.page_path
    });
  }, { passive: true });
})();
