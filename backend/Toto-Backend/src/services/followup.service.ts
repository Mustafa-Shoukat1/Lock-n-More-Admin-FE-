import pool from '../config/db.config';
import { WhatsAppService } from './whatsapp.service';
import { InstagramService } from './instagram.service';
import { TikTokService } from './tiktok.service';
import { logger } from '../utils/logger';

export class FollowupSchedulerService {
  private whatsappService: WhatsAppService;
  private instagramService: InstagramService;
  private tiktokService: TikTokService;
  private schedulerRunning: boolean = false;

  constructor() {
    this.whatsappService = new WhatsAppService();
    this.instagramService = new InstagramService();
    this.tiktokService = new TikTokService();
  }

  /**
   * Start the background scheduler loop
   */
  startScheduler(checkIntervalMs: number = 60000) {
    if (this.schedulerRunning) {
      logger.warn('Follow-up scheduler already running');
      return;
    }

    this.schedulerRunning = true;
    logger.info(`Follow-up scheduler started (check interval: ${checkIntervalMs}ms)`);

    setInterval(async () => {
      try {
        await this.processPendingFollowups();
      } catch (error: any) {
        logger.error('Error in follow-up scheduler loop:', error.message);
      }
    }, checkIntervalMs);
  }

  /**
   * Stop the background scheduler
   */
  stopScheduler() {
    this.schedulerRunning = false;
    logger.info('Follow-up scheduler stopped');
  }

  /**
   * Process all pending follow-ups that are due
   */
  private async processPendingFollowups() {
    try {
      const pendingFollowups = await pool.query(`
        SELECT 
          fs.id,
          fs.platform,
          fs.session_id,
          fs.contact_id,
          fs.next_send_at,
          ft.message_text
        FROM followup_schedules fs
        JOIN followup_templates ft ON fs.platform = ft.platform
        WHERE fs.is_enabled = TRUE
          AND fs.next_send_at <= NOW()
          AND ft.is_active = TRUE
        LIMIT 50
      `);

      if (pendingFollowups.rows.length === 0) {
        return; // No pending follow-ups
      }

      logger.info(`Processing ${pendingFollowups.rows.length} pending follow-ups`);

      for (const followup of pendingFollowups.rows) {
        try {
          await this.sendFollowup(followup);
        } catch (error: any) {
          logger.error(`Failed to send follow-up ${followup.id}:`, error.message);
          await this.logAudit(followup.id, followup.session_id, followup.platform, 'failed', error.message);
        }
      }
    } catch (error: any) {
      logger.error('Error fetching pending follow-ups:', error.message);
    }
  }

  /**
   * Send a single follow-up message
   */
  private async sendFollowup(followup: any) {
    const { id, platform, contact_id, message_text, session_id } = followup;

    try {
      let sendResult: any;

      if (platform === 'whatsapp') {
        sendResult = await this.whatsappService.sendMessage(contact_id, 'en', message_text);
      } else if (platform === 'instagram') {
        sendResult = await this.instagramService.sendMessage(contact_id, message_text);
      } else if (platform === 'tiktok') {
        sendResult = await this.tiktokService.sendMessage(contact_id, message_text);
      }

      if (sendResult) {
        // Calculate next send time (e.g., 24 hours later)
        const nextSendAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await pool.query(`
          UPDATE followup_schedules 
          SET last_sent_at = NOW(), 
              next_send_at = $1,
              updated_at = NOW()
          WHERE id = $2
        `, [nextSendAt, id]);

        await this.logAudit(id, session_id, platform, 'sent', `Follow-up message sent successfully to ${contact_id}`);

        logger.info(`✅ Follow-up sent to ${contact_id} on ${platform}`);
      }
    } catch (error: any) {
      logger.error(`Error sending follow-up on ${platform}:`, error.message);
      throw error;
    }
  }

