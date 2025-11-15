import { ChartBar, Database } from "@phosphor-icons/react";
import { ValTownIcon } from "./icon";
import { BoardVisual, GeneralVisual, SQLiteVisual } from "./visual";

export function getDatabaseFriendlyName(type: string) {
  if (type === "valtown") return "ValTown";
  if (type === "board") return "Board";

  return type;
}

export function getDatabaseIcon(type: string) {
  if (type === "valtown") return ValTownIcon;
  if (type === "board") return ChartBar;

  return Database;
}

export function getDatabaseVisual(type: string) {
  if (type === "valtown") return SQLiteVisual;
  if (type === "board") return BoardVisual;

  return GeneralVisual;
}

export function getDatabaseColor() {
  return "default";
}
