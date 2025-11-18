import nodemailer from 'nodemailer';

(async () => {
  try {
    const testAccount = await nodemailer.createTestAccount();
    console.log('Ethereal test account created:', testAccount.user);

    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await transporter.sendMail({
      from: `CallMeAI <${testAccount.user}>`,
      to: 'developer@example.com',
      subject: 'CallMeAI - Ethereal test',
      text: 'This is a test email sent via Ethereal from CallMeAI.',
    });

    console.log('Message sent:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
  } catch (err) {
    console.error('Error sending test email:', err);
    process.exit(1);
  }
})();
