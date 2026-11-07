// loader.js — заменяет старый js/loader.js.
// Прогресс-бар идёт плавно до 90%, а на 100% «догоняет» только когда страница реально загрузилась.
// Минимум показа — 2.2 с (чтобы успела допечататься анимация кода), максимум — 5 с.
(() => {
    const KEY = "ityes_loader_shown";
    const MIN = 2200;
    const MAX = 5000;
  
    const loader = document.getElementById("ityes-loader");
    if (!loader) return;
  
    let seen = false;
    try { seen = !!sessionStorage.getItem(KEY); } catch {}
    if (seen) { loader.remove(); return; }
    try { sessionStorage.setItem(KEY, "1"); } catch {}
  
    // искры — те же, что в hero (стили .mv-sparks уже есть в site.css)
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const sparks = document.createElement("div");
      sparks.className = "mv-sparks";
      sparks.setAttribute("aria-hidden", "true");
      sparks.innerHTML = Array.from({ length: 14 }, (_, i) =>
        `<i style="--x:${(i * 37 + 8) % 96}%;--d:${7 + (i % 5) * 2}s;--s:${(i * 0.5).toFixed(1)}s;--z:${3 + (i % 3) * 2}px"></i>`
      ).join("");
      loader.prepend(sparks);
    }
  
    const t0 = performance.now();
    let loaded = document.readyState === "complete";
    let leaving = false;
    let p = 0;
  
    if (!loaded) window.addEventListener("load", () => { loaded = true; }, { once: true });
  
    const leave = () => {
      if (leaving) return;
      leaving = true;
      loader.style.setProperty("--p", "1");
      loader.classList.add("is-leaving");
      setTimeout(() => loader.remove(), 900);
    };
  
    const tick = (now) => {
      if (leaving) return;
      const elapsed = now - t0;
      if (elapsed >= MAX) loaded = true;                       // страховка, если загрузка зависла
  
      const k = Math.min(1, elapsed / MIN);
      const want = Math.min(loaded ? 1 : 0.9, 1 - Math.pow(1 - k, 3));
      p = Math.max(p, want);
      loader.style.setProperty("--p", p.toFixed(3));
  
      if (loaded && elapsed >= MIN) { setTimeout(leave, 250); return; }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  })();