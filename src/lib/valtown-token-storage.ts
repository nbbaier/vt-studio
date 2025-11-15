/**
 * Simplified token storage for Val Town Studio
 * Stores a single Val Town API token in localStorage
 */

const VALTOWN_TOKEN_KEY = "valtown_token";
const VALTOWN_CONNECTION_NAME_KEY = "valtown_connection_name";

export interface ValtownTokenData {
  token: string;
  name?: string;
}

/**
 * Get the stored Val Town token
 */
export function getValtownToken(): ValtownTokenData | null {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem(VALTOWN_TOKEN_KEY);
  const name = localStorage.getItem(VALTOWN_CONNECTION_NAME_KEY);

  if (!token) return null;

  return {
    token,
    name: name || "Val Town Database",
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
}

/**
 * Remove the stored Val Town token
 */
export function removeValtownToken(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(VALTOWN_TOKEN_KEY);
  localStorage.removeItem(VALTOWN_CONNECTION_NAME_KEY);
}

/**
 * Check if a token is stored
 */
export function hasValtownToken(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(VALTOWN_TOKEN_KEY);
}
