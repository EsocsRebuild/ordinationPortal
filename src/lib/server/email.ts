import http from 'http';
import net from 'net';

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
  if (process.env.MAILPIT_HTTP_HOST) return [process.env.MAILPIT_HTTP_HOST];
  return ['localhost', 'host.docker.internal', 'mailpit', '172.17.0.1'];
}

const MAILPIT_HTTP_PORT = parseInt(process.env.MAILPIT_HTTP_PORT || '8025', 10);
const MAILPIT_SMTP_PORT = parseInt(process.env.MAILPIT_SMTP_PORT || '1025', 10);

/**
 * Sends an email via Mailpit HTTP API (port 8025) with graceful fallback to SMTP (port 1025)
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

  // 1. Try Mailpit HTTP REST API across available host aliases (/api/v1/send)
  for (const host of hosts) {
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
            timeout: 2500,
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
                  resolve({ success: true });
                }
              } else {
                reject(new Error(`Mailpit HTTP returned status ${res.statusCode}: ${body}`));
              }
            });
          }
        );

        req.on('timeout', () => {
          req.destroy(new Error(`Mailpit HTTP request to ${host} timed out`));
        });
        req.on('error', (err) => reject(err));
        req.write(payload);
        req.end();
      });

      return result;
    } catch {
      // Continue to next candidate host
    }
  }

  // 2. Fallback to direct SMTP via net.Socket (port 1025)
  try {
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

    const smtpHost = process.env.MAILPIT_SMTP_HOST || hosts[0] || 'localhost';
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

      socket.setTimeout(5000, () => {
        socket.destroy(new Error('SMTP socket timed out'));
      });
      socket.on('error', (err) => reject(err));
    });

    return smtpResult;
  } catch (smtpError: any) {
    console.error('[EmailService] Mailpit SMTP fallback also failed:', smtpError.message);
    return { success: false, error: smtpError.message };
  }
}

/**
 * Base Ecclesiastical HTML Wrapper Template
 */
