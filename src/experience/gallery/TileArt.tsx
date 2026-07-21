"use client";

/**
 * Procedural tile covers — no images, every cover is drawn in code
 * from the brand system. Five voices:
 *  type  — oversized mono wordmark bleeding off the tile
 *  ticks — a log-volume meter frozen mid-burst
 *  ring  — concentric perimeter with a live center
 *  grid  — the blueprint floor, seen from above
 *  wave  — a captured signal trace
 */

function Ticks() {
  return (
    <div className="flex h-full items-end gap-[3px] p-6">
      {Array.from({ length: 32 }).map((_, i) => (
        <div
          key={i}
          className="w-full bg-pulse/35 transition-colors duration-500 group-hover:bg-pulse/70"
          style={{ height: `${14 + ((i * 37 + 11) % 61)}%` }}
        />
      ))}
    </div>
  );
}

function Ring() {
  return (
    <div className="relative flex h-full items-center justify-center">
      <div className="absolute h-[62%] w-[62%] rounded-full border border-pulse/35 transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute h-[38%] w-[38%] rounded-full border border-pulse/25 transition-transform duration-700 group-hover:scale-90" />
      <div className="live-dot" />
    </div>
  );
}

function Grid() {
  return <div className="blueprint h-full w-full opacity-80" />;
}

function Wave() {
  const points = Array.from({ length: 48 })
    .map((_, i) => {
      const x = (i / 47) * 100;
      const y =
        50 +
        22 * Math.sin(i * 0.55) * Math.sin(i * 0.13) +
        8 * Math.sin(i * 1.7);
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="h-full w-full p-6"
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.7"
        className="text-pulse opacity-50 transition-opacity duration-500 group-hover:opacity-90"
      />
    </svg>
  );
}

function Type({ text }: { text: string }) {
  return (
    <div className="flex h-full items-end overflow-hidden pl-5">
      <span className="translate-y-[0.18em] font-mono text-[24vw] leading-none whitespace-nowrap text-pulse/20 transition-colors duration-700 group-hover:text-pulse/40 sm:text-[10vw] lg:text-[6.5vw]">
        {text}
      </span>
    </div>
  );
}

export function TileArt({ art, text }: { art: string; text: string }) {
  switch (art) {
    case "ticks":
      return <Ticks />;
    case "ring":
      return <Ring />;
    case "grid":
      return <Grid />;
    case "wave":
      return <Wave />;
    default:
      return <Type text={text} />;
  }
}
