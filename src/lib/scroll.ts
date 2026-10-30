import type Lenis from "lenis";

/** Shared between the DOM chapters and the WebGL world, without going through React. */
export const worldState = { layer: -1 };

let lenis: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { duration: 1.6 });
  else el.scrollIntoView();
}

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { duration: 2.4 });
  else window.scrollTo({ top: 0 });
}
