/* ============================================================
   main.js - all interactive behaviour for the portfolio
   ============================================================
   Contents:
     1. Footer year      - show the current year automatically
     2. Sticky nav        - add a background to the nav on scroll
     3. Mobile menu       - open/close the slide-in menu
     4. Scroll reveal     - fade sections in as they enter view
     5. Active nav link   - highlight the section you are viewing
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
