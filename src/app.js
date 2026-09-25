const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
function setMenu(open, returnFocus = false) {
  if (!toggle || !nav) return;
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  nav.classList.toggle('is-open', open);
  if (returnFocus) toggle.focus();
}
toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
nav?.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') setMenu(false, true); });
document.addEventListener('click', e => { if (!e.target.closest('.header-inner')) setMenu(false); });
nav?.addEventListener('focusout', () => { setTimeout(() => { if (!nav.contains(document.activeElement) && document.activeElement !== toggle) setMenu(false); }, 0); });
matchMedia('(min-width:821px)').addEventListener('change', () => setMenu(false));
// Optional adapter. No tracking SDK, cookies or identifiers are loaded by this site.
// Configure window.siteAnalytics = (eventName, payload) => ... only after privacy review.
if (document.documentElement.dataset.analytics === 'true') {
  document.addEventListener('click', event => {
    const a = event.target.closest('a[data-cta-id]');
    if (!a || typeof window.siteAnalytics !== 'function') return;
    const payload = { cta_id: a.dataset.ctaId, section: a.dataset.section };
    if (a.dataset.itemId) payload.item_id = a.dataset.itemId;
    try { window.siteAnalytics('whatsapp_click', payload); } catch { /* Navigation remains native. */ }
  });
}
