/**
 * Icons in `public/icons/` for flooring-material wizard options (CMS labels).
 */

const EXACT: Record<string, string> = {
  vinyl: "/icons/vinyl.svg",
  carpet: "/icons/carpet.svg",
  hardwood: "/icons/hardwood.svg",
  laminate: "/icons/laminate.svg",
  tile: "/icons/tile.svg",
};

export function getMaterialOptionIconSrc(
  optionLabel: string,
): string | undefined {
  const key = optionLabel.trim().toLowerCase();
  if (EXACT[key]) return EXACT[key];

  const t = optionLabel.toLowerCase();
  if (t.includes("vinyl") || t.includes("lvp")) return "/icons/vinyl.svg";
  if (t.includes("laminate")) return "/icons/laminate.svg";
  if (t.includes("hardwood")) return "/icons/hardwood.svg";
  if (t.includes("carpet")) return "/icons/carpet.svg";
  if (t.includes("tile") || t.includes("porcelain") || t.includes("ceramic"))
    return "/icons/tile.svg";

  return undefined;
}
