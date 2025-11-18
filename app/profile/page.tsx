"use client";

import { ArrowRight, Shield, User, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/lib/hooks/useUser";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileForm from "@/components/profile/ProfileForm";
import EmailPreferences from "@/components/profile/EmailPreferences";
import Navbar from "@/components/navbar";

export default function ProfilePage() {
  const { data: currentUser, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] p-6">
        <div className="mx-auto max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-[hsl(var(--muted))] rounded"></div>
            <div className="h-32 bg-[hsl(var(--card))] rounded-xl"></div>
            <div className="h-96 bg-[hsl(var(--card))] rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
            Not logged in
          </h2>
          <p className="text-[hsl(var(--muted-foreground))] mt-2">
            Please log in to view your profile
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[hsl(var(--background))] p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">
              Profile Settings
            </h1>
            <p className="text-[hsl(var(--muted-foreground))] mt-1 font-medium">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Profile Header Card */}
          <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6">
            <ProfileHeader profile={currentUser} />
          </div>

          {/* Personal Information Card */}
          <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-[hsl(var(--primary))]/10 flex items-center justify-center">
                <User className="h-5 w-5 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">
                  Personal Information
                </h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Update your profile details
                </p>
              </div>
            </div>
            <ProfileForm profile={currentUser} />
          </div>

          {/* Security Card */}
          <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-[hsl(var(--primary))]/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">
                  Security
                </h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Manage your password and security settings
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-[hsl(var(--border))]">
                <div>
                  <p className="font-semibold text-[hsl(var(--foreground))]">
                    Password
                  </p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                    ••••••••••••
                  </p>
                </div>
                <Link href="/profile/change-password">
                  <Button
                    variant="outline"
                    className="gap-2 hover:bg-[hsl(var(--accent))]"
                  >
                    Change Password
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Email Preferences Card */}
          <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-[hsl(var(--primary))]/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">
                  Email Preferences
                </h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Choose which emails you want to receive
                </p>
              </div>
            </div>
            <EmailPreferences />
          </div>
        </div>
      </div>
    </>
  );
}