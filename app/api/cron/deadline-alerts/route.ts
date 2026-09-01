import { NextRequest, NextResponse } from "next/server";
import { sendGmailMessage } from "../../../lib/alerts/gmail";
import { sendTelegramMessage } from "../../../lib/alerts/telegram";
import { cronSecret } from "../../../lib/supabase/config";
import { createAdminClient } from "../../../lib/supabase/admin";

type TaskAlertRow = {
  id: string;
  user_id: string;
  title: string;
  subject: string;
  teacher: string;
  deadline: string;
};

type ProfileAlertRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  telegram_chat_id: string | null;
};

function cambodiaDateString(daysFromToday = 0) {
  const date = new Date(Date.now() + 7 * 60 * 60 * 1000);
  date.setUTCDate(date.getUTCDate() + daysFromToday);
  return date.toISOString().slice(0, 10);
}

function isAuthorized(request: NextRequest) {
  if (!cronSecret) return true;
  return request.headers.get("authorization") === `Bearer ${cronSecret}`;
}

function alertMessage(task: TaskAlertRow, profile?: ProfileAlertRow) {
  const name = profile?.display_name ? `${profile.display_name}, ` : "";

  return [
    `Hi ${name}your task is due tomorrow.`,
    "",
    `Task: ${task.title}`,
    `Subject: ${task.subject}`,
    `Teacher: ${task.teacher}`,
    `Deadline: ${task.deadline}`,
  ].join("\n");
}

async function wasAlertSent(supabase: ReturnType<typeof createAdminClient>, userId: string, taskId: string, alertType: "telegram" | "gmail") {
  const { data, error } = await supabase
    .from("deadline_alerts")
    .select("id")
    .eq("user_id", userId)
    .eq("task_id", taskId)
    .eq("alert_type", alertType)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not check ${alertType} alert status: ${error.message}`);
  }

  return Boolean(data);
}

async function markAlertSent(supabase: ReturnType<typeof createAdminClient>, userId: string, taskId: string, alertType: "telegram" | "gmail") {
  const { error } = await supabase
    .from("deadline_alerts")
    .upsert(
      {
        user_id: userId,
        task_id: taskId,
        alert_type: alertType,
        sent_at: new Date().toISOString(),
      },
      { onConflict: "user_id,task_id,alert_type" },
    );

  if (error) {
    throw new Error(`Could not save ${alertType} alert status: ${error.message}`);
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const tomorrow = cambodiaDateString(1);

  const { data: taskRows, error: taskError } = await supabase
    .from("tasks")
    .select("id,user_id,title,subject,teacher,deadline")
    .neq("status", "Completed")
    .eq("deadline", tomorrow);

  if (taskError) {
    return NextResponse.json({ message: taskError.message }, { status: 500 });
  }

  const tasks = (taskRows ?? []) as TaskAlertRow[];
  const userIds = Array.from(new Set(tasks.map((task) => task.user_id)));

  const { data: profileRows, error: profileError } = userIds.length
    ? await supabase
        .from("profiles")
        .select("id,email,display_name,telegram_chat_id")
        .in("id", userIds)
    : { data: [], error: null };

  if (profileError) {
    return NextResponse.json({ message: profileError.message }, { status: 500 });
  }

  const profiles = new Map((profileRows ?? []).map((profile) => [(profile as ProfileAlertRow).id, profile as ProfileAlertRow]));
  let telegramSent = 0;
  let gmailSent = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const task of tasks) {
    const profile = profiles.get(task.user_id);
    const message = alertMessage(task, profile);

    if (profile?.telegram_chat_id) {
      try {
        if (!(await wasAlertSent(supabase, task.user_id, task.id, "telegram"))) {
          await sendTelegramMessage(profile.telegram_chat_id, message);
          await markAlertSent(supabase, task.user_id, task.id, "telegram");
          telegramSent += 1;
        }
      } catch (error) {
        errors.push(error instanceof Error ? error.message : "Telegram alert failed.");
      }
    } else {
      skipped += 1;
    }

    if (profile?.email) {
      try {
        if (!(await wasAlertSent(supabase, task.user_id, task.id, "gmail"))) {
          const result = await sendGmailMessage(profile.email, `Task due tomorrow: ${task.title}`, message);
          if (!result.skipped) {
            await markAlertSent(supabase, task.user_id, task.id, "gmail");
            gmailSent += 1;
          }
        }
      } catch (error) {
        errors.push(error instanceof Error ? error.message : "Gmail alert failed.");
      }
    } else {
      skipped += 1;
    }
  }

  return NextResponse.json({
    checkedDate: tomorrow,
    tasks: tasks.length,
    telegramSent,
    gmailSent,
    skipped,
    errors,
  });
}
