import { readdir, writeFile } from 'node:fs/promises';
const directory = new URL('../../.data/learning-sandbox/', import.meta.url);
const captions = {
  '01-sandbox-guide': 'Local guide and synthetic accounts',
  '02-manager-course-creation': 'Manager chooses the test program',
  '03-lesson-editor-with-workbook': 'Lesson text and processed PDF workbook',
  '04-publish-confirmation': 'Explicit publication of an immutable version',
  '05-grant-student-access': 'ps-booking grants access without taking payment',
  '06-pending-student-enrollment': 'Enrollment exists before the student signs in',
  '07-student-course-access': 'Verified email claims the pending course',
  '08-student-lesson-and-pdf': 'Authorized lesson with the integrated PDF reader',
  '09-completion-persisted': 'Student-confirmed completion survives refresh',
  '10-manager-student-progress': 'The same progress appears in ps-booking',
  '11-revoked-access-denied': 'Revocation blocks the lesson — original generic error',
  '12-student-mobile-390': 'Student lesson at 390px',
  '13-mobile-curriculum-drawer': 'Accessible mobile curriculum; Escape closes it',
  '14-student-360': 'Student lesson at 360px',
  '14-student-768': 'Student lesson at 768px',
  '14-student-1024': 'Student lesson at 1024px',
  '14-student-1440': 'Student lesson at 1440px',
  '15-unavailable-lesson-improved': 'Improved unavailable-lesson screen with a route back',
  '16-manager-overview-restored': 'Manager statistics persist after restarting',
  '17-student-restored-dashboard': 'Restored enrollment retains 100% progress after restarting',
};
const files = (await readdir(new URL('screenshots/', directory)))
  .filter((file) => /^\d{2}-[a-z0-9-]+\.jpg$/.test(file))
  .sort();
const escape = (text) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const cards = files
  .map((file) => {
    const caption = captions[file.replace('.jpg', '')] || file;
    return `<figure><a href="screenshots/${file}"><img loading="lazy" src="screenshots/${file}" alt="${escape(caption)}"></a><figcaption>${escape(caption)}<small>${file}</small></figcaption></figure>`;
  })
  .join('\n');
await writeFile(
  new URL('walkthrough.html', directory),
  `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ProPhoto — learning walkthrough</title><style>body{margin:0;background:#101211;color:#f2efe7;font:16px/1.6 system-ui,sans-serif}main{max-width:1280px;margin:auto;padding:48px 24px}h1{font-size:clamp(28px,4vw,44px);line-height:1.2}a{color:#d5e4b9}p{max-width:850px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px}figure{margin:0;background:#191c1a;border-radius:12px;overflow:hidden}img{display:block;width:100%;height:300px;object-fit:cover;object-position:top}figcaption{padding:20px}small{display:block;color:#b4b9b1;margin-top:8px;overflow-wrap:anywhere}code{color:#d5e4b9}</style><main><h1>ProPhoto learning walkthrough</h1><p>Manager → course draft → text and PDF → publish → pending email access → student lesson → completion → revoke and restore. ${files.length} saved screenshots from the local test environment.</p><p><strong>No payments or external emails.</strong> Test records survive restarts. Provider-backed email, video, image and Zoom workflows were not verified in this walkthrough. The improved unavailable-lesson screen replaces the generic error captured earlier.</p><p><a href="http://127.0.0.1:3200/sandbox">Open local sandbox</a> · <a href="verification.json">API boundary checks</a> · <a href="screenshots/responsive.json">Responsive measurements</a></p><p>Accounts: <code>manager@example.test</code> and <code>student@example.test</code>. Local code: <code>123456</code>. Click a screenshot to open the original.</p><div class="grid">${cards}</div></main></html>`,
);
console.log(`Saved walkthrough with ${files.length} screenshots`);
