/** Minimal className joiner — swap for tailwind-merge when variants grow. */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
