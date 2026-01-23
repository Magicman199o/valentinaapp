import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PaystackVerifyRequest {
  reference: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reference }: PaystackVerifyRequest = await req.json();

    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      throw new Error("Paystack secret key not configured");
    }

    // Verify transaction with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${paystackSecretKey}`,
      },
    });

    const data = await response.json();

    if (!data.status) {
      throw new Error(data.message || "Failed to verify payment");
    }

    // If payment was successful, update user's payment status
    if (data.data.status === "success") {
      const userId = data.data.metadata?.user_id;
      
      if (userId) {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { error: updateError } = await supabase
          .from("profiles")
          .update({ payment_status: true })
          .eq("user_id", userId);

        if (updateError) {
          console.error("Error updating payment status:", updateError);
        }

        // Send welcome email
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, name")
          .eq("user_id", userId)
          .single();

        if (profile) {
          const emailFunctionUrl = `${supabaseUrl}/functions/v1/send-email`;
          await fetch(emailFunctionUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "signup",
              to: profile.email,
              name: profile.name,
            }),
          });
        }
      }
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error verifying Paystack:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
