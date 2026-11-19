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
     9. Contact form      - send the message without leaving the page
    10. Theme toggle      - switch between dark and light
    11. Command palette   - Ctrl/Cmd + K quick actions
    12. Typing effect     - cycle the word in the hero title
    13. Card spotlight    - glow that follows the mouse on cards
    14. Telemetry demo    - simulated drone health monitor (thesis)
    15. GitHub feed       - latest repos from the GitHub API
    16. Hover clips       - play a project's video on hover
    17. Live details      - clocks, live timeline, skill counts, build stats
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

/* ------------------------------------------------------------
   9. Contact form
   Posts the form to Netlify in the background, the same way a
   normal submit would, then shows a success or error message.
   Without JS the form still submits normally to Netlify.
   ------------------------------------------------------------ */
const contactForm = document.getElementById("contactForm");
const contactStatus = document.getElementById("contactStatus");

function showContactStatus(text, type) {
  contactStatus.textContent = text;
  contactStatus.className = "contact-form__status is-" + type;
}

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = contactForm.querySelector("button[type=submit]");
  button.disabled = true;
  showContactStatus("Sending...", "pending");

  try {
    const response = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(new FormData(contactForm)).toString(),
    });
    if (!response.ok) throw new Error("Status " + response.status);

    contactForm.reset();
    showContactStatus("Thanks! Your message has been sent. I'll get back to you soon.", "success");
  } catch (err) {
    showContactStatus("Sorry, that didn't send. Please try again or email me directly.", "error");
  } finally {
    button.disabled = false;
  }
});

/* ------------------------------------------------------------
   10. Theme toggle
   Switches between dark (default) and light by setting
   data-theme="light" on <html>. The choice is saved so it
   sticks on the next visit (the inline script in <head> applies
   it before the page paints).
   ------------------------------------------------------------ */
const themeToggle = document.getElementById("themeToggle");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

function isLightTheme() {
  return document.documentElement.dataset.theme === "light";
}

function setTheme(light) {
  if (light) document.documentElement.dataset.theme = "light";
  else delete document.documentElement.dataset.theme;

  themeToggle.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
  if (themeColorMeta) themeColorMeta.setAttribute("content", light ? "#f5f6fa" : "#07080d");
  try { localStorage.setItem("theme", light ? "light" : "dark"); } catch (e) { /* storage blocked */ }
}

function toggleTheme() {
  setTheme(!isLightTheme());
}

themeToggle.addEventListener("click", toggleTheme);
if (isLightTheme()) setTheme(true); // sync the label + browser bar colour on load

/* ------------------------------------------------------------
   Toast: a small message that pops up at the bottom for a
   couple of seconds. Used by the command palette.
   ------------------------------------------------------------ */
const toast = document.getElementById("toast");
let toastTimer;

function showToast(text) {
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

/* ------------------------------------------------------------
   11. Command palette
   Ctrl/Cmd + K (or the search button in the nav) opens a quick
   list of actions. Typing filters it, arrow keys move, Enter
   runs the highlighted command and Escape closes it.
   ------------------------------------------------------------ */
const palette = document.getElementById("palette");
const paletteInput = document.getElementById("paletteInput");
const paletteList = document.getElementById("paletteList");
const paletteOpenButton = document.getElementById("paletteOpen");
const isMac = /Mac|iPhone|iPad/.test(navigator.platform);

document.getElementById("paletteKey").textContent = isMac ? "⌘ K" : "Ctrl K";

function goTo(id) {
  document.getElementById(id).scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
}

function openLink(url) {
  window.open(url, "_blank", "noopener");
}

// Every command: a label, a group shown on the right, and what it does
const commands = [
  { label: "Go to About", group: "Navigate", run: () => goTo("about") },
  { label: "Go to Skills", group: "Navigate", run: () => goTo("skills") },
  { label: "Go to Projects", group: "Navigate", run: () => goTo("projects") },
  { label: "Go to Thesis", group: "Navigate", run: () => goTo("thesis") },
  { label: "Go to GitHub activity", group: "Navigate", run: () => goTo("github") },
  { label: "Go to Contact", group: "Navigate", run: () => goTo("contact") },
  { label: "Open resume (PDF)", group: "Files", run: () => openLink("./assets/Daniel-Mattioli-Resume.pdf") },
  { label: "Open thesis (PDF)", group: "Files", run: () => openLink("./assets/Daniel-Mattioli-Thesis.pdf") },
  {
    label: "Copy email address", group: "Contact",
    run: () => {
      navigator.clipboard.writeText("danielmattioli2005@gmail.com")
        .then(() => showToast("Email copied to clipboard"))
        .catch(() => showToast("danielmattioli2005@gmail.com"));
    },
  },
  { label: "Send me a message", group: "Contact", run: () => { goTo("contact"); contactForm.querySelector("input[name=name]").focus({ preventScroll: true }); } },
  { label: "Open GitHub profile", group: "Links", run: () => openLink("https://github.com/Dmatt547") },
  { label: "Open LinkedIn", group: "Links", run: () => openLink("https://www.linkedin.com/in/daniel-matti/") },
  { label: "Toggle light / dark theme", group: "Settings", run: toggleTheme },
  { label: "Try the drone health demo", group: "Thesis", run: () => goTo("telemetry") },
];

// Add a "Case study: ..." command for every project card
projectCards.forEach((project) => {
  const title = project.querySelector(".project__title");
  if (title && project.querySelector(".project__details")) {
    commands.push({ label: "Case study: " + title.textContent.trim(), group: "Projects", run: () => openCaseStudy(project) });
  }
});

let filteredCommands = commands;
let activeIndex = 0;
let focusBeforePalette = null;

function renderPalette() {
  const query = paletteInput.value.trim().toLowerCase();
  filteredCommands = commands.filter((command) =>
    (command.label + " " + command.group).toLowerCase().includes(query)
  );
  activeIndex = Math.min(activeIndex, Math.max(filteredCommands.length - 1, 0));

  paletteList.innerHTML = "";
  if (filteredCommands.length === 0) {
    const empty = document.createElement("li");
    empty.className = "palette__empty";
    empty.textContent = "No matching commands";
    paletteList.appendChild(empty);
    return;
  }

  filteredCommands.forEach((command, index) => {
    const item = document.createElement("li");
    item.className = "palette__item" + (index === activeIndex ? " is-active" : "");
    item.id = "palette-item-" + index;
    item.setAttribute("role", "option");
    item.setAttribute("aria-selected", String(index === activeIndex));
    item.innerHTML = "<span></span><small></small>";
    item.firstChild.textContent = command.label;
    item.lastChild.textContent = command.group;
    item.addEventListener("click", () => runCommand(index));
    item.addEventListener("mousemove", () => {
      if (activeIndex !== index) { activeIndex = index; renderPalette(); }
    });
    paletteList.appendChild(item);
  });

  paletteInput.setAttribute("aria-activedescendant", "palette-item-" + activeIndex);
  document.getElementById("palette-item-" + activeIndex).scrollIntoView({ block: "nearest" });
}

function openPalette() {
  focusBeforePalette = document.activeElement;
  palette.hidden = false;
  document.body.classList.add("no-scroll");
  paletteInput.value = "";
  activeIndex = 0;
  renderPalette();
  paletteInput.focus();
}

function closePalette() {
  palette.hidden = true;
  document.body.classList.remove("no-scroll");
  if (focusBeforePalette) focusBeforePalette.focus({ preventScroll: true });
}

function runCommand(index) {
  const command = filteredCommands[index];
  if (!command) return;
  closePalette();
  command.run();
}

paletteOpenButton.addEventListener("click", openPalette);
paletteInput.addEventListener("input", () => { activeIndex = 0; renderPalette(); });

paletteInput.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    activeIndex = (activeIndex + 1) % Math.max(filteredCommands.length, 1);
    renderPalette();
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    activeIndex = (activeIndex - 1 + filteredCommands.length) % Math.max(filteredCommands.length, 1);
    renderPalette();
  } else if (event.key === "Enter") {
    event.preventDefault();
    runCommand(activeIndex);
  }
});

