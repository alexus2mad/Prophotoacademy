import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LessonTable } from '@/components/atoms/LessonTable/LessonTable';
import { lessonHeadings } from './headings';
import type { LessonProseProps } from './types';

export function LessonProse({ children }: LessonProseProps) {
  return (
    <div className="lesson-prose">
      <ReactMarkdown
        skipHtml
        disallowedElements={['img']}
        remarkPlugins={[remarkGfm, lessonHeadings]}
        components={{ table: LessonTable }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
