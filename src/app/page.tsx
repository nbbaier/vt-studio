import ClientOnly from "@/components/client-only";
import ValtownStudioWrapper from "@/components/valtown-studio-wrapper";

export const runtime = "edge";

export default function HomePage() {
  return (
    <ClientOnly>
      <ValtownStudioWrapper />
    </ClientOnly>
  );
}
