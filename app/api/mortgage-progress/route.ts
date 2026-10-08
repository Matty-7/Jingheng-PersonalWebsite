import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { handle_learning_progress } from '@/lib/learning_progress_api';

export const dynamic = 'force-dynamic';

async function progress_request(request: Request) {
  const user = await getChatGPTUser();
  return handle_learning_progress(
    request,
    (env as { DB: D1Database }).DB,
    user?.userId ?? null,
  );
}

export { progress_request as GET, progress_request as PUT };
