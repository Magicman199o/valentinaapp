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

      case "createVIPCodeWithMatch":
        // Create VIP code and match simultaneously
        const { code, assignedUserId, matchWithUserId } = params;
        
        // Get both users' genders to determine male/female
        const { data: users } = await supabase
          .from("profiles")
          .select("user_id, gender")
          .in("user_id", [assignedUserId, matchWithUserId]);
        
        if (!users || users.length !== 2) {
          throw new Error("Could not find both users");
        }
        
        const assignedUser = users.find(u => u.user_id === assignedUserId);
        const matchUser = users.find(u => u.user_id === matchWithUserId);
        
        if (!assignedUser || !matchUser) {
          throw new Error("Could not find user profiles");
        }
        
        // Determine male and female for the match
        let maleUserId: string, femaleUserId: string;
        if (assignedUser.gender === "male") {
          maleUserId = assignedUserId;
          femaleUserId = matchWithUserId;
        } else {
          maleUserId = matchWithUserId;
          femaleUserId = assignedUserId;
        }
        
        // Create the match first
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
        
        // Create VIP code linked to the match
        const { data: vipData, error: vipError } = await supabase
          .from("vip_codes")
          .insert({ 
            code, 
            assigned_user_id: assignedUserId, 
            is_used: false,
            match_id: matchData.id
          })
          .select()
          .single();
        
        if (vipError) {
          // Rollback the match if VIP code creation fails
          await supabase.from("matches").delete().eq("id", matchData.id);
          throw vipError;
        }
        
        result = { vipCode: vipData, match: matchData };
        break;

      case "createVIPCode":
        // Legacy: create VIP code without match (kept for backwards compatibility)
        const { code: legacyCode, assignedUserId: legacyUserId } = params;
        const { data: legacyVipData, error: legacyVipError } = await supabase
          .from("vip_codes")
          .insert({ code: legacyCode, assigned_user_id: legacyUserId, is_used: false })
          .select()
          .single();
        if (legacyVipError) throw legacyVipError;
        result = legacyVipData;
        break;

      case "deleteVIPCode":
        const { vipId } = params;
        
        // First get the VIP code to check if it has a match
        const { data: vipToDelete } = await supabase
          .from("vip_codes")
          .select("match_id")
          .eq("id", vipId)
          .single();
        
        // Delete the VIP code
        const { error: delVipError } = await supabase
          .from("vip_codes")
          .delete()
          .eq("id", vipId);
        if (delVipError) throw delVipError;
        
        // If there was an associated match, delete it too (if code wasn't used yet)
        if (vipToDelete?.match_id) {
          await supabase
            .from("matches")
            .delete()
            .eq("id", vipToDelete.match_id);
        }
        
        result = { success: true };
        break;

      case "createMatch":
        const { maleUserId: manualMaleId, femaleUserId: manualFemaleId } = params;
        const { data: manualMatchData, error: manualMatchError } = await supabase
          .from("matches")
          .insert({
            male_user_id: manualMaleId,
            female_user_id: manualFemaleId,
            is_instant_match: true,
          })
          .select()
          .single();
        if (manualMatchError) throw manualMatchError;
        result = manualMatchData;
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
