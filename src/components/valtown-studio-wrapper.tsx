"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Studio } from "@/components/gui/studio";
import { StudioExtensionManager } from "@/core/extension-manager";
import { createSQLiteExtensions } from "@/core/standard-extension";
import { createValtownDriver } from "@/drivers/helpers";
import IndexdbSavedDoc from "@/drivers/saved-doc/indexdb-saved-doc";
import { useAvailableAIAgents } from "@/lib/ai-agent-storage";
import {
	getValtownToken,
	removeValtownToken,
	setValtownToken,
	type ValtownTokenData,
} from "@/lib/valtown-token-storage";

const STUDIO_DOC_ID = "valtown-studio-docs";

function TokenConfigurationUI({
	onTokenSubmit,
}: {
	onTokenSubmit: (data: ValtownTokenData) => void;
}) {
	const [token, setToken] = useState("");
	const [name, setName] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!token.trim()) {
			setError("Token is required");
			return;
		}

		onTokenSubmit({
			token: token.trim(),
			name: name.trim() || "Val Town Database",
		});
	};

	return (
		<div
			data-testid="token-config"
			className="bg-background flex min-h-screen items-center justify-center p-4"
		>
			<div className="w-full max-w-md">
				<div className="mb-8 text-center">
					<h1 className="mb-2 text-3xl font-bold">Val Town Studio</h1>
					<p className="text-muted-foreground">
						A modern SQLite GUI for Val Town
					</p>
				</div>

				<form
					onSubmit={handleSubmit}
					className="bg-card rounded-lg border p-6 shadow-lg"
				>
					<div className="mb-6">
						<h2 className="mb-4 text-xl font-semibold">Connect to Val Town</h2>
						<p className="text-muted-foreground text-sm">
							Enter your Val Town API token to get started. Once connected,
							you&apos;ll have full access to query, explore, and manage your
							SQLite database.
						</p>
					</div>

					<div className="mb-4">
						<label htmlFor="name" className="mb-2 block text-sm font-medium">
							Connection Name (optional)
						</label>
						<input
							type="text"
							id="name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="My Val Town Database"
							className="bg-background w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>

					<div className="mb-6">
						<label htmlFor="token" className="mb-2 block text-sm font-medium">
							Val Town API Token
						</label>
						<input
							type="password"
							id="token"
							value={token}
							onChange={(e) => {
								setToken(e.target.value);
								setError("");
							}}
							placeholder="Paste your Val Town API token here"
							className="bg-background w-full rounded-md border px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
						{error && <p className="mt-1 text-sm text-red-500">{error}</p>}
					</div>

					<div className="bg-secondary mb-6 rounded-md p-4">
						<p className="mb-2 text-sm font-medium">
							How to create an API token:
						</p>
						<ol className="ml-4 list-decimal space-y-2 text-sm">
							<li>
								Go to{" "}
								<Link
									href="https://www.val.town/settings/api"
									target="_blank"
									className="text-blue-600 underline hover:text-blue-700"
								>
									val.town/settings/api
								</Link>
							</li>
							<li>Click &quot;New&quot; to generate a new token</li>
							<li>
								<strong>Required scopes:</strong>
								<ul className="mt-1 ml-4 list-disc space-y-0.5">
									<li className="font-mono text-xs">sqlite:read</li>
									<li className="font-mono text-xs">sqlite:write</li>
								</ul>
							</li>
							<li>Copy the token and paste it above</li>
						</ol>
					</div>

					<button
						type="submit"
						className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
					>
						Connect
					</button>
				</form>
			</div>
		</div>
	);
}

export default function ValtownStudioWrapper() {
	const [tokenData, setTokenData] = useState<ValtownTokenData | null>(null);
	const [isInitialized, setIsInitialized] = useState(false);

	// Load token on mount
	useEffect(() => {
		const stored = getValtownToken();
		setTokenData(stored);
		setIsInitialized(true);
	}, []);

	// Handle token submission
	const handleTokenSubmit = (data: ValtownTokenData) => {
		setValtownToken(data);
		setTokenData(data);
	};

	// Handle token disconnect
	const handleDisconnect = () => {
		removeValtownToken();
		setTokenData(null);
	};

	// Create driver from token
	const driver = useMemo(() => {
		if (!tokenData?.token) return null;
		return createValtownDriver(tokenData.token);
	}, [tokenData?.token]);

	// Create extensions (SQLite only)
	const extensions = useMemo(() => {
		if (!driver) return null;
		return new StudioExtensionManager(createSQLiteExtensions());
	}, [driver]);

	// Create AI agent driver
	const agentDriver = useAvailableAIAgents(driver);

	// Create document driver
	const docDriver = useMemo(() => {
		return new IndexdbSavedDoc(STUDIO_DOC_ID);
	}, []);

	// Show loading state during initialization
	if (!isInitialized) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-muted-foreground">Loading...</div>
			</div>
		);
	}

	// Show token configuration if no token or driver
	if (!tokenData || !driver || !extensions) {
		return <TokenConfigurationUI onTokenSubmit={handleTokenSubmit} />;
	}

	// Render Studio
	return (
		<Studio
			driver={driver}
			extensions={extensions}
			name={tokenData.name || "Val Town Database"}
			color="blue"
			onBack={handleDisconnect}
			docDriver={docDriver}
			agentDriver={agentDriver}
		/>
	);
}
