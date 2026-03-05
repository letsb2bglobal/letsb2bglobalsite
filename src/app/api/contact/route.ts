import { NextResponse } from 'next/server';

const CONTACT_EMAIL = process.env.CONTACT_FORM_EMAIL || 'support@letsb2b.com';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedSubject = (subject && typeof subject === 'string' ? subject.trim() : 'General enquiry') || 'General enquiry';
    const trimmedMessage = message.trim();

    // Optional: send email via a service (Resend, Nodemailer, etc.) using CONTACT_FORM_EMAIL or another env var.
    // For now we log and return success so the form works; you can add sending logic here.
    if (process.env.NODE_ENV === 'development') {
      console.log('[Contact form]', {
        name: trimmedName,
        email: trimmedEmail,
        subject: trimmedSubject,
        message: trimmedMessage,
        to: CONTACT_EMAIL,
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Contact form error:', e);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
