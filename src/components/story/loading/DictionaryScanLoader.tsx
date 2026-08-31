import { type ReactNode } from "react";

const INK = "#243428";
const PAPER = "#fff8e8";
const PAPER_WARM = "#fff4d6";
const MAGIC = "#0f8a7a";
const REWARD = "#d4920a";
const AMBER = "#e8a830";
const AMBER_SOFT = "#f5c842";
const SKY = "#4e8fbf";

const FONT_SIZE = 9.5;
const WORD_WIDTH = 28;
const ICON_SIZE = 16;
const ENTRY_GAP = 8;
const ENTRY_WIDTH = WORD_WIDTH + ENTRY_GAP + ICON_SIZE;

const LEFT_PAGE_CENTER = 44;
const RIGHT_PAGE_CENTER = 116;
const ROW_Y = [30, 50, 70, 90] as const;

function TinyStar({ cx, cy, r = 3 }: { cx: number; cy: number; r?: number }) {
  return (
    <path
      d={`M${cx} ${cy - r} L${cx + r * 0.35} ${cy - r * 0.35} L${cx + r} ${cy} L${cx + r * 0.35} ${cy + r * 0.35} L${cx} ${cy + r} L${cx - r * 0.35} ${cy + r * 0.35} L${cx - r} ${cy} L${cx - r * 0.35} ${cy - r * 0.35} Z`}
      fill={REWARD}
      opacity="0.75"
    />
  );
}

/** Hand-drawn marker stroke behind an entry */
function MarkerHighlight({ className, d }: { className: string; d: string }) {
  return (
    <path
      className={className}
      d={d}
      fill={MAGIC}
      fillOpacity="0.28"
      stroke={MAGIC}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0"
    />
  );
}

function DictEntry({
  pageCenter,
  rowY,
  word,
  children,
}: {
  pageCenter: number;
  rowY: number;
  word: string;
  children: ReactNode;
}) {
  const wordX = pageCenter - ENTRY_WIDTH / 2;
  const iconX = wordX + WORD_WIDTH + ENTRY_GAP;

  return (
    <g>
      <text
        x={wordX}
        y={rowY}
        fontSize={FONT_SIZE}
        fontWeight="700"
        fill={INK}
        fontFamily="Grandstander, Lexend, sans-serif"
        letterSpacing="0.03em"
      >
        {word}
      </text>
      <g transform={`translate(${iconX}, ${rowY - ICON_SIZE / 2})`}>
        {children}
      </g>
    </g>
  );
}

/** Icons drawn in a 16×16 box — vertical center at y=8 matches text baseline */
function IconAero() {
  return (
    <>
      <path
        d="M2 8 L14 5 L12 8 L14 11 L2 8 Z"
        fill={SKY}
        fillOpacity="0.5"
        stroke={INK}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M5 8 L11 7"
        fill="none"
        stroke={INK}
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.5"
      />
    </>
  );
}

function IconBall() {
  return (
    <>
      <circle
        cx="8"
        cy="8"
        r="5.5"
        fill={REWARD}
        fillOpacity="0.4"
        stroke={INK}
        strokeWidth="1.5"
      />
      <path
        d="M3 8 Q8 3 13 8"
        fill="none"
        stroke={INK}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M3 8 Q8 13 13 8"
        fill="none"
        stroke={INK}
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.35"
      />
    </>
  );
}

function IconCat() {
  return (
    <>
      <circle
        cx="8"
        cy="9"
        r="4.5"
        fill={MAGIC}
        fillOpacity="0.3"
        stroke={INK}
        strokeWidth="1.5"
      />
      <path
        d="M4.5 5.5 L5.5 8 L3.5 8 Z"
        fill={MAGIC}
        fillOpacity="0.45"
        stroke={INK}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M11.5 5.5 L12.5 8 L10.5 8 Z"
        fill={MAGIC}
        fillOpacity="0.45"
        stroke={INK}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="6.5" cy="9" r="0.9" fill={INK} />
      <circle cx="9.5" cy="9" r="0.9" fill={INK} />
      <path
        d="M7 11 Q8 11.6 9 11"
        fill="none"
        stroke={INK}
        strokeWidth="0.9"
        strokeLinecap="round"
        opacity="0.6"
      />
    </>
  );
}

