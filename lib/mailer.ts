import 'server-only'
import tls from 'node:tls'
import net from 'node:net'

/**
 * Minimal SMTP sender (no extra dependency). Works with Gmail:
 *   EMAIL_USER = your Gmail address
 *   EMAIL_PASS = a Gmail "App Password" (16 characters, needs 2-Step Verification)
 * Optional: SMTP_HOST (default smtp.gmail.com), SMTP_PORT (default 465, SSL), EMAIL_FROM_NAME.
 */

export class MailError extends Error {}

type Mail = { to: string; subject: string; text: string; html: string }

const b64 = (s: string) => Buffer.from(s, 'utf8').toString('base64')
const encodeHeader = (s: string) => (/^[\x20-\x7e]*$/.test(s) ? s : `=?UTF-8?B?${b64(s)}?=`)

function buildMessage(from: string, fromName: string, mail: Mail) {
  const boundary = `b_${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`
  const wrap = (s: string) => b64(s).replace(/(.{76})/g, '$1\r\n')
  return [
    `From: ${encodeHeader(fromName)} <${from}>`,
    `To: <${mail.to}>`,
    `Subject: ${encodeHeader(mail.subject)}`,
    `Date: ${new Date().toUTCString()}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: base64',
    '',
    wrap(mail.text),
    `--${boundary}`,
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: base64',
    '',
    wrap(mail.html),
    `--${boundary}--`,
    '',
  ].join('\r\n')
}

/** Tiny line-based SMTP conversation over a socket. */
class SmtpConn {
  private buf = ''
  private waiters: ((line: string) => void)[] = []
  private lines: string[] = []
  private error: Error | null = null
  constructor(public socket: net.Socket) {
    this.attach(socket)
  }
  private attach(socket: net.Socket) {
    socket.setEncoding('utf8')
    socket.on('data', (chunk: string) => {
      this.buf += chunk
      let i
      while ((i = this.buf.indexOf('\r\n')) >= 0) {
        const line = this.buf.slice(0, i)
        this.buf = this.buf.slice(i + 2)
        const w = this.waiters.shift()
        if (w) w(line)
        else this.lines.push(line)
      }
    })
    const fail = (e: Error) => {
      this.error = e
      this.waiters.splice(0).forEach((w) => w(''))
    }
    socket.on('error', fail)
    socket.on('close', () => fail(new MailError('SMTP connection closed')))
    socket.setTimeout(20_000, () => socket.destroy(new MailError('SMTP timeout')))
  }
  private nextLine(): Promise<string> {
    if (this.lines.length) return Promise.resolve(this.lines.shift()!)
    if (this.error) return Promise.reject(this.error)
    return new Promise((resolve, reject) => {
      this.waiters.push((l) => (this.error && l === '' ? reject(this.error) : resolve(l)))
    })
  }
  /** Reads a full (possibly multi-line) reply and checks the code. */
  async reply(expect: number[]): Promise<string> {
    let last = ''
    for (;;) {
      last = await this.nextLine()
      if (last.length < 4 || last[3] !== '-') break
    }
    const code = Number(last.slice(0, 3))
    if (!expect.includes(code)) throw new MailError(`SMTP error: ${last}`)
    return last
  }
  async cmd(line: string, expect: number[]) {
    this.socket.write(line + '\r\n')
    return this.reply(expect)
  }
}

export function mailConfigured() {
  return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS)
}

export async function sendMail(mail: Mail) {
  const user = process.env.EMAIL_USER
  const pass = (process.env.EMAIL_PASS ?? '').replace(/\s+/g, '') // App Passwords are often pasted with spaces
  if (!user || !pass) throw new MailError('EMAIL_USER / EMAIL_PASS are not set')
  const host = process.env.SMTP_HOST || 'smtp.gmail.com'
  const port = Number(process.env.SMTP_PORT || 465)
  const fromName = process.env.EMAIL_FROM_NAME || 'RigMarket'

  // Implicit TLS (Gmail: smtp.gmail.com:465).
  const socket: net.Socket = await new Promise<net.Socket>((resolve, reject) => {
    const s = tls.connect({ host, port, servername: host }, () => resolve(s))
    s.once('error', reject)
  })

  const c = new SmtpConn(socket)
  try {
    await c.reply([220])
    await c.cmd(`EHLO rigmarket.local`, [250])
    await c.cmd('AUTH LOGIN', [334])
    await c.cmd(b64(user), [334])
    await c.cmd(b64(pass), [235])
    await c.cmd(`MAIL FROM:<${user}>`, [250])
    await c.cmd(`RCPT TO:<${mail.to}>`, [250, 251])
    await c.cmd('DATA', [354])
    // Dot-stuff lines starting with "."
    const body = buildMessage(user, fromName, mail).replace(/^\./gm, '..')
    await c.cmd(`${body}\r\n.`, [250])
    await c.cmd('QUIT', [221]).catch(() => {})
  } finally {
    c.socket.destroy()
  }
}

/** The verification email (bilingual so it works for every customer). */
export function verificationEmail(code: string, minutes: number) {
  const subject = `${code} is your RigMarket verification code · رمز التحقق`
  const text = [
    `Your RigMarket verification code is: ${code}`,
    `It expires in ${minutes} minutes. If you did not create an account, ignore this email.`,
    '',
    `رمز التحقق الخاص بك في RigMarket: ${code}`,
    `ينتهي خلال ${minutes} دقائق. إذا لم تقم بإنشاء حساب تجاهل هذه الرسالة.`,
  ].join('\n')
  const html = `<!doctype html><html><body style="margin:0;background:#f4f5f7;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#16181d">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="440" cellpadding="0" cellspacing="0" style="max-width:440px;background:#ffffff;border-radius:12px;padding:28px">
<tr><td style="font-size:18px;font-weight:700">RigMarket</td></tr>
<tr><td style="padding-top:16px;font-size:15px;line-height:1.6">Your verification code<br><span dir="rtl" style="color:#555">رمز التحقق الخاص بك</span></td></tr>
<tr><td align="center" style="padding:20px 0"><div style="display:inline-block;letter-spacing:8px;font-size:32px;font-weight:700;background:#f0f2f5;border-radius:10px;padding:14px 22px;font-family:Consolas,Menlo,monospace">${code}</div></td></tr>
<tr><td style="font-size:13px;color:#555;line-height:1.6">Expires in ${minutes} minutes. If you didn't create an account, you can ignore this email.<br><span dir="rtl">ينتهي خلال ${minutes} دقائق. إذا لم تقم بإنشاء حساب فتجاهل هذه الرسالة.</span></td></tr>
</table></td></tr></table></body></html>`
  return { subject, text, html }
}
