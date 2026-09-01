import { telegramBotToken } from "../supabase/config";

export async function sendTelegramMessage(chatId: string, text: string) {
  if (!telegramBotToken) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured.");
  }

  const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const message = typeof result?.description === "string" ? result.description : "Telegram message failed.";
    throw new Error(message);
  }
}
