const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(express.json());

// تهيئة واتساب مع حفظ الجلسة
const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './.wwebjs_auth'
    }),
     puppeteer: {
    headless: true,
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
    ]
}
});

// طباعة QR عند الحاجة
client.on('qr', qr => {
    console.log('📱 امسح هذا الكود لتسجيل الدخول في واتساب:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ WhatsApp Client جاه للعمل!');
});

// ✅ مسار إرسال رسالة عند الطلب
app.post('/send-order', async (req, res) => {
    const { phone, message } = req.body;

    if (!phone || !message) {
        return res.status(400).json({ success: false, error: 'يرجى إرسال رقم الهاتف والرسالة' });
    }

    try {
        const chatId = phone + "@c.us"; // تحويل الرقم إلى صيغة واتساب
        await client.sendMessage(chatId, message);
        res.json({ success: true, message: 'تم إرسال الرسالة بنجاح ✅' });
    } catch (err) {
        console.error('❌ خطأ أثناء الإرسال:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 السيرفر يعمل على المنفذ ${PORT}`);
});

// تشغيل عميل واتساب
client.initialize();
