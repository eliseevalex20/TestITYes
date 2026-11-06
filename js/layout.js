// layout.js — ЕДИНОЕ место для шапки и футера сайта.
// На страницах стоят только <div data-include="header"></div> и <div data-include="footer"></div>,
// этот модуль подставляет вместо них разметку. Меняйте ссылки, контакты и соцсети в SITE ниже.

const SITE = {
  logo: "images/logo.svg",
  home: "index.html",
  brand: "Онлайн-школа програмування",
  tagline: "Програмування, що приводить до результату",
  email: "hello@ityes.ua",
  year: 2026,
  cta: { label: "Записатися", href: "apply.html" },
  nav: [
    { label: "Курси", href: "courses.html", pages: ["courses", "course"] },
    { label: "Ціни", href: "prices.html", pages: ["prices"] },
    { label: "FAQ", href: "faq.html", pages: ["faq"] },
  ],
  social: [
    { id: "whatsapp", label: "WhatsApp", href: "https://wa.me/" },
    { id: "telegram", label: "Telegram", href: "https://t.me/" },
    { id: "instagram", label: "Instagram", href: "https://instagram.com/" },
  ],
  legal: [
    { label: "Політика конфіденційності", href: "#" },
    { label: "Договір оферти", href: "#" },
  ],
};

const ICONS = {
  whatsapp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 21l1.65-4.9A8.5 8.5 0 1 1 8 19.4L3 21z" stroke-linejoin="round"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1.2-1.4-2.2-1.1-.9.8c-1.3-.6-2.2-1.5-2.8-2.8l.8-.9-1.1-2.2L9 8.5z" fill="currentColor" stroke="none"/></svg>',
  telegram: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.5 3.3 2.9 10.5c-1 .4-1 1.2-.2 1.4l4.7 1.5 1.8 5.5c.2.6.4.8.8.8s.6-.2.9-.5l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3.1-14.7c.3-1.2-.5-1.8-1.2-1.4ZM8.8 13.2l9.6-6c.5-.3.9-.1.5.2l-7.8 7-.3 3.3-2-4.5Z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
};

const page = ((location.pathname.split("/").pop() || "index").replace(/\.html$/, "")) || "index";

const headerHTML = () => `
<header class="site-header">
  <div class="container header-inner">
    <a href="${SITE.home}" class="logo-link" aria-label="ITYes — на головну">
      <img src="${SITE.logo}" width="48" height="48" alt="ITYes">
    </a>
    <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="main-nav">Меню</button>
    <nav id="main-nav" class="main-nav" aria-label="Головна навігація">
      ${SITE.nav
        .map((n) => `<a href="${n.href}"${n.pages.includes(page) ? ' class="is-current" aria-current="page"' : ""}>${n.label}</a>`)
        .join("\n      ")}
    </nav>
    <a href="${page === "apply" ? "#form" : SITE.cta.href}" class="btn btn-orange header-cta">${SITE.cta.label}</a>
  </div>
</header>`;

const footerHTML = () => `
<footer class="site-footer sf">
  <div class="sf-inner">
    <div class="sf-top">
      <a href="${SITE.home}" class="sf-logo" aria-label="ITYes — на головну">
        <img src="${SITE.logo}" width="64" height="64" alt="ITYes">
      </a>
      <div class="sf-brand">
        <p class="sf-brand-name">${SITE.brand}</p>
        <p class="sf-brand-tag">${SITE.tagline}</p>
      </div>
      ${page === "apply" ? "" : `<a href="${SITE.cta.href}" class="btn btn-orange sf-cta">${SITE.cta.label}</a>`}
    </div>

    <div class="sf-cols">
      <nav class="sf-col" aria-label="Навігація у футері">
        <h3 class="sf-heading">Навігація</h3>
        <ul class="sf-links">
          ${SITE.nav.map((n) => `<li><a href="${n.href}">${n.label}</a></li>`).join("\n          ")}
        </ul>
      </nav>

      <div class="sf-col">
        <h3 class="sf-heading">Контакти</h3>
        <a href="mailto:${SITE.email}" class="sf-email">${ICONS.mail}<span>${SITE.email}</span></a>
      </div>

      <div class="sf-col">
        <h3 class="sf-heading">Месенджери</h3>
        <ul class="sf-social">
          ${SITE.social
            .map((s) => `<li><a class="sf-soc" href="${s.href}" target="_blank" rel="noopener" aria-label="${s.label}"><span class="sf-soc-ico">${ICONS[s.id]}</span><span class="sf-soc-name">${s.label}</span></a></li>`)
            .join("\n          ")}
        </ul>
      </div>
    </div>

    <div class="sf-bottom">
      <div class="sf-legal">
        ${SITE.legal.map((l) => `<a href="${l.href}">${l.label}</a>`).join("\n        ")}
      </div>
      <span>© ${SITE.year} ITYes</span>
    </div>
  </div>
</footer>`;

const parts = { header: headerHTML, footer: footerHTML };

document.querySelectorAll("[data-include]").forEach((slot) => {
  const build = parts[slot.dataset.include];
  if (!build) return;
  const tpl = document.createElement("template");
  tpl.innerHTML = build().trim();
  slot.replaceWith(tpl.content);   // replace (not wrap) so the sticky header keeps working
});
