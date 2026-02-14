import nodemailer from "nodemailer";

// Create transporter with error handling
let transporter;

try {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) ,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER ,
      pass: process.env.SMTP_PASS ,
    },
  });
} catch (error) {
  console.error("Failed to create email transporter:", error.message);
}

export const sendEmail = async ({ to, subject, html }) => {
  // In development, if SMTP is not configured, just log the email
  if (!transporter || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("\n=== EMAIL (Not Sent - SMTP Not Configured) ===");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("Content:", html.substring(0, 200) + "...");
    console.log("=== END EMAIL ===\n");
    
    // Don't throw error in development
    if (process.env.NODE_ENV === 'development') {
      return { success: true, message: 'Email logged (SMTP not configured)' };
    }
    
    throw new Error("SMTP not configured");
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Auth System" <noreply@example.com>',
      to,
      subject,
      html,
    });
    
    console.log("Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error("Email Error:", err.message);
    
    // In development, log but don't fail
    if (process.env.NODE_ENV === 'development') {
      console.log("Email would have been sent to:", to);
      return { success: false, error: err.message };
    }
    
    throw new Error("Failed to send email: " + err.message);
  }
};

// Verify SMTP connection
export const verifyEmailConnection = async () => {
  if (!transporter) {
    console.log("Email transporter not configured");
    return false;
  }

  try {
    await transporter.verify();
    console.log("SMTP connection verified successfully");
    return true;
  } catch (error) {
    console.error("SMTP verification failed:", error.message);
    return false;
  }
};
