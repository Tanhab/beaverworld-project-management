// app/api/admin/create-user/route.ts
import { createNewUser } from '@/app/admin/actions'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  try {
    const result = await createNewUser(body)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return NextResponse.json({ success: false, error: error}, { status: 400 })
  }
}



// In thunderclient 
// POST http://localhost:3000/api/admin/create-user
// Content-Type: application/json

// {
//   "username": "john_dev",
//   "email": "john@example.com",
//   "roles": ["Dev"],
//   "discord_id": "123456789"
//    "initials" : "TS"
// }