/* ===== navigation.js ===== */
(() => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("main-nav");
  if (!toggle || !nav) return;

  toggle.innerHTML = '<span class="burger" aria-hidden="true"><i></i><i></i><i></i></span>';
  toggle.setAttribute("aria-label", "Відкрити меню");

  // кнопка «Записатися» внутри меню (берёт ссылку из шапки)
  const headerCta = document.querySelector(".header-cta");
  if (headerCta) {
    const cta = document.createElement("a");
    cta.className = "btn btn-orange nav-cta";
    cta.href = headerCta.getAttribute("href");
    cta.textContent = headerCta.textContent.trim();
    nav.append(cta);
  }

  const setOpen = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Закрити меню" : "Відкрити меню");
    document.documentElement.classList.toggle("menu-open", open);
  };

  toggle.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  window.matchMedia("(max-width: 960px)").addEventListener("change", (e) => { if (!e.matches) setOpen(false); });
})();

/* ===== path.js ===== */
(() => {
// Learning path connectors and reveal animation
const pathBoard = document.querySelector(".path-board");
    const pathSvg = document.querySelector(".path-lines");
    const pathSteps = [...document.querySelectorAll(".path-step")];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* --- path v3: стрелки буквой Г --- */
/* path.js — подключать ПОСЛЕ основного inline-скрипта в index.html.
   Переопределяет layoutPathLines() и revealPath(). */

const PL_NS = "http://www.w3.org/2000/svg";
const PL_HEAD = 6;        // длина наконечника стрелки
const PL_HALF = 3.5;      // половина ширины наконечника
const PL_SPEED = 0.45;    // скорость «тока», px/мс

let plConnectors = [];
let plStep = 0;           // сколько шагов уже загорелось

function plTriangle(x, y, dir) {
  // dir: "down" | "up"
  const base = dir === "down" ? y - PL_HEAD : y + PL_HEAD;
  return `M ${x - PL_HALF} ${base} L ${x} ${y} L ${x + PL_HALF} ${base} Z`;
}

function plMarkDrawn(c) {
  if (!c) return;
  c.path.style.transition = "none";
  c.path.style.strokeDashoffset = "0";
  c.head.style.transition = "none";
  c.head.style.opacity = "1";
}

function layoutPathLines() {
  if (!pathBoard || !pathSvg || pathSteps.length < 2) return;

  const board = pathBoard.getBoundingClientRect();
  pathSvg.setAttribute("viewBox", `0 0 ${board.width} ${board.height}`);
  pathSvg.setAttribute("width", String(board.width));
  pathSvg.setAttribute("height", String(board.height));

  const stacked = window.matchMedia("(max-width: 960px)").matches;

  const boxes = pathSteps.map((step) => {
    const r = step.querySelector(".path-box").getBoundingClientRect();
    return {
      left: r.left - board.left,
      right: r.right - board.left,
      top: r.top - board.top,
      bottom: r.bottom - board.top,
      cx: r.left - board.left + r.width / 2,
      cy: r.top - board.top + r.height / 2,
    };
  });

  pathSvg.replaceChildren();

  const defs = document.createElementNS(PL_NS, "defs");
  defs.innerHTML = `
    <filter id="path-glow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="2.4" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>`;
  pathSvg.append(defs);

  const baseGroup = document.createElementNS(PL_NS, "g");
  const litGroup = document.createElementNS(PL_NS, "g");
  pathSvg.append(baseGroup, litGroup);

  plConnectors = [];

  boxes.slice(0, -1).forEach((from, i) => {
    const to = boxes[i + 1];
    let d, headD;

    if (stacked) {
      const x = from.cx;
      d = `M ${x} ${from.bottom} V ${to.top - PL_HEAD}`;
      headD = plTriangle(x, to.top, "down");
    } else {
      // из правого края блока (от квадратика с цифрой) -> по центру следующего блока
      const down = to.cy > from.cy;
      const endY = down ? to.top : to.bottom;
      const lineEndY = down ? endY - PL_HEAD : endY + PL_HEAD;
      d = `M ${from.right} ${from.cy} H ${to.cx} V ${lineEndY}`;
      headD = plTriangle(to.cx, endY, down ? "down" : "up");
    }

    // серая «выключенная» стрелка
    const basePath = document.createElementNS(PL_NS, "path");
    basePath.setAttribute("d", d);
    basePath.setAttribute("fill", "none");
    basePath.setAttribute("stroke", "rgba(244,244,245,0.7)");
    basePath.setAttribute("stroke-width", "1");
    const baseHead = document.createElementNS(PL_NS, "path");
    baseHead.setAttribute("d", headD);
    baseHead.setAttribute("fill", "rgba(244,244,245,0.85)");
    baseGroup.append(basePath, baseHead);

    // голубой «ток», который бежит по стрелке
    const path = document.createElementNS(PL_NS, "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#00E5FF");
    path.setAttribute("stroke-width", "1.5");
    path.setAttribute("filter", "url(#path-glow)");
    litGroup.append(path);
    const len = path.getTotalLength();
    path.style.strokeDasharray = String(len);
    path.style.strokeDashoffset = String(len);

    const head = document.createElementNS(PL_NS, "path");
    head.setAttribute("d", headD);
    head.setAttribute("fill", "#00E5FF");
    head.setAttribute("filter", "url(#path-glow)");
    head.style.opacity = "0";
    litGroup.append(head);

    plConnectors.push({ path, head, len });
  });

  // после resize восстанавливаем уже пройденные стрелки
  plConnectors.forEach((c, i) => {
    if (i < plStep - 1) plMarkDrawn(c);
  });
}

function revealPath() {
  const total = pathSteps.length;

  if (reduceMotion) {
    pathSteps.forEach((s) => s.classList.add("is-in"));
    plStep = total;
    plConnectors.forEach(plMarkDrawn);
    return;
  }

  const run = (n) => {
    pathSteps[n].classList.add("is-in"); // загорается квадратик с цифрой
    plStep = n + 1;
    if (n >= total - 1) return;          // последний блок загорелся — конец

    const c = plConnectors[n];
    const dur = Math.max(350, c.len / PL_SPEED);
    c.path.style.transition = `stroke-dashoffset ${dur}ms linear`;
    c.path.getBoundingClientRect();      // reflow, чтобы transition сработал
    c.path.style.strokeDashoffset = "0";

    window.setTimeout(() => {
      // берём актуальный connector (мог пересоздаться при resize)
      const cur = plConnectors[n];
      cur.head.style.transition = "opacity 0.15s ease";
      cur.head.style.opacity = "1";
      plMarkDrawn(cur);
      run(n + 1);
    }, dur + 60);
  };

  window.setTimeout(() => run(0), 250);
}
    console.log("path v3 loaded");

    let pathDrawn = false;
    let resizeTimer;

    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        const wasVisible = pathDrawn;
        layoutPathLines();
        if (wasVisible) {
          pathSvg.querySelectorAll(".path-connector").forEach((line) => {
            line.classList.add("is-drawn");
          });
        }
      }, 120);
    });


    if (pathBoard) {
      layoutPathLines();
      window.addEventListener("load", () => {
        layoutPathLines();
        if (pathDrawn) {
          pathSvg.querySelectorAll(".path-connector").forEach((line) => {
            line.classList.add("is-drawn");
          });
        }
      });
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting || pathDrawn) return;
          pathDrawn = true;
          revealPath();
          observer.disconnect();
        },
        { threshold: 0.35 }
      );
      observer.observe(pathBoard);
    }
})();

