const BOT_TOKEN = '8522851670:AAHH9UfKSTFf5H8BaMCniBo3jCaDZ_U6rsU';
const CHAT_IDS = ['5387795208', '1158150944'];

export const sendTelegramMessage = async (message) => {
  for (const chatId of CHAT_IDS) {
    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML'
        })
      });
    } catch (err) {
      console.error('Telegramga yuborishda xatolik:', err);
    }
  }
};
