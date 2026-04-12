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

  if (cachedHomepageData) {
    contentArea.innerHTML = "";
    const fragment = document.createDocumentFragment();
    cachedHomepageData.forEach((section) => {
      const items = section.songs || section.items;
      if (items && items.length > 0) {
        if (!section.songs) section.songs = items;
        fragment.appendChild(createSectionElement(section));
      }
    });
    contentArea.appendChild(fragment);
    attachScrollButtonListeners();
    return;
  }

  contentArea.innerHTML = "";
  const skeletonFragment = document.createDocumentFragment();
  for (let i = 0; i < 6; i++) {
    skeletonFragment.appendChild(createSkeletonSection());
  }
  contentArea.appendChild(skeletonFragment);

  try {
    const response = await fetch("/api/homepage");
    if (!response.ok) throw new Error("Failed to fetch homepage data");

    const homepageSections = await response.json();
    cachedHomepageData = homepageSections;

    contentArea.innerHTML = "";
    const fragment = document.createDocumentFragment();
    homepageSections.forEach((section) => {
      const items = section.songs || section.items;
      if (items && items.length > 0) {
        if (!section.songs) section.songs = items;
        fragment.appendChild(createSectionElement(section));
      }
    });
    contentArea.appendChild(fragment);

    attachScrollButtonListeners();
  } catch (error) {
    console.error("Error rendering home page:", error);
    contentArea.innerHTML = `
      <div class="page-view">
        <p class="error-message">Could not load homepage content. Please try again later.</p>
      </div>`;
  }
}
