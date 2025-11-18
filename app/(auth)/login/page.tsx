"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { LoginInput, loginSchema } from "@/lib/validations/auth";
import { zodResolver } from '@hookform/resolvers/zod'
import { loginAction } from "./actions";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);

  // react-hook-form handles ALL form state
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting },
    watch // To track input values for animation
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  // Watch values for the gradient animation
  const emailValue = watch("email", "");
  const passwordValue = watch("password", "");

  const onSubmit = async (data: LoginInput) => {
  const formData = new FormData();
  formData.append("email", data.email);
  formData.append("password", data.password);

  const result = await loginAction(formData);

  if (result?.error) {
    console.error(result.error);
    toast.error("Login failed. Please check your credentials.");
  } else {
    // ✅ Tell React Query that auth has changed
    await queryClient.invalidateQueries({ queryKey: ["currentUser"] });

    toast.success("Login successful!");
    router.push("/"); // or window.location.href = "/" if you absolutely want a hard reload
  }
};

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[hsl(var(--background))] flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-5xl">
        {/* Main Card Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 bg-[hsl(var(--card))] rounded-2xl shadow-lg overflow-hidden border border-[hsl(var(--border))]">
          {/* Left Section - Quote & Image */}
          <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-linear-to-br from-[hsl(var(--background))] to-[hsl(var(--accent))]">
            <div className="flex flex-col items-center gap-8">
              {/* Beaver Image */}
              <div className="relative w-56 h-56 flex items-center justify-center">
                <Image
                  src="/beaver_large.png"
                  alt="BeaverWorld mascot"
                  width={224}
                  height={224}
                  className="object-contain drop-shadow-lg"
                  priority
                />
              </div>

              {/* Quote Section */}
              <div className="flex flex-col gap-6 text-center max-w-sm">
                <blockquote className="space-y-4">
                  <p className="text-lg leading-relaxed text-[hsl(var(--foreground))] font-medium italic">
                    "The kind of people I look for to fill top management spots
                    are the eager beavers, the mavericks. These are the guys who
                    try to do more than they're expected to do - they always
                    reach."
                  </p>
                  <footer className="text-sm font-semibold text-[hsl(var(--muted-foreground))] not-italic">
                    — Lee Iacocca
                  </footer>
                </blockquote>
              </div>
            </div>
          </div>

          {/* Right Section - Login Form */}
          <div className="flex flex-col items-center justify-center p-8 lg:p-12">
            <div className="w-full max-w-sm">
              {/* Header */}
              <div className="space-y-2 mb-8">
                <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
                  Welcome Back
                </h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Sign in to your account to continue
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Email Input */}
                <div className="space-y-2.5">
                  <Label
                    htmlFor="email"
                    className="text-sm font-semibold text-[hsl(var(--foreground))]"
                  >
                    Email
                  </Label>
                  <div className="relative group">
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      {...register("email")}
                      autoComplete="email"
                      className={cn(
                        "w-full px-4 py-3 rounded-lg",
                        "bg-[hsl(var(--background))] border-2",
                        "transition-all duration-200 ease-out",
                        "placeholder:text-[hsl(var(--muted-foreground))]",
                        "focus:outline-none focus:ring-0",
                        errors.email
                          ? "border-red-500 focus:border-red-600"
                          : "border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] focus:bg-white"
                      )}
                      disabled={isSubmitting}
                    />
                    <div
                      className={cn(
                        "absolute bottom-0 left-0 h-0.5 bg-linear-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))]",
                        "transition-all duration-300 ease-out rounded-full",
                        "group-focus-within:w-full"
                      )}
                      style={{
                        width: emailValue.length > 0 ? "100%" : "0%",
                      }}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500 font-medium">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Input */}
                <div className="space-y-2.5">
                  <Label
                    htmlFor="password"
                    className="text-sm font-semibold text-[hsl(var(--foreground))]"
                  >
                    Password
                  </Label>
                  <div className="relative group">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...register("password")}
                      
                      className={cn(
                        "w-full px-4 py-3 pr-12 rounded-lg",
                        "bg-[hsl(var(--background))] border-2",
                        "transition-all duration-200 ease-out",
                        "placeholder:text-[hsl(var(--muted-foreground))]",
                        "focus:outline-none focus:ring-0",
                        errors.password
                          ? "border-red-500 focus:border-red-600"
                          : "border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] focus:bg-white"
                      )}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
                      disabled={isSubmitting}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                    <div
                      className={cn(
                        "absolute bottom-0 left-0 h-0.5 bg-linear-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))]",
                        "transition-all duration-300 ease-out rounded-full",
                        "group-focus-within:w-full"
                      )}
                      style={{
                        width: passwordValue.length > 0 ? "100%" : "0%",
                      }}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500 font-medium">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Forgot Password Link */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-xs font-semibold text-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))] px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "w-full mt-6 py-3 rounded-lg font-semibold text-base",
                    "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]",
                    "hover:bg-[hsl(var(--primary))] transition-all duration-200",
                    "active:scale-95 hover:shadow-lg",
                    "disabled:opacity-70 disabled:cursor-not-allowed",
                    "flex items-center justify-center gap-2"
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-[hsl(var(--primary-foreground))] border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>

              {/* Footer Note */}
              <div className="mt-8 pt-6 border-t border-[hsl(var(--border))] text-center">
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Contact your administrator if you don't have an account
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Quote Display */}
        <div className="lg:hidden mt-8 p-6 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] text-center">
          <blockquote className="space-y-3">
            <p className="text-base leading-relaxed text-[hsl(var(--foreground))] font-medium italic">
              "The kind of people I look for to fill top management spots are the
              eager beavers, the mavericks."
            </p>
            <footer className="text-xs font-semibold text-[hsl(var(--muted-foreground))] not-italic">
              — Lee Iacocca
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}