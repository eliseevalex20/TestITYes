// Course page: renders the course chosen via ?course=python|django|data,
// then wires the accordion and the roadmap connectors.
import { COURSES, DEFAULT_COURSE } from "./course-data.js";

const keys = Object.keys(COURSES);
const requested = new URLSearchParams(location.search).get("course");
const key = keys.includes(requested) ? requested : DEFAULT_COURSE;
const course = COURSES[key];
const pad = (n) => String(n).padStart(2, "0");
const $ = (id) => document.getElementById(id);

/* ---------- Render ---------- */
document.title = `${course.name} — ITYes`;
$("c-name").textContent = course.name;
$("c-sub").textContent = course.sub;
$("c-index").textContent = `${pad(keys.indexOf(key) + 1)} / ${pad(keys.length)}`;
$("c-card-name").textContent = course.name;
const total = course.modules.reduce((n, m) => n + m.lessons.length, 0);
$("c-card-meta").textContent = `${course.modules.length} модулів (${total} занять)`;

$("c-list").innerHTML = keys
  .map((k) => {
    const active = k === key;
    return `<li${active ? ' class="is-active"' : ""}><a href="course.html?course=${k}"${active ? ' aria-current="page"' : ""}>${COURSES[k].name}</a></li>`;
  })
  .join("");
$("c-fill").style.width = `${((keys.indexOf(key) + 1) / keys.length) * 100}%`;

$("c-road").innerHTML = course.nodes
  .map(
    (n, i) =>
      `<li class="cx-road-step${i === course.nodes.length - 1 ? " cx-road-step--final" : ""}"><div class="cx-road-box"><p>${n}</p><span class="cx-road-num">${i + 1}</span></div></li>`
  )
  .join("");

let lessonNo = 0;
$("c-acc").innerHTML = course.modules
  .map((m, i) => {
    const lessons = m.lessons
      .map((t) => `<li><span class="cx-lesson-num">${++lessonNo}.</span>${t}</li>`)
      .join("");
    return `
    <div class="cx-acc-item">
      <h3><button type="button" class="cx-acc-btn" aria-expanded="false" aria-controls="m${i}" id="b${i}">
        <span class="cx-acc-num">${pad(i + 1)}</span><span class="cx-acc-text">${m.title}</span><span class="cx-acc-chev" aria-hidden="true"></span>
      </button></h3>
      <div class="cx-acc-panel" id="m${i}" role="region" aria-labelledby="b${i}"><div>
        <ul>${lessons}</ul>
      </div></div>
    </div>`;
  })
  .join("");

/* ---------- Accordion (one open at a time) ---------- */
const accButtons = [...document.querySelectorAll(".cx-acc-btn")];
accButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") === "true";
    accButtons.forEach((b) => {
      b.setAttribute("aria-expanded", "false");
      b.closest(".cx-acc-item").classList.remove("is-open");
    });
    if (!open) {
      btn.setAttribute("aria-expanded", "true");
      btn.closest(".cx-acc-item").classList.add("is-open");
    }
  });
});

