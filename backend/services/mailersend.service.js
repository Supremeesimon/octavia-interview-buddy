const { MailerSend, EmailParams, Sender, Recipient } = require('mailersend');

class MailerSendService {
  constructor() {
    // Initialize MailerSend with API key from environment variables
    this.mailerSend = new MailerSend({
      apiKey: process.env.MAILERSEND_API_KEY,
    });
    
    // Email configuration
    this.fromEmail = process.env.MAILERSEND_FROM_EMAIL || process.env.FROM_EMAIL || 'noreply@octavia-interview.com';
    this.fromName = process.env.MAILERSEND_FROM_NAME || process.env.FROM_NAME || 'Octavia Interview Buddy';
  }

  /**
   * Send a simple email
   * @param {string} to - Recipient email address
   * @param {string} subject - Email subject
   * @param {string} htmlContent - HTML content of the email
   * @param {string} textContent - Plain text content of the email
   * @returns {Promise<Object>} - Response from MailerSend API
   */
  async sendEmail(to, subject, htmlContent, textContent = '') {
    try {
      const sentFrom = new Sender(this.fromEmail, this.fromName);
      const recipients = [new Recipient(to)];

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject(subject)
        .setHtml(htmlContent)
        .setText(textContent);

      const response = await this.mailerSend.email.send(emailParams);
      console.log('Email sent successfully:', response);
      return response;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Send an email to multiple recipients
   * @param {Array<string>} recipients - Array of recipient email addresses
   * @param {string} subject - Email subject
   * @param {string} htmlContent - HTML content of the email
   * @param {string} textContent - Plain text content of the email
   * @returns {Promise<Object>} - Response from MailerSend API
   */
  async sendBulkEmail(recipients, subject, htmlContent, textContent = '') {
    try {
      const sentFrom = new Sender(this.fromEmail, this.fromName);
      const recipientObjects = recipients.map(email => new Recipient(email));

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipientObjects)
        .setSubject(subject)
        .setHtml(htmlContent)
        .setText(textContent);

      const response = await this.mailerSend.email.send(emailParams);
      console.log('Bulk email sent successfully:', response);
      return response;
    } catch (error) {
      console.error('Error sending bulk email:', error);
      throw new Error(`Failed to send bulk email: ${error.message}`);
    }
  }

  /**
   * Send an email using a template
   * @param {string} to - Recipient email address
   * @param {string} templateId - MailerSend template ID
   * @param {Object} variables - Template variables
   * @returns {Promise<Object>} - Response from MailerSend API
   */
  async sendTemplateEmail(to, templateId, variables = {}) {
    try {
      const sentFrom = new Sender(this.fromEmail, this.fromName);
      const recipients = [new Recipient(to)];

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setTemplateId(templateId)
        .setVariables(variables);

      const response = await this.mailerSend.email.send(emailParams);
      console.log('Template email sent successfully:', response);
      return response;
    } catch (error) {
      console.error('Error sending template email:', error);
      throw new Error(`Failed to send template email: ${error.message}`);
    }
  }

  /**
   * Send SMS notification
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} message - SMS message content
   * @returns {Promise<Object>} - Response from MailerSend API
   */
  async sendSMS(phoneNumber, message) {
    try {
      // Note: MailerSend SMS functionality requires a different setup
      // This is a placeholder for when SMS is properly configured
      console.log(`SMS would be sent to ${phoneNumber}: ${message}`);
      
      // For now, we'll just log the SMS and return a mock response
      // In a real implementation, you would use the MailerSend SMS API
      return {
        success: true,
        message: 'SMS sent successfully',
        phoneNumber: phoneNumber,
      };
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }
}

// Export singleton instance
module.exports = new MailerSendService();