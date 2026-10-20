// Glows are "attracted" to the cursor when it moves near them
const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
console.log("card-glow loaded");
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