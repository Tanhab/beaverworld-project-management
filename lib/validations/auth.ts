import {z} from "zod"

export const loginSchema = z.object({
    email: z.email("Please enter a valid email address")
    .min(1, "Email is required"),
    password : z.string()
    .min(1, "Password is required") 
    .min(8, "Password must be at least 8 characters long")
     .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
})

export type LoginInput = z.infer<typeof loginSchema>