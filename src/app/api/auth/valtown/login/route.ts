import {
  buildAuthorizationUrl,
  generatePKCE,
  registerOAuthClient,
} from "@/lib/valtown-oauth";
import { NextRequest, NextResponse } from "next/server";

/**
 * Initiates OAuth flow with Val Town
 * GET /api/auth/valtown/login
 */
export async function GET(request: NextRequest) {
  try {
    // Build redirect URI
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (request.nextUrl.origin.includes("localhost")
        ? `http://localhost:${process.env.PORT || 3000}`
        : request.nextUrl.origin);

    const redirectUri = `${baseUrl}/api/auth/valtown/callback`;

    // Register OAuth client (or reuse existing - would need caching in production)
    const client = await registerOAuthClient(redirectUri, "Val Town Studio");

    // Generate PKCE challenge
    const { codeVerifier, codeChallenge } = await generatePKCE();

    // Generate random state
    const state = crypto.randomUUID();

    // Store code verifier and state in HTTP-only cookies
    const response = NextResponse.redirect(
      buildAuthorizationUrl({
        clientId: client.client_id,
        redirectUri,
        codeChallenge,
        state,
      })
    );

    // Store OAuth state in cookies (valid for 10 minutes)
    response.cookies.set("oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
      path: "/",
    });

    response.cookies.set("oauth_code_verifier", codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
      path: "/",
    });

    response.cookies.set("oauth_client_id", client.client_id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("OAuth login error:", error);
    return NextResponse.json(
      {
        error: "Failed to initiate OAuth flow",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
