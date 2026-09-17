(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const yearEl = document.querySelector("[data-year]");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* Fluid island nav */
  const nav = document.querySelector(".fluid-nav");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navPanel = document.querySelector("[data-nav-panel]");

  const setNavOpen = (open) => {
    if (!nav || !navToggle) return;
    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
  };

  if (navToggle) {
    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") !== "true";
      setNavOpen(open);
    });
  }

  if (navPanel) {
    navPanel.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setNavOpen(false));
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setNavOpen(false);
  });

  /* Scroll reveals — IntersectionObserver only.
   * .reveal is visible by default in the stylesheet; we add .js-reveal to <html>
   * only once we know we can animate AND can undo it, so a failure here leaves
   * the page readable rather than blank below the hero.
   *
   * threshold MUST stay 0: a section taller than viewport/threshold can never
   * expose that fraction of itself at once and would stay hidden forever. At
   * 360x400 the two tallest sections measure ~2473px and ~2377px against a
   * 2222px ceiling under the old 0.18 — verified stuck at opacity 0. The
   * rootMargin, not the threshold, is what delays the trigger.
   */
  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    const revealEls = document.querySelectorAll(".reveal");
    if (revealEls.length) {
      document.documentElement.classList.add("js-reveal");
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-inview");
            revealObserver.unobserve(entry.target);
          });
        },
        { threshold: 0, rootMargin: "0px 0px -8% 0px" }
      );
      revealEls.forEach((el) => revealObserver.observe(el));
    }
  }

  /* Tagline word reveal (Elaya B11) */
  const tagline = document.querySelector("[data-tagline]");
  if (tagline) {
    const words = Array.from(tagline.querySelectorAll("span"));

    if (prefersReducedMotion) {
      words.forEach((word) => word.classList.add("is-lit"));
    } else {
      const wordObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            words.forEach((word, index) => {
              window.setTimeout(() => word.classList.add("is-lit"), index * 90);
            });
            wordObserver.unobserve(tagline);
          });
        },
        { threshold: 0.45 }
      );
      wordObserver.observe(tagline);
    }
  }

  /* Waitlist form — posts to the public Basin form endpoint. */
  const form = document.querySelector("[data-waitlist-form]");

  if (form) {
    form.noValidate = true;
    const submitBtn = form.querySelector("[data-submit]");
    const submitLabel = form.querySelector("[data-submit-label]");
    const statusEl = form.querySelector("[data-form-status]");
    const successPanel = document.querySelector("[data-success-panel]");
    const successHandle = document.querySelector("[data-success-handle]");
    const fields = {
      name: form.elements.name,
      telegram: form.elements.telegram,
      consent: form.elements.consent,
    };
    const telegramPattern = /^@?[A-Za-z][A-Za-z0-9_]{3,30}[A-Za-z0-9]$/;
    let isSubmitting = false;

    const setStatus = (message, isError = false) => {
      if (!statusEl) return;
      statusEl.textContent = message;
      statusEl.classList.toggle("is-error", isError);
      statusEl.setAttribute("role", isError ? "alert" : "status");
    };

    const setFieldError = (name, message) => {
      const input = fields[name];
      const field = form.querySelector(`[data-field="${name}"]`);
      const error = form.querySelector(`[data-error-for="${name}"]`);
      if (field) field.classList.toggle("is-invalid", Boolean(message));
      if (input) input.setAttribute("aria-invalid", message ? "true" : "false");
      if (error) error.textContent = message;
    };

    const normaliseTelegram = (value) => value.trim().replace(/^@+/, "@");

    const validate = () => {
      let firstInvalid = null;
      const name = fields.name.value.trim();
      const telegram = normaliseTelegram(fields.telegram.value);
      fields.name.value = name;
      fields.telegram.value = telegram;

      if (!name) {
        setFieldError("name", "Enter your name.");
        if (!firstInvalid) firstInvalid = fields.name;
      } else {
        setFieldError("name", "");
      }

      if (!telegram) {
        setFieldError("telegram", "Enter your Telegram handle.");
        if (!firstInvalid) firstInvalid = fields.telegram;
      } else if (!telegramPattern.test(telegram)) {
        setFieldError("telegram", "Enter a valid Telegram handle: 5–32 letters, numbers, or underscores, starting with a letter and ending with a letter or number. @ is optional.");
        if (!firstInvalid) firstInvalid = fields.telegram;
      } else {
        setFieldError("telegram", "");
      }

      if (!fields.consent.checked) {
        setFieldError("consent", "Please agree to the waitlist privacy notice and terms before joining.");
        if (!firstInvalid) firstInvalid = fields.consent;
      } else {
        setFieldError("consent", "");
      }

      if (firstInvalid) {
        setStatus("Please fix the highlighted fields. Your details have not been sent.", true);
        firstInvalid.focus();
        return false;
      }

      setStatus("");
      return true;
    };

    const setSubmitting = (submitting) => {
      isSubmitting = submitting;
      if (submitBtn) submitBtn.disabled = submitting;
      if (submitLabel) submitLabel.textContent = submitting ? "Joining…" : "Join the waitlist";
      Object.values(fields).forEach((field) => {
        field.readOnly = submitting && field.type !== "checkbox";
        if (field.type === "checkbox") field.disabled = submitting;
      });
    };

    form.addEventListener("input", (event) => {
      const fieldName = event.target.name;
      if (fieldName in fields) setFieldError(fieldName, "");
      if (statusEl && statusEl.classList.contains("is-error")) setStatus("");
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (isSubmitting) return;
      if (!validate()) return;

      const payload = new FormData(form);
      setSubmitting(true);
      setStatus("Sending your waitlist request…");

      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: payload,
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Basin returned ${response.status}`);
        }

        const handle = normaliseTelegram(fields.telegram.value);
        if (successHandle) successHandle.textContent = handle ? ` (${handle})` : "";
        form.hidden = true;
        if (successPanel) {
          successPanel.hidden = false;
          successPanel.focus();
        }
      } catch (error) {
        setSubmitting(false);
        setStatus("We could not confirm Basin received this. Your details are still here — please try again, or email hello@tutoratlas.sg if it keeps failing.", true);
      }
    });
  }
})();
