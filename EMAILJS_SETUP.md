# EmailJS Setup Guide for Contact Form

Your contact form is now ready to work with EmailJS! Follow these steps to set it up:

## Step 1: Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

## Step 2: Add Email Service
1. In your EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose **Gmail** (recommended) or your preferred email provider
4. Follow the setup instructions to connect your Gmail account
5. Note down the **Service ID** (e.g., `service_3fsrn7p`) => 

## Step 3: Create Email Templates

### Template 1: Admin Notification (for you to receive messages)
1. Go to **Email Templates** → **Create New Template**
2. Set **Template Name**: `Contact Form Admin`
3. Set **Template ID**: `template_admin` (note this down)
4. Configure the template:

**Subject**: `New Contact Form Message - {{subject}}`

**Content**:
```
You have received a new message from your AK Music App contact form:

From: {{from_name}} ({{from_email}})
Subject: {{subject}}
Timestamp: {{timestamp}}

Message:
{{message}}

---
This message was sent via your AK Music App contact form.
```

**To Email**: `official.abhishant.kumar@gmail.com`

### Template 2: Auto-Reply (confirmation to user)
1. Create another template
2. Set **Template Name**: `Contact Form Auto Reply`
3. Set **Template ID**: `template_auto_reply` (note this down)
4. Configure the template:

**Subject**: `Thank you for contacting AK Music App`

**Content**:
```
Hi {{to_name}},

Thank you for reaching out to us! We have received your message and will get back to you soon.

Your message: "{{message}}"

Best regards,
AK Music App Team

---
This is an automated response. Please do not reply to this email.
```

**To Email**: `{{to_email}}`

## Step 4: Get Your Public Key
1. Go to **Account** → **General**
2. Find your **Public Key** (e.g., `nmRcMh7mTaf_ZBOve`)
3. Copy this key

## Step 5: Update Your Code
Open `script.js` and replace the placeholder values:

```javascript
// Line 913: Replace with your actual public key
emailjs.init("YOUR_PUBLIC_KEY"); // Replace with your actual public key

// Line 942: Replace with your service ID
emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {

// Line 952: Replace with your service ID and auto-reply template ID
return emailjs.send("YOUR_SERVICE_ID", "YOUR_AUTO_REPLY_TEMPLATE_ID", {
```

**Replace these values:**
- `YOUR_PUBLIC_KEY` → Your actual public key from Step 4
- `YOUR_SERVICE_ID` → Your service ID from Step 2 (use the same for both calls)
- `YOUR_TEMPLATE_ID` → `template_admin` (or whatever you named the admin template)
- `YOUR_AUTO_REPLY_TEMPLATE_ID` → `template_auto_reply` (or whatever you named the auto-reply template)

## Step 6: Test Your Contact Form
1. Open your website
2. Go to the Contact page
3. Fill out the form with test data
4. Submit the form
5. Check:
   - Your Gmail inbox for the admin notification
   - The test email address for the auto-reply confirmation

## Example Configuration
Here's what your final code should look like:

```javascript
// Initialize EmailJS
emailjs.init("user_abc123xyz"); // Your actual public key

// Send email to admin
emailjs.send("service_gmail123", "template_admin", {
    from_name: formData.name,
    from_email: formData.email,
    subject: formData.subject,
    message: formData.message,
    timestamp: formData.timestamp,
    to_email: "official.abhishant.kumar@gmail.com"
})
.then(() => {
    // Send auto-reply to user
    return emailjs.send("service_gmail123", "template_auto_reply", {
        to_name: formData.name,
        to_email: formData.email,
        subject: "Thank you for contacting AK Music App",
        message: formData.message
    });
})
```

## Troubleshooting
- **Emails not sending**: Check browser console for errors
- **Wrong template**: Verify template IDs match exactly
- **Gmail issues**: Make sure Gmail service is properly connected
- **Rate limits**: EmailJS free plan has monthly limits

## Free Plan Limits
- 200 emails per month
- EmailJS branding in emails
- Basic support

For higher volume, consider upgrading to a paid plan.

---

Your contact form is now fully functional! Users will receive confirmation emails, and you'll get all contact form submissions in your Gmail inbox.
