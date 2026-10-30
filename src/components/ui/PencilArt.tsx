"use client";

import { useId } from "react";

/**
 * A properly drawn hexagonal pencil, tip at (0, 0), lying along +x and 118 units long.
 * Three facets of lacquer, a scalloped sharpened edge, a crimped ferrule, a worn eraser.
 * Colours are fixed on purpose: it's an object on the page, not part of the theme.
 */
export function PencilArt() {
  const id = useId().replace(/:/g, "");
  const wood = `${id}-wood`;
  const metal = `${id}-metal`;
  const rubber = `${id}-rubber`;

  return (
    <>
      <defs>
        <linearGradient id={wood} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3dcb8" />
          <stop offset="0.55" stopColor="#e2bf8f" />
          <stop offset="1" stopColor="#b98f5f" />
        </linearGradient>
        <linearGradient id={metal} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4f5f7" />
          <stop offset="0.3" stopColor="#c9cdd4" />
          <stop offset="0.62" stopColor="#9aa0aa" />
          <stop offset="1" stopColor="#6c727c" />
        </linearGradient>
        <linearGradient id={rubber} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7b9b4" />
          <stop offset="0.55" stopColor="#e88f8b" />
          <stop offset="1" stopColor="#c56a68" />
        </linearGradient>
      </defs>

      {/* sharpened wood, scalloped where it meets each lacquer facet */}
      <path d="M1 -0.6L21 -6.6V6.6L1 0.6Z" fill={`url(#${wood})`} />

      {/* the three visible facets of the barrel */}
      <path d="M21 -6.6H90V-2.2H23.2Q21.6 -4.6 21 -6.6Z" fill="#f9d36a" />
      <path d="M23.2 -2.2H90V2.2H23.2Q24.6 0 23.2 -2.2Z" fill="#f0b429" />
      <path d="M23.2 2.2H90V6.6H21Q21.6 4.6 23.2 2.2Z" fill="#c98b14" />

      {/* graphite */}
      <path d="M0 0L6.4 -1.95Q7.2 0 6.4 1.95Z" fill="#2c2d31" />

      {/* ferrule */}
      <rect x="90" y="-6.9" width="14" height="13.8" rx="0.8" fill={`url(#${metal})`} />
      <path d="M93.5 -6.9V6.9M96.2 -6.9V6.9M99 -6.9V6.9" stroke="#6c727c" strokeWidth="0.7" strokeOpacity="0.7" />

      {/* eraser, a little worn at the end */}
      <path d="M104 -6.4H113Q118 -6 118 0Q118 6 113 6.4H104Z" fill={`url(#${rubber})`} />
    </>
  );
}
