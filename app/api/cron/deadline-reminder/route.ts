import { createNotificationsForUsers } from "@/lib/api/notifications";
import { sendDiscordNotification } from "@/lib/integrations/discord";
import { dispatchNotification } from "@/lib/api/emails";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const target = tomorrow.toISOString().split("T")[0];

  const { data: issues } = await supabase
    .from("issues")
    .select("id, issue_number, title, priority, deadline")
    .eq("deadline", target);

  for (const issue of issues ?? []) {
    // Get assignees
    const { data: assigneeData } = await supabase
      .from("issue_assignees")
      .select("user_id")
      .eq("issue_id", issue.id);

    const assigneeIds = assigneeData?.map((a) => a.user_id) || [];
    if (assigneeIds.length === 0) continue;

    // 1) In-app notification
    const notifications = await createNotificationsForUsers(assigneeIds, {
      type: "reminder",
      title: `Issue #${issue.issue_number} is due tomorrow`,
      message: issue.title,
      link: `/issues/${issue.issue_number}`,
      priority: issue.priority === "urgent" || issue.priority === "high" ? "high" : "normal",
      issue_id: issue.id,
    });

    // 2) Discord notification
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, discord_id, email")
      .in("id", assigneeIds);

    const usersWithDiscord = profiles
      ?.filter((p) => p.discord_id)
      .map((p) => ({
        discord_id: p.discord_id as string,
        username: p.username as string,
      })) ?? [];

    if (usersWithDiscord.length > 0 && notifications.length > 0) {
      await sendDiscordNotification({
        notificationId: notifications[0].id,
        type: "reminder",
        title: `Issue #${issue.issue_number} due tomorrow`,
        message: issue.title,
        link: `/issues/${issue.issue_number}`,
        priority: issue.priority === "urgent" || issue.priority === "high" ? "high" : "normal",
        users: usersWithDiscord,
      });
    }

    // 3) Email notification
    const recipients = profiles
      ?.filter((p) => p.email)
      .map((p) => ({
        id: p.id,
        email: p.email as string,
        name: p.username || p.email as string,
      })) ?? [];

    if (recipients.length > 0) {
      await dispatchNotification({
        type: "deadline",
        issue,
        actor: { id: "system", name: "System", email: "system@beaverworld.dev" },
        recipients,
      });
    }
  }

  return NextResponse.json({ ok: true, processed: issues?.length || 0 });
}