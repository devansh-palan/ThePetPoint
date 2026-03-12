import { Resend } from 'resend';

const resend = new Resend(process.env.EMAIL_API_KEY);

const FROM = process.env.EMAIL_FROM || 'noreply@thepetpoint.ca';
const ADMIN = process.env.ADMIN_EMAIL || 'thepetpoint.ca@gmail.com';

// ── Email sender ──────────────────────────────────────────────────────────────
async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    // Fire-and-forget: log but don't block the API response
    console.error('[Email] Send failed:', err);
  }
}

// ── Template 1: Booking Request (to Vendor) ───────────────────────────────────
export async function sendBookingEmail(opts: {
  vendorEmail: string;
  vendorOwnerName: string;
  username: string;
  petName: string;
  petBreed: string;
  petAge: number | null;
  petNotes: string | null;
  requestedDate: string;
  requestedTime: string;
  message: string | null;
}): Promise<void> {
  const subject = `New Booking Request from @${opts.username} — The Pet Point`;
  const html = `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#F7F5FF;border-radius:16px;">
      <h2 style="color:#6B4EFF;margin-bottom:4px;">🐾 New Booking Request</h2>
      <p style="color:#777;margin-top:0;font-size:14px;">via The Pet Point</p>

      <div style="background:#fff;border-radius:12px;padding:20px;margin:20px 0;border:1px solid #E0D9FF;">
        <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#777;text-transform:uppercase;letter-spacing:1px;">Pet Owner</p>
        <p style="margin:0;font-size:18px;font-weight:700;color:#6B4EFF;">@${opts.username}</p>
      </div>

      <div style="background:#fff;border-radius:12px;padding:20px;margin:20px 0;border:1px solid #E0D9FF;">
        <p style="margin:0 0 12px;font-size:12px;font-weight:600;color:#777;text-transform:uppercase;letter-spacing:1px;">🐶 Pet Profile</p>
        <p style="margin:0 0 6px;color:#333;"><strong>Name:</strong> ${opts.petName}</p>
        ${opts.petBreed ? `<p style="margin:0 0 6px;color:#333;"><strong>Breed:</strong> ${opts.petBreed}</p>` : ''}
        ${opts.petAge != null ? `<p style="margin:0 0 6px;color:#333;"><strong>Age:</strong> ${opts.petAge} year(s)</p>` : ''}
        ${opts.petNotes ? `<p style="margin:0 0 6px;color:#333;"><strong>Notes:</strong> ${opts.petNotes}</p>` : ''}
      </div>

      <div style="background:#fff;border-radius:12px;padding:20px;margin:20px 0;border:1px solid #E0D9FF;">
        <p style="margin:0 0 12px;font-size:12px;font-weight:600;color:#777;text-transform:uppercase;letter-spacing:1px;">📅 Requested Appointment</p>
        <p style="margin:0 0 6px;color:#333;"><strong>Date:</strong> ${opts.requestedDate}</p>
        <p style="margin:0 0 6px;color:#333;"><strong>Time:</strong> ${opts.requestedTime}</p>
        ${opts.message ? `<p style="margin:0;color:#333;"><strong>Message:</strong> "${opts.message}"</p>` : ''}
      </div>

      <p style="color:#777;font-size:13px;margin-top:24px;">Log in to The Pet Point to confirm or manage this booking.</p>
    </div>`;

  await sendEmail(opts.vendorEmail, subject, html);
}

// ── Template 2: New Message (to Vendor) ──────────────────────────────────────
export async function sendMessageEmail(opts: {
  vendorEmail: string;
  vendorOwnerName: string;
  username: string;
  messageContent: string;
}): Promise<void> {
  const subject = `New Message from @${opts.username} — The Pet Point`;
  const html = `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#F7F5FF;border-radius:16px;">
      <h2 style="color:#6B4EFF;">💬 New Message</h2>
      <p>Hi ${opts.vendorOwnerName}, you have a new message from <strong>@${opts.username}</strong>:</p>
      <div style="background:#fff;border-radius:12px;padding:20px;border:1px solid #E0D9FF;margin:16px 0;">
        <p style="color:#333;font-style:italic;margin:0;">"${opts.messageContent}"</p>
      </div>
      <p style="color:#777;font-size:13px;">Log in to The Pet Point to reply.</p>
    </div>`;

  await sendEmail(opts.vendorEmail, subject, html);
}

// ── Template 3: New Vendor Registration (to Admin) ────────────────────────────
export async function sendVendorRegistrationEmail(opts: {
  businessName: string;
  ownerName: string;
  category: string;
  email: string;
  phone: string | undefined;
  address: string | undefined;
  description: string | undefined;
  services: string[];
  priceRange: string | undefined;
  vendorId: string;
}): Promise<void> {
  const subject = `New Vendor Registration — ${opts.businessName} | The Pet Point`;
  const html = `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#F7F5FF;border-radius:16px;">
      <h2 style="color:#6B4EFF;">🏪 New Vendor Registration</h2>
      <p>A new vendor has registered and is awaiting approval.</p>
      <div style="background:#fff;border-radius:12px;padding:20px;border:1px solid #E0D9FF;margin:16px 0;">
        <p><strong>Business:</strong> ${opts.businessName}</p>
        <p><strong>Owner:</strong> ${opts.ownerName}</p>
        <p><strong>Category:</strong> ${opts.category}</p>
        <p><strong>Email:</strong> ${opts.email}</p>
        ${opts.phone ? `<p><strong>Phone:</strong> ${opts.phone}</p>` : ''}
        ${opts.address ? `<p><strong>Address:</strong> ${opts.address}</p>` : ''}
        ${opts.services.length ? `<p><strong>Services:</strong> ${opts.services.join(', ')}</p>` : ''}
        ${opts.priceRange ? `<p><strong>Price Range:</strong> ${opts.priceRange}</p>` : ''}
        ${opts.description ? `<p><strong>Description:</strong> ${opts.description}</p>` : ''}
      </div>
      <p style="background:#FFF3CD;border-radius:8px;padding:12px;color:#856404;">
        <strong>To approve:</strong><br/>
        <code>UPDATE vendors SET approved_status = true WHERE id = '${opts.vendorId}';</code>
      </p>
    </div>`;

  await sendEmail(ADMIN, subject, html);
}
