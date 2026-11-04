// SutraBead page builder
// - Wraps src/pages/*.body.html with the shared <head>, header and footer.
// - Expands {{img:ID|width|note}} into Unsplash URLs and FAILS the build if any image is used twice site-wide.
// - Writes IMAGE-REGISTRY.md (the website-wide image usage record).
// Run: npm run build   (pages + Tailwind CSS)
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const SRC = path.join(__dirname, "pages");

const LOGO = `<svg class="brand-mark" viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="14" fill="#3b2fc9"/><path d="M8 15h32M8 24h32M8 33h32" stroke="#fff" stroke-opacity=".5" stroke-width="2"/><ellipse cx="14" cy="15" rx="4.6" ry="3.6" fill="#ffb938"/><ellipse cx="23.5" cy="15" rx="4.6" ry="3.6" fill="#ffb938"/><ellipse cx="32" cy="24" rx="4.6" ry="3.6" fill="#ff7a72"/><ellipse cx="13" cy="33" rx="4.6" ry="3.6" fill="#fff"/><ellipse cx="22.5" cy="33" rx="4.6" ry="3.6" fill="#fff"/><ellipse cx="34" cy="33" rx="4.6" ry="3.6" fill="#3dd6bc"/></svg>`;

const I = {
  sun: `<svg class="ico-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.2M12 19.8V22M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2 12h2.2M19.8 12H22M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6"/></svg>`,
  moon: `<svg class="ico-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>`,
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>`,
  menu: `<svg class="ico-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg><svg class="ico-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
  chev: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>`,
  pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
  facebook: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3z"/></svg>`,
  instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>`,
  youtube: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3L10 15z"/></svg>`,
  linkedin: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4v11H3zM9.5 9.5h3.8v1.6h.1c.5-1 1.8-1.9 3.7-1.9 4 0 4.7 2.6 4.7 6v5.3h-4v-4.7c0-1.1 0-2.6-1.6-2.6s-1.8 1.2-1.8 2.5v4.8h-4z"/></svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7 11.6 11.6 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>`,
};

const NAV = [
  ["programs.html", "Programs"],
  ["competitions.html", "Competitions"],
  ["about.html", "About"],
  ["contact.html", "Contact"],
  ["dashboard.html", "Dashboard"],
];
const HOMES = [["index.html", "Home 1"], ["home-2.html", "Home 2"]];

function head(meta) {
  const tw = meta.bare ? "" : `\n<link rel="stylesheet" href="assets/css/tailwind.css">`;
  return `<!doctype html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${meta.title}</title>
<meta name="description" content="${meta.desc}">
<meta name="theme-color" content="#3b2fc9">
<script>(function(){var r=document.documentElement;try{var t=localStorage.getItem('sb-theme');if(!t&&window.matchMedia)t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';if(t)r.setAttribute('data-theme',t);var d=localStorage.getItem('sb-dir');if(d)r.setAttribute('dir',d);}catch(e){}})();</script>
<link rel="icon" type="image/svg+xml" href="assets/img/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Figtree:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/styles.css">${tw}${meta.css ? `\n<link rel="stylesheet" href="assets/css/${meta.css}">` : ""}
</head>`;
}

const toggles = `<button class="icon-btn" type="button" data-dir-toggle aria-label="Switch to right-to-left layout"><span class="dir-label">RTL</span></button>
      <button class="icon-btn" type="button" data-theme-toggle aria-label="Switch theme">${I.sun}${I.moon}</button>`;

