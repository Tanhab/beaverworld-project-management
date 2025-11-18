// lib/api/emails.ts
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

// Templates
import IssueCreatedEmail from "@/lib/email-templates/IssueCreatedEmail";
import IssueClosedEmail from "@/lib/email-templates/IssueClosedEmail";
import CommentEmail from "@/lib/email-templates/CommentEmail";
import CollaboratorEmail from "@/lib/email-templates/CollaboratorEmail";
import AssignedEmail from "@/lib/email-templates/AssignedEmail";
import TaskAssignedEmail from "@/lib/email-templates/TaskAssignedEmail";
import DeadlineEmail from "@/lib/email-templates/DeadlineEmail";

const resend = new Resend(process.env.RESEND_API_KEY!);

// ===================================================================
// 1. RATE LIMIT CHECKER (UPDATES email_usage_log)
// ===================================================================
export async function checkRateLimit() {
  const supabase = await createClient();

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("email_usage_log")
    .select("count")
    .eq("date", today)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Rate limit fetch error", error);
    return true;
  }

  const count = data?.count ?? 0;
  if (count >= 100) return false;

  await supabase
    .from("email_usage_log")
    .upsert({ date: today, count: count + 1 });

  return true;
}

// ===================================================================
// 2. FETCH USER EMAIL PREFERENCES
// ===================================================================
export async function getUserEmailPreferences(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_email_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!data || error) {
    return {
      issue_created: true,
      issue_closed: true,
      comment: true,
      collaborator_add: true,
      assigned: true,
      deadline: true,
    };
  }

  return data;
}

// ===================================================================
// 3. SHOULD THIS USER RECEIVE THIS NOTIFICATION?
// ===================================================================
export function shouldNotify(type: string, prefs: any): boolean {
  switch (type) {
    case "issue_created":
      return prefs.issue_created;
    case "issue_closed":
      return prefs.issue_closed;
    case "comment":
      return prefs.comment;
    case "collaborator_add":
      return prefs.collaborator_add;
    case "assigned":
      return prefs.assigned;
    case "task_assigned":
      return prefs.assigned;
    case "deadline":
      return prefs.deadline;
    default:
      return false;
  }
}

// ===================================================================
// 4. SEND EMAIL THROUGH RESEND
// ===================================================================
export async function sendEmail({
  to,
  cc,
  subject,
  react,
}: {
  to: string;
  cc?: string[];
  subject: string;
  react: React.ReactElement;
}) {
  const allowed = await checkRateLimit();
  if (!allowed) {
    console.log("Email skipped — rate limit reached.");
    return;
  }

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to,
      cc,
      subject,
      react,
    });
  } catch (err) {
    console.error("Resend error:", err);
  }
}

// ===================================================================
// 5. MAIN DISPATCHER (used by issue/task/comment hooks)
// ===================================================================
export async function dispatchNotification({
  type,
  issue,
  task,
  comment,
  actor,
  recipients,
  closingMessage,
}: {
  type:
    | "issue_created"
    | "issue_closed"
    | "comment"
    | "collaborator_add"
    | "assigned"
    | "task_assigned"
    | "deadline";
  issue?: any;
  task?: any;
  comment?: any;
  actor: any;
  recipients: { id: string; email: string; name: string }[];
  closingMessage?: string;
}) {
  if (!recipients.length) return;

  for (let i = 0; i < recipients.length; i++) {
    const user = recipients[i];

    const prefs = await getUserEmailPreferences(user.id);
    if (!shouldNotify(type, prefs)) continue;

    const to = user.email;
    const cc = i === 0 ? recipients.slice(1).map((u) => u.email) : undefined;

    let template;
    let subject;

    switch (type) {
      case "issue_created":
        template = IssueCreatedEmail({ issue, actor });
        subject = `Issue #${issue.issue_number || "New"}: Issue Created`;
        break;
      case "issue_closed":
        template = IssueClosedEmail({ issue, actor, closingMessage });
        subject = `Issue #${issue.issue_number || "Issue"}: Closed`;
        break;
      case "comment":
        template = CommentEmail({ issue, comment, actor });
        subject = `Issue #${issue.issue_number || "Issue"}: New Comment`;
        break;
      case "collaborator_add":
        template = CollaboratorEmail({ issue, actor });
        subject = `Issue #${issue.issue_number || "Issue"}: Added as Collaborator`;
        break;
      case "assigned":
        template = AssignedEmail({ issue, actor });
        subject = `Issue #${issue.issue_number || "New"}: Assigned to You`;
        break;
      case "task_assigned":
        template = TaskAssignedEmail({ task, actor });
        subject = `Task: ${task.title} - Assigned to You`;
        break;
      case "deadline":
        template = DeadlineEmail({ issue });
        subject = `Issue #${issue.issue_number || "Issue"}: Deadline Tomorrow`;
        break;
    }

    await sendEmail({
      to,
      cc,
      subject: subject!,
      react: template,
    });

    break;
  }
}