import type { OuterbaseAPIWorkspace } from "@/outerbase-cloud/api-type";
import { createOuterbaseDatabaseDriver } from "@/outerbase-cloud/database/utils";
import type {
  BaseDriver,
  DatabaseResultSet,
  DatabaseSchemas,
} from "../../drivers/base-driver";
import type {
  BoardSource,
  BoardSourceDriver,
} from "../../drivers/board-source/base-source";

export default class OuterbaseBoardSourceDriver implements BoardSourceDriver {
  protected workspace: OuterbaseAPIWorkspace;
  protected sourceDrivers: Record<string, BaseDriver> = {};
  protected cacheSchemas: Record<
    string,
    {
      schema: DatabaseSchemas;
      selectedSchema: string;
    }
  > = {};

  constructor(workspace: OuterbaseAPIWorkspace) {
    this.workspace = workspace;
  }

  sourceList(): BoardSource[] {
    return this.workspace.bases
      .filter((base) => {
        const source = base.sources?.[0];
        return source?.id && source?.type;
      })
      .map((base) => {
        const source = base.sources[0];
        if (!source.id || !source.type) {
          throw new Error("Source id and type are required");
        }
        return {
          id: source.id,
          name: base.name,
          type: source.type,
        };
      });
  }

  getDriver(sourceId: string) {
    const source = this.workspace.bases.find((base) => {
      return (
        base.sources &&
        base.sources.length > 0 &&
        base.sources[0].id === sourceId
      );
    })?.sources[0];

    if (!source) {
      throw new Error("Source does not exist");
    }

    if (!this.sourceDrivers[sourceId]) {
      if (!this.workspace.id) {
        throw new Error("Workspace ID is required");
      }
      this.sourceDrivers[sourceId] = createOuterbaseDatabaseDriver(
        source.type,
        {
          workspaceId: this.workspace.id,
          sourceId,
        },
      );
    }

    const driver = this.sourceDrivers[sourceId];
    if (!driver) {
      throw new Error("Driver not found");
    }
    return driver;
  }

  async schemas(sourceId: string) {
    const driver = this.getDriver(sourceId);

    if (this.cacheSchemas[sourceId]) {
      return this.cacheSchemas[sourceId];
    }

    this.cacheSchemas[sourceId] = {
      schema: await driver.schemas(),
      selectedSchema: driver.getFlags().defaultSchema,
    };

    return this.cacheSchemas[sourceId];
  }

  async query(sourceId: string, statement: string): Promise<DatabaseResultSet> {
    const driver = this.getDriver(sourceId);
    return await driver.query(statement);
  }

  cleanup(): void {
    // do nothing
  }
}
