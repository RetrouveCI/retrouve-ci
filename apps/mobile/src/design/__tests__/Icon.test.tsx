import { render } from '@testing-library/react-native';

import { Icon } from '@/design/Icon';

/** Recursively count rendered host nodes by their (RNSVG*) type name. */
function countTypes(node: unknown, acc: Record<string, number> = {}): Record<string, number> {
  if (!node) return acc;
  if (Array.isArray(node)) {
    node.forEach((n) => countTypes(n, acc));
    return acc;
  }
  const n = node as { type?: string; children?: unknown; props?: Record<string, unknown> };
  if (n.type) acc[n.type] = (acc[n.type] ?? 0) + 1;
  if (n.children) countTypes(n.children, acc);
  return acc;
}

describe('Icon', () => {
  it('renders an Svg root for a known icon', async () => {
    const { toJSON } = await render(<Icon name="home" />);
    expect(countTypes(toJSON()).RNSVGSvgView).toBe(1);
  });

  it('parses every shape in a mixed path/circle/rect icon', async () => {
    // `scan` = 4 <path> + 1 <rect>; `list` = 3 <path> + 3 <circle>.
    const scan = countTypes((await render(<Icon name="scan" />)).toJSON());
    expect(scan.RNSVGPath).toBe(4);
    expect(scan.RNSVGRect).toBe(1);

    const list = countTypes((await render(<Icon name="list" />)).toJSON());
    expect(list.RNSVGPath).toBe(3);
    expect(list.RNSVGCircle).toBe(3);
  });

  it('renders nothing extra for an icon with only paths', async () => {
    const close = countTypes((await render(<Icon name="close" />)).toJSON());
    expect(close.RNSVGPath).toBe(2);
    expect(close.RNSVGCircle).toBeUndefined();
    expect(close.RNSVGRect).toBeUndefined();
  });
});
