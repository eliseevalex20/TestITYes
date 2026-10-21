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