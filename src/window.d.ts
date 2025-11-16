import type { DatabaseResultSet } from "./drivers/base-driver";
import type { SavedDocNamespace } from "./drivers/saved-doc/saved-doc-driver";

interface OuterbaseIPC {
  docs?: {
    load(): Promise<{
      namespace: SavedDocNamespace[];
      docs: Record<string, SavedDocData[]>;
    } | null>;

    save(data: {
      namespace: SavedDocNamespace[];
      docs: Record<string, SavedDocData[]>;
    }): Promise<void>;
  };
  query(statement: string): Promise<DatabaseResultSet>;
  transaction(statements: string[]): Promise<DatabaseResultSet[]>;
  close(): void;
}

declare global {
  interface Window {
    outerbaseIpc?: OuterbaseIPC;
    showOuterbaseDialog: Record<
      string,
      (props: {
        component: FunctionComponent;
        options: unknown;
        resolve: (props: unknown) => void;
        defaultCloseValue: unknown;
      }) => void
    >;
    showOpenFilePicker?: (options?: {
      types?: Array<{
        description?: string;
        accept: Record<string, string[]>;
      }>;
      excludeAcceptAllOption?: boolean;
      multiple?: boolean;
    }) => Promise<FileSystemFileHandle[]>;
    showSaveFilePicker?: (options?: {
      types?: Array<{
        description?: string;
        accept: Record<string, string[]>;
      }>;
      excludeAcceptAllOption?: boolean;
      suggestedName?: string;
    }) => Promise<FileSystemFileHandle>;
    showDirectoryPicker?: (options?: {
      mode?: "read" | "readwrite";
      startIn?:
        | FileSystemHandle
        | "desktop"
        | "documents"
        | "downloads"
        | "music"
        | "pictures"
        | "videos";
    }) => Promise<FileSystemDirectoryHandle>;
  }
}
