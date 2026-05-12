/**
 * Icons in `public/icons/` for flooring-material wizard options (CMS labels).
 */

const EXACT: Record<string, string> = {
  vinyl: "/icons/vinyl.png",
  carpet: "/icons/carpet.png",
  hardwood: "/icons/hardwood.png",
  laminate: "/icons/laminate.png",
  tile: "/icons/tile.png",
};

export function getMaterialOptionIconSrc(
  optionLabel: string,
): string | undefined {
  const key = optionLabel.trim().toLowerCase();
  if (EXACT[key]) return EXACT[key];

  const t = optionLabel.toLowerCase();
  if (t.includes("vinyl") || t.includes("lvp")) return "/icons/vinyl.svg";
  if (t.includes("walk")) return "/icons/wis.png";
  if (t.includes("tub-to") ) return "/icons/wit-to-wis.png";
  if (t.includes("shower only")) return "/icons/shower.png";
  if (t.includes("tub only")) return "/icons/tub.png";
  if (t.includes("tub-shower")) return "/icons/wit-to-wis.png";
  if (t.includes("laminate")) return "/icons/laminate.svg";
  if (t.includes("hardwood")) return "/icons/hardwood.svg";
  if (t.includes("carpet")) return "/icons/carpet.svg";
  if (t.includes("tile") || t.includes("porcelain") || t.includes("ceramic"))
    return "/icons/tile.svg";

  return undefined;
}
