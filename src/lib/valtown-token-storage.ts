/**
 * Simplified token storage for Val Town Studio
 * Stores a single Val Town API token in localStorage
 * Supports both manual API tokens and OAuth access tokens
 */

const VALTOWN_TOKEN_KEY = "valtown_token";
const VALTOWN_CONNECTION_NAME_KEY = "valtown_connection_name";
const VALTOWN_AUTH_DATA_KEY = "valtown_auth_data";

export type AuthMethod = "token" | "oauth";

export interface ValtownTokenData {
  token: string;
  name?: string;
  authMethod?: AuthMethod;
  userId?: string;
  username?: string;
  refreshToken?: string;
}

/**
 * Get the stored Val Town token
 */
export function getValtownToken(): ValtownTokenData | null {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem(VALTOWN_TOKEN_KEY);
  const name = localStorage.getItem(VALTOWN_CONNECTION_NAME_KEY);

  if (!token) return null;

  // Try to get additional auth data
  const authDataStr = localStorage.getItem(VALTOWN_AUTH_DATA_KEY);
  let authData: Partial<ValtownTokenData> = {};

  if (authDataStr) {
    try {
      authData = JSON.parse(authDataStr);
    } catch (error) {
      console.error("Failed to parse auth data:", error);
    }
  }

  return {
    token,
    name: name || authData.username || "Val Town Database",
    ...authData,
  };
}

/**
 * Store the Val Town token
 */
export function setValtownToken(data: ValtownTokenData): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(VALTOWN_TOKEN_KEY, data.token);
  if (data.name) {
    localStorage.setItem(VALTOWN_CONNECTION_NAME_KEY, data.name);
  }

  // Store additional auth data (method, userId, username, refreshToken)
  const authData: Partial<ValtownTokenData> = {
    authMethod: data.authMethod,
    userId: data.userId,
    username: data.username,
    refreshToken: data.refreshToken,
  };

  localStorage.setItem(VALTOWN_AUTH_DATA_KEY, JSON.stringify(authData));
}

/**
 * Remove the stored Val Town token
 */
export function removeValtownToken(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(VALTOWN_TOKEN_KEY);
  localStorage.removeItem(VALTOWN_CONNECTION_NAME_KEY);
  localStorage.removeItem(VALTOWN_AUTH_DATA_KEY);
}

/**
 * Check if a token is stored
 */
export function hasValtownToken(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(VALTOWN_TOKEN_KEY);
}
