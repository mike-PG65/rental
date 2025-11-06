// utils/sendResetEmail.js
const nodemailer = require("nodemailer");

const sendResetEmail = async (email, token) => {
  const resetLink = `${process.env.FRONTEND_URL}reset-password/${token}`;

  const emailHTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Password Reset - Tenant Portal</title>
    <style>
      body {
        background-color: #f9fafb;
        font-family: 'Helvetica Neue', Arial, sans-serif;
        margin: 0;
        padding: 0;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 12px;
        padding: 30px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      }
      .header {
        text-align: center;
        padding-bottom: 10px;
        border-bottom: 2px solid #e5e7eb;
      }
      .header h1 {
        color: #4f46e5;
        font-size: 24px;
        margin-bottom: 5px;
      }
      .content {
        margin-top: 20px;
        line-height: 1.6;
        font-size: 16px;
      }
      .button {
        display: inline-block;
        background-color: #4f46e5;
        color: white !important;
        padding: 12px 20px;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        margin: 20px 0;
      }
      .button:hover {
        background-color: #4338ca;
      }
      .footer {
        text-align: center;
        font-size: 12px;
        color: #6b7280;
        margin-top: 30px;
        border-top: 1px solid #e5e7eb;
        padding-top: 10px;
      }
      @media (max-width: 600px) {
        .container {
          padding: 20px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Tenant Portal</h1>
        <p style="color:#6b7280; font-size:14px;">Your trusted property management system</p>
      </div>

      <div class="content">
        <p>Hello,</p>
        <p>We received a request to reset your password for your Tenant Portal account.</p>
        <p>Click the button below to set a new password:</p>
        <p style="text-align:center;">
          <a href="${resetLink}" class="button">Reset Password</a>
        </p>
        <p>If you did not request this, please ignore this email. This link will expire in <strong>1 hour</strong>.</p>
        <p>Thanks,<br>The Tenant Portal Team</p>
      </div>

      <div class="footer">
        <p>© ${new Date().getFullYear()} Tenant Portal. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `;

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // Brevo uses STARTTLS, not SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false, // avoids TLS issues on Render
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Reset Your Tenant Portal Password",
      html: emailHTML,
    });

    console.log(`✅ Password reset email sent to ${email}`);
  } catch (error) {
    console.error("❌ Error sending password reset email:", error.message);
    throw new Error("Failed to send reset email");
  }
};

module.exports = sendResetEmail;
