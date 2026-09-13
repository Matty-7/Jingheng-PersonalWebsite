import type { Plugin } from 'vite';

// Only a development-server middleware. There is no production audit route.
// An iframe supplies a real CSS viewport when browser resizing is unavailable;
// it does not emulate a mobile browser, device, network or user preference.
export function audit_preview(): Plugin {
  const viewports: Record<string, [number, number]> = {
    '/__audit/desktop': [1440, 900],
    '/__audit/mobile': [390, 844],
    '/__audit/short': [1280, 720],
    '/__audit/mortgage_desktop': [1440, 900],
    '/__audit/mortgage_short': [1280, 720],
    '/__audit/mortgage_mobile': [390, 844],
    '/__audit/mortgage_narrow': [320, 844],
  };
  return {
    name: 'site-audit-preview',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const viewport = viewports[(request.url ?? '').split('?')[0]];
        if (!viewport || !['GET', 'HEAD'].includes(request.method ?? '')) {
          next();
          return;
        }
        const [width, height] = viewport;
        const route = (request.url ?? '').startsWith('/__audit/mortgage_')
          ? '/portfolio/mortgage-map'
          : '/';
        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        response.setHeader('Cache-Control', 'no-store');
        response.end(
          request.method === 'HEAD'
            ? ''
            : `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Site audit viewport</title>
<style>body{margin:0;background:#ddd}iframe{display:block;border:0}</style></head>
<body><iframe title="Website at ${width} by ${height}" src="${route}" width="${width}" height="${height}"></iframe></body></html>`,
        );
      });
    },
  };
}
