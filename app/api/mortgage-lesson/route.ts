import { mortgage_lesson } from '@/lib/mortgage_lesson';

export function GET(request: Request) {
  const lesson = mortgage_lesson(
    new URL(request.url).searchParams.get('concept') ?? '',
  );
  return Response.json(lesson ?? { error: 'Lesson not found' }, {
    status: lesson ? 200 : 404,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
