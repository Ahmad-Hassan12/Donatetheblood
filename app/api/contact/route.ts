import { Resend } from "resend";
import { contactSchema, CONTACT_SUBJECTS } from "@/lib/schemas";
import { zodFieldIssues } from "@/lib/zod-issues";

const CONTACT_TO_EMAIL =
  process.env.CONTACT_TO_EMAIL ?? "donatetheblood@kivrosolutions.com";
const CONTACT_FROM_EMAIL =
  process.env.CONTACT_FROM_EMAIL ?? "onboarding@resend.dev";

const SUBJECT_LABELS = CONTACT_SUBJECTS.reduce<Record<string, string>>(
  (acc, s) => {
    acc[s.value] = s.label;
    return acc;
  },
  {}
);

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildEmailHtml({
  name,
  email,
  subjectLabel,
  message,
}: {
  name: string;
  email: string;
  subjectLabel: string;
  message: string;
}): string {
  const messageHtml = escapeHtml(message).replace(/\n/g, "<br>");
  const row = (label: string, value: string) =>
    `<tr><td style="padding:10px 12px;border:1px solid #e2e2e2;font-weight:bold;width:120px;vertical-align:top;background:#fafafa;">${label}</td>` +
    `<td style="padding:10px 12px;border:1px solid #e2e2e2;vertical-align:top;">${value}</td></tr>`;
  return (
    `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a;">` +
    `<h2 style="margin:0 0 16px;font-size:20px;">New contact form message</h2>` +
    `<table style="width:100%;border-collapse:collapse;font-size:14px;" cellpadding="0" cellspacing="0">` +
    row("From", `${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;`) +
    row("Subject", escapeHtml(subjectLabel)) +
    row("Message", messageHtml) +
    `</table></div>`
  );
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Email is not configured — set RESEND_API_KEY in .env.local." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        error: "Please fix the highlighted fields.",
        issues: zodFieldIssues(parsed.error),
      },
      { status: 400 }
    );
  }

  const { name, email, subject, message } = parsed.data;
  const subjectLabel = SUBJECT_LABELS[subject] ?? subject;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: CONTACT_FROM_EMAIL,
    to: CONTACT_TO_EMAIL,
    replyTo: email,
    subject: `[DonateTheBlood Contact] ${subjectLabel} — ${name}`,
    html: buildEmailHtml({ name, email, subjectLabel, message }),
  });

  if (error) {
    console.error(
      "[contact] Resend send failed:",
      JSON.stringify({
        name: error.name ?? null,
        message: error.message ?? null,
        statusCode: error.statusCode ?? null,
      })
    );
    return Response.json(
      { error: "Couldn't send the message. Please try again." },
      { status: 502 }
    );
  }

  return Response.json({ message: "Message sent." });
}