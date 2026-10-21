// Custom cursor for fine-pointer devices
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cursor = document.querySelector(".cursor");
    const cursorDot = document.querySelector(".cursor-dot");
    const cursorRing = document.querySelector(".cursor-ring");

    if (finePointer && cursor && !reduceMotion) {
      document.documentElement.classList.add("has-cursor");
      let mouseX = 0;
      let mouseY = 0;
      let ringX = 0;
      let ringY = 0;
      let ticking = false;

      document.addEventListener("mousemove", (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
        cursor.classList.add("is-visible");
        cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(followCursor);
        }
      });

      document.addEventListener("mousedown", () => cursor.classList.add("is-down"));
      document.addEventListener("mouseup", () => cursor.classList.remove("is-down"));

      document.querySelectorAll("a, button, .course-card, .offer-card").forEach((el) => {
        el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
        el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
      });

      function followCursor() {
        ringX += (mouseX - ringX) * 0.18;
        ringY += (mouseY - ringY) * 0.18;
        cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`;
        if (Math.abs(mouseX - ringX) > 0.2 || Math.abs(mouseY - ringY) > 0.2) {
          requestAnimationFrame(followCursor);
        } else {
          ticking = false;
        }
      }
    }
