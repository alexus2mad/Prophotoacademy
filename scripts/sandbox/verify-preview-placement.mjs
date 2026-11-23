import assert from 'node:assert/strict';
import { chromium, expect } from '@playwright/test';

// Run against a learning sandbox. Every edit stays in this browser's working copy.
const port = Number(process.argv[2] || 3200);
assert.ok(Number.isInteger(port) && port > 0 && port <= 65535, 'Expected a local sandbox port');
const origin = 'http://127.0.0.1:' + port;
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome' });

async function screenCenter(control) {
  return control.evaluate((node) => {
    const view = node.ownerDocument.defaultView;
    const frame = view.frameElement.getBoundingClientRect();
    const rect = node.getBoundingClientRect();
    return {
      x: frame.left + ((rect.left + rect.width / 2) * frame.width) / view.innerWidth,
      y: frame.top + ((rect.top + rect.height / 2) * frame.height) / view.innerHeight,
    };
  });
}

try {
  const context = await browser.newContext({
    baseURL: origin,
    viewport: { width: 1440, height: 1000 },
  });
  const email = 'manager@example.test';
  for (const [action, data] of [
    ['send', { email }],
    ['verify', { email, code: '123456' }],
  ]) {
    const res = await context.request.post('/api/auth/' + action, {
      headers: { Origin: origin },
      data,
    });
    assert.equal(res.status(), 200, 'Sandbox login ' + action);
  }
  const page = await context.newPage();
  await page.goto('/admin/content?page=%2Fabout-us');
  const frame = page.frameLocator('iframe[title^="Попередній перегляд"]');
  const slot = frame.locator('[data-site-placement="figures"]');
  const end = slot.locator('[data-canvas-boundary]:not([data-canvas-before])');
  const grips = slot.locator('[data-canvas-grip]');
  async function add(label) {
    const count = await grips.count();
    await end.click();
    await page
      .getByRole('dialog', { name: 'Додати блок' })
      .getByRole('button', { name: new RegExp('^' + label) })
      .click();
    await expect(grips).toHaveCount(count + 1);
    return grips.last().getAttribute('data-canvas-grip');
  }
  await expect(end).toBeVisible();
  const first = await add('Заголовок');
  const second = await add('Абзац');
  const handle = slot.locator('[data-canvas-grip="' + second + '"]');
  const beforeFirst = slot.locator('[data-canvas-before="' + first + '"]');
  await handle.evaluate((node) => node.scrollIntoView({ block: 'center', behavior: 'instant' }));

  // Deliver native input without Playwright's HTML drag interception in the scriptless iframe.
  const input = await context.newCDPSession(page);
  async function drag(cancel) {
    const start = await screenCenter(handle);
    const finish = await screenCenter(beforeFirst);
    await input.send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...start });
    await input.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      ...start,
      button: 'left',
      buttons: 1,
      clickCount: 1,
    });
    try {
      await input.send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...finish, buttons: 1 });
      await expect(beforeFirst).toHaveAttribute('data-drop-active', '');
      if (cancel) await page.keyboard.press('Escape');
    } finally {
      await input.send('Input.dispatchMouseEvent', {
        type: 'mouseReleased',
        ...finish,
        button: 'left',
        clickCount: 1,
      });
    }
  }
  const lastTwo = () =>
    grips.evaluateAll((nodes) => nodes.slice(-2).map((node) => node.dataset.canvasGrip));
  await drag(true);
  await expect.poll(lastTwo).toEqual([first, second]);
  await drag(false);
  await expect.poll(lastTwo).toEqual([second, first]);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  console.log(
    'PASS: inline insertion, canceled drag, and mouse reordering in the scaled page preview.',
  );
} finally {
  await browser.close();
}
