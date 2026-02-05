import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: 'signup' | 'match';
  to: string;
  name: string;
  matchName?: string;
  matchPhone?: string;
}

const getSignupEmailHtml = (name: string) => `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: 'Georgia', serif; background: linear-gradient(135deg, #fff5f5 0%, #ffe0e6 100%); margin: 0; padding: 40px 20px; }
      .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; padding: 40px; box-shadow: 0 10px 40px rgba(255, 107, 129, 0.1); }
      h1 { color: #ff6b81; text-align: center; font-size: 28px; margin-bottom: 20px; }
      .heart { font-size: 40px; text-align: center; margin: 20px 0; }
      p { color: #666; line-height: 1.8; font-size: 16px; }
      .cta { display: block; width: fit-content; margin: 30px auto; padding: 15px 30px; background: linear-gradient(135deg, #ff6b81 0%, #ff8c9a 100%); color: white; text-decoration: none; border-radius: 30px; font-weight: bold; }
      .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #999; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="heart">💕</div>
      <h1>Welcome to Valentina, ${name}!</h1>
      <p>Thank you for joining our community of love seekers! Your journey to finding your perfect match has officially begun.</p>
      <p>Here's what happens next:</p>
      <ul style="color: #666; line-height: 2;">
        <li>Complete your profile to increase your chances of finding the perfect match</li>
        <li>Your match will be revealed on Valentine's Day (February 14th) at 6:00 AM</li>
        <li>Can't wait? Use a VIP code for an instant match!</li>
      </ul>
      <a href="https://valentinaapp.lovable.app/home" class="cta">Complete Your Profile</a>
      <div class="footer">
        Made with ❤️ by Valentina<br>
        © ${new Date().getFullYear()} All rights reserved
      </div>
    </div>
  </body>
  </html>
`;

const getMatchEmailHtml = (name: string, matchName: string, matchPhone?: string) => `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: 'Georgia', serif; background: linear-gradient(135deg, #fff5f5 0%, #ffe0e6 100%); margin: 0; padding: 40px 20px; }
      .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; padding: 40px; box-shadow: 0 10px 40px rgba(255, 107, 129, 0.1); }
      h1 { color: #ff6b81; text-align: center; font-size: 28px; margin-bottom: 20px; }
      .hearts { font-size: 50px; text-align: center; margin: 20px 0; }
      p { color: #666; line-height: 1.8; font-size: 16px; text-align: center; }
      .match-name { font-size: 24px; color: #ff6b81; font-weight: bold; }
      .cta { display: block; width: fit-content; margin: 30px auto; padding: 15px 30px; background: linear-gradient(135deg, #25D366 0%, #20BA5C 100%); color: white; text-decoration: none; border-radius: 30px; font-weight: bold; }
      .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #999; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="hearts">💕🎉💕</div>
      <h1>Congratulations, ${name}!</h1>
      <p>You have been matched with</p>
      <p class="match-name">${matchName}</p>
      <p>This is your chance to start something beautiful! Don't be shy, reach out and say hello.</p>
      ${matchPhone ? `<a href="https://wa.me/${matchPhone.replace(/[^0-9]/g, '')}" class="cta">Chat on WhatsApp</a>` : ''}
      <div class="footer">
        Made with ❤️ by Valentina<br>
        © ${new Date().getFullYear()} All rights reserved
      </div>
    </div>
  </body>
  </html>
`;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, to, name, matchName, matchPhone }: EmailRequest = await req.json();

    let subject: string;
    let html: string;

    if (type === 'signup') {
      subject = "Welcome to Valentina! 💕";
      html = getSignupEmailHtml(name);
    } else if (type === 'match') {
      subject = "🎉 You've Been Matched on Valentina!";
      html = getMatchEmailHtml(name, matchName || 'Your Match', matchPhone);
    } else {
      throw new Error('Invalid email type');
    }

    const emailResponse = await resend.emails.send({
      from: "Valentina <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
