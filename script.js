// Portfolio interactions and animations.
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function icons() {
    try { if (window.lucide) window.lucide.createIcons(); } catch (e) { /* icons are optional */ }
  }

  function init() {
    document.documentElement.classList.add("js");
    icons();
    window.addEventListener("load", icons); // in case the icon library loads late

    /* ---------- Mobile menu ---------- */
    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.getElementById("navLinks");

    function setMenu(open) {
      if (!menuToggle || !navLinks) return;
      navLinks.classList.toggle("open", open);
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
      menuToggle.innerHTML = open ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
      icons();
    }

    if (menuToggle && navLinks) {
      menuToggle.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
      navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setMenu(false)));
      document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });
      document.addEventListener("click", e => {
        if (navLinks.classList.contains("open") && !navLinks.contains(e.target) && !menuToggle.contains(e.target)) setMenu(false);
      });
    }

    /* ---------- Staggered scroll reveal ---------- */
    ["#skills .skills-grid", ".projects-grid", ".education-list", ".about-highlights", ".timeline"].forEach(sel => {
      document.querySelectorAll(sel).forEach(group => {
        Array.from(group.children).forEach((child, i) => {
          child.classList.add("reveal");
          child.style.setProperty("--d", i * 90 + "ms");
        });
      });
    });
    // Nested reveals inside an already-revealing parent would double-animate.
    document.querySelectorAll(".reveal .reveal").forEach(el => el.classList.remove("reveal"));

    const revealItems = document.querySelectorAll(".reveal");
    const show = el => {
      el.classList.add("is-visible");
      setTimeout(() => el.classList.add("done"), 1000);
    };
    if ("IntersectionObserver" in window && !reduceMotion) {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) { show(entry.target); obs.unobserve(entry.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
      revealItems.forEach(el => io.observe(el));
    } else {
      revealItems.forEach(el => el.classList.add("is-visible", "done"));
    }

    /* ---------- Scroll progress + header state ---------- */
    const progress = document.getElementById("scrollProgress");
    const header = document.querySelector(".site-header");
    let ticking = false;
    function onScroll() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      if (progress) progress.style.width = Math.min(100, Math.max(0, pct)) + "%";
      if (header) header.classList.toggle("scrolled", window.scrollY > 20);
      ticking = false;
    }
    window.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();

    /* ---------- Active nav link (scrollspy) ---------- */
    const links = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
    const sections = links.map(a => document.querySelector(a.getAttribute("href"))).filter(Boolean);
    if ("IntersectionObserver" in window && sections.length) {
      const spy = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id));
          }
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      sections.forEach(s => spy.observe(s));
    }

    /* ---------- Typing effect ---------- */
    const typed = document.getElementById("typed");
    if (typed) {
      const words = ["Java & Spring Boot APIs", "Angular interfaces", "ERPNext automations", "Python web apps"];
      if (reduceMotion) {
        typed.textContent = words[0];
      } else {
        let w = 0, c = 0, deleting = false;
        const tick = () => {
          const word = words[w];
          c += deleting ? -1 : 1;
          typed.textContent = word.slice(0, c);
          let delay = deleting ? 35 : 75;
          if (!deleting && c === word.length) { deleting = true; delay = 1600; }
          else if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; delay = 350; }
          setTimeout(tick, delay);
        };
        typed.textContent = "";
        setTimeout(tick, 900);
      }
    }

    /* ---------- Photo tilt + card spotlight (desktop mouse only) ---------- */
    if (finePointer && !reduceMotion) {
      const art = document.querySelector(".hero-art");
      const frame = document.querySelector(".photo-frame");
      if (art && frame) {
        art.addEventListener("mousemove", e => {
          const r = art.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          frame.style.setProperty("--ry", (x * 14).toFixed(2) + "deg");
          frame.style.setProperty("--rx", (-y * 14).toFixed(2) + "deg");
        });
        art.addEventListener("mouseleave", () => {
          frame.style.setProperty("--rx", "0deg");
          frame.style.setProperty("--ry", "0deg");
        });
      }
      document.querySelectorAll(".skill-card, .project-card").forEach(card => {
        card.addEventListener("mousemove", e => {
          const r = card.getBoundingClientRect();
          card.style.setProperty("--mx", e.clientX - r.left + "px");
          card.style.setProperty("--my", e.clientY - r.top + "px");
        });
      });
    }

    /* ---------- Footer year ---------- */
    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();