"use client";

// Temidire International College — school crest.
// Navy, gold and ivory. Crown, open book, oil lamp, laurel wreath, motto.
export const CREST_VIEWBOX = "0 0 240 290";

const NAVY = "#13243b";
const GOLD = "#C9A24B";
const IVORY = "#F4EFE6";

/** Outer navy disc behind the emblem */
const SHIELD =
  "M30 50 H210 A90 90 0 1 0 30 50 Z";

/** Crown: five archi + band, gold fill */
const CROWN =
  "M88 40 L88 22 L96 32 L104 10 L112 32 L120 18 L128 32 L136 10 L144 32 L152 22 L152 40 Z M88 40 H152 V48 H88 Z";

/** Open book: ivory pages, gold spine + cover edges */
const BOOK =
  "M78 152 Q120 142 162 152 L162 192 Q120 182 78 192 Z M120 148 V196 M78 152 H162 M78 152 Q99 147 120 152 Q141 147 162 152 M78 188 Q99 184 120 188 Q141 184 162 188";

/** Oil lamp: gold body + handle, ivory flame */
const LAMP =
  "M138 92 C132 84 134 76 138 70 C142 76 144 84 138 92 Z M133 92 H143 M130 96 C128 104 132 110 138 110 C144 110 148 104 146 96 M138 70 C136 66 140 62 142 62 C144 62 146 66 144 70 Z";

/** Five-point star: gold, upper left quarter */
const STAR =
  "M100 62 L102 68 L108 68 L103 72 L105 78 L100 74 L95 78 L97 72 L92 68 L98 68 Z";

/** Laurel wreath: two stems with 5 leaves each, gold stroke, wrapping the bottom of the shield */
const LAUREL_LEFT =
  "M62 250 C44 228 38 188 58 150 M58 150 q-2 -6 -8 -4 M58 150 q2 -6 8 -4 M58 170 q-2 -6 -8 -4 M58 170 q2 -6 8 -4 M58 190 q-2 -6 -8 -4 M58 190 q2 -6 8 -4 M58 210 q-2 -6 -8 -4 M58 210 q2 -6 8 -4 M58 230 q-2 -6 -8 -4 M58 230 q2 -6 8 -4";
const LAUREL_RIGHT =
  "M178 250 C196 228 202 188 182 150 M182 150 q2 -6 8 -4 M182 150 q-2 -6 -8 -4 M182 170 q2 -6 8 -4 M182 170 q-2 -6 -8 -4 M182 190 q2 -6 8 -4 M182 190 q-2 -6 -8 -4 M182 210 q2 -6 8 -4 M182 210 q-2 -6 -8 -4 M182 230 q2 -6 8 -4 M182 230 q-2 -6 -8 -4";

export default function Crest({
  motto = "SCIENTIA  ·  ET  ·  VIRTUS",
  className = "",
}: {
  motto?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox={CREST_VIEWBOX}
      className={className}
      role="img"
      aria-label="Temidire International College crest"
    >
      {/* Outer ring: navy disc + gold rim */}
      <circle cx="120" cy="160" r="110" fill={NAVY} />
      <circle cx="120" cy="160" r="110" fill="none" stroke={GOLD} strokeWidth="6" />
      <circle cx="120" cy="160" r="102" fill="none" stroke={GOLD} strokeWidth="2" />

      {/* Inner ivory field */}
      <circle cx="120" cy="160" r="92" fill={IVORY} />

      {/* Gold laurel wreath wrapping lower half */}
      <path
        d={LAUREL_LEFT}
        fill="none"
        stroke={GOLD}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={LAUREL_RIGHT}
        fill="none"
        stroke={GOLD}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Crown sitting on top of the shield */}
      <path
        d={CROWN}
        fill={GOLD}
        stroke={NAVY}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Central shield emblem: navy rounded panel */}
      <path
        d="M64 96 H176 V200 C176 232 154 252 120 258 C86 252 64 232 64 200 Z"
        fill={NAVY}
        stroke={GOLD}
        strokeWidth="3"
      />

      {/* Open book — ivory pages with gold spine, centred */}
      <g fill="none" stroke={GOLD} strokeWidth="2.5" strokeLinejoin="round">
        <path d={BOOK} />
      </g>

      {/* Oil lamp with flame — to the right of the book */}
      <g fill="none" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d={LAMP} />
      </g>
      <path
        d="M138 70 C136 66 140 62 142 62 C144 62 146 66 144 70 Z"
        fill={IVORY}
        stroke={GOLD}
        strokeWidth="2"
      />

      {/* Five-point star — upper left of emblem */}
      <path d={STAR} fill={GOLD} />

      {/* Motto ribbon below the crest */}
      <path
        d="M40 272 H200 V278 H40 Z"
        fill={NAVY}
        stroke={GOLD}
        strokeWidth="2"
      />
      <text
        x="120"
        y="278"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="11"
        letterSpacing="3"
        fill={GOLD}
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="700"
      >
        {motto}
      </text>

      {/* Small Temidire label top-left */}
      <text
        x="120"
        y="92"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="9"
        letterSpacing="2"
        fill={NAVY}
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="700"
      >
        TEMIDIRE
      </text>
    </svg>
  );
}
