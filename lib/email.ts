import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// The "from" address — update to your verified domain in Resend dashboard
// For testing you can use: onboarding@resend.dev (only sends to your own email)
const FROM = process.env.EMAIL_FROM ?? 'VT LearnHub <onboarding@resend.dev>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@example.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export interface EnrollmentEmailParams {
  studentEmail: string
  studentName: string
  courseName: string
  courseId: string
  type: 'free' | 'paid'
}

function enrollmentEmailHtml({
  studentName,
  courseName,
  courseId,
  type,
}: EnrollmentEmailParams): string {
  const courseUrl = `${APP_URL}/courses/${courseId}/learn`
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Enrollment Confirmation</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6d28d9,#4f46e5);padding:40px 40px 32px;">
              <p style="margin:0;font-size:24px;font-weight:700;color:#fff;">🎓 VT LearnHub</p>
              <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.8);">Vital Tech Myanmar</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#111;">
                ${type === 'paid' ? '✅ Enrollment Confirmed!' : '🎉 You\'re Enrolled!'}
              </h1>
              <p style="margin:0 0 8px;font-size:15px;color:#444;">
                Hi <strong>${studentName}</strong>,
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#444;line-height:1.6;">
                ${
                  type === 'paid'
                    ? 'Your payment has been verified and approved. You now have full access to:'
                    : 'You have successfully enrolled in:'
                }
              </p>
              <!-- Course box -->
              <div style="background:#f4f4f5;border-radius:12px;padding:20px 24px;margin:0 0 28px;">
                <p style="margin:0;font-size:16px;font-weight:600;color:#111;">${courseName}</p>
                <p style="margin:6px 0 0;font-size:13px;color:#666;">VT LearnHub • Vital Tech Myanmar</p>
              </div>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <a href="${courseUrl}" style="display:inline-block;background:#6d28d9;color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;">
                      Start Learning →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #f0f0f0;">
              <p style="margin:0;font-size:12px;color:#999;line-height:1.6;">
                You received this email because you enrolled in a course on VT LearnHub.<br/>
                © ${new Date().getFullYear()} Vital Tech Myanmar. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

export async function sendEnrollmentConfirmation(params: EnrollmentEmailParams) {
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: params.studentEmail,
      subject:
        params.type === 'paid'
          ? `✅ Payment Approved — You're now enrolled in "${params.courseName}"`
          : `🎉 Welcome to "${params.courseName}"!`,
      html: enrollmentEmailHtml(params),
    })
    if (error) console.error('[email] sendEnrollmentConfirmation error:', error)
    return { success: !error, error }
  } catch (err) {
    console.error('[email] sendEnrollmentConfirmation threw:', err)
    return { success: false, error: err }
  }
}

export async function sendAdminEnrollmentNotification({
  studentName,
  studentEmail,
  courseName,
  amount,
  type,
}: {
  studentName: string
  studentEmail: string
  courseName: string
  amount?: string
  type: 'free' | 'paid'
}) {
  try {
    const subject =
      type === 'paid'
        ? `💰 Payment approved — ${studentName} enrolled in "${courseName}"`
        : `📚 New enrollment — ${studentName} joined "${courseName}"`

    const html = `
<html><body style="font-family:sans-serif;padding:24px;color:#333;">
  <h2 style="color:#6d28d9;">${type === 'paid' ? '💰 Payment Approved' : '📚 New Free Enrollment'}</h2>
  <table style="border-collapse:collapse;width:100%;max-width:480px;">
    <tr><td style="padding:8px 0;color:#666;">Student</td><td style="padding:8px 0;font-weight:600;">${studentName}</td></tr>
    <tr><td style="padding:8px 0;color:#666;">Email</td><td style="padding:8px 0;">${studentEmail}</td></tr>
    <tr><td style="padding:8px 0;color:#666;">Course</td><td style="padding:8px 0;font-weight:600;">${courseName}</td></tr>
    ${amount ? `<tr><td style="padding:8px 0;color:#666;">Amount</td><td style="padding:8px 0;font-weight:600;color:#16a34a;">${amount}</td></tr>` : ''}
    <tr><td style="padding:8px 0;color:#666;">Time</td><td style="padding:8px 0;">${new Date().toLocaleString()}</td></tr>
  </table>
  <p style="margin-top:24px;font-size:12px;color:#999;">VT LearnHub Admin Notification</p>
</body></html>
    `.trim()

    const { error } = await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject,
      html,
    })
    if (error) console.error('[email] sendAdminEnrollmentNotification error:', error)
    return { success: !error, error }
  } catch (err) {
    console.error('[email] sendAdminEnrollmentNotification threw:', err)
    return { success: false, error: err }
  }
}

