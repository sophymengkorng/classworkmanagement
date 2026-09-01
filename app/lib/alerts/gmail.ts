import { gmailClientId, gmailClientSecret, gmailFromEmail, gmailRefreshToken } from "../supabase/config";

function encodeBase64Url(value: string) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function gmailIsConfigured() {
  return Boolean(gmailClientId && gmailClientSecret && gmailRefreshToken && gmailFromEmail);
}

async function getGmailAccessToken() {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: gmailClientId,
      client_secret: gmailClientSecret,
      refresh_token: gmailRefreshToken,
      grant_type: "refresh_token",
    }),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || typeof result?.access_token !== "string") {
    throw new Error("Could not get Gmail access token.");
  }

  return result.access_token;
}

export async function sendGmailMessage(to: string, subject: string, text: string) {
  if (!gmailIsConfigured()) {
    return { skipped: true };
  }

  const accessToken = await getGmailAccessToken();
  const rawMessage = [
    `From: ${gmailFromEmail}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    text,
  ].join("\r\n");

  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      raw: encodeBase64Url(rawMessage),
    }),
  });

  if (!response.ok) {
    throw new Error("Gmail message failed.");
  }

  return { skipped: false };
}
