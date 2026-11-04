/* SutraBead — Home 2 interactions: program finder, benefits toggle, competition track, enrolment wizard */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Program finder ---------- */
  var age = $("#f-age"), ageOut = $("#f-age-out"), mode = "centre";
  var BATCH = {
    junior: { centre: "Sat · 10:00 am · Academy", online: "Sun · 10:30 am · Live" },
    core: { centre: "Tue & Thu · 5:00 pm · Academy", online: "Mon & Wed · 6:00 pm · Live" },
    vedic: { centre: "Sat · 11:30 am · Academy", online: "Sun · 4:00 pm · Live" }
  };
  function recommend() {
    var a = +age.value, goal = (document.querySelector("[name=goal]:checked") || {}).value, r;
    // Both programs are open to every child aged 4–12; age only decides which age-grouped batch they join.
    var group = a <= 6 ? "Little Counters batch (4–6)" : a <= 9 ? "Bead Builders batch (7–9)" : "Sutra Masters batch (10–12)";
    var bkey = a <= 6 ? "junior" : "core";
    if (goal === "school") r = { key: "vedic", prog: "Vedic Maths · Module 1", desc: "Sutra shortcuts that support school maths — faster multiplication, division and checking.", fee: "₹5,400 / module", link: "programs.html#vedic", wiz: "Vedic Maths" };
    else if (goal === "compete") r = { key: bkey, prog: "Abacus + Competition Prep", desc: "Abacus levels plus timed flash rounds and practice papers for state and national events.", fee: "₹2,400 / month", link: "programs.html#abacus", wiz: "Abacus Mental Arithmetic" };
    else r = { key: bkey, prog: "Abacus Mental Arithmetic", desc: goal === "speed" ? "Visualisation drills that build real mental-calculation speed, level by level." : "Bead work and visualisation that lengthen focus and sharpen memory.", fee: "₹2,400 / month", link: "programs.html#abacus", wiz: "Abacus Mental Arithmetic" };
    r.level = group;
    ageOut.textContent = a;
    age.setAttribute("aria-valuetext", a + " years");
    $("#f-prog").textContent = r.prog;
    $("#f-desc").textContent = r.desc;
    $("#f-meta").innerHTML = "";
    [r.level, BATCH[r.key][mode], "From " + r.fee].forEach(function (t, i) {
      var s = document.createElement("span"); s.className = "chip " + (i === 2 ? "warn" : "neutral"); s.textContent = t; $("#f-meta").appendChild(s);
    });
    $("#f-more").href = r.link;
    finderChoice = { age: a, prog: r.wiz, mode: mode };
  }
  var finderChoice = null;
  if (age) {
    age.addEventListener("input", recommend);
    $$("[name=goal]").forEach(function (g) { g.addEventListener("change", recommend); });
    $$("[data-mode]").forEach(function (b) {
      b.addEventListener("click", function () {
        mode = b.getAttribute("data-mode");
        $$("[data-mode]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        recommend();
      });
    });
    $("#finder").addEventListener("submit", function (e) { e.preventDefault(); });
    $("#f-cta").addEventListener("click", function () { if (finderChoice) prefill(finderChoice); });
    recommend();
  }

  /* ---------- Benefits: Month 1 vs Month 6 ---------- */
  function setMonth(m) {
    $$("[data-month]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-month") === m ? "true" : "false"); });
    $$("#ben-meters li").forEach(function (li) {
      var v = +li.getAttribute("data-m" + m), max = +li.getAttribute("data-max");
      $("i", li).style.width = (v / max * 100) + "%";
      $("[data-val]", li).textContent = v + li.getAttribute("data-unit");
    });
  }
  $$("[data-month]").forEach(function (b) { b.addEventListener("click", function () { setMonth(b.getAttribute("data-month")); }); });
  var meters = $("#ben-meters");
  if (meters) {
    setMonth("1");
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { setTimeout(function () { setMonth("6"); }, 250); io.disconnect(); } }, { threshold: 0.4 });
      io.observe(meters);
    } else setMonth("6");
  }

  /* ---------- Competition track scroll ---------- */
  var track = $("#comp-track");
  $$("[data-scroll]").forEach(function (b) {
    b.addEventListener("click", function () {
      var dir = +b.getAttribute("data-scroll") * (document.documentElement.getAttribute("dir") === "rtl" ? -1 : 1);
      track.scrollBy({ left: dir * 310, behavior: "smooth" });
    });
  });

  /* ---------- Enrolment wizard ---------- */
  var wiz = $("#wizard"), step = 1;
  if (!wiz) return;
  var back = $("#w-back"), next = $("#w-next");
  function show(n) {
    step = n;
    $$("[data-step]", wiz).forEach(function (s) { s.hidden = +s.getAttribute("data-step") !== n; });
    $$("[data-step-dot]").forEach(function (d) {
      var k = +d.getAttribute("data-step-dot");
      d.classList.toggle("is-current", k === n); d.classList.toggle("is-done", k < n);
      $(".dot", d).textContent = k < n ? "✓" : k;
      if (k === n) d.setAttribute("aria-current", "step"); else d.removeAttribute("aria-current");
    });
    back.hidden = n === 1;
    next.textContent = n === 3 ? "Reserve trial class" : "Continue";
    $("#w-count").textContent = "Step " + n + " of 3";
  }
  function prefill(c) {
    wiz.hidden = false; $("#w-done").classList.remove("show");
    if (c.age) $("#w-age").value = String(c.age);
    if (c.prog) { var p = document.querySelector("[name=w-prog][value='" + c.prog + "']"); if (p) p.checked = true; }
    if (c.mode) { var m = document.querySelector("[name=w-mode][value='" + (c.mode === "online" ? "Live online" : "At the academy") + "']"); if (m) m.checked = true; }
    show(1);
    setTimeout(function () { $("#w-child").focus({ preventScroll: true }); }, 500);
  }
  $$("[data-prefill-mode]").forEach(function (a) { a.addEventListener("click", function () { prefill({ mode: a.getAttribute("data-prefill-mode") }); }); });
  back.addEventListener("click", function () { show(step - 1); });
  wiz.addEventListener("submit", function (e) {
    e.preventDefault();
    var cur = $("[data-step='" + step + "']", wiz);
    if (!SB.validate(cur)) return;
    if (step < 3) { show(step + 1); return; }
    next.disabled = true; next.textContent = "Reserving…";
    setTimeout(function () {
      next.disabled = false;
      var prog = (document.querySelector("[name=w-prog]:checked") || {}).value, md = (document.querySelector("[name=w-mode]:checked") || {}).value;
      $("#w-summary").textContent = $("#w-child").value.trim() + " (age " + $("#w-age").value + ") · " + prog + " · " + md + ". Our counsellor will call " + $("#w-phone").value.trim() + " within 24 hours to confirm the trial slot.";
      wiz.hidden = true;
      $("#w-done").classList.add("show");
      SB.toast("Trial class request received.");
    }, 900);
  });
  $("#w-again").addEventListener("click", function () {
    var keep = { p: $("#w-parent").value, ph: $("#w-phone").value, em: $("#w-email").value };
    wiz.reset(); $("#w-parent").value = keep.p; $("#w-phone").value = keep.ph; $("#w-email").value = keep.em;
    prefill({});
  });
  show(1);
})();
