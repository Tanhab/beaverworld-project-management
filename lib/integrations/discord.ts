// lib/integrations/discord.ts
import type { Database } from '@/lib/types/database.types';
import { markDiscordSent } from '@/lib/api/notifications';
import { postToDiscord } from '@/lib/actions/discord';
import { logger } from '../logger';

type NotificationType = Database['public']['Enums']['notification_type'];

interface DiscordUser {
  discord_id: string;
  username: string;
}

interface DiscordNotificationPayload {
  notificationId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  priority: 'low' | 'normal' | 'high';
  users: DiscordUser[];
}

/**
 * Discord webhook rate limiter
 * Prevents hitting Discord's rate limits (30 req/min, 5 req/sec)
 */
class DiscordRateLimiter {
  private queue: Array<() => Promise<void>> = [];
  private processing = false;
  private requestsThisSecond = 0;
  private requestsThisMinute = 0;
  private lastSecondReset = Date.now();
  private lastMinuteReset = Date.now();

  async add(fn: () => Promise<void>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          await fn();
          resolve();
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;

    while (this.queue.length > 0) {
      // Reset counters if needed
      const now = Date.now();
      if (now - this.lastSecondReset >= 1000) {
        this.requestsThisSecond = 0;
        this.lastSecondReset = now;
      }
      if (now - this.lastMinuteReset >= 60000) {
        this.requestsThisMinute = 0;
        this.lastMinuteReset = now;
      }

      // Check rate limits
      if (this.requestsThisSecond >= 5) {
        await new Promise(resolve => setTimeout(resolve, 200));
        continue;
      }
      if (this.requestsThisMinute >= 30) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }

      // Process next request
      const fn = this.queue.shift();
      if (fn) {
        this.requestsThisSecond++;
        this.requestsThisMinute++;
        await fn();
      }
    }

    this.processing = false;
  }
}

const rateLimiter = new DiscordRateLimiter();

/**
 * Send a notification to Discord via webhook.
 *
 * The webhook URL is a secret, so the actual POST happens in a server action
 * (`postToDiscord`). This function only filters recipients, formats the message,
 * and applies client-side rate limiting — keeping the URL out of the browser
 * bundle.
 */
export async function sendDiscordNotification(
  payload: DiscordNotificationPayload
): Promise<void> {
  // Filter users who have Discord IDs
  const usersWithDiscord = payload.users.filter(u => u.discord_id);

  if (usersWithDiscord.length === 0) {
    logger.info('No users with Discord IDs. Skipping Discord notification.');
    if (payload.notificationId) await markDiscordSent(payload.notificationId);
    return;
  }

  // Format the Discord message
  const discordMessage = formatDiscordMessage(payload, usersWithDiscord);

  // Send via rate limiter; the POST itself runs server-side.
  await rateLimiter.add(async () => {
    const result = await postToDiscord(discordMessage);
    if (result.ok) {
      if (payload.notificationId) await markDiscordSent(payload.notificationId);
      logger.info(`Discord notification sent for: ${payload.title}`);
    }
  });
}

/**
 * Send batch notifications to Discord
 * Combines multiple notifications for the same issue/task
 */
export async function sendBatchDiscordNotification(
  payloads: DiscordNotificationPayload[]
): Promise<void> {
  if (payloads.length === 0) return;

  // Group by issue/task/board
  const groupedPayloads = groupPayloadsByTarget(payloads);

  // Send each group
  for (const group of groupedPayloads) {
    await sendDiscordNotification(group);
  }
}

/**
 * Format Discord message based on notification type
 */
function formatDiscordMessage(
  payload: DiscordNotificationPayload,
  users: DiscordUser[]
): string {
  const emoji = getNotificationEmoji(payload.type);
  const mentions = users.map(u => `<@${u.discord_id}>`).join(' ');
  const priorityBadge = payload.priority === 'high' ? '🔴 **HIGH PRIORITY**' : '';

  let message = `${emoji} **${payload.title}**\n`;
  
  if (priorityBadge) {
    message += `${priorityBadge}\n`;
  }

  message += `${payload.message}\n`;
  message += `👤 ${mentions}\n`;

  if (payload.link) {
    // Construct full URL if it's a relative path
    const fullLink = payload.link.startsWith('http') 
      ? payload.link 
      : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${payload.link}`;
    message += `🔗 ${fullLink}`;
  }

  return message;
}

/**
 * Get emoji for notification type
 */
function getNotificationEmoji(type: NotificationType): string {
  const emojiMap: Record<NotificationType, string> = {
    issue_assigned: '🐛',
    issue_updated: '🔄',
    issue_closed: '✅',
    issue_reopened: '🔓',
    issue_commented: '💬',
    issue_mentioned: '📢',
    scenario_assigned: '🎮',
    scenario_updated: '🔄',
    scenario_completed: '✅',
    scenario_bug_found: '⚠️',
    task_assigned: '📋',
    task_moved: '➡️',
    task_deadline: '⏰',
    board_created: '📌',
    board_updated: '🔄',
    announcement: '📣',
    reminder: '🔔',
    mention: '💬',
  };

  return emojiMap[type] || '📌';
}

/**
 * Get Discord embed color based on priority
 */
function getPriorityColor(priority: 'low' | 'normal' | 'high'): number {
  const colorMap = {
    low: 0x3B82F6,    // Blue
    normal: 0xA86F5C, // Terracotta (your primary color)
    high: 0xEF4444,   // Red
  };

  return colorMap[priority];
}

/**
 * Group payloads by their target (issue, task, board)
 * This allows batching notifications for the same entity
 */
function groupPayloadsByTarget(
  payloads: DiscordNotificationPayload[]
): DiscordNotificationPayload[] {
  // For now, just return as-is
  // In the future, we could combine multiple updates to the same issue/task
  return payloads;
}

/**
 * Process pending Discord notifications
 * This would be called by a background job or API endpoint
 */
export async function processPendingDiscordNotifications(): Promise<void> {
  // Import here to avoid circular dependencies
  const { getPendingDiscordNotifications } = await import('@/lib/api/notifications');
  
  const pending = await getPendingDiscordNotifications(10);

  for (const notification of pending) {
    try {
      const profile = notification.profile;
      if (!profile?.discord_id) {
        // User doesn't have Discord ID, mark as sent anyway
        await markDiscordSent(notification.id);
        continue;
      }

      await sendDiscordNotification({
        notificationId: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        link: notification.link,
        priority: notification.priority,
        users: [{
          discord_id: profile.discord_id,
          username: profile.username,
        }],
      });
    } catch (error) {
      logger.error(`Failed to send Discord notification ${notification.id}:`, error);
      // Don't mark as sent if failed - will retry later
    }
  }
}

/**
 * Helper to create and send Discord notification immediately
 * Use this when you want to send a Discord notification right away
 */
export async function sendImmediateDiscordNotification(
  type: NotificationType,
  title: string,
  message: string,
  users: DiscordUser[],
  link?: string,
  priority: 'low' | 'normal' | 'high' = 'normal'
): Promise<void> {
  await sendDiscordNotification({
    notificationId: '', // No notification ID since this is immediate
    type,
    title,
    message,
    link: link || null,
    priority,
    users,
  });
}