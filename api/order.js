const nodemailer = require('nodemailer');

const RESTAURANT_EMAIL = process.env.RESTAURANT_EMAIL;
const APP_PASSWORD = process.env.APP_PASSWORD;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: RESTAURANT_EMAIL,
        pass: APP_PASSWORD
    }
});

module.exports = async (req, res) => {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const order = req.body;

    const itemDetails = order.items
        .map(i => `- ${i.name} (x${i.qty}): ₹${i.total}`)
        .join('\n');

    const emailBody = `
        NEW ORDER: ${order.orderId}
        ---------------------------
        Customer: ${order.name}
        Phone: ${order.phone}
        Email: ${order.email}
        Address: ${order.address}
        Notes: ${order.notes || 'N/A'}

        ITEMS ORDERED:
        ${itemDetails}

        Total Amount: ₹${order.grand}
        Time: ${order.timestamp}
    `;

    const mailOptions = {
        from: `"Spice Garden" <${RESTAURANT_EMAIL}>`,
        to: [RESTAURANT_EMAIL, order.email],
        subject: `Order Confirmation - ${order.orderId}`,
        text: emailBody
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Order emails sent!' });
    } catch (error) {
        console.error('Email Error:', error);
        res.status(500).json({ success: false, message: 'Email sending failed' });
    }
};
