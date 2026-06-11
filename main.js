/* ============================================================
   main.js - all interactive behaviour for the portfolio
   ============================================================
   Contents:
     1. Footer year      - show the current year automatically
     2. Sticky nav        - add a background to the nav on scroll
     3. Mobile menu       - open/close the slide-in menu
     4. Scroll reveal     - fade sections in as they enter view
     5. Active nav link   - highlight the section you are viewing
     6. Scroll effects    - progress bar + parallax background glows
     7. Count-up stats    - animate the About numbers when seen
     8. Case study modal  - open a project's case study in a popup
   ============================================================ */

/* ------------------------------------------------------------
   1. Footer year
   Fills the <span id="year"> with the current year so the
   copyright never goes out of date.
   ------------------------------------------------------------ */
document.getElementById("year").textContent = new Date().getFullYear();

/* ------------------------------------------------------------
   2. Sticky nav background
   Adds the "scrolled" class once the page is scrolled down a
   little. The class is styled in styles.css (.nav.scrolled).
   ------------------------------------------------------------ */
const nav = document.getElementById("nav");

function updateNavBackground() {
  const scrolledDown = window.scrollY > 24;
  nav.classList.toggle("scrolled", scrolledDown);
}

updateNavBackground(); // run once on load in case page is reloaded mid-scroll
window.addEventListener("scroll", updateNavBackground, { passive: true });

/* ------------------------------------------------------------
   3. Mobile menu
   The hamburger button (#navToggle) opens the slide-in menu
   (#mobileMenu). Tapping any link inside closes it again.
   ------------------------------------------------------------ */
const menuToggle = document.getElementById("navToggle");
const mobileMenu = document.getElementById("mobileMenu");

function closeMobileMenu() {
  mobileMenu.classList.remove("open");
  menuToggle.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}

// Toggle the menu open/closed when the hamburger is clicked
menuToggle.addEventListener("click", () => {
  const isOpen = mobileMenu.classList.toggle("open");
  menuToggle.classList.toggle("open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

// Close the menu after a link is tapped
mobileMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMobileMenu);
});

/* ------------------------------------------------------------
   4. Scroll reveal
   Any element with the "reveal" class starts hidden, then fades
   in when it scrolls into view. We use IntersectionObserver so
   this stays smooth and cheap. A small stagger delay makes
   groups of cards appear one after another.
   ------------------------------------------------------------ */
const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in"); // .reveal.in is the visible state
        revealObserver.unobserve(entry.target); // only animate once
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);

revealElements.forEach((element, index) => {
  // Stagger delay: 0ms, 80ms, 160ms, 240ms, then repeat
  element.style.transitionDelay = `${Math.min(index % 4, 3) * 80}ms`;
  revealObserver.observe(element);
});

/* ------------------------------------------------------------
   5. Active nav link
   Highlights the nav link for whichever section is currently
   on screen by adding the "active" class to it.
   ------------------------------------------------------------ */
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav__links a");

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const currentId = entry.target.id;
      navLinks.forEach((link) => {
        const isCurrent = link.getAttribute("href") === `#${currentId}`;
        link.classList.toggle("active", isCurrent);
      });
    });
  },
  { threshold: 0.5 } // section counts as "active" when half visible
);

sections.forEach((section) => sectionObserver.observe(section));


/* ------------------------------------------------------------
   6. Scroll effects
   - Fills the top progress bar based on how far down the page
     the visitor has scrolled.
   - Moves the two background glows at different speeds, which
     creates a subtle parallax (depth) effect.
   Parallax is skipped when the user prefers reduced motion.
   ------------------------------------------------------------ */
const progressBar = document.getElementById("scrollProgress");
const glow1 = document.querySelector(".bg-glow--1");
const glow2 = document.querySelector(".bg-glow--2");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function updateScrollEffects() {
  const scrollTop = window.scrollY;

  // Progress bar: current scroll as a percentage of the scrollable height
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const percent = scrollable > 0 ? (scrollTop / scrollable) * 100 : 0;
  progressBar.style.width = percent + "%";

  // Parallax: shift each glow by a fraction of the scroll distance
  if (!prefersReducedMotion) {
    if (glow1) glow1.style.transform = `translateY(${scrollTop * 0.18}px)`;
    if (glow2) glow2.style.transform = `translateY(${scrollTop * -0.12}px)`;
  }
}

updateScrollEffects(); // set the starting position on load
window.addEventListener("scroll", updateScrollEffects, { passive: true });


/* ------------------------------------------------------------
   7. Count-up stats
   The numbers in the About section count up from 0 to their
   target value the first time they scroll into view.
   ------------------------------------------------------------ */
const statNumbers = document.querySelectorAll(".stat__num[data-count]");

const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCount(entry.target);
      countObserver.unobserve(entry.target); // animate each number only once
    });
  },
  { threshold: 0.6 }
);

statNumbers.forEach((number) => countObserver.observe(number));

// Counts one element up from 0 to its data-count value
function animateCount(element) {
  const target = parseInt(element.dataset.count, 10);
  const suffix = element.dataset.suffix || ""; // e.g. the "+" in "8+"

  // If the user prefers less motion, just show the final number
  if (prefersReducedMotion) {
    element.textContent = target + suffix;
    return;
  }

  const duration = 1200; // total animation time in milliseconds
  const startTime = performance.now();

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out: fast, then slows
    element.textContent = Math.round(target * eased) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}


/* ------------------------------------------------------------
   8. Case study modal
   Clicking a project card copies that project's hidden
   .project__details into the modal and opens it. Clicks on the
   Code / Demo links are ignored so those still work normally.
   The modal closes on the X, the backdrop, or the Escape key.
   ------------------------------------------------------------ */
const projectCards = document.querySelectorAll(".project");
const modal = document.getElementById("caseModal");
const modalContent = document.getElementById("caseModalContent");

// Copy a project's case study into the modal and show it
function openCaseStudy(project) {
  const details = project.querySelector(".project__details");
  if (!details) return;

  modalContent.innerHTML = details.innerHTML;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
  modal.querySelector(".modal__close").focus(); // move focus into the popup
}

// Hide the modal and clear its contents
function closeCaseStudy() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
  modalContent.innerHTML = "";
}

// Open when a card is clicked (but let real links do their own thing)
projectCards.forEach((project) => {
  project.addEventListener("click", (event) => {
    if (event.target.closest("a")) return; // a Code / Demo link was clicked
    openCaseStudy(project);
  });
});

// Close when the X or the backdrop (anything with data-close) is clicked
modal.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-close")) closeCaseStudy();
});

// Close when Escape is pressed
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("open")) closeCaseStudy();
});
