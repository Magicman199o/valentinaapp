import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ADMIN_USERNAME = "Valentina";
const ADMIN_PASSWORD = "Valentina@admin";

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, adminUsername, adminPassword, ...params } =
      await req.json();

    if (adminUsername !== ADMIN_USERNAME || adminPassword !== ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let result;

    switch (action) {
      case "fetchAll": {
        const [profilesRes, matchesRes, sponsorsRes, vipRes] =
          await Promise.all([
            supabase
              .from("profiles")
              .select("*")
              .order("created_at", { ascending: false }),
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
      }

      case "createVIPCodeWithMatch": {
        const { code, assignedUserId, matchWithUserId } = params;

        const { data: users } = await supabase
          .from("profiles")
          .select("user_id, gender")
          .in("user_id", [assignedUserId, matchWithUserId]);

        if (!users || users.length !== 2) {
          throw new Error("Could not find both users");
        }

        const assignedUser = users.find((u: any) => u.user_id === assignedUserId);
        const matchUser = users.find((u: any) => u.user_id === matchWithUserId);

        if (!assignedUser || !matchUser) {
          throw new Error("Could not find user profiles");
        }

        let maleUserId: string, femaleUserId: string;
        if (assignedUser.gender === "male") {
          maleUserId = assignedUserId;
          femaleUserId = matchWithUserId;
        } else {
          maleUserId = matchWithUserId;
          femaleUserId = assignedUserId;
        }

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

        const { data: vipData, error: vipError } = await supabase
          .from("vip_codes")
          .insert({
            code,
            assigned_user_id: assignedUserId,
            is_used: false,
            match_id: matchData.id,
          })
          .select()
          .single();

        if (vipError) {
          await supabase.from("matches").delete().eq("id", matchData.id);
          throw vipError;
        }

        result = { vipCode: vipData, match: matchData };
        break;
      }

      case "createVIPCode": {
        const { code: legacyCode, assignedUserId: legacyUserId } = params;
        const { data: legacyVipData, error: legacyVipError } = await supabase
          .from("vip_codes")
          .insert({
            code: legacyCode,
            assigned_user_id: legacyUserId,
            is_used: false,
          })
          .select()
          .single();
        if (legacyVipError) throw legacyVipError;
        result = legacyVipData;
        break;
      }

      case "deleteVIPCode": {
        const { vipId } = params;

        const { data: vipToDelete } = await supabase
          .from("vip_codes")
          .select("match_id")
          .eq("id", vipId)
          .single();

        const { error: delVipError } = await supabase
          .from("vip_codes")
          .delete()
          .eq("id", vipId);
        if (delVipError) throw delVipError;

        if (vipToDelete?.match_id) {
          await supabase
            .from("matches")
            .delete()
            .eq("id", vipToDelete.match_id);
        }

        result = { success: true };
        break;
      }

      case "createMatch": {
        const { maleUserId: manualMaleId, femaleUserId: manualFemaleId } = params;
        const { data: manualMatchData, error: manualMatchError } =
          await supabase
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
      }

      case "updateMatch": {
        const { matchId, maleUserId, femaleUserId } = params;
        const { data: updatedMatch, error: updateMatchError } = await supabase
          .from("matches")
          .update({
            male_user_id: maleUserId,
            female_user_id: femaleUserId,
          })
          .eq("id", matchId)
          .select()
          .single();
        if (updateMatchError) throw updateMatchError;
        result = updatedMatch;
        break;
      }

      case "deleteMatch": {
        const { matchId } = params;
        const { error: delMatchError } = await supabase
          .from("matches")
          .delete()
          .eq("id", matchId);
        if (delMatchError) throw delMatchError;
        result = { success: true };
        break;
      }

      case "deleteSponsor": {
        const { sponsorId } = params;
        const { error: delSponsorError } = await supabase
          .from("sponsors")
          .delete()
          .eq("id", sponsorId);
        if (delSponsorError) throw delSponsorError;
        result = { success: true };
        break;
      }

      case "deleteUsers": {
        const { userIds } = params;
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
          throw new Error("No user IDs provided");
        }

        for (const userId of userIds) {
          const { error: delUserError } =
            await supabase.auth.admin.deleteUser(userId);
          if (delUserError) {
            console.error(`Failed to delete user ${userId}:`, delUserError);
            throw new Error(`Failed to delete user: ${delUserError.message}`);
          }
        }

        result = { success: true, deletedCount: userIds.length };
        break;
      }

      case "updateUser": {
        const { userId, updates } = params;

        if (!userId) throw new Error("User ID is required");
        if (!updates || typeof updates !== "object")
          throw new Error("Updates object is required");

        const allowedFields: Record<string, any> = {};
        if (typeof updates.name === "string" && updates.name.trim()) {
          allowedFields.name = updates.name.trim();
        }
        if (typeof updates.email === "string" && updates.email.trim()) {
          allowedFields.email = updates.email.trim();
        }
        if (typeof updates.whatsapp_phone === "string" && updates.whatsapp_phone.trim()) {
          allowedFields.whatsapp_phone = updates.whatsapp_phone.trim();
        }
        if (updates.gender === "male" || updates.gender === "female") {
          allowedFields.gender = updates.gender;
        }
        if (typeof updates.payment_status === "boolean") {
          allowedFields.payment_status = updates.payment_status;
        }

        if (Object.keys(allowedFields).length === 0) {
          throw new Error("No valid fields to update");
        }

        const { data: updatedProfile, error: updateError } = await supabase
          .from("profiles")
          .update(allowedFields)
          .eq("user_id", userId)
          .select()
          .single();

        if (updateError) throw updateError;
        if (!updatedProfile) throw new Error("User not found");

        result = updatedProfile;
        break;
      }

      case "autoMatch": {
        // Auto-match algorithm: only paid users, opposite gender, even distribution
        const { data: paidUsers, error: paidError } = await supabase
          .from("profiles")
          .select("user_id, gender")
          .eq("payment_status", true);

        if (paidError) throw paidError;
        if (!paidUsers || paidUsers.length === 0) {
          throw new Error("No paid users to match");
        }

        const males = paidUsers.filter((u: any) => u.gender === "male").map((u: any) => u.user_id);
        const females = paidUsers.filter((u: any) => u.gender === "female").map((u: any) => u.user_id);

        if (males.length === 0 || females.length === 0) {
          throw new Error("Need at least one male and one female paid user to match");
        }

        // Delete all existing non-instant matches first
        // Keep instant (VIP) matches intact
        await supabase
          .from("matches")
          .delete()
          .eq("is_instant_match", false);

        // Determine majority and minority groups
        let majorityGroup: string[];
        let minorityGroup: string[];
        let majorityIsMale: boolean;

        if (males.length >= females.length) {
          majorityGroup = [...males];
          minorityGroup = [...females];
          majorityIsMale = true;
        } else {
          majorityGroup = [...females];
          minorityGroup = [...males];
          majorityIsMale = false;
        }

        // Shuffle both groups for randomness
        for (let i = majorityGroup.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [majorityGroup[i], majorityGroup[j]] = [majorityGroup[j], majorityGroup[i]];
        }
        for (let i = minorityGroup.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [minorityGroup[i], minorityGroup[j]] = [minorityGroup[j], minorityGroup[i]];
        }

        // Distribute majority across minority evenly
        // e.g., 31 males, 17 females: 31/17 = 1 remainder 14
        // 14 females get 2 males, 3 females get 1 male
        const matchInserts: { male_user_id: string; female_user_id: string; is_instant_match: boolean }[] = [];

        const baseCount = Math.floor(majorityGroup.length / minorityGroup.length);
        const remainder = majorityGroup.length % minorityGroup.length;

        let majorityIdx = 0;
        for (let i = 0; i < minorityGroup.length; i++) {
          const count = i < remainder ? baseCount + 1 : baseCount;
          for (let j = 0; j < count; j++) {
            const majorityUserId = majorityGroup[majorityIdx];
            const minorityUserId = minorityGroup[i];
            matchInserts.push({
              male_user_id: majorityIsMale ? majorityUserId : minorityUserId,
              female_user_id: majorityIsMale ? minorityUserId : majorityUserId,
              is_instant_match: false,
            });
            majorityIdx++;
          }
        }

        // Insert all matches
        if (matchInserts.length > 0) {
          const { error: insertError } = await supabase
            .from("matches")
            .insert(matchInserts);
          if (insertError) throw insertError;
        }

        result = {
          success: true,
          totalMatches: matchInserts.length,
          maleCount: males.length,
          femaleCount: females.length,
        };
        break;
      }

      default:
        throw new Error("Invalid action");
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Admin API error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
