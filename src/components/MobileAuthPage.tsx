"use client";
import React, { useState, FormEvent, Dispatch, SetStateAction } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Heart,
  Lock,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AuthImage from "@/assets/valentina-bg.png";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { cn } from "@/lib/utils";

type UserDetails = {
  name: string;
  email: string;
  password: string;
  whatsapp_phone: string;
  gender: "male" | "female" | "";
};
interface AuthProps {
  mode: string;
  formData: UserDetails;
  setFormData: Dispatch<SetStateAction<UserDetails>>;
  setMode?: Dispatch<SetStateAction<string>>;
  showPassword: boolean;
  setShowPassword: Dispatch<SetStateAction<boolean>>;
  loading: boolean;
  handleSubmit?: (e: FormEvent) => void;
}
const MobileAuthPage = ({
  mode,
  formData,
  setFormData,
  setMode,
  showPassword,
  setShowPassword,
  loading,
  handleSubmit,
}: AuthProps) => {
  return (
    <main className="h-screen overflow-hidden">
      <section className="fixed bg-[url('/images/onboarding.svg')] h-screen bg-no-repeat bg-cover w-full inset-0 overflow-y-hidden no-scrollbar">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative inset-0   w-full flex flex-col gap-2 items-center justify-center text-center">
          <div className="m-auto w-full">
            <img
              src={AuthImage}
              className="w-full h-full"
              alt="Valentina-logo"
            />
          </div>
        </div>
      </section>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white bg-gradient-to-r from-white via-[#FCE1E299] to-white rounded-t-[16px] h-[60dvh] overflow-y-auto no-scrollbar fixed bottom-0  w-full"
      >
        <div className="px-6 py-8 flex flex-col  gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-[24px] font-[700] text-[700]">
              {mode === "login" && "Welcome back to love"}
              {mode === "signup" && "Begin your journey to love"}
              {mode === "forgot" && "Reset your password"}
            </h1>
            <p className="text-[16px] font-[600] text-[#616161]">
              Discover your perfect match this Valentine's Day and make it
              unforgettable!
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            {mode === "signup" && (
              <>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col gap-5"
                >
                  <div className="flex flex-col gap-3">
                    <label
                      className="text-[16px] font-[600] text-[#333333]"
                      htmlFor="name"
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="pl-10 py-6 rounded-[20px]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label
                      className="text-[16px] font-[600] text-[#333333]"
                      htmlFor="phone"
                    >
                      WhatsApp Number
                    </label>
                    <div className="relative">
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
                        className="pl-10 py-6 rounded-[20px]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="text-[16px] font-[600] text-[#333333]">
                      Gender{" "}
                    </label>
                    <RadioGroup
                      value={formData.gender}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          gender: value as "male" | "female",
                        })
                      }
                      className="flex gap-4 "
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <label htmlFor="male" className="cursor-pointer">
                          Male
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <label htmlFor="female" className="cursor-pointer">
                          Female
                        </label>
                      </div>
                    </RadioGroup>
                  </div>
                </motion.div>
              </>
            )}

            <div
              className={cn(
                "flex flex-col gap-5 ",
                mode === "login" ? "mt-0" : "my-5"
              )}
            >
              <div className="flex flex-col gap-3 ">
                <label
                  className="text-[16px] font-[600] text-[#333333]"
                  htmlFor="email"
                >
                  Email{" "}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="pl-10 py-6 rounded-[20px]"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Please enter a valid email address</p>
              </div>

              {mode !== "forgot" && (
                <div className="flex flex-col gap-3 ">
                  <label
                    htmlFor="password"
                    className="text-[16px] font-[600] text-[#333333]"
                  >
                    Password
                  </label>
                  <div className="relative ">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="pl-10 pr-10 py-6 rounded-[20px]"
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
            </div>

            {mode === "login" && (
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="text-sm text-primary hover:underline my-2"
              >
                Forgot password?
              </button>
            )}

            <div className="mt-2 flex flex-col gap-2">
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
            </div>
            <div className=" text-center text-sm mt-5">
              {mode === "login" && (
                <p>
                  Don't have an account?{" "}
                  <button
                    onClick={() => setMode("signup")}
                    className="text-primary font-medium hover:underline"
                  >
                    Register Now
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
                    Login
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
          </form>
        </div>
      </motion.section>
    </main>
  );
};

export { MobileAuthPage };
//
