import {
  exchangeCodeForToken,
  fetchValtownUser,
  decodeJWT,
} from "@/lib/valtown-oauth";
import { NextRequest, NextResponse } from "next/server";

/**
 * Handles OAuth callback from Val Town
 * GET /api/auth/valtown/callback?code=...&state=...
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    // Validate required parameters
    if (!code) {
      return NextResponse.json(
        { error: "Missing authorization code" },
        { status: 400 }
      );
    }

    if (!state) {
      return NextResponse.json({ error: "Missing state" }, { status: 400 });
    }

    // Verify state matches
    const storedState = request.cookies.get("oauth_state")?.value;
    if (!storedState || storedState !== state) {
      return NextResponse.json(
        { error: "Invalid state parameter" },
        { status: 400 }
      );
    }

    // Get stored OAuth data from cookies
    const codeVerifier = request.cookies.get("oauth_code_verifier")?.value;
    const clientId = request.cookies.get("oauth_client_id")?.value;

    if (!codeVerifier || !clientId) {
      return NextResponse.json(
        { error: "Missing OAuth session data" },
        { status: 400 }
      );
    }

    // Build redirect URI
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (request.nextUrl.origin.includes("localhost")
        ? `http://localhost:${process.env.PORT || 3000}`
        : request.nextUrl.origin);

    const redirectUri = `${baseUrl}/api/auth/valtown/callback`;

    // Exchange code for access token
    const tokenResponse = await exchangeCodeForToken({
      code,
      clientId,
      redirectUri,
      codeVerifier,
    });

    // Decode ID token to get user ID
    let userId = "unknown";
    if (tokenResponse.id_token) {
      try {
        const idTokenData = decodeJWT(tokenResponse.id_token);
        userId = idTokenData.sub || "unknown";
      } catch (error) {
        console.error("Failed to decode ID token:", error);
      }
    }

    // Fetch user information
    let username = userId;
    try {
      const user = await fetchValtownUser(tokenResponse.access_token);
      username = user.username;
      userId = user.id;
    } catch (error) {
      console.error("Failed to fetch user info:", error);
    }

    // Build success redirect with token data
    const successUrl = new URL("/", baseUrl);
    successUrl.searchParams.set("oauth_success", "true");
    successUrl.searchParams.set("access_token", tokenResponse.access_token);
    successUrl.searchParams.set("user_id", userId);
    successUrl.searchParams.set("username", username);

    if (tokenResponse.refresh_token) {
      successUrl.searchParams.set("refresh_token", tokenResponse.refresh_token);
    }

    // Clear OAuth cookies
    const response = NextResponse.redirect(successUrl);
    response.cookies.delete("oauth_state");
    response.cookies.delete("oauth_code_verifier");
    response.cookies.delete("oauth_client_id");

    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);

    // Redirect to home with error
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (request.nextUrl.origin.includes("localhost")
        ? `http://localhost:${process.env.PORT || 3000}`
        : request.nextUrl.origin);

    const errorUrl = new URL("/", baseUrl);
    errorUrl.searchParams.set("oauth_error", "true");
    errorUrl.searchParams.set(
      "error_message",
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.redirect(errorUrl);
  }
}
