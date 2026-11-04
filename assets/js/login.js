/* SutraBead — Parent sign-in */
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

    try { var last = localStorage.getItem("sb-last-email"); if (last) document.getElementById("l-email").value = last; } catch (e) {}

    // Show / hide password
    document.querySelectorAll("[data-pw-toggle]").forEach(function (b) {
      b.addEventListener("click", function () {
        var inp = document.getElementById(b.getAttribute("data-pw-toggle"));
        var show = inp.type === "password";
        inp.type = show ? "text" : "password";
        b.setAttribute("aria-label", show ? "Hide password" : "Show password");
      });
    });

    // Email + password
    var lf = document.getElementById("login-form");
    lf.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!SB.validate(lf)) return;
      var btn = lf.querySelector("[type=submit]");
      btn.disabled = true; btn.innerHTML = '<span class="spinner" aria-hidden="true"></span> Signing in…';
      var email = document.getElementById("l-email").value.trim();
      try { localStorage.setItem("sb-last-email", email); } catch (err) {}
      setTimeout(function () { startSession(email, document.getElementById("l-remember").checked); }, 1100);
    });

    // OTP flow
    var of = document.getElementById("otp-form"), step = document.getElementById("otp-step");
    var submit = document.getElementById("otp-submit"), resend = document.getElementById("otp-resend"), timerEl = document.getElementById("otp-timer");
    var timer = null;
    function countdown() {
      var s = 30; resend.disabled = true;
      clearInterval(timer);
      timerEl.textContent = "Resend available in " + s + "s";
      timer = setInterval(function () {
        s--;
        if (s <= 0) { clearInterval(timer); timerEl.textContent = "Didn’t get it?"; resend.disabled = false; }
        else timerEl.textContent = "Resend available in " + s + "s";
      }, 1000);
    }
    function sendOtp() {
      var ph = document.getElementById("o-phone").value.replace(/\D/g, "");
      document.getElementById("otp-msg").textContent = "OTP sent to ••••••" + ph.slice(-4) + ". It is valid for 10 minutes.";
      step.hidden = false;
      submit.textContent = "Verify & sign in";
      var code = document.getElementById("o-code");
      code.setAttribute("data-rule", "otp");
      code.focus();
      countdown();
    }
    of.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!SB.validate(of)) return;
      if (step.hidden) {
        submit.disabled = true; submit.innerHTML = '<span class="spinner" aria-hidden="true"></span> Sending…';
        setTimeout(function () { submit.disabled = false; sendOtp(); }, 800);
      } else {
        submit.disabled = true; submit.innerHTML = '<span class="spinner" aria-hidden="true"></span> Verifying…';
        setTimeout(function () { startSession(document.getElementById("o-phone").value.trim(), true); }, 1000);
      }
    });
    resend.addEventListener("click", function () { countdown(); SB.toast("A new OTP has been sent."); });
    document.getElementById("o-code").addEventListener("input", function (e) { e.target.value = e.target.value.replace(/\D/g, "").slice(0, 6); });

    // Forgot password
    var ff = document.getElementById("forgot-form");
    ff.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!SB.validate(ff)) return;
      var btn = ff.querySelector("[type=submit]");
      btn.disabled = true; btn.textContent = "Sending…";
      setTimeout(function () {
        btn.disabled = false; btn.textContent = "Send reset link";
        document.getElementById("forgot-msg").textContent = "A reset link has been sent to " + document.getElementById("fp-email").value.trim() + ". It expires in 30 minutes.";
        ff.hidden = true; document.getElementById("forgot-success").classList.add("show");
      }, 900);
    });
    document.getElementById("forgot-modal").addEventListener("click", function (e) {
      if (e.target.closest("[data-close]")) setTimeout(function () { ff.reset(); ff.hidden = false; document.getElementById("forgot-success").classList.remove("show"); }, 300);
    });
  });
})();
