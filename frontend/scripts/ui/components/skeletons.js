/**
 * Creates a skeleton loading section with placeholder cards.
 * Used to show immediate visual feedback while content is being fetched.
 *
 * @param {string} [title="Loading..."] - Section header text
 * @param {number} [count=8] - Number of placeholder cards to show
 * @returns {HTMLElement} A <section> element containing the skeleton placeholders
 */
export function createSkeletonSection(title = "Loading...", count = 8) {
  const section = document.createElement("section");
  section.classList.add("album-section", "skeleton-section");

  // Generate the HTML for the skeleton cards
  const skeletonCardsHTML = Array.from({ length: count })
    .map(
      () => `
      <div class="skeleton-card">
        <div class="skeleton-img"></div>
        <div class="skeleton-text title"></div>
        <div class="skeleton-text subtitle"></div>
      </div>`
    )
    .join("");

  // Set the inner HTML of the section
  section.innerHTML = `
    <div class="section-header">
      <h2>${title}</h2>
    </div>
    <div class="wrapper">
      <div class="card-container">
        ${skeletonCardsHTML}
      </div>
    </div>
  `;

  return section;
}
