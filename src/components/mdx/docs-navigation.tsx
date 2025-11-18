"use client";
import { LucideAlignJustify } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import type { DocTableContent } from "./docs";

export function DocNavigation({
  content,
  title,
}: {
  content: DocTableContent;
  title?: string;
}) {
  "use client";

  const pathname = usePathname();

  const sideMenu = (
    <div className="flex flex-col gap-2 p-4 text-sm">
      {content.map((contentGroup) => {
        return (
          <div key={contentGroup.title}>
            {contentGroup.href ? (
              <div>
                <Link
                  href={contentGroup.href ?? ""}
                  className={pathname === contentGroup.href ? "font-bold" : ""}
                >
                  {contentGroup.title}
                </Link>
              </div>
            ) : (
              <div>{contentGroup.title}</div>
            )}

            {contentGroup.sub && (
              <ul className="my-1">
                {contentGroup.sub.map((content) => {
                  return (
                    <li
                      key={content.title}
                      className={cn(
                        "border-l border-gray-200 py-1.5 pl-4",
                        pathname === content.href ? "font-bold" : "",
                      )}
                    >
                      <Link href={content.href ?? ""}>{content.title}</Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <div className="fixed top-0 bottom-0 left-0 hidden w-[300px] overflow-y-auto border-r md:block">
        <div className="border-b p-4">
          <div className="text-sm">
            Outerbase <strong>Studio</strong>
          </div>
          <div className="text-xl font-semibold">{title}</div>
        </div>
        {sideMenu}
      </div>
      <div className="flex border-b p-2 md:hidden">
        <div className="grow px-2 font-bold">{title}</div>
        <Sheet>
          <SheetTrigger>
            <div className="px-2">
              <LucideAlignJustify />
            </div>
          </SheetTrigger>
          <SheetContent className="px-0">{sideMenu}</SheetContent>
        </Sheet>
      </div>
    </>
  );
}
