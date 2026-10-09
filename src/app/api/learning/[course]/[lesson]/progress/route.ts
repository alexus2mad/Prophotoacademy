import { requireMember } from '@/lib/auth/server';
import { saveProgress } from '@/lib/learning/service';
import { progressSchema } from '@/lib/learning/schema';
import { errorResponse, guardMutation, jsonBody } from '@/lib/http';
import type { LearningPageProps } from '@/app/types';
export async function POST(request: Request, { params }: LearningPageProps) {
  try {
    await guardMutation(request, 'progress');
    const user = await requireMember();
    const { course, lesson } = await params;
    return Response.json(
      await saveProgress(
        user.id,
        course,
        lesson,
        progressSchema.parse(await jsonBody(request, 32_768)),
      ),
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
