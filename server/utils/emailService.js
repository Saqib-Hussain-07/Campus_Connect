const logger = require('./logger');

/**
 * Enterprise Email Dispatcher Service
 * Supports SMTP (via nodemailer if configured) or reliable simulated dev delivery.
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = Boolean(
      process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
    );

    if (this.isConfigured) {
      try {
        const nodemailer = require('nodemailer');
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
        logger.info('EmailService: SMTP transporter initialized successfully.');
      } catch (err) {
        logger.warn('EmailService: Nodemailer initialization skipped, falling back to simulated mailer.', err.message);
      }
    } else {
      logger.info('EmailService: Operating in Development/Simulated mode.');
    }
  }

  async sendMail({ to, subject, html, text }) {
    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: process.env.EMAIL_FROM || '"CampusConnect" <no-reply@campusconnect.edu>',
          to,
          subject,
          text: text || html.replace(/<[^>]*>?/gm, ''),
          html
        });
        logger.info(`Email sent to ${to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
      } catch (error) {
        logger.error(`Failed to send email to ${to}: ${error.message}`);
        return { success: false, error: error.message };
      }
    }

    // Development / Local Simulation Fallback
    logger.info(`[SIMULATED EMAIL DISPATCH]`);
    logger.info(`To: ${to}`);
    logger.info(`Subject: ${subject}`);
    logger.info(`Body Preview: ${text || html.slice(0, 150)}...`);
    return { success: true, simulated: true };
  }

  /**
   * Password Reset Email Template
   */
  async sendPasswordResetEmail(user, resetUrl) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #111; padding: 24px; background: #fafaf8;">
        <h2 style="color: #c94f2c; margin-top: 0;">CampusConnect Security</h2>
        <p>Hello <strong>${user.name || 'Student'}</strong>,</p>
        <p>A password reset request was received for your CampusConnect account.</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background: #111; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; display: inline-block;">
            Reset My Password
          </a>
        </p>
        <p style="font-size: 0.85rem; color: #666;">
          If you did not request this, you can safely ignore this email. The link will expire in 1 hour.
        </p>
      </div>
    `;
    return this.sendMail({
      to: user.email,
      subject: 'CampusConnect — Password Reset Request',
      html
    });
  }

  /**
   * Account Verification Email Template
   */
  async sendVerificationEmail(user, verifyUrl) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #111; padding: 24px; background: #fafaf8;">
        <h2 style="color: #2d4a3e; margin-top: 0;">Welcome to CampusConnect!</h2>
        <p>Hello <strong>${user.name}</strong>,</p>
        <p>Please confirm your university email address to activate all platform features.</p>
        <p style="margin: 24px 0;">
          <a href="${verifyUrl}" style="background: #2d4a3e; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; display: inline-block;">
            Verify Email Address
          </a>
        </p>
      </div>
    `;
    return this.sendMail({
      to: user.email,
      subject: 'CampusConnect — Verify your email',
      html
    });
  }

  /**
   * Upcoming Event Reminder Email
   */
  async sendEventReminderEmail(user, event) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #111; padding: 24px; background: #fafaf8;">
        <h2 style="color: #2b6cb0; margin-top: 0;">📅 Event Reminder</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>This is a reminder that the event you registered for is happening soon:</p>
        <div style="background: #fff; border: 1px solid #ddd; padding: 16px; margin: 16px 0;">
          <h3 style="margin: 0 0 8px;">${event.title}</h3>
          <p style="margin: 4px 0;"><strong>Date:</strong> ${new Date(event.eventDate || event.date).toLocaleString()}</p>
          <p style="margin: 4px 0;"><strong>Venue:</strong> ${event.isOnline ? 'Online Webinar' : (event.venue || 'Campus')}</p>
        </div>
      </div>
    `;
    return this.sendMail({
      to: user.email,
      subject: `Reminder: ${event.title} is coming up!`,
      html
    });
  }

  /**
   * Marketplace / Project Collaboration Interest Notification
   */
  async sendCollaborationInterestEmail(author, requester, project) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #111; padding: 24px; background: #fafaf8;">
        <h2 style="color: #c94f2c; margin-top: 0;">🚀 Collaboration Request</h2>
        <p>Hi <strong>${author.name}</strong>,</p>
        <p><strong>${requester.name}</strong> is interested in collaborating on your project: <strong>${project.title}</strong>.</p>
        <p style="font-size: 0.85rem; color: #666;">You can check your direct messages on CampusConnect to connect.</p>
      </div>
    `;
    return this.sendMail({
      to: author.email,
      subject: `New Collaboration Interest in "${project.title}"`,
      html
    });
  }
}

module.exports = new EmailService();
