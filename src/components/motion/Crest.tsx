"use client";
// Placeholder crest drawn to the same structure as a real school crest:
// crown, quartered shield (star / lamp / open book), laurel branches, motto.
// Replace CREST_STROKES with paths from your own crest SVG (keep viewBox 240×290).
export const CREST_VIEWBOX = "0 0 240 290";

const leaf = (x: number, y: number, a: number) =>
  `M${x} ${y} q${-7 * a} -6 ${-5 * a} -15 q${7 * a} 5 ${5 * a} 15`;
const leaves: Array<[number, number]> = [
  [28, 222],
  [20, 196],
  [17, 168],
  [21, 140],
  [32, 118],
];

export type CrestStroke = { d: string; shield?: boolean; mirror?: boolean };

export const CREST_STROKES: CrestStroke[] = [
  { d: "M90 32 L98 14 L109 26 L120 8 L131 26 L142 14 L150 32 Z" }, // crown
  { d: "M120 40 H190 V130 C190 185 160 222 120 244 C80 222 50 185 50 130 V40 Z", shield: true },
  { d: "M50 100 H190 M120 40 V100" }, // quarters
  { d: "M85 56 L88.5 65.1 L98.3 65.7 L90.7 71.9 L93.2 81.3 L85 76 L76.8 81.3 L79.3 71.9 L71.7 65.7 L81.5 65.1 Z" }, // star
  { d: "M155 90 C144 79 151 68 155 56 C159 68 166 79 155 90 Z M147 95 H163" }, // lamp flame
  { d: "M82 150 Q101 142 120 152 Q139 142 158 150 V190 Q139 182 120 192 Q101 182 82 190 Z M120 152 V192" }, // book
  { d: "M52 250 C20 226 12 164 38 108" }, // laurel stem L
  { d: leaves.map(([x, y], i) => leaf(x + i * 0.5, y, 1)).join(" ") },
  { d: "M52 250 C20 226 12 164 38 108", mirror: true }, // laurel stem R
  { d: leaves.map(([x, y], i) => leaf(x + i * 0.5, y, 1)).join(" "), mirror: true },
];

export const MIRROR = "translate(240 0) scale(-1 1)";

export default function Crest({
  motto = "Scientia et Virtus",
  className = "",
}: {
  motto?: string;
  className?: string;
}) {
  return (
    <svg viewBox={CREST_VIEWBOX} className={className} role="img" aria-label="School crest">
      {CREST_STROKES.map((s, i) => (
        <path
          key={i}
          d={s.d}
          transform={s.mirror ? MIRROR : undefined}
          fill={s.shield ? "#C9A24B22" : "none"}
          stroke="#C9A24B"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      <text
        x="120"
        y="280"
        textAnchor="middle"
        fontSize="13"
        letterSpacing="3"
        fill="#C9A24B"
        fontFamily="serif"
      >
        {motto}
      </text>
    </svg>
  );
}
