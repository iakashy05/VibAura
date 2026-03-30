import {
  createSectionElement,
  attachScrollButtonListeners,
  createSkeletonSection,
} from "../componentBuilder.js";
import { getContentArea } from "./utils.js";

let cachedHomepageData = null;

/**
 * Renders the home page with trending content and album sections.
 */
export async function renderHomePage() {
  const contentArea = getContentArea();
  if (!contentArea) {
    console.error("[PageRenderer] ERROR: album-sections element not found!");
    return;
  }

  document.body.classList.remove("playlist-view-active");

  if (cachedHomepageData) {
    contentArea.innerHTML = "";
    cachedHomepageData.forEach((section) => {
      const items = section.songs || section.items;
      if (items && items.length > 0) {
        if (!section.songs) section.songs = items;
        contentArea.appendChild(createSectionElement(section));
      }
    });
    attachScrollButtonListeners();
    return;
  }

  contentArea.innerHTML = "";

  const placeholders = [
    createSkeletonSection(),
    createSkeletonSection(),
    createSkeletonSection(),
    createSkeletonSection(),
    createSkeletonSection(),
    createSkeletonSection(),
  ];
  placeholders.forEach((s) => contentArea.appendChild(s));

  try {
    const response = await fetch("/api/homepage");
    if (!response.ok) throw new Error("Failed to fetch homepage data");

    const homepageSections = await response.json();
    cachedHomepageData = homepageSections;

    contentArea.innerHTML = "";

    homepageSections.forEach((section) => {
      const items = section.songs || section.items;
      if (items && items.length > 0) {
        if (!section.songs) section.songs = items;
        contentArea.appendChild(createSectionElement(section));
      }
    });

    attachScrollButtonListeners();
  } catch (error) {
    console.error("Error rendering home page:", error);
    contentArea.innerHTML = `
      <div class="page-view">
        <p class="error-message">Could not load homepage content. Please try again later.</p>
      </div>`;
  }
}
