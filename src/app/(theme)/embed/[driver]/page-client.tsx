"use client";
import { Studio } from "@/components/gui/studio";
import { StudioExtensionManager } from "@/core/extension-manager";
import { createSQLiteExtensions } from "@/core/standard-extension";
import { EmbedQueryable } from "@/drivers/iframe-driver";
import ElectronSavedDocs from "@/drivers/saved-doc/electron-saved-doc";
import { SqliteLikeBaseDriver } from "@/drivers/sqlite-base-driver";
import LocalSettingSidebar from "@/extensions/local-setting-sidebar";
import { useAvailableAIAgents } from "@/lib/ai-agent-storage";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

// Val Town-only migration: driverName parameter kept for API compatibility but no longer used
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function EmbedPageClient({ driverName }: { driverName: string }) {
  const searchParams = useSearchParams();

  // Val Town-only migration: driverName is no longer used, all drivers use SQLite
  const [driver, queryable] = useMemo(() => {
    const queryable = new EmbedQueryable();
    return [createDatabaseDriver(queryable), queryable];
  }, []);

  const savedDocDriver = useMemo(() => {
    if (window.outerbaseIpc?.docs) {
      return new ElectronSavedDocs();
    }
  }, []);

  const extensions = useMemo(() => {
    return new StudioExtensionManager(createEmbedExtensions());
  }, []);

  const agentDriver = useAvailableAIAgents(driver);

  useEffect(() => {
    return queryable.listen();
  }, [queryable]);

  return (
    <Studio
      driver={driver}
      extensions={extensions}
      docDriver={savedDocDriver}
      name={searchParams.get("name") || "Unnamed Connection"}
      color={searchParams.get("color") || "gray"}
      agentDriver={agentDriver}
    />
  );
}

function createDatabaseDriver(queryable: EmbedQueryable) {
  // Val Town-only migration: All drivers use SQLite dialect
  return new SqliteLikeBaseDriver(queryable);
}

function createEmbedExtensions() {
  // Val Town-only migration: All connections use SQLite extensions
  return [...createSQLiteExtensions(), new LocalSettingSidebar()];
}
