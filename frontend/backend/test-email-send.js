// Test email sending with detailed logging
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function testEmail() {
  console.log('=== Email Configuration Test ===');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***' + process.env.EMAIL_PASS.slice(-4) : 'NOT SET');
  
  try {
    console.log('\n1. Testing transporter.verify()...');
    await transporter.verify();
    console.log('✅ Transporter verification successful!');
    
    console.log('\n2. Attempting to send test email...');
    const info = await transporter.sendMail({
      from: `"Acquis Compliance" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to self
      subject: 'Test Email - OTP System Check',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Test Email</h2>
          <p>This is a test email to verify the OTP system is working.</p>
          <p>If you receive this, email sending is configured correctly.</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
      `
    });
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    
  } catch (error) {
    console.error('❌ Email test failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('\n🔴 Authentication Error: Check your Gmail app password');
      console.error('   Make sure:');
      console.error('   1. 2-Factor Authentication is enabled on your Gmail account');
      console.error('   2. You generated an App Password (not your regular password)');
      console.error('   3. The App Password is correctly set in .env file');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n🔴 Network Error: Cannot reach Gmail servers');
    }
  }
}

testEmail();