// ── New: instant admin alert when a student submits a PENDING payment ──────────
export async function sendAdminPaymentPendingAlert({
  studentName,
  studentEmail,
  courseName,
  amount,
  paymentMethod,
  transactionId,
  senderName,
  notes,
}: {
  studentName: string
  studentEmail: string
  courseName: string
  amount: string
  paymentMethod: string
  transactionId: string
  senderName: string
  notes: string
}) {
  const adminUrl = `${APP_URL}/dashboard/admin/payments`

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#d97706,#b45309);padding:32px 40px;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#fff;">⏳ New Payment Pending Verification</p>
            <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.85);">VT LearnHub — Admin Action Required</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 20px;font-size:15px;color:#444;line-height:1.6;">
              A student has submitted a payment and is waiting for your approval.
            </p>
            <!-- Info table -->
            <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:28px;">
              <tr style="border-bottom:1px solid #f0f0f0;">
                <td style="padding:10px 0;color:#888;width:140px;">Student</td>
                <td style="padding:10px 0;font-weight:600;color:#111;">${studentName}</td>
              </tr>
              <tr style="border-bottom:1px solid #f0f0f0;">
                <td style="padding:10px 0;color:#888;">Email</td>
                <td style="padding:10px 0;color:#444;">${studentEmail}</td>
              </tr>
              <tr style="border-bottom:1px solid #f0f0f0;">
                <td style="padding:10px 0;color:#888;">Course</td>
                <td style="padding:10px 0;font-weight:600;color:#111;">${courseName}</td>
              </tr>
              <tr style="border-bottom:1px solid #f0f0f0;">
                <td style="padding:10px 0;color:#888;">Amount</td>
                <td style="padding:10px 0;font-weight:700;color:#d97706;">${amount}</td>
              </tr>
              <tr style="border-bottom:1px solid #f0f0f0;">
                <td style="padding:10px 0;color:#888;">Method</td>
                <td style="padding:10px 0;">${paymentMethod}</td>
              </tr>
              <tr style="border-bottom:1px solid #f0f0f0;">
                <td style="padding:10px 0;color:#888;">Transaction ID</td>
                <td style="padding:10px 0;font-family:monospace;font-size:13px;">${transactionId}</td>
              </tr>
              <tr style="border-bottom:1px solid #f0f0f0;">
                <td style="padding:10px 0;color:#888;">Sender Name</td>
                <td style="padding:10px 0;">${senderName}</td>
              </tr>
              ${notes ? `
              <tr>
                <td style="padding:10px 0;color:#888;vertical-align:top;">Notes</td>
                <td style="padding:10px 0;color:#555;">${notes}</td>
              </tr>` : ''}
            </table>
            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <a href="${adminUrl}" style="display:inline-block;background:#d97706;color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;">
                    Review Payment →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #f0f0f0;">
            <p style="margin:0;font-size:12px;color:#999;">
              © ${new Date().getFullYear()} Vital Tech Myanmar — VT LearnHub Admin Notification
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim()

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `⏳ Payment verification needed — ${studentName} • ${courseName} • ${amount}`,
      html,
    })
    if (error) console.error('[email] sendAdminPaymentPendingAlert error:', error)
    return { success: !error, error }
  } catch (err) {
    console.error('[email] sendAdminPaymentPendingAlert threw:', err)
    return { success: false, error: err }
  }
}

