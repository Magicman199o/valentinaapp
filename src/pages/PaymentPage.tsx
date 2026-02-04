import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart,
  CreditCard,
  Loader2,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import FloatingHearts from "@/components/FloatingHearts";
import { toast } from "sonner";

const PaymentPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [profile, setProfile] = useState<{
    name: string;
    email: string;
  } | null>(null);

  const reference = searchParams.get("reference");
  const trxref = searchParams.get("trxref");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    fetchProfile();

    // Handle Paystack callback
    if (reference || trxref) {
      verifyPayment(reference || trxref!);
    }
  }, [user, reference, trxref]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("name, email, payment_status")
      .eq("user_id", user.id)
      .single();

    if (data) {
      // If already paid, redirect to home
      if (data.payment_status) {
        navigate("/home");
        return;
      }
      setProfile({ name: data.name, email: data.email });
    }
  };

  const verifyPayment = async (ref: string) => {
    setVerifying(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "paystack-verify",
        {
          body: { reference: ref },
        }
      );

      if (error) {
        throw error;
      }

      if (data?.data?.status === "success") {
        toast.success("Payment successful! Welcome to Valentina! 💕");
        setTimeout(() => navigate("/home"), 2000);
      } else {
        toast.error("Payment could not be verified. Please try again.");
      }
    } catch (err) {
      console.error("Payment verification error:", err);
      toast.error("Payment verification failed. Please contact support.");
    }

    setVerifying(false);
  };

  const handlePayment = async () => {
    if (!user || !profile) return;

    setLoading(true);

    try {
      const callbackUrl = `${window.location.origin}/payment`;

      const { data, error } = await supabase.functions.invoke("paystack-init", {
        body: {
          email: profile.email,
          amount: 200000, // 2000 NGN in kobo
          userId: user.id,
          callbackUrl,
        },
      });

      if (error) {
        throw error;
      }

      if (data?.data?.authorization_url) {
        // Redirect to Paystack
        window.location.href = data.data.authorization_url;
      } else {
        toast.error("Failed to initialize payment. Please try again.");
      }
    } catch (err) {
      console.error("Payment init error:", err);
      toast.error("Failed to start payment. Please try again.");
    }

    setLoading(false);
  };

  if (verifying || reference || trxref) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-background to-muted">
        <FloatingHearts />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-romantic text-center max-w-md mx-4"
        >
          {verifying ? (
            <>
              <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
              <h1 className="text-2xl font-serif font-bold mb-2">
                Verifying Payment...
              </h1>
              <p className="text-muted-foreground">
                Please wait while we confirm your payment.
              </p>
            </>
          ) : (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-serif font-bold mb-2">
                Payment Successful!
              </h1>
              <p className="text-muted-foreground mb-4">
                Welcome to Valentina! Your journey to love begins now.
              </p>
              <Button
                onClick={() => navigate("/home")}
                className="btn-romantic"
              >
                Continue to App
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-background to-muted relative overflow-hidden">
      <FloatingHearts />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-4"
      >
        <div className="card-romantic">
          <div className="text-center mb-8">
            <Logo size="lg" />
            <p className="text-muted-foreground mt-2">
              Complete your registration by making payment to finalize the
              process and set up your profile.
            </p>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              {/* <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block mb-4"
              >
                <Heart className="w-12 h-12 text-primary fill-primary/30" />
              </motion.div> */}

              <h1 className="text-2xl font-serif font-bold mb-2">
                Welcome, {profile?.name}!
              </h1>
              <p className="text-muted-foreground">
                Complete your payment to start your journey to love
              </p>
            </div>

            <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Registration Fee</span>
                <span className="font-semibold">₦2,000</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>• Access to matching</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>• Valentine's Day reveal</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>• Profile visibility</span>
              </div>
            </div>

            <Button
              onClick={handlePayment}
              disabled={loading}
              className="w-full btn-romantic py-6 text-lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Pay with Paystack
                </span>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Secured by Paystack. Your payment information is encrypted.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentPage;
