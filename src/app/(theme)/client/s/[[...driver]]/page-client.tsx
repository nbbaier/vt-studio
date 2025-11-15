"use client";
import {
  updateLocalConnectionUsed,
  useLocalConnection,
} from "@/app/(outerbase)/local/hooks";
import { Studio } from "@/components/gui/studio";
import { StudioExtensionManager } from "@/core/extension-manager";
import { createSQLiteExtensions } from "@/core/standard-extension";
import { createLocalDriver } from "@/drivers/helpers";
import IndexdbSavedDoc from "@/drivers/saved-doc/indexdb-saved-doc";
import { useAvailableAIAgents } from "@/lib/ai-agent-storage";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

export default function ClientPageBody() {
  const params = useSearchParams();
  const baseId = params.get("p") ?? "";
  const { data: conn } = useLocalConnection(baseId);

  const router = useRouter();

  const goBack = useCallback(() => {
    router.push("/");
  }, [router]);

  useEffect(() => {
    if (!baseId) return;
    updateLocalConnectionUsed(baseId).then().catch();
  }, [baseId]);

  const driver = useMemo(() => {
    if (!conn) return null;

    const config = conn.content;
    if (!config) return null;

    return createLocalDriver(config);
  }, [conn]);

  const extensions = useMemo(() => {
    if (!driver) return null;

    // Val Town-only migration: Only SQLite dialect is supported
    return new StudioExtensionManager(createSQLiteExtensions());
  }, [driver]);

  const agentDriver = useAvailableAIAgents(driver);

  const docDriver = useMemo(() => {
    if (conn) {
      return new IndexdbSavedDoc(conn.id);
    }
  }, [conn]);

  if (!driver || !conn || !extensions) {
    return <div>Something wrong</div>;
  }

  return (
    <Studio
      extensions={extensions}
      driver={driver}
      name={conn?.content.name}
      color={conn?.content.label ?? "blue"}
      onBack={goBack}
      docDriver={docDriver}
      agentDriver={agentDriver}
    />
  );
}
