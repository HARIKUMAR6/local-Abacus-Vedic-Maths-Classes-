/* SutraBead — Contact page: enquiry form validation, contact-preference shortcuts, FAQ topic filter */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var form = $("#ct-form");
  if (form) {
    var summary = $("#ct-errors"), msg = $("#ct-msg"), count = $("#ct-msg-count");
    var LABELS = { name: "Parent name", phone: "Phone number", email: "Email address", age: "Child’s age", program: "Interested program", mode: "Preferred learning mode", message: "Message", consent: "Consent" };

    // Each rule returns an error message, or "" when valid.
    var RULES = {
      name: function (v) { v = v.trim(); if (!v) return "Please enter the parent’s name."; if (v.length < 2) return "Name must be at least 2 characters."; if (!/^[\p{L}][\p{L} .'-]*$/u.test(v)) return "Use letters, spaces, dots, hyphens or apostrophes only."; return ""; },
      phone: function (v) { var d = v.replace(/[\s()-]/g, ""); if (!d) return "Please enter a phone number."; if (!/^\+?\d+$/.test(d)) return "Use digits only (you may start with +)."; var n = d.replace(/^\+/, ""); if (n.length < 10 || n.length > 13) return "Enter a valid phone number with 10–13 digits."; return ""; },
      email: function (v) { v = v.trim(); if (!v) return "Please enter an email address."; if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Enter a valid email, e.g. name@example.com."; return ""; },
      age: function (v) { var n = +v; if (!v) return "Please select your child’s age."; if (n < 4 || n > 12) return "Our programs are for children aged 4–12."; return ""; },
      program: function (v) { return v ? "" : "Please choose a program."; },
      mode: function (v) { return v ? "" : "Please choose a learning mode."; },
      message: function (v) { v = v.trim(); if (!v) return "Please write a short message."; if (v.length < 10) return "Please add a little more detail (at least 10 characters)."; return ""; },
      consent: function (v) { return v ? "" : "Please confirm we may contact you about this enquiry."; }
    };

    function value(name) {
      if (name === "mode") { var r = form.querySelector("[name=mode]:checked"); return r ? r.value : ""; }
      if (name === "consent") return $("#ct-consent").checked;
      return form.elements[name].value;
    }
    function fieldEl(name) { return name === "mode" ? $(".ct-fieldset", form) : name === "consent" ? $("#ct-consent").closest(".field") : form.elements[name].closest(".field"); }
    function inputEl(name) { return name === "mode" ? form.querySelector("[name=mode]") : name === "consent" ? $("#ct-consent") : form.elements[name]; }
    function check(name) {
      var err = RULES[name](value(name)), f = fieldEl(name), el = $("#ct-" + (name === "message" ? "msg" : name) + "-err");
      f.classList.toggle("invalid", !!err);
      if (el) el.textContent = err;
      var inputs = name === "mode" ? $$("[name=mode]", form) : [inputEl(name)];
      inputs.forEach(function (i) { i.setAttribute("aria-invalid", err ? "true" : "false"); });
      return err;
    }

    // Validate a field once the user leaves it, then live while they fix it.
    Object.keys(RULES).forEach(function (name) {
      var els = name === "mode" ? $$("[name=mode]", form) : [inputEl(name)];
      els.forEach(function (el) {
        el.addEventListener("blur", function () { if (el.value || el.type === "checkbox") el.dataset.touched = "1"; if (el.dataset.touched) check(name); });
        el.addEventListener(el.tagName === "SELECT" || el.type === "radio" || el.type === "checkbox" ? "change" : "input", function () { if (fieldEl(name).classList.contains("invalid")) check(name); });
      });
    });

    msg.addEventListener("input", function () { count.textContent = msg.value.length + " / 600"; });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var errors = Object.keys(RULES).map(function (n) { return [n, check(n)]; }).filter(function (x) { return x[1]; });
      if (errors.length) {
        summary.hidden = false;
        summary.innerHTML = "<strong>Please fix " + errors.length + (errors.length === 1 ? " field" : " fields") + ":</strong><ul>" + errors.map(function (x) {
          var id = x[0] === "mode" ? form.querySelector("[name=mode]").id || "" : inputEl(x[0]).id;
          return '<li><a href="#' + (id || "ct-form") + '" data-focus="' + x[0] + '">' + LABELS[x[0]] + " — " + x[1] + "</a></li>";
        }).join("") + "</ul>";
        summary.focus();
        return;
      }
      summary.hidden = true;
      var btn = form.querySelector("[type=submit]");
      btn.disabled = true; btn.innerHTML = '<span class="spinner" aria-hidden="true"></span> Sending…';
      setTimeout(function () {
        btn.disabled = false; btn.textContent = "Send enquiry";
        var pref = (form.querySelector("[name=pref]:checked") || {}).value || "Phone call";
        $("#ct-success-msg").textContent = "Thanks, " + value("name").trim().split(" ")[0] + ". We’ve noted your interest in " + value("program") + " (" + value("mode").toLowerCase() + ") for your " + value("age") + "-year-old. We’ll reply by " + pref.toLowerCase() + ".";
        form.hidden = true;
        var ok = $("#ct-success"); ok.classList.add("show"); ok.focus();
        if (window.SB) SB.toast("Enquiry sent successfully.");
      }, 900);
    });

    summary.addEventListener("click", function (e) {
      var a = e.target.closest("[data-focus]"); if (!a) return;
      e.preventDefault(); var el = inputEl(a.getAttribute("data-focus")); el.focus();
    });

    $("#ct-again").addEventListener("click", function () {
      form.reset(); form.hidden = false; count.textContent = "0 / 600";
      $$(".field.invalid", form).forEach(function (f) { f.classList.remove("invalid"); });
      $$("[data-touched]", form).forEach(function (el) { delete el.dataset.touched; });
      $("#ct-success").classList.remove("show");
      form.elements.name.focus();
    });

    // "Ways to reach us" shortcuts pre-select how we reply.
    $$("[data-contact-pref]").forEach(function (a) {
      a.addEventListener("click", function () {
        var p = a.getAttribute("data-contact-pref"), val = p === "email" ? "Email" : "Phone call";
        var r = form.querySelector('[name=pref][value="' + val + '"]'); if (r) r.checked = true;
        if (p === "visit" && !msg.value.trim()) { msg.value = "We would like to visit the academy. "; count.textContent = msg.value.length + " / 600"; }
        form.hidden = false; $("#ct-success").classList.remove("show");
        setTimeout(function () { form.elements.name.focus({ preventScroll: true }); }, 400);
      });
    });
  }

  // FAQ topic filter
  var filters = $$("[data-faq-filter]");
  filters.forEach(function (b) {
    b.addEventListener("click", function () {
      var t = b.getAttribute("data-faq-filter"), shown = 0;
      filters.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      $$("#faq-list .acc-item").forEach(function (it) {
        var on = t === "all" || it.getAttribute("data-topic").split(" ").indexOf(t) > -1;
        it.hidden = !on; if (on) shown++;
      });
      $("#faq-empty").hidden = shown > 0;
    });
  });
})();
