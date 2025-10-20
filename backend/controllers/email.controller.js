const MailerSendService = require('../services/mailersend.service');

const emailController = {
  /**
   * Send a simple email
   */
  async sendEmail(req, res) {
    try {
      const { to, subject, htmlContent, textContent } = req.body;
      
      // Validate input
      if (!to || !subject || (!htmlContent && !textContent)) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: to, subject, and either htmlContent or textContent'
        });
      }
      
      // Send email using MailerSend service
      const response = await MailerSendService.sendEmail(to, subject, htmlContent, textContent);
      
      res.json({
        success: true,
        message: 'Email sent successfully',
        data: response
      });
    } catch (error) {
      console.error('Send email error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send email',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Send bulk emails
   */
  async sendBulkEmail(req, res) {
    try {
      const { recipients, subject, htmlContent, textContent } = req.body;
      
      // Validate input
      if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Recipients must be a non-empty array'
        });
      }
      
      if (!subject || (!htmlContent && !textContent)) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: subject, and either htmlContent or textContent'
        });
      }
      
      // Send bulk email using MailerSend service
      const response = await MailerSendService.sendBulkEmail(recipients, subject, htmlContent, textContent);
      
      res.json({
        success: true,
        message: 'Bulk emails sent successfully',
        data: response
      });
    } catch (error) {
      console.error('Send bulk email error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send bulk emails',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Send email using template
   */
  async sendTemplateEmail(req, res) {
    try {
      const { to, templateId, variables } = req.body;
      
      // Validate input
      if (!to || !templateId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: to, templateId'
        });
      }
      
      // Send template email using MailerSend service
      const response = await MailerSendService.sendTemplateEmail(to, templateId, variables);
      
      res.json({
        success: true,
        message: 'Template email sent successfully',
        data: response
      });
    } catch (error) {
      console.error('Send template email error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send template email',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Send SMS notification
   */
  async sendSMS(req, res) {
    try {
      const { phoneNumber, message } = req.body;
      
      // Validate input
      if (!phoneNumber || !message) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: phoneNumber, message'
        });
      }
      
      // Send SMS using MailerSend service
      const response = await MailerSendService.sendSMS(phoneNumber, message);
      
      res.json({
        success: true,
        message: 'SMS sent successfully',
        data: response
      });
    } catch (error) {
      console.error('Send SMS error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send SMS',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = emailController;