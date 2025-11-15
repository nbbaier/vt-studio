import { WEBSITE_NAME, WEBSITE_GENERAL_DESCRIPTION } from "@/const";
import type { Metadata } from "next";

import "./codemirror-override.css";
import "./globals.css";

import { DialogProvider } from "@/components/create-dialog";

export const metadata: Metadata = {
  title: WEBSITE_NAME,
  keywords: [
    "valtown",
    "val.town",
    "sqlite",
    "studio",
    "browser",
    "editor",
    "gui",
    "database",
    "sql-editor",
  ],
  description: WEBSITE_GENERAL_DESCRIPTION,
  openGraph: {
    siteName: WEBSITE_NAME,
    description: WEBSITE_GENERAL_DESCRIPTION,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
        <DialogProvider slot="default" />
      </body>
    </html>
  );
}
