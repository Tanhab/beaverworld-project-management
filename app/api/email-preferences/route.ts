// app/api/email-preferences/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"
import * as Sentry from "@sentry/nextjs"

export async function POST(req: Request) {
  const supabase = await createClient()
  
  try {
    const body = await req.json()
    const { prefs } = body

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Set Sentry context
    Sentry.setUser({ id: user.id, email: user.email })

    // Upsert preferences
    const { error } = await supabase
      .from("user_email_preferences")
      .upsert({
        user_id: user.id,
        ...prefs,
        updated_at: new Date().toISOString(),
      })

    if (error) {
      logger.error("Failed to update email preferences", error, { userId: user.id })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    logger.info("Email preferences updated", { userId: user.id })
    return NextResponse.json({ ok: true })
    
  } catch (error) {
    logger.error("Unexpected error in email preferences", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}