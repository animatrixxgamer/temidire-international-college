/** Shown wherever a photo has not been uploaded yet, so no <img> ever dead-ends. */
export const IMAGE_PLACEHOLDER = "/images/placeholder.svg";

/**
 * onError for <img>: swap in the local placeholder exactly once.
 * Keeps every image link on the site resolving even before real photos land.
 */
export function onImgError(e: { currentTarget: HTMLImageElement }) {
  const el = e.currentTarget;
  if (el.dataset.fallback === "1") return;
  el.dataset.fallback = "1";
  el.src = IMAGE_PLACEHOLDER;
}
