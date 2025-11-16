import type { DatabaseTableColumnChange } from "@/drivers/base-driver";
import { type PropsWithChildren, createContext, useContext } from "react";

const ColumnContext = createContext<{ columns: DatabaseTableColumnChange[] }>({
  columns: [],
});

export function useColumnList() {
  return useContext(ColumnContext);
}

export function ColumnsProvider({
  children,
  value,
}: PropsWithChildren<{ value: DatabaseTableColumnChange[] }>) {
  return (
    <ColumnContext.Provider value={{ columns: value }}>
      {children}
    </ColumnContext.Provider>
  );
}
