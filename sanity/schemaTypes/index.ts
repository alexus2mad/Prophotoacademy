import type { PackageIdentity } from './types';
import { defineArrayMember, defineField, defineType } from 'sanity';
const text = (name: string, title: string, required = false) =>
  defineField({
    name,
    title,
    type: 'string',
    validation: (rule) => (required ? rule.required() : rule),
  });
const long = (name: string, title: string) => defineField({ name, title, type: 'text', rows: 3 });
const strings = (name: string, title: string) =>
  defineField({ name, title, type: 'array', of: [defineArrayMember({ type: 'string' })] });
const reference = (name: string, title: string, type: string) =>
  defineField({
    name,
    title,
    type: 'reference',
    to: [{ type }],
    validation: (rule) => rule.required(),
  });
const references = (name: string, title: string, type: string) =>
  defineField({
    name,
    title,
    type: 'array',
    of: [defineArrayMember({ type: 'reference', to: [{ type }] })],
  });
const legacyId = defineField({
  name: 'legacyId',
  title: 'Original migration ID',
  type: 'string',
  readOnly: true,
  description: 'Preserved on imported documents. New documents use their Sanity ID automatically.',
});
const sourceUrl = defineField({
  name: 'sourceUrl',
  title: 'Migration source',
  type: 'url',
  readOnly: true,
});
const sourceMeta = defineField({
  name: 'source',
  title: 'Source provenance',
  type: 'object',
  readOnly: true,
  fields: [
    text('system', 'System'),
    text('capturedAt', 'Captured at'),
    text('siteId', 'Webflow site ID'),
  ],
});
const sortOrder = defineField({
  name: 'sortOrder',
  title: 'Display order',
  type: 'number',
  initialValue: 0,
});
const availability = defineField({
  name: 'availability',
  title: 'Enrollment status',
  type: 'string',
  options: {
    list: [
      { title: 'Open', value: 'open' },
      { title: 'Limited places', value: 'limited' },
      { title: 'Sold out', value: 'soldOut' },
      { title: 'Waitlist / inquiry', value: 'waitlist' },
      { title: 'Archived', value: 'archived' },
    ],
  },
  validation: (rule) => rule.required(),
});
export const schemaTypes = [
  defineType({
    name: 'studioRoom',
    title: 'Hub · Studio spaces',
    type: 'document',
    fields: [
      legacyId,
      text('title', 'Space name', true),
      defineField({
        name: 'slug',
        title: 'Original room URL',
        type: 'slug',
        validation: (r) => r.required(),
      }),
      text('bookingKey', 'Booking provider room key', true),
      long('description', 'Introduction'),
      reference('image', 'Cover', 'editorialImage'),
      references('gallery', 'Space photographs', 'editorialImage'),
      defineField({
        name: 'pricePerHour',
        title: 'Base hourly price · UAH',
        type: 'number',
        validation: (r) => r.required().positive().integer(),
      }),
      defineField({
        name: 'minimumMinutes',
        title: 'Minimum booking · minutes',
        type: 'number',
        validation: (r) => r.required().positive().integer(),
      }),
      defineField({ name: 'area', title: 'Area · m²', type: 'number' }),
      strings('features', 'Confirmed features'),
      long('equipmentNote', 'Equipment / renovation notice'),
      sortOrder,
      sourceUrl,
      sourceMeta,
    ],
    preview: { select: { title: 'title', media: 'image.image' } },
  }),
  defineType({
    name: 'practiceSession',
    title: 'ProPhoto · Guided practice',
    type: 'document',
    fields: [
      legacyId,
      text('title', 'Session title', true),
      defineField({ name: 'slug', title: 'URL', type: 'slug', validation: (r) => r.required() }),
      long('description', 'Introduction'),
      references('programs', 'Related Academy courses', 'program'),
      reference('room', 'Hub space', 'studioRoom'),
      reference('image', 'Photograph', 'editorialImage'),
      defineField({
        name: 'status',
        title: 'Publication stage',
        type: 'string',
        options: { list: ['planning', 'open', 'paused'] },
        initialValue: 'planning',
        validation: (r) => r.required(),
      }),
      defineField({
        name: 'verified',
        title: 'Staffing, costs and delivery confirmed',
        type: 'boolean',
        initialValue: false,
      }),
      text('duration', 'Duration'),
      defineField({
        name: 'capacity',
        title: 'Maximum participants',
        type: 'number',
        validation: (r) => r.positive().integer(),
      }),
      defineField({
        name: 'price',
        title: 'Price · UAH',
        type: 'number',
        validation: (r) => r.positive().integer(),
      }),
      defineField({ name: 'date', title: 'Date', type: 'date' }),
      strings('equipment', 'Included equipment'),
      strings('preparation', 'Preparation'),
      strings('deliverables', 'Participant deliverables'),
      defineField({
        name: 'enrollmentOffering',
        title: 'Confirmed paid intake',
        type: 'reference',
        to: [{ type: 'offering' }],
        description:
          'Optional intake for the existing verified payment flow. Planning sessions accept inquiries only.',
      }),
      sourceMeta,
    ],
    validation: (r) =>
      r.custom((document) => {
        if (document?.status !== 'open') return true;
        return document.verified &&
          document.duration &&
          document.capacity &&
          document.price &&
          document.date &&
          (document.equipment as unknown[] | undefined)?.length &&
          (document.preparation as unknown[] | undefined)?.length &&
          (document.deliverables as unknown[] | undefined)?.length
          ? true
          : 'Confirm staffing, price, date, duration, capacity, equipment, preparation and deliverables before opening registration.';
      }),
    preview: { select: { title: 'title', subtitle: 'status', media: 'image.image' } },
  }),
  defineType({
    name: 'hubSettings',
    title: 'Hub · Site settings',
    type: 'document',
    fields: [
      text('name', 'Business name', true),
      text('heroTitle', 'Homepage title', true),
      long('heroDescription', 'Homepage introduction'),
      reference('heroImage', 'Homepage photograph', 'editorialImage'),
      text('email', 'Studio email', true),
      text('phone', 'Studio phone', true),
      text('address', 'Studio address', true),
      text('arrival', 'Arrival instructions'),
      text('hours', 'Opening hours'),
      defineField({ name: 'mapsUrl', title: 'Maps', type: 'url' }),
      defineField({ name: 'instagram', title: 'Studio Instagram', type: 'url' }),
      defineField({
        name: 'bookingUrl',
        title: 'Existing booking provider embed',
        type: 'url',
        validation: (r) => r.required().uri({ scheme: ['https'] }),
      }),
      defineField({
        name: 'privacyUrl',
        title: 'Privacy policy URL',
        type: 'url',
        validation: (r) => r.required(),
      }),
      defineField({ name: 'termsUrl', title: 'Studio rental terms URL', type: 'url' }),
      sourceMeta,
    ],
  }),
  defineType({
    name: 'program',
    title: 'Programs',
    type: 'document',
    fields: [
      legacyId,
      text('title', 'Full title', true),
      text('shortTitle', 'Card title', true),
      defineField({
        name: 'slug',
        type: 'slug',
        title: 'URL',
        options: { source: 'title' },
        validation: (r) => r.required(),
      }),
      defineField({
        name: 'category',
        title: 'Program type',
        type: 'string',
        options: { list: ['course', 'class', 'individual', 'corporate'] },
        validation: (r) => r.required(),
      }),
      defineField({
        name: 'level',
        title: 'Experience',
        type: 'string',
        options: { list: ['beginner', 'intermediate', 'all'] },
        validation: (r) => r.required(),
      }),
      text('eyebrow', 'Short introductory line'),
      text('audienceLabel', 'Concise audience label for catalog'),
      long('description', 'Summary'),
      defineField({
        name: 'homepageDescription',
        title: 'Homepage course introduction',
        type: 'text',
        rows: 3,
        description:
          'Optional concise introduction when this is the primary course. Uses the regular summary when empty.',
        validation: (r) => r.max(200),
      }),
      strings('audience', 'Who it is for'),
      strings('outcomes', 'Learning outcomes'),
      reference('image', 'Editorial cover', 'editorialImage'),
      references('instructors', 'Instructors', 'instructor'),
      references('works', 'Example student work', 'studentWork'),
      defineField({
        name: 'modules',
        title: 'Curriculum',
        type: 'array',
        of: [
          defineArrayMember({
            type: 'object',
            fields: [text('title', 'Module title', true), strings('topics', 'Topics')],
            preview: { select: { title: 'title' } },
          }),
        ],
      }),
      defineField({
        name: 'faqs',
        title: 'Frequently asked questions',
        type: 'array',
        of: [
          defineArrayMember({
            type: 'object',
            fields: [text('question', 'Question', true), long('answer', 'Answer')],
            preview: { select: { title: 'question' } },
          }),
        ],
      }),
      defineField({
        name: 'featured',
        title: 'Show on homepage',
        type: 'boolean',
        initialValue: false,
      }),
      defineField({
        name: 'seo',
        title: 'SEO',
        type: 'object',
        fields: [text('title', 'Search title'), long('description', 'Search description')],
      }),
      sortOrder,
      sourceUrl,
      sourceMeta,
    ],
    preview: { select: { title: 'title', subtitle: 'category', media: 'image.image' } },
  }),
  defineType({
    name: 'offering',
    title: 'Intakes & packages',
    type: 'document',
    fields: [
      legacyId,
      reference('program', 'Program', 'program'),
      defineField({ name: 'startDate', title: 'Start date', type: 'date' }),
      text('duration', 'Duration', true),
      defineField({
        name: 'format',
        title: 'Format',
        type: 'string',
        options: { list: ['online', 'offline', 'hybrid'] },
        validation: (r) => r.required(),
      }),
      text('location', 'Location'),
      availability,
      defineField({
        name: 'verificationRequired',
        title: 'Block checkout until source conflicts are resolved',
        type: 'boolean',
        initialValue: true,
        validation: (r) => r.required(),
        description:
          'Clear only after dates, prices and seat availability are confirmed. Past intakes stay unavailable automatically.',
      }),
      defineField({
        name: 'packages',
        title: 'Packages',
        type: 'array',
        of: [
          defineArrayMember({
            type: 'object',
            name: 'package',
            fields: [
              text('id', 'Stable package ID', true),
              text('name', 'Name', true),
              defineField({
                name: 'price',
                title: 'Price in UAH',
                type: 'number',
                validation: (r) => r.required().integer().positive(),
              }),
              defineField({
                name: 'previousPrice',
                title: 'Previous price',
                type: 'number',
                validation: (r) => r.integer().positive(),
              }),
              availability,
              long('description', 'Summary'),
              strings('includes', 'What is included'),
            ],
            preview: { select: { title: 'name', subtitle: 'price' } },
          }),
        ],
        validation: (r) =>
          r.custom((value) => {
            const ids = (value as PackageIdentity[] | undefined)?.map((x) => x.id) || [];
            return (
              new Set(ids).size === ids.length || 'Package IDs must be unique within an intake'
            );
          }),
      }),
      strings('sourceNotes', 'Source conflicts / editorial notes'),
      sourceMeta,
    ],
    preview: { select: { title: 'program.title', subtitle: 'startDate' } },
  }),
  defineType({
    name: 'editorialImage',
    title: 'Photography',
    type: 'document',
    fields: [
      legacyId,
      text('alt', 'Accessible description', true),
      text('credit', 'Photographer / student credit', true),
      defineField({
        name: 'image',
        title: 'Original photograph',
        type: 'image',
        options: { hotspot: true },
        validation: (r) => r.required(),
      }),
      text('driveId', 'Original Drive file ID'),
      text('position', 'Card focal point (CSS x% y%)'),
      defineField({
        name: 'fit',
        title: 'Card framing',
        type: 'string',
        options: { list: ['cover', 'contain'] },
        initialValue: 'cover',
      }),
      sourceMeta,
    ],
    preview: { select: { title: 'alt', subtitle: 'credit', media: 'image' } },
  }),
  defineType({
    name: 'instructor',
    title: 'Instructors',
    type: 'document',
    fields: [
      legacyId,
      text('name', 'Name', true),
      text('role', 'Role', true),
      long('bio', 'Biography'),
      reference('image', 'Portrait', 'editorialImage'),
      sourceMeta,
    ],
    preview: { select: { title: 'name', subtitle: 'role', media: 'image.image' } },
  }),
  defineType({
    name: 'studentWork',
    title: 'Student work',
    type: 'document',
    fields: [
      legacyId,
      text('title', 'Title', true),
      reference('image', 'Photograph', 'editorialImage'),
      defineField({
        name: 'device',
        title: 'Equipment',
        type: 'string',
        options: { list: ['phone', 'camera'] },
        validation: (r) => r.required(),
      }),
      text('author', 'Student name (when confirmed)'),
      sortOrder,
      sourceMeta,
    ],
    preview: { select: { title: 'title', subtitle: 'device', media: 'image.image' } },
  }),
  defineType({
    name: 'testimonial',
    title: 'Testimonials',
    type: 'document',
    fields: [
      legacyId,
      text('name', 'Author', true),
      defineField({
        name: 'kind',
        title: 'Source type',
        type: 'string',
        options: {
          list: [
            { title: 'Student quotation', value: 'quote' },
            { title: 'Academy case story', value: 'story' },
          ],
        },
        initialValue: 'quote',
        validation: (r) => r.required(),
      }),
      long('quote', 'Review or case story text'),
      defineField({ name: 'screenshot', title: 'Original review screenshot', type: 'image' }),
      defineField({
        name: 'program',
        title: 'Program (if confirmed)',
        type: 'reference',
        to: [{ type: 'program' }],
      }),
      sourceUrl,
      sortOrder,
      sourceMeta,
    ],
    preview: { select: { title: 'name', subtitle: 'quote' } },
  }),
  defineType({
    name: 'editorialPage',
    title: 'Editorial & legal pages',
    type: 'document',
    fields: [
      legacyId,
      text('title', 'Title', true),
      defineField({
        name: 'slug',
        title: 'URL',
        type: 'slug',
        options: { source: 'title' },
        validation: (r) => r.required(),
      }),
      defineField({
        name: 'body',
        title: 'Content',
        type: 'array',
        of: [
          defineArrayMember({
            type: 'block',
            styles: [
              { title: 'Paragraph', value: 'normal' },
              { title: 'Heading', value: 'h2' },
              { title: 'Subheading', value: 'h3' },
            ],
            marks: {
              annotations: [
                {
                  name: 'link',
                  type: 'object',
                  title: 'Link',
                  fields: [
                    defineField({
                      name: 'href',
                      title: 'URL',
                      type: 'url',
                      validation: (r) => r.uri({ scheme: ['http', 'https', 'mailto', 'tel'] }),
                    }),
                  ],
                },
              ],
            },
          }),
        ],
      }),
      sourceUrl,
      sourceMeta,
    ],
  }),
  defineType({
    name: 'siteSettings',
    title: 'Site settings',
    type: 'document',
    fields: [
      text('name', 'Academy name', true),
      defineField({
        name: 'primaryProgram',
        title: 'Основна програма',
        type: 'reference',
        to: [{ type: 'program' }],
        options: { filter: 'category == "course"' },
        description:
          'Leads the homepage and appears first in the catalog. Clear this field to show the general academy opening.',
      }),
      text('heroTitle', 'Academy headline (when no primary course)', true),
      long('heroDescription', 'Academy introduction (when no primary course)'),
      reference('heroImage', 'Academy photograph (when no primary course)', 'editorialImage'),
      text('email', 'Contact email', true),
      text('phone', 'Contact phone', true),
      text('address', 'Location'),
      defineField({ name: 'instagram', type: 'url', title: 'Instagram' }),
      defineField({ name: 'telegram', type: 'url', title: 'Telegram' }),
      defineField({ name: 'youtube', type: 'url', title: 'YouTube' }),
      defineField({ name: 'shop', type: 'url', title: 'External shop' }),
      sourceMeta,
    ],
  }),
];