/* ===== cursor.js ===== */
(() => {
// Custom cursor for fine-pointer devices
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cursor = document.querySelector(".cursor");
    const cursorDot = document.querySelector(".cursor-dot");
    const cursorRing = document.querySelector(".cursor-ring");

    if (finePointer && cursor && !reduceMotion) {
      document.documentElement.classList.add("has-cursor");
      let mouseX = 0;
      let mouseY = 0;
      let ringX = 0;
      let ringY = 0;
      let ticking = false;

      document.addEventListener("mousemove", (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
        cursor.classList.add("is-visible");
        cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(followCursor);
        }
      });

      document.addEventListener("mousedown", () => cursor.classList.add("is-down"));
      document.addEventListener("mouseup", () => cursor.classList.remove("is-down"));

      document.querySelectorAll("a, button, .course-card, .offer-card").forEach((el) => {
        el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
        el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
      });

      function followCursor() {
        ringX += (mouseX - ringX) * 0.18;
        ringY += (mouseY - ringY) * 0.18;
        cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`;
        if (Math.abs(mouseX - ringX) > 0.2 || Math.abs(mouseY - ringY) > 0.2) {
          requestAnimationFrame(followCursor);
        } else {
          ticking = false;
        }
      }
    }
})();

/* ===== reveal.js ===== */
(() => {
// Reveal elements when they enter the viewport
const revealItems = document.querySelectorAll(".reveal");
    if (revealItems.length) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-revealed");
            revealObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
      );
      revealItems.forEach((item, index) => {
        item.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 70}ms`);
        revealObserver.observe(item);
      });
    }
})();

