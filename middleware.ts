import { NextResponse, type NextRequest } from 'next/server';

const aliases = new Set([
  'jinghenghuan.com',
  'jingheng-huan.jh730493450.chatgpt.site',
]);

export function middleware(request: NextRequest) {
  const url = new URL(request.url);
  if (!aliases.has(url.hostname)) return NextResponse.next();

  // Keep the original path and query when consolidating our own hostnames.
  url.protocol = 'https:';
  url.hostname = 'www.jinghenghuan.com';
  url.port = '';
  return NextResponse.redirect(url, 308);
}

export const config = { matcher: '/:path*' };
