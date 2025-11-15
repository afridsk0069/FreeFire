// EmailJS Configuration
// Get these values from https://www.emailjs.com/
// 
// Setup Instructions:
// 1. Sign up at https://www.emailjs.com/ (free tier available)
// 2. Create an Email Service (Gmail, Outlook, etc.)
// 3. Create an Email Template with variables: {{to_email}}, {{to_name}}, {{otp_code}}
// 4. Get your Public Key from Account → General
// 5. Replace the values below

const EmailConfig = {
  // Your EmailJS Public Key (get from EmailJS dashboard)
  publicKey: 'u3YracVIpOV_lQYpB',
  
  // Your Email Service ID (get from Email Services section)
  serviceId: 'service_r2n78p3',
  
  // Your Email Template ID (get from Email Templates section)
  templateId: 'template_k7ysiek',
  
  // Enable/disable EmailJS (set to false to use fallback mode)
  enabled: true, // Set to true after configuring EmailJS
  
  // Fallback mode: For testing without EmailJS
  // OTP will be logged to console and stored in localStorage
  // Set to false to disable fallback and show errors instead
  fallbackMode: false  // Changed to false to see actual errors
};

// Make it globally available
window.EmailConfig = EmailConfig;

