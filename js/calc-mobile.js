// calc-mobile.js — мини-плашка с итогом для мобильного калькулятора.
// Показывается, пока калькулятор на экране, а блок «До сплати» уже ушёл за экран
// (например, когда человек переключает пропозиції сверху). Подключать в prices.html после mobile-visual.js.
(() => {
    const sec = document.querySelector(".pr-calc-sec");
    const total = document.getElementById("r-total");
    if (!sec || !total) return;
  
    const bar = document.createElement("div");
    bar.className = "mv-calc-bar";
    bar.setAttribute("aria-hidden", "true");
    bar.innerHTML = `<div class="mv-calc-bar-sum"><small>До сплати</small><b></b></div><span class="mv-calc-bar-tag"></span>`;
    document.body.append(bar);
    const sum = bar.querySelector("b");
    const tag = bar.querySelector(".mv-calc-bar-tag");
    const applied = document.getElementById("r-applied");
  
    const sync = () => {
      sum.textContent = total.textContent;
      const first = applied && applied.querySelector("li");
      tag.textContent = first ? first.textContent.trim() : "";
      tag.classList.toggle("is-none", !first || first.classList.contains("is-none"));
    };
    if (applied) new MutationObserver(sync).observe(applied, { childList: true, subtree: true, characterData: true });
    new MutationObserver(sync).observe(total, { childList: true, characterData: true, subtree: true });
    sync();
  
    let inCalc = false, totalSeen = false;
    const update = () => bar.classList.toggle("is-on", inCalc && !totalSeen);
  
    new IntersectionObserver(([e]) => { inCalc = e.isIntersecting; update(); }, { threshold: 0.05 }).observe(sec);
    new IntersectionObserver(([e]) => {
      // «видим» итог, только если он целиком на экране выше мини-плашки
      totalSeen = e.isIntersecting; update();
    }, { threshold: 0.9, rootMargin: "0px 0px -110px 0px" }).observe(total);
  })();