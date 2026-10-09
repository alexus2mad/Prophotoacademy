export type LearningBlock = {
  id: string;
  kind: 'video' | 'article' | 'image' | 'pdf' | 'file' | 'zoom';
  title: string;
  required: boolean;
  body?: string;
  alt?: string;
  caption?: string;
  mediaId?: string;
  expectedSeconds?: number;
  duration?: number;
  pageSeconds?: number[];
  revision: number;
};
export type Lesson = {
  id: string;
  title: string;
  summary: string;
  releaseAt?: string;
  introductory?: boolean;
  blocks: LearningBlock[];
};
export type CourseModule = { id: string; title: string; lessons: Lesson[] };
export type CourseDraft = {
  id: string;
  programId: string;
  title: string;
  description: string;
  cover: string;
  modules: CourseModule[];
  revision?: string;
};
export type CourseRelease = {
  id: string;
  course_id: string;
  version: number;
  manifest: CourseDraft;
  published_at: string;
};
export type AccessSnapshot = {
  courseId: string;
  releaseId: string;
  lessonIds: string[];
  accessMonths: number | null;
  startsAt: string | null;
};
export type Grant = {
  id: string;
  user_id: string | null;
  email: string;
  course_id: string;
  release_id: string;
  lesson_ids: string[];
  package_name: string;
  source_order_id: string | null;
  source: 'purchase' | 'admin' | 'migration';
  starts_at: string;
  expires_at: string | null;
  revoked_at: string | null;
  reason?: string;
  created_at: string;
  offering_id?: string | null;
};
export type Interval = [number, number];
export type BlockProgress = {
  revision: number;
  ranges: Interval[];
  coverage: number[];
  activeSeconds: number;
  pageSeconds: Record<string, number>;
  position: number;
  completed?: boolean;
};
export type LessonProgress = {
  blocks: Record<string, BlockProgress>;
  manual?: 'student' | 'admin';
  lastBlockId?: string;
};
export type ProgressRow = {
  user_id: string;
  course_id: string;
  lesson_id: string;
  state: LessonProgress;
  completed_at: string | null;
  completion_source: 'automatic' | 'student' | 'admin' | null;
  updated_at: string;
};
export type ProgressEvent = {
  id: string;
  sessionId: string;
  sequence: number;
  blockId: string;
  revision: number;
  elapsed: number;
  ranges?: Interval[];
  coverage?: number[];
  page?: number;
  position?: number;
  manual?: boolean;
};
export type ProgressReply = {
  state: LessonProgress;
  progress: number;
  completed: boolean;
  error?: string;
};
export type LearningMedia = {
  id: string;
  course_id: string;
  kind: LearningBlock['kind'];
  title: string;
  provider_id: string | null;
  object_path: string | null;
  playback_id: string | null;
  mime: string;
  status: 'uploading' | 'processing' | 'ready' | 'failed';
  duration: number | null;
  page_count: number | null;
};
export type MediaAccess = {
  url?: string;
  playbackId?: string;
  token?: string;
  thumbnailToken?: string;
  error?: string;
};
export type LiveSession = {
  id: string;
  course_id: string;
  lesson_id: string;
  offering_id: string | null;
  title: string;
  zoom_url: string;
  starts_at: string;
  ends_at: string;
  timezone: string;
  status: 'scheduled' | 'rescheduled' | 'canceled';
  recording_media_id: string | null;
};
export type EnrolledCourse = {
  course: CourseDraft;
  releaseId: string;
  grants: Grant[];
  progress: ProgressRow[];
  sessions: LiveSession[];
};
export type LearningView = {
  enrollment: EnrolledCourse;
  lesson: Lesson;
  progress: LessonProgress;
  nextLessonId?: string;
};
export type MediaDisplay = LearningMedia & { demoUrl?: string };
