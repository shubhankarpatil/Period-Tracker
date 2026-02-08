import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const { email, subject, html } = await request.json();

        const data = await resend.emails.send({
            from: 'Period Tracker <onboarding@resend.dev>', // Update with your verify domain if available
            to: [email],
            subject: subject,
            html: html,
        });

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}
