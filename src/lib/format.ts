export function formatYears(birthYear: number | null, deathYear: number | null): string {
  if (birthYear && deathYear) return `${birthYear}–${deathYear}`;
  if (birthYear) return `b. ${birthYear}`;
  if (deathYear) return `d. ${deathYear}`;
  return "";
}

export function formatCityState(city: string | null, state: string | null): string {
  if (city && state) return `${city}, ${state}`;
  return city ?? state ?? "";
}
