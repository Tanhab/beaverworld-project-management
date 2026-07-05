'use server';

import { logger } from '@/lib/logger';

/**
 * Post a message to the team Discord channel via webhook.
 *
 * Runs server-side only, so the webhook URL (a secret) is read from the
 * non-public `DISCORD_WEBHOOK_URL` env var and never reaches the browser bundle.
 */
export async function postToDiscord(
  content: string,
): Promise<{ ok: boolean; status: number }> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    logger.warn('DISCORD_WEBHOOK_URL not configured. Skipping Discord notification.');
    return { ok: false, status: 0 };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      logger.error(`Discord webhook failed: ${response.status} - ${errorText}`);
    }

    return { ok: response.ok, status: response.status };
  } catch (error) {
    logger.error('Error posting to Discord:', error);
    return { ok: false, status: 0 };
  }
}
