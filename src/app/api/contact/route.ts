import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req: NextRequest) {
  try {
    // Create a new Resend instance on each request to ensure we have the latest API key
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    // Parse the request body
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Prepare the email content
    const subjectLine = `Midwave Form: ${subject || 'Contact Form Submission'}`;
    const htmlContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
      <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
      <h3>Message:</h3>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `;

    // Send email using Resend
    if (!process.env.RESEND_API_KEY) {
      console.error('Resend API key is missing');
      throw new Error('Resend API key is missing');
    }

    console.log('Sending email with Resend...');
    // Use verified domain for professional appearance
    const fromAddress = process.env.EMAIL_FROM || 'contact@mail.midwavestudio.com';
    console.log('From:', fromAddress);
    console.log('To:', process.env.EMAIL_TO || 'midwavestudio@gmail.com');
    
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: process.env.EMAIL_TO || 'midwavestudio@gmail.com',
      subject: subjectLine,
      html: htmlContent,
      reply_to: email, // This allows you to reply directly to the person who submitted the form
    });

    if (error) {
      console.error('Resend error details:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('Email sent successfully:', data);
    return NextResponse.json({ success: true });
  } catch (error) {
    // More detailed error logging
    console.error('Error sending email:', error);
    console.error('Error type:', typeof error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { error: 'Failed to send email. Please try again later or contact us directly by phone.' },
      { status: 500 }
    );
  }
}