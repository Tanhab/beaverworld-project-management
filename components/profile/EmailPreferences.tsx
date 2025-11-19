"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

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

type PreferenceKey = keyof EmailPreferences;

const PREFERENCE_LABELS: Record<PreferenceKey, string> = {
  issue_created: "Issue Created",
  issue_closed: "Issue Closed",
  comment: "Comments on Issues",
  collaborator_add: "Added as Collaborator",
  assigned: "Assigned a Task",
  deadline: "Deadline Incoming",
};

export default function EmailPreferencesPanel() {
  const [preferences, setPreferences] =
    useState<EmailPreferences>(DEFAULT_PREFERENCES);
  const [isMounted, setIsMounted] = useState(false);
  const [isFetching, setIsFetching] = useState(true); // initial load
  const [isSaving, setIsSaving] = useState(false); // POST/updates

  useEffect(() => {
    setIsMounted(true);
    void loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setIsFetching(true);
    try {
      const res = await fetch("/api/email-preferences", {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        logger.error("Failed to load email preferences", res.statusText);
        return;
      }

      const data = (await res.json()) as EmailPreferences;
      setPreferences({
        ...DEFAULT_PREFERENCES,
        ...data,
      });
    } catch (error) {
      logger.error("Error loading email preferences:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const savePreferences = async (newPreferences: EmailPreferences) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/email-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prefs: newPreferences }),
      });

      if (!res.ok) {
        toast.error("Failed to save preferences");
        return;
      }

      const saved = (await res.json()) as EmailPreferences;
      setPreferences(saved);
      toast.success("Email preferences saved");
    } catch (error) {
      logger.error("Error saving email preferences:", error);
      toast.error("Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  const togglePreference = (key: PreferenceKey) => {
    const newPreferences: EmailPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };
    void savePreferences(newPreferences);
  };

  const toggleAll = () => {
    const allEnabled = Object.values(preferences).every(Boolean);
    const newPreferences = Object.keys(preferences).reduce(
      (acc, key) => ({
        ...acc,
        [key]: !allEnabled,
      }),
      {} as EmailPreferences,
    );
    void savePreferences(newPreferences);
  };

  const allEnabled = Object.values(preferences).every(Boolean);

  if (!isMounted) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-[hsl(var(--muted))] rounded animate-pulse" />
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
          disabled={isFetching || isSaving}
          className="gap-2 hover:bg-[hsl(var(--accent))]"
        >
          {isFetching ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <Bell className="h-4 w-4" />
              {allEnabled ? "Turn All Off" : "Turn All On"}
            </>
          )}
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
          {isFetching
            ? // Skeleton rows while loading
              (Object.keys(DEFAULT_PREFERENCES) as PreferenceKey[]).map(
                (key, index) => (
                  <div
                    key={key}
                    className={cn(
                      "w-full grid grid-cols-2 gap-4 px-6 py-4",
                      index % 2 === 0
                        ? "bg-[hsl(var(--card))]"
                        : "bg-[hsl(var(--background))]",
                    )}
                  >
                    <div className="flex items-center">
                      <div className="h-4 w-40 bg-[hsl(var(--muted))] rounded animate-pulse" />
                    </div>
                    <div className="flex items-center justify-end">
                      <div className="h-5 w-5 rounded-full bg-[hsl(var(--muted))] animate-pulse" />
                    </div>
                  </div>
                ),
              )
            : // Real rows once loaded
              (Object.keys(preferences) as PreferenceKey[]).map(
                (key, index) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => togglePreference(key)}
                    disabled={isSaving}
                    className={cn(
                      "w-full grid grid-cols-2 gap-4 px-6 py-4 transition-colors hover:bg-[hsl(var(--accent))] text-left",
                      index % 2 === 0
                        ? "bg-[hsl(var(--card))]"
                        : "bg-[hsl(var(--background))]",
                      isSaving && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    <div className="flex items-center">
                      <Label className="text-sm font-medium cursor-pointer">
                        {PREFERENCE_LABELS[key]}
                      </Label>
                    </div>
                    <div className="flex items-center justify-end">
                      {isSaving ? (
                        <Loader2 className="h-5 w-5 animate-spin text-[hsl(var(--muted-foreground))]" />
                      ) : preferences[key] ? (
                        <Bell className="h-5 w-5 text-green-600" />
                      ) : (
                        <BellOff className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                      )}
                    </div>
                  </button>
                ),
              )}
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-200">
        <Bell className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700 font-medium">
          Email notifications are sent via Resend. Changes are saved to your
          account automatically.
        </p>
      </div>
    </div>
  );
}
