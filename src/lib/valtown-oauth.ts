/**
 * Val Town OAuth utilities for client registration and PKCE flow
 * Based on @std/oauth library patterns
 */

const OAUTH_ISSUER = "https://val.town";
// Scopes needed:
// - openid: Basic OpenID Connect
// - offline_access: Refresh token
// - profile: Profile information
// - user_rw: User data read/write (for /v1/me)
// - sqlite: SQLite database access
const DEFAULT_SCOPES = "openid offline_access profile user_rw sqlite";

export interface OAuthClient {
  client_id: string;
  client_secret?: string;
  redirect_uris: string[];
  grant_types: string[];
  response_types: string[];
  client_name: string;
  token_endpoint_auth_method: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  id_token?: string;
  scope?: string;
}

export interface ValtownUser {
  id: string;
  username: string;
  email?: string;
  bio?: string;
  profileImageUrl?: string;
}

/**
 * Generate PKCE code verifier and challenge
 */
export async function generatePKCE(): Promise<{
  codeVerifier: string;
  codeChallenge: string;
}> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const codeVerifier = btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  return { codeVerifier, codeChallenge };
}

/**
 * Register a new OAuth client with Val Town
 */
export async function registerOAuthClient(
  redirectUri: string,
  clientName: string = "Val Town Studio"
): Promise<OAuthClient> {
  const response = await fetch(`${OAUTH_ISSUER}/oauth/reg`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      redirect_uris: [redirectUri],
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      client_name: clientName,
      token_endpoint_auth_method: "none", // Public client
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OAuth client registration failed: ${error}`);
  }

  return await response.json();
}

/**
 * Build OAuth authorization URL
 */
export function buildAuthorizationUrl(params: {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  state: string;
  scopes?: string;
}): string {
  const authUrl = new URL(`${OAUTH_ISSUER}/oauth/auth`);
  authUrl.searchParams.set("client_id", params.clientId);
  authUrl.searchParams.set("redirect_uri", params.redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", params.scopes || DEFAULT_SCOPES);
  authUrl.searchParams.set("code_challenge", params.codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "S256");
  authUrl.searchParams.set("state", params.state);
  authUrl.searchParams.set("prompt", "login consent");

  return authUrl.toString();
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(params: {
  code: string;
  clientId: string;
  redirectUri: string;
  codeVerifier: string;
}): Promise<TokenResponse> {
  const response = await fetch(`${OAUTH_ISSUER}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: params.code,
      redirect_uri: params.redirectUri,
      client_id: params.clientId,
      code_verifier: params.codeVerifier,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  return await response.json();
}

/**
 * Fetch user information from Val Town API
 */
export async function fetchValtownUser(
  accessToken: string
): Promise<ValtownUser> {
  const response = await fetch("https://api.val.town/v1/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch user info: ${error}`);
  }

  return await response.json();
}

/**
 * Decode JWT without verification (for extracting user ID from id_token)
 */
export function decodeJWT(token: string): any {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT");

  const payload = parts[1];
  const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
  return JSON.parse(decoded);
}
