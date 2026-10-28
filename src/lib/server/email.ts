import http from 'http';
import net from 'net';
import fs from 'fs';
import path from 'path';

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface SendEmailOptions {
  to: EmailRecipient | EmailRecipient[];
  subject: string;
  html: string;
  text?: string;
  from?: EmailRecipient;
}

const DEFAULT_FROM: EmailRecipient = {
  name: 'ESOCS Holy Order Secretariat',
  email: process.env.NEXT_PUBLIC_SECRETARIAT_EMAIL || 'secretariat@esocs.church',
};

function getCandidateHosts(): string[] {
  const customHost = process.env.MAILPIT_HTTP_HOST || process.env.MAILPIT_HOST;
  const candidates = [
    customHost,
    'localhost',
    '127.0.0.1',
    'mailpit',
    'host.docker.internal',
    '172.17.0.1',
    '172.18.0.1',
    '172.19.0.1',
    '172.20.0.1',
  ].filter(Boolean) as string[];

  return Array.from(new Set(candidates));
}

const MAILPIT_HTTP_PORT = parseInt(process.env.MAILPIT_HTTP_PORT || '8025', 10);
const MAILPIT_SMTP_PORT = parseInt(process.env.MAILPIT_SMTP_PORT || '1025', 10);

let cachedLogoBase64: string | null = null;
export function getChurchLogoBase64(): string {
  if (cachedLogoBase64) return cachedLogoBase64;
  try {
    const logoPath = path.join(process.cwd(), 'public', 'brand', 'icon-192.png');
    if (fs.existsSync(logoPath)) {
      const buffer = fs.readFileSync(logoPath);
      cachedLogoBase64 = `data:image/png;base64,${buffer.toString('base64')}`;
      return cachedLogoBase64;
    }
  } catch (err) {
    console.warn('[EmailService] Could not read logo file:', err);
  }
  return '';
}

/**
 * Persists an outbox copy of dispatched emails to local storage for inspection and resilience
 */
function recordOutboxEmail(options: SendEmailOptions, status: 'delivered' | 'failed', error?: string, messageId?: string) {
  try {
    const outboxDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(outboxDir)) {
      fs.mkdirSync(outboxDir, { recursive: true });
    }
    const outboxPath = path.join(outboxDir, 'mailpit_outbox.json');
    let outbox: any[] = [];
    if (fs.existsSync(outboxPath)) {
      try {
        outbox = JSON.parse(fs.readFileSync(outboxPath, 'utf8'));
      } catch {
        outbox = [];
      }
    }
    outbox.unshift({
      id: messageId || `outbox-${Date.now()}`,
      timestamp: new Date().toISOString(),
      to: options.to,
      subject: options.subject,
      status,
      error,
      preview: options.text?.slice(0, 200) || '',
    });
    // Keep last 100 entries
    if (outbox.length > 100) outbox = outbox.slice(0, 100);
    fs.writeFileSync(outboxPath, JSON.stringify(outbox, null, 2), 'utf8');
  } catch (e) {
    // Non-blocking
  }
}

/**
 * Sends an email via Mailpit HTTP API (port 8025) with graceful fallback to SMTP (port 1025) across all candidate environments
 */
