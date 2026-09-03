export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Maps each profile id to a display name, appending the email only when another profile shares the same name. */
export function disambiguateNames<T extends { id: string; name: string; email: string }>(
  list: T[]
): Map<string, string> {
  const counts = new Map<string, number>();
  for (const item of list) counts.set(item.name, (counts.get(item.name) ?? 0) + 1);
  return new Map(
    list.map((item) => [
      item.id,
      (counts.get(item.name) ?? 0) > 1 ? `${item.name} \u2014 ${item.email}` : item.name,
    ])
  );
}
