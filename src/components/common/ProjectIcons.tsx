// components/common/projectIcons.tsx
import {
  RiBookLine,
  RiSwordLine,
  RiShieldLine,
  RiGhostLine,
  RiPlanetLine,
  RiStarLine,
  RiFlashlightLine,
  RiVipCrownLine,
} from "react-icons/ri";
import type { ComponentType } from "react";

export const PROJECT_ICONS: Record<
  string,
  ComponentType<{ className?: string }>
> = {
  book: RiBookLine,
  sword: RiSwordLine,
  shield: RiShieldLine,
  crown: RiVipCrownLine,
  ghost: RiGhostLine,
  planet: RiPlanetLine,
  star: RiStarLine,
  bolt: RiFlashlightLine,
};

export const PROJECT_ICON_KEYS = Object.keys(PROJECT_ICONS);

export function ProjectIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = PROJECT_ICONS[name] ?? RiBookLine;
  return <Icon className={className} />;
}