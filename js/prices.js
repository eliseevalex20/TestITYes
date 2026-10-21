import { PRICING } from "./prices-data.js";

const { courses, familyDiscount, referralDiscount } = PRICING;
const $ = (s, r = document) => r.querySelector(s);
const num = (n) => Math.round(n).toLocaleString("uk-UA").replace(/\u00a0/g, " ");
const uah = (n) => (n == null ? null : `${num(n)} грн`);

/* ---------- Price table ---------- */
document.querySelectorAll("tr[data-course]").forEach((row) => {
  const c = courses[row.dataset.course];
  if (!c) return;
  const set = (f, v) => { const el = $(`[data-f="${f}"]`, row); if (el && v != null) el.textContent = v; };
  set("price", uah(c.price));
  set("early", uah(c.earlyBird));
  set("inst", c.price != null ? `${num(c.price / c.installmentMonths)} грн/місяць` : null);
});

/* ---------- Family example (Python з нуля) ---------- */
{
  const p = courses.python.price;
  if (p != null) {
    const fam = 2 * (p - familyDiscount);
    $('[data-x="regular"]').textContent = num(2 * p);
    $('[data-x="family"]').textContent = uah(fam);
    $('[data-x="saving"]').textContent = uah(2 * p - fam);
  }
}

/* ---------- Calculator ---------- */
const select = $("#calc-course");
const switches = [...document.querySelectorAll(".pr-switch")];
const out = {
  regular: $("#r-regular"), total: $("#r-total"), saving: $("#r-saving"),
  inst: $("#r-inst"), applied: $("#r-applied"),
};
const LABEL = { early: "Early Bird", family: "Family", referral: "Referral" };
const ORDER = ["early", "family", "referral"]; // used when prices are not filled in yet

function calc() {
  const c = courses[select.value];
  const on = switches.filter((s) => s.classList.contains("is-on")).map((s) => s.dataset.offer);
  let winner = null;
  let best = c.price;

  if (c.price != null) {
    const price = {
      early: c.earlyBird,
      family: c.price - familyDiscount,
      referral: c.price - referralDiscount,
    };
    on.forEach((k) => {
      if (price[k] != null && price[k] < best) { best = price[k]; winner = k; }
    });
  } else {
    winner = ORDER.find((k) => on.includes(k)) || null;
  }

  if (c.price == null) {
    out.regular.textContent = "XX XXX";
    out.total.textContent = "XX XXX грн";
    out.saving.textContent = "XX XXX грн";
    out.inst.textContent = "X XXX грн/місяць";
  } else {
    out.regular.textContent = num(c.price);
    out.total.textContent = uah(best);
    out.saving.textContent = uah(c.price - best);
    out.inst.textContent = `${num(best / c.installmentMonths)} грн/місяць`;
  }

  out.applied.innerHTML = winner
    ? `<li>${LABEL[winner]}</li>`
    : `<li class="is-none">Без пропозицій</li>`;
}

switches.forEach((s) =>
  s.addEventListener("click", () => {
    const on = s.classList.toggle("is-on");
    s.setAttribute("aria-checked", String(on));
    calc();
  })
);
select.addEventListener("change", calc);
calc();

/* Open the calculator with a course preselected: prices.html?course=django#calculator */
const wanted = new URLSearchParams(location.search).get("course");
if (wanted && courses[wanted]) { select.value = wanted; calc(); }