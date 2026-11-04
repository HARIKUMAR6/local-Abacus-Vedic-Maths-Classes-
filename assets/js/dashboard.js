/* SutraBead — Parent Dashboard */
(function () {
  "use strict";

  /* ---------- Session guard ---------- */
  var SESSION_KEY = "sb-parent-session", STATE_KEY = "sb-parent-state-v1";
  function getSession() {
    try { return localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY); } catch (e) { return "ok"; }
  }
  // Dashboard opens directly; signing in via the Login Portal is optional.
  if (!getSession()) { try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ id: "guest", at: Date.now() })); } catch (e) {} }

  /* ---------- Helpers ---------- */
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var inr = function (n) { return "₹" + Number(n).toLocaleString("en-IN"); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  function fmtDate(iso) { var d = new Date(iso + "T00:00:00"); return d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear(); }
  function fmtTime(t) { var p = t.split(":"), h = +p[0], m = p[1]; return (h % 12 || 12) + ":" + m + (h < 12 ? " am" : " pm"); }
  function isoOf(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function initials(name) { return name.split(" ").map(function (p) { return p[0]; }).join("").slice(0, 2).toUpperCase(); }

  /* ---------- Data ---------- */
  var KIDS = {
    aarav: { name: "Aarav", full: "Aarav Iyer", age: 10, color: "#3b2fc9" },
    diya: { name: "Diya", full: "Diya Iyer", age: 6, color: "#d03a33" }
  };

  var RECURRING = [
    { child: "aarav", prog: "Abacus · Level 4", dow: 2, start: "17:00", end: "18:30", where: "Academy · Room 3", mode: "Centre", trainer: "Abacus Trainer", color: "#3b2fc9" },
    { child: "aarav", prog: "Abacus · Level 4", dow: 4, start: "17:00", end: "18:30", where: "Academy · Room 3", mode: "Centre", trainer: "Abacus Trainer", color: "#3b2fc9" },
    { child: "aarav", prog: "Vedic Maths · Module 1", dow: 6, start: "11:30", end: "12:45", where: "Live online", mode: "Online", trainer: "Vedic Maths Trainer", color: "#0b7a69" },
    { child: "diya", prog: "Abacus · Level 1", dow: 3, start: "16:00", end: "17:00", where: "Academy · Room 1", mode: "Centre", trainer: "Abacus Trainer", color: "#d03a33" },
    { child: "diya", prog: "Abacus · Level 1", dow: 6, start: "10:00", end: "11:00", where: "Academy · Room 1", mode: "Centre", trainer: "Abacus Trainer", color: "#d03a33" }
  ];
  var EVENTS = [
    { date: "2026-11-14", child: "all", prog: "Parent–trainer meet", start: "12:00", end: "13:00", where: "Academy · Parent lounge", mode: "Centre", trainer: "Abacus Trainers", color: "#e08a00" },
    { date: "2026-11-22", child: "aarav", prog: "Level 4 assessment", start: "10:00", end: "11:00", where: "Academy · Exam hall", mode: "Centre", trainer: "Assessment panel", color: "#e08a00" },
    { date: "2026-12-05", child: "diya", prog: "Bead Stars showcase", start: "17:30", end: "18:30", where: "Academy · Hall", mode: "Centre", trainer: "Abacus Trainer", color: "#e08a00" }
  ];

  var PROGRESS = {
    aarav: {
      track: "Abacus levels", labels: ["J", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], now: 4, syllabus: 45, levelName: "Level 4 · Mind Abacus",
      skills: [["Calculation speed", 82, "#3b2fc9"], ["Accuracy", 94, "#0b7a69"], ["Visualisation", 76, "#e08a00"], ["Listening sums", 70, "#d03a33"]],
      practice: [65, 80, 95, 70, 110, 120, 90, 105], goal: 90,
      scores: [["2026-10-28", "Level 3 · Final assessment", 96, "Distinction"], ["2026-10-17", "Vedic M1 · Quiz 2", 89, "Merit"], ["2026-09-26", "Vedic M1 · Quiz 1", 91, "Distinction"], ["2026-09-12", "Level 3 · Mid-term", 88, "Merit"]],
      remark: ["Aarav’s visualisation is getting sharper — he now solves 3-digit sums without moving his fingers. Next focus: steady pace in listening rounds.", "Abacus Trainer · 30 Oct"]
    },
    diya: {
      track: "Abacus levels", labels: ["J", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], now: 1, syllabus: 20, levelName: "Level 1 · Bead Basics",
      skills: [["Bead handling", 85, "#3b2fc9"], ["Accuracy", 90, "#0b7a69"], ["Number sense", 88, "#e08a00"], ["Visualisation", 52, "#d03a33"]],
      practice: [40, 45, 30, 55, 60, 50, 65, 62], goal: 60,
      scores: [["2026-10-24", "Junior · Final assessment", 92, "Distinction"], ["2026-10-03", "Junior · Bead games review", 86, "Merit"], ["2026-09-05", "Junior · Number friends check", 81, "Merit"]],
      remark: ["Diya loves the “small friends” songs and moves beads with confidence. A few minutes of daily flash cards will help her picture the abacus.", "Abacus Trainer · 31 Oct"]
    }
  };

  var DEFAULT_STATE = {
    profile: { first: "Meera", last: "Iyer", email: "meera.iyer@outlook.in" },
    autopay: false,
    extraKids: [],
    enrolments: [
      { child: "Aarav", prog: "Abacus Mental Arithmetic — Level 4", batch: "Tue & Thu · 5:00 pm · Academy", term: "Oct–Dec 2026", status: "Active" },
      { child: "Aarav", prog: "Vedic Maths — Module 1", batch: "Sat · 11:30 am · Live online", term: "Oct–Nov 2026", status: "Active" },
      { child: "Diya", prog: "Abacus Mental Arithmetic — Level 1", batch: "Wed & Sat · Academy", term: "Nov 2026–Jan 2027", status: "Active" }
    ],
    dues: [
      { id: "d1", child: "Diya", title: "Abacus Level 1 · Quarterly", period: "Nov 2026 – Jan 2027", amount: 6600, due: "2026-11-10" },
      { id: "d2", child: "Aarav", title: "National Olympiad 2027 · Entry & prep sessions", period: "Dec 2026 – Feb 2027", amount: 5400, due: "2026-11-25" }
    ],
    history: [
      { no: "SB-R-26-0931", date: "2026-10-03", child: "Aarav", desc: "Abacus Level 4 · Quarterly (Oct–Dec)", method: "UPI", amount: 6600, status: "Paid" },
      { no: "SB-R-26-0932", date: "2026-10-03", child: "Aarav", desc: "Vedic Maths · Module 1", method: "UPI", amount: 5400, status: "Paid" },
      { no: "SB-R-26-0786", date: "2026-08-01", child: "Diya", desc: "Abacus Junior · Quarterly (Aug–Oct) · sibling 10% off", method: "Card", amount: 5940, status: "Paid" },
      { no: "SB-R-26-0702", date: "2026-07-04", child: "Aarav", desc: "Abacus · Quarterly (Jul–Sep)", method: "UPI", amount: 6600, status: "Paid" },
      { no: "SB-R-26-0655", date: "2026-06-18", child: "Diya", desc: "Registration & abacus kit", method: "Net banking", amount: 1500, status: "Paid" },
      { no: "SB-R-26-0590", date: "2026-05-12", child: "Aarav", desc: "Summer Speed-Maths Camp", method: "UPI", amount: 3200, status: "Refunded" },
      { no: "SB-R-26-0388", date: "2026-04-02", child: "Aarav", desc: "Abacus · Quarterly (Apr–Jun)", method: "Card", amount: 6600, status: "Paid" },
      { no: "SB-R-26-0105", date: "2026-01-05", child: "Aarav", desc: "Abacus · Quarterly (Jan–Mar)", method: "UPI", amount: 6600, status: "Paid" },
      { no: "SB-R-25-0941", date: "2025-10-04", child: "Aarav", desc: "Abacus · Quarterly (Oct–Dec)", method: "UPI", amount: 6600, status: "Paid" },
      { no: "SB-R-25-0712", date: "2025-07-03", child: "Aarav", desc: "Abacus · Quarterly (Jul–Sep)", method: "UPI", amount: 6600, status: "Paid" },
      { no: "SB-R-25-0420", date: "2025-04-05", child: "Aarav", desc: "Abacus · Quarterly (Apr–Jun)", method: "Card", amount: 6600, status: "Paid" },
      { no: "SB-R-25-0118", date: "2025-01-08", child: "Aarav", desc: "Registration, kit & Quarterly (Jan–Mar)", method: "Net banking", amount: 8100, status: "Paid" }
    ]
  };

  var state;
  try { state = JSON.parse(localStorage.getItem(STATE_KEY)) || null; } catch (e) { state = null; }
  if (!state || !state.history) state = JSON.parse(JSON.stringify(DEFAULT_STATE));
  function save() { try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch (e) {} }

  var PROGRAMS = {
    abacus: { title: "Abacus Mental Arithmetic", short: "Abacus — next level", price: 6600, minAge: 4, batches: ["Tue & Thu · 5:00 pm", "Mon & Wed · 4:30 pm", "Sat & Sun · 10:00 am"], modes: ["At the academy", "Live online"], starts: ["2026-12-01", "2027-01-05"], term: "Dec 2026–Feb 2027" },
    vedic: { title: "Vedic Maths — Module 2", short: "Vedic Maths — Module 2", price: 5400, minAge: 4, batches: ["Sat · 11:30 am", "Sun · 4:00 pm"], modes: ["Live online", "At the academy"], starts: ["2026-12-06"], term: "Dec 2026–Feb 2027" },
    camp: { title: "Winter Speed-Maths Camp", short: "Winter Speed-Maths Camp", price: 3200, minAge: 4, batches: ["Mornings · 9:30 am–12:00 pm"], modes: ["At the academy"], starts: ["2026-12-15"], term: "15–24 Dec 2026" }
  };

  /* ---------- Shell: routing ---------- */
  var TITLES = { overview: "Dashboard Overview", children: "My Children", enrolment: "Program Enrolment", progress: "Learning Level Progress", schedule: "Class Schedules", fees: "Fee Payment Overview", payments: "Payment History", profile: "Profile Settings" };
  var sidebar = $("#sidebar"), overlay = $("#overlay"), sideToggle = $("#side-toggle");
  function closeSidebar() { sidebar.classList.remove("open"); overlay.classList.remove("show"); sideToggle.setAttribute("aria-expanded", "false"); }
  sideToggle.addEventListener("click", function () { var o = sidebar.classList.toggle("open"); overlay.classList.toggle("show", o); sideToggle.setAttribute("aria-expanded", o ? "true" : "false"); });
  overlay.addEventListener("click", closeSidebar);

  function show(view) {
    if (!TITLES[view]) view = "overview";
    $$(".view").forEach(function (v) { v.classList.toggle("active", v.id === "view-" + view); });
    $$(".side-nav a").forEach(function (a) { if (a.getAttribute("data-view") === view) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    $("#view-title").textContent = TITLES[view];
    document.title = TITLES[view] + " — SutraBead";
    closeSidebar(); closeMenus();
    window.scrollTo(0, 0);
    if (view === "children") animateRings();
    if (view === "progress") renderProgress();
  }
  window.addEventListener("hashchange", function () { show(location.hash.slice(1)); });
  document.addEventListener("click", function (e) {
    var cl = e.target.closest("[data-child-link]");
    if (cl) { var c = cl.getAttribute("data-child-link"); progChild = c; schedChild = c; setSeg("#pr-child", c); setSeg("#sc-child", c); renderWeek(); }
  });

  /* ---------- Dropdown menus ---------- */
  function closeMenus() { $$(".menu.open").forEach(function (m) { m.classList.remove("open"); }); $$("[data-menu]").forEach(function (b) { b.setAttribute("aria-expanded", "false"); }); }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-menu]");
    if (b) {
      var m = document.getElementById(b.getAttribute("data-menu")), open = !m.classList.contains("open");
      closeMenus();
      if (open) { m.classList.add("open"); b.setAttribute("aria-expanded", "true"); }
      return;
    }
    if (!e.target.closest(".menu")) closeMenus();
    else if (e.target.closest("a, .menu-item")) closeMenus();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenus(); });
  // Mobile menu shows the same notifications as the header bell (copied at load, not duplicated in markup)
  $$("#notif-menu .notif").forEach(function (n) { $("#side-notif-list").appendChild(n.cloneNode(true)); });
  $$("#mark-read, [data-mark-read]").forEach(function (b) {
    b.addEventListener("click", function () { $$(".notif.unread").forEach(function (n) { n.classList.remove("unread"); }); $("#notif-dot").hidden = true; $("#side-notif-new").hidden = true; SB.toast("All notifications marked as read."); });
  });

  function setSeg(sel, val) { $$(sel + " button").forEach(function (b) { b.setAttribute("aria-pressed", (b.getAttribute("data-child") || b.getAttribute("data-range") || b.getAttribute("data-prog-filter")) === val ? "true" : "false"); }); }

  /* ---------- Header / identity ---------- */
  function renderIdentity() {
    var p = state.profile, full = p.first + " " + p.last;
    $("#top-name").textContent = full; $("#menu-name").textContent = full; $("#menu-email").textContent = p.email;
    $("#top-initials").textContent = initials(full);
    $("#side-name").textContent = full; $("#side-email").textContent = p.email; $("#side-initials").textContent = initials(full);
    $$("[data-parent-first]").forEach(function (x) { x.textContent = p.first; });
    $$("[data-parent-name]").forEach(function (x) { x.textContent = full; });
  }
  var now = new Date();
  $("#today-label").textContent = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  $("#greet").textContent = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";
  var eb = $("#view-overview .eyebrow"); if (eb) eb.textContent = now.toLocaleDateString("en-IN", { weekday: "long" }) + " update";

  /* ---------- Sessions ---------- */
  function sessionsBetween(from, days) {
    var out = [];
    for (var i = 0; i < days; i++) {
      var d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i), iso = isoOf(d);
      RECURRING.forEach(function (r) { if (r.dow === d.getDay()) out.push(Object.assign({ date: iso }, r)); });
      EVENTS.forEach(function (ev) { if (ev.date === iso) out.push(Object.assign({}, ev)); });
    }
    out.sort(function (a, b) { return (a.date + a.start).localeCompare(b.date + b.start); });
    return out;
  }
  function childLabel(c) { return c === "all" ? "All children" : KIDS[c].name; }
  var CLASS_CACHE = [];
  function openClass(s) {
    $("#cl-title").textContent = s.prog;
    $("#cl-sub").textContent = childLabel(s.child) + " · " + DAYS[new Date(s.date + "T00:00:00").getDay()] + ", " + fmtDate(s.date);
    $("#cl-facts").innerHTML = "<div><dt>Time</dt><dd>" + fmtTime(s.start) + " – " + fmtTime(s.end) + "</dd></div><div><dt>Where</dt><dd>" + esc(s.where) + "</dd></div><div><dt>Trainer</dt><dd>" + esc(s.trainer) + "</dd></div><div><dt>Mode</dt><dd>" + s.mode + "</dd></div>";
    var foot = '<button class="btn btn-outline" type="button" data-close>Close</button>';
    if (s.child !== "all" && s.color !== "#e08a00") foot = '<button class="btn btn-outline" type="button" id="cl-resched">Reschedule</button>' + (s.mode === "Online" ? '<button class="btn btn-primary" type="button" id="cl-join">Join class</button>' : '<button class="btn btn-primary" type="button" data-close>Got it</button>');
    $("#cl-foot").innerHTML = foot;
    SB.openModal("class-modal");
    var rs = $("#cl-resched");
    if (rs) rs.addEventListener("click", function () { SB.closeModal($("#class-modal")); fillReschedule(s); SB.openModal("reschedule-modal"); });
    var jn = $("#cl-join");
    if (jn) jn.addEventListener("click", function () { SB.closeModal($("#class-modal")); SB.toast("Opening the live classroom for " + KIDS[s.child].name + "…"); });
  }

  /* ---------- Overview ---------- */
  function renderOverview() {
    var nowTs = new Date(), list = sessionsBetween(nowTs, 21).filter(function (s) { return new Date(s.date + "T" + s.end) > nowTs; }).slice(0, 4);
    $("#upnext").innerHTML = list.map(function (s, i) {
      var d = new Date(s.date + "T00:00:00"), isToday = s.date === isoOf(nowTs);
      return '<li><span class="time-pill"><small>' + (isToday ? "Today" : DAYS[d.getDay()] + " " + d.getDate()) + "</small><b>" + fmtTime(s.start).replace(/ (am|pm)/, "") + '</b><small>' + fmtTime(s.start).slice(-2) + '</small></span><div class="li-main"><strong>' + esc(childLabel(s.child)) + " · " + esc(s.prog) + "</strong><span>" + esc(s.where) + " · " + esc(s.trainer) + '</span></div><button class="btn btn-ghost btn-sm" type="button" data-upnext="' + i + '">Details</button></li>';
    }).join("");
    $$("[data-upnext]").forEach(function (b) { b.addEventListener("click", function () { openClass(list[+b.getAttribute("data-upnext")]); }); });
    if (list[0]) {
      var f = list[0], fd = new Date(f.date + "T00:00:00"), when = f.date === isoOf(nowTs) ? "today" : "on " + DAYS[fd.getDay()] + " " + fd.getDate() + " " + MONTHS[fd.getMonth()];
      $("#ov-summary").textContent = childLabel(f.child) + " has " + f.prog + " " + when + " at " + fmtTime(f.start) + ". Aarav’s Level 4 assessment is on 22 November.";
    }
    $("#mini-progress").innerHTML = ["aarav", "diya"].map(function (k) {
      var p = PROGRESS[k], pct = Math.round(((p.now) + p.syllabus / 100) / (p.labels.length - 1) * 100);
      return '<div class="mini-child"><span class="initials" style="background:' + KIDS[k].color + ';color:#fff">' + initials(KIDS[k].full) + '</span><div class="li-main"><strong>' + KIDS[k].name + " · " + p.levelName + '</strong><div class="bar" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100" aria-label="' + KIDS[k].name + ' overall journey"><i data-w="' + pct + '" style="--c:' + KIDS[k].color + '"></i></div></div><span class="pct">' + pct + "%</span></div>";
    }).join("");
    requestAnimationFrame(function () { $$("#mini-progress .bar i").forEach(function (i) { i.style.width = i.getAttribute("data-w") + "%"; }); });
  }

  /* ---------- Children ---------- */
  function animateRings() {
    $$("[data-ring]").forEach(function (r) {
      var v = +r.getAttribute("data-ring"), c = $(".val", r), C = 2 * Math.PI * 34;
      c.style.strokeDasharray = C; c.style.strokeDashoffset = C;
      requestAnimationFrame(function () { requestAnimationFrame(function () { c.style.strokeDashoffset = C * (1 - v / 100); }); });
    });
  }
  function renderExtraKids() {
    $$(".kid.extra").forEach(function (k) { k.remove(); });
    var addBtn = $(".add-kid");
    state.extraKids.forEach(function (k) {
      var el = document.createElement("article");
      el.className = "kid extra";
      el.innerHTML = '<div class="kid-top"><div class="kid-photo" style="display:grid;place-items:center;background:var(--brand-soft)"><span class="initials" style="width:72px;height:72px;font-size:1.5rem">' + esc(initials(k.first + " " + state.profile.last)) + '</span></div><div class="kid-id"><h3>' + esc(k.first) + " " + esc(state.profile.last) + "</h3><span>" + esc(k.age) + " yrs · " + esc(k.cls) + '</span><span class="chip warn">Assessment pending</span></div></div><div class="kid-body"><dl class="facts"><div><dt>Interested in</dt><dd>' + esc(k.prog) + "</dd></div><div><dt>School</dt><dd>" + esc(k.school || "—") + '</dd></div><div><dt>Assessment</dt><dd>Counsellor will call</dd></div><div><dt>Added</dt><dd>' + esc(k.added) + '</dd></div></dl></div><div class="kid-foot"><a class="btn btn-outline btn-sm" href="#enrolment" data-view="enrolment">Browse programs</a></div>';
      addBtn.parentNode.insertBefore(el, addBtn);
    });
  }
  var cf = $("#child-form");
  cf.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!SB.validate(cf)) return;
    var dob = new Date($("#ac-dob").value), age = Math.max(3, Math.floor((Date.now() - dob) / 31557600000));
    state.extraKids.push({ first: $("#ac-first").value.trim(), age: age, cls: $("#ac-class").value, school: $("#ac-school").value.trim(), prog: (cf.querySelector("[name=ac-prog]:checked") || {}).value, added: fmtDate(isoOf(new Date())) });
    save(); renderExtraKids(); fillChildSelect();
    SB.closeModal($("#child-modal"));
    SB.toast($("#ac-first").value.trim() + " has been added. We’ll call you to book an assessment.");
    cf.reset();
  });

  /* ---------- Enrolment ---------- */
  function renderEnrolments() {
    $("#enrol-body").innerHTML = state.enrolments.map(function (r) {
      var cls = r.status === "Active" ? "ok" : "info";
      return "<tr><td><strong>" + esc(r.child) + "</strong></td><td>" + esc(r.prog) + "</td><td>" + esc(r.batch) + "</td><td>" + esc(r.term) + '</td><td><span class="chip ' + cls + '">' + esc(r.status) + "</span></td></tr>";
    }).join("");
    var active = state.enrolments.length;
    $("#enrol-count").textContent = active + " enrolments";
    $("#kpi-enrol").textContent = active;
  }
  $$("[data-prog-filter]").forEach(function (b) {
    b.addEventListener("click", function () {
      var f = b.getAttribute("data-prog-filter"); setSeg("[aria-label='Filter programs']", f);
      $$(".prog").forEach(function (p) { p.hidden = f !== "all" && p.getAttribute("data-kind") !== f; });
    });
  });
  function allChildren() {
    var list = [{ key: "aarav", name: "Aarav", age: 10 }, { key: "diya", name: "Diya", age: 6 }];
    state.extraKids.forEach(function (k, i) { list.push({ key: "x" + i, name: k.first, age: k.age }); });
    return list;
  }
  function fillChildSelect() {
    $("#en-child").innerHTML = '<option value="">Select child</option>' + allChildren().map(function (c) { return '<option value="' + esc(c.key) + '" data-age="' + c.age + '">' + esc(c.name) + " (" + c.age + " yrs)</option>"; }).join("");
  }
  var curProg = null;
  function pills(name, arr) { return arr.map(function (v, i) { return '<label><input type="radio" name="' + name + '" value="' + esc(v) + '"' + (i === 0 ? " checked" : "") + "><span>" + esc(v) + "</span></label>"; }).join(""); }
  function updateEnrolSummary() {
    var p = PROGRAMS[curProg], sel = $("#en-child"), opt = sel.options[sel.selectedIndex], key = sel.value;
    var sibling = key && key !== "aarav"; // second child onwards
    var disc = sibling ? Math.round(p.price * 0.1) : 0;
    $("#en-summary").innerHTML = "<div><span>" + esc(p.title) + "</span><span>" + inr(p.price) + "</span></div>" + (disc ? "<div><span>Sibling discount (10%)</span><span>− " + inr(disc) + "</span></div>" : "") + '<div class="tot"><span>Payable before start</span><span>' + inr(p.price - disc) + "</span></div>";
    return { price: p.price - disc, child: opt && opt.value ? opt.textContent.split(" (")[0] : "" };
  }
  $$("[data-enrol]").forEach(function (b) {
    b.addEventListener("click", function () {
      curProg = b.getAttribute("data-enrol"); var p = PROGRAMS[curProg];
      $("#enrol-title").textContent = "Enrol · " + p.title;
      $("#enrol-sub").textContent = "Term: " + p.term + " · Ages 4–12";
      fillChildSelect();
      $("#en-start").innerHTML = p.starts.map(function (s) { return "<option value=\"" + s + "\">" + fmtDate(s) + "</option>"; }).join("");
      $("#en-batches").innerHTML = pills("en-batch", p.batches);
      $("#en-modes").innerHTML = pills("en-mode", p.modes);
      updateEnrolSummary();
      SB.openModal("enrol-modal");
    });
  });
  $("#en-child").addEventListener("change", updateEnrolSummary);
  var ef = $("#enrol-form");
  ef.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!SB.validate(ef)) return;
    var p = PROGRAMS[curProg], sel = $("#en-child"), age = +sel.options[sel.selectedIndex].getAttribute("data-age"), sum = updateEnrolSummary();
    var field = sel.closest(".field");
    field.querySelector(".err").textContent = "Select a child.";
    if (state.enrolments.some(function (r) { return r.child === sum.child && r.prog === p.short; })) { SB.toast(sum.child + " is already enrolled in this program.", "error"); return; }
    if (!$("#en-terms").checked) { SB.toast("Please accept the fee and attendance policy.", "error"); return; }
    var batch = ef.querySelector("[name=en-batch]:checked").value, mode = ef.querySelector("[name=en-mode]:checked").value, start = $("#en-start").value;
    var btn = ef.querySelector("[type=submit]"); btn.disabled = true; btn.innerHTML = '<span class="spinner" aria-hidden="true"></span> Confirming…';
    setTimeout(function () {
      btn.disabled = false; btn.textContent = "Confirm enrolment";
      state.enrolments.push({ child: sum.child, prog: p.short, batch: batch + " · " + mode, term: p.term, status: "Starts " + fmtDate(start) });
      var dueDate = new Date(start + "T00:00:00"); dueDate.setDate(dueDate.getDate() - 7);
      state.dues.push({ id: "d" + Date.now(), child: sum.child, title: p.title, period: p.term, amount: sum.price, due: isoOf(dueDate) });
      save(); renderEnrolments(); renderDues();
      SB.closeModal($("#enrol-modal"));
      SB.toast(sum.child + " is enrolled in " + p.title + ". Fee of " + inr(sum.price) + " added to your dues.");
    }, 900);
  });

  /* ---------- Progress ---------- */
  var progChild = "aarav", chartRange = 8;
  $$("#pr-child button").forEach(function (b) { b.addEventListener("click", function () { progChild = b.getAttribute("data-child"); setSeg("#pr-child", progChild); renderProgress(); }); });
  $$("[data-range]").forEach(function (b) { b.addEventListener("click", function () { chartRange = +b.getAttribute("data-range"); setSeg("[aria-label='Chart range']", String(chartRange)); renderChart(); }); });
  function renderProgress() {
    var p = PROGRESS[progChild];
    $("#pr-track-title").textContent = KIDS[progChild].name + " · " + p.track;
    $("#pr-level-chip").textContent = p.levelName;
    var tr = $("#pr-track"); tr.style.gridTemplateColumns = "repeat(" + p.labels.length + ", 1fr)";
    tr.innerHTML = p.labels.map(function (l, i) { var c = i < p.now ? "done" : i === p.now ? "now" : ""; return '<span class="lv ' + c + '" title="' + (l === "J" ? "Junior" : "Level " + l) + (c === "done" ? " · completed" : c === "now" ? " · in progress" : "") + '">' + l + "</span>"; }).join("");
    $("#pr-syl-label").textContent = p.levelName + " syllabus covered";
    $("#pr-syl-val").textContent = p.syllabus + "%";
    var sb = $("#pr-syl-bar"); sb.style.width = "0"; requestAnimationFrame(function () { requestAnimationFrame(function () { sb.style.width = p.syllabus + "%"; }); });
    $("#pr-skills").innerHTML = p.skills.map(function (s) { return '<div class="skill"><div class="row-between">' + s[0] + "<span>" + s[1] + '</span></div><div class="bar" role="progressbar" aria-label="' + s[0] + '" aria-valuenow="' + s[1] + '" aria-valuemin="0" aria-valuemax="100"><i data-w="' + s[1] + '" style="--c:' + s[2] + '"></i></div></div>'; }).join("");
    requestAnimationFrame(function () { requestAnimationFrame(function () { $$("#pr-skills .bar i").forEach(function (i) { i.style.width = i.getAttribute("data-w") + "%"; }); }); });
    $("#pr-scores").innerHTML = p.scores.map(function (s) { var c = s[3] === "Distinction" ? "ok" : "info"; return "<tr><td>" + fmtDate(s[0]) + "</td><td><strong>" + esc(s[1]) + '</strong></td><td class="num">' + s[2] + '%</td><td><span class="chip ' + c + '">' + s[3] + "</span></td></tr>"; }).join("");
    var trainer = p.remark[1].split(" · ")[0];
    $("#pr-remark").innerHTML = '<span class="initials">' + initials(trainer) + "</span><div><p>“" + esc(p.remark[0]) + "”</p><small>" + esc(p.remark[1]) + "</small></div>";
    renderChart();
  }
  function renderChart() {
    var p = PROGRESS[progChild], data = p.practice.slice(-chartRange), n = data.length;
    var W = 520, H = 230, L = 36, R = 8, T = 14, B = 28, cw = W - L - R, ch = H - T - B;
    var max = Math.ceil(Math.max.apply(null, data.concat([p.goal])) / 40) * 40, y = function (v) { return T + ch - (v / max) * ch; };
    var band = cw / n, bw = Math.min(28, band * 0.5);
    var ticks = []; for (var t = 0; t <= max; t += max / 4) ticks.push(t);
    var weekEnd = new Date(); weekEnd.setDate(weekEnd.getDate() - ((weekEnd.getDay() + 6) % 7) - 1);
    var labels = data.map(function (_, i) { var d = new Date(weekEnd); d.setDate(d.getDate() - (n - 1 - i) * 7); return d.getDate() + " " + MONTHS[d.getMonth()]; });
    var svg = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Weekly practice minutes for ' + KIDS[progChild].name + ": " + data.map(function (v, i) { return labels[i] + " " + v + " minutes"; }).join(", ") + '. Weekly goal ' + p.goal + ' minutes.">';
    svg += '<g class="grid">' + ticks.map(function (t) { return '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(t) + '" y2="' + y(t) + '"/>'; }).join("") + "</g>";
    svg += '<g class="axis">' + ticks.map(function (t) { return '<text x="' + (L - 8) + '" y="' + (y(t) + 4) + '" text-anchor="end">' + t + "</text>"; }).join("");
    svg += labels.map(function (l, i) { return '<text x="' + (L + band * i + band / 2) + '" y="' + (H - 8) + '" text-anchor="middle">' + l + "</text>"; }).join("") + "</g>";
    svg += '<g class="bars">' + data.map(function (v, i) {
      var x = L + band * i + (band - bw) / 2, top = y(v), h = T + ch - top, r = Math.min(4, h);
      var d = "M" + x + "," + (T + ch) + "V" + (top + r) + "Q" + x + "," + top + " " + (x + r) + "," + top + "H" + (x + bw - r) + "Q" + (x + bw) + "," + top + " " + (x + bw) + "," + (top + r) + "V" + (T + ch) + "Z";
      return '<g><path d="' + d + '" fill="' + (v >= p.goal ? "var(--teal)" : "var(--brand)") + '"/><rect class="hit" x="' + (L + band * i) + '" y="' + T + '" width="' + band + '" height="' + ch + '" data-i="' + i + '"/></g>';
    }).join("") + "</g>";
    svg += '<line class="goal" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(p.goal) + '" y2="' + y(p.goal) + '"/><text class="goal-lbl" x="' + (W - R) + '" y="' + (y(p.goal) - 6) + '" text-anchor="end">Goal ' + p.goal + " min</text></svg>";
    var box = $("#pr-chart"); box.setAttribute("dir", "ltr");
    box.innerHTML = svg + '<div class="chart-tip" id="chart-tip"></div>';
    var tip = $("#chart-tip", box);
    $$(".hit", box).forEach(function (h) {
      h.addEventListener("mouseenter", function () {
        var i = +h.getAttribute("data-i"), v = data[i], svgEl = $("svg", box), sc = svgEl.getBoundingClientRect().width / W;
        tip.innerHTML = "Week of " + labels[i] + " · <b>" + v + " min</b>" + (v >= p.goal ? " ✓" : "");
        tip.style.left = (L + band * i + band / 2) * sc + "px"; tip.style.top = y(v) * sc + "px";
        tip.classList.add("show");
      });
      h.addEventListener("mouseleave", function () { tip.classList.remove("show"); });
    });
  }

  /* ---------- Schedule ---------- */
  var weekOffset = 0, schedChild = "all";
  function mondayOf(d) { var m = new Date(d.getFullYear(), d.getMonth(), d.getDate()); m.setDate(m.getDate() - ((m.getDay() + 6) % 7)); return m; }
  function renderWeek() {
    var mon = mondayOf(new Date()); mon.setDate(mon.getDate() + weekOffset * 7);
    var sun = new Date(mon); sun.setDate(sun.getDate() + 6);
    $("#wk-label").textContent = mon.getDate() + " " + MONTHS[mon.getMonth()] + " – " + sun.getDate() + " " + MONTHS[sun.getMonth()] + " " + sun.getFullYear();
    var all = sessionsBetween(mon, 7).filter(function (s) { return schedChild === "all" || s.child === schedChild || s.child === "all"; });
    CLASS_CACHE = all;
    var todayIso = isoOf(new Date()), html = "";
    for (var i = 0; i < 7; i++) {
      var d = new Date(mon); d.setDate(d.getDate() + i);
      var iso = isoOf(d), items = all.filter(function (s) { return s.date === iso; });
      html += '<div class="day' + (iso === todayIso ? " today" : "") + '"><div class="day-h">' + DAYS[d.getDay()] + "<span>" + d.getDate() + " " + MONTHS[d.getMonth()] + "</span></div>" +
        (items.length ? items.map(function (s) { return '<button class="cls" type="button" style="--c:' + s.color + '" data-cls="' + all.indexOf(s) + '"><b>' + fmtTime(s.start) + "</b>" + esc(childLabel(s.child)) + "<span>" + esc(s.prog) + "</span></button>"; }).join("") : '<span class="none">No classes</span>') + "</div>";
    }
    $("#week").innerHTML = html;
    $$("[data-cls]").forEach(function (b) { b.addEventListener("click", function () { openClass(CLASS_CACHE[+b.getAttribute("data-cls")]); }); });
  }
  $$("#sc-child button").forEach(function (b) { b.addEventListener("click", function () { schedChild = b.getAttribute("data-child"); setSeg("#sc-child", schedChild); renderWeek(); }); });
  $("#wk-prev").addEventListener("click", function () { weekOffset--; renderWeek(); });
  $("#wk-next").addEventListener("click", function () { weekOffset++; renderWeek(); });
  $("#wk-today").addEventListener("click", function () { weekOffset = 0; renderWeek(); });

  function fillReschedule(pre) {
    var upcoming = sessionsBetween(new Date(), 14).filter(function (s) { return s.child !== "all" && s.color !== "#e08a00" && new Date(s.date + "T" + s.start) > new Date(); });
    $("#rs-class").innerHTML = '<option value="">Select a class</option>' + upcoming.map(function (s) {
      var d = new Date(s.date + "T00:00:00"), label = KIDS[s.child].name + " · " + s.prog + " · " + DAYS[d.getDay()] + " " + d.getDate() + " " + MONTHS[d.getMonth()] + ", " + fmtTime(s.start);
      var sel = pre && pre.date === s.date && pre.start === s.start && pre.child === s.child ? " selected" : "";
      return "<option" + sel + ">" + esc(label) + "</option>";
    }).join("");
  }
  document.addEventListener("click", function (e) { if (e.target.closest('[data-open="reschedule-modal"]')) fillReschedule(null); }, true);
  var rf = $("#rs-form");
  rf.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!SB.validate(rf)) return;
    SB.closeModal($("#reschedule-modal"));
    SB.toast("Reschedule request sent. You’ll get a confirmation within 4 working hours.");
    rf.reset();
  });

  $("#cal-export").addEventListener("click", function () {
    var mon = mondayOf(new Date()), lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//SutraBead Academy//Parent Timetable//EN"];
    var BYDAY = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
    RECURRING.forEach(function (r, i) {
      var d = new Date(mon); d.setDate(d.getDate() + ((r.dow + 6) % 7));
      var ds = isoOf(d).replace(/-/g, "");
      lines.push("BEGIN:VEVENT", "UID:sb-" + i + "-" + ds + "@sutrabead-timetable", "DTSTAMP:" + ds + "T000000", "DTSTART:" + ds + "T" + r.start.replace(":", "") + "00", "DTEND:" + ds + "T" + r.end.replace(":", "") + "00", "RRULE:FREQ=WEEKLY;BYDAY=" + BYDAY[r.dow], "SUMMARY:" + KIDS[r.child].name + " · " + r.prog, "LOCATION:" + r.where, "DESCRIPTION:Trainer: " + r.trainer, "END:VEVENT");
    });
    lines.push("END:VCALENDAR");
    download("sutrabead-timetable.ics", lines.join("\r\n"), "text/calendar");
    SB.toast("Timetable downloaded — open it to add classes to your calendar.");
  });

  /* ---------- Fees ---------- */
  function renderDues() {
    var box = $("#dues"), today = isoOf(new Date());
    if (!state.dues.length) {
      box.innerHTML = '<div class="empty" style="padding:28px 0"><div class="ok" style="width:56px;height:56px;border-radius:50%;display:grid;place-items:center;margin:0 auto 12px;background:var(--teal-soft);color:var(--teal)"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg></div><strong style="color:var(--ink)">You’re all paid up</strong><br>No pending dues right now.</div>';
    } else {
      box.innerHTML = state.dues.map(function (d) {
        var days = Math.round((new Date(d.due) - new Date(today)) / 86400000);
        var chip = days < 0 ? '<span class="chip danger">Overdue</span>' : days <= 7 ? '<span class="chip warn">Due ' + fmtDate(d.due).slice(0, -5) + "</span>" : '<span class="chip info">Due ' + fmtDate(d.due).slice(0, -5) + "</span>";
        return '<label class="due"><input type="checkbox" value="' + d.id + '" checked><div class="li-main"><strong>' + esc(d.child) + " · " + esc(d.title) + "</strong><span>" + esc(d.period) + '</span></div><div class="amt">' + inr(d.amount) + chip + "</div></label>";
      }).join("");
    }
    $$("#dues input").forEach(function (c) { c.addEventListener("change", updateSel); });
    var total = state.dues.reduce(function (s, d) { return s + d.amount; }, 0);
    $("#fe-out").textContent = inr(total);
    $("#fe-out-sub").textContent = state.dues.length ? state.dues.length + (state.dues.length === 1 ? " due" : " dues") : "Nothing pending";
    $("#kpi-due").textContent = inr(total);
    var next = state.dues.slice().sort(function (a, b) { return a.due.localeCompare(b.due); })[0];
    $("#kpi-due-sub").textContent = next ? "Next due " + fmtDate(next.due).slice(0, -5) : "All paid up";
    var diyaDue = state.dues.some(function (d) { return d.id === "d1"; }), chip = $("#diya-fee-chip");
    chip.className = "chip " + (diyaDue ? "warn" : "ok"); chip.textContent = diyaDue ? "Due 10 Nov" : "Paid";
    $("#pay-bar").hidden = !state.dues.length;
    $("#due-all").closest("label").hidden = !state.dues.length;
    $("#due-all").checked = true;
    var paid = state.history.filter(function (h) { return h.status === "Paid" && h.date.slice(0, 4) === String(new Date().getFullYear()); }).reduce(function (s, h) { return s + h.amount; }, 0);
    $("#fe-paid").textContent = inr(paid);
    updateSel();
  }
  function selectedDues() { return $$("#dues input:checked").map(function (c) { return state.dues.filter(function (d) { return d.id === c.value; })[0]; }).filter(Boolean); }
  function updateSel() {
    var sel = selectedDues(), sum = sel.reduce(function (s, d) { return s + d.amount; }, 0);
    $("#sel-total").textContent = inr(sum);
    $("#pay-btn").disabled = !sel.length;
    $("#due-all").checked = sel.length === state.dues.length;
  }
  $("#due-all").addEventListener("change", function (e) { $$("#dues input").forEach(function (c) { c.checked = e.target.checked; }); updateSel(); });
  $("#auto-toggle").addEventListener("click", function () {
    state.autopay = !state.autopay; save(); renderAutopay();
    SB.toast(state.autopay ? "Auto-pay is on. Dues will be collected on the due date." : "Auto-pay turned off. We’ll keep sending reminders.");
  });
  function renderAutopay() {
    $("#auto-toggle").textContent = state.autopay ? "Turn off auto-pay" : "Turn on auto-pay";
    $("#auto-status").textContent = state.autopay ? "Auto-pay is on · collected on each due date" : "Auto-pay is off · reminders 5 days before due date";
  }

  // Payment modal
  var paying = [];
  function pm() { return (document.querySelector("[name=pm]:checked") || {}).value; }
  function setPm() {
    var m = pm();
    $$("[data-pm]").forEach(function (g) {
      var on = g.getAttribute("data-pm") === m; g.hidden = !on;
      $$("input, select", g).forEach(function (inp) { if (!on) { inp.removeAttribute("data-rule"); var f = inp.closest(".field"); if (f) f.classList.remove("invalid"); } });
    });
    if (m === "upi") $("#pay-upi").setAttribute("data-rule", "required upi");
    if (m === "card") { $("#pay-card").setAttribute("data-rule", "required card"); $("#pay-exp").setAttribute("data-rule", "required expiry"); $("#pay-cvv").setAttribute("data-rule", "required cvv"); $("#pay-name").setAttribute("data-rule", "required"); }
    if (m === "nb") $("#pay-bank").setAttribute("data-rule", "required");
  }
  $$("[name=pm]").forEach(function (r) { r.addEventListener("change", setPm); });
  $("#pay-card").addEventListener("input", function (e) { var v = e.target.value.replace(/\D/g, "").slice(0, 16); e.target.value = v.replace(/(.{4})/g, "$1 ").trim(); });
  $("#pay-exp").addEventListener("input", function (e) { var v = e.target.value.replace(/\D/g, "").slice(0, 4); e.target.value = v.length > 2 ? v.slice(0, 2) + "/" + v.slice(2) : v; });
  $("#pay-cvv").addEventListener("input", function (e) { e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4); });
  $("#pay-btn").addEventListener("click", function () {
    paying = selectedDues(); if (!paying.length) return;
    var sum = paying.reduce(function (s, d) { return s + d.amount; }, 0);
    $("#pay-summary").innerHTML = paying.map(function (d) { return "<div><span>" + esc(d.child) + " · " + esc(d.title) + "</span><span>" + inr(d.amount) + "</span></div>"; }).join("") + '<div class="tot"><span>Total</span><span>' + inr(sum) + "</span></div>";
    $("#pay-submit").textContent = "Pay " + inr(sum);
    $("#pay-step-1").hidden = false; $("#pay-step-2").hidden = true; $("#pay-step-3").classList.remove("show");
    setPm();
    SB.openModal("pay-modal");
  });
  var pf = $("#pay-form"), lastReceipts = [];
  pf.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!SB.validate(pf)) return;
    var m = pm(), label = m === "upi" ? "UPI" : m === "card" ? "Card" : "Net banking";
    $("#pay-proc-msg").textContent = m === "upi" ? "Please approve the request in your UPI app. Don’t close this window." : m === "card" ? "Verifying with your bank — you may receive an OTP." : "Connecting to " + ($("#pay-bank").value || "your bank") + "…";
    $("#pay-step-1").hidden = true; $("#pay-step-2").hidden = false;
    setTimeout(function () {
      var today = isoOf(new Date()), seq = 1000 + Math.floor(Math.random() * 8000), txn = "TXN" + Date.now().toString().slice(-10);
      lastReceipts = paying.map(function (d, i) {
        var r = { no: "SB-R-" + today.slice(2, 4) + "-" + (seq + i), date: today, child: d.child, desc: d.title + " (" + d.period + ")", method: label, amount: d.amount, status: "Paid", txn: txn };
        state.history.unshift(r); return r;
      });
      var ids = paying.map(function (d) { return d.id; });
      state.dues = state.dues.filter(function (d) { return ids.indexOf(d.id) < 0; });
      save(); renderDues(); renderHistory();
      var sum = lastReceipts.reduce(function (s, r) { return s + r.amount; }, 0);
      $("#pay-done-msg").textContent = inr(sum) + " paid via " + label + ". Transaction ID " + txn + ". A receipt has been emailed to " + state.profile.email + ".";
      $("#pay-step-2").hidden = true; $("#pay-step-3").classList.add("show");
      SB.toast("Payment of " + inr(sum) + " received. Thank you!");
      pf.reset(); $("#pay-upi").value = "meera.iyer@okhdfcbank"; $("#pay-name").value = (state.profile.first + " " + state.profile.last).toUpperCase();
    }, 2000);
  });
  $("#pay-view-receipt").addEventListener("click", function () { SB.closeModal($("#pay-modal")); if (lastReceipts[0]) openReceipt(lastReceipts[0]); });

  /* ---------- Payment history ---------- */
  var filtered = [];
  function renderHistory() {
    var q = $("#ph-q").value.trim().toLowerCase(), c = $("#ph-child").value, y = $("#ph-year").value, s = $("#ph-status").value;
    var yrs = {}; state.history.forEach(function (h) { yrs[h.date.slice(0, 4)] = 1; });
    var ySel = $("#ph-year"), cur = ySel.value;
    ySel.innerHTML = '<option value="all">All years</option>' + Object.keys(yrs).sort().reverse().map(function (yy) { return "<option" + (yy === cur ? " selected" : "") + ">" + yy + "</option>"; }).join("");
    filtered = state.history.filter(function (h) {
      return (c === "all" || h.child === c) && (y === "all" || h.date.slice(0, 4) === y) && (s === "all" || h.status === s) && (!q || (h.no + " " + h.desc).toLowerCase().indexOf(q) > -1);
    });
    $("#ph-body").innerHTML = filtered.length ? filtered.map(function (h, i) {
      return "<tr><td><strong>" + h.no + "</strong></td><td>" + fmtDate(h.date) + "</td><td>" + esc(h.child) + "</td><td>" + esc(h.desc) + "</td><td>" + h.method + '</td><td class="num">' + inr(h.amount) + '</td><td><span class="chip ' + (h.status === "Paid" ? "ok" : "neutral") + '">' + h.status + '</span></td><td><button class="btn btn-ghost btn-sm" type="button" data-rc="' + i + '">Receipt</button></td></tr>';
    }).join("") : '<tr><td colspan="8" class="empty">No payments match these filters.</td></tr>';
    $$("[data-rc]").forEach(function (b) { b.addEventListener("click", function () { openReceipt(filtered[+b.getAttribute("data-rc")]); }); });
    var sum = filtered.filter(function (h) { return h.status === "Paid"; }).reduce(function (t, h) { return t + h.amount; }, 0);
    $("#ph-count").textContent = filtered.length + (filtered.length === 1 ? " payment" : " payments");
    $("#ph-sum").textContent = "Total paid: " + inr(sum);
  }
  ["#ph-q", "#ph-child", "#ph-year", "#ph-status"].forEach(function (s) { $(s).addEventListener("input", renderHistory); $(s).addEventListener("change", renderHistory); });

  function openReceipt(h) {
    var full = state.profile.first + " " + state.profile.last;
    $("#rc-sub").textContent = h.no + " · " + fmtDate(h.date);
    $("#receipt").innerHTML = '<div class="receipt-head"><div class="brand"><span class="brand-text"><span class="brand-name">SutraBead Academy</span><span class="brand-tag">Abacus &amp; Vedic Maths Academy</span></span></div><span class="chip ' + (h.status === "Paid" ? "ok" : "neutral") + '">' + h.status + "</span></div>" +
      "<dl><div><dt>Receipt no.</dt><dd>" + h.no + "</dd></div><div><dt>Date</dt><dd>" + fmtDate(h.date) + "</dd></div><div><dt>Billed to</dt><dd>" + esc(full) + "</dd></div><div><dt>Learner</dt><dd>" + esc(h.child) + " Iyer</dd></div><div style=\"grid-column:1/-1\"><dt>Description</dt><dd>" + esc(h.desc) + "</dd></div><div><dt>Payment method</dt><dd>" + h.method + "</dd></div><div><dt>Transaction ID</dt><dd>" + (h.txn || "TXN" + h.no.replace(/\D/g, "") + "47") + "</dd></div></dl>" +
      '<div class="r-total"><span>' + (h.status === "Refunded" ? "Amount refunded" : "Amount paid") + "</span><b>" + inr(h.amount) + "</b></div>";
    SB.openModal("receipt-modal");
  }
  $("#rc-print").addEventListener("click", function () {
    document.body.classList.add("printing-receipt");
    window.print();
    setTimeout(function () { document.body.classList.remove("printing-receipt"); }, 500);
  });
  function download(name, text, type) {
    var blob = new Blob([text], { type: type }), a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 200);
  }
  $("#export-csv").addEventListener("click", function () {
    var rows = [["Receipt", "Date", "Child", "Description", "Method", "Amount (INR)", "Status"]].concat(filtered.map(function (h) { return [h.no, h.date, h.child, h.desc, h.method, h.amount, h.status]; }));
    download("sutrabead-statement.csv", rows.map(function (r) { return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(","); }).join("\n"), "text/csv");
    SB.toast("Statement exported (" + filtered.length + " payments).");
  });

  /* ---------- Profile ---------- */
  var prf = $("#profile-form");
  $("#pf-first").value = state.profile.first; $("#pf-last").value = state.profile.last; $("#pf-email").value = state.profile.email;
  prf.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!SB.validate(prf)) return;
    state.profile = { first: $("#pf-first").value.trim(), last: $("#pf-last").value.trim(), email: $("#pf-email").value.trim() };
    save(); renderIdentity();
    SB.toast("Your profile has been updated.");
  });
  prf.addEventListener("reset", function () { setTimeout(function () { $("#pf-first").value = state.profile.first; $("#pf-last").value = state.profile.last; $("#pf-email").value = state.profile.email; SB.toast("Changes discarded."); }, 0); });
  $$("#view-profile .switch input").forEach(function (s) {
    s.addEventListener("change", function () { SB.toast(s.getAttribute("aria-label") + (s.checked ? " turned on." : " turned off.")); });
  });
  $("#pf-lang").addEventListener("change", function (e) { SB.toast("Progress reports will be sent in " + e.target.value.split(" (")[0] + "."); });
  $("#pw-new").addEventListener("input", function (e) {
    var v = e.target.value, sc = 0;
    if (v.length >= 8) sc++; if (/\d/.test(v)) sc++; if (/[^\w\s]/.test(v)) sc++; if (/[A-Z]/.test(v) && /[a-z]/.test(v)) sc++;
    var m = $("#pw-meter"), cols = ["var(--coral)", "var(--coral)", "var(--saffron)", "var(--teal)", "var(--teal)"], lbl = ["Too weak", "Weak", "Fair", "Strong", "Very strong"];
    m.style.width = (v ? Math.max(15, sc * 25) : 0) + "%"; m.style.background = cols[sc];
    $("#pw-hint").textContent = v ? "Strength: " + lbl[sc] : "Use 8+ characters with a number and symbol.";
  });
  var pwf = $("#pw-form");
  pwf.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!SB.validate(pwf)) return;
    pwf.reset(); $("#pw-meter").style.width = "0"; $("#pw-hint").textContent = "Use 8+ characters with a number and symbol.";
    SB.toast("Password updated. Use it the next time you sign in.");
  });

  /* ---------- Sign out ---------- */
  // Signs out straight to the Login Portal — no confirmation popup.
  document.addEventListener("click", function (e) {
    if (!e.target.closest("[data-signout]")) return;
    e.preventDefault();
    try { localStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_KEY); } catch (err) {}
    window.location.href = "login.html";
  });

  /* ---------- Init ---------- */
  renderIdentity(); renderOverview(); renderExtraKids(); renderEnrolments(); renderDues(); renderHistory(); renderWeek(); renderAutopay(); fillChildSelect();
  show(location.hash.slice(1) || "overview");
})();