function wrapEcclesiasticalTemplate(contentHtml: string, previewText: string = ''): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Eternal Sacred Order of Cherubim and Seraphim</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0b1021; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }
    .container { max-width: 620px; margin: 30px auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
    .header { background: linear-gradient(135deg, #0b1021 0%, #1e293b 100%); padding: 32px 24px; text-align: center; border-bottom: 3px solid #d97706; }
    .church-cross { font-size: 28px; color: #d97706; margin-bottom: 6px; }
    .church-name { color: #ffffff; font-size: 15px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin: 0; }
    .portal-tag { color: #f59e0b; font-size: 11px; font-family: monospace; letter-spacing: 1px; margin-top: 4px; text-transform: uppercase; }
    .content { padding: 32px 28px; line-height: 1.6; font-size: 14px; color: #334155; }
    .footer { background-color: #f8fafc; padding: 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; font-family: monospace; }
    .badge-amber { background-color: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
    .badge-emerald { background-color: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
    .card-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin: 20px 0; }
    .table-details { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 10px; }
    .table-details td { padding: 8px 6px; border-bottom: 1px solid #f1f5f9; }
    .table-details td.label { color: #64748b; width: 40%; font-weight: 500; }
    .table-details td.val { color: #0f172a; font-weight: 600; }
    .btn { display: inline-block; padding: 12px 28px; background-color: #d97706; color: #ffffff !important; font-weight: 700; font-size: 13px; text-decoration: none; border-radius: 12px; margin-top: 15px; }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${previewText}
  </div>
  <div class="container">
    <div class="header">
      <div class="church-cross">✝</div>
      <h1 class="church-name">Eternal Sacred Order of Cherubim &amp; Seraphim</h1>
      <div class="portal-tag">General Headquarters &bull; Holy Order Ordination Directorate</div>
    </div>
    <div class="content">
      ${contentHtml}
    </div>
    <div class="footer">
      <p style="margin: 0 0 6px 0; font-weight: 600; color: #475569;">General Headquarters &bull; Praying Band &bull; Mount Zion Altar</p>
      <p style="margin: 0; line-height: 1.5;">This ecclesiastical transmission was automatically generated by the ESOCS Ordination Portal and synchronized with the platform messaging infrastructure (Mailpit).</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * 1. Template: Candidate Registration & Dossier Enrollment Email
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
    <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0;">Ordination Application Enrolled</h2>
    <p>Dear <strong>${candidate.fullName}</strong>,</p>
    <p>Calvary greetings in the Holy and Precious Name of our Lord Jesus Christ.</p>
    <p>Your ecclesiastical ordination nomination and credentials have been officially registered in the canonical docket. Your candidacy is now placed under active <strong>Stage 1: Parish Priest Review</strong>.</p>
    
    <div class="card-box">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <span class="badge badge-amber">Stage 1 of 6: Parish Nomination</span>
      </div>
      <table class="table-details">
        <tr>
          <td class="label">Candidate Reg Number:</td>
          <td class="val" style="font-family: monospace; color: #b45309;">${candidate.regNumber}</td>
        </tr>
        <tr>
          <td class="label">Current Ecclesiastical Rank:</td>
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
          <td class="label">Provincial Diocese:</td>
          <td class="val">${candidate.province}</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 13px; color: #475569;">
      <strong>Next Steps:</strong> Your Branch Parish Rector and leadership committee will review your ministerial records and submit their canonical endorsement. You can track your clearance status live via your candidate dashboard.
    </p>

    <div style="text-align: center; margin-top: 25px;">
      <a href="http://localhost:3000/dashboard/candidate" class="btn">Access Candidate Dashboard</a>
    </div>
  `;

  return sendEmail({
    to: { email: candidate.email, name: candidate.fullName },
    subject: `✝ ESOCS Ordination Application Enrolled · Reg No: ${candidate.regNumber}`,
    html: wrapEcclesiasticalTemplate(content, `Application enrolled for ${candidate.fullName} (${candidate.regNumber})`),
  });
}

/**
 * 2. Template: Security Verification OTP for Password Reset
 */
export async function sendPasswordResetOtpEmail(user: { email: string; name?: string; otp: string }) {
  const content = `
    <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0;">Security Verification Code</h2>
    <p>Dear <strong>${user.name || 'Member'}</strong>,</p>
    <p>We received a request to access or reset the password for your ESOCS Ordination Portal account.</p>
    
    <div style="background-color: #fef3c7; border: 2px dashed #d97706; border-radius: 16px; padding: 24px; text-align: center; margin: 24px 0;">
      <div style="font-size: 12px; font-weight: 700; color: #92400e; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">Your One-Time Verification OTP</div>
      <div style="font-size: 36px; font-weight: 800; font-family: monospace; letter-spacing: 8px; color: #0f172a;">${user.otp}</div>
      <div style="font-size: 11px; color: #b45309; margin-top: 8px;">Valid for 10 minutes &bull; Do not disclose to anyone</div>
    </div>

    <p style="font-size: 12px; color: #64748b;">If you did not request this verification code, please ignore this email or notify the Church Secretariat immediately.</p>
  `;

  return sendEmail({
    to: { email: user.email, name: user.name },
    subject: `✝ ${user.otp} is your ESOCS Ordination Portal verification code`,
    html: wrapEcclesiasticalTemplate(content, `Your verification code is ${user.otp}`),
  });
}

/**
 * 3. Template: Official Statutory Levies Payment Clearance Receipt
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
    <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0;">Official Ordination Dues Receipt</h2>
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
      Your payment has been logged in the Treasury Master Ledger. You can download and print your official stamped Payment Slip directly from the portal.
    </p>

    <div style="text-align: center; margin-top: 25px;">
      <a href="http://localhost:3000/dashboard/candidate?tab=payments" class="btn">View &amp; Print Payment Slip</a>
    </div>
  `;

  return sendEmail({
    to: { email: candidate.email, name: candidate.fullName },
    subject: `✝ Official Treasury Receipt: Statutory Ordination Dues · ${candidate.receiptNumber}`,
    html: wrapEcclesiasticalTemplate(content, `Payment of ₦${candidate.amountPaid.toLocaleString()} confirmed for ${candidate.fullName}`),
  });
}

/**
 * 4. Template: Vetting Stage Clearance & Approval Notification
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
    <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0;">Ordination Vetting Docket Updated</h2>
    <p>Dear <strong>${candidate.fullName}</strong>,</p>
    <p>We are pleased to inform you that your ordination screening docket has received canonical approval at the <strong>${candidate.tierName}</strong> level.</p>
    
    <div class="card-box" style="border-left: 4px solid #d97706;">
      <div style="margin-bottom: 8px;">
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

    <div style="text-align: center; margin-top: 25px;">
      <a href="http://localhost:3000/dashboard/candidate?tab=clearance" class="btn">Inspect Clearance Progress</a>
    </div>
  `;

  return sendEmail({
    to: { email: candidate.email, name: candidate.fullName },
    subject: `✝ Ordination Docket Update: ${candidate.tierName} Approved for ${candidate.fullName}`,
    html: wrapEcclesiasticalTemplate(content, `Your ordination docket has been cleared at ${candidate.tierName}`),
  });
}

