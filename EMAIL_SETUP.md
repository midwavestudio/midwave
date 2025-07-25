# Contact Form Email Setup

This document provides instructions on how to set up the email functionality for the Midwave Studio contact form.

## Overview

The contact form is configured to send emails to your specified email address with the subject line "Midwave Form: [Subject]". The form uses Resend.com for email delivery.

## Setup Instructions

### Resend.com Setup

Resend is a modern email API service that's both reliable and easy to set up. The free tier includes 100 emails per day.

1. Create a Resend account at [https://resend.com/](https://resend.com/)
2. Create an API key with appropriate permissions
3. Add the following environment variables to your `.env.local` file:

```
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=contact@mail.midwavestudio.com  # Use your verified domain (mail.midwavestudio.com)
EMAIL_TO=midwavestudio@gmail.com  # The email where you want to receive contact form submissions
```

4. **Domain Verification**: Your domain `mail.midwavestudio.com` has been verified in Resend. This allows the contact form to send emails from `contact@mail.midwavestudio.com` instead of the default `onboarding@resend.dev`.

5. **Reply-To Configuration**: The contact form is configured with `reply_to` functionality, so when you reply to a contact form email, it will go directly to the person who submitted the form.

## Testing the Contact Form

After setting up Resend, you can test the contact form:

1. Start the development server: `npm run dev`
2. Navigate to the contact page
3. Fill out the form and submit it
4. Check the specified email inbox for contact form submissions
5. You can also check your Resend dashboard to see if the email was sent successfully

## Troubleshooting

If you encounter issues with the contact form:

1. Check the server logs for error messages
2. Verify that your environment variables are set correctly
3. Check your Resend dashboard for delivery status and any error messages
4. Ensure your Resend API key has the correct permissions

## Security Considerations

- Never commit your `.env.local` file to version control
- Regularly rotate your API keys and passwords
- Consider implementing rate limiting to prevent form spam 