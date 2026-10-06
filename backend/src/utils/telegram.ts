import { formatSom } from './currency.js';

interface ApplicationNotificationPayload {
  applicationNumber: string;
  customerName: string;
  phone: string;
  district: string;
  address: string;
  productName: string;
  variantDetails?: string;
  termMonths: number;
  totalPrice: number;
  downPayment: number;
  monthlyPayment: number;
}

export async function sendTelegramApplicationAlert(payload: ApplicationNotificationPayload): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  const text = `🔥 <b>YANGI NASIYA ARIZASI!</b>\n\n` +
    `📋 <b>Ariza raqami:</b> #${payload.applicationNumber}\n` +
    `👤 <b>Mijoz:</b> ${payload.customerName}\n` +
    `📞 <b>Telefon:</b> ${payload.phone}\n` +
    `📍 <b>Tuman / Manzil:</b> ${payload.district}, ${payload.address}\n\n` +
    `📱 <b>Mahsulot:</b> ${payload.productName} ${payload.variantDetails ? `(${payload.variantDetails})` : ''}\n` +
    `⏳ <b>Muddat:</b> ${payload.termMonths} oy\n` +
    `💰 <b>Boshlang'ich to'lov:</b> ${formatSom(payload.downPayment)}\n` +
    `💳 <b>Oylik to'lov:</b> ${formatSom(payload.monthlyPayment)} / oy\n` +
    `🏷️ <b>Jami summa:</b> ${formatSom(payload.totalPrice)}\n\n` +
    `🔗 <i>Admin panelda ko'rib chiqish uchun ilovani oching.</i>`;

  console.log(`[Telegram Alert Dispatched]\n${text.replace(/<[^>]*>?/gm, '')}`);

  if (!token || !chatId || token === 'mock_bot_token' || chatId === 'mock_chat_id') {
    return true;
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });

    return res.ok;
  } catch (error) {
    console.error('Failed to send Telegram alert:', error);
    return false;
  }
}
