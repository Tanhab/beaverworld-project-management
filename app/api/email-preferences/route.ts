import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const body = await req.json();
  const { prefs } = body;

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Upsert preferences
  const { error } = await supabase
    .from("user_email_preferences")
    .upsert({
      user_id: user.id,
      ...prefs,
      updated_at: new Date().toISOString(),
    });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const supabase = await createClient();

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get preferences
  const { data, error } = await supabase
    .from("user_email_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return defaults if no preferences found
  if (!data) {
    return NextResponse.json({
      issue_created: true,
      issue_closed: true,
      comment: true,
      collaborator_add: true,
      assigned: true,
      deadline: true,
    });
  }

  return NextResponse.json(data);
}