/* ---------- Roadmap ---------- */
const board = document.querySelector(".cx-road-board");
const svg = document.querySelector(".cx-road-lines");
const steps = [...document.querySelectorAll(".cx-road-step")];
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (board && svg && steps.length > 1) {
  const NS = "http://www.w3.org/2000/svg";
  const HEAD = 6;
  const HALF = 3.5;
  const SPEED = 0.45; // px per ms

  let connectors = [];
  let lit = 0;

  const triangle = (x, y, dir) => {
    const base = dir === "down" ? y - HEAD : y + HEAD;
    return `M ${x - HALF} ${base} L ${x} ${y} L ${x + HALF} ${base} Z`;
  };

  const markDrawn = (c) => {
    c.path.style.transition = "none";
    c.path.style.strokeDashoffset = "0";
    c.head.style.transition = "none";
    c.head.style.opacity = "1";
  };

  function layout() {
    const b = board.getBoundingClientRect();
    svg.setAttribute("viewBox", `0 0 ${b.width} ${b.height}`);
    svg.setAttribute("width", String(b.width));
    svg.setAttribute("height", String(b.height));

    const stacked = window.matchMedia("(max-width: 960px)").matches;
    const boxes = steps.map((s) => {
      const r = s.querySelector(".cx-road-box").getBoundingClientRect();
      return {
        right: r.right - b.left,
        top: r.top - b.top,
        bottom: r.bottom - b.top,
        cx: r.left - b.left + r.width / 2,
        cy: r.top - b.top + r.height / 2,
      };
    });

    svg.replaceChildren();
    const defs = document.createElementNS(NS, "defs");
    defs.innerHTML = `<filter id="cx-glow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="2.4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>`;
    const baseG = document.createElementNS(NS, "g");
    const litG = document.createElementNS(NS, "g");
    svg.append(defs, baseG, litG);

    connectors = [];
    boxes.slice(0, -1).forEach((from, i) => {
      const to = boxes[i + 1];
      let d, headD;
      if (stacked) {
        d = `M ${from.cx} ${from.bottom} V ${to.top - HEAD}`;
        headD = triangle(from.cx, to.top, "down");
      } else {
        const down = to.cy > from.cy;
        const endY = down ? to.top : to.bottom;
        const lineEndY = down ? endY - HEAD : endY + HEAD;
        d = `M ${from.right} ${from.cy} H ${to.cx} V ${lineEndY}`;
        headD = triangle(to.cx, endY, down ? "down" : "up");
      }

      const mk = (dAttr, attrs, parent) => {
        const p = document.createElementNS(NS, "path");
        p.setAttribute("d", dAttr);
        Object.entries(attrs).forEach(([k, v]) => p.setAttribute(k, v));
        parent.append(p);
        return p;
      };

      mk(d, { fill: "none", stroke: "rgba(244,244,245,.75)", "stroke-width": 1 }, baseG);
      mk(headD, { fill: "rgba(244,244,245,.9)" }, baseG);

      const path = mk(d, { fill: "none", stroke: "#00E5FF", "stroke-width": 1.5, filter: "url(#cx-glow)" }, litG);
      const len = path.getTotalLength();
      path.style.strokeDasharray = String(len);
      path.style.strokeDashoffset = String(len);
      const head = mk(headD, { fill: "#00E5FF", filter: "url(#cx-glow)" }, litG);
      head.style.opacity = "0";
      connectors.push({ path, head, len });
    });

    connectors.forEach((c, i) => { if (i < lit - 1) markDrawn(c); });
  }

  function reveal() {
    if (reduce) {
      steps.forEach((s) => s.classList.add("is-in"));
      lit = steps.length;
      connectors.forEach(markDrawn);
      return;
    }
    const run = (n) => {
      steps[n].classList.add("is-in");
      lit = n + 1;
      if (n >= steps.length - 1) return;
      const c = connectors[n];
      const dur = Math.max(350, c.len / SPEED);
      c.path.style.transition = `stroke-dashoffset ${dur}ms linear`;
      c.path.getBoundingClientRect(); // force reflow so the transition runs
      c.path.style.strokeDashoffset = "0";
      setTimeout(() => {
        const cur = connectors[n];
        cur.head.style.transition = "opacity .15s ease";
        cur.head.style.opacity = "1";
        markDrawn(cur);
        run(n + 1);
      }, dur + 60);
    };
    setTimeout(() => run(0), 250);
  }

  layout();
  window.addEventListener("load", layout);

  let timer;
  window.addEventListener("resize", () => {
    clearTimeout(timer);
    timer = setTimeout(layout, 120);
  });

  let started = false;
  const io = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting || started) return;
      started = true;
      reveal();
      io.disconnect();
    },
    { threshold: 0.35 }
  );
  io.observe(board);
}