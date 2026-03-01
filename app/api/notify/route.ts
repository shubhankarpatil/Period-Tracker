import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const { partnerEmail, newPhase, nickname, dynamicTips } = await req.json();

        if (!partnerEmail) {
            return NextResponse.json({ error: 'Partner email is required' }, { status: 400 });
        }

        const { data, error } = await resend.emails.send({
            from: 'Period Tracker <notifications@resend.dev>', // In production, this would be a verified domain
            to: partnerEmail,
            subject: `Cycle Update: ${nickname || 'She'} has entered the ${newPhase} phase`,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #FF6B99;">Cycle Phase Update</h2>
          <p>Hi there,</p>
          <p><strong>${nickname || 'Your partner'}</strong> has just entered the <strong>${newPhase}</strong> phase of her cycle.</p>
          
          <div style="background: #FFF0F5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #D81B60; font-size: 1rem;">💡 Dynamic Support Tip</h3>
            <p style="margin-bottom: 0; color: #444;">${dynamicTips || 'Be patient and supportive during this phase.'}</p>
          </div>

          <p>Logging into the dashboard will show you a customized checklist of tasks you can do to support her today.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 0.8rem; color: #888;">This is an automated notification from Period Tracker.</p>
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
