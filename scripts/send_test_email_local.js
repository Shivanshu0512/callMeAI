import nodemailer from 'nodemailer';

(async () => {
  try {
    const transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true,
    });

    const info = await transporter.sendMail({
      from: 'CallMeAI <no-reply@callmeai.local>',
      to: 'developer@example.com',
      subject: 'CallMeAI - Local transport test',
      text: 'This is a test email generated locally by nodemailer (no network).',
    });

    console.log('Message generated (no network):');
    console.log(info.message.toString());
    console.log('Info object:', info);
  } catch (err) {
    console.error('Error generating test email:', err);
    process.exit(1);
  }
})();