palette.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-palette-close")) closePalette();
});

// Ctrl/Cmd + K toggles the palette from anywhere; Escape closes it
document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    if (palette.hidden) {
      if (modal.classList.contains("open")) closeCaseStudy();
      openPalette();
    } else {
      closePalette();
    }
  } else if (event.key === "Escape" && !palette.hidden) {
    closePalette();
  }
});

/* ------------------------------------------------------------
   12. Typing effect
   Deletes and retypes the highlighted word in the hero title,
   cycling through the phrases below. The HTML already holds the
   first phrase, so it still reads fine without JS.
   ------------------------------------------------------------ */
const typedWord = document.getElementById("typedWord");
const typedPhrases = ["full-stack apps", "IoT systems", "REST APIs", "monitoring tools", "connected systems"];

if (typedWord && !prefersReducedMotion) {
  let phraseIndex = 0;
  let charCount = typedPhrases[0].length;
  let deleting = true;

  function typeStep() {
    const phrase = typedPhrases[phraseIndex];
    let delay = deleting ? 45 : 85; // deleting is quicker than typing

    if (deleting) {
      charCount--;
      if (charCount === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % typedPhrases.length;
        delay = 300;
      }
    } else {
      charCount++;
      if (charCount === typedPhrases[phraseIndex].length) {
        deleting = true;
        delay = 2200; // hold the finished phrase before deleting
      }
    }

    typedWord.textContent = typedPhrases[phraseIndex].slice(0, charCount) || "​";
    setTimeout(typeStep, delay);
  }

  setTimeout(typeStep, 2600); // let the first phrase sit for a moment
}

/* ------------------------------------------------------------
   13. Card spotlight
   A soft glow follows the mouse over cards with the "spotlight"
   class. We only pass the mouse position into CSS variables;
   the glow itself is drawn in styles.css (.spotlight:hover).
   ------------------------------------------------------------ */
document.querySelectorAll(".spotlight").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const box = card.getBoundingClientRect();
    card.style.setProperty("--mx", event.clientX - box.left + "px");
    card.style.setProperty("--my", event.clientY - box.top + "px");
  });
});

/* ------------------------------------------------------------
   14. Thesis telemetry demo
   A small simulation of the monitoring idea from my thesis. Each
   metric drifts around a normal value with some noise. Injecting
   a fault moves its target out of range. An alert rule goes
   "pending" as soon as it is breached and only "fires" once it
   has stayed breached for 3 seconds, like a Prometheus rule with
   a `for:` duration. The drone, health ring and charts all react.
   Only runs while the demo is on screen.
   ------------------------------------------------------------ */
const telemetry = document.getElementById("telemetry");

