"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface EmailPreferences {
  issue_created: boolean;
  issue_closed: boolean;
  comment: boolean;
  collaborator_add: boolean;
  assigned: boolean;
  deadline: boolean;
}

const DEFAULT_PREFERENCES: EmailPreferences = {
  issue_created: true,
  issue_closed: true,
  comment: true,
  collaborator_add: true,
  assigned: true,
  deadline: true,
};

const PREFERENCE_LABELS: Record<keyof EmailPreferences, string> = {
  issue_created: "Issue Created",
  issue_closed: "Issue Closed",
  comment: "Comments on Issues",
  collaborator_add: "Added as Collaborator",
  assigned: "Assigned a Task",
  deadline: "Deadline Incoming",
};

export default function EmailPreferences() {
  const [preferences, setPreferences] = useState<EmailPreferences>(DEFAULT_PREFERENCES);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load preferences from API on mount
  useEffect(() => {
    setIsMounted(true);
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const res = await fetch("/api/email-preferences");
      if (res.ok) {
        const data = await res.json();
        setPreferences({ ...DEFAULT_PREFERENCES, ...data });
      }
    } catch (error) {
      console.error("Error loading email preferences:", error);
    }
  };

  // Save preferences to API
  const savePreferences = async (newPreferences: EmailPreferences) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/email-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prefs: newPreferences }),
      });
      
      if (res.ok) {
        setPreferences(newPreferences);
        toast.success("Email preferences saved");
      } else {
        toast.error("Failed to save preferences");
      }
    } catch (error) {
      console.error("Error saving email preferences:", error);
      toast.error("Failed to save preferences");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePreference = (key: keyof EmailPreferences) => {
    const newPreferences = { ...preferences, [key]: !preferences[key] };
    savePreferences(newPreferences);
  };

  const toggleAll = () => {
    const allEnabled = Object.values(preferences).every((value) => value);
    const newPreferences = Object.keys(preferences).reduce(
      (acc, key) => ({
        ...acc,
        [key]: !allEnabled,
      }),
      {} as EmailPreferences
    );
    savePreferences(newPreferences);
  };

  const allEnabled = Object.values(preferences).every((value) => value);

  if (!isMounted) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-[hsl(var(--muted))] rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Master Control Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={toggleAll}
          disabled={isLoading}
          className="gap-2 hover:bg-[hsl(var(--accent))]"
        >
          <Bell className="h-4 w-4" />
          {allEnabled ? "Turn All Off" : "Turn All On"}
        </Button>
      </div>

      {/* Grid Table */}
      <div className="rounded-lg border border-[hsl(var(--border))] overflow-hidden">
        <div className="grid grid-cols-2 gap-4 px-6 py-3 bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))]">
          <div className="font-semibold text-sm text-[hsl(var(--foreground))]">
            Notification Type
          </div>
          <div className="font-semibold text-sm text-[hsl(var(--foreground))] text-right">
            Status
          </div>
        </div>

        <div className="divide-y divide-[hsl(var(--border))]">
          {(Object.keys(preferences) as Array<keyof EmailPreferences>).map((key, index) => (
            <button
              key={key}
              type="button"
              onClick={() => togglePreference(key)}
              disabled={isLoading}
              className={cn(
                "w-full grid grid-cols-2 gap-4 px-6 py-4 transition-colors hover:bg-[hsl(var(--accent))] text-left",
                index % 2 === 0 ? "bg-[hsl(var(--card))]" : "bg-[hsl(var(--background))]",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center">
                <Label className="text-sm font-medium cursor-pointer">
                  {PREFERENCE_LABELS[key]}
                </Label>
              </div>
              <div className="flex items-center justify-end">
                {preferences[key] ? (
                  <Bell className="h-5 w-5 text-green-600" />
                ) : (
                  <BellOff className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-200">
        <Bell className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700 font-medium">
          Email notifications are sent via Resend. Changes are saved to your account automatically.
        </p>
      </div>
    </div>
  );
}