export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const recipients = Array.isArray(options.to) ? options.to : [options.to];
  const from = options.from || DEFAULT_FROM;
  const hosts = getCandidateHosts();

  const payload = JSON.stringify({
    From: { Email: from.email, Name: from.name },
    To: recipients.map((r) => ({ Email: r.email, Name: r.name || r.email })),
    Subject: options.subject,
    HTML: options.html,
    Text: options.text || options.html.replace(/<[^>]+>/g, ''),
  });

  console.log(`[EmailService] Dispatching "${options.subject}" to ${recipients.map((r) => r.email).join(', ')}... Candidates:`, hosts);

  // 1. Try Mailpit HTTP REST API across available host aliases (/api/v1/send)
  for (const rawHost of hosts) {
    const host = rawHost;
    try {
      const result = await new Promise<{ success: boolean; messageId?: string }>((resolve, reject) => {
        const req = http.request(
          {
            host,
            port: MAILPIT_HTTP_PORT,
            path: '/api/v1/send',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(payload),
            },
            timeout: 2000,
          },
          (res) => {
            let body = '';
            res.on('data', (chunk) => (body += chunk));
            res.on('end', () => {
              if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                try {
                  const parsed = JSON.parse(body);
                  resolve({ success: true, messageId: parsed.ID });
                } catch {
                  resolve({ success: true, messageId: `mailpit-${Date.now()}` });
                }
              } else {
                reject(new Error(`Mailpit HTTP status ${res.statusCode}: ${body}`));
              }
            });
          }
        );

        req.on('timeout', () => {
          req.destroy(new Error(`Mailpit HTTP request to ${host}:${MAILPIT_HTTP_PORT} timed out`));
        });
        req.on('error', (err) => reject(err));
        req.write(payload);
        req.end();
      });

      console.log(`[EmailService] ✅ Successfully delivered to Mailpit via HTTP on ${host}:${MAILPIT_HTTP_PORT} (ID: ${result.messageId})`);
      recordOutboxEmail(options, 'delivered', undefined, result.messageId);
      return result;
    } catch (err: any) {
      console.warn(`[EmailService] HTTP candidate ${host}:${MAILPIT_HTTP_PORT} failed:`, err.message);
    }
  }

  // 2. Fallback to direct SMTP across available host aliases (port 1025)
  console.log(`[EmailService] HTTP delivery unsuccessful across all hosts. Attempting SMTP fallback...`);
  const plainText = options.text || options.html.replace(/<[^>]+>/g, '');
  const boundary = `====_NextPart_${Date.now()}_====`;
  const toHeader = recipients.map((r) => (r.name ? `"${r.name}" <${r.email}>` : r.email)).join(', ');

  const rawMime = [
    `From: "${from.name}" <${from.email}>`,
    `To: ${toHeader}`,
    `Subject: ${options.subject}`,
    `Date: ${new Date().toUTCString()}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    `Content-Type: text/plain; charset=UTF-8`,
    `Content-Transfer-Encoding: 7bit`,
    '',
    plainText,
    '',
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: 7bit`,
    '',
    options.html,
    '',
    `--${boundary}--`,
    '',
  ].join('\r\n');

  let lastSmtpError: string | null = null;
  for (const rawHost of hosts) {
    const smtpHost = rawHost;
    try {
      const smtpResult = await new Promise<{ success: boolean; messageId?: string }>((resolve, reject) => {
        const socket = net.createConnection({ host: smtpHost, port: MAILPIT_SMTP_PORT }, () => {
          let step = 0;
          socket.on('data', (data) => {
            const resStr = data.toString();
            if (step === 0 && resStr.startsWith('220')) {
              step = 1;
              socket.write('EHLO localhost\r\n');
            } else if (step === 1 && resStr.startsWith('250')) {
              step = 2;
              socket.write(`MAIL FROM:<${from.email}>\r\n`);
            } else if (step === 2 && resStr.startsWith('250')) {
              step = 3;
              socket.write(`RCPT TO:<${recipients[0].email}>\r\n`);
            } else if (step === 3 && resStr.startsWith('250')) {
              step = 4;
              socket.write('DATA\r\n');
            } else if (step === 4 && resStr.startsWith('354')) {
              step = 5;
              socket.write(`${rawMime}\r\n.\r\n`);
            } else if (step === 5 && resStr.startsWith('250')) {
              socket.end('QUIT\r\n');
              resolve({ success: true, messageId: `smtp-${Date.now()}` });
            } else if (resStr.startsWith('4') || resStr.startsWith('5')) {
              socket.end();
              reject(new Error(`SMTP error: ${resStr.trim()}`));
            }
          });
        });

        socket.setTimeout(2500, () => {
          socket.destroy(new Error(`SMTP socket to ${smtpHost}:${MAILPIT_SMTP_PORT} timed out`));
        });
        socket.on('error', (err) => reject(err));
      });

      console.log(`[EmailService] ✅ Successfully delivered to Mailpit via SMTP on ${smtpHost}:${MAILPIT_SMTP_PORT}`);
      recordOutboxEmail(options, 'delivered', undefined, smtpResult.messageId);
      return smtpResult;
    } catch (err: any) {
      lastSmtpError = err.message;
      console.warn(`[EmailService] SMTP candidate ${smtpHost}:${MAILPIT_SMTP_PORT} failed:`, err.message);
    }
  }

  const finalError = lastSmtpError || 'All Mailpit HTTP and SMTP connection attempts failed';
  console.error(`[EmailService] ❌ Could not deliver to Mailpit. Recording in local outbox:`, finalError);
  recordOutboxEmail(options, 'failed', finalError);
  return { success: false, error: finalError };
}

