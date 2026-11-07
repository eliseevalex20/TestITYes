// Course cards glide in from their own side (data-side) to the centre.
// The move is tied to scroll: it starts the moment a card peeks in at the bottom
// of the screen and is finished by the time its top edge reaches ~55% of the
// viewport height, so the card is already centred while you start reading it.
// Position is eased every frame (no jumps, no waiting for the previous card).
const cards = [...document.querySelectorAll(".ct-card")];
const desktop = window.matchMedia("(min-width: 961px)");
const calm = window.matchMedia("(prefers-reduced-motion: reduce)");

if (cards.length) {
  const SHIFT = 12.5;      // % of the card's own width (= 10% of the list)
  const START = 1.0;       // card top at 100% of viewport height = fully on its side
  const END = 0.58;        // card top at 58% of viewport height = centred
  const FROM_SCALE = 0.96; // slight "grow" while sliding in
  const EASE = 0.1;        // lower = lazier, smoother

  const items = cards.map((el) => ({
    el,
    sign: el.dataset.side === "left" ? -1 : 1,
    x: 0, s: 1, tx: 0, ts: 1,
  }));
  items.forEach((i) => { i.x = i.sign * SHIFT; i.s = FROM_SCALE; });

  const smooth = (t) => t * t * (3 - 2 * t);
  let raf = 0;

  function frame() {
    const vh = window.innerHeight;
    let busy = false;

    for (const i of items) {
      if (desktop.matches) {
        const top = i.el.getBoundingClientRect().top;
        // 0 = still below / just entering, 1 = reached its place (stays 1 while it scrolls up and away)
        const p = Math.min(1, Math.max(0, (vh * START - top) / (vh * (START - END))));
        const e = smooth(p);
        i.tx = i.sign * SHIFT * (1 - e);
        i.ts = FROM_SCALE + (1 - FROM_SCALE) * e;
      } else {
        i.tx = 0; i.ts = 1;
      }

      if (calm.matches) { i.x = i.tx; i.s = i.ts; }
      else { i.x += (i.tx - i.x) * EASE; i.s += (i.ts - i.s) * EASE; }

      if (Math.abs(i.tx - i.x) < 0.01 && Math.abs(i.ts - i.s) < 0.0005) { i.x = i.tx; i.s = i.ts; }
      else busy = true;

      i.el.style.translate = `${i.x.toFixed(3)}% 0`;
      i.el.style.scale = i.s.toFixed(4);
    }

    raf = busy ? requestAnimationFrame(frame) : 0;
  }

  const start = () => { if (!raf) raf = requestAnimationFrame(frame); };

  window.addEventListener("scroll", start, { passive: true });
  window.addEventListener("resize", start);
  desktop.addEventListener("change", start);
  start();
}