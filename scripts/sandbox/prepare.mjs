import { cp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';

export async function prepareSandbox(root) {
  const stage = path.resolve(root, '.learning-sandbox/app');
  // This is generated source only; persistent data is outside this directory.
  if (path.dirname(stage) !== path.join(path.resolve(root), '.learning-sandbox'))
    throw new Error('Unsafe staging directory');
  await rm(stage, { recursive: true, force: true });
  await mkdir(stage, { recursive: true });
  for (const name of ['src', 'public', 'package.json', 'postcss.config.mjs', 'tsconfig.json'])
    await cp(path.join(root, name), path.join(stage, name), { recursive: true });
  const save = async (relative, value) => {
    const file = path.join(stage, relative);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, value);
  };
  const replace = async (relative, before, after) => {
    const text = await readFile(path.join(stage, relative), 'utf8');
    if (!text.includes(before)) throw new Error('Sandbox adapter no longer matches ' + relative);
    await save(relative, text.replace(before, after));
  };
  for (const name of ['auth.ts', 'database.ts', 'media.ts', 'rpc.ts', 'sanity.ts', 'types.tsx'])
    await save(
      'src/lib/sandbox/' + name,
      await readFile(path.join(root, 'scripts/sandbox', name), 'utf8'),
    );
  for (const [target, adapter] of [
    ['database/client', 'database'],
    ['auth/server', 'auth'],
    ['learning/media', 'media'],
  ])
    await save('src/lib/' + target + '.ts', `export * from '../sandbox/${adapter}';\n`);
  await replace(
    'src/lib/learning/authoring.ts',
    "import { createClient } from '@sanity/client';",
    "import { createSandboxSanityClient as createClient } from '../sandbox/sanity';",
  );
  await replace(
    'src/lib/admin/management.ts',
    "import { createClient } from '@supabase/supabase-js';",
    "import { createSandboxAuthClient as createClient } from '../sandbox/auth';",
  );
  await save(
    'src/lib/commerce/cashbox.ts',
    "export const managementUrl=()=> 'http://127.0.0.1:3201/academy.html';export const cashboxUrl=()=> 'http://127.0.0.1:3201/admin.html?view=cashbox';\n",
  );
  await save('src/proxy.ts', await readFile(path.join(root, 'scripts/sandbox/proxy.ts'), 'utf8'));
  await save(
    'src/app/api/media/mux/route.ts',
    "export function POST(){return Response.json({error:'Disabled in local sandbox'},{status:503});}\n",
  );
  await save(
    'src/app/sandbox/page.tsx',
    await readFile(path.join(root, 'scripts/sandbox/SandboxPage.tsx'), 'utf8'),
  );
  await save(
    'src/components/organisms/SandboxBanner/SandboxBanner.tsx',
    await readFile(path.join(root, 'scripts/sandbox/SandboxBanner.tsx'), 'utf8'),
  );
  await replace('src/app/layout.tsx', '<body>', '<body><SandboxBanner />');
  await replace(
    'src/app/layout.tsx',
    "import './learning.css';",
    "import './learning.css';\nimport { SandboxBanner } from '@/components/organisms/SandboxBanner/SandboxBanner';",
  );
  const content = JSON.parse(await readFile(path.join(root, 'content/academy.json'), 'utf8'));
  const example = structuredClone(content.programs[0]);
  Object.assign(example, {
    id: 'program-sandbox',
    slug: 'sandbox-practice',
    title: 'Тестова контент-практика',
    description: 'Локальний навчальний курс для перевірки роботи платформи',
    modules: [
      { id: 'sandbox-module', title: 'Перші кроки', topics: ['Плануємо контент для бренду'] },
    ],
  });
  content.programs.unshift(example);
  const offering = structuredClone(content.offerings[0]);
  Object.assign(offering, {
    id: 'offering-sandbox',
    programId: example.id,
    duration: 'Самостійний темп',
    startDate: undefined,
    availability: 'open',
    verificationRequired: false,
    packages: [
      {
        id: 'sandbox-access',
        name: 'Локальна практика',
        price: 0,
        availability: 'open',
        description: 'Тестовий доступ без оплати',
        includes: ['Текст і робочий аркуш'],
      },
    ],
  });
  content.offerings.unshift(offering);
  await save(
    'src/app/studio/[[...tool]]/page.tsx',
    "export default function SandboxStudio(){return <main><h1>Керуйте курсами в редакторі Академії</h1><a href='/admin/courses'>Курси</a></main>;}\n",
  );
  await save('content/academy.json', JSON.stringify(content));
  await save(
    'src/lib/content.ts',
    "import fixture from '../../content/academy.json';import type {AcademyContent} from './content/types';export async function getContent():Promise<AcademyContent>{return fixture as AcademyContent;}export {findImage,findOffering} from './content/selectors';\n",
  );
  await save(
    'next.config.mjs',
    `export default {serverExternalPackages:['node:sqlite'],turbopack:{root:${JSON.stringify(root)}},images:{unoptimized:true},devIndicators:false};\n`,
  );
  return stage;
}
