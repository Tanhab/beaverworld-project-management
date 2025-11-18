"use server";

import { dispatchNotification } from "@/lib/api/emails";
import { createClient } from "@/lib/supabase/server";

/**
 * Send email when an issue is created
 */
export async function sendIssueCreatedEmail(issueId: string) {
  const supabase = await createClient();
  
  const { data: issue } = await supabase
    .from("issues")
    .select("*, issue_assignees(user_id)")
    .eq("id", issueId)
    .single();

  if (!issue) return;

  const assigneeIds = issue.issue_assignees?.map((a: any) => a.user_id) || [];
  if (assigneeIds.length === 0) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: assigneeProfiles } = await supabase
    .from("profiles")
    .select("id, email, username")
    .in("id", assigneeIds);

  const recipients = (assigneeProfiles || [])
    .filter((p: any) => !!p.email)
    .map((p: any) => ({
      id: p.id as string,
      email: p.email as string,
      name: (p.username as string) || (p.email as string),
    }));

  if (recipients.length === 0) return;

  const { data: creatorProfile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  await dispatchNotification({
    type: "issue_created",
    issue,
    actor: {
      id: user.id,
      name: creatorProfile?.username || user.email || "Unknown",
      email: user.email || "",
    },
    recipients,
  });
}

/**
 * Send email when an issue is closed
 */
export async function sendIssueClosedEmail(issueId: string, closerId: string, closerEmail: string, closingMessage?: string) {
  const supabase = await createClient();
  
  const { data: issue } = await supabase
    .from("issues")
    .select("*, issue_assignees(user_id)")
    .eq("id", issueId)
    .single();

  if (!issue) return;

  const assigneeIds = issue.issue_assignees?.map((a: any) => a.user_id) || [];
  if (assigneeIds.length === 0) return;

  const { data: assigneeProfiles } = await supabase
    .from("profiles")
    .select("id, email, username")
    .in("id", assigneeIds);

  const recipients = (assigneeProfiles || [])
    .filter((p: any) => !!p.email)
    .map((p: any) => ({
      id: p.id as string,
      email: p.email as string,
      name: (p.username as string) || (p.email as string),
    }));

  if (recipients.length === 0) return;

  const { data: closerProfile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", closerId)
    .single();

  await dispatchNotification({
    type: "issue_closed",
    issue,
    actor: {
      id: closerId,
      name: closerProfile?.username || closerEmail || "Unknown",
      email: closerEmail || "",
    },
    recipients,
    closingMessage,
  });
}

/**
 * Send email when users are assigned to an issue
 */
export async function sendAssignedEmail(issueId: string, newUserIds: string[]) {
  const supabase = await createClient();
  
  const { data: issue } = await supabase
    .from("issues")
    .select("*")
    .eq("id", issueId)
    .single();

  if (!issue) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: assigneeProfiles } = await supabase
    .from("profiles")
    .select("id, email, username")
    .in("id", newUserIds);

  const recipients = (assigneeProfiles || [])
    .filter((p: any) => !!p.email)
    .map((p: any) => ({
      id: p.id as string,
      email: p.email as string,
      name: (p.username as string) || (p.email as string),
    }));

  if (recipients.length === 0) return;

  const { data: assignerProfile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  await dispatchNotification({
    type: "assigned",
    issue,
    actor: {
      id: user.id,
      name: assignerProfile?.username || user.email || "Unknown",
      email: user.email || "",
    },
    recipients,
  });
}

/**
 * Send email when a comment is added to an issue
 */
export async function sendCommentEmail(issueId: string, commentText: string) {
  const supabase = await createClient();
  
  const { data: issue } = await supabase
    .from("issues")
    .select("*, issue_assignees(user_id)")
    .eq("id", issueId)
    .single();

  if (!issue) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Filter out the commenter
  const assigneeIds = (issue.issue_assignees?.map((a: any) => a.user_id) || [])
    .filter((id: string) => id !== user.id);

  if (assigneeIds.length === 0) return;

  const { data: assigneeProfiles } = await supabase
    .from("profiles")
    .select("id, email, username")
    .in("id", assigneeIds);

  const recipients = (assigneeProfiles || [])
    .filter((p: any) => !!p.email)
    .map((p: any) => ({
      id: p.id as string,
      email: p.email as string,
      name: (p.username as string) || (p.email as string),
    }));

  if (recipients.length === 0) return;

  const { data: commenterProfile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  const preview = commentText.substring(0, 100) + (commentText.length > 100 ? "..." : "");

  await dispatchNotification({
    type: "comment",
    issue,
    comment: { text: preview },
    actor: {
      id: user.id,
      name: commenterProfile?.username || user.email || "Unknown",
      email: user.email || "",
    },
    recipients,
  });
}

/**
 * Send email when a task is created with assignees
 */
export async function sendTaskCreatedEmail(taskId: string, creatorId: string, creatorEmail: string) {
  const supabase = await createClient();
  
  const { data: task } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .single();

  if (!task) return;
  
  const assignedUserIds = task.assigned_to || [];
  if (assignedUserIds.length === 0) return;

  const { data: assigneeProfiles } = await supabase
    .from("profiles")
    .select("id, email, username")
    .in("id", assignedUserIds);

  const recipients = (assigneeProfiles || [])
    .filter((p: any) => !!p.email)
    .map((p: any) => ({
      id: p.id as string,
      email: p.email as string,
      name: (p.username as string) || (p.email as string),
    }));

  if (recipients.length === 0) return;

  const { data: creatorProfile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", creatorId)
    .single();

  await dispatchNotification({
    type: "task_assigned",
    task,
    actor: {
      id: creatorId,
      name: creatorProfile?.username || creatorEmail || "Unknown",
      email: creatorEmail || "",
    },
    recipients,
  });
}

/**
 * Send email when users are assigned to a task
 */
export async function sendTaskAssignedEmail(taskId: string, assignedUserIds: string[]) {
  const supabase = await createClient();
  
  const { data: task } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .single();

  if (!task) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: assigneeProfiles } = await supabase
    .from("profiles")
    .select("id, email, username")
    .in("id", assignedUserIds);

  const recipients = (assigneeProfiles || [])
    .filter((p: any) => !!p.email)
    .map((p: any) => ({
      id: p.id as string,
      email: p.email as string,
      name: (p.username as string) || (p.email as string),
    }));

  if (recipients.length === 0) return;

  const { data: assignerProfile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  await dispatchNotification({
    type: "task_assigned",
    task,
    actor: {
      id: user.id,
      name: assignerProfile?.username || user.email || "Unknown",
      email: user.email || "",
    },
    recipients,
  });
}