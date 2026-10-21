// Reveal elements when they enter the viewport
const revealItems = document.querySelectorAll(".reveal");
    if (revealItems.length) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-revealed");
            revealObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
      );
      revealItems.forEach((item, index) => {
        item.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 70}ms`);
        revealObserver.observe(item);
      });
    }
