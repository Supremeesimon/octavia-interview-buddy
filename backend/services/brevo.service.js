const { TransactionalEmailsApi, SendSmtpEmail } = require('@getbrevo/brevo');

class BrevoService {
  constructor() {
    // Initialize Brevo with API key from environment variables
    this.transactionalEmailsApi = new TransactionalEmailsApi();
    this.transactionalEmailsApi.authentications.apiKey.apiKey = process.env.BREVO_API_KEY;
    
    // Email configuration
    this.fromEmail = process.env.BREVO_FROM_EMAIL || process.env.FROM_EMAIL || 'noreply@octavia-interview.com';
    this.fromName = process.env.BREVO_FROM_NAME || process.env.FROM_NAME || 'Octavia Interview Buddy';
  }

  /**
   * Send a simple email
   * @param {string} to - Recipient email address
   * @param {string} subject - Email subject
   * @param {string} htmlContent - HTML content of the email
   * @param {string} textContent - Plain text content of the email
   * @returns {Promise<Object>} - Response from Brevo API
   */
  async sendEmail(to, subject, htmlContent, textContent = '') {
    try {
      const sendSmtpEmail = new SendSmtpEmail();
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.textContent = textContent;
      sendSmtpEmail.htmlContent = htmlContent;
      sendSmtpEmail.sender = { name: this.fromName, email: this.fromEmail };
      sendSmtpEmail.to = [{ email: to }];

      const response = await this.transactionalEmailsApi.sendTransacEmail(sendSmtpEmail);
      console.log('Email sent successfully:', response.body);
      return response.body;
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
   * @returns {Promise<Object>} - Response from Brevo API
   */
  async sendBulkEmail(recipients, subject, htmlContent, textContent = '') {
    try {
      const sendSmtpEmail = new SendSmtpEmail();
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.textContent = textContent;
      sendSmtpEmail.htmlContent = htmlContent;
      sendSmtpEmail.sender = { name: this.fromName, email: this.fromEmail };
      sendSmtpEmail.to = recipients.map(email => ({ email }));

      const response = await this.transactionalEmailsApi.sendTransacEmail(sendSmtpEmail);
      console.log('Bulk email sent successfully:', response.body);
      return response.body;
    } catch (error) {
      console.error('Error sending bulk email:', error);
      throw new Error(`Failed to send bulk email: ${error.message}`);
    }
  }

  /**
   * Send an email using a template
   * @param {string} to - Recipient email address
   * @param {string} templateId - Brevo template ID
   * @param {Object} params - Template parameters
   * @returns {Promise<Object>} - Response from Brevo API
   */
  async sendTemplateEmail(to, templateId, params = {}) {
    try {
      const sendSmtpEmail = new SendSmtpEmail();
      sendSmtpEmail.templateId = templateId;
      sendSmtpEmail.sender = { name: this.fromName, email: this.fromEmail };
      sendSmtpEmail.to = [{ email: to }];
      sendSmtpEmail.params = params;

      const response = await this.transactionalEmailsApi.sendTransacEmail(sendSmtpEmail);
      console.log('Template email sent successfully:', response.body);
      return response.body;
    } catch (error) {
      console.error('Error sending template email:', error);
      throw new Error(`Failed to send template email: ${error.message}`);
    }
  }

  /**
   * Send SMS notification
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} message - SMS message content
   * @returns {Promise<Object>} - Response from Brevo API
   */
  async sendSMS(phoneNumber, message) {
    try {
      // Note: Brevo SMS functionality requires a different setup
      // This is a placeholder for when SMS is properly configured
      console.log(`SMS would be sent to ${phoneNumber}: ${message}`);
      
      // For now, we'll just log the SMS and return a mock response
      // In a real implementation, you would use the Brevo SMS API
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
module.exports = new BrevoService();