interface LeadEmail {
  name: string;
  phone: string;
  email: string;
  message: string;
  preferredLocation: string;
  propertyTitle: string;
}

// Emails the team about a new lead. Does nothing unless RESEND_API_KEY and
// LEAD_NOTIFY_EMAIL are set, and never fails the enquiry itself.
export async function notifyNewLead(lead: LeadEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFY_EMAIL;
  if (!apiKey || !to) return;

  const lines = [
    `Name: ${lead.name}`,
    `Phone: ${lead.phone}`,
    lead.email && `Email: ${lead.email}`,
    lead.propertyTitle && `Property: ${lead.propertyTitle}`,
    lead.preferredLocation && `Preferred location: ${lead.preferredLocation}`,
    lead.message && `\nMessage:\n${lead.message}`,
  ].filter(Boolean);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.LEAD_NOTIFY_FROM || 'Shabach Properties <onboarding@resend.dev>',
        to: to.split(',').map((address) => address.trim()),
        subject: `New enquiry from ${lead.name}${lead.propertyTitle ? ` - ${lead.propertyTitle}` : ''}`,
        text: lines.join('\n'),
        ...(lead.email ? { reply_to: lead.email } : {}),
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      console.error('Lead notification rejected:', response.status, await response.text());
    }
  } catch (error) {
    console.error('Lead notification failed:', error);
  }
}