function header(active) {
  const isHome = active === "index.html" || active === "home-2.html";
  const cur = (href) => (href === active ? ' aria-current="page"' : "");
  const homeItems = HOMES.map(([h, l]) => `<li><a href="${h}"${cur(h)}>${l}</a></li>`).join("");
  const links = NAV.map(([h, l]) => `<li><a class="sb-nav-link" href="${h}"${cur(h)}>${l}</a></li>`).join("");
  const mHome = HOMES.map(([h, l]) => `<li><a class="sb-m-link !ps-8" href="${h}"${cur(h)}>${l}</a></li>`).join("");
  const mLinks = NAV.map(([h, l]) => `<li><a class="sb-m-link" href="${h}"${cur(h)}>${l}</a></li>`).join("");
  return `<a class="skip-link" href="#main">Skip to content</a>
<header class="sb-header" data-header>
  <div class="container flex min-h-[76px] items-center gap-3">
    <a class="brand shrink-0" href="index.html" aria-label="SutraBead Academy home">${LOGO}<span class="brand-text"><span class="brand-name">SutraBead</span><span class="brand-tag hidden sm:block">Abacus &amp; Vedic Maths Academy</span></span></a>
    <nav class="ms-auto hidden xl:block" aria-label="Main">
      <ul class="m-0 flex list-none items-center gap-0.5 rounded-full border border-line bg-surface p-1.5">
        <li class="relative" data-dropdown>
          <button class="sb-nav-link${isHome ? " is-active" : ""}" type="button" aria-expanded="false" aria-controls="home-menu" data-dropdown-btn>Home${I.chev}</button>
          <ul class="sb-dropdown" id="home-menu" hidden>${homeItems}</ul>
        </li>
        ${links}
      </ul>
    </nav>
    <div class="ms-auto flex items-center gap-2 xl:ms-3">
      ${toggles}
      <a class="btn btn-primary btn-sm hidden sm:inline-flex" href="login.html">${I.user}<span>Login Portal</span></a>
      <button class="icon-btn xl:hidden" type="button" data-mobile-toggle aria-expanded="false" aria-controls="mobile-nav" aria-label="Open menu">${I.menu}</button>
    </div>
  </div>
  <div class="sb-mobile xl:hidden" id="mobile-nav" hidden>
    <nav class="container py-3" aria-label="Mobile">
      <ul class="m-0 grid list-none gap-1 p-0">
        <li>
          <button class="sb-m-link${isHome ? " is-active" : ""}" type="button" aria-expanded="${isHome ? "true" : "false"}" aria-controls="m-home" data-m-group>Home${I.chev}</button>
          <ul class="m-0 grid list-none gap-1 p-0" id="m-home"${isHome ? "" : " hidden"}>${mHome}</ul>
        </li>
        ${mLinks}
      </ul>
      <a class="btn btn-primary btn-block mt-3" href="login.html">${I.user}<span>Login Portal</span></a>
    </nav>
  </div>
</header>`;
}

const FOOTER_ABACUS = `<svg class="mt-5 w-[170px]" viewBox="0 0 170 46" aria-hidden="true"><g stroke="rgba(255,255,255,.25)" stroke-width="2"><path d="M2 12h166M2 34h166"/></g><ellipse cx="14" cy="12" rx="7" ry="5" fill="#ffb938"/><ellipse cx="30" cy="12" rx="7" ry="5" fill="#ffb938"/><ellipse cx="78" cy="12" rx="7" ry="5" fill="#ff7a72"/><ellipse cx="124" cy="12" rx="7" ry="5" fill="#3dd6bc"/><ellipse cx="140" cy="12" rx="7" ry="5" fill="#3dd6bc"/><ellipse cx="46" cy="34" rx="7" ry="5" fill="#8f87ff"/><ellipse cx="62" cy="34" rx="7" ry="5" fill="#8f87ff"/><ellipse cx="108" cy="34" rx="7" ry="5" fill="#ffb938"/><ellipse cx="156" cy="34" rx="7" ry="5" fill="#ff7a72"/></svg>`;

