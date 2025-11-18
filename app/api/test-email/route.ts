import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const to = body.to || process.env.TEST_EMAIL_TO
    const subject = body.subject || "CallMeAI - Test Email"
    const text = body.text || "This is a test email from CallMeAI. If you received this, SMTP is configured correctly."

    const host = process.env.SMTP_HOST
    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS
    const from = process.env.EMAIL_FROM || process.env.SMTP_USER

    if (!host || !port || !user || !pass || !from || !to) {
      return NextResponse.json({
        success: false,
        error: "Missing SMTP configuration or recipient. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM (or SMTP_USER), and TEST_EMAIL_TO (or pass 'to' in the POST body).",
      }, { status: 400 })
    }

    let transporter
    let isTestAccount = false

    if (!host || !port || !user || !pass) {
      // Fallback to Ethereal test account so developer can run tests locally without SMTP creds
      const testAccount = await nodemailer.createTestAccount()
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      })
      isTestAccount = true
    } else {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // true for 465, false for other ports
        auth: {
          user,
          pass,
        },
      })
    }

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
    })

    const result: any = { success: true, info }
    if (isTestAccount) {
      const previewUrl = nodemailer.getTestMessageUrl(info)
      result.previewUrl = previewUrl
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Test email error:", error)
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 })
  }
}