if (telemetry) {
  const TICK_MS = 500;       // one reading every half second (2 Hz)
  const HISTORY = 60;        // 30 seconds of history in each chart
  const FOR_TICKS = 6;       // 3 seconds breached before firing

  // normal: healthy value; fault: where it heads during a fault;
  // noise: random jitter; breached: the alert rule (none for altitude)
  const metrics = {
    battery:  { normal: 92, fault: 9,  noise: 0.15, decimals: 0, rule: "BatteryCritical", limit: 25, breached: (v) => v < 25 },
    temp:     { normal: 42, fault: 86, noise: 0.8,  decimals: 0, rule: "MotorOverheat",   limit: 70, breached: (v) => v > 70 },
    link:     { normal: 88, fault: 14, noise: 2.5,  decimals: 0, rule: "LinkDegraded",    limit: 40, breached: (v) => v < 40 },
    altitude: { normal: 12, fault: 2,  noise: 0.15, decimals: 1, rule: null },
  };
  const faultLabels = { battery: "Battery sag", temp: "Motor overheat", link: "Link loss" };

  const statusEl = document.getElementById("telStatus");
  const logEl = document.getElementById("telLog");
  const clockEl = document.getElementById("telClock");
  const samplesEl = document.getElementById("telSamples");
  const firedEl = document.getElementById("telFired");
  const dronePanel = document.getElementById("dronePanel");
  const healthRing = document.getElementById("healthRing");
  const healthValue = document.getElementById("healthValue");
  const faultButtons = telemetry.querySelectorAll("[data-fault]");

  let elapsed = 0;           // simulated seconds since the demo started
  let samples = 0;
  let alertsFired = 0;
  let health = 100;          // shown value, eases toward the target
  let timer = null;

  Object.entries(metrics).forEach(([name, metric]) => {
    const card = telemetry.querySelector(`[data-metric="${name}"]`);
    metric.card = card;
    metric.valueEl = card.querySelector("[data-value]");
    metric.canvas = card.querySelector("canvas");
    metric.value = metric.normal;
    metric.history = Array(HISTORY).fill(metric.normal);
    metric.faulted = false;
    metric.breachTicks = 0;
    metric.state = "ok";
  });

  // Add an entry to the top of the alert timeline
  function log(badge, text, type) {
    const empty = logEl.querySelector(".telemetry__log-empty");
    if (empty) empty.remove();

    const item = document.createElement("li");
    item.className = "is-" + type;
    item.innerHTML = '<span class="log-badge"></span><span></span><time></time>';
    item.children[0].textContent = badge;
    item.children[1].textContent = text;
    item.children[2].textContent = "t+" + elapsed.toFixed(1) + "s";
    logEl.prepend(item);
  }

  function setMetricState(metric, state) {
    if (metric.state === state) return;
    const previous = metric.state;
    metric.state = state;
    metric.card.dataset.state = state;

    if (state === "pending") {
      log("PENDING", `${metric.rule}: threshold crossed, confirming for 3s`, "pending");
    } else if (state === "firing") {
      alertsFired++;
      const latency = elapsed - metric.faultStartedAt;
      log("FIRING", `${metric.rule}: detected ${latency.toFixed(1)}s after the fault started`, "firing");
    } else if (previous === "firing") {
      log("RESOLVED", `${metric.rule} back within limits`, "resolved");
    }
  }

  function tick() {
    elapsed += TICK_MS / 1000;
    const batteryFault = metrics.battery.faulted;

    Object.entries(metrics).forEach(([name, metric]) => {
      // The drone descends when the battery sags
      const faulted = name === "altitude" ? batteryFault : metric.faulted;
      const target = faulted ? metric.fault : metric.normal;
      metric.value += (target - metric.value) * 0.12 + (Math.random() - 0.5) * 2 * metric.noise;
      metric.history.push(metric.value);
      metric.history.shift();
      metric.valueEl.textContent = metric.value.toFixed(metric.decimals);
      samples++;

      if (!metric.rule) return;
      if (metric.breached(metric.value)) {
        metric.breachTicks++;
        setMetricState(metric, metric.breachTicks >= FOR_TICKS ? "firing" : "pending");
      } else {
        metric.breachTicks = 0;
        setMetricState(metric, "ok");
      }
    });

    updatePanel();
    drawCharts();
  }

  function updatePanel() {
    const states = Object.values(metrics).map((metric) => metric.state);
    const overall = states.includes("firing") ? "firing" : states.includes("pending") ? "pending" : "ok";
    statusEl.dataset.state = overall;
    statusEl.textContent = { ok: "Healthy", pending: "Checking...", firing: "Alert firing" }[overall];
    dronePanel.dataset.state = overall;

    // Health score: lose 12 points per pending rule and 35 per firing one
    const target = Math.max(0, 100 - states.reduce((sum, s) => sum + (s === "firing" ? 35 : s === "pending" ? 12 : 0), 0));
    health += (target - health) * 0.35;
    healthValue.textContent = Math.round(health);
    healthRing.style.strokeDashoffset = 100 - health;

    const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const seconds = String(Math.floor(elapsed % 60)).padStart(2, "0");
    clockEl.textContent = `T+${minutes}:${seconds}`;
    samplesEl.textContent = samples.toLocaleString();
    firedEl.textContent = alertsFired;
  }

  // Turns a CSS colour into the same colour with some transparency
  function withAlpha(color, alpha) {
    const hex = color.replace("#", "");
    if (hex.length !== 6) return color;
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function drawCharts() {
    const style = getComputedStyle(document.documentElement);
    const colors = {
      ok: style.getPropertyValue("--accent").trim(),
      pending: style.getPropertyValue("--warn").trim(),
      firing: style.getPropertyValue("--bad").trim(),
    };
    const mute = style.getPropertyValue("--text-mute").trim();
    const ratio = window.devicePixelRatio || 1;

    Object.values(metrics).forEach((metric) => {
      const canvas = metric.canvas;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width) return;
      if (canvas.width !== Math.round(width * ratio)) {
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
      }
      const ctx = canvas.getContext("2d");
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // Fixed scale per metric so the line doesn't jump around
      const low = Math.min(metric.normal, metric.fault) - 6;
      const high = Math.max(metric.normal, metric.fault) + 6;
      const pad = 6;
      const y = (value) => height - pad - ((value - low) / (high - low)) * (height - pad * 2);
      const x = (index) => (index / (HISTORY - 1)) * (width - 8);
      const color = colors[metric.state] || colors.ok;

      // Faint horizontal grid lines
      ctx.strokeStyle = withAlpha(mute.startsWith("#") ? mute : "#6f7689", 0.15);
      ctx.lineWidth = 1;
      [0.25, 0.5, 0.75].forEach((fraction) => {
        ctx.beginPath();
        ctx.moveTo(0, Math.round(height * fraction) + 0.5);
        ctx.lineTo(width, Math.round(height * fraction) + 0.5);
        ctx.stroke();
      });

      // Dashed line at the alert threshold
      if (metric.rule) {
        ctx.strokeStyle = withAlpha(colors.firing, 0.6);
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, y(metric.limit));
        ctx.lineTo(width, y(metric.limit));
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Line path through the recent history
      const path = new Path2D();
      metric.history.forEach((value, index) => {
        if (index === 0) path.moveTo(x(index), y(value));
        else path.lineTo(x(index), y(value));
      });

      // Gradient fill under the line
      const area = new Path2D(path);
      area.lineTo(x(HISTORY - 1), height);
      area.lineTo(0, height);
      area.closePath();
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, withAlpha(color, 0.32));
      gradient.addColorStop(1, withAlpha(color, 0));
      ctx.fillStyle = gradient;
      ctx.fill(area);

      // The line itself, with a soft glow
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.stroke(path);

      // Glowing dot on the latest reading
      const lastY = y(metric.history[HISTORY - 1]);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x(HISTORY - 1), lastY, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = withAlpha(color, 0.25);
      ctx.beginPath();
      ctx.arc(x(HISTORY - 1), lastY, 7, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  faultButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const fault = button.dataset.fault;
      const metric = metrics[fault];
      if (metric.faulted) return;
      metric.faulted = true;
      metric.faultStartedAt = elapsed;
      button.classList.add("is-active");
      dronePanel.classList.add("fault-" + fault);
      log("FAULT", `Injected: ${faultLabels[fault]}`, "info");
    });
  });

  document.getElementById("telReset").addEventListener("click", () => {
    Object.values(metrics).forEach((metric) => { metric.faulted = false; });
    faultButtons.forEach((button) => button.classList.remove("is-active"));
    dronePanel.classList.remove("fault-battery", "fault-temp", "fault-link");
    log("RESET", "Faults cleared, system recovering", "info");
  });

  // Only run the simulation while the demo is visible
  const telemetryObserver = new IntersectionObserver((entries) => {
    const visible = entries[0].isIntersecting;
    if (visible && !timer) {
      timer = setInterval(tick, TICK_MS);
      tick();
    } else if (!visible && timer) {
      clearInterval(timer);
      timer = null;
    }
  });
  telemetryObserver.observe(telemetry);
  window.addEventListener("resize", drawCharts);
  themeToggle.addEventListener("click", drawCharts); // recolour lines for the new theme
}

