# Contact Form Email Setup

This document provides instructions on how to set up the email functionality for the Midwave Studio contact form.

## Overview

The contact form is configured to send emails to `info@midwavestudio.com` with the subject line "Midwave Form: [Subject]". The form supports two email sending methods:

1. **SendGrid** (preferred method)
2. **Nodemailer with Gmail** (fallback method)

## Setup Instructions

### Option 1: SendGrid (Recommended)

SendGrid is a reliable transactional email service that provides better deliverability and tracking.

1. Create a SendGrid account at [https://sendgrid.com/](https://sendgrid.com/)
2. Verify your sender domain or email address in SendGrid
3. Create an API key with "Mail Send" permissions
4. Add the following environment variables to your `.env.local` file:

```
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@midwavestudio.com  # Must be a verified sender
```

### Option 2: Nodemailer with Gmail (Fallback)

This method uses Nodemailer with a Gmail account. Note that Gmail has sending limits and may be less reliable for production use.

1. Create or use an existing Gmail account
2. Enable 2-Step Verification for your Google account
   - Go to your Google Account settings: [https://myaccount.google.com/](https://myaccount.google.com/)
   - Select "Security"
   - Enable "2-Step Verification"
3. Generate an App Password
   - Go to your Google Account settings
   - Select "Security"
   - Under "Signing in to Google", select "App passwords"
   - Generate a new app password for "Mail" and "Other (Custom name)" - name it "Midwave Contact Form"
4. Add the following environment variables to your `.env.local` file:

```
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASSWORD=your-app-password
```

## Testing the Contact Form

After setting up either SendGrid or Nodemailer (or both), you can test the contact form:

1. Start the development server: `npm run dev`
2. Navigate to the contact page
3. Fill out the form and submit it
4. Check the email inbox for `info@midwavestudio.com`

## Troubleshooting

If you encounter issues with the contact form:

1. Check the server logs for error messages
2. Verify that your environment variables are set correctly
3. If using SendGrid, check the SendGrid Activity Feed for delivery status
4. If using Gmail, ensure that the app password is correct and that your Gmail account doesn't have additional security restrictions

## Security Considerations

- Never commit your `.env.local` file to version control
- Regularly rotate your API keys and passwords
- Consider implementing rate limiting to prevent form spam 