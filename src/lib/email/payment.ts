import "server-only";
import { getResend, emailFrom } from "@/lib/email/resend";
import { PAYMENT_NOTICE_EMAIL } from "@/config/gcash";

export interface PaymentNotice {
  planName: string;
  amount: number;
  ownerName: string; // account name on file
  ownerEmail: string;
  payerName: string; // name entered on the payment form
  phoneLast4: string;
  receiptUrl: string;
}

// Notify the admin that an owner submitted a GCash payment awaiting approval.
export async function sendPaymentNotice(notice: PaymentNotice): Promise<void> {
  const html = `
    <h2>New subscription payment — awaiting approval</h2>
    <p>An owner submitted a GCash payment and is waiting for their subscription to be approved.</p>
    <ul>
      <li><strong>Plan:</strong> ${notice.planName} (₱${notice.amount})</li>
      <li><strong>Account:</strong> ${notice.ownerName} &lt;${notice.ownerEmail}&gt;</li>
      <li><strong>Payer name:</strong> ${notice.payerName}</li>
      <li><strong>Phone (last 4):</strong> ${notice.phoneLast4}</li>
      <li><strong>Receipt:</strong> <a href="${notice.receiptUrl}">${notice.receiptUrl}</a></li>
    </ul>
    <p>Approve it from the admin Owners page by assigning this owner the plan.</p>
  `;

  await getResend().emails.send({
    from: emailFrom(),
    to: PAYMENT_NOTICE_EMAIL,
    replyTo: notice.ownerEmail,
    subject: `Payment received — ${notice.planName} plan awaiting approval`,
    html,
  });
}
