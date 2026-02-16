import type { VariantProps } from "class-variance-authority";
import type { badgeVariants } from "@/components/ui/badge";

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

const EPCI_BADGE_MAP: Record<string, BadgeVariant> = {
  CUD: "cud",
  CACF: "cacf",
  CCHF: "cchf",
  CCFL: "ccfl",
  CCRA: "ccra",
};

export function getEpciBadgeVariant(sigle: string): BadgeVariant {
  return EPCI_BADGE_MAP[sigle] || "gray";
}
