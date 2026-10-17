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
