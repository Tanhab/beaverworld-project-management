"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormState {
  username: string;
  password: string;
  errors: { username?: string; password?: string };
  isLoading: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<FormState>({
    username: "",
    password: "",
    errors: {},
    isLoading: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      errors: { ...prev.errors, [name]: "" },
    }));
  };

  const validateForm = () => {
    const errors: { username?: string; password?: string } = {};
    if (!form.username.trim()) errors.username = "Username is required";
    if (!form.password) errors.password = "Password is required";
    if (form.password && form.password.length < 6)
      errors.password = "Password must be at least 6 characters";
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setForm((prev) => ({ ...prev, errors }));
      return;
    }

    setForm((prev) => ({ ...prev, isLoading: true }));

    // Simulate API call
    setTimeout(() => {
      console.log("Login attempt:", { username: form.username });
      router.push("/issues");
    }, 1500);
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
                {/* <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center">
                    <Image
                      src="/beaver_icon.png"
                      width={24}
                      height={24}
                      alt="BeaverWorld"
                    />
                  </div>
                  <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
                    BeaverWorldDev
                  </h1>
                </div> */}
                <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
                  Welcome Back
                </h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Sign in to your account to continue
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Username Input */}
                <div className="space-y-2.5">
                  <Label
                    htmlFor="username"
                    className="text-sm font-semibold text-[hsl(var(--foreground))]"
                  >
                    Username
                  </Label>
                  <div className="relative group">
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="Enter your username"
                      value={form.username}
                      onChange={handleInputChange}
                      autoComplete="username"
                      className={cn(
                        "w-full px-4 py-3 rounded-lg",
                        "bg-[hsl(var(--background))] border-2",
                        "transition-all duration-200 ease-out",
                        "placeholder:text-[hsl(var(--muted-foreground))]",
                        "focus:outline-none focus:ring-0",
                        form.errors.username
                          ? "border-red-500 focus:border-red-600"
                          : "border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] focus:bg-white"
                      )}
                      disabled={form.isLoading}
                    />
                    <div
                      className={cn(
                        "absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))]",
                        "transition-all duration-300 ease-out rounded-full",
                        "group-focus-within:w-full"
                      )}
                      style={{
                        width: form.username.length > 0 ? "100%" : "0%",
                      }}
                    />
                  </div>
                  {form.errors.username && (
                    <p className="text-xs text-red-500 font-medium">
                      {form.errors.username}
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
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={handleInputChange}
                      autoComplete="current-password"
                      className={cn(
                        "w-full px-4 py-3 pr-12 rounded-lg",
                        "bg-[hsl(var(--background))] border-2",
                        "transition-all duration-200 ease-out",
                        "placeholder:text-[hsl(var(--muted-foreground))]",
                        "focus:outline-none focus:ring-0",
                        form.errors.password
                          ? "border-red-500 focus:border-red-600"
                          : "border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] focus:bg-white"
                      )}
                      disabled={form.isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
                      disabled={form.isLoading}
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
                        "absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))]",
                        "transition-all duration-300 ease-out rounded-full",
                        "group-focus-within:w-full"
                      )}
                      style={{
                        width: form.password.length > 0 ? "100%" : "0%",
                      }}
                    />
                  </div>
                  {form.errors.password && (
                    <p className="text-xs text-red-500 font-medium">
                      {form.errors.password}
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
                  disabled={form.isLoading}
                  className={cn(
                    "w-full mt-6 py-3 rounded-lg font-semibold text-base",
                    "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]",
                    "hover:bg-[hsl(var(--primary))] transition-all duration-200",
                    "active:scale-95 hover:shadow-lg",
                    "disabled:opacity-70 disabled:cursor-not-allowed",
                    "flex items-center justify-center gap-2"
                  )}
                >
                  {form.isLoading ? (
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