/* ------------------------------------------------------------
   15. Recently on GitHub
   A small dashboard built from public data, loaded when the
   section comes into view:
   - my repos from the GitHub API (counts, languages, cards)
   - each featured repo's recent commits (latest message and
     weekly commit bars)
   - the contribution calendar, from a free public API that
     reads GitHub's contribution graph
   Everything is cached for 30 minutes in localStorage so return
   visits don't use up GitHub's limit (60 requests an hour per
   visitor). Each piece fails on its own without breaking the rest.
   ------------------------------------------------------------ */
const ghSection = document.getElementById("gh");
const repoList = document.getElementById("repoList");
const GITHUB_USER = "Dmatt547";
const GH_CACHE_MS = 30 * 60 * 1000;
const FEATURED_REPOS = 5;

// GitHub's own language colours
const LANGUAGE_COLORS = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5", "C#": "#178600",
  HTML: "#e34c26", CSS: "#663399", "C++": "#f34b7d", C: "#555555", Java: "#b07219",
  TeX: "#3D6117", Shell: "#89e051", Kotlin: "#A97BFF", Dart: "#00B4AB", Go: "#00ADD8",
  PHP: "#4F5D95", Vue: "#41b883", Svelte: "#ff3e00", "Jupyter Notebook": "#DA5B0B",
  Swift: "#F05138", Rust: "#dea584", Ruby: "#701516", ShaderLab: "#222c37",
};

// Used when a repo has no description on GitHub yet
const FALLBACK_DESCRIPTIONS = {
  "Personal-Website": "This portfolio: hand-built HTML, CSS and JavaScript, deployed on Netlify.",
  "Job-Application-Tracker": "React + Postgres job tracker fed by a scheduled AI agent.",
  "RAS-monitoring-thesis": "Honours thesis: Prometheus-based health monitoring for remote autonomous systems.",
  "bullion-tracker": "Live gold & silver portfolio tracker with Firebase sync and Chart.js.",
  "Robot-Simulator-API": "ASP.NET Core Web API for controlling a simulated robot.",
};

