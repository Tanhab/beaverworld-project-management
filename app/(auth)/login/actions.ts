"use server"

import { createClient } from "@/lib/supabase/server"
import { loginSchema } from "@/lib/validations/auth"
import { redirect } from "next/navigation"


export async function loginAction(formData: FormData){
    const rawData = {
        email: formData.get("email"),
        password: formData.get("password")
    } 


    const validatedData = loginSchema.safeParse(rawData)

    if(!validatedData.success){
        return {
            error: validatedData.error.flatten().fieldErrors
        }
    }

    const {email, password} = validatedData.data

    const supabase = await createClient()
    const {error} = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if(error){
        return {
            error: error.message
        }
    }

    redirect("/")


}