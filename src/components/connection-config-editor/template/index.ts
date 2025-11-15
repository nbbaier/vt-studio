import { ConnectionTemplateList } from "@/app/(outerbase)/base-template";
import { ValtownConnectionTemplate } from "./valtown";

export const ConnectionTemplateDictionary: Record<
  string,
  ConnectionTemplateList
> = {
  valtown: ValtownConnectionTemplate,
};