function languageColor(language) {
  return LANGUAGE_COLORS[language] || "#8b949e";
}

function timeAgo(dateString) {
  const minutes = Math.floor((Date.now() - new Date(dateString)) / 60000);
  if (minutes < 60) return minutes <= 1 ? "just now" : minutes + " minutes ago";
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? "1 hour ago" : hours + " hours ago";
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 30) return days + " days ago";
  const months = Math.floor(days / 30);
  if (months < 12) return months === 1 ? "1 month ago" : months + " months ago";
  const years = Math.floor(months / 12);
  return years === 1 ? "1 year ago" : years + " years ago";
}

// fetch() + JSON with a localStorage cache in front of it
async function cachedJson(key, url) {
  try {
    const cached = JSON.parse(localStorage.getItem(key) || "null");
    if (cached && Date.now() - cached.savedAt < GH_CACHE_MS) return cached.data;
  } catch (e) { /* storage blocked or bad data: just fetch */ }

  const response = await fetch(url);
  if (!response.ok) throw new Error("Status " + response.status);
  const data = await response.json();
  try { localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data })); } catch (e) {}
  return data;
}

// Counts up a headline number, like the About stats
function setGhStat(name, value) {
  const element = ghSection.querySelector(`[data-gh="${name}"]`);
  element.dataset.count = value;
  if (prefersReducedMotion) element.textContent = value;
  else animateCount(element);
}

function renderLanguages(repos) {
  const counts = {};
  repos.forEach((repo) => { if (repo.language) counts[repo.language] = (counts[repo.language] || 0) + 1; });
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  setGhStat("languages", sorted.length);

  const bar = document.getElementById("ghLangBar");
  const legend = document.getElementById("ghLangs");
  sorted.forEach(([language, count]) => {
    const percent = (count / total) * 100;
    const segment = document.createElement("span");
    segment.style.background = languageColor(language);
    segment.title = `${language}: ${Math.round(percent)}%`;
    bar.appendChild(segment);
    requestAnimationFrame(() => requestAnimationFrame(() => { segment.style.width = percent + "%"; }));

    const item = document.createElement("li");
    item.innerHTML = "<i></i><span></span><small></small>";
    item.children[0].style.background = languageColor(language);
    item.children[1].textContent = language;
    item.children[2].textContent = Math.round(percent) + "%";
    legend.appendChild(item);
  });
}

function renderCalendar(contributions) {
  const grid = document.getElementById("ghCalGrid");
  const months = document.getElementById("ghCalMonths");
  const calendar = document.getElementById("ghCalendar");
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Pad the first column so each row is a weekday (Sunday at the top)
  const firstDay = new Date(contributions[0].date + "T00:00:00").getDay();
  const days = Array(firstDay).fill(null).concat(contributions);
  const weeks = Math.ceil(days.length / 7);
  calendar.style.setProperty("--weeks", weeks);

  days.forEach((day, index) => {
    const cell = document.createElement("span");
    cell.className = "gh-cal__cell";
    if (!day) {
      cell.classList.add("gh-cal__cell--pad");
    } else {
      cell.dataset.level = day.level;
      const date = new Date(day.date + "T00:00:00").toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
      cell.title = `${day.count} contribution${day.count === 1 ? "" : "s"} on ${date}`;
      cell.style.setProperty("--d", Math.floor(index / 7) * 12 + "ms"); // ripple left to right
    }
    grid.appendChild(cell);
  });

  // Month label above the first week that starts in a new month
  let lastMonth = -1;
  for (let week = 0; week < weeks; week++) {
    const label = document.createElement("span");
    const day = days[week * 7] || days[week * 7 + 6];
    const month = day ? new Date(day.date + "T00:00:00").getMonth() : lastMonth;
    // Skip the very first column (usually a partial month) and the last two (no room)
    if (month !== lastMonth && week > 0 && week < weeks - 2) label.textContent = monthNames[month];
    lastMonth = month;
    months.appendChild(label);
  }

  calendar.classList.add("is-loaded");
  calendar.scrollLeft = calendar.scrollWidth; // show the most recent weeks on small screens

  // Headline numbers from the calendar
  const total = contributions.reduce((sum, day) => sum + day.count, 0);
  let longest = 0;
  let run = 0;
  contributions.forEach((day) => {
    run = day.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  });
  const busiest = contributions.reduce((best, day) => (day.count > best.count ? day : best), contributions[0]);
  setGhStat("contributions", total);
  setGhStat("streak", longest);
  if (busiest.count > 0) {
    const date = new Date(busiest.date + "T00:00:00").toLocaleDateString("en-AU", { day: "numeric", month: "short" });
    document.getElementById("ghBusiest").textContent = `Busiest day: ${date} (${busiest.count})`;
  }

  // Summary row under the calendar: active days, best month, current streak
  const activeDays = contributions.filter((day) => day.count > 0).length;
  const byMonth = {};
  contributions.forEach((day) => {
    const key = day.date.slice(0, 7); // "2026-09"
    byMonth[key] = (byMonth[key] || 0) + day.count;
  });
  const [bestKey, bestCount] = Object.entries(byMonth).sort((a, b) => b[1] - a[1])[0];
  const bestMonth = monthNames[parseInt(bestKey.slice(5), 10) - 1] + " " + bestKey.slice(0, 4);

  // Current streak counts back from today (or yesterday, if nothing yet today)
  let current = 0;
  let i = contributions.length - 1;
  if (contributions[i].count === 0) i--;
  for (; i >= 0 && contributions[i].count > 0; i--) current++;

  const summary = [
    [activeDays, "active days"],
    [bestMonth, `best month (${bestCount})`],
    [current + (current === 1 ? " day" : " days"), "current streak"],
  ];
  const summaryEl = document.getElementById("ghCalSummary");
  summary.forEach(([value, label]) => {
    const item = document.createElement("div");
    item.innerHTML = "<strong></strong><span></span>";
    item.children[0].textContent = value;
    item.children[1].textContent = label;
    summaryEl.appendChild(item);
  });
}

