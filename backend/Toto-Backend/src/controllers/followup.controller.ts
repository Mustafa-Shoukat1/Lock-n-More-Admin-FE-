import { Request, Response } from 'express';
import { followupScheduler } from '../services/followup.service';
import { logger } from '../utils/logger';

export class FollowupController {
  /**
   * Schedule a new follow-up for a conversation
   */
  async scheduleFollowup(req: Request, res: Response) {
    try {
      const { platform, sessionId, contactId, delayMinutes = 120 } = req.body;

      if (!platform || !sessionId || !contactId) {
        return res.status(400).json({
          error: 'Missing required fields: platform, sessionId, contactId'
        });
      }

      const result = await followupScheduler.scheduleFollowup(
        platform,
        sessionId,
        contactId,
        delayMinutes
      );

      res.status(201).json({
        status: 'success',
        message: 'Follow-up scheduled',
        data: result
      });
    } catch (error: any) {
      logger.error('Error scheduling follow-up:', error.message);
      res.status(500).json({ error: 'Failed to schedule follow-up' });
    }
  }

  /**
   * Cancel an existing follow-up
   */
  async cancelFollowup(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      if (!id) {
        return res.status(400).json({ error: 'Follow-up ID required' });
      }

      const result = await followupScheduler.cancelFollowup(parseInt(id));

      res.status(200).json({
        status: 'success',
        message: 'Follow-up cancelled',
        data: result
      });
    } catch (error: any) {
      logger.error('Error cancelling follow-up:', error.message);
      res.status(500).json({ error: 'Failed to cancel follow-up' });
    }
  }

  /**
   * Get follow-up status for a specific session
   */
  async getFollowupStatus(req: Request, res: Response) {
    try {
      const { platform, sessionId } = req.query;

      if (!platform || !sessionId) {
        return res.status(400).json({
          error: 'Missing required query params: platform, sessionId'
        });
      }

      const followup = await followupScheduler.getFollowupBySession(
        platform as string,
        sessionId as string
      );

      res.status(200).json({
        status: 'success',
        data: followup
      });
    } catch (error: any) {
      logger.error('Error fetching follow-up status:', error.message);
      res.status(500).json({ error: 'Failed to fetch follow-up status' });
    }
  }

  /**
   * Get all active follow-ups
   */
  async getAllFollowups(req: Request, res: Response) {
    try {
      const followups = await followupScheduler.getAllActiveFollowups();

      res.status(200).json({
        status: 'success',
        count: followups.length,
        data: followups
      });
    } catch (error: any) {
      logger.error('Error fetching all follow-ups:', error.message);
      res.status(500).json({ error: 'Failed to fetch follow-ups' });
    }
  }

  /**
   * Update follow-up delay
   */
  async updateFollowupDelay(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { delayMinutes } = req.body;

      if (!id || !delayMinutes) {
        return res.status(400).json({
          error: 'Missing required fields: id, delayMinutes'
        });
      }

      const result = await followupScheduler.updateFollowupDelay(
        parseInt(id),
        delayMinutes
      );

      res.status(200).json({
        status: 'success',
        message: 'Follow-up delay updated',
        data: result
      });
    } catch (error: any) {
      logger.error('Error updating follow-up delay:', error.message);
      res.status(500).json({ error: 'Failed to update follow-up delay' });
    }
  }

  /**
   * Get follow-up message templates
   */
  async getTemplates(req: Request, res: Response) {
    try {
      const { platform } = req.query;

      const templates = await followupScheduler.getFollowupTemplates(
        platform as string | undefined
      );

      res.status(200).json({
        status: 'success',
        count: templates.length,
        data: templates
      });
    } catch (error: any) {
      logger.error('Error fetching templates:', error.message);
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  }

  /**
   * Update follow-up message template
   */
  async updateTemplate(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { messageText } = req.body;

      if (!id || !messageText) {
        return res.status(400).json({
          error: 'Missing required fields: id, messageText'
        });
      }

      const result = await followupScheduler.updateFollowupTemplate(
        parseInt(id),
        messageText
      );

      res.status(200).json({
        status: 'success',
        message: 'Template updated',
        data: result
      });
    } catch (error: any) {
      logger.error('Error updating template:', error.message);
      res.status(500).json({ error: 'Failed to update template' });
    }
  }
}
