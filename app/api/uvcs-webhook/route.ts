
import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');

  if (!process.env.UVCS_WEBHOOK_TOKEN) {
    logger.warn('UVCS_WEBHOOK_TOKEN not set');
  }

  // Simple shared-secret check
  if (process.env.UVCS_WEBHOOK_TOKEN && token !== process.env.UVCS_WEBHOOK_TOKEN) {
    return new Response('Unauthorized', { status: 401 });
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  // These keys are guesses — tweak once you see a real payload
  const eventType =
    payload.event ??
    payload.eventType ??
    payload.type ??
    'unknown';

  const repoName =
    payload.repository?.name ??
    payload.repoName ??
    null;

  const branchName =
    payload.branch?.name ??
    payload.changeset?.branch ??
    null;

  const author =
    payload.user?.name ??
    payload.owner?.name ??
    payload.author ??
    null;

  const comment =
    payload.comment ??
    payload.changeset?.comment ??
    '';

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('uvcs_events')
      .insert({
        event_type: eventType,
        repo_name: repoName,
        branch_name: branchName,
        author,
        comment,
        raw_payload: payload,
      });

    if (error) {
      logger.error('UVCS webhook insert error', error);
      return new Response('DB error', { status: 500 });
    }

    return new Response('ok', { status: 200 });
  } catch (err) {
    logger.error('UVCS webhook unhandled error', err);
    return new Response('Server error', { status: 500 });
  }
}