// Commits per week for the last 12 weeks, oldest first
function weeklyCommits(commits) {
  const weeks = Array(12).fill(0);
  const now = Date.now();
  commits.forEach((commit) => {
    const age = Math.floor((now - new Date(commit.commit.author.date)) / (7 * 86400000));
    if (age >= 0 && age < 12) weeks[11 - age]++;
  });
  return weeks;
}

const REPO_ICON = '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.71 1.71.75.75 0 0 1-1.06 1.06A2.49 2.49 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.71A2.49 2.49 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.09a.25.25 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"/></svg>';
const COMMIT_ICON = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3.5"/><path d="M2 12h6.5M15.5 12H22" stroke-linecap="round"/></svg>';

function renderRepoCard(repo, commits, featured) {
  const card = document.createElement("a");
  card.className = "repo spotlight" + (featured ? " repo--featured" : "");
  card.href = repo.html_url;
  card.target = "_blank";
  card.rel = "noopener";
  card.style.setProperty("--lang", languageColor(repo.language));

  card.innerHTML =
    `<div class="repo__top">${REPO_ICON}<span class="repo__name"></span></div>` +
    '<p class="repo__desc"></p>' +
    '<div class="repo__spark"><div class="repo__spark-bars"></div><span class="repo__spark-label"></span></div>' +
    '<div class="repo__meta"><span class="repo__lang"></span><span class="repo__commits"></span><span class="repo__updated"></span></div>';

  card.querySelector(".repo__name").textContent = repo.name;
  if (featured) card.querySelector(".repo__top").insertAdjacentHTML("beforeend", '<span class="repo__badge">Latest push</span>');

  const desc = card.querySelector(".repo__desc");
  const description = repo.description || FALLBACK_DESCRIPTIONS[repo.name];
  if (description) desc.textContent = description;
  else { desc.textContent = "No description yet."; desc.classList.add("repo__desc--empty"); }

  // Featured card: show the latest commit message
  if (featured && commits && commits.length) {
    const latest = commits[0];
    const row = document.createElement("div");
    row.className = "repo__commit";
    row.innerHTML = COMMIT_ICON + "<code></code><time></time>";
    row.querySelector("code").textContent = latest.commit.message.split("\n")[0];
    row.querySelector("time").textContent = timeAgo(latest.commit.author.date);
    desc.after(row);
  }

  // Weekly commit bars (or remove the chart if commits didn't load)
  const spark = card.querySelector(".repo__spark");
  if (commits) {
    const weeks = weeklyCommits(commits);
    const max = Math.max(...weeks, 1);
    const bars = spark.querySelector(".repo__spark-bars");
    weeks.forEach((count, index) => {
      const bar = document.createElement("span");
      bar.style.height = Math.max((count / max) * 100, 6) + "%";
      bar.style.setProperty("--d", index * 40 + "ms");
      bar.title = `${count} commit${count === 1 ? "" : "s"}`;
      if (count === 0) bar.classList.add("is-zero");
      bars.appendChild(bar);
    });
    const recent = weeks.reduce((a, b) => a + b, 0);
    spark.querySelector(".repo__spark-label").textContent =
      recent ? `${recent} commit${recent === 1 ? "" : "s"} in the last 12 weeks` : "Quiet for the last 12 weeks";
    card.querySelector(".repo__commits").textContent = (commits.length >= 100 ? "100+" : commits.length) + " commits";
  } else {
    spark.remove();
    card.querySelector(".repo__commits").remove();
  }

  const lang = card.querySelector(".repo__lang");
  if (repo.language) lang.textContent = repo.language;
  else lang.remove();
  card.querySelector(".repo__updated").textContent = "Updated " + timeAgo(repo.pushed_at);

  card.addEventListener("pointermove", (event) => {
    const box = card.getBoundingClientRect();
    card.style.setProperty("--mx", event.clientX - box.left + "px");
    card.style.setProperty("--my", event.clientY - box.top + "px");
  });
  return card;
}

