const DEFAULT_NEXT_PATH = "/meals/new";

export function safeNextPath(value: string | null | undefined): string {
  if (value !== "/meals" && !value?.startsWith("/meals/")) {
    return DEFAULT_NEXT_PATH;
  }

  return value;
}
