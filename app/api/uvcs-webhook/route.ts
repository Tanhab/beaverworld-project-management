// app/api/uvcs-webhook/route.ts
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
    logger.warn('UVCS webhook: bad token', { token });
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const payload = await req.json().catch(() => null);

    if (!payload || typeof payload !== 'object') {
      logger.error('UVCS webhook: invalid JSON payload', { payload });
      return new Response('Bad Request', { status: 400 });
    }

    // These field names are defensive guesses; we also store the whole payload.
    const eventType: string =
      (payload as any).event_type ??
      (payload as any).eventType ??
      (payload as any).action ??
      'unknown';

    const repoName: string | null =
      (payload as any).repo_name ??
      (payload as any).repositoryName ??
      (payload as any).repository?.name ??
      null;

    const branchName: string | null =
      (payload as any).branch_name ??
      (payload as any).branch ??
      (payload as any).source_branch ??
      null;

    const author: string | null =
      (payload as any).author ??
      (payload as any).user?.name ??
      (payload as any).user?.username ??
      null;

    const comment: string | null =
      (payload as any).comment ??
      (payload as any).changeset_comment ??
      (payload as any).message ??
      null;

    const supabase = await createClient(); 

    const { error } = await supabase.from('uvcs_events').insert({
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

// Optional: sanity check route
export async function GET() {
  return new Response('UVCS webhook is up. Use POST.', { status: 200 });
}