/* ===== result-flow.js ===== */
(() => {
// Result block: current fills a box frame, flows along the arrow into the next box, in a loop.
// Desktop: SVG "current". Compact (<=960px): boxes simply light up one after another, no arrows.
const resultFlow = document.querySelector(".result-flow");

if (resultFlow && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const NS = "http://www.w3.org/2000/svg";
  const boxes = [...resultFlow.querySelectorAll(".result-box")];
  const compactMq = window.matchMedia("(max-width: 960px)");

  const SPEED = 0.6;  // px per ms — speed of the current
  const DWELL = 900;  // compact mode: how long a box stays lit
  const GAP = 250;    // compact mode: pause between boxes

  // path: 1→2→3 ↓ 6→5→4 ↑ back to 1 (where the current enters / leaves each box)
  const circle = [
    { box: 0, enter: "bottom", exit: "right" },
    { box: 1, enter: "left", exit: "right" },
    { box: 2, enter: "left", exit: "bottom" },
    { box: 5, enter: "top", exit: "left" },
    { box: 4, enter: "right", exit: "left" },
    { box: 3, enter: "right", exit: "top" },
  ];

  resultFlow.style.position = "relative";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("aria-hidden", "true");
  svg.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;z-index:2;" +
    "filter:drop-shadow(0 0 4px rgba(0,229,255,.9));";
  resultFlow.append(svg);

  let token = 0;
  let timer = 0;
  let visible = false;

  const mod = (a, p) => ((a % p) + p) % p;
  const sleep = (ms) => new Promise((r) => (timer = window.setTimeout(r, ms)));

  // ---------- geometry ----------
  function measure() {
    const fr = resultFlow.getBoundingClientRect();
    svg.setAttribute("viewBox", `0 0 ${fr.width} ${fr.height}`);
    return boxes.map((b) => {
      const r = b.getBoundingClientRect();
      return { x: r.left - fr.left + 0.5, y: r.top - fr.top + 0.5, w: r.width - 1, h: r.height - 1 };
    });
  }

  function pointAt(r, s) {
    const P = 2 * (r.w + r.h);
    s = mod(s, P);
    if (s <= r.w) return [r.x + s, r.y];
    s -= r.w;
    if (s <= r.h) return [r.x + r.w, r.y + s];
    s -= r.h;
    if (s <= r.w) return [r.x + r.w - s, r.y + r.h];
    s -= r.w;
    return [r.x, r.y + r.h - s];
  }

  function sidePos(r, side) {
    return { top: r.w / 2, right: r.w + r.h / 2, bottom: r.w + r.h + r.w / 2, left: 2 * r.w + r.h + r.h / 2 }[side];
  }

  // path along the frame from s0, direction dir (+1 clockwise / -1 counter), length L
  function arcD(r, s0, dir, L) {
    const P = 2 * (r.w + r.h);
    const corners = [0, r.w, r.w + r.h, 2 * r.w + r.h];
    const pts = [[0, pointAt(r, s0)], [L, pointAt(r, s0 + dir * L)]];
    corners.forEach((c) => {
      const d = dir > 0 ? mod(c - s0, P) : mod(s0 - c, P);
      if (d > 0.01 && d < L - 0.01) pts.push([d, pointAt(r, c)]);
    });
    pts.sort((a, b) => a[0] - b[0]);
    return "M " + pts.map((p) => p[1].join(" ")).join(" L ");
  }

  // ---------- drawing ----------
  function drawPath(group, d) {
    const p = document.createElementNS(NS, "path");
    p.setAttribute("d", d);
    p.setAttribute("fill", "none");
    p.setAttribute("stroke", "#00E5FF");
    p.setAttribute("stroke-width", "1.5");
    group.append(p);
    const len = p.getTotalLength();
    p.style.strokeDasharray = String(len);
    p.style.strokeDashoffset = String(len);
    return p.animate(
      [{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
      { duration: Math.max(1, len / SPEED), easing: "linear", fill: "forwards" }
    ).finished;
  }

  function fillFrame(group, r, step) {
    const P = 2 * (r.w + r.h);
    const sE = sidePos(r, step.enter);
    const sX = sidePos(r, step.exit);
    const cw = mod(sX - sE, P);
    // two fronts leave the entry point in both directions and meet at the exit point
    return Promise.all([
      drawPath(group, arcD(r, sE, 1, cw)),
      drawPath(group, arcD(r, sE, -1, P - cw)),
    ]);
  }

  function fadeOut(group) {
    group.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, fill: "forwards" })
      .finished.then(() => group.remove()).catch(() => {});
  }

  // ---------- loops ----------
  async function loopDesktop(my) {
    const rects = measure();
    let prev = null;
    let n = 0;
    while (my === token) {
      const cur = circle[n];
      const next = circle[(n + 1) % circle.length];
      const g = document.createElementNS(NS, "g");
      svg.append(g);

      await fillFrame(g, rects[cur.box], cur);
      if (my !== token) return;
      boxes[cur.box].classList.add("is-active");
      if (prev) {
        fadeOut(prev.g);
        boxes[prev.box].classList.remove("is-active");
      }

      const a = pointAt(rects[cur.box], sidePos(rects[cur.box], cur.exit));
      const b = pointAt(rects[next.box], sidePos(rects[next.box], next.enter));
      await drawPath(g, `M ${a.join(" ")} L ${b.join(" ")}`);
      if (my !== token) return;

      prev = { g, box: cur.box };
      n = (n + 1) % circle.length;
    }
  }

  async function loopCompact(my) {
    let n = 0;
    while (my === token) {
      boxes[n].classList.add("is-active");
      await sleep(DWELL);
      if (my !== token) return;
      boxes[n].classList.remove("is-active");
      await sleep(GAP);
      n = (n + 1) % boxes.length;
    }
  }

  function reset() {
    token++;
    window.clearTimeout(timer);
    svg.replaceChildren();
    boxes.forEach((b) => b.classList.remove("is-active"));
  }

  function run() {
    reset();
    const my = token;
    (compactMq.matches ? loopCompact : loopDesktop)(my).catch(() => {});
  }

  new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      visible ? run() : reset();
    },
    { threshold: 0.3 }
  ).observe(resultFlow);

  let resizeTimer;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => visible && run(), 150);
  });
}
})();

