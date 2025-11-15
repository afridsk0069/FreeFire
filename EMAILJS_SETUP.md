# EmailJS Setup Guide

To enable real-time OTP email sending, you need to set up EmailJS:

## Steps:

1. **Sign up for EmailJS** (Free tier available)
   - Go to https://www.emailjs.com/
   - Create a free account

2. **Create an Email Service**
   - In EmailJS dashboard, go to "Email Services"
   - Add a new service (Gmail, Outlook, etc.)
   - Follow the setup instructions

3. **Create an Email Template**
   - Go to "Email Templates"
   - Create a new template
   - Use these variables:
     - `{{to_email}}` - Recipient email
     - `{{to_name}}` - Player name
     - `{{otp_code}}` - The 6-digit OTP code
   - Example template:
     ```
     Subject: FreeFire Team Splitter - OTP Verification
     
     Hello {{to_name}},
     
     Your OTP code is: {{otp_code}}
     
     This code will expire in 5 minutes.
     
     If you didn't request this code, please ignore this email.
     ```

4. **Get Your Keys**
   - Go to "Account" → "General"
   - Copy your "Public Key"
   - Note your Service ID (from Email Services section)
   - Note your Template ID (from Email Templates section)

5. **Update the Configuration**
   - Open `js/email-config.js`
   - Replace these values:
     - `YOUR_PUBLIC_KEY` → Your EmailJS Public Key
     - `YOUR_SERVICE_ID` → Your Email Service ID
     - `YOUR_TEMPLATE_ID` → Your Email Template ID
   - Set `enabled: true` to activate EmailJS
   - Set `fallbackMode: false` to disable fallback mode

6. **Test**
   - Add a player with a valid email address
   - Request OTP
   - Check the email inbox

## Alternative: Use a Backend Service

If you prefer not to use EmailJS, you can:
- Set up a Node.js backend with Nodemailer
- Use SendGrid, Mailgun, or similar service
- Integrate Twilio for SMS OTP

## Current Status

Currently, the app uses a fallback method that stores OTP in localStorage for testing. 
**For production use, you MUST configure EmailJS or another email service.**

