/** Up to two uppercase initials from a person's or team's name, e.g. "Night Owls" → "NO". */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}
