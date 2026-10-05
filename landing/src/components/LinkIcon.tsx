import type { LinkIcon as LinkIconName } from "../types.ts";

type LinkIconProps = {
  name: LinkIconName;
};

export function LinkIcon({ name }: LinkIconProps) {
  if (name === "github") {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path
          fill="currentColor"
          d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8"
        />
      </svg>
    );
  }

  if (name === "telegram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M21.5 4.4 18.2 20c-.2 1-.9 1.3-1.8.8l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.3-8.4c.4-.4-.1-.6-.6-.2L6.3 13.1 1.4 11.6c-1.1-.3-1.1-1.1.2-1.6L20 3.2c.9-.3 1.7.2 1.5 1.2"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        d="M3 12h18M12 3c2.5 2.8 3.8 5.8 3.8 9s-1.3 6.2-3.8 9c-2.5-2.8-3.8-5.8-3.8-9s1.3-6.2 3.8-9"
      />
    </svg>
  );
}

export function iconForLink(href: string, icon?: LinkIconName): LinkIconName {
  if (icon) {
    return icon;
  }

  const url = href.toLowerCase();
  if (url.includes("github.com")) {
    return "github";
  }
  if (url.includes("t.me") || url.includes("telegram")) {
    return "telegram";
  }
  return "site";
}
