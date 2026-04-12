import { NextRequest, NextResponse } from 'next/server';
import { COURSES, searchCourses } from '@/lib/courses';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') ?? '';

  const courses = query ? searchCourses(query) : COURSES;

  return NextResponse.json(
    { courses },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    }
  );
}
