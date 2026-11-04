/* SutraBead — Parent sign-in & account registration */
(function () {
  "use strict";
  var SESSION_KEY = "sb-parent-session";

  function startSession(id, remember) {
    var data = JSON.stringify({ id: id, at: Date.now() });
    try {
      if (remember) localStorage.setItem(SESSION_KEY, data); else sessionStorage.setItem(SESSION_KEY, data);
    } catch (e) { /* storage unavailable: continue with redirect */ }
    window.location.href = "dashboard.html";
  }

  document.addEventListener("DOMContentLoaded", function () {
    // The Login Portal is always shown, even when a session already exists.
    var $ = function (id) { return document.getElementById(id); };

    try { var last = localStorage.getItem("sb-last-email"); if (last) $("l-email").value = last; } catch (e) {}

    // Show / hide password
    document.querySelectorAll("[data-pw-toggle]").forEach(function (b) {
      b.addEventListener("click", function () {
        var inp = $(b.getAttribute("data-pw-toggle"));
        var show = inp.type === "password";
        inp.type = show ? "text" : "password";
        b.setAttribute("aria-label", show ? "Hide password" : "Show password");
      });
    });

    // Card heading follows the selected tab (click, keyboard or #register deep link)
    var COPY = {
      signin: ["Welcome back", "Sign in to see your child’s progress, classes and fees."],
      register: ["Create your account", "Set up a parent account to follow classes, progress and fees."]
    };
    var tabs = document.querySelectorAll('.auth-card [role="tab"]');
    function syncHeading() {
      var sel = document.querySelector('.auth-card [role="tab"][aria-selected="true"]');
      var c = COPY[sel ? sel.getAttribute("aria-controls") : "signin"] || COPY.signin;
      $("auth-title").textContent = c[0]; $("auth-sub").textContent = c[1];
    }
    tabs.forEach(function (t) {
      t.addEventListener("click", function () { setTimeout(syncHeading, 0); });
      t.addEventListener("keydown", function () { setTimeout(syncHeading, 0); });
    });
    window.addEventListener("hashchange", function () { setTimeout(syncHeading, 0); });
    syncHeading();
    function showTab(id) { var t = document.querySelector('.auth-card [aria-controls="' + id + '"]'); if (t) { t.click(); t.focus(); } }

    // Email + password sign-in
    var lf = $("login-form");
    lf.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!SB.validate(lf)) return;
      var btn = lf.querySelector("[type=submit]");
      btn.disabled = true; btn.innerHTML = '<span class="spinner" aria-hidden="true"></span> Signing in…';
      var email = $("l-email").value.trim();
      try { localStorage.setItem("sb-last-email", email); } catch (err) {}
      setTimeout(function () { startSession(email, $("l-remember").checked); }, 1100);
    });

    // Create account
    var rf = $("register-form"), rs = $("register-success");
    function mark(id, bad) {
      var inp = $(id), f = inp.closest(".field");
      if (f) f.classList.toggle("invalid", bad);
      inp.setAttribute("aria-invalid", bad ? "true" : "false");
      return bad ? inp : null;
    }
    function checkRegister() {
      var v = function (id) { return $(id).value.trim(); };
      var digits = v("r-phone").replace(/[\s-]/g, "").replace(/^(\+91|0)/, "");
      var pass = $("r-pass").value;
      var bad = [
        mark("r-name", !/^[A-Za-zÀ-ɏ .'-]{3,60}$/.test(v("r-name")) || !/[A-Za-z]{2,}/.test(v("r-name"))),
        mark("r-email", !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v("r-email"))),
        mark("r-phone", !/^[6-9]\d{9}$/.test(digits)),
        mark("r-pass", pass.length < 8 || !/\d/.test(pass)),
        mark("r-pass2", !$("r-pass2").value || $("r-pass2").value !== pass),
        mark("r-terms", !$("r-terms").checked)
      ].filter(Boolean);
      if (bad.length) bad[0].focus();
      return !bad.length;
    }
    rf.addEventListener("input", function (e) { var f = e.target.closest(".field.invalid"); if (f) f.classList.remove("invalid"); });
    rf.addEventListener("change", function (e) { var f = e.target.closest(".field.invalid"); if (f) f.classList.remove("invalid"); });
    rf.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!checkRegister()) { SB.toast("Please check the highlighted fields.", "error"); return; }
      var btn = rf.querySelector("[type=submit]");
      btn.disabled = true; btn.innerHTML = '<span class="spinner" aria-hidden="true"></span> Creating account…';
      setTimeout(function () {
        btn.disabled = false; btn.textContent = "Create account";
        var email = $("r-email").value.trim(), first = $("r-name").value.trim().split(/\s+/)[0];
        $("register-msg").textContent = "Welcome, " + first + ". Your parent account for " + email + " is ready — sign in to add your children and choose a batch.";
        try { localStorage.setItem("sb-last-email", email); } catch (err) {}
        rf.hidden = true; rs.classList.add("show"); rs.focus();
      }, 900);
    });
    document.querySelector("[data-go-signin]").addEventListener("click", function () {
      $("l-email").value = $("r-email").value.trim();
      rf.reset(); rf.hidden = false; rs.classList.remove("show");
      showTab("signin");
      setTimeout(function () { $("l-pass").focus(); }, 50);
    });

    // Forgot password
    var ff = $("forgot-form");
    ff.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!SB.validate(ff)) return;
      var btn = ff.querySelector("[type=submit]");
      btn.disabled = true; btn.textContent = "Sending…";
      setTimeout(function () {
        btn.disabled = false; btn.textContent = "Send reset link";
        $("forgot-msg").textContent = "A reset link has been sent to " + $("fp-email").value.trim() + ". It expires in 30 minutes.";
        ff.hidden = true; $("forgot-success").classList.add("show");
      }, 900);
    });
    $("forgot-modal").addEventListener("click", function (e) {
      if (e.target.closest("[data-close]")) setTimeout(function () { ff.reset(); ff.hidden = false; $("forgot-success").classList.remove("show"); }, 300);
    });
  });
})();
