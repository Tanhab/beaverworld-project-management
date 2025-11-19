import { createNotification } from '@/lib/api/notifications';
import { sendDiscordNotification } from '@/lib/integrations/discord';
import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const { userId } = await request.json();
  
  try {
    // Create notification
    const notification = await createNotification({
      user_id: userId,
      type: 'issue_assigned',
      title: 'Test Notification',
      message: 'This is a test notification from the API',
      link: '/issues',
      priority: 'high',
      send_email: false,
      send_discord: true,
      show_in_app: true,
    });

    // Get user profile with Discord ID
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, discord_id')
      .eq('id', userId)
      .single();

    // Send to Discord if user has Discord ID
    if (profile?.discord_id) {
      await sendDiscordNotification({
        notificationId: notification.id,
        type: 'issue_assigned',
        title: 'Test Notification',
        message: 'This is a test notification from the API',
        link: '/issues',
        priority: 'high',
        users: [{
          discord_id: profile.discord_id,
          username: profile.username,
        }],
      });
    }

    return Response.json({ success: true, notification });
  } catch (error) {
    logger.error('Test notification error:', error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}