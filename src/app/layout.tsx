import type { Metadata } from "next";
import { WEBSITE_GENERAL_DESCRIPTION, WEBSITE_NAME } from "@/const";

import "./codemirror-override.css";
import "./globals.css";

import { DialogProvider } from "@/components/create-dialog";
import ThemeLayout from "@/components/theme-layout";

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
				<ThemeLayout>
					{children}
					<DialogProvider slot="default" />
				</ThemeLayout>
			</body>
		</html>
	);
}
