/* SutraBead Academy — shared interactions (public site, login, dashboard) */
(function () {
  "use strict";
  var root = document.documentElement;

  function store(key, val) {
    try { if (val === undefined) return localStorage.getItem(key); localStorage.setItem(key, val); } catch (e) { return null; }
  }

  /* ---------- Theme ---------- */
  function currentTheme() {
    var t = root.getAttribute("data-theme");
    if (t) return t;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function applyTheme(t) {
    root.setAttribute("data-theme", t);
    document.querySelectorAll("[data-theme-toggle]").forEach(function (b) {
      b.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme");
      b.setAttribute("aria-pressed", t === "dark" ? "true" : "false");
    });
  }
  applyTheme(currentTheme());

  /* ---------- Direction ---------- */
  function applyDir(d) {
    root.setAttribute("dir", d);
    document.querySelectorAll("[data-dir-toggle]").forEach(function (b) {
      var lbl = b.querySelector(".dir-label");
      if (lbl) lbl.textContent = d === "rtl" ? "LTR" : "RTL";
      b.setAttribute("aria-label", d === "rtl" ? "Switch to left-to-right layout" : "Switch to right-to-left layout");
    });
  }
  applyDir(root.getAttribute("dir") || "ltr");

  document.addEventListener("click", function (e) {
    var tt = e.target.closest("[data-theme-toggle]");
    if (tt) { var nt = currentTheme() === "dark" ? "light" : "dark"; applyTheme(nt); store("sb-theme", nt); }
    var dt = e.target.closest("[data-dir-toggle]");
    if (dt) { var nd = root.getAttribute("dir") === "rtl" ? "ltr" : "rtl"; applyDir(nd); store("sb-dir", nd); }
  });

  /* ---------- Toast ---------- */
  var ICON_OK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>';
  var ICON_ERR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 7v6M12 17h.01"/></svg>';
  function toast(msg, type) {
    var wrap = document.querySelector(".toast-wrap");
    if (!wrap) { wrap = document.createElement("div"); wrap.className = "toast-wrap"; wrap.setAttribute("role", "status"); wrap.setAttribute("aria-live", "polite"); document.body.appendChild(wrap); }
    var t = document.createElement("div");
    t.className = "toast" + (type === "error" ? " error" : "");
    t.innerHTML = '<span class="t-ico">' + (type === "error" ? ICON_ERR : ICON_OK) + "</span><span></span>";
    t.lastChild.textContent = msg;
    wrap.appendChild(t);
    setTimeout(function () { t.style.transition = "opacity .3s"; t.style.opacity = "0"; setTimeout(function () { t.remove(); }, 320); }, 3600);
  }

  /* ---------- Modal ---------- */
  var lastFocus = null;
  function openModal(id) {
    var m = document.getElementById(id);
    if (!m) return;
    lastFocus = document.activeElement;
    m.classList.add("open");
    m.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    var f = m.querySelector("input, select, textarea, button:not([data-close])");
    setTimeout(function () { (f || m.querySelector(".modal-dialog")).focus(); }, 60);
  }
  function closeModal(m) {
    if (!m) return;
    m.classList.remove("open");
    m.setAttribute("aria-hidden", "true");
    if (!document.querySelector(".modal.open")) document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.addEventListener("click", function (e) {
    var o = e.target.closest("[data-open]");
    if (o) { e.preventDefault(); openModal(o.getAttribute("data-open")); }
    var c = e.target.closest("[data-close]");
    if (c) closeModal(c.closest(".modal"));
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { var m = document.querySelector(".modal.open"); if (m) closeModal(m); }
    if (e.key === "Tab") {
      var om = document.querySelector(".modal.open .modal-dialog");
      if (!om) return;
      var els = om.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])');
      els = Array.prototype.filter.call(els, function (x) { return x.offsetParent !== null; });
      if (!els.length) return;
      var first = els[0], last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- Form validation helper ---------- */
  function validate(form) {
    var ok = true;
    form.querySelectorAll("[data-rule]").forEach(function (inp) {
      var field = inp.closest(".field");
      var v = (inp.value || "").trim();
      var rules = inp.getAttribute("data-rule").split(" ");
      var bad = false;
      rules.forEach(function (r) {
        if (r === "required" && !v) bad = true;
        if (r === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) bad = true;
        if (r === "phone" && v && !/^[+]?[\d\s-]{10,15}$/.test(v)) bad = true;
        if (r === "min6" && v.length < 6) bad = true;
        if (r === "otp" && !/^\d{6}$/.test(v)) bad = true;
        if (r === "card" && v.replace(/\s/g, "").length < 15) bad = true;
        if (r === "expiry" && !/^(0[1-9]|1[0-2])\/\d{2}$/.test(v)) bad = true;
        if (r === "cvv" && !/^\d{3,4}$/.test(v)) bad = true;
        if (r === "upi" && !/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(v)) bad = true;
        if (r === "match") { var other = form.querySelector(inp.getAttribute("data-match")); if (other && other.value !== inp.value) bad = true; }
      });
      if (field) field.classList.toggle("invalid", bad);
      inp.setAttribute("aria-invalid", bad ? "true" : "false");
      if (bad && ok) { ok = false; inp.focus(); }
    });
    return ok;
  }
  document.addEventListener("input", function (e) {
    var f = e.target.closest(".field.invalid");
    if (f) f.classList.remove("invalid");
  });

  /* ---------- Expose ---------- */
  window.SB = { toast: toast, openModal: openModal, closeModal: closeModal, validate: validate, store: store };

  /* ---------- Assessment modal (public pages) ---------- */
  function injectAssessment() {
    if (!document.querySelector('[data-open="assess-modal"]') || document.getElementById("assess-modal")) return;
    var progOpts = ["Abacus Mental Arithmetic", "Vedic Maths", "Both programs", "Not sure yet — please advise"];
    var html =
      '<div class="modal" id="assess-modal" aria-hidden="true">' +
      '<div class="modal-backdrop" data-close></div>' +
      '<div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="assess-title" tabindex="-1">' +
      '<div class="modal-strip" aria-hidden="true"><i></i><i></i><i></i><i></i></div>' +
      '<div class="modal-head"><div><h2 id="assess-title">Book a free assessment</h2><p>A 30-minute session to find your child’s right starting level.</p></div>' +
      '<button class="icon-btn" data-close aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
      '<div class="modal-body"><form class="form-grid" id="assess-form" novalidate>' +
      '<div class="field"><label for="as-child">Child’s name</label><input class="input" id="as-child" data-rule="required" autocomplete="off"><span class="err">Please enter your child’s name.</span></div>' +
      '<div class="field"><label for="as-age">Age</label><select class="select" id="as-age" data-rule="required"><option value="">Select age</option>' +
      [4,5,6,7,8,9,10,11,12,13,14].map(function (a) { return "<option>" + a + " years</option>"; }).join("") +
      '</select><span class="err">Please select an age.</span></div>' +
      '<div class="field"><label for="as-parent">Parent’s name</label><input class="input" id="as-parent" data-rule="required" autocomplete="name"><span class="err">Please enter your name.</span></div>' +
      '<div class="field"><label for="as-phone">Mobile number</label><input class="input" id="as-phone" type="tel" data-rule="required phone" placeholder="+91 98400 12345" autocomplete="tel"><span class="err">Enter a valid mobile number.</span></div>' +
      '<div class="field full"><label for="as-prog">Program interest</label><select class="select" id="as-prog">' + progOpts.map(function (p) { return "<option>" + p + "</option>"; }).join("") + "</select></div>" +
      '<fieldset class="field full" style="border:0;padding:0;margin:0"><legend style="font-weight:700;font-size:.88rem;margin-block-end:6px">Preferred mode</legend><div class="radio-pills">' +
      '<label><input type="radio" name="as-mode" value="centre" checked><span>At a centre</span></label>' +
      '<label><input type="radio" name="as-mode" value="online"><span>Live online</span></label></div></fieldset>' +
      '<div class="full"><button class="btn btn-primary btn-block" type="submit">Request my slot</button></div>' +
      "</form>" +
      '<div class="form-success" id="assess-success"><div class="ok">' + ICON_OK.replace('stroke-width="3"', 'stroke-width="2.6"') + '</div><h3 class="center">Slot request received</h3><p>Our counsellor will call you within 24 hours to confirm a time.</p><button class="btn btn-outline" data-close type="button">Done</button></div>' +
      "</div></div></div>";
    document.body.insertAdjacentHTML("beforeend", html);
    var form = document.getElementById("assess-form");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(form)) return;
      var btn = form.querySelector("[type=submit]");
      btn.disabled = true; btn.textContent = "Sending…";
      setTimeout(function () {
        form.style.display = "none";
        document.getElementById("assess-success").classList.add("show");
        btn.disabled = false; btn.textContent = "Request my slot";
      }, 900);
    });
    document.getElementById("assess-modal").addEventListener("click", function (e) {
      if (e.target.closest("[data-close]")) {
        setTimeout(function () { form.reset(); form.style.display = ""; document.getElementById("assess-success").classList.remove("show"); }, 300);
      }
    });
  }

  /* ---------- Scroll to top (shared by all pages; styles in styles.css) ---------- */
  function initScrollTop() {
    if (document.querySelector(".to-top")) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "to-top";
    btn.setAttribute("aria-label", "Scroll to top");
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    document.body.appendChild(btn);

    var SHOW_AFTER = 300;
    // While scrolling: stay clear of bottom-anchored controls (footer links, login help, pay bar).
    // Once scrolling settles: also step clear of any control or heading underneath (no jumping mid-scroll).
    var AVOID = ".sb-footer a, .sb-footer button, .auth-foot a, .pay-bar";
    var ANY = 'a[href], button:not(.to-top), input, select, textarea, iframe, summary, [tabindex]:not([tabindex="-1"]), h1, h2, h3';
    var reduce = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    var ticking = false, settleTimer = null, lateTimer = null;

    // The part of an element actually on screen (scroll containers such as card carousels clip their children)
    function visibleRect(el) {
      var r = el.getBoundingClientRect();
      if (!r.width || !r.height) return null;
      var x1 = r.left, y1 = r.top, x2 = r.right, y2 = r.bottom, p = el.parentElement;
      while (p && p !== document.body) {
        var s = getComputedStyle(p);
        if (s.overflowX !== "visible" || s.overflowY !== "visible") {
          var q = p.getBoundingClientRect();
          x1 = Math.max(x1, q.left); y1 = Math.max(y1, q.top); x2 = Math.min(x2, q.right); y2 = Math.min(y2, q.bottom);
          if (x2 <= x1 || y2 <= y1) return null;
        }
        p = p.parentElement;
      }
      return { left: x1, top: y1, right: x2, bottom: y2 };
    }

    function update(settled) {
      ticking = false;
      var y = window.scrollY || document.documentElement.scrollTop;
      var show = y > SHOW_AFTER;
      btn.classList.toggle("is-visible", show);
      if (!show) { btn.style.setProperty("--to-top-lift", "0px"); return; }
      var vh = window.innerHeight, size = btn.offsetHeight;
      var gap = parseFloat(getComputedStyle(btn).getPropertyValue("--to-top-gap")) || 20;
      var bx = btn.getBoundingClientRect();
      var atEnd = y + vh >= document.documentElement.scrollHeight - 120;
      var rects = [];
      document.querySelectorAll(settled === true || atEnd ? AVOID + ", " + ANY : AVOID).forEach(function (el) {
        if (el === btn || el.closest(".to-top, .modal, .cp-lightbox, [hidden]")) return;
        var r = visibleRect(el);
        if (r && r.right > bx.left - 8 && r.left < bx.right + 8 && r.bottom > 0 && r.top < vh) rects.push(r);
      });
      // Raise the button just above whatever it would cover (repeat in case that lands on another control)
      var lift = 0, changed = true, n = 0;
      while (changed && n++ < 8) {
        changed = false;
        var bottom = vh - gap - lift, top = bottom - size;
        rects.forEach(function (r) {
          if (r.bottom > top - 8 && r.top < bottom + 8) { var need = vh - gap - r.top + 12; if (need > lift) { lift = need; changed = true; } }
        });
      }
      lift = Math.min(lift, vh * 0.45); // never float far up the screen
      btn.style.setProperty("--to-top-lift", Math.max(0, Math.round(lift)) + "px");
      // Dense stacks of full-width controls (FAQ rows, form fields) leave no free spot: at rest, fade out
      // rather than cover a control. Scrolling again brings the button straight back.
      var fb = vh - gap - lift, ft = fb - size, blocked = false;
      rects.forEach(function (r) { if (r.bottom > ft + 1 && r.top < fb - 1) blocked = true; });
      btn.classList.toggle("is-tucked", settled === true && blocked);
    }
    // Re-check once scrolling stops, and again after scroll-in animations (.reveal, 0.7s) finish moving content
    function settle() {
      clearTimeout(settleTimer); clearTimeout(lateTimer);
      settleTimer = setTimeout(function () { update(true); }, 160);
      lateTimer = setTimeout(function () { update(true); }, 900);
    }
    function request() { if (!ticking) { ticking = true; window.requestAnimationFrame(update); } settle(); }
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    document.addEventListener("click", function (e) { if (!e.target.closest(".to-top")) setTimeout(request, 350); });
    update(true);

    btn.addEventListener("click", function (e) {
      var instant = reduce && reduce.matches;
      try { window.scrollTo({ top: 0, behavior: instant ? "instant" : "smooth" }); } catch (err) { window.scrollTo(0, 0); }
      // Keyboard users land at the top of the page, not on a button that is about to disappear
      if (e.detail === 0) {
        var target = document.querySelector('#main[tabindex="-1"]') || document.querySelector("[data-header] .brand, .auth-visual .brand, .brand");
        if (target) target.focus({ preventScroll: true });
      }
    });
  }

  /* ---------- DOM ready ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    applyTheme(currentTheme());
    applyDir(root.getAttribute("dir") || "ltr");
    injectAssessment();
    initScrollTop();

    // Year
    document.querySelectorAll("[data-year]").forEach(function (y) { y.textContent = new Date().getFullYear(); });

    // ---------- Shared header ----------
    var header = document.querySelector("[data-header]");
    if (header) {
      var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
      window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

      // Home dropdown (click / keyboard; hover on fine pointers)
      var dds = header.querySelectorAll("[data-dropdown]");
      var closeDropdowns = function (except) {
        dds.forEach(function (dd) {
          if (dd === except) return;
          var b = dd.querySelector("[data-dropdown-btn]"), m = dd.querySelector(".sb-dropdown");
          b.setAttribute("aria-expanded", "false"); m.hidden = true;
        });
      };
      dds.forEach(function (dd) {
        var btn = dd.querySelector("[data-dropdown-btn]"), menu = dd.querySelector(".sb-dropdown"), t;
        var setOpen = function (o) { btn.setAttribute("aria-expanded", o ? "true" : "false"); menu.hidden = !o; };
        btn.addEventListener("click", function (e) { e.stopPropagation(); var o = menu.hidden; closeDropdowns(dd); setOpen(o); if (o) { var f = menu.querySelector("a"); if (f && e.detail === 0) f.focus(); } });
        if (window.matchMedia && window.matchMedia("(hover: hover)").matches) {
          dd.addEventListener("mouseenter", function () { clearTimeout(t); closeDropdowns(dd); setOpen(true); });
          dd.addEventListener("mouseleave", function () { t = setTimeout(function () { setOpen(false); }, 160); });
        }
        dd.addEventListener("keydown", function (e) {
          var items = Array.prototype.slice.call(menu.querySelectorAll("a")), i = items.indexOf(document.activeElement);
          if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); (items[i + 1] || items[0]).focus(); }
          if (e.key === "ArrowUp") { e.preventDefault(); setOpen(true); (items[i - 1] || items[items.length - 1]).focus(); }
          if (e.key === "Escape" && !menu.hidden) { setOpen(false); btn.focus(); }
        });
        dd.addEventListener("focusout", function (e) { if (!dd.contains(e.relatedTarget)) setOpen(false); });
      });
      document.addEventListener("click", function (e) { if (!e.target.closest("[data-dropdown]")) closeDropdowns(); });

      // Mobile menu
      var mt = header.querySelector("[data-mobile-toggle]"), panel = document.getElementById("mobile-nav");
      var setMobile = function (o) {
        if (!mt || !panel) return;
        // Sub-menus (Home) always start collapsed each time the menu opens; they expand only on an explicit tap.
        if (o) panel.querySelectorAll("[data-m-group]").forEach(function (g) {
          var sub = document.getElementById(g.getAttribute("aria-controls"));
          if (sub) sub.hidden = true;
          g.setAttribute("aria-expanded", "false");
        });
        panel.hidden = !o;
        mt.setAttribute("aria-expanded", o ? "true" : "false");
        mt.setAttribute("aria-label", o ? "Close menu" : "Open menu");
      };
      if (mt && panel) {
        mt.addEventListener("click", function () { setMobile(panel.hidden); });
        panel.addEventListener("click", function (e) { if (e.target.closest("a")) setMobile(false); });
        document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) { setMobile(false); mt.focus(); } });
        window.addEventListener("resize", function () { if (window.innerWidth >= 1280) setMobile(false); });
        panel.querySelectorAll("[data-m-group]").forEach(function (g) {
          g.addEventListener("click", function () {
            var sub = document.getElementById(g.getAttribute("aria-controls")), o = sub.hidden;
            sub.hidden = !o; g.setAttribute("aria-expanded", o ? "true" : "false");
          });
        });
      }
    }

    // Reveal on scroll
    var rev = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
      }, { threshold: 0.12 });
      rev.forEach(function (r) { io.observe(r); });
    } else rev.forEach(function (r) { r.classList.add("in"); });

    // Counters
    var counters = document.querySelectorAll("[data-count]");
    if (counters.length && "IntersectionObserver" in window) {
      var co = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) {
          if (!en.isIntersecting) return;
          var el = en.target, end = parseFloat(el.getAttribute("data-count")), suf = el.getAttribute("data-suffix") || "", t0 = null;
          var step = function (ts) {
            if (!t0) t0 = ts;
            var p = Math.min((ts - t0) / 1400, 1), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
            el.textContent = v.toLocaleString("en-IN") + suf;
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step); co.unobserve(el);
        });
      }, { threshold: 0.5 });
      counters.forEach(function (c) { co.observe(c); });
    }

    // Tabs (generic)
    document.querySelectorAll("[role=tablist]").forEach(function (list) {
      var tabs = list.querySelectorAll("[role=tab]");
      function activate(tab) {
        tabs.forEach(function (t) {
          var sel = t === tab;
          t.setAttribute("aria-selected", sel ? "true" : "false");
          t.tabIndex = sel ? 0 : -1;
          var p = document.getElementById(t.getAttribute("aria-controls"));
          if (p) p.hidden = !sel;
        });
      }
      tabs.forEach(function (t, i) {
        t.addEventListener("click", function () { activate(t); });
        t.addEventListener("keydown", function (e) {
          var k = e.key, n = null, rtl = root.getAttribute("dir") === "rtl";
          if (k === (rtl ? "ArrowLeft" : "ArrowRight")) n = tabs[(i + 1) % tabs.length];
          if (k === (rtl ? "ArrowRight" : "ArrowLeft")) n = tabs[(i - 1 + tabs.length) % tabs.length];
          if (list.getAttribute("aria-orientation") === "vertical") { if (k === "ArrowDown") n = tabs[(i + 1) % tabs.length]; if (k === "ArrowUp") n = tabs[(i - 1 + tabs.length) % tabs.length]; }
          if (n) { e.preventDefault(); n.focus(); activate(n); }
        });
      });
      // Deep link: page.html#panel-id selects that tab
      var syncHash = function () {
        var h = location.hash.slice(1);
        tabs.forEach(function (t) {
          if (h && t.getAttribute("aria-controls") === h) {
            activate(t);
            var panel = document.getElementById(h);
            if (panel) setTimeout(function () { list.scrollIntoView({ behavior: "smooth", block: "start" }); }, 50);
          }
        });
      };
      syncHash();
      window.addEventListener("hashchange", syncHash);
    });

    // Accordion (collapsed answers are hidden from assistive tech as well as visually)
    var syncAcc = function (item) { var p = item.querySelector(".acc-panel"); if (p) { var o = item.classList.contains("open"); p.setAttribute("aria-hidden", o ? "false" : "true"); if ("inert" in p) p.inert = !o; } };
    document.querySelectorAll(".acc-item").forEach(syncAcc);
    document.querySelectorAll(".acc-btn").forEach(function (b) {
      b.addEventListener("click", function () {
        var item = b.closest(".acc-item"), open = !item.classList.contains("open");
        item.parentElement.querySelectorAll(".acc-item.open").forEach(function (o) { o.classList.remove("open"); o.querySelector(".acc-btn").setAttribute("aria-expanded", "false"); syncAcc(o); });
        item.classList.toggle("open", open);
        b.setAttribute("aria-expanded", open ? "true" : "false");
        syncAcc(item);
      });
    });

    // Testimonials
    var testi = document.querySelector("[data-testi]");
    if (testi) {
      var slides = testi.querySelectorAll(".testi-slide"), dotsWrap = testi.querySelector(".testi-dots"), idx = 0, timer;
      slides.forEach(function (_, i) {
        var d = document.createElement("button");
        d.type = "button"; d.setAttribute("aria-label", "Show review " + (i + 1));
        d.addEventListener("click", function () { go(i); restart(); });
        dotsWrap.appendChild(d);
      });
      var go = function (i) {
        idx = (i + slides.length) % slides.length;
        slides.forEach(function (s, j) { s.classList.toggle("active", j === idx); });
        dotsWrap.querySelectorAll("button").forEach(function (d, j) { d.classList.toggle("active", j === idx); d.setAttribute("aria-current", j === idx ? "true" : "false"); });
      };
      var restart = function () { clearInterval(timer); timer = setInterval(function () { go(idx + 1); }, 7000); };
      testi.querySelector("[data-prev]").addEventListener("click", function () { go(idx - 1); restart(); });
      testi.querySelector("[data-next]").addEventListener("click", function () { go(idx + 1); restart(); });
      go(0); restart();
    }

    // Interactive soroban
    var sb = document.querySelector("[data-soroban]");
    if (sb) {
      var RODS = 5, state = [], valEl = document.querySelector("[data-soroban-value]");
      var places = ["10K", "1K", "100", "10", "1"];
      var preset = [0, 2, 0, 2, 6]; // 2,026
      for (var r = 0; r < RODS; r++) {
        var v = preset[r];
        state.push({ h: v >= 5 ? 1 : 0, e: v % 5 });
        var col = document.createElement("div");
        var rod = document.createElement("div"); rod.className = "rod";
        var hb = document.createElement("button"); hb.type = "button"; hb.className = "bead heaven"; hb.dataset.r = r; hb.dataset.k = "h";
        hb.setAttribute("aria-label", "Five bead, " + places[r] + " rod");
        rod.appendChild(hb);
        for (var i = 0; i < 4; i++) {
          var eb = document.createElement("button"); eb.type = "button"; eb.className = "bead earth"; eb.dataset.r = r; eb.dataset.k = "e"; eb.dataset.i = i;
          eb.setAttribute("aria-label", "One bead " + (i + 1) + ", " + places[r] + " rod");
          rod.appendChild(eb);
        }
        col.appendChild(rod);
        var lb = document.createElement("div"); lb.className = "rod-label"; lb.textContent = places[r]; col.appendChild(lb);
        sb.appendChild(col);
      }
      var render = function () {
        var total = 0;
        sb.querySelectorAll(".rod").forEach(function (rod, r) {
          var s = state[r];
          var hb = rod.querySelector(".heaven");
          hb.style.top = (s.h ? 22 : 2) + "px";
          hb.setAttribute("aria-pressed", s.h ? "true" : "false");
          rod.querySelectorAll(".earth").forEach(function (eb, i) {
            var active = i < s.e;
            eb.style.top = (active ? 54 + i * 23 : 84 + i * 23) + "px";
            eb.setAttribute("aria-pressed", active ? "true" : "false");
          });
          total += (s.h * 5 + s.e) * Math.pow(10, RODS - 1 - r);
        });
        if (valEl) valEl.textContent = total.toLocaleString("en-IN");
      };
      sb.addEventListener("click", function (e) {
        var b = e.target.closest(".bead"); if (!b) return;
        var s = state[+b.dataset.r];
        if (b.dataset.k === "h") s.h = s.h ? 0 : 1;
        else { var i = +b.dataset.i; s.e = i < s.e ? i : i + 1; }
        render();
      });
      var reset = document.querySelector("[data-soroban-reset]");
      if (reset) reset.addEventListener("click", function () { state.forEach(function (s) { s.h = 0; s.e = 0; }); render(); });
      render();
    }

    // Generic enquiry forms
    document.querySelectorAll("form[data-enquiry]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!validate(form)) return;
        var btn = form.querySelector("[type=submit]"), label = btn.innerHTML;
        btn.disabled = true; btn.textContent = "Sending…";
        setTimeout(function () {
          btn.disabled = false; btn.innerHTML = label;
          var succ = document.getElementById(form.getAttribute("data-enquiry"));
          if (succ) { form.hidden = true; succ.classList.add("show"); }
          else toast("Thank you! We’ll be in touch shortly.");
        }, 900);
      });
    });
    document.querySelectorAll("[data-reset-form]").forEach(function (b) {
      b.addEventListener("click", function () {
        var f = document.getElementById(b.getAttribute("data-reset-form"));
        if (f) { f.reset(); f.hidden = false; b.closest(".form-success").classList.remove("show"); }
      });
    });
  });
})();
