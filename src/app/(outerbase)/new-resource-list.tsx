import { ValTownIcon } from "@/components/resource-card/icon";
import { NewResourceType } from "./new-resource-button";

export function getCreateResourceTypeList(
  workspaceId?: string
): NewResourceType[] {
  return [
    {
      name: "val.town",
      icon: ValTownIcon,
      href: workspaceId ? "" : "/local/new-base/valtown",
    },
  ];
}
