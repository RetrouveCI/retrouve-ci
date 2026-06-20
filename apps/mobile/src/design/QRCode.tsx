import React, { useMemo } from 'react';
import Svg, { Rect } from 'react-native-svg';

/**
 * Deterministic pseudo-random QR-style module grid (decorative — not a real
 * encoder). Ported from the prototype's `qrMatrix`, with the 3 finder patterns.
 */
function qrMatrix(seed: string, n = 21): number[][] {
  let s = 0;
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const m = Array.from({ length: n }, () => Array<number>(n).fill(0));
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) m[y][x] = rand() > 0.52 ? 1 : 0;

  const finder = (oy: number, ox: number) => {
    for (let y = 0; y < 7; y++)
      for (let x = 0; x < 7; x++) {
        const edge = x === 0 || x === 6 || y === 0 || y === 6;
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        m[oy + y][ox + x] = edge || core ? 1 : 0;
      }
    for (let y = -1; y < 8; y++)
      for (let x = -1; x < 8; x++) {
        if (y === -1 || y === 7 || x === -1 || x === 7) {
          const yy = oy + y;
          const xx = ox + x;
          if (yy >= 0 && yy < n && xx >= 0 && xx < n) m[yy][xx] = 0;
        }
      }
  };
  finder(0, 0);
  finder(0, n - 7);
  finder(n - 7, 0);
  return m;
}

interface QRCodeProps {
  value?: string;
  size?: number;
  fg?: string;
  bg?: string;
  pad?: number;
}

export function QRCode({ value = 'RC', size = 120, fg = '#14171A', bg = 'transparent', pad = 0 }: QRCodeProps) {
  const n = 21;
  const m = useMemo(() => qrMatrix(value, n), [value]);
  const cell = (size - pad * 2) / n;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {bg !== 'transparent' ? <Rect x={0} y={0} width={size} height={size} rx={size * 0.12} fill={bg} /> : null}
      {m.flatMap((row, y) =>
        row.map((v, x) =>
          v ? (
            <Rect
              key={`${x}-${y}`}
              x={pad + x * cell}
              y={pad + y * cell}
              width={cell + 0.4}
              height={cell + 0.4}
              fill={fg}
            />
          ) : null,
        ),
      )}
    </Svg>
  );
}
