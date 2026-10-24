// FAQ accordion — one answer open at a time
const buttons = [...document.querySelectorAll(".fq-btn")];

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const wasOpen = btn.getAttribute("aria-expanded") === "true";
    buttons.forEach((b) => {
      b.setAttribute("aria-expanded", "false");
      b.closest(".fq-item").classList.remove("is-open");
    });
    if (!wasOpen) {
      btn.setAttribute("aria-expanded", "true");
      btn.closest(".fq-item").classList.add("is-open");
    }
  });
});