// select-ui.js — styled dropdowns for <select> in the calculator (.pr-select) and the application form (.ap-select).
// The native <select> stays in the DOM (hidden): it keeps the value, validation and form data,
// so prices.js / apply.js / mobile-visual.js work unchanged. The button, list and keyboard are drawn here.
const instances = [];
let uid = 0;

function enhance(wrap) {
  const select = wrap.querySelector("select");
  if (!select || select.dataset.selUi) return;
  select.dataset.selUi = "1";
  const n = ++uid;

  const root = document.createElement("div");
  root.className = "sel";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "sel-btn";
  btn.setAttribute("role", "combobox");
  btn.setAttribute("aria-haspopup", "listbox");
  btn.setAttribute("aria-expanded", "false");
  btn.setAttribute("aria-controls", `sel-${n}-list`);
  const val = document.createElement("span");
  val.className = "sel-val";
  btn.append(val);

  const list = document.createElement("ul");
  list.className = "sel-list";
  list.id = `sel-${n}-list`;
  list.setAttribute("role", "listbox");

  const lis = [...select.options].filter((o) => !o.disabled).map((o, i) => {
    const li = document.createElement("li");
    li.className = "sel-opt";
    li.id = `sel-${n}-o${i}`;
    li.setAttribute("role", "option");
    li.dataset.v = o.value;
    li.textContent = o.textContent.trim();
    list.append(li);
    return li;
  });

  root.append(btn, list);
  wrap.append(root);

  select.classList.add("sel-native");
  select.tabIndex = -1;
  select.setAttribute("aria-hidden", "true");
  select.focus = () => btn.focus();            // validation code calls select.focus()

  const label = select.id && document.querySelector(`label[for="${select.id}"]`);
  if (label) {
    label.id = label.id || `sel-${n}-label`;
    btn.setAttribute("aria-labelledby", label.id);
    label.addEventListener("click", (e) => { e.preventDefault(); btn.focus(); });
  }

  let active = -1;
  const isOpen = () => root.classList.contains("is-open");

  const sync = () => {
    const cur = select.selectedOptions[0];
    val.textContent = cur ? cur.textContent.trim() : "";
    val.classList.toggle("is-placeholder", !select.value);
    lis.forEach((li) => li.setAttribute("aria-selected", String(li.dataset.v === select.value)));
  };

  const setActive = (i, scroll = true) => {
    active = Math.max(0, Math.min(lis.length - 1, i));
    lis.forEach((li, k) => li.classList.toggle("is-active", k === active));
    btn.setAttribute("aria-activedescendant", lis[active].id);
    if (scroll) lis[active].scrollIntoView({ block: "nearest" });
  };

  const close = () => {
    root.classList.remove("is-open");
    wrap.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
    btn.removeAttribute("aria-activedescendant");
  };

  const api = { close };

  const open = () => {
    instances.forEach((o) => o !== api && o.close());
    root.classList.add("is-open");
    wrap.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");
    const cur = lis.findIndex((li) => li.dataset.v === select.value);
    setActive(cur < 0 ? 0 : cur);
  };

  const choose = (i) => {
    if (i < 0 || !lis[i]) return;
    select.value = lis[i].dataset.v;
    select.dispatchEvent(new Event("input", { bubbles: true }));
    select.dispatchEvent(new Event("change", { bubbles: true }));
    sync();
    close();
    btn.focus();
  };

  btn.addEventListener("click", () => (isOpen() ? close() : open()));

  btn.addEventListener("keydown", (e) => {
    const k = e.key;
    if (k === "ArrowDown" || k === "ArrowUp") {
      e.preventDefault();
      if (!isOpen()) open();
      else setActive(active + (k === "ArrowDown" ? 1 : -1));
    } else if (k === "Home" || k === "End") {
      if (isOpen()) { e.preventDefault(); setActive(k === "Home" ? 0 : lis.length - 1); }
    } else if (k === "Enter" || k === " ") {
      e.preventDefault();
      if (isOpen()) choose(active); else open();
    } else if (k === "Escape") {
      if (isOpen()) { e.preventDefault(); close(); }
    } else if (k === "Tab") {
      close();
    } else if (k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // type-ahead: jump to the next option that starts with the typed letter
      const from = (isOpen() ? active : lis.findIndex((li) => li.dataset.v === select.value)) + 1;
      const hit = lis.map((_, i) => (from + i) % lis.length)
        .find((i) => lis[i].textContent.toLowerCase().startsWith(k.toLowerCase()));
      if (hit !== undefined) { e.preventDefault(); isOpen() ? setActive(hit) : choose(hit); }
    }
  });

  list.addEventListener("mousemove", (e) => {
    const li = e.target.closest(".sel-opt");
    if (!li) return;
    const k = lis.indexOf(li);
    if (k !== active) setActive(k, false);
  });
  list.addEventListener("click", (e) => {
    const li = e.target.closest(".sel-opt");
    if (li) choose(lis.indexOf(li));
  });
  document.addEventListener("pointerdown", (e) => { if (isOpen() && !root.contains(e.target)) close(); });

  // keep the custom cursor ring reacting like on other buttons
  const cursor = document.querySelector(".cursor");
  if (cursor) {
    root.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
    root.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
  }

  select.addEventListener("change", sync);
  select.form?.addEventListener("reset", () => setTimeout(sync, 0));
  instances.push(api);
  sync();
}

document.querySelectorAll(".pr-select, .ap-select").forEach(enhance);
