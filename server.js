const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// --- EMAIL CONFIGURATION ---
// IMPORTANT: Replace with your actual Gmail and an "App Password"
// Generate an App Password here: https://myaccount.google.com/apppasswords
const RESTAURANT_EMAIL = 'mathavanmathavanm12@gmail.com'; 
const APP_PASSWORD = 'akos xlnw ylhf fmye'; 

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: RESTAURANT_EMAIL,
        pass: APP_PASSWORD
    }
});

app.post('/api/order', (req, res) => {
    const order = req.body;
    
    const itemDetails = order.items.map(i => `- ${i.name} (x${i.qty}): ₹${i.total}`).join('\n');

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
        to: [RESTAURANT_EMAIL, order.email], // Sends to both restaurant and customer
        subject: `Order Confirmation - ${order.orderId}`,
        text: emailBody
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Email Error:', error);
            return res.status(500).json({ success: false, message: 'Server email error' });
        }
        res.json({ success: true, message: 'Order emails sent!' });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
