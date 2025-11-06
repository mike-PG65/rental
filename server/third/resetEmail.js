// utils/sendResetEmail.js
const SibApiV3Sdk = require("sib-api-v3-sdk");

const sendResetEmail = async (email, token) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  const emailHTML = `
    <div style="font-family:Arial,sans-serif;">
      <h2>Tenant Portal Password Reset</h2>
      <p>We received a request to reset your password.</p>
      <p>
        <a href="${resetLink}"
           style="background-color:#4f46e5;color:white;padding:10px 20px;
                  text-decoration:none;border-radius:6px;">Reset Password</a>
      </p>
      <p>This link will expire in 1 hour. If you didn't request this, ignore this email.</p>
    </div>
  `;

  try {
    // configure Brevo API
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    defaultClient.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const sendSmtpEmail = {
      to: [{ email }],
      sender: { name: "Admin", email: process.env.EMAIL_FROM },
      subject: "Reset Your Tenant Portal Password",
      htmlContent: emailHTML,
    };

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Password reset email sent to ${email}`);
  } catch (error) {
    console.error("❌ Brevo send error:", error.message);
    throw new Error("Failed to send reset email");
  }
};

module.exports = sendResetEmail;