  /**
   * Schedule a new follow-up for a conversation
   */
  async scheduleFollowup(
    platform: string,
    sessionId: string,
    contactId: string,
    delayMinutes: number = 120
  ) {
    try {
      const nextSendAt = new Date(Date.now() + delayMinutes * 60 * 1000);

      const result = await pool.query(`
        INSERT INTO followup_schedules (platform, session_id, contact_id, delay_minutes, next_send_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (platform, session_id) 
        DO UPDATE SET 
          delay_minutes = EXCLUDED.delay_minutes,
          next_send_at = EXCLUDED.next_send_at,
          is_enabled = TRUE,
          updated_at = NOW()
        RETURNING *
      `, [platform, sessionId, contactId, delayMinutes, nextSendAt]);

      await this.logAudit(result.rows[0].id, sessionId, platform, 'scheduled', `Follow-up scheduled for ${delayMinutes} minutes`);

      logger.info(`📅 Follow-up scheduled for ${contactId} on ${platform} in ${delayMinutes} minutes`);
      return result.rows[0];
    } catch (error: any) {
      logger.error('Error scheduling follow-up:', error.message);
      throw error;
    }
  }

  /**
   * Cancel a follow-up schedule
   */
  async cancelFollowup(scheduleId: number) {
    try {
      const result = await pool.query(`
        UPDATE followup_schedules 
        SET is_enabled = FALSE, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `, [scheduleId]);

      if (result.rows.length > 0) {
        const { id, session_id, platform } = result.rows[0];
        await this.logAudit(id, session_id, platform, 'cancelled', 'Follow-up cancelled');
        logger.info(`❌ Follow-up cancelled: ${scheduleId}`);
      }

      return result.rows[0];
    } catch (error: any) {
      logger.error('Error cancelling follow-up:', error.message);
      throw error;
    }
  }

  /**
   * Get follow-up schedule by session
   */
  async getFollowupBySession(platform: string, sessionId: string) {
    try {
      const result = await pool.query(`
        SELECT * FROM followup_schedules 
        WHERE platform = $1 AND session_id = $2
      `, [platform, sessionId]);

      return result.rows[0] || null;
    } catch (error: any) {
      logger.error('Error fetching follow-up:', error.message);
      throw error;
    }
  }

  /**
   * Get all active follow-ups
   */
  async getAllActiveFollowups() {
    try {
      const result = await pool.query(`
        SELECT 
          fs.id,
          fs.platform,
          fs.session_id,
          fs.contact_id,
          fs.next_send_at,
          fs.last_sent_at,
          fs.delay_minutes
        FROM followup_schedules fs
        WHERE fs.is_enabled = TRUE
        ORDER BY fs.next_send_at ASC
      `);

      return result.rows;
    } catch (error: any) {
      logger.error('Error fetching active follow-ups:', error.message);
      throw error;
    }
  }

  /**
   * Update follow-up delay
   */
  async updateFollowupDelay(scheduleId: number, newDelayMinutes: number) {
    try {
      const nextSendAt = new Date(Date.now() + newDelayMinutes * 60 * 1000);

      const result = await pool.query(`
        UPDATE followup_schedules 
        SET delay_minutes = $1, next_send_at = $2, updated_at = NOW()
        WHERE id = $3
        RETURNING *
      `, [newDelayMinutes, nextSendAt, scheduleId]);

      return result.rows[0];
    } catch (error: any) {
      logger.error('Error updating follow-up delay:', error.message);
      throw error;
    }
  }

  /**
   * Get follow-up message templates
   */
  async getFollowupTemplates(platform?: string) {
    try {
      let query = 'SELECT * FROM followup_templates WHERE is_active = TRUE';
      const params: any[] = [];

      if (platform) {
        query += ' AND platform = $1';
        params.push(platform);
      }

      query += ' ORDER BY platform ASC';

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error: any) {
      logger.error('Error fetching follow-up templates:', error.message);
      throw error;
    }
  }

  /**
   * Update follow-up message template
   */
  async updateFollowupTemplate(templateId: number, messageText: string) {
    try {
      const result = await pool.query(`
        UPDATE followup_templates 
        SET message_text = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `, [messageText, templateId]);

      return result.rows[0];
    } catch (error: any) {
      logger.error('Error updating follow-up template:', error.message);
      throw error;
    }
  }

  /**
   * Log follow-up actions for audit trail
   */
  private async logAudit(scheduleId: number, sessionId: string, platform: string, action: string, message: string) {
    try {
      await pool.query(`
        INSERT INTO followup_audit (scheduled_id, session_id, platform, action, status_message)
        VALUES ($1, $2, $3, $4, $5)
      `, [scheduleId, sessionId, platform, action, message]);
    } catch (error: any) {
      logger.error('Error logging follow-up audit:', error.message);
    }
  }
}

// Export singleton instance
export const followupScheduler = new FollowupSchedulerService();
