import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

/**
 * Custom icon set ported from the RetrouveCI Claude Design mockup.
 * 24px grid, single-stroke, rendered with `react-native-svg`.
 * This is the ONLY icon source for the app (no lucide / expo icons).
 */
const ICON_PATHS = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>',
  scan: '<path d="M3 8V5a2 2 0 0 1 2-2h3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M21 16v3a2 2 0 0 1-2 2h-3"/><rect x="7" y="8" width="10" height="8" rx="1.4"/>',
  list: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><circle cx="3.5" cy="6" r="1.2"/><circle cx="3.5" cy="12" r="1.2"/><circle cx="3.5" cy="18" r="1.2"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>',
  qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3"/><path d="M21 14v.01"/><path d="M14 21h3"/><path d="M21 17v4"/>',
  camera:
    '<path d="M4 8a2 2 0 0 1 2-2h1.5l1.2-1.8a1 1 0 0 1 .83-.45h5a1 1 0 0 1 .83.45L16.5 6H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><circle cx="12" cy="12.5" r="3.5"/>',
  bell: '<path d="M18 9a6 6 0 1 0-12 0c0 6-2.5 8-2.5 8h17S18 15 18 9Z"/><path d="M10.5 20.5a2 2 0 0 0 3 0"/>',
  pin: '<path d="M12 21s-6.5-5.5-6.5-10.5a6.5 6.5 0 1 1 13 0C18.5 15.5 12 21 12 21Z"/><circle cx="12" cy="10.5" r="2.4"/>',
  close: '<path d="M6 6 18 18"/><path d="M18 6 6 18"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  chevR: '<path d="m9 5 7 7-7 7"/>',
  chevL: '<path d="m15 5-7 7 7 7"/>',
  chevD: '<path d="m5 9 7 7 7-7"/>',
  filter: '<path d="M4 6h16"/><path d="M7 12h10"/><path d="M10 18h4"/>',
  phone:
    '<path d="M6.5 3.5h4l1.5 4-2.2 1.5a12 12 0 0 0 5.2 5.2l1.5-2.2 4 1.5v4a2 2 0 0 1-2 2A16.5 16.5 0 0 1 4.5 5.5a2 2 0 0 1 2-2Z"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2.2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff:
    '<path d="M4 4 20 20"/><path d="M9.5 5.8A9.7 9.7 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-2.6 3.3M6.4 7.6A15.8 15.8 0 0 0 2.5 12S6 18.5 12 18.5a9.6 9.6 0 0 0 3-.5"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  edit: '<path d="M4 20h4l10-10-4-4L4 16Z"/><path d="m13.5 6.5 4 4"/>',
  trash:
    '<path d="M4 7h16"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/>',
  logout:
    '<path d="M15 4h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-2"/><path d="M10 12H3"/><path d="m6 8-4 4 4 4"/>',
  settings:
    '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4 5.3 5.3"/>',
  shield: '<path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6Z"/><path d="m9 12 2 2 4-4"/>',
  share:
    '<circle cx="6" cy="12" r="2.5"/><circle cx="17" cy="6" r="2.5"/><circle cx="17" cy="18" r="2.5"/><path d="m8.3 11 6.4-3.6M8.3 13l6.4 3.6"/>',
  arrowR: '<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',
  tag: '<path d="M3.5 11.5 11 4h7v7l-7.5 7.5a2 2 0 0 1-2.8 0l-4.2-4.2a2 2 0 0 1 0-2.8Z"/><circle cx="14.5" cy="7.5" r="1.3"/>',
  package:
    '<path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5Z"/><path d="m3.5 7.5 8.5 4.5 8.5-4.5"/><path d="M12 21v-9"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  send: '<path d="m4 12 16-7-7 16-2.5-6.5L4 12Z"/>',
  flash: '<path d="M13 3 5 13h6l-1 8 8-10h-6Z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 7.8v.2"/>',
  whatsapp:
    '<path d="M4 20.5 5.5 16a8 8 0 1 1 3 3Z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5 1 0 1.5-1 1.5-1.5l-2-1-1 1c-1 0-2.5-1.5-2.5-2.5l1-1-1-2c-.5 0-1.5.5-1.5 1.5Z"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2 12h2.5M19.5 12H22M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>',
  refresh:
    '<path d="M20 11a8 8 0 0 0-14-4.5L4 8"/><path d="M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14 4.5L20 16"/><path d="M20 20v-4h-4"/>',
  image:
    '<rect x="3.5" y="4.5" width="17" height="15" rx="2.2"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="m4.5 17 4.5-4.5 3 3 3.5-3.5 4 4"/>',
  calendar:
    '<rect x="4" y="5.5" width="16" height="15" rx="2.2"/><path d="M4 10h16"/><path d="M8 3.5v4"/><path d="M16 3.5v4"/>',
  globe:
    '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.5 2.4 3.8 5.4 3.8 8.5S14.5 18.1 12 20.5c-2.5-2.4-3.8-5.4-3.8-8.5S9.5 5.9 12 3.5Z"/>',
} as const;

export type IconName = keyof typeof ICON_PATHS;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const PATH_RE = /<path d="([^"]+)"/g;
const CIRCLE_RE = /<circle cx="([^"]+)" cy="([^"]+)" r="([^"]+)"/g;
const RECT_RE =
  /<rect x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)"(?:\s+rx="([^"]+)")?/g;

/** Parse the SVG markup string into ordered react-native-svg primitives. */
function renderShapes(markup: string, color: string, strokeWidth: number) {
  const shared = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none' as const,
  };
  const elements: React.ReactElement[] = [];
  let key = 0;
  let m: RegExpExecArray | null;

  PATH_RE.lastIndex = 0;
  while ((m = PATH_RE.exec(markup)) !== null) {
    elements.push(<Path key={`p${key++}`} d={m[1]} {...shared} />);
  }
  CIRCLE_RE.lastIndex = 0;
  while ((m = CIRCLE_RE.exec(markup)) !== null) {
    elements.push(
      <Circle
        key={`c${key++}`}
        cx={parseFloat(m[1])}
        cy={parseFloat(m[2])}
        r={parseFloat(m[3])}
        {...shared}
      />,
    );
  }
  RECT_RE.lastIndex = 0;
  while ((m = RECT_RE.exec(markup)) !== null) {
    elements.push(
      <Rect
        key={`r${key++}`}
        x={parseFloat(m[1])}
        y={parseFloat(m[2])}
        width={parseFloat(m[3])}
        height={parseFloat(m[4])}
        rx={m[5] ? parseFloat(m[5]) : 0}
        {...shared}
      />,
    );
  }
  return elements;
}

export function Icon({ name, size = 24, color = '#14171A', strokeWidth = 2 }: IconProps) {
  const markup = ICON_PATHS[name];
  if (!markup) return null;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {renderShapes(markup, color, strokeWidth)}
    </Svg>
  );
}

export { ICON_PATHS };
