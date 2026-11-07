// Application form: messenger-aware contact field, validation, submit.

// Put your form endpoint here (Formspree, your backend, a Zapier hook, ...).
// While it is empty the form only logs the data and shows the success message (dev mode).
const ENDPOINT = "";

const form = document.getElementById("apply-form");
const status = document.getElementById("ap-status");
const course = document.getElementById("f-course");
const contact = document.getElementById("f-contact");
const contactLabel = document.getElementById("contact-label");

/* ---------- Preselect course: apply.html?course=django ---------- */
const wanted = new URLSearchParams(location.search).get("course");
if (wanted && [...course.options].some((o) => o.value === wanted)) course.value = wanted;

/* ---------- Contact field follows the chosen messenger ---------- */
const HINTS = {
  telegram:  { label: "Ваш Username/номер", ph: "@username",  type: "text" },
  whatsapp:  { label: "Ваш номер телефону", ph: "+380 XX XXX XX XX", type: "tel" },
  instagram: { label: "Ваш Username",       ph: "@username",  type: "text" },
};
form.querySelectorAll('input[name="messenger"]').forEach((r) =>
  r.addEventListener("change", () => {
    const h = HINTS[r.value];
    contactLabel.textContent = h.label;
    contact.placeholder = h.ph;
    contact.type = h.type;
  })
);

/* ---------- Validation ---------- */
const say = (text, kind = "") => {
  status.textContent = text;
  status.className = `ap-status ${kind}`;
};

form.addEventListener("input", (e) => {
  e.target.closest(".ap-field, .ap-consent")?.classList.remove("is-invalid");
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  say("");

  let firstBad = null;
  form.querySelectorAll("[required]").forEach((el) => {
    const bad = !el.checkValidity() || (el.type === "text" && !el.value.trim());
    el.closest(".ap-field, .ap-consent")?.classList.toggle("is-invalid", bad);
    if (bad && !firstBad) firstBad = el;
  });
  if (firstBad) {
    say("Перевірте, будь ласка, виділені поля", "is-error");
    firstBad.focus();
    return;
  }

  const data = Object.fromEntries(new FormData(form));
  const btn = form.querySelector(".ap-submit");
  btn.disabled = true;

  try {
    if (ENDPOINT) {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(res.status);
    } else {
      console.info("[apply] no ENDPOINT set — form data:", data);
    }
    say("Дякуємо! Заявку надіслано — ми зв’яжемося з вами найближчим часом", "is-ok");
    form.reset();
    form.querySelector('input[name="messenger"][value="telegram"]').dispatchEvent(new Event("change", { bubbles: true }));
  } catch {
    say("Не вдалося надіслати заявку. Спробуйте ще раз або напишіть нам у месенджер", "is-error");
  } finally {
    btn.disabled = false;
  }
});