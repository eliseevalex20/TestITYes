// Course cards: each rests on its own side (data-side) and slides to the centre
// while it is the card being read. Hand-over is sequential: the current card
// goes back to its side first, and only then does the next one move in.
const cards = [...document.querySelectorAll(".ct-card")];
const desktop = window.matchMedia("(min-width: 961px)");

if (cards.length) {
  const RETURN_MS = 650; // a bit less than the 0.7s CSS slide, so the hand-over feels continuous

  let wanted = null;   // card the scroll position asks for
  let current = null;  // card actually centred right now
  let busyUntil = 0;   // time before which no new card may start moving in
  let timer = 0;
  let raf = 0;

  function sync() {
    window.clearTimeout(timer);

    if (current && current !== wanted) {
      current.classList.remove("is-center");
      current = null;
      busyUntil = performance.now() + RETURN_MS;
    }

    if (wanted && current !== wanted) {
      const wait = busyUntil - performance.now();
      if (wait > 0) {
        timer = window.setTimeout(sync, wait);
        return;
      }
      wanted.classList.add("is-center");
      current = wanted;
    }
  }

  function pick() {
    raf = 0;
    let next = null;

    if (desktop.matches) {
      const vh = window.innerHeight;
      const mid = vh / 2;
      let best = Infinity;
      for (const c of cards) {
        const r = c.getBoundingClientRect();
        // the card counts only while it overlaps the middle band of the viewport
        const overlap = Math.min(r.bottom, vh * 0.7) - Math.max(r.top, vh * 0.3);
        if (overlap <= 0) continue;
        const dist = Math.abs(r.top + r.height / 2 - mid);
        if (dist < best) { best = dist; next = c; }
      }
    }

    if (next !== wanted) {
      wanted = next;
      sync();
    }
  }

  const schedule = () => { if (!raf) raf = requestAnimationFrame(pick); };

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  desktop.addEventListener("change", schedule);
  pick();
}