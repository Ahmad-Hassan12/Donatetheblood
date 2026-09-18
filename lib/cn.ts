export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter((c) => typeof c === "string").join(" ");
}