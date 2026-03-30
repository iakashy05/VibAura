/**
 * Creates a left/right scroll navigation button.
 *
 * @param {string} direction - Button type: "scroll-left" or "scroll-right"
 * @returns {HTMLElement} A <button> element with a directional arrow
 */
export function createScrollButton(direction) {
  const btn = document.createElement("button");
  btn.className = `scroll-btn ${direction}`;
  // Use HTML entities for arrows
  btn.innerHTML = direction === "scroll-left" ? "&#10094;" : "&#10095;";
  return btn;
}

/**
 * Attaches scroll event listeners to all card containers on the page.
 */
export function attachScrollButtonListeners() {
  document.querySelectorAll(".wrapper").forEach((wrapper) => {
    const cardContainer = wrapper.querySelector(".card-container");
    const leftBtn = wrapper.querySelector(".scroll-left");
    const rightBtn = wrapper.querySelector(".scroll-right");

    if (!cardContainer || !leftBtn || !rightBtn) return;

    // Show buttons on hover
    wrapper.addEventListener("mouseenter", () =>
      wrapper.classList.add("show-buttons")
    );
    wrapper.addEventListener("mouseleave", () =>
      wrapper.classList.remove("show-buttons")
    );

    // Scroll on button click
    leftBtn.addEventListener("click", () =>
      cardContainer.scrollBy({ left: -1200, behavior: "smooth" })
    );
    rightBtn.addEventListener("click", () =>
      cardContainer.scrollBy({ left: 1200, behavior: "smooth" })
    );
  });
}
