// mobile-visual.js — loads after site.js (type="module"). Runs only on screens <= 960px.
// Adds: scroll progress line, tech ticker, typed hero code, carousel dots,
// count-up numbers, sticky "Записатися" bar.
(() => {
    const mq = window.matchMedia("(max-width: 960px)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let started = false;
  
    function init() {
      if (started) return;
      started = true;
  
      /* ---------- scroll progress ---------- */
      const bar = document.createElement("div");
      bar.className = "mv-progress";
      bar.setAttribute("aria-hidden", "true");
      document.body.prepend(bar);
  
      /* ---------- ticker (index / courses / course) ---------- */
      const hero = document.querySelector(".hero");
      // ticker text = the hero-benefits items of the current page (the static bar is hidden on mobile)
      const benefits = [...document.querySelectorAll(".hero .hero-benefits li")]
        .map((li) => li.textContent.trim())
        .filter(Boolean);
      if (hero && benefits.length) {
        const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
        // repeat so one half of the track is always wider than the screen
        const one = benefits.map((w) => `<span>${esc(w)}</span>`).join("");
        const half = one.repeat(Math.max(2, Math.ceil(6 / benefits.length)));
        const t = document.createElement("div");
        t.className = "mv-ticker";
        t.setAttribute("aria-hidden", "true");
        t.innerHTML = `<div class="mv-ticker-track">${half}${half}</div>`;
        hero.after(t);
        document.documentElement.classList.add("mv-has-ticker");
        // constant, slow speed (~24 px/s) whatever the text length
        const track = t.firstElementChild;
        const setSpeed = () => track.style.setProperty("--mv-dur", `${Math.max(30, track.scrollWidth / 2 / 24)}s`);
        setSpeed();
        window.addEventListener("load", setSpeed);
      }
  
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
  
      /* ---------- floating sparks in the hero ---------- */
      if (hero && !calm) {
        const sparks = document.createElement("div");
        sparks.className = "mv-sparks";
        sparks.setAttribute("aria-hidden", "true");
        sparks.innerHTML = Array.from({ length: 9 }, (_, i) => `<i style="--x:${(i * 37 + 8) % 96}%;--d:${6 + (i % 4) * 2}s;--s:${i * 0.9}s;--z:${3 + (i % 3) * 2}px"></i>`).join("");
        hero.prepend(sparks);
      }
  
      /* ---------- tap ripple ---------- */
      if (!calm) {
        document.addEventListener("pointerdown", (e) => {
          const el = e.target.closest(".btn, .course-btn, .ct-btn, .mv-cta, .fq-btn, .cx-acc-btn, .footer-social a, .fq-social a, .offer-cta");
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
  
      /* ---------- sticky CTA ---------- */
      const skipCta = document.body.classList.contains("page-apply") || document.getElementById("calculator");
      let cta = null;
      if (!skipCta) {
        cta = document.createElement("a");
        cta.className = "mv-cta";
        cta.href = "apply.html";
        cta.textContent = "Записатися на курс";
        document.body.append(cta);
        const footer = document.querySelector(".site-footer");
        let footerVisible = false;
        if (footer) {
          new IntersectionObserver(([e]) => { footerVisible = e.isIntersecting; sync(); }).observe(footer);
        }
        var sync = () => cta.classList.toggle("is-shown", window.scrollY > 500 && !footerVisible);
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
        const bar = document.createElement("div");
        bar.className = "mv-save";
        bar.innerHTML = `<span>Знижка</span><div class="mv-track"><i></i></div><b>0%</b>`;
        el.tot.after(bar);
  
        const fmt = (n) => Math.round(n).toLocaleString("uk-UA").replace(/ /g, " ");
        const parse = (node) => {
          const m = node.textContent.match(/^(\d[\d\s ]*\d|\d)(.*)$/);
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
          bar.style.setProperty("--pct", `${pct}%`);
          bar.querySelector("b").textContent = `${pct}%`;
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
  
      /* ---------- menu footer: school name + email ---------- */
      const navEl = document.getElementById("main-nav");
      const mailEl = document.querySelector(".footer-email");
      if (navEl && mailEl && !navEl.querySelector(".mv-nav-foot")) {
        const f = document.createElement("div");
        f.className = "mv-nav-foot";
        const p = document.createElement("p");
        p.textContent = "Онлайн-школа програмування";
        const a = document.createElement("a");
        a.href = mailEl.getAttribute("href");
        a.textContent = mailEl.textContent.trim();
        f.append(p, a);
        navEl.append(f);
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
          if (cta) sync();
          lightSteps();
        });
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  
    if (mq.matches) init();
    else mq.addEventListener("change", (e) => { if (e.matches) init(); });
  })();