function IconDuck() {
  return (
    <>
      <ellipse
        cx="7"
        cy="9.5"
        rx="4.5"
        ry="3.5"
        fill={SKY}
        fillOpacity="0.45"
        stroke={INK}
        strokeWidth="1.5"
      />
      <circle
        cx="11"
        cy="7"
        r="2.5"
        fill={SKY}
        fillOpacity="0.5"
        stroke={INK}
        strokeWidth="1.5"
      />
      <path
        d="M13 7.2 L14.5 7.5 L13 7.8 Z"
        fill={REWARD}
        fillOpacity="0.7"
        stroke={INK}
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </>
  );
}

function IconFish() {
  return (
    <>
      <ellipse
        cx="9"
        cy="8"
        rx="4.5"
        ry="3"
        fill={SKY}
        fillOpacity="0.45"
        stroke={INK}
        strokeWidth="1.5"
      />
      <path
        d="M3.5 8 L1.5 5.5 L1.5 10.5 Z"
        fill={SKY}
        fillOpacity="0.5"
        stroke={INK}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="11.5" cy="7.5" r="0.9" fill={INK} />
    </>
  );
}

function IconHome() {
  return (
    <>
      <path
        d="M3 10 L8 5 L13 10"
        fill="none"
        stroke={INK}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="5"
        y="10"
        width="6"
        height="5"
        rx="1"
        fill={REWARD}
        fillOpacity="0.4"
        stroke={INK}
        strokeWidth="1.5"
      />
      <rect
        x="7"
        y="12"
        width="2"
        height="3"
        rx="0.5"
        fill={INK}
        opacity="0.5"
      />
    </>
  );
}

function IconNest() {
  return (
    <>
      <path
        d="M2 12 C4.5 9 11.5 9 14 12 C11.5 10.5 4.5 10.5 2 12 Z"
        fill={REWARD}
        fillOpacity="0.45"
        stroke={INK}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle
        cx="8"
        cy="10"
        r="2"
        fill={PAPER}
        stroke={INK}
        strokeWidth="1.2"
      />
    </>
  );
}

function IconStar() {
  return <TinyStar cx={8} cy={8} r={5} />;
}

function rowHighlightPath(pageCenter: number, rowY: number) {
  const padX = 4;
  const padY = 3;
  const left = pageCenter - ENTRY_WIDTH / 2 - padX;
  const right = pageCenter + ENTRY_WIDTH / 2 + padX;
  const top = rowY - ICON_SIZE / 2 - padY;
  const bottom = rowY + ICON_SIZE / 2 + padY;

  return `M${left + 4} ${top + 2} Q${left + 6} ${top} ${right - 4} ${top + 1} Q${right} ${top + 3} ${right - 2} ${bottom - 1} Q${right - 4} ${bottom + 1} ${left + 4} ${bottom} Q${left} ${bottom - 2} ${left + 4} ${top + 2} Z`;
}