function footer() {
  const ql = [["index.html", "Home 1"], ["home-2.html", "Home 2"], ["programs.html", "Programs"], ["competitions.html", "Competitions"], ["about.html", "About Us"], ["contact.html", "Contact"], ["dashboard.html", "Parent Dashboard"], ["login.html", "Login Portal"]];
  const pr = [["programs.html#abacus", "Abacus Mental Arithmetic"], ["programs.html#vedic", "Vedic Maths"], ["home-2.html#modes", "Centre Classes"], ["home-2.html#modes", "Live Online Classes"], ["competitions.html", "Competition Coaching"]];
  const li = (arr) => arr.map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join("");
  // PRE-LAUNCH ITEM: these social handles are not verified academy profiles. Replace with the academy’s real
  // profile URLs (or remove the icons) before launch.
  const social = [["https://www.facebook.com/sutrabeadacademy", "Facebook", I.facebook], ["https://www.instagram.com/sutrabeadacademy", "Instagram", I.instagram], ["https://www.youtube.com/@sutrabeadacademy", "YouTube", I.youtube], ["https://www.linkedin.com/company/sutrabeadacademy", "LinkedIn", I.linkedin]];
  return `<footer class="sb-footer">
  <div class="container pb-8 pt-14">
    <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
      <section class="lg:col-span-4" aria-label="About the academy">
        <a class="brand" href="index.html" aria-label="SutraBead Academy home">${LOGO}<span class="brand-text"><span class="brand-name">SutraBead</span><span class="brand-tag">Abacus &amp; Vedic Maths Academy</span></span></a>
        <p class="mt-4 max-w-[36ch] text-[15px]">Abacus and Vedic Maths for children aged 4–12 — at our academy and live online.</p>
        ${FOOTER_ABACUS}
      </section>
      <section class="lg:col-span-2" aria-labelledby="f-quick">
        <h2 id="f-quick">Quick Links</h2>
        <ul class="m-0 grid list-none gap-2.5 p-0 text-[15px]">${li(ql)}</ul>
      </section>
      <section class="lg:col-span-3" aria-labelledby="f-programs">
        <h2 id="f-programs">Our Programs</h2>
        <ul class="m-0 grid list-none gap-2.5 p-0 text-[15px]">${li(pr)}</ul>
      </section>
      <section class="lg:col-span-3" aria-labelledby="f-contact">
        <h2 id="f-contact">Contact Information</h2>
        <ul class="m-0 grid list-none gap-3 p-0 text-[15px]">
          <li class="flex gap-3"><span class="mt-0.5 h-5 w-5 shrink-0 text-[#ffd27a]">${I.mail}</span><a href="contact.html#enquiry">Send an enquiry</a></li>
          <li class="flex gap-3"><span class="mt-0.5 h-5 w-5 shrink-0 text-[#ffd27a]">${I.phone}</span><a href="contact.html#enquiry">Request a call back</a></li>
          <li class="flex gap-3"><span class="mt-0.5 h-5 w-5 shrink-0 text-[#ffd27a]">${I.pin}</span><a href="contact.html#reach">Plan a visit to the academy</a></li>
          <li class="flex gap-3"><span class="mt-0.5 h-5 w-5 shrink-0 text-[#ffd27a]">${I.clock}</span><a href="contact.html#enquiry" data-open="assess-modal">Book a free assessment</a></li>
        </ul>
      </section>
    </div>
    <div class="mt-12 flex flex-col-reverse gap-6 border-t border-white/15 pt-7 md:flex-row md:items-center md:justify-between">
      <section aria-label="Copyright"><p class="m-0 text-sm">© <span data-year>2026</span> SutraBead Academy. All rights reserved.</p></section>
      <section class="flex flex-wrap items-center gap-4" aria-labelledby="f-social">
        <h2 id="f-social" class="!mb-0 text-sm">Follow us</h2>
        <ul class="sb-social m-0 flex list-none gap-2.5 p-0">${social.map(([h, l, ic]) => `<li><a href="${h}" target="_blank" rel="noopener" aria-label="${l}">${ic}</a></li>`).join("")}</ul>
      </section>
    </div>
  </div>
</footer>
<script src="assets/js/app.js"></script>`;
}

