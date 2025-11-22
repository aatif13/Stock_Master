import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection (only if credentials are configured)
if (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your_email@gmail.com' && 
    process.env.EMAIL_PASS && process.env.EMAIL_PASS !== 'your_app_password') {
  transporter.verify((error, success) => {
    if (error) {
      console.warn('⚠️  Email service not configured or invalid credentials. OTP emails will not work.');
      console.warn('   To enable email: Update EMAIL_USER and EMAIL_PASS in .env file');
    } else {
      console.log('✅ Email service ready');
    }
  });
} else {
  console.warn('⚠️  Email service not configured. OTP password reset will not work.');
  console.warn('   To enable: Update EMAIL_USER and EMAIL_PASS in .env file');
}

export const sendOTPEmail = async (email, otp) => {
  // Check if email is configured
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com' ||
      !process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'your_app_password') {
    console.warn(`⚠️  Email not configured. OTP for ${email}: ${otp}`);
    console.warn('   Configure EMAIL_USER and EMAIL_PASS in .env to enable email sending');
    // Don't throw error - allow app to continue without email
    return { success: false, message: 'Email service not configured' };
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: 'StockMaster - Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">StockMaster Password Reset</h2>
        <p>You requested a password reset. Use the following OTP to reset your password:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #2563eb; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
        </div>
        <p>This OTP will expire in ${process.env.OTP_EXPIRE_MINUTES || 10} minutes.</p>
        <p style="color: #6b7280; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending OTP email:', error.message);
    // Log OTP to console for development
    console.warn(`   OTP for ${email}: ${otp}`);
    // Don't throw - allow app to continue
    return { success: false, error: error.message };
  }
};

export default transporter;

