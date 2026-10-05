export const SLICES_PER_PIZZA = 6;

type Point = {
  x: number;
  y: number;
};

function polar(cx: number, cy: number, radius: number, deg: number): Point {
  const rad = (deg * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

export function wedgePath(
  cx: number,
  cy: number,
  radius: number,
  startDeg: number,
  endDeg: number,
): string {
  const start = polar(cx, cy, radius, startDeg);
  const end = polar(cx, cy, radius, endDeg);
  return `M ${cx} ${cy} L ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 0 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)} Z`;
}

export function arcPath(
  cx: number,
  cy: number,
  radius: number,
  startDeg: number,
  endDeg: number,
): string {
  const start = polar(cx, cy, radius, startDeg);
  const end = polar(cx, cy, radius, endDeg);
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 0 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

export function pizzaCopy(slices: number): { open: number; owed: string; next: string } {
  const whole = Math.floor(slices / SLICES_PER_PIZZA);
  const open = slices % SLICES_PER_PIZZA;

  let owed = "No pizza owed";
  if (slices > 0 && whole === 0) {
    owed = "No pizza to cash in yet";
  } else if (whole === 1) {
    owed = "1 pizza to cash in";
  } else if (whole > 1) {
    owed = `${whole} pizzas to cash in`;
  }

  return {
    open,
    owed,
    next: `${open} / ${SLICES_PER_PIZZA} on the next one`,
  };
}

export function sliceGeometry(index: number): { wedge: string; crust: string; dot: Point } {
  const gap = 2.6;
  const start = -90 + index * 60 + gap / 2;
  const end = -90 + (index + 1) * 60 - gap / 2;
  const radius = 34;
  const mid = (start + end) / 2;

  return {
    wedge: wedgePath(50, 50, radius, start, end),
    crust: arcPath(50, 50, radius + 1.5, start, end),
    dot: polar(50, 50, radius * 0.58, mid),
  };
}
