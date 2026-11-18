const UNITS = [
  [86_400, 'd'],
  [3_600, 'h'],
  [60, 'min'],
  [1, 's'],
] as const;

// Time left in its two largest units, a zero second one left out: "5d 23h", "4h 2min", "1d", "45s"; 0 or less is "0s"
export function formatTimeLeft(seconds: number) {
  let rest = Math.max(0, Math.floor(seconds));
  const parts = UNITS.map(([size, suffix]) => {
    const value = Math.floor(rest / size);

    rest -= value * size;

    return [value, suffix] as const;
  });
  const index = parts.findIndex(([value]) => value > 0);
  const first = index < 0 ? parts.length - 1 : index;

  return parts
    .slice(first, first + 2)
    .filter(([value], position) => position === 0 || value > 0)
    .map(([value, suffix]) => `${value}${suffix}`)
    .join(' ');
}
