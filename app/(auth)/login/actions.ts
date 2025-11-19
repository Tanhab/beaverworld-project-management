// app/(auth)/login/actions.ts
"use server"

import { createClient } from "@/lib/supabase/server"
import { loginSchema } from "@/lib/validations/auth"
import { logger } from "@/lib/logger"

export async function loginAction(formData: FormData) {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  }

  const validatedData = loginSchema.safeParse(rawData)
  if (!validatedData.success) {
    return { error: "Invalid email or password format" }
  }

  const { email, password } = validatedData.data
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({ 
    email, 
    password 
  })

  if (error) {
    logger.error("Login failed", error, { email })
    return { error: error.message }
  }

  // Set Sentry user context
  if (data.user) {
    logger.setUser({
      id: data.user.id,
      email: data.user.email,
    })
    logger.info("User logged in", { userId: data.user.id })
  }

  return { error: null }
}