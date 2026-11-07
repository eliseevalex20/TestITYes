// mobile-visual.js — loads after site.js (type="module"). Runs only on screens <= 960px.
// v11: bottom app bar is the only navigation. No ticker, no hero code card, no section strip.
(() => {
  const mq = window.matchMedia("(max-width: 960px)");
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let started = false;

  function init() {
    if (started) return;
    started = true;

    const page = (location.pathname.split("/").pop() || "index").replace(/\.html$/, "") || "index";
    const hero = document.querySelector(".hero");

    /* ---------- scroll progress ---------- */
    const bar = document.createElement("div");
    bar.className = "mv-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.prepend(bar);

    /* ---------- finger spotlight on cards ---------- */
    let touchEl = null;
    document.addEventListener("pointerdown", (e) => {
      const c = e.target.closest(".course-card, .audience-card, .offer-card");
      if (!c) return;
      const r = c.getBoundingClientRect();
      c.style.setProperty("--mx", `${e.clientX - r.left}px`);
      c.style.setProperty("--my", `${e.clientY - r.top}px`);
      c.classList.add("mv-touch");
      touchEl = c;
    }, { passive: true });
    document.addEventListener("pointermove", (e) => {
      if (!touchEl) return;
      const r = touchEl.getBoundingClientRect();
      touchEl.style.setProperty("--mx", `${e.clientX - r.left}px`);
      touchEl.style.setProperty("--my", `${e.clientY - r.top}px`);
    }, { passive: true });
    const endTouch = () => {
      if (!touchEl) return;
      const c = touchEl;
      touchEl = null;
      setTimeout(() => c.classList.remove("mv-touch"), 500);
    };
    document.addEventListener("pointerup", endTouch, { passive: true });
    document.addEventListener("pointercancel", endTouch, { passive: true });

    /* sparks in the hero are created by site.js (all screen sizes) */

    /* ---------- tap ripple ---------- */
    if (!calm) {
      document.addEventListener("pointerdown", (e) => {
        const el = e.target.closest(".btn, .course-btn, .ct-btn, .mv-tab:not(.mv-tab--cta), .fq-btn, .cx-acc-btn, .footer-social a, .fq-social a, .offer-cta");
        if (!el) return;
        const r = el.getBoundingClientRect();
        const size = Math.max(r.width, r.height) * 2;
        const dot = document.createElement("span");
        dot.className = "mv-ripple";
        dot.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
        el.append(dot);
        dot.addEventListener("animationend", () => dot.remove());
      }, { passive: true });
    }

    /* ---------- timelines light up as you scroll ---------- */
    const steps = [...document.querySelectorAll(".path-step, .cx-road-step")];
    const lightSteps = () => {
      const line = window.innerHeight * 0.68;
      steps.forEach((s) => {
        const r = s.getBoundingClientRect();
        if (r.top + r.height / 2 < line) s.classList.add("is-in");
      });
    };

    /* ---------- carousel dots ---------- */
    document.querySelectorAll(".why-grid, .audience-grid, .about-side, .courses-grid").forEach((sc) => {
      const items = [...sc.children];
      if (items.length < 2) return;
      const dots = document.createElement("div");
      dots.className = "mv-dots";
      dots.setAttribute("aria-hidden", "true");
      dots.innerHTML = items.map((_, i) => `<i${i === 0 ? ' class="is-on"' : ""}></i>`).join("");
      sc.after(dots);

      let raf = 0;
      const update = () => {
        raf = 0;
        const max = sc.scrollWidth - sc.clientWidth;
        const idx = max > 0 ? Math.round((sc.scrollLeft / max) * (items.length - 1)) : 0;
        [...dots.children].forEach((d, i) => d.classList.toggle("is-on", i === idx));
      };
      sc.addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    });

    /* ---------- home offers: pick one offer with tabs, shown under the Standard card ---------- */
    const offersGrid = document.querySelector(".offers-grid");
    const offerCards = offersGrid ? [...offersGrid.querySelectorAll(".offer-card--cyan")] : [];
    if (offerCards.length > 1) {
      const tabs = document.createElement("div");
      tabs.className = "mv-otabs";
      tabs.setAttribute("role", "tablist");
      tabs.innerHTML = offerCards
        .map((c) => `<button type="button" role="tab">${c.querySelector(".offer-label").textContent.trim()}</button>`)
        .join("");
      offersGrid.append(tabs);
      const btns = [...tabs.children];
      let cur = 0;
      const showOffer = (n) => {
        cur = n;
        offerCards.forEach((c, i) => c.classList.toggle("mv-o-on", i === n));
        btns.forEach((b, i) => b.setAttribute("aria-selected", String(i === n)));
      };
      btns.forEach((b, i) => b.addEventListener("click", () => showOffer(i)));
      let x0 = null;
      offersGrid.addEventListener("touchstart", (e) => { x0 = e.target.closest(".offer-card--cyan") ? e.touches[0].clientX : null; }, { passive: true });
      offersGrid.addEventListener("touchend", (e) => {
        if (x0 == null) return;
        const dx = e.changedTouches[0].clientX - x0;
        x0 = null;
        if (Math.abs(dx) > 50) showOffer(Math.max(0, Math.min(offerCards.length - 1, cur + (dx < 0 ? 1 : -1))));
      }, { passive: true });
      showOffer(0);
    }

    /* ---------- count-up numbers ---------- */
    const nums = document.querySelectorAll(".about-stat-num, .pr-spot-num");
    if (nums.length && !calm) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          const el = e.target;
          const end = parseInt(el.textContent, 10);
          if (Number.isNaN(end)) return;
          const from = end > 100 ? end - 40 : 0;
          const t0 = performance.now();
          const dur = 1100;
          const tick = (now) => {
            const k = Math.min(1, (now - t0) / dur);
            el.textContent = String(Math.round(from + (end - from) * (1 - Math.pow(1 - k, 3))));
            if (k < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      }, { threshold: 0.6 });
      nums.forEach((n) => io.observe(n));
    }

    /* ---------- bottom app bar = the only navigation on mobile ---------- */
    {
      const ICON = {
        home: '<path d="M3 11l9-7 9 7M5 10v10h5v-6h4v6h5V10"/>',
        courses: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>',
        prices: '<circle cx="12" cy="12" r="9"/><path d="M14.5 9.2c-.6-.8-1.5-1.2-2.5-1.2-1.4 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2c-1 0-2-.4-2.5-1.2M12 5.5V8M12 16v2.5"/>',
        faq: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01"/>',
        apply: '<path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"/>',
        arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
      };
      const tab = (href, pages, label, icon) => {
        const cur = pages.includes(page);
        return `<a class="mv-tab${cur ? " is-current" : ""}" href="${href}"${cur ? ' aria-current="page"' : ""}><svg viewBox="0 0 24 24" aria-hidden="true">${icon}</svg><span>${label}</span></a>`;
      };
      const tabbar = document.createElement("nav");
      tabbar.className = "mv-bar";
      tabbar.setAttribute("aria-label", "Навігація");
      // CTA is the first (left) cell with an accent tile: browsers draw their own floating buttons (scroll-to-top etc.)
      // at the bottom right / centre, so the left side always stays tappable.
      // centre cell = raised "Записатися" button. It is WIDE (not a small square), so a browser's own
      // floating scroll-to-top button can cover only a part of it; the rest stays tappable.
      tabbar.innerHTML =
        tab("index.html", ["index"], "Головна", ICON.home) +
        tab("courses.html", ["courses", "course"], "Курси", ICON.courses) +
        `<a class="mv-tab mv-tab--cta${page === "apply" ? " is-current" : ""}" href="apply.html"><span class="mv-cta-box"><svg viewBox="0 0 24 24" aria-hidden="true">${ICON.apply}</svg><span>Записатися</span></span></a>` +
        tab("prices.html", ["prices"], "Ціни", ICON.prices) +
        tab("faq.html", ["faq"], "FAQ", ICON.faq);
      document.body.append(tabbar);
      document.documentElement.classList.add("mv-has-bar");

      // the on-screen keyboard must not push the bar over the inputs
      document.addEventListener("focusin", (e) => { if (e.target.matches("input, textarea, select")) tabbar.classList.add("is-hidden"); });
      document.addEventListener("focusout", () => tabbar.classList.remove("is-hidden"));
    }

    const pad2 = (n) => String(n).padStart(2, "0");

    /* ---------- select -> tappable option cards (kept in sync with the real <select>) ---------- */
    const syncers = [];
    const chipify = (select, cls = "") => {
      const wrap = document.createElement("div");
      wrap.className = `mv-chips ${cls}`;
      wrap.setAttribute("role", "radiogroup");
      [...select.options].filter((o) => !o.disabled).forEach((o) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "mv-chip";
        b.setAttribute("role", "radio");
        b.dataset.v = o.value;
        b.textContent = o.textContent.trim();
        wrap.append(b);
      });
      const sync = () => [...wrap.children].forEach((b) => {
        const on = b.dataset.v === select.value;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-checked", String(on));
      });
      wrap.addEventListener("click", (e) => {
        const b = e.target.closest(".mv-chip");
        if (!b) return;
        select.value = b.dataset.v;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        select.dispatchEvent(new Event("input", { bubbles: true }));
        sync();
      });
      select.addEventListener("change", sync);
      const box = select.closest(".pr-select, .ap-select");
      box.after(wrap);
      box.classList.add("mv-hidden");
      sync();
      syncers.push(sync);
      return sync;
    };
    window.addEventListener("load", () => syncers.forEach((s) => s()));

    /* ---------- price calculator: option cards, number tween, savings bar ---------- */
    const calcSel = document.getElementById("calc-course");
    if (calcSel) {
      chipify(calcSel, "mv-chips--col");
      const el = {
        reg: document.getElementById("r-regular"),
        tot: document.getElementById("r-total"),
        save: document.getElementById("r-saving"),
        inst: document.getElementById("r-inst"),
      };
      const sbar = document.createElement("div");
      sbar.className = "mv-save";
      sbar.innerHTML = `<span>Знижка</span><div class="mv-track"><i></i></div><b>0%</b>`;
      el.tot.after(sbar);

      const fmt = (n) => Math.round(n).toLocaleString("uk-UA").replace(/ /g, " ");
      const parse = (node) => {
        const m = node.textContent.match(/^(\d[\d\s ]*\d|\d)(.*)$/);
        return m ? { n: parseInt(m[1].replace(/\D/g, ""), 10), tail: m[2] } : null;
      };
      const last = new Map();
      const token = new Map();
      const tween = (node, to, tail) => {
        const from = last.has(node) ? last.get(node) : to;
        last.set(node, to);
        const id = (token.get(node) || 0) + 1;
        token.set(node, id);
        if (calm || from === to) return;
        const t0 = performance.now();
        const step = (now) => {
          if (token.get(node) !== id) return;
          const k = Math.min(1, (now - t0) / 750);
          node.textContent = fmt(from + (to - from) * (1 - Math.pow(1 - k, 3))) + tail;
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      };
      const refresh = () => requestAnimationFrame(() => {
        updateExtras();
        const vals = {};
        Object.entries(el).forEach(([k, node]) => {
          const p = parse(node);
          vals[k] = p;
          if (p) tween(node, p.n, p.tail);
          else { last.delete(node); token.set(node, (token.get(node) || 0) + 1); }
        });
        const pct = vals.reg && vals.tot && vals.reg.n ? Math.round((1 - vals.tot.n / vals.reg.n) * 100) : 0;
        sbar.style.setProperty("--pct", `${pct}%`);
        sbar.querySelector("b").textContent = `${pct}%`;
        if (vals.tot) {
          el.tot.classList.remove("mv-pop");
          void el.tot.offsetWidth;
          el.tot.classList.add("mv-pop");
        }
      });
      /* --- calculator extras: step headings, per-offer hints, apply link --- */
      const calcBox = document.querySelector(".pr-calc");
      const mkHead = (n, t, cls) => {
        const h = document.createElement("p");
        h.className = `mv-calc-h ${cls || ""}`;
        h.innerHTML = `<b>${n}</b><span>${t}</span>`;
        return h;
      };
      const fieldEl = document.querySelector(".pr-field");
      if (fieldEl) fieldEl.before(mkHead("01", "Курс"));
      calcBox.append(mkHead("02", "Пропозиції", "mv-h2"), mkHead("03", "Розрахунок", "mv-h3"));

      const offerRows = [...document.querySelectorAll(".pr-toggles li")];
      offerRows.forEach((li) => {
        const hint = document.createElement("small");
        hint.className = "mv-hint";
        li.querySelector("span").after(hint);
      });
      const applyBtn = document.querySelector(".pr-res-btn");
      let PR = null;
      import("./prices-data.js").then((m) => { PR = m.PRICING; updateExtras(); }).catch(() => {});

      function updateExtras() {
        const course = PR && PR.courses[calcSel.value];
        const first = document.querySelector("#r-applied li");
        const winner = first && !first.classList.contains("is-none") ? first.textContent.trim() : "";
        const names = { early: "Early Bird", family: "Family", referral: "Referral" };
        offerRows.forEach((li) => {
          const sw = li.querySelector(".pr-switch");
          const k = sw.dataset.offer;
          const on = sw.classList.contains("is-on");
          let save = null;
          if (PR && course) {
            if (k === "early" && course.price != null && course.earlyBird != null) save = course.price - course.earlyBird;
            if (k === "family") save = PR.familyDiscount;
            if (k === "referral") save = PR.referralDiscount;
          }
          const amount = save != null ? `\u2212${fmt(save)} грн` : "";
          const isWin = on && winner === names[k];
          li.classList.toggle("is-best", isWin);
          li.querySelector(".mv-hint").textContent = on
            ? (isWin ? `Застосовано${amount ? " · " + amount : ""}` : "Не сумується з вигіднішою")
            : (amount || "Сума — незабаром");
        });
        if (applyBtn) applyBtn.href = `apply.html?course=${encodeURIComponent(calcSel.value)}`;
      }

      document.querySelectorAll(".pr-switch").forEach((s) => s.addEventListener("click", refresh));
      calcSel.addEventListener("change", refresh);
      refresh();
    }

    /* ---------- apply form: 4-step wizard ---------- */
    const form = document.getElementById("apply-form");
    if (form) {
      const grid = form.querySelector(".ap-grid");
      const fields = [...grid.children];
      [0, 0, 1, 1, 2, 2, 3].forEach((s, i) => { if (fields[i]) fields[i].dataset.mvStep = String(s); });
      const consent = form.querySelector(".ap-consent");
      const statusEl = form.querySelector(".ap-status");
      const submit = form.querySelector(".ap-submit");
      [consent, statusEl, submit].forEach((x) => { x.dataset.mvStep = "3"; });

      chipify(document.getElementById("f-course"), "mv-chips--col");
      chipify(document.getElementById("f-level"));

      const titles = ["Знайомство", "Ваш курс", "Як зв’язатися", "Майже готово"];
      const prog = document.createElement("div");
      prog.className = "mv-steps";
      prog.innerHTML = `<p class="mv-steps-label"><b></b><span></span></p><div class="mv-steps-bar"><i></i><i></i><i></i><i></i></div>`;
      grid.before(prog);

      const nav = document.createElement("div");
      nav.className = "mv-wiz-nav";
      nav.innerHTML = `<button type="button" class="mv-back">Назад</button><button type="button" class="mv-next btn btn-orange">Далі</button>`;
      submit.before(nav);
      const back = nav.querySelector(".mv-back");
      const next = nav.querySelector(".mv-next");

      let step = 0;
      const show = (n, scroll) => {
        step = n;
        form.querySelectorAll("[data-mv-step]").forEach((x) => x.classList.toggle("is-step", Number(x.dataset.mvStep) === n));
        prog.querySelector("b").textContent = titles[n];
        prog.querySelector("span").textContent = `КРОК ${n + 1} З 4`;
        [...prog.querySelectorAll(".mv-steps-bar i")].forEach((b, i) => b.classList.toggle("is-done", i <= n));
        back.hidden = n === 0;
        next.hidden = n === 3;
        nav.classList.toggle("is-last", n === 3);
        if (scroll) prog.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "center" });
      };

      const stepValid = () => {
        let bad = null;
        form.querySelectorAll(`[data-mv-step="${step}"]`).forEach((f) => {
          f.querySelectorAll("[required]").forEach((inp) => {
            const isBad = !inp.checkValidity() || (inp.type === "text" && !inp.value.trim());
            inp.closest(".ap-field, .ap-consent")?.classList.toggle("is-invalid", isBad);
            if (isBad && !bad) bad = inp;
          });
        });
        if (bad) {
          const box = bad.closest(".ap-field");
          if (box) { box.classList.remove("mv-shake"); void box.offsetWidth; box.classList.add("mv-shake"); }
          if (bad.offsetParent) bad.focus({ preventScroll: false });
        }
        return !bad;
      };

      next.addEventListener("click", () => { if (stepValid()) show(step + 1, true); });
      back.addEventListener("click", () => show(step - 1, true));
      form.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && step < 3 && e.target.tagName === "INPUT" && e.target.type !== "checkbox") {
          e.preventDefault();
          next.click();
        }
      });
      form.addEventListener("reset", () => setTimeout(() => { show(0); syncers.forEach((s) => s()); }, 0));

      /* success overlay */
      const done = document.createElement("div");
      done.className = "mv-done";
      done.hidden = true;
      done.innerHTML = `<svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="23"/><path d="M15 27l8 8 14-16"/></svg><h3>Заявку надіслано</h3><p>Ми зв’яжемося з вами найближчим часом</p><button type="button" class="btn btn-orange">Добре</button>`;
      form.append(done);
      done.querySelector("button").addEventListener("click", () => { done.hidden = true; });
      new MutationObserver(() => {
        if (statusEl.classList.contains("is-ok")) { done.hidden = false; }
      }).observe(statusEl, { attributes: true, attributeFilter: ["class"] });

      show(0);
    }

    /* ---------- back-to-top button in the footer ---------- */
    const footerEl = document.querySelector(".site-footer");
    if (footerEl) {
      const top = document.createElement("button");
      top.type = "button";
      top.className = "mv-top";
      top.setAttribute("aria-label", "Нагору");
      top.textContent = "↑";
      top.addEventListener("click", () => window.scrollTo({ top: 0, behavior: calm ? "auto" : "smooth" }));
      footerEl.append(top);
    }

    /* ---------- scroll handler ---------- */
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.setProperty("--p", max > 0 ? String(Math.min(1, window.scrollY / max)) : "0");
        lightSteps();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  if (mq.matches) init();
  else mq.addEventListener("change", (e) => { if (e.matches) init(); });
})();