async function loadGitHub() {
  // Contribution calendar (separate service, so it can fail on its own)
  cachedJson("gh-calendar", `https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`)
    .then((data) => renderCalendar(data.contributions))
    .catch(() => { document.querySelector(".gh-panel--calendar").hidden = true; });

  try {
    const allRepos = await cachedJson("gh-repos", `https://api.github.com/users/${GITHUB_USER}/repos?sort=pushed&per_page=100`);
    const repos = allRepos.filter((repo) => !repo.fork && repo.name !== GITHUB_USER); // skip forks and the profile README repo
    if (repos.length === 0) throw new Error("No repos");

    setGhStat("repos", repos.length);
    renderLanguages(repos);

    // Recent commits for each featured repo, all at once
    const featured = repos.slice(0, FEATURED_REPOS);
    const commitLists = await Promise.all(featured.map((repo) =>
      cachedJson("gh-commits-" + repo.name, `https://api.github.com/repos/${GITHUB_USER}/${repo.name}/commits?per_page=100`)
        .catch(() => null)
    ));

    repoList.innerHTML = "";
    featured.forEach((repo, index) => repoList.appendChild(renderRepoCard(repo, commitLists[index], index === 0)));
  } catch (err) {
    repoList.innerHTML =
      '<p class="repos__note">Couldn\'t load GitHub right now. ' +
      '<a href="https://github.com/' + GITHUB_USER + '" target="_blank" rel="noopener">See my repos on GitHub &#8594;</a></p>';
    ghSection.querySelector(".gh__stats").style.display = "none";
  }
}

if (ghSection) {
  const ghObserver = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    ghObserver.disconnect(); // only load once
    loadGitHub();
  }, { rootMargin: "300px" });
  ghObserver.observe(ghSection);
}

/* ------------------------------------------------------------
   16. Hover clips
   Any .project__media with a data-video attribute plays that
   short muted clip while the card is hovered. The video is only
   created (and downloaded) on the first hover. Skipped on touch
   screens and for people who prefer reduced motion.
   ------------------------------------------------------------ */
const canHover = window.matchMedia("(hover: hover)").matches;

if (canHover && !prefersReducedMotion) {
  document.querySelectorAll(".project__media[data-video]").forEach((media) => {
    const project = media.closest(".project");
    let video = null;

    project.addEventListener("mouseenter", () => {
      if (!video) {
        video = document.createElement("video");
        video.src = media.dataset.video;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.setAttribute("aria-hidden", "true");
        media.appendChild(video);
      }
      video.play().then(() => media.classList.add("is-playing")).catch(() => {});
    });

    project.addEventListener("mouseleave", () => {
      if (!video) return;
      media.classList.remove("is-playing");
      video.pause();
      video.currentTime = 0;
    });
  });
}

/* ------------------------------------------------------------
   17. Live details
   Small touches that make the page feel live, all worked out
   from real data rather than hard-coded:
   - Melbourne local time (contact strip)
   - timeline badges and internship progress, from the dates
     on each .timeline__item
   - how many projects use each skill, counted from the tags
     on the project cards
   - a "Live" badge on projects with a live demo
   - build stats for this page, measured in the browser
   - when I last pushed to GitHub (shares section 15's cache)
   ------------------------------------------------------------ */
const DAY_MS = 86400000;

// --- Melbourne clock ---
const melbourneTime = new Intl.DateTimeFormat("en-AU", {
  timeZone: "Australia/Melbourne", hour: "numeric", minute: "2-digit", timeZoneName: "short",
});
const contactClock = document.getElementById("contactClock");

function updateClocks() {
  const time = melbourneTime.format(new Date()); // e.g. "2:32 pm AEDT"
  if (contactClock) contactClock.textContent = `It's ${time} in Melbourne`;
}
updateClocks();
setInterval(updateClocks, 30000);

// --- Timeline badges + progress ---
function parseDay(value) {
  return new Date(value + "T00:00:00");
}

const today = new Date();

document.querySelectorAll(".timeline__item[data-start]").forEach((item) => {
  const start = parseDay(item.dataset.start);
  const end = item.dataset.end ? parseDay(item.dataset.end) : null;
  const badge = document.createElement("span");
  badge.className = "timeline__badge";

  if (today < start) {
    const days = Math.ceil((start - today) / DAY_MS);
    badge.classList.add("timeline__badge--upcoming");
    badge.textContent = days === 1 ? "Starts tomorrow" : `Starts in ${days} days`;
    item.classList.add("is-upcoming");
  } else if (!end || today < end) {
    badge.classList.add("timeline__badge--now");
    badge.innerHTML = '<span class="pulse-dot"></span>Now';
    item.classList.add("is-now");

    // Progress bar through the role, e.g. the internship
    if ("progress" in item.dataset && end) {
      const total = Math.round((end - start) / DAY_MS);
      const done = Math.min(Math.floor((today - start) / DAY_MS) + 1, total);
      const left = total - done;
      const progress = document.createElement("div");
      progress.className = "timeline__progress";
      progress.innerHTML = '<div class="timeline__bar"><span></span></div><small><span></span><span></span></small>';
      progress.querySelector("small span:first-child").textContent = `Day ${done} of ${total}`;
      progress.querySelector("small span:last-child").textContent = `${left} day${left === 1 ? "" : "s"} to go`;
      item.appendChild(progress);

      // Fill the bar when it scrolls into view
      const fill = progress.querySelector(".timeline__bar span");
      new IntersectionObserver((entries, observer) => {
        if (!entries[0].isIntersecting) return;
        fill.style.width = (done / total) * 100 + "%";
        observer.disconnect();
      }).observe(progress);
    }
  } else {
    return; // finished roles get no badge
  }

  item.prepend(badge);
});


// --- Skill usage counts ---
// Skill names that are written differently on the project cards
const SKILL_ALIASES = {
  "REST APIs": ["REST"],
  "AWS IoT": ["AWS"],
  "Agile / Scrum": ["Agile"],
  "PostgreSQL": ["Supabase"],
};

