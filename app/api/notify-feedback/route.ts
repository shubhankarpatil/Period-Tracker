import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

const TYPE_LABELS: Record<string, string> = {
    bug: '🐛 Bug',
    suggestion: '💡 Suggestion',
    other: '✉️ Other',
};

export async function POST(req: Request) {
    try {
        const { type, message, email, userId } = await req.json();

        if (!type || !message) {
            return NextResponse.json({ error: 'Type and message are required' }, { status: 400 });
        }

        const to = process.env.FEEDBACK_TO_EMAIL;
        if (!to) {
            return NextResponse.json({ error: 'FEEDBACK_TO_EMAIL is not configured' }, { status: 500 });
        }

        const typeLabel = TYPE_LABELS[type] || type;
        const safeMessage = String(message)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br />');

        const { data, error } = await resend.emails.send({
            from: 'Period Tracker <feedback@resend.dev>',
            to,
            replyTo: email || undefined,
            subject: `[Feedback · ${typeLabel}] from ${email || 'anonymous'}`,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #FF6B99; margin-top: 0;">New Feedback</h2>
          <table style="font-size: 0.9rem; color: #444; margin-bottom: 1rem;">
            <tr><td style="padding: 2px 8px 2px 0; color: #888;">Type</td><td style="padding: 2px 0;"><strong>${typeLabel}</strong></td></tr>
            <tr><td style="padding: 2px 8px 2px 0; color: #888;">From</td><td style="padding: 2px 0;">${email || 'anonymous'}</td></tr>
            <tr><td style="padding: 2px 8px 2px 0; color: #888;">User ID</td><td style="padding: 2px 0; font-family: monospace; font-size: 0.8rem;">${userId || '—'}</td></tr>
          </table>
          <div style="background: #FFF0F5; padding: 15px; border-radius: 8px; color: #333; line-height: 1.5;">
            ${safeMessage}
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 0.8rem; color: #888;">Sent from the in-app "Drop a Note" form.</p>
        </div>
      `,
        });

        if (error) {
            return NextResponse.json({ error }, { status: 500 });
        }

        return NextResponse.json({ data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
