// Server-only helper to send Telegram notifications to the admin via Lovable connector gateway.
const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";

export async function notifyAdmin(text: string): Promise<void> {
  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
  const TELEGRAM_API_KEY = process.env.TELEGRAM_API_KEY;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!LOVABLE_API_KEY || !TELEGRAM_API_KEY || !chatId) {
    console.warn("[telegram] Skipping notification — missing env vars");
    return;
  }

  try {
    const res = await fetch(`${GATEWAY_URL}/sendMessage`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TELEGRAM_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`[telegram] sendMessage failed [${res.status}]: ${body}`);
    }
  } catch (err) {
    console.error("[telegram] sendMessage error:", err);
  }
}