/* ===== card-glow.js ===== */
(() => {
// Glows are "attracted" to the cursor when it moves near them
const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
// Each target describes its original glow so it can return to it exactly
const targets = [
  {
    selector: ".course-card, .audience-card, .offer-card",
    baseX: 4,
    baseY: 4,
    alpha: 0.3,
    boost: 0.08, // extra opacity when the cursor is close
    max: 20,     // max glow shift (px)
    shadow: (x, y, a, rgb) => `${x}px ${y}px 56px 2px rgba(${rgb}, ${a})`,
    rgbOf: (el) => (el.className.includes("--orange") ? "255, 92, 0" : "0, 229, 255"),
  },
  {
    selector: ".editor-window",
    baseX: 4,
    baseY: 4,
    alpha: 0.3,
    boost: 0.08,
    max: 90, // bigger shift, because the 200px blur hides small movement
    shadow: (x, y, a, rgb) => `${x}px ${y}px 200px 10px rgba(${rgb}, ${a})`,
    rgbOf: () => "0, 229, 255",
  },
];

const items = targets.flatMap((t) =>
  [...document.querySelectorAll(t.selector)].map((el) => ({
    el,
    t,
    rgb: t.rgbOf(el),
    x: t.baseX,
    y: t.baseY,
    a: t.alpha,
  }))
);

if (!calm && finePointer && items.length) {
  const RANGE = 350; // how far from an element (px) the cursor starts to attract it
  const EASE = 0.12; // smoothness: lower = lazier

  let mx = null;
  let my = null;
  let raf = 0;

  function frame() {
    let busy = false;
    const vh = window.innerHeight;

    for (const c of items) {
      const { t } = c;
      const r = c.el.getBoundingClientRect();
      let tx = t.baseX, ty = t.baseY, ta = t.alpha;

      if (mx !== null && r.bottom > -RANGE && r.top < vh + RANGE) {
        // distance from the cursor to the nearest point of the element (0 if inside)
        const nx = Math.max(r.left, Math.min(mx, r.right));
        const ny = Math.max(r.top, Math.min(my, r.bottom));
        const dist = Math.hypot(mx - nx, my - ny);

        if (dist < RANGE) {
          const influence = 1 - dist / RANGE;
          const dx = mx - (r.left + r.width / 2);
          const dy = my - (r.top + r.height / 2);
          const len = Math.hypot(dx, dy) || 1;
          const mag = t.max * influence * Math.min(1, len / 100);
          tx = t.baseX + (dx / len) * mag;
          ty = t.baseY + (dy / len) * mag;
          ta = t.alpha + t.boost * influence;
        }
      }

      c.x += (tx - c.x) * EASE;
      c.y += (ty - c.y) * EASE;
      c.a += (ta - c.a) * EASE;

      const settled =
        Math.abs(tx - c.x) < 0.2 && Math.abs(ty - c.y) < 0.2 && Math.abs(ta - c.a) < 0.005;

      if (settled && tx === t.baseX && ty === t.baseY) {
        c.el.style.removeProperty("box-shadow"); // back to the CSS default
      } else {
        c.el.style.boxShadow = t.shadow(c.x, c.y, c.a, c.rgb);
        if (!settled) busy = true;
      }
    }

    raf = busy ? requestAnimationFrame(frame) : 0;
  }

  const start = () => { if (!raf) raf = requestAnimationFrame(frame); };

  document.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    mx = e.clientX;
    my = e.clientY;
    start();
  });

  window.addEventListener("scroll", start, { passive: true });

  document.documentElement.addEventListener("mouseleave", () => {
    mx = my = null;
    start();
  });
}
})();
