import type { GameId } from "@/lib/store";

/** Tiny looping previews for the arcade cabinets, drawn in the current theme's colours. */
export function GameArt({ id }: { id: GameId }) {
  return (
    <svg viewBox="0 0 160 100" className="h-full w-full" aria-hidden>
      {id === "dodge" && (
        <>
          <circle cx="80" cy="50" r="33" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeDasharray="3 4" />
          <rect x="74" y="44" width="12" height="12" fill="currentColor" />
          <g className="art-orbit">
            <rect x="109" y="46" width="8" height="8" fill="var(--accent)" />
          </g>
          {[
            [28, 22],
            [130, 80],
            [38, 78],
            [122, 18],
          ].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="5" height="5" fill="var(--danger)" className="art-pop" style={{ animationDelay: `${i * 0.5}s` }} />
          ))}
        </>
      )}

      {id === "bugs" &&
        Array.from({ length: 12 }, (_, i) => {
          const x = 26 + (i % 4) * 28;
          const y = 16 + Math.floor(i / 4) * 24;
          return (
            <g key={i}>
              <rect x={x} y={y} width="22" height="18" fill="none" stroke="currentColor" strokeOpacity="0.3" />
              {i % 3 !== 1 && (
                <rect
                  x={x + 6}
                  y={y + 4}
                  width="10"
                  height="10"
                  fill={i % 3 === 0 ? "var(--accent)" : "var(--danger)"}
                  className="art-pop"
                  style={{ animationDelay: `${(i * 0.37) % 2.4}s` }}
                />
              )}
            </g>
          );
        })}

      {id === "stack" && (
        <>
          {[
            [40, 80, 80],
            [46, 66, 72],
            [52, 52, 62],
            [56, 38, 52],
          ].map(([x, y, w], i) => (
            <rect key={i} x={x} y={y} width={w} height="12" fill="currentColor" fillOpacity={0.45 + i * 0.15} />
          ))}
          <rect x="58" y="22" width="44" height="12" fill="var(--accent)" className="art-slide" />
        </>
      )}

      {id === "sprint" &&
        [
          [22, 22, 92],
          [34, 38, 74],
          [34, 54, 102],
          [22, 70, 54],
        ].map(([x, y, w], i) => (
          <path
            key={i}
            d={`M${x} ${y}h${w}`}
            stroke={i === 2 ? "var(--accent)" : "currentColor"}
            strokeWidth="6"
            pathLength={1}
            className="art-type"
            style={{ animationDelay: `${i * 0.5}s` }}
          />
        ))}

      {id === "memory" &&
        Array.from({ length: 8 }, (_, i) => {
          const x = 30 + (i % 4) * 26;
          const y = 16 + Math.floor(i / 4) * 36;
          const shown = i === 1 || i === 6;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width="20"
              height="30"
              fill={shown ? "var(--accent)" : "currentColor"}
              fillOpacity={shown ? 1 : 0.28}
              className={shown ? "art-flip" : undefined}
              style={shown ? { animationDelay: `${i * 0.4}s` } : undefined}
            />
          );
        })}
    </svg>
  );
}
