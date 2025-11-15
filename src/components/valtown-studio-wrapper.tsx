"use client";

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
  ValtownTokenData,
} from "@/lib/valtown-token-storage";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const STUDIO_DOC_ID = "valtown-studio-docs";

function TokenConfigurationUI({
  onTokenSubmit,
  oauthError,
}: {
  onTokenSubmit: (data: ValtownTokenData) => void;
  oauthError?: string;
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
      authMethod: "token",
    });
  };

  const handleOAuthLogin = () => {
    window.location.href = "/api/auth/valtown/login";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold">Val Town Studio</h1>
          <p className="text-muted-foreground">
            A modern SQLite GUI for Val Town
          </p>
        </div>

        <div className="bg-card rounded-lg border p-6 shadow-lg">
          <div className="mb-6">
            <h2 className="mb-4 text-xl font-semibold">Connect to Val Town</h2>
            <p className="text-muted-foreground text-sm">
              Connect your Val Town account to query, explore, and manage your
              SQLite database.
            </p>
          </div>

          {oauthError && (
            <div className="mb-6 rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-4">
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>OAuth Error:</strong> {oauthError}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleOAuthLogin}
            className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mb-6"
          >
            <svg
              className="inline-block mr-2 h-5 w-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
            Login with Val Town
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-card px-2 text-muted-foreground">
                Or use an API token
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>

          <div className="mb-4">
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium"
            >
              Connection Name (optional)
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Val Town Database"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="token"
              className="mb-2 block text-sm font-medium"
            >
              Val Town API Token
            </label>
            <textarea
              id="token"
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                setError("");
              }}
              placeholder="Paste your Val Town API token here"
              rows={3}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>

          <div className="bg-secondary mb-6 rounded-md p-4">
            <p className="mb-2 text-sm font-medium">How to get your token:</p>
            <ol className="ml-4 list-decimal space-y-1 text-sm">
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
              <li>Copy the token and paste it above</li>
            </ol>
          </div>

            <button
              type="submit"
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Connect
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ValtownStudioWrapper() {
  const [tokenData, setTokenData] = useState<ValtownTokenData | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [oauthError, setOauthError] = useState<string | undefined>();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Handle OAuth callback
  useEffect(() => {
    const oauthSuccess = searchParams.get("oauth_success");
    const oauthErrorParam = searchParams.get("oauth_error");

    if (oauthSuccess === "true") {
      const accessToken = searchParams.get("access_token");
      const userId = searchParams.get("user_id");
      const username = searchParams.get("username");
      const refreshToken = searchParams.get("refresh_token");

      if (accessToken && userId && username) {
        // Store OAuth token data
        const tokenData: ValtownTokenData = {
          token: accessToken,
          authMethod: "oauth",
          userId,
          username,
          name: `${username}'s Val Town`,
          refreshToken: refreshToken || undefined,
        };

        setValtownToken(tokenData);
        setTokenData(tokenData);

        // Clean up URL
        router.replace("/");
      }
    } else if (oauthErrorParam === "true") {
      const errorMessage = searchParams.get("error_message");
      setOauthError(errorMessage || "OAuth authentication failed");

      // Clean up URL
      router.replace("/");
    }
  }, [searchParams, router]);

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
    return (
      <TokenConfigurationUI
        onTokenSubmit={handleTokenSubmit}
        oauthError={oauthError}
      />
    );
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
