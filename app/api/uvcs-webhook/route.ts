// app/api/uvcs-webhook/route.ts
import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');

  if (!process.env.UVCS_WEBHOOK_TOKEN) {
    logger.warn('UVCS_WEBHOOK_TOKEN not set');
  }

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

    const isMerge = !!(payload as any).PLASTIC_MERGE_TYPE;
    const eventType = isMerge ? 'merge' : 'checkin';
    
    const repoName = (payload as any).PLASTIC_REPOSITORY_NAME || null;
    const branchName = (payload as any).PLASTIC_FULL_BRANCH_NAME || 
                       (payload as any).PLASTIC_BRANCH_NAME || null;
    const author = (payload as any).PLASTIC_USER || null;
    const comment = (payload as any).PLASTIC_COMMENT || null;
    
    let changesetNumber: string | null = null;
    const changesetStr = (payload as any).PLASTIC_CHANGESET;
    if (changesetStr && typeof changesetStr === 'string') {
      const match = changesetStr.match(/cs:(\d+)/);
      if (match) changesetNumber = match[1];
    }

    let mergeSource: string | null = null;
    let mergeDestination: string | null = null;
    let hasConflicts = false;
    
    if (isMerge) {
      mergeSource = (payload as any).PLASTIC_MERGE_SOURCE || null;
      mergeDestination = (payload as any).PLASTIC_MERGE_DESTINATION || null;
      hasConflicts = (payload as any).PLASTIC_MERGE_HAS_CONFLICTS === 'true';
    }

    const supabase = await createClient(); 

    const { error } = await supabase.from('uvcs_events').insert({
      event_type: eventType,
      repo_name: repoName,
      branch_name: branchName,
      author,
      comment,
      changeset_number: changesetNumber,
      merge_source: mergeSource,
      merge_destination: mergeDestination,
      has_conflicts: hasConflicts,
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

export async function GET() {
  return new Response('UVCS webhook is up. Use POST.', { status: 200 });
}