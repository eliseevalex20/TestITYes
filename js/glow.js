// Hero glow subtly follows the cursor when hovering over it
const heroEl = document.querySelector(".hero");
const glowFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const glowReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (heroEl && glowFinePointer && !glowReduceMotion) {
  const GLOW_SIZE = 480;   // same as width/height of .hero::before
  const RADIUS = GLOW_SIZE / 2;
  const STRENGTH = 0.25;   // how much the glow follows (0 = none, 1 = sticks to cursor)
  const MAX_SHIFT = 70;    // px limit

  const reset = () => {
    heroEl.style.setProperty("--glow-x", "0px");
    heroEl.style.setProperty("--glow-y", "0px");
  };

  heroEl.addEventListener("mousemove", (e) => {
    const r = heroEl.getBoundingClientRect();
    // centre of the glow: top: 20%; right: 10%
    const cx = r.right - r.width * 0.1 - RADIUS;
    const cy = r.top + r.height * 0.2 + RADIUS;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;

    // only react when the cursor is over the glow area
    if (Math.hypot(dx, dy) > RADIUS) return reset();

    const clamp = (v) => Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, v));
    heroEl.style.setProperty("--glow-x", `${clamp(dx * STRENGTH)}px`);
    heroEl.style.setProperty("--glow-y", `${clamp(dy * STRENGTH)}px`);
  });

  heroEl.addEventListener("mouseleave", reset);
}