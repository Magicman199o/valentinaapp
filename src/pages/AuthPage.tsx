import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Heart,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Logo from "@/components/Logo";
import FloatingHearts from "@/components/FloatingHearts";
import { toast } from "sonner";
import { z } from "zod";
import { MobileAuthPage } from "@/components/MobileAuthPage";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters"),
  whatsapp_phone: z
    .string()
    .min(10, "Please enter a valid phone number")
    .max(20),
  gender: z.enum(["male", "female"], {
    required_error: "Please select your gender",
  }),
});

type AuthMode = "login" | "signup" | "forgot";

const AuthPage = () => {
  // Check URL params for initial mode (default to signup now)
  const [searchParams] = React.useState(
    () => new URLSearchParams(window.location.search)
  );
  const initialMode = (searchParams.get("mode") as AuthMode) || "signup";
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    whatsapp_phone: "",
    gender: "" as "male" | "female" | "",
  });

  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        const validation = loginSchema.safeParse(formData);
        if (!validation.success) {
          toast.error(validation.error.errors[0].message);
          setLoading(false);
          return;
        }

        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Welcome back! 💕");
          navigate("/home");
        }
      } else if (mode === "signup") {
        const validation = signupSchema.safeParse(formData);
        if (!validation.success) {
          toast.error(validation.error.errors[0].message);
          setLoading(false);
          return;
        }

        const { error } = await signUp(formData.email, formData.password, {
          name: formData.name,
          whatsapp_phone: formData.whatsapp_phone,
          gender: formData.gender as "male" | "female",
        });

        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Account created! Proceeding to payment... 💕");
          navigate("/payment");
        }
      } else if (mode === "forgot") {
        if (!formData.email) {
          toast.error("Please enter your email");
          setLoading(false);
          return;
        }

        const { error } = await resetPassword(formData.email);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Password reset link sent to your email!");
          setMode("login");
        }
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen hidden sm:flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-secondary via-background to-muted">
        <FloatingHearts />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-4"
        >
          <div className="card-romantic">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Logo size="lg" />
              </div>
              <p className="text-muted-foreground">
                {mode === "login" && "Welcome back to love"}
                {mode === "signup" && "Begin your journey to love"}
                {mode === "forgot" && "Reset your password"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 "
                  >
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative mt-1">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="Enter your name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone">WhatsApp Number</Label>
                      <div className="relative mt-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1234567890"
                          value={formData.whatsapp_phone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              whatsapp_phone: e.target.value,
                            })
                          }
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Gender</Label>
                      <RadioGroup
                        value={formData.gender}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            gender: value as "male" | "female",
                          })
                        }
                        className="flex gap-4 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="male" id="male" />
                          <Label htmlFor="male" className="cursor-pointer">
                            Male
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="female" id="female" />
                          <Label htmlFor="female" className="cursor-pointer">
                            Female
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </motion.div>
                </>
              )}

              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="pl-10"
                  />
                </div>
                {mode === "signup" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Please make sure you enter a valid email address
                  </p>
                )}
              </div>

              {mode !== "forgot" && (
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full btn-romantic"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Heart className="w-4 h-4 animate-pulse" />
                    {mode === "login"
                      ? "Logging in..."
                      : mode === "signup"
                      ? "Creating account..."
                      : "Sending..."}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {mode === "login" && "Login"}
                    {mode === "signup" && "Register Now"}
                    {mode === "forgot" && "Send Reset Link"}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              {mode === "login" && (
                <p>
                  Don't have an account?{" "}
                  <button
                    onClick={() => setMode("signup")}
                    className="text-primary font-medium hover:underline"
                  >
                    Register Now 🐱
                  </button>
                </p>
              )}
              {mode === "signup" && (
                <p>
                  Already have an account?{" "}
                  <button
                    onClick={() => setMode("login")}
                    className="text-primary font-medium hover:underline"
                  >
                    LOGIN
                  </button>
                </p>
              )}
              {mode === "forgot" && (
                <button
                  onClick={() => setMode("login")}
                  className="text-primary font-medium hover:underline"
                >
                  Back to Login
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      <main className="flex sm:hidden">
        <MobileAuthPage
          mode={mode}
          setMode={setMode}
          formData={formData}
          setFormData={setFormData}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          loading={loading}
          handleSubmit={handleSubmit}
        />
      </main>
    </>
  );
};

export default AuthPage;