export function DictionaryScanLoader() {
  return (
    <svg
      viewBox="0 0 160 120"
      className="h-full w-full drop-shadow-md"
      aria-hidden
    >
      <ellipse cx="80" cy="116" rx="58" ry="4" fill={INK} opacity="0.08" />

      <g className="loader-dict-pages">
        <path
          d="M10 14 C10 8 16 4 26 4 L72 6 C80 6 86 10 86 18 L84 106 C84 112 78 116 70 116 L24 114 C14 114 8 108 8 100 Z"
          fill={PAPER}
          stroke={INK}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M74 6 C74 4 80 2 88 4 L134 6 C144 6 150 12 150 20 L148 104 C148 112 142 116 132 116 L86 114 C78 114 74 108 74 102 Z"
          fill={PAPER_WARM}
          stroke={INK}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M80 4 C78 40 78 80 80 116"
          fill="none"
          stroke={INK}
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.55"
        />
        <path
          d="M14 108 Q18 112 22 108"
          fill="none"
          stroke={INK}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.35"
        />
      </g>

      {/* Marker highlights — wobbly strokes, behind entries */}
      <MarkerHighlight
        className="loader-dict-highlight-aero"
        d={rowHighlightPath(LEFT_PAGE_CENTER, ROW_Y[0])}
      />
      <MarkerHighlight
        className="loader-dict-highlight-ball"
        d={rowHighlightPath(LEFT_PAGE_CENTER, ROW_Y[1])}
      />
      <MarkerHighlight
        className="loader-dict-highlight-cat"
        d={rowHighlightPath(LEFT_PAGE_CENTER, ROW_Y[2])}
      />
      <MarkerHighlight
        className="loader-dict-highlight-duck"
        d={rowHighlightPath(LEFT_PAGE_CENTER, ROW_Y[3])}
      />
      <MarkerHighlight
        className="loader-dict-highlight-fish"
        d={rowHighlightPath(RIGHT_PAGE_CENTER, ROW_Y[0])}
      />
      <MarkerHighlight
        className="loader-dict-highlight-home"
        d={rowHighlightPath(RIGHT_PAGE_CENTER, ROW_Y[1])}
      />
      <MarkerHighlight
        className="loader-dict-highlight-nest"
        d={rowHighlightPath(RIGHT_PAGE_CENTER, ROW_Y[2])}
      />
      <MarkerHighlight
        className="loader-dict-highlight-star"
        d={rowHighlightPath(RIGHT_PAGE_CENTER, ROW_Y[3])}
      />

      {/* Left page — AERO, BALL, CAT, DUCK */}
      <DictEntry pageCenter={LEFT_PAGE_CENTER} rowY={ROW_Y[0]} word="AERO">
        <IconAero />
      </DictEntry>
      <DictEntry pageCenter={LEFT_PAGE_CENTER} rowY={ROW_Y[1]} word="BALL">
        <IconBall />
      </DictEntry>
      <DictEntry pageCenter={LEFT_PAGE_CENTER} rowY={ROW_Y[2]} word="CAT">
        <IconCat />
      </DictEntry>
      <DictEntry pageCenter={LEFT_PAGE_CENTER} rowY={ROW_Y[3]} word="DUCK">
        <IconDuck />
      </DictEntry>

      {/* Right page — FISH, HOME, NEST, STAR */}
      <DictEntry pageCenter={RIGHT_PAGE_CENTER} rowY={ROW_Y[0]} word="FISH">
        <IconFish />
      </DictEntry>
      <DictEntry pageCenter={RIGHT_PAGE_CENTER} rowY={ROW_Y[1]} word="HOME">
        <IconHome />
      </DictEntry>
      <DictEntry pageCenter={RIGHT_PAGE_CENTER} rowY={ROW_Y[2]} word="NEST">
        <IconNest />
      </DictEntry>
      <DictEntry pageCenter={RIGHT_PAGE_CENTER} rowY={ROW_Y[3]} word="STAR">
        <IconStar />
      </DictEntry>

      <TinyStar cx={6} cy={10} r={2.5} />
      <TinyStar cx={154} cy={14} r={2} />

      {/* Magnifying glass — base at left-page scan column */}
      <g className="loader-dict-glass">
        {/* Handle — layered for a soft, tactile grip */}
        <path
          d="M54 65 L66 78"
          stroke={INK}
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M54 65 L66 78"
          stroke={AMBER}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.55"
        />

        {/* Lens depth shadow */}
        <circle cx="42" cy="54.5" r="17" fill={INK} opacity="0.07" />

        {/* Glass body — cool tint inside warm rim */}
        <circle cx="42" cy="54" r="15" fill={SKY} fillOpacity="0.1" />
        <circle cx="42" cy="54" r="15" fill={MAGIC} fillOpacity="0.07" />

        {/* Warm amber rim — thick, soft frame */}
        <circle
          cx="42"
          cy="54"
          r="16"
          fill="none"
          stroke={AMBER}
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <circle
          cx="42"
          cy="54"
          r="16"
          fill="none"
          stroke={AMBER_SOFT}
          strokeWidth="2"
          opacity="0.65"
        />

        {/* Inner lens ring */}
        <circle
          cx="42"
          cy="54"
          r="11"
          fill="none"
          stroke={MAGIC}
          strokeWidth="1.2"
          opacity="0.28"
        />

        {/* Glass shine — upper-left crescent sheen */}
        <path
          d="M31 46 Q26 53 30 60"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.38"
        />
        <path
          d="M33 43 Q30 47 32 51"
          fill="none"
          stroke="white"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.28"
        />

        {/* Handle knob */}
        <circle
          cx="66"
          cy="78"
          r="3"
          fill={AMBER}
          stroke={INK}
          strokeWidth="1.2"
        />
        <circle cx="65.2" cy="77.2" r="1" fill={AMBER_SOFT} opacity="0.7" />
      </g>
    </svg>
  );
}
