// ══ Page loader — quiet curtain before the exhibition opens ══
window.addEventListener("load", () => {
  const loader = document.getElementById("page-loader");
  if (!loader) return;
  window.setTimeout(() => {
    loader.classList.add("page-loader--hide");
    window.setTimeout(() => {
      loader.remove();
    }, 600);
  }, 1100);
});

// ══ Navigation — Scroll Behavior & Mobile Toggle ══
document.addEventListener("DOMContentLoaded", () => {
  /* Portfolio: slight random rotations — works on a wall, not in a template grid */
  const tiltAngles = [-1.2, -0.8, -0.4, 0.2, 0.6, 1.0, 1.2, -0.6, 0.8, -1.0];
  document.querySelectorAll(".portfolio__item.reveal--place").forEach((item, i) => {
    item.style.setProperty("--random-rotation", `${tiltAngles[i % tiltAngles.length]}deg`);
  });

  /* Scroll reveals: stagger so the page breathes in sequence */
  document.querySelectorAll("[data-reveal]").forEach((el, i) => {
    el.style.setProperty("--reveal-delay", `${i * 120}ms`);
  });

  const siteHeader = document.getElementById("site-header");
  const navToggle = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("nav-menu");
  const navOverlay = document.getElementById("nav-overlay");
  const navLinks = document.querySelectorAll(".nav__link[data-section]");
  const allNavLinks = document.querySelectorAll(".nav__link");
  const sectionIds = ["about", "disciplines", "portfolio", "journal", "contact"];

  const closeMobileNav = () => {
    siteHeader.classList.remove("is-open");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open menu");
    }
    if (navOverlay) navOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  const openMobileNav = () => {
    siteHeader.classList.add("is-open");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "true");
      navToggle.setAttribute("aria-label", "Close menu");
    }
    if (navOverlay) navOverlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const onScrollNav = () => {
    if (!siteHeader) return;
    siteHeader.classList.toggle("is-scrolled", window.scrollY > 80);
  };

  const updateNavActive = () => {
    const mid = window.innerHeight * 0.5;
    let activeId = "";
    if (window.scrollY < 72) {
      navLinks.forEach((l) => l.classList.remove("is-active"));
      return;
    }
    for (let s = 0; s < sectionIds.length; s += 1) {
      const id = sectionIds[s];
      const el = document.getElementById(id);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.top <= mid && r.bottom >= mid) {
        activeId = id;
        break;
      }
    }
    if (
      !activeId &&
      window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 96
    ) {
      activeId = "contact";
    }
    navLinks.forEach((link) => {
      const sec = link.getAttribute("data-section");
      link.classList.toggle("is-active", sec === activeId);
    });
  };

  window.addEventListener("scroll", onScrollNav, { passive: true });
  window.addEventListener("scroll", updateNavActive, { passive: true });
  window.addEventListener(
    "resize",
    () => {
      if (window.matchMedia("(min-width: 768px)").matches) closeMobileNav();
      updateNavActive();
    },
    { passive: true }
  );
  onScrollNav();
  updateNavActive();

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      if (siteHeader.classList.contains("is-open")) closeMobileNav();
      else openMobileNav();
    });
  }

  if (navOverlay) {
    navOverlay.addEventListener("click", closeMobileNav);
  }

  allNavLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (window.matchMedia("(max-width: 767px)").matches) closeMobileNav();
    });
  });

  // ══ Hero — Entrance Animations ══
  const hero = document.getElementById("hero");
  if (hero) {
    requestAnimationFrame(() => {
      hero.classList.add("is-ready");
    });
  }

  // ══ Scroll Reveal — IntersectionObserver ══
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length > 0) {
    let revealedCount = 0;
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealedCount += 1;
          observer.unobserve(entry.target);
          if (revealedCount >= revealEls.length) {
            observer.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  // ══ Disciplines Section — Animations & Interactions ══
  (() => {
    const disciplinesSection = document.getElementById("disciplines");
    if (!disciplinesSection) return;

    const disciplinesGrid = disciplinesSection.querySelector(".disciplines-grid");
    const disciplineCards = disciplinesSection.querySelectorAll(".discipline-card");
    const disciplinesHeader = disciplinesSection.querySelector(".disciplines-header");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // -- Card tilt initialization (each piece lands from a slightly different angle)
    const tilts = [-2.5, 1.8, -1.2, 2.1, -1.6, 1.4];
    disciplineCards.forEach((card, i) => {
      card.style.setProperty("--card-tilt", `${tilts[i % tilts.length]}deg`);
    });

    // -- Icon path length measurement (stroke-draw effect)
    const measureIconPaths = () => {
      disciplineCards.forEach((card) => {
        const paths = card.querySelectorAll(
          "svg path, svg line, svg circle, svg rect, svg polyline, svg ellipse"
        );
        paths.forEach((path) => {
          let len = 200;
          try {
            if (typeof path.getTotalLength === "function") {
              len = path.getTotalLength();
            }
          } catch {
            len = 200;
          }
          path.style.strokeDasharray = String(len);
          path.style.strokeDashoffset = String(len);
          path.style.setProperty("--path-length", String(len));
        });
      });
    };
    measureIconPaths();

    // -- Column-based stagger from live grid column count
    const assignColumnDelays = () => {
      if (!disciplinesGrid || disciplineCards.length === 0) return;
      const colsStr = getComputedStyle(disciplinesGrid).gridTemplateColumns;
      const cols = colsStr.split(/\s+/).filter((p) => p.trim() !== "").length || 1;
      disciplineCards.forEach((card, i) => {
        const col = i % cols;
        let delayMs;
        if (cols === 1) delayMs = i * 100;
        else if (cols === 2) delayMs = col * 150;
        else delayMs = col * 120;
        card.style.setProperty("--card-delay", `${delayMs}ms`);
        card.style.setProperty("--icon-draw-delay", `calc(${delayMs}ms + 0.5s)`);
      });
    };
    assignColumnDelays();
    window.addEventListener("resize", assignColumnDelays, { passive: true });

    // -- IntersectionObserver — section header (brush + converging title)
    // Observe the header block, not the whole section: on small viewports the section
    // is much taller than the screen, so intersectionRatio for #disciplines can stay
    // below 0.2 until the user has scrolled past the heading (which stayed opacity:0).
    if (disciplinesHeader) {
      if (reduceMotion) {
        disciplinesHeader.classList.add("disciplines-header-visible");
      } else {
        const headerObs = new IntersectionObserver(
          (entries, obs) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                disciplinesHeader.classList.add("disciplines-header-visible");
                obs.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.05, rootMargin: "0px" }
        );
        headerObs.observe(disciplinesHeader);
      }
    }

    // -- IntersectionObserver — section atmosphere (warm overlay when deeply in view)
    const pulseObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio >= 0.8) {
            disciplinesSection.classList.add("disciplines-active");
          } else {
            disciplinesSection.classList.remove("disciplines-active");
          }
        });
      },
      { threshold: [0, 0.25, 0.5, 0.8, 1] }
    );
    pulseObs.observe(disciplinesSection);

    // -- IntersectionObserver — discipline cards
    const cardObs = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("card--visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.06, rootMargin: "0px 0px 12% 0px" }
    );
    disciplineCards.forEach((card) => {
      if (reduceMotion) {
        card.classList.add("card--visible");
      } else {
        cardObs.observe(card);
      }
    });

    // -- Photography shutter flash handler
    if (!reduceMotion) {
      disciplineCards.forEach((card) => {
        if (card.getAttribute("data-discipline") !== "photography") return;
        const inner = card.querySelector(".discipline-card-inner");
        if (!inner) return;
        card.addEventListener(
          "mouseenter",
          () => {
            inner.classList.add("disciplines-shutter-flash");
          },
          { passive: true }
        );
        inner.addEventListener("animationend", (e) => {
          if (String(e.animationName || "").includes("disciplines-shutter-flash")) {
            inner.classList.remove("disciplines-shutter-flash");
          }
        });
      });
    }

    // -- Parallax scroll handler (outer card only — inner holds hover transform)
    const depthFactors = [0.02, 0.035, 0.02, 0.025, 0.04, 0.03];
    const updateDisciplineParallax = () => {
      if (reduceMotion) return;
      const rect = disciplinesSection.getBoundingClientRect();
      if (rect.top > window.innerHeight || rect.bottom < 0) {
        disciplineCards.forEach((c) => c.style.setProperty("--parallax-y", "0px"));
        return;
      }
      const denom = rect.height + window.innerHeight;
      const progress = denom > 0 ? -rect.top / denom : 0;
      disciplineCards.forEach((card, i) => {
        const raw = progress * depthFactors[i % depthFactors.length] * 80;
        const capped = Math.max(-10, Math.min(10, raw));
        card.style.setProperty("--parallax-y", `${capped}px`);
      });
    };
    window.addEventListener("scroll", updateDisciplineParallax, { passive: true });
    window.addEventListener("resize", updateDisciplineParallax, { passive: true });
    updateDisciplineParallax();
  })();

  // ══ Portfolio — Filter System ══
  const portfolioGrid = document.getElementById("portfolio-grid");
  const portfolioItems = portfolioGrid
    ? portfolioGrid.querySelectorAll(".portfolio__item")
    : [];
  const filterBtns = document.querySelectorAll(".filter-btn");

  const applyPortfolioFilter = (filter) => {
    if (!portfolioGrid) return;
    portfolioGrid.style.opacity = "0.35";
    window.setTimeout(() => {
      portfolioItems.forEach((li) => {
        const cat = li.getAttribute("data-category") || "";
        const show = filter === "all" || cat === filter;
        li.classList.toggle("is-hidden", !show);
      });
      portfolioGrid.style.opacity = "1";
    }, 180);
  };

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const f = btn.getAttribute("data-filter") || "all";
      filterBtns.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      applyPortfolioFilter(f);
    });
  });

  // ══ Portfolio — Lightbox ══
  const lightbox = document.getElementById("lightbox");
  const lightboxOverlay = document.getElementById("lightbox-overlay");
  const lightboxContainer = document.getElementById("lightbox-container");
  const lightboxClose = document.getElementById("lightbox-close");
  const lightboxPrev = document.getElementById("lightbox-prev");
  const lightboxNext = document.getElementById("lightbox-next");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCategory = document.getElementById("lightbox-category");
  const lightboxTitle = document.getElementById("lightbox-title");
  const lightboxDescription = document.getElementById("lightbox-description");

  let lightboxIndex = 0;
  let lightboxOrder = [];
  let lightboxTriggerEl = null;
  let lightboxFocusTrapHandler = null;

  const getVisiblePortfolioItems = () =>
    Array.from(portfolioItems).filter((li) => !li.classList.contains("is-hidden"));

  const populateLightbox = (item) => {
    if (!item || !lightboxImg) return;
    const src = item.getAttribute("data-src") || "";
    const title = item.getAttribute("data-title") || "";
    const category = item.getAttribute("data-category") || "";
    const description = item.getAttribute("data-description") || "";
    lightboxImg.src = src;
    lightboxImg.alt = title || "Artwork";
    if (lightboxCategory) {
      lightboxCategory.textContent =
        category === "studio"
          ? "Studio overview"
          : category === "identity"
            ? "Identity"
            : category === "collateral"
              ? "Collateral"
              : category;
    }
    if (lightboxTitle) lightboxTitle.textContent = title;
    if (lightboxDescription) lightboxDescription.textContent = description;
  };

  const getFocusableInLightbox = () => {
    if (!lightbox) return [];
    return Array.from(
      lightbox.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute("disabled") && el.getClientRects().length > 0);
  };

  const openLightbox = (item, trigger) => {
    if (!lightbox) return;
    lightbox.classList.remove("is-closing");
    lightboxOrder = getVisiblePortfolioItems();
    if (lightboxOrder.length === 0) return;
    lightboxIndex = lightboxOrder.indexOf(item);
    if (lightboxIndex < 0) lightboxIndex = 0;
    lightboxTriggerEl = trigger;
    populateLightbox(lightboxOrder[lightboxIndex]);
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    window.setTimeout(() => {
      if (lightboxClose) lightboxClose.focus();
    }, 80);

    lightboxFocusTrapHandler = (e) => {
      if (e.key !== "Tab" || !lightbox.classList.contains("is-open")) return;
      const focusable = getFocusableInLightbox();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    lightbox.addEventListener("keydown", lightboxFocusTrapHandler);
  };

  const finishCloseLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove("is-open", "is-closing");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lightboxFocusTrapHandler) {
      lightbox.removeEventListener("keydown", lightboxFocusTrapHandler);
      lightboxFocusTrapHandler = null;
    }
    if (lightboxTriggerEl && typeof lightboxTriggerEl.focus === "function") {
      lightboxTriggerEl.focus();
    }
    lightboxTriggerEl = null;
  };

  const closeLightbox = () => {
    if (!lightbox || !lightbox.classList.contains("is-open")) return;
    lightbox.classList.add("is-closing");
    window.setTimeout(() => {
      finishCloseLightbox();
    }, 520);
  };

  const stepLightbox = (delta) => {
    if (lightboxOrder.length === 0) return;
    lightboxIndex = (lightboxIndex + delta + lightboxOrder.length) % lightboxOrder.length;
    populateLightbox(lightboxOrder[lightboxIndex]);
  };

  portfolioItems.forEach((item) => {
    const trigger = item.querySelector(".portfolio__trigger");
    if (!trigger) return;
    trigger.addEventListener("click", () => openLightbox(item, trigger));
  });

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightboxOverlay) lightboxOverlay.addEventListener("click", closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener("click", () => stepLightbox(-1));
  if (lightboxNext) lightboxNext.addEventListener("click", () => stepLightbox(1));

  document.addEventListener("keydown", (e) => {
    if (!lightbox || !lightbox.classList.contains("is-open")) return;
    if (lightbox.classList.contains("is-closing")) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closeLightbox();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      stepLightbox(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      stepLightbox(1);
    }
  });

  if (lightboxContainer) {
    lightboxContainer.addEventListener("click", (e) => e.stopPropagation());
  }

  // ══ Contact — Form Handler ══
  const contactForm = document.getElementById("contact-form");
  const formSuccess = document.getElementById("form-success");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (formSuccess) {
        formSuccess.hidden = false;
        contactForm.reset();
        formSuccess.focus();
      }
    });
  }

  // ══ Scroll Progress Indicator ══
  const progressBar = document.getElementById("scroll-progress-bar");
  const progressLabel = document.getElementById("scroll-progress-label");

  const updateScrollProgress = () => {
    if (!progressBar || !progressLabel) return;
    const el = document.documentElement;
    const scrollable = el.scrollHeight - el.clientHeight;
    const pct = scrollable > 0 ? Math.round((el.scrollTop / scrollable) * 100) : 0;
    progressLabel.textContent = `${pct}%`;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (isMobile) {
      progressBar.style.width = `${pct}%`;
      progressBar.style.height = "100%";
    } else {
      progressBar.style.height = `${pct}%`;
      progressBar.style.width = "100%";
    }
  };

  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  window.addEventListener("resize", updateScrollProgress, { passive: true });
  updateScrollProgress();

  // ══ Utilities ══
  const footerYear = document.getElementById("footer-year");
  if (footerYear) {
    footerYear.textContent = String(new Date().getFullYear());
  }
});
