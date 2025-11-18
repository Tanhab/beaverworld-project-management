"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Eye, EyeOff, Check, X, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "@/lib/validations/profile";
import { useChangePassword } from "@/lib/hooks/useProfile";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const changePasswordMutation = useChangePassword();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const newPassword = watch("newPassword", "");

  // Password requirements check
  const requirements = [
    { label: "At least 8 characters", met: newPassword.length >= 8 },
    { label: "Contains a letter", met: /[a-zA-Z]/.test(newPassword) },
    { label: "Contains a number", met: /[0-9]/.test(newPassword) },
  ];

  const onSubmit = async (data: ChangePasswordInput) => {
    await changePasswordMutation.mutateAsync(data.newPassword);
    router.push("/profile");
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link href="/profile">
          <Button
            variant="ghost"
            className="gap-2 mb-6 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Button>
        </Link>

        {/* Main Card */}
        <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-br from-[hsl(var(--background))] to-[hsl(var(--accent))] p-8 text-center border-b border-[hsl(var(--border))]">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
              Change Password
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
              You're already authenticated. Just set your new password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-base font-semibold">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  {...register("newPassword")}
                  className={cn("pr-10", errors.newPassword && "border-red-500")}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Password Requirements */}
              <div className="space-y-2 pt-2">
                {requirements.map((req) => (
                  <div key={req.label} className="flex items-center gap-2">
                    {req.met ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    )}
                    <span
                      className={cn(
                        "text-sm font-medium",
                        req.met
                          ? "text-green-600"
                          : "text-[hsl(var(--muted-foreground))]"
                      )}
                    >
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>

              {errors.newPassword && (
                <p className="text-sm text-red-500 font-medium">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-base font-semibold">
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  className={cn(
                    "pr-10",
                    errors.confirmPassword && "border-red-500"
                  )}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 font-medium">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90 font-semibold"
            >
              {changePasswordMutation.isPending
                ? "Changing Password..."
                : "Change Password"}
            </Button>

            {/* Info Note */}
            <div className="pt-2 text-center">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                If you forgot your password, please contact an administrator
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}