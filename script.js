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

  /* Scroll reveals — IntersectionObserver only */
  if (!prefersReducedMotion) {
    const revealEls = document.querySelectorAll(".reveal");
    if (revealEls.length) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-inview");
            revealObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
      );
      revealEls.forEach((el) => revealObserver.observe(el));
    }
  } else {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-inview"));
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

  /*
   * Waitlist form — DISABLED (13 Sep 2026 stopgap).
   * Do not collect details we cannot keep. Do not POST anywhere.
   *
   * FORM-BACK LOCK (when the form returns — not now):
   * - name + Telegram handle (not WhatsApp)
   * - explicit consent checkbox, unticked by default
   * - live privacy policy URL on the form before any real submit
   * - real endpoint we control (never example.com or a placeholder)
   */
  const form = document.querySelector("[data-waitlist-form]");
  const submitBtn = document.querySelector("[data-submit]");

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.setAttribute("type", "button");
  }

  if (form) {
    form.setAttribute("aria-disabled", "true");
    form.querySelectorAll("input, textarea, button").forEach((el) => {
      el.disabled = true;
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
    });
  }
})();
