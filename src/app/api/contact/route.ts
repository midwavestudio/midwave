import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid if API key is available
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function POST(req: NextRequest) {
  try {
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

    // Try to send email using SendGrid first if API key is available
    if (process.env.SENDGRID_API_KEY) {
      try {
        await sgMail.send({
          to: 'info@midwavestudio.com',
          from: process.env.EMAIL_FROM || 'noreply@midwavestudio.com',
          subject: subjectLine,
          html: htmlContent,
          replyTo: email,
        });
        
        return NextResponse.json({ success: true });
      } catch (sendGridError) {
        console.error('SendGrid error:', sendGridError);
        // Fall back to nodemailer if SendGrid fails
      }
    }

    // Fall back to nodemailer if SendGrid is not configured or fails
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      // Create a nodemailer transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      // Send the email
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: 'info@midwavestudio.com',
        subject: subjectLine,
        html: htmlContent,
        replyTo: email,
      });

      return NextResponse.json({ success: true });
    }

    // If we get here, neither method worked
    throw new Error('Email configuration is missing');
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email. Please try again later or contact us directly at info@midwavestudio.com.' },
      { status: 500 }
    );
  }
} 