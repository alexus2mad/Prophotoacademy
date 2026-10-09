import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const { parse, evaluate } = await import(
  pathToFileURL(require.resolve('groq-js', { paths: [require.resolve('sanity')] })).href
);
const source = await readFile('src/lib/content.ts', 'utf8');
const sourceFile = ts.createSourceFile('content.ts', source, ts.ScriptTarget.Latest, true);
const queryDeclaration = sourceFile.statements
  .filter(ts.isVariableStatement)
  .flatMap((statement) => [...statement.declarationList.declarations])
  .find((declaration) => ts.isIdentifier(declaration.name) && declaration.name.text === 'query');
if (!queryDeclaration || !ts.isNoSubstitutionTemplateLiteral(queryDeclaration.initializer)) {
  throw new Error('Expected the published content query to be a static template literal');
}
const query = queryDeclaration.initializer.text;
const documents = (await readFile('content/generated/sanity-import.ndjson', 'utf8'))
  .trim()
  .split('\n')
  .map((line) => JSON.parse(line));
const fixture = JSON.parse(await readFile('content/academy.json', 'utf8'));
for (const image of fixture.images) {
  const imported = documents.find((d) => d._id === `image-${image.id}`);
  documents.push({
    _id: imported.image.asset._ref,
    _type: 'sanity.imageAsset',
    url: `https://cdn.sanity.io/mock/${image.id}.webp`,
    metadata: { dimensions: { width: image.width, height: image.height } },
  });
}
const newProgram = {
  ...documents.find((d) => d._type === 'program'),
  _id: 'new-program',
  slug: { current: 'new-program' },
  sortOrder: 99,
};
delete newProgram.legacyId;
delete newProgram.modules;
delete newProgram.faqs;
documents.push(newProgram);
documents.push({
  ...newProgram,
  _id: 'new-program-with-module',
  sortOrder: 100,
  modules: [{ title: 'New module' }],
});
documents.push({
  _id: 'new-intake',
  _type: 'offering',
  program: { _type: 'reference', _ref: 'new-program' },
  packages: [{ id: 'base', name: 'BASE', price: 1000, availability: 'open' }],
});
const result = await (await evaluate(parse(query), { dataset: documents })).get();
assert.equal(result.programs.length, fixture.programs.length + 2);
assert.equal(result.images.length, fixture.images.length);
assert.equal(result.settings.heroImageId, fixture.settings.heroImageId);
assert.equal(result.settings.primaryProgramId, fixture.settings.primaryProgramId);
assert.equal(result.hub.heroImageId, fixture.hub.heroImageId);
assert.equal(result.hub.phone, fixture.hub.phone);
for (const room of fixture.rooms) {
  const projected = result.rooms.find((item) => item.id === room.id);
  assert.equal(projected.imageId, room.imageId);
  assert.equal(projected.slug, room.slug);
  assert.deepEqual(projected.galleryImageIds, room.galleryImageIds);
}
for (const session of fixture.practiceSessions) {
  const projected = result.practiceSessions.find((item) => item.id === session.id);
  assert.equal(projected.roomId, session.roomId);
  assert.deepEqual(projected.programIds, session.programIds);
  assert.equal(projected.verified, false);
}
const nativeRoom = { ...documents.find((d) => d._type === 'studioRoom'), _id: 'native-room' };
delete nativeRoom.legacyId;
documents.push(nativeRoom);
const nativeSession = {
  ...documents.find((d) => d._type === 'practiceSession'),
  _id: 'native-session',
  room: { _type: 'reference', _ref: 'native-room' },
  programs: [{ _type: 'reference', _ref: 'new-program' }],
};
delete nativeSession.legacyId;
documents.push(nativeSession);
const nativeEcosystem = await (await evaluate(parse(query), { dataset: documents })).get();
assert.equal(
  nativeEcosystem.practiceSessions.find((item) => item.id === 'native-session').roomId,
  'native-room',
);
assert.deepEqual(
  nativeEcosystem.practiceSessions.find((item) => item.id === 'native-session').programIds,
  ['new-program'],
);
const settingsDoc = documents.find((document) => document._id === 'site-settings');
const selected = settingsDoc.primaryProgram;
settingsDoc.primaryProgram = { _type: 'reference', _ref: 'new-program' };
const nativeSelection = await (await evaluate(parse(query), { dataset: documents })).get();
assert.equal(nativeSelection.settings.primaryProgramId, 'new-program');
delete settingsDoc.primaryProgram;
const unselected = await (await evaluate(parse(query), { dataset: documents })).get();
assert.equal(unselected.settings.primaryProgramId, '');
settingsDoc.primaryProgram = selected;
for (const program of fixture.programs) {
  const projected = result.programs.find((p) => p.id === program.id);
  assert.deepEqual(projected.instructorIds, program.instructorIds);
  assert.deepEqual(projected.workIds, program.workIds);
}
const projectedNew = result.programs.find((p) => p.id === 'new-program');
assert.deepEqual(projectedNew.modules, []);
assert.deepEqual(projectedNew.faqs, []);
assert.deepEqual(
  result.programs.find((p) => p.id === 'new-program-with-module').modules[0].topics,
  [],
);
const projectedIntake = result.offerings.find((o) => o.id === 'new-intake');
assert.equal(projectedIntake.programId, 'new-program');
assert.deepEqual(projectedIntake.packages[0].includes, []);
for (const image of result.images) assert.ok(image.width && image.height && image.src);
console.log(
  'Sanity GROQ projection validated against migrated documents, new programs and optional nested content.',
);
