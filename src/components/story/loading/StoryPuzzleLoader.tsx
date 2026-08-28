const CREAM = '#FFF8E1';
const INK = '#1E3A2B';
const TEAL = '#4A8B8D';
const HONEY = '#E0A938';
const BLUE = '#5C7DA3';
const SAGE = '#6B8E63';

const STROKE = 1.75;

/**
 * Seam grid: vertical x=70, horizontal y=50.
 * Slots indent into the host piece; knobs cross the seam into the mate.
 */
export function StoryPuzzleLoader() {
  return (
    <svg
      viewBox='0 0 140 100'
      className='h-full w-full drop-shadow-sm'
      aria-hidden
    >
      <g id='background'>
        <rect
          x='6'
          y='6'
          width='128'
          height='88'
          rx='18'
          fill={CREAM}
          stroke={INK}
          strokeWidth={STROKE}
          strokeLinejoin='round'
        />
      </g>

      {/* Flat top + left; male knob on right + bottom */}
      <g id='puzzle-piece-top-left' className='loader-puzzle-tl'>
        <path
          d='
            M 40 28
            Q 40 20 48 20
            L 70 20
            L 70 30
            C 70 33.2 79 33.2 79 37
            C 79 40.8 70 40.8 70 44
            L 70 50
            L 62 50
            C 58 50 58 54.8 55 54.8
            C 52 54.8 52 50 48 50
            L 40 50
            L 40 28
            Z
          '
          fill={TEAL}
          stroke={INK}
          strokeWidth={STROKE}
          strokeLinejoin='round'
          strokeLinecap='round'
        />
      </g>

      {/* Flat top + right; female slot on left; male knob on bottom */}
      <g id='puzzle-piece-top-right' className='loader-puzzle-tr'>
        <path
          d='
            M 70 20
            L 100 20
            Q 100 20 100 28
            L 100 50
            L 90 50
            C 87 50 87 55.2 84 55.2
            C 81 55.2 81 50 78 50
            L 70 50
            L 70 44
            C 70 40.8 79 40.8 79 37
            C 79 33.2 70 33.2 70 30
            L 70 20
            Z
          '
          fill={HONEY}
          stroke={INK}
          strokeWidth={STROKE}
          strokeLinejoin='round'
          strokeLinecap='round'
        />
      </g>

      {/* Female slot on top; flat left + bottom; male knob on right */}
      <g id='puzzle-piece-bottom-left' className='loader-puzzle-bl'>
        <path
          d='
            M 48 50
            C 52 50 52 54.8 55 54.8
            C 58 54.8 58 50 62 50
            L 70 50
            L 70 56
            C 70 59.2 79 59.2 79 63
            C 79 66.8 70 66.8 70 70
            L 70 80
            L 40 80
            Q 40 80 40 72
            L 40 50
            L 48 50
            Z
          '
          fill={BLUE}
          stroke={INK}
          strokeWidth={STROKE}
          strokeLinejoin='round'
          strokeLinecap='round'
        />
      </g>

      {/* Female slot on top + left; flat right + bottom */}
      <g id='puzzle-piece-bottom-right' className='loader-puzzle-br'>
        <path
          d='
            M 70 50
            L 78 50
            C 81 50 81 54.8 84 54.8
            C 87 54.8 87 50 90 50
            L 100 50
            L 100 72
            Q 100 80 92 80
            L 70 80
            L 70 70
            C 70 66.8 79 66.8 79 63
            C 79 59.2 70 59.2 70 56
            L 70 50
            Z
          '
          fill={SAGE}
          stroke={INK}
          strokeWidth={STROKE}
          strokeLinejoin='round'
          strokeLinecap='round'
        />
      </g>
    </svg>
  );
}
