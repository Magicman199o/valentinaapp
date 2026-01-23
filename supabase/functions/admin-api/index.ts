import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Simple admin auth - in production, use proper auth
const ADMIN_USERNAME = "Valentina";
const ADMIN_PASSWORD = "Valentina@admin";

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, adminUsername, adminPassword, ...params } = await req.json();

    // Verify admin credentials
    if (adminUsername !== ADMIN_USERNAME || adminPassword !== ADMIN_PASSWORD) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let result;

    switch (action) {
      case "fetchAll":
        const [profilesRes, matchesRes, sponsorsRes, vipRes] = await Promise.all([
          supabase.from("profiles").select("*").order("created_at", { ascending: false }),
          supabase.from("matches").select("*"),
          supabase.from("sponsors").select("*"),
          supabase.from("vip_codes").select("*"),
        ]);
        result = {
          profiles: profilesRes.data || [],
          matches: matchesRes.data || [],
          sponsors: sponsorsRes.data || [],
          vipCodes: vipRes.data || [],
        };
        break;

      case "createVIPCode":
        const { code, assignedUserId } = params;
        const { data: vipData, error: vipError } = await supabase
          .from("vip_codes")
          .insert({ code, assigned_user_id: assignedUserId, is_used: false })
          .select()
          .single();
        if (vipError) throw vipError;
        result = vipData;
        break;

      case "deleteVIPCode":
        const { vipId } = params;
        const { error: delVipError } = await supabase
          .from("vip_codes")
          .delete()
          .eq("id", vipId);
        if (delVipError) throw delVipError;
        result = { success: true };
        break;

      case "createMatch":
        const { maleUserId, femaleUserId } = params;
        const { data: matchData, error: matchError } = await supabase
          .from("matches")
          .insert({
            male_user_id: maleUserId,
            female_user_id: femaleUserId,
            is_instant_match: true,
          })
          .select()
          .single();
        if (matchError) throw matchError;
        result = matchData;
        break;

      case "deleteMatch":
        const { matchId } = params;
        const { error: delMatchError } = await supabase
          .from("matches")
          .delete()
          .eq("id", matchId);
        if (delMatchError) throw delMatchError;
        result = { success: true };
        break;

      case "deleteSponsor":
        const { sponsorId } = params;
        const { error: delSponsorError } = await supabase
          .from("sponsors")
          .delete()
          .eq("id", sponsorId);
        if (delSponsorError) throw delSponsorError;
        result = { success: true };
        break;

      default:
        throw new Error("Invalid action");
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Admin API error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