const PAGES = [
  { file: "index.html", src: "index.body.html", title: "SutraBead — Abacus & Vedic Maths Academy", desc: "Abacus mental arithmetic and Vedic Maths for children aged 4–12, at our academy and live online.", nav: "index.html" },
  { file: "home-2.html", src: "home-2.body.html", title: "SutraBead Academy — Find Your Child’s Maths Path", desc: "Find the right Abacus or Vedic Maths program for your child aged 4–12 — at a centre or live online.", nav: "home-2.html", js: "home2.js" },
  { file: "programs.html", src: "programs.body.html", title: "Programs & Levels — SutraBead", desc: "Abacus and Vedic Maths programs for ages 4–12: levels, learning outcomes, online and offline classes, and enrolment.", nav: "programs.html" },
  { file: "competitions.html", src: "competitions.body.html", title: "Competitions — SutraBead", desc: "Upcoming and past abacus and Vedic Maths competitions, winners, registration and photo gallery.", nav: "competitions.html", js: "competitions.js" },
  { file: "about.html", src: "about.body.html", title: "About Us — SutraBead", desc: "Who we are, our mission, teaching method, trainer roles and the learning outcomes children gain at SutraBead Academy.", nav: "about.html" },
  { file: "contact.html", src: "contact.body.html", js: "contact.js", title: "Contact — SutraBead", desc: "Send an enquiry, request a call back or book a free assessment with SutraBead Academy.", nav: "contact.html" },
  { file: "login.html", src: "login.body.html", title: "Parent Login — SutraBead", desc: "Sign in to the SutraBead parent account.", bare: true, css: "portal.css" },
  { file: "dashboard.html", src: "dashboard.body.html", title: "Parent Dashboard — SutraBead", desc: "Your SutraBead parent account.", bare: true, css: "portal.css" },
];

const used = new Map();
const registry = [];
for (const p of PAGES) {
  let body = fs.readFileSync(path.join(SRC, p.src), "utf8");
  body = body.replace(/\{\{img:([0-9a-f-]+)\|(\d+)(?:\|([^}]*))?\}\}/g, (m, id, w, note) => {
    if (used.has(id)) throw new Error(`Duplicate image ${id} in ${p.file} (already used in ${used.get(id)})`);
    used.set(id, p.file);
    registry.push([p.file, note || "", id]);
    return `https://images.unsplash.com/photo-${id}?auto=format&amp;fit=crop&amp;w=${w}&amp;q=80`;
  });
  body = body.replace(/\{\{TOGGLES\}\}/g, toggles).replace(/\{\{LOGO\}\}/g, LOGO);
  let html = head(p);
  if (p.bare) {
    const pageJs = p.src.startsWith("dash") ? "dashboard.js" : "login.js";
    html += `\n<body class="${p.src.startsWith("login") ? "login-page" : "dash-page"}">\n${body}\n<script src="assets/js/app.js"></script>\n<script src="assets/js/${pageJs}"></script>\n</body>\n</html>\n`;
  } else {
    html += `\n<body>\n${header(p.nav)}\n<main id="main">\n${body}\n</main>\n${footer()}${p.js ? `\n<script src="assets/js/${p.js}"></script>` : ""}\n</body>\n</html>\n`;
  }
  fs.writeFileSync(path.join(ROOT, p.file), html);
}

let md = "# Image Usage Record\n\nEvery image appears exactly once across the website. `npm run build` regenerates this file and stops with an error if any image is used twice.\n\n| # | Page | Section / usage | Unsplash photo ID |\n|---|---|---|---|\n";
registry.forEach((r, i) => { md += `| ${i + 1} | ${r[0]} | ${r[1]} | photo-${r[2]} |\n`; });
md += `\nTotal unique images: ${registry.length}\n`;
fs.writeFileSync(path.join(ROOT, "IMAGE-REGISTRY.md"), md);
console.log("Built", PAGES.length, "pages;", registry.length, "unique images");
