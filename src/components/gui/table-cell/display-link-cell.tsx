import { Button } from "../../ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../../ui/hover-card";

const IMAGE_EXTENSION = ["jpg", "jpeg", "png", "pneg", "svg", "bmp", "gif"];

export default function DisplayLinkCell({ link }: { link: string }) {
  const extension = link.split(".").pop();
  const isImage = IMAGE_EXTENSION.includes((extension ?? "").toLowerCase());

  return (
    <div className="flex w-full">
      <HoverCard>
        <HoverCardTrigger
          target="_blank"
          className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-blue-600 underline dark:text-blue-300"
        >
          {link}
        </HoverCardTrigger>
        <HoverCardContent side="bottom" align="start" className="min-w-[300px]">
          <div className="flex flex-col gap-2">
            {isImage && (
              <div className="flex items-center justify-center rounded bg-gray-600 p-2 dark:bg-gray-800">
                <img
                  src={link}
                  alt=""
                  className="h-[200px] w-[200px] object-contain"
                />
              </div>
            )}

            <div className="line-clamp-3 w-[250px] truncate font-mono text-sm break-all whitespace-normal">
              {link}
            </div>

            <div>
              <a
                target="_blank"
                className="inline-block"
                href={link}
                rel="noreferrer"
              >
                <Button>Open Link</Button>
              </a>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
