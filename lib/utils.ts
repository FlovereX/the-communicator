export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