function normaliseTag(text) {
  return text.toLowerCase().replace(/[^a-z0-9#+]/g, "");
}

// Every project's tags (card tags + case study tags), as normalised sets
const projectTagSets = [...projectCards].map((project) => ({
  name: project.querySelector(".project__title").textContent.trim(),
  tags: new Set([...project.querySelectorAll(".project__tags span, .case__tags span")].map((tag) => normaliseTag(tag.textContent))),
}));

let anySkillUsed = false;
document.querySelectorAll(".skill-group").forEach((group) => {
  const tags = group.querySelectorAll(".tag");
  group.querySelector(".skill-group__count").textContent = tags.length + " skills";

  tags.forEach((tag) => {
    const label = tag.textContent.trim();
    const names = (SKILL_ALIASES[label] || []).concat(label.split("/"));
    const keys = names.map(normaliseTag).filter(Boolean);
    const usedIn = projectTagSets.filter((project) => keys.some((key) => project.tags.has(key)));
    if (usedIn.length === 0) return;

    anySkillUsed = true;
    const uses = document.createElement("span");
    uses.className = "tag__uses";
    uses.textContent = "×" + usedIn.length;
    tag.appendChild(uses);
    tag.title = "Used in: " + usedIn.map((project) => project.name).join(", ");
  });
});

if (anySkillUsed) {
  const note = document.createElement("p");
  note.className = "skills__note";
  note.textContent = "×N = how many of the projects below use it. Hover a skill to see which.";
  document.querySelector(".skills").after(note);
}

// --- "Live" badge on projects with a live demo ---
projectCards.forEach((project) => {
  const hasDemo = [...project.querySelectorAll(".project__links a")].some((link) => /live demo/i.test(link.textContent));
  if (!hasDemo) return;
  const badge = document.createElement("span");
  badge.className = "project__live";
  badge.innerHTML = '<span class="pulse-dot"></span>Live';
  project.querySelector(".project__media").appendChild(badge);
});

// --- Build stats for this page ---
const buildCard = document.querySelector(".build");

function setBuildStat(name, value) {
  const element = buildCard.querySelector(`[data-build="${name}"]`);
  element.dataset.count = value;
  if (prefersReducedMotion) element.textContent = value;
  else animateCount(element);
}

function measurePage() {
  const navEntry = performance.getEntriesByType("navigation")[0];
  const resources = performance.getEntriesByType("resource");
  if (!navEntry) return;

  setBuildStat("load", Math.round(navEntry.loadEventEnd || navEntry.domContentLoadedEventEnd));
  setBuildStat("requests", resources.length + 1);

  // transferSize is 0 for files served from the browser cache, so fall back to file sizes
  const entries = [navEntry, ...resources];
  let bytes = entries.reduce((sum, entry) => sum + (entry.transferSize || 0), 0);
  if (bytes < 2000) {
    bytes = entries.reduce((sum, entry) => sum + (entry.encodedBodySize || 0), 0);
    buildCard.querySelector('[data-build="weight"] + span').textContent = "KB page weight";
  }
  setBuildStat("weight", Math.round(bytes / 1024));
}

// Count the lines in this site's own source files
async function countLines() {
  const files = [
    { language: "HTML", paths: ["index.html", "404.html"] },
    { language: "CSS", paths: ["styles.css"] },
    { language: "JavaScript", paths: ["main.js"] },
  ];
  const counts = await Promise.all(files.map(async (file) => {
    const texts = await Promise.all(file.paths.map((path) =>
      fetch(path).then((response) => (response.ok ? response.text() : "")).catch(() => "")
    ));
    return { language: file.language, lines: texts.reduce((sum, text) => sum + (text ? text.split("\n").length : 0), 0) };
  }));

  const total = counts.reduce((sum, file) => sum + file.lines, 0);
  if (!total) return;
  setBuildStat("lines", total);

  const bar = document.getElementById("locBar");
  const legend = document.getElementById("locLegend");
  counts.forEach(({ language, lines }) => {
    const segment = document.createElement("span");
    segment.style.background = languageColor(language);
    segment.title = `${language}: ${lines.toLocaleString()} lines`;
    bar.appendChild(segment);
    requestAnimationFrame(() => requestAnimationFrame(() => { segment.style.width = (lines / total) * 100 + "%"; }));

    const item = document.createElement("li");
    item.innerHTML = "<i></i><span></span><small></small>";
    item.children[0].style.background = languageColor(language);
    item.children[1].textContent = language;
    item.children[2].textContent = lines.toLocaleString();
    legend.appendChild(item);
  });
}

if (buildCard) {
  const buildObserver = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    buildObserver.disconnect();
    if (document.readyState === "complete") measurePage();
    else window.addEventListener("load", () => setTimeout(measurePage, 0), { once: true });
    countLines();
  }, { rootMargin: "200px" });
  buildObserver.observe(buildCard);
}

// --- Last push to this site's repo (build card, footer) ---
cachedJson("gh-repos", `https://api.github.com/users/${GITHUB_USER}/repos?sort=pushed&per_page=100`)
  .then((repos) => {
    const site = repos.find((repo) => repo.name === "Personal-Website");
    if (site) {
      document.getElementById("buildDeploy").textContent = `Last updated ${timeAgo(site.pushed_at)} · GitHub → Netlify`;
      document.getElementById("footerUpdated").textContent = `Last updated ${timeAgo(site.pushed_at)}`;
    }
  })
  .catch(() => {
    document.getElementById("buildDeploy").textContent = "Deployed from GitHub to Netlify";
  });
