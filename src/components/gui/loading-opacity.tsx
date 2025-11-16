import { LucideLoader2 } from "lucide-react";

export default function OpacityLoading() {
  return (
    <div className="absolute top-0 right-0 bottom-0 left-0 z-10">
      <div className="absolute top-0 right-0 bottom-0 left-0 bg-gray-600 opacity-50" />
      <div className="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center rounded-lg bg-white p-5">
          <LucideLoader2 className="mb-2 animate-spin text-2xl" />
          <div className="text-sm">Loading</div>
        </div>
      </div>
    </div>
  );
}
