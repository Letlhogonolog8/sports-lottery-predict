import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.0";

const allowedCorsOrigins = (Deno.env.get("CORS_ORIGIN") || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const resolveCorsOrigin = (req: Request): string => {
  if (allowedCorsOrigins.includes("*")) {
    return "*";
  }

  const origin = req.headers.get("origin") || "";
  if (origin && allowedCorsOrigins.includes(origin)) {
    return origin;
  }

  return allowedCorsOrigins[0] || "https://invalid.local";
};

export const getCorsHeaders = (req: Request, methods = "POST, GET, OPTIONS", extraHeaders = "") => ({
  "Access-Control-Allow-Origin": resolveCorsOrigin(req),
  "Access-Control-Allow-Methods": methods,
  "Access-Control-Allow-Headers": ["Content-Type", "Authorization", "X-Request-Id", extraHeaders]
    .filter(Boolean)
    .join(", "),
  Vary: "Origin",
});

export const getBearerToken = (req: Request): string | null => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.replace("Bearer ", "").trim();
};

export async function isUserAuthorized(req: Request, supabaseUrl: string, anonOrServiceKey: string): Promise<boolean> {
  const token = getBearerToken(req);
  if (!token) return false;

  const authClient = createClient(supabaseUrl, anonOrServiceKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data, error } = await authClient.auth.getUser();
  return !error && !!data.user;
}

export const healthResponse = (service: string, requestId: string, headers: HeadersInit): Response => {
  return new Response(
    JSON.stringify({
      status: "ok",
      service,
      requestId,
      timestamp: new Date().toISOString(),
    }),
    { status: 200, headers }
  );
};