/**
 * Master Church Email Wrapper Template
 * Professional, elegant, fully responsive church branded layout with the official crest
 */
function wrapChurchTemplate(contentHtml: string, previewText: string = ''): string {
  const logoDataUri = getChurchLogoBase64();
  const logoImgTag = logoDataUri
    ? `<img src="${logoDataUri}" alt="ESOCS Church Crest" width="72" height="72" style="display: block; margin: 0 auto 14px auto; border: 0; outline: none; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.25);" />`
    : `<div style="font-size: 32px; color: #d97706; margin-bottom: 8px;">✝</div>`;

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Eternal Sacred Order of the Cherubim and Seraphim</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }
    .email-container { max-width: 620px; margin: 28px auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #0b1021 0%, #1e293b 100%); padding: 36px 24px 28px 24px; text-align: center; border-bottom: 4px solid #d97706; }
    .church-title { color: #ffffff; font-size: 15px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; margin: 0; line-height: 1.4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .church-subtitle { color: #f59e0b; font-size: 11px; font-weight: 600; letter-spacing: 1.2px; text-transform: uppercase; margin-top: 6px; }
    .content { padding: 36px 32px; line-height: 1.6; font-size: 14px; color: #334155; }
    .card-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; margin: 22px 0; }
    .footer { background-color: #0b1021; padding: 30px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #1e293b; }
    .footer-title { color: #ffffff; font-weight: 700; font-size: 13px; margin: 0 0 6px 0; letter-spacing: 0.5px; }
    .footer-address { margin: 0 0 12px 0; line-height: 1.5; color: #cbd5e1; font-size: 11px; }
    .footer-legal { margin: 0; font-size: 10px; line-height: 1.5; color: #64748b; }
    .badge { display: inline-block; padding: 5px 14px; border-radius: 9999px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; }
    .badge-amber { background-color: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
    .badge-emerald { background-color: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
    .table-details { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 10px; }
    .table-details td { padding: 9px 8px; border-bottom: 1px solid #e2e8f0; }
    .table-details td.label { color: #64748b; width: 38%; font-weight: 500; }
    .table-details td.val { color: #0f172a; font-weight: 600; }
    .btn { display: inline-block; padding: 13px 30px; background-color: #d97706; color: #ffffff !important; font-weight: 700; font-size: 13px; text-decoration: none; border-radius: 12px; margin-top: 18px; box-shadow: 0 4px 12px rgba(217, 119, 6, 0.25); }
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; margin: 10px auto !important; border-radius: 0 !important; }
      .content { padding: 24px 18px !important; }
      .header { padding: 28px 16px 20px 16px !important; }
    }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${previewText}
  </div>
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center" style="padding: 20px 10px;">
        <div class="email-container">
          <!-- Official Church Branded Header -->
          <div class="header">
            ${logoImgTag}
            <h1 class="church-title">The Eternal Sacred Order of the Cherubim and Seraphim</h1>
            <div class="church-subtitle">Mount Zion General Headquarters &bull; Holy Order Ordination Directorate</div>
          </div>

          <!-- Email Content Body -->
          <div class="content">
            ${contentHtml}
          </div>

          <!-- Official Church Footer -->
          <div class="footer">
            <p class="footer-title">THE ETERNAL SACRED ORDER OF THE CHERUBIM AND SERAPHIM</p>
            <p class="footer-address">
              Mount Zion General Headquarters, 11/13 Pearse Street, Off Tejuosho, Ebute Metta, Lagos, Nigeria<br>
              Official Ordination Portal &bull; Email: secretariat@esocs.church
            </p>
            <p class="footer-legal">
              &copy; ${new Date().getFullYear()} ESOCS Holy Order. All rights reserved. This email and any attachments are confidential and intended exclusively for the recipient named above.
            </p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * 1. Template: Multi-Factor Authentication (2FA) Security Token
 */
export async function sendTwoFactorOtpEmail(user: { email: string; name?: string; otp: string; isResend?: boolean }) {
  const content = `
    <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 6px;">Two-Factor Verification Code</h2>
    <p style="margin-top: 0; color: #64748b; font-size: 13px;">Secure Identity Verification for Portal Access</p>
    
    <p>Dear <strong>${user.name || 'Church Officer'}</strong>,</p>
    <p>A sign-in request to your ESOCS Ordination Portal account requires two-factor verification. Please enter the verification code below to complete your authentication:</p>
    
    <div style="background-color: #fef3c7; border: 2px dashed #d97706; border-radius: 16px; padding: 26px 20px; text-align: center; margin: 26px 0;">
      <div style="font-size: 11px; font-weight: 800; color: #92400e; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">
        ${user.isResend ? 'Your New Security Verification Code (Resent)' : 'Your 6-Digit Verification Code'}
      </div>
      <div style="font-size: 40px; font-weight: 800; font-family: 'Courier New', Courier, monospace; letter-spacing: 10px; color: #0f172a; line-height: 1;">
        ${user.otp}
      </div>
      <div style="font-size: 11px; color: #b45309; font-weight: 600; margin-top: 12px;">
        ⏱ Valid for 5 minutes &bull; Single-use only &bull; Do not disclose this code
      </div>
    </div>

    <div style="background-color: #f8fafc; border-left: 4px solid #64748b; padding: 12px 16px; border-radius: 8px; margin: 20px 0; font-size: 12px; color: #475569;">
      <strong>Security Notice:</strong> If you did not initiate this sign-in request, please disregard this email or report immediately to the Church Secretariat at <a href="mailto:secretariat@esocs.church" style="color: #d97706; font-weight: 600; text-decoration: none;">secretariat@esocs.church</a>.
    </div>
  `;

  return sendEmail({
    to: { email: user.email, name: user.name },
    subject: `✝ ${user.otp} is your ${user.isResend ? '[RESENT] ' : ''}ESOCS Ordination 2FA verification code`,
    html: wrapChurchTemplate(content, `Your verification code is ${user.otp}`),
  });
}

/**
 * 2. Template: Security Verification OTP for Password Reset
 */
export async function sendPasswordResetOtpEmail(user: { email: string; name?: string; otp: string; isResend?: boolean }) {
  const content = `
    <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 6px;">Password Reset Verification Code</h2>
    <p style="margin-top: 0; color: #64748b; font-size: 13px;">Identity confirmation for account security update</p>

    <p>Dear <strong>${user.name || 'Member'}</strong>,</p>
    <p>We received a ${user.isResend ? 'resend ' : ''}request to verify your identity and reset your ESOCS Ordination Portal password.</p>
    
    <div style="background-color: #fef3c7; border: 2px dashed #d97706; border-radius: 16px; padding: 26px 20px; text-align: center; margin: 26px 0;">
      <div style="font-size: 11px; font-weight: 800; color: #92400e; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">
        ${user.isResend ? 'Your New Password Reset OTP (Resent)' : 'Your Password Reset OTP'}
      </div>
      <div style="font-size: 40px; font-weight: 800; font-family: 'Courier New', Courier, monospace; letter-spacing: 10px; color: #0f172a; line-height: 1;">
        ${user.otp}
      </div>
      <div style="font-size: 11px; color: #b45309; font-weight: 600; margin-top: 12px;">
        ⏱ Valid for 10 minutes &bull; Previous codes have been invalidated &bull; Do not disclose
      </div>
    </div>

    <div style="background-color: #f8fafc; border-left: 4px solid #64748b; padding: 12px 16px; border-radius: 8px; margin: 20px 0; font-size: 12px; color: #475569;">
      If you did not request a password reset, please ignore this email. Your password remains unchanged.
    </div>
  `;

  return sendEmail({
    to: { email: user.email, name: user.name },
    subject: `✝ ${user.otp} is your ${user.isResend ? '[RESENT] ' : ''}ESOCS Password Reset Code`,
    html: wrapChurchTemplate(content, `Your password reset code is ${user.otp}`),
  });
}

/**
 * 3. Template: Candidate Registration & Dossier Enrollment Email
 */
export async function sendRegistrationConfirmationEmail(candidate: {
  fullName: string;
  email: string;
  regNumber: string;
  currentRank: string;
  targetRankName: string;
  parish: string;
  district?: string;
  province: string;
}) {
  const content = `
    <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 6px;">Ordination Application Enrolled</h2>
    <p style="margin-top: 0; color: #64748b; font-size: 13px;">Official Church Registry Confirmation</p>

    <p>Dear <strong>${candidate.fullName}</strong>,</p>
    <p>Calvary greetings in the Holy and Precious Name of our Lord Jesus Christ.</p>
    <p>Your ordination nomination and credentials have been successfully enrolled in the Church Ordination Register. Your dossier is now active under <strong>Stage 1: Branch Level Clearance</strong>.</p>
    
    <div class="card-box" style="border-left: 4px solid #d97706;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span class="badge badge-amber">Stage 1 of 6: Branch Level Review</span>
      </div>
      <table class="table-details">
        <tr>
          <td class="label">Candidate Reg Number:</td>
          <td class="val" style="font-family: monospace; color: #b45309;">${candidate.regNumber}</td>
        </tr>
        <tr>
          <td class="label">Current Rank:</td>
          <td class="val">${candidate.currentRank}</td>
        </tr>
        <tr>
          <td class="label">Target Promotion Rank:</td>
          <td class="val" style="color: #b45309; font-weight: 700;">${candidate.targetRankName}</td>
        </tr>
        <tr>
          <td class="label">Branch Parish:</td>
          <td class="val">${candidate.parish}</td>
        </tr>
        <tr>
          <td class="label">Church Province / Diocese:</td>
          <td class="val">${candidate.province}</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 13px; color: #475569;">
      <strong>Next Steps:</strong> Your Branch Level leadership and secretariat will review your ministerial records and submit clearance. You can track your clearance status live on your candidate dashboard.
    </p>

    <div style="text-align: center; margin-top: 24px;">
      <a href="http://localhost:3010/dashboard/candidate" class="btn">Access Candidate Dashboard</a>
    </div>
  `;

  return sendEmail({
    to: { email: candidate.email, name: candidate.fullName },
    subject: `✝ ESOCS Ordination Application Enrolled · Reg No: ${candidate.regNumber}`,
    html: wrapChurchTemplate(content, `Application enrolled for ${candidate.fullName} (${candidate.regNumber})`),
  });
}

/**
 * 4. Template: Official Statutory Levies Payment Clearance Receipt
 */
export async function sendPaymentReceiptEmail(candidate: {
  fullName: string;
  email: string;
  regNumber: string;
  receiptNumber: string;
  amountPaid: number;
  totalLevy: number;
  targetRankName: string;
  paymentMethod: string;
}) {
  const content = `
    <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 6px;">Official Ordination Dues Receipt</h2>
    <p style="margin-top: 0; color: #64748b; font-size: 13px;">Treasury Directorate &bull; Official Clearance Voucher</p>

    <p>Dear <strong>${candidate.fullName}</strong>,</p>
    <p>The Holy Order Treasury hereby acknowledges verified receipt of your statutory ordination levies for elevation to the sacred rank of <strong>${candidate.targetRankName}</strong>.</p>
    
    <div class="card-box" style="border-left: 4px solid #10b981;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span class="badge badge-emerald">Payment Cleared &bull; Official Church Receipt</span>
        <span style="font-family: monospace; font-size: 12px; font-weight: 700; color: #047857;">${candidate.receiptNumber}</span>
      </div>
      <table class="table-details">
        <tr>
          <td class="label">Candidate Reg Number:</td>
          <td class="val" style="font-family: monospace;">${candidate.regNumber}</td>
        </tr>
        <tr>
          <td class="label">Amount Settled:</td>
          <td class="val" style="font-family: monospace; font-size: 16px; color: #047857; font-weight: 800;">₦${candidate.amountPaid.toLocaleString()}.00</td>
        </tr>
        <tr>
          <td class="label">Settlement Channel:</td>
          <td class="val">${candidate.paymentMethod}</td>
        </tr>
        <tr>
          <td class="label">Levy Account Status:</td>
          <td class="val" style="color: #047857; font-weight: 700;">Paid in Full ✓</td>
        </tr>
        <tr>
          <td class="label">Date Confirmed:</td>
          <td class="val">${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 13px; color: #475569;">
      Your payment has been logged in the Treasury Master Ledger. You can inspect your digital status and print your official stamped Payment Slip directly from the portal.
    </p>

    <div style="text-align: center; margin-top: 24px;">
      <a href="http://localhost:3010/dashboard/candidate?tab=payments" class="btn">View &amp; Print Payment Slip</a>
    </div>
  `;

  return sendEmail({
    to: { email: candidate.email, name: candidate.fullName },
    subject: `✝ Official Treasury Receipt: Statutory Ordination Dues · ${candidate.receiptNumber}`,
    html: wrapChurchTemplate(content, `Payment of ₦${candidate.amountPaid.toLocaleString()} confirmed for ${candidate.fullName}`),
  });
}

/**
 * 5. Template: Vetting Stage Clearance & Approval Notification
 */
export async function sendVettingApprovalEmail(candidate: {
  fullName: string;
  email: string;
  regNumber: string;
  tierName: string;
  approverName: string;
  nextStageTitle: string;
  comments?: string;
}) {
  const content = `
    <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 6px;">Ordination Clearance Status Updated</h2>
    <p style="margin-top: 0; color: #64748b; font-size: 13px;">Holy Order Directorate Review Decision</p>

    <p>Dear <strong>${candidate.fullName}</strong>,</p>
    <p>We are pleased to inform you that your ordination application has received official endorsement at the <strong>${candidate.tierName}</strong> review level.</p>
    
    <div class="card-box" style="border-left: 4px solid #d97706;">
      <div style="margin-bottom: 10px;">
        <span class="badge badge-emerald">Clearance Approved ✓</span>
      </div>
      <table class="table-details">
        <tr>
          <td class="label">Vetting Level Cleared:</td>
          <td class="val">${candidate.tierName}</td>
        </tr>
        <tr>
          <td class="label">Endorsing Authority:</td>
          <td class="val">${candidate.approverName}</td>
        </tr>
        <tr>
          <td class="label">Advancing To:</td>
          <td class="val" style="color: #b45309; font-weight: 700;">${candidate.nextStageTitle}</td>
        </tr>
        ${
          candidate.comments
            ? `<tr>
                <td class="label">Council Remarks:</td>
                <td class="val" style="font-style: italic; color: #475569;">"${candidate.comments}"</td>
              </tr>`
            : ''
        }
      </table>
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="http://localhost:3010/dashboard/candidate?tab=clearance" class="btn">Inspect Clearance Progress</a>
    </div>
  `;

  return sendEmail({
    to: { email: candidate.email, name: candidate.fullName },
    subject: `✝ Ordination Update: ${candidate.tierName} Approved for ${candidate.fullName}`,
    html: wrapChurchTemplate(content, `Your ordination application has been cleared at ${candidate.tierName}`),
  });
}
