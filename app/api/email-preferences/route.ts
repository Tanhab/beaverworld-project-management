// app/api/email-preferences/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";

const DEFAULT_PREFERENCES = {
  issue_created: true,
  issue_closed: true,
  comment: true,
  collaborator_add: true,
  assigned: true,
  deadline: true,
} as const;

const PreferencesSchema = z.object({
  issue_created: z.boolean(),
  issue_closed: z.boolean(),
  comment: z.boolean(),
  collaborator_add: z.boolean(),
  assigned: z.boolean(),
  deadline: z.boolean(),
});

type EmailPreferences = z.infer<typeof PreferencesSchema>;

async function getAuthedUserSupabase() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, user: null as null };
  }

  Sentry.setUser({ id: user.id, email: user.email ?? undefined });
  return { supabase, user };
}

export async function GET() {
  const { supabase, user } = await getAuthedUserSupabase();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
        .from("user_email_preferences")
        .select(
        "issue_created, issue_closed, comment, collaborator_add, assigned, deadline"
        )
        .eq("user_id", user.id)
        .maybeSingle();

    if (error) {
      // If there is a “no rows” style error, just fall back to defaults.
      logger.error("Error loading email preferences", error, {
        userId: user.id,
      });
    }

    const prefs: EmailPreferences = {
      ...DEFAULT_PREFERENCES,
      ...(data ?? {}),
    };

    return NextResponse.json(prefs);
  } catch (error) {
    logger.error("Unexpected error in GET /email-preferences", error, {
      userId: user.id,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const { supabase, user } = await getAuthedUserSupabase();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const prefs = PreferencesSchema.parse(body.prefs ?? body);

    const { error } = await supabase.from("user_email_preferences").upsert({
      user_id: user.id,
      ...prefs,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      logger.error("Failed to update email preferences", error, {
        userId: user.id,
      });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    logger.info("Email preferences updated", { userId: user.id });
    return NextResponse.json(prefs);
  } catch (error) {
    logger.error("Unexpected error in POST /email-preferences", error, {
      userId: user.id,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
