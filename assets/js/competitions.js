/* SutraBead — Competitions page: countdown, event pre-select, past filter, registration form, gallery lightbox */
(function () {
  "use strict";
  var root = document.documentElement;
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };

  document.addEventListener("DOMContentLoaded", function () {
    /* ---------- Countdown ---------- */
    document.querySelectorAll("[data-countdown]").forEach(function (box) {
      var end = new Date(box.getAttribute("data-countdown")).getTime();
      var el = function (k) { return box.querySelector('[data-cd="' + k + '"]'); };
      var tick = function () {
        var diff = Math.max(0, end - Date.now());
        var s = Math.floor(diff / 1000);
        el("d").textContent = pad(Math.floor(s / 86400));
        el("h").textContent = pad(Math.floor((s % 86400) / 3600));
        el("m").textContent = pad(Math.floor((s % 3600) / 60));
        el("s").textContent = pad(s % 60);
        if (!diff) { clearInterval(t); box.classList.add("is-live"); }
      };
      var t = setInterval(tick, 1000); tick();
    });

    /* ---------- Registration form ---------- */
    var form = document.getElementById("comp-form");
    var success = document.getElementById("comp-success");
    var compSel = document.getElementById("cr-comp");
    var dob = document.getElementById("cr-dob");
    var catOut = document.getElementById("cr-cat");
    var centreField = document.querySelector("[data-centre-field]");
    var centreSel = document.getElementById("cr-centre");

    // "Register" buttons pre-select the event
    document.querySelectorAll("[data-comp]").forEach(function (a) {
      a.addEventListener("click", function () {
        if (!compSel) return;
        compSel.value = a.getAttribute("data-comp");
        compSel.closest(".field").classList.remove("invalid");
        updateCategory();
        if (form && form.hidden) resetForm();
        setTimeout(function () { compSel.focus({ preventScroll: true }); }, 500);
      });
    });

    function ageOn(dobStr, dateStr) {
      var b = new Date(dobStr + "T00:00:00"), d = new Date(dateStr + "T00:00:00");
      if (isNaN(b) || isNaN(d)) return null;
      var a = d.getFullYear() - b.getFullYear();
      var m = d.getMonth() - b.getMonth();
      if (m < 0 || (m === 0 && d.getDate() < b.getDate())) a--;
      return a;
    }
    function eventDate() {
      var o = compSel && compSel.selectedOptions[0];
      return (o && o.getAttribute("data-date")) || "2026-12-13";
    }
    function category(age) {
      if (age === null || age < 4 || age > 12) return null;
      return age < 6 ? "U-6" : age < 8 ? "U-8" : age < 10 ? "U-10" : "U-12";
    }
    function updateCategory() {
      if (!dob || !catOut) return;
      var c = dob.value ? category(ageOn(dob.value, eventDate())) : null;
      catOut.textContent = c ? c + " · age " + ageOn(dob.value, eventDate()) + " on event day" : "Set from date of birth";
      catOut.classList.toggle("is-set", !!c);
    }
    function syncMode() {
      if (!form) return;
      var online = form.querySelector('input[name="mode"]:checked').value === "online";
      centreField.hidden = online;
      centreSel.disabled = online;
    }

    function setInvalid(input, bad, msg) {
      var f = input.closest(".field");
      if (f) {
        f.classList.toggle("invalid", bad);
        if (msg) { var e = f.querySelector(".err"); if (e) e.textContent = msg; }
      }
      input.setAttribute("aria-invalid", bad ? "true" : "false");
      return bad;
    }

    function check() {
      var first = null;
      var flag = function (input, bad, msg) { if (setInvalid(input, bad, msg) && !first) first = input; };
      var v = function (id) { return document.getElementById(id).value.trim(); };

      flag(compSel, !compSel.value);
      flag(document.getElementById("cr-name"), !/^[A-Za-zÀ-ɏ .'-]{3,60}$/.test(v("cr-name")) || !/[A-Za-z]{2,}/.test(v("cr-name")));

      var dv = dob.value, age = dv ? ageOn(dv, eventDate()) : null, msg = "Enter a valid date of birth.", badDob = !dv || age === null;
      if (!badDob && (age < 4 || age > 12)) { badDob = true; msg = "Participants must be 4–12 years old on the event day (age " + age + ")."; }
      flag(dob, badDob, msg);

      flag(document.getElementById("cr-level"), !v("cr-level"));
      if (!centreSel.disabled) flag(centreSel, !centreSel.value);
      flag(document.getElementById("cr-parent"), v("cr-parent").length < 2);
      var digits = v("cr-phone").replace(/[\s-]/g, "").replace(/^(\+91|0)/, "");
      flag(document.getElementById("cr-phone"), !/^[6-9]\d{9}$/.test(digits));
      flag(document.getElementById("cr-email"), !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v("cr-email")));
      var consent = document.getElementById("cr-consent");
      flag(consent, !consent.checked);

      if (first) first.focus();
      return !first;
    }

    function resetForm() {
      form.reset();
      form.hidden = false;
      success.classList.remove("show");
      form.querySelectorAll(".field.invalid").forEach(function (f) { f.classList.remove("invalid"); });
      syncMode(); updateCategory();
    }

    if (form) {
      syncMode();
      form.addEventListener("change", function (e) {
        if (e.target.name === "mode") syncMode();
        if (e.target === dob || e.target === compSel) updateCategory();
        var f = e.target.closest(".field.invalid"); if (f) f.classList.remove("invalid");
      });
      dob.addEventListener("input", updateCategory);
      form.addEventListener("input", function (e) { var f = e.target.closest(".field.invalid"); if (f) f.classList.remove("invalid"); });

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!check()) {
          if (window.SB) SB.toast("Please check the highlighted fields.", "error");
          return;
        }
        var btn = form.querySelector("[type=submit]");
        btn.disabled = true; btn.textContent = "Submitting…";
        setTimeout(function () {
          btn.disabled = false; btn.textContent = "Submit registration";
          var age = ageOn(dob.value, eventDate());
          var mode = form.querySelector('input[name="mode"]:checked').value;
          var ref = "SB-" + compSel.value.split("-")[0].toUpperCase().slice(0, 5) + "-" + Math.floor(1000 + Math.random() * 9000);
          success.querySelector("[data-ref]").textContent = ref;
          var rows = [
            ["Child", document.getElementById("cr-name").value.trim()],
            ["Competition", compSel.selectedOptions[0].textContent],
            ["Category", category(age) + " · age " + age],
            ["Takes part", mode === "online" ? "Online" : "At the academy centre"],
            ["Confirmation to", document.getElementById("cr-email").value.trim()]
          ];
          var dl = success.querySelector("[data-summary]");
          dl.innerHTML = "";
          rows.forEach(function (r) {
            var d = document.createElement("div"), dt = document.createElement("dt"), dd = document.createElement("dd");
            dt.textContent = r[0]; dd.textContent = r[1]; d.appendChild(dt); d.appendChild(dd); dl.appendChild(d);
          });
          form.hidden = true;
          success.classList.add("show");
          success.focus();
        }, 900);
      });
      success.querySelector("[data-reg-again]").addEventListener("click", function () { resetForm(); compSel.focus(); });
    }

    /* ---------- Past competitions filter ---------- */
    var filterBtns = document.querySelectorAll("[data-year-filter]");
    filterBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var y = b.getAttribute("data-year-filter"), shown = 0;
        filterBtns.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        document.querySelectorAll(".cp-event").forEach(function (ev) {
          var show = y === "all" || ev.getAttribute("data-season") === y;
          ev.hidden = !show; if (show) { shown++; ev.classList.add("in"); }
        });
        var empty = document.querySelector("[data-past-empty]"); if (empty) empty.hidden = shown > 0;
      });
    });

    /* ---------- Gallery lightbox ---------- */
    var lb = document.getElementById("cp-lightbox");
    var items = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
    if (lb && items.length) {
      var img = lb.querySelector("[data-lb-img]"), cap = lb.querySelector("[data-lb-cap]"), cnt = lb.querySelector("[data-lb-count]");
      var idx = 0, opener = null;
      // Fade while the large version downloads, so the old photo never sits under a new caption
      img.addEventListener("load", function () { img.classList.remove("is-loading"); });
      img.addEventListener("error", function () { img.classList.remove("is-loading"); });
      var show = function (i) {
        idx = (i + items.length) % items.length;
        var src = items[idx].querySelector("img");
        var next = src.src.replace(/w=\d+/, "w=1600");
        if (img.src !== next) { img.classList.add("is-loading"); img.src = next; }
        img.alt = src.alt;
        cap.textContent = items[idx].querySelector("span").textContent;
        cnt.textContent = (idx + 1) + " / " + items.length;
      };
      var open = function (i) {
        opener = items[i]; show(i); lb.hidden = false;
        document.body.style.overflow = "hidden";
        lb.querySelector(".cp-lb-close").focus();
      };
      var close = function () {
        lb.hidden = true; document.body.style.overflow = "";
        if (opener) opener.focus();
      };
      items.forEach(function (b, i) { b.addEventListener("click", function () { open(i); }); });
      lb.addEventListener("click", function (e) {
        if (e.target.closest("[data-lb-close]")) close();
        if (e.target.closest("[data-lb-prev]")) show(idx - 1);
        if (e.target.closest("[data-lb-next]")) show(idx + 1);
      });
      document.addEventListener("keydown", function (e) {
        if (lb.hidden) return;
        var rtl = root.getAttribute("dir") === "rtl";
        if (e.key === "Escape") close();
        else if (e.key === "ArrowRight") show(idx + (rtl ? -1 : 1));
        else if (e.key === "ArrowLeft") show(idx + (rtl ? 1 : -1));
        else if (e.key === "Tab") {
          var f = Array.prototype.slice.call(lb.querySelectorAll("button")), a = f.indexOf(document.activeElement);
          e.preventDefault();
          f[(a + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
        }
      });
    }
  });
})();
