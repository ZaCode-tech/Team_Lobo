// Configuração central de atendimento (WhatsApp oficial Team Lobo)
const WHATSAPP_NUMBER = "5521982814880";
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// 1. Preenchimento automático dos links de WhatsApp
document.querySelectorAll("[data-wa]").forEach((el) => {
  const message = el.getAttribute("data-wa");
  el.href = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;
  el.target = "_blank";
  el.rel = "noopener noreferrer";
});

// 2. Alternância de Tema Claro / Escuro com persistência
const themeToggle = document.getElementById("theme-toggle");
const metaTheme = document.getElementById("meta-theme-color");

function updateMetaTheme(theme) {
  if (metaTheme) {
    metaTheme.setAttribute("content", theme === "light" ? "#F6F8FB" : "#07090D");
  }
}

updateMetaTheme(document.documentElement.getAttribute("data-theme"));

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("tl-theme", next);
    updateMetaTheme(next);
  });
}

// 3. Menu Mobile
const menuToggle = document.getElementById("menu-toggle");
const mainNav = document.getElementById("main-nav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// 4. Barra de progresso + ScrollSpy + Scroll Parallax 3D no Hero
const progressBar = document.querySelector(".scroll-progress");
const headerEl = document.getElementById("header");
const navLinks = document.querySelectorAll(".main-nav a");
const parallaxTarget = document.querySelector("[data-scroll-parallax]");
const trackedSections = Array.from(navLinks)
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

window.addEventListener(
  "scroll",
  () => {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop;

    if (progressBar) {
      const maxScroll = doc.scrollHeight - doc.clientHeight || 1;
      const ratio = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
      progressBar.style.transform = `scaleX(${ratio})`;
    }

    if (headerEl) {
      headerEl.classList.toggle("scrolled", scrollTop > 24);
    }

    // Parallax vertical suave ao rolar a página
    if (parallaxTarget && !prefersReducedMotion && window.innerWidth > 1024 && scrollTop < 900) {
      parallaxTarget.style.transform = `translateY(${(scrollTop * 0.06).toFixed(1)}px)`;
    }

    // ScrollSpy ativo na Pill Navbar
    const offset = scrollTop + 150;
    let currentId = "";
    for (const sec of trackedSections) {
      if (sec.offsetTop <= offset) {
        currentId = sec.id;
      }
    }
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${currentId}`);
    });
  },
  { passive: true }
);

// 5. Staggered Scroll Reveal (Entrada em cascata)
const revealElements = document.querySelectorAll(".reveal");

if (prefersReducedMotion) {
  revealElements.forEach((el) => el.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      let batchIndex = 0;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.setProperty("--reveal-delay", `${batchIndex * 70}ms`);
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
          batchIndex++;
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
  );

  revealElements.forEach((el) => revealObserver.observe(el));
}

// 6. Contadores numéricos animados
const counters = document.querySelectorAll("[data-count]");

function animateCounter(el) {
  const target = Number(el.dataset.count);
  const prefix = el.dataset.prefix || "";
  if (prefersReducedMotion) {
    el.textContent = prefix + target;
    return;
  }

  const duration = 1350;
  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = prefix + Math.round(target * eased);
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

counters.forEach((counter) => counterObserver.observe(counter));

// 7. Spotlight nos Cards + Botões Magnéticos + Tilt 3D com Glare Especular
if (!prefersReducedMotion) {
  document.querySelectorAll(".spotlight-card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
      card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    });
  });

  document.querySelectorAll(".magnetic").forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.18;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.25;
      btn.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    });
    btn.addEventListener("pointerleave", () => {
      btn.style.transform = "";
    });
  });

  document.querySelectorAll("[data-tilt]").forEach((tiltCard) => {
    tiltCard.addEventListener("pointermove", (e) => {
      const rect = tiltCard.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rx = (py - 0.5) * -7;
      const ry = (px - 0.5) * 7;
      tiltCard.style.transform = `perspective(1000px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
      tiltCard.style.setProperty("--glare-x", `${(px * 100).toFixed(1)}%`);
      tiltCard.style.setProperty("--glare-y", `${(py * 100).toFixed(1)}%`);
    });
    tiltCard.addEventListener("pointerleave", () => {
      tiltCard.style.transform = "";
    });
  });
}

// 8. Filtro interativo na seção de Resultados & Depoimentos
const filterButtons = document.querySelectorAll(".filter-btn");
const testimonialCards = document.querySelectorAll(".testimonial-card");

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const selected = btn.dataset.filter;
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    testimonialCards.forEach((card) => {
      const match = selected === "all" || card.dataset.category === selected;
      card.classList.toggle("hidden-card", !match);
      if (match) {
        card.classList.add("is-visible");
      }
    });
  });
});

// 9. Ano automático no rodapé
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}
