"use server"

import { createClient } from "@/lib/supabase/server"
import { loginSchema } from "@/lib/validations/auth"
// import { redirect } from "next/navigation"
// import { revalidatePath } from "next/cache"

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

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  // Do NOT redirect here; just signal success
  return { error: null }
}
