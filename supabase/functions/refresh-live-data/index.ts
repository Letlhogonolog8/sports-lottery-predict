import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.0";
import { getCorsHeaders, healthResponse, isUserAuthorized } from "../_shared/http.ts";

interface MatchRow {
  id: string;
  start_time: string;
  status: "live" | "upcoming" | "finished";
  minute: number | null;
  home_score: number | null;
  away_score: number | null;
}

const isCronAuthorized = (req: Request): boolean => {
  const configured = Deno.env.get("REFRESH_LIVE_DATA_SECRET");
  if (!configured) return false;
  return req.headers.get("X-Cron-Secret") === configured;
};

async function refreshLiveData() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase configuration missing");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: matchesToUpdate, error } = await supabase
    .from("matches")
    .select("id, start_time, status, minute, home_score, away_score")
    .in("status", ["live", "upcoming"]);

  if (error) {
    throw new Error(error.message);
  }

  if (!matchesToUpdate || matchesToUpdate.length === 0) {
    return { success: true, updatedMatches: 0 };
  }

  let updatedCount = 0;

  for (const match of matchesToUpdate as MatchRow[]) {
    const now = Date.now();
    const startTimeMs = new Date(match.start_time).getTime();
    const elapsedMinutes = Math.max(0, Math.floor((now - startTimeMs) / 60000));

    const updateData: Record<string, number | string | null> = {
      updated_at: new Date().toISOString(),
    };

    if (elapsedMinutes >= 120) {
      if (match.status !== "finished") {
        updateData.status = "finished";
      }
      updateData.minute = 90;
    } else if (elapsedMinutes > 0) {
      if (match.status !== "live") {
        updateData.status = "live";
      }
      updateData.minute = Math.min(elapsedMinutes, 90);
    } else {
      if (match.status !== "upcoming") {
        updateData.status = "upcoming";
      }
      updateData.minute = null;
    }

    const { error: updateError } = await supabase
      .from("matches")
      .update(updateData)
      .eq("id", match.id);

    if (!updateError) {
      updatedCount += 1;
    }
  }

  return { success: true, updatedMatches: updatedCount };
}

serve(async (req) => {
  const startedAt = Date.now();
  const requestId = req.headers.get("X-Request-Id") || crypto.randomUUID();
  const headers = {
    ...getCorsHeaders(req, "POST, GET, OPTIONS", "X-Cron-Secret"),
    "Content-Type": "application/json",
    "X-Request-Id": requestId,
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  if (req.method === "GET") {
    return healthResponse("refresh-live-data", requestId, headers);
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed", requestId }), { status: 405, headers });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Supabase configuration missing");
    }

    const allowed =
      isCronAuthorized(req) ||
      (await isUserAuthorized(req, supabaseUrl, anonKey || serviceRoleKey));

    if (!allowed) {
      return new Response(JSON.stringify({ error: "Unauthorized", requestId }), { status: 401, headers });
    }

    const result = await refreshLiveData();
    const durationMs = Date.now() - startedAt;

    console.log(JSON.stringify({ requestId, event: "refresh_live_data_success", durationMs, updatedMatches: result.updatedMatches }));

    return new Response(
      JSON.stringify({ ...result, requestId, durationMs }),
      {
        headers,
        status: 200,
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    const durationMs = Date.now() - startedAt;
    console.error(JSON.stringify({ requestId, event: "refresh_live_data_error", durationMs, message }));

    return new Response(JSON.stringify({ error: message, requestId }), {
      status: 500,
      headers,
    });
  }
});