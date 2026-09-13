import { expect, type Page } from '@playwright/test';
import music from '../../content/music.json' with { type: 'json' };

// A real, twelve-second PCM WAV. Chromium decodes and plays it normally;
// tests never replace HTMLMediaElement methods or synthesize media events.
export function preview_audio() {
  const rate = 8000;
  const samples = rate * 12;
  const wav = Buffer.alloc(44 + samples * 2);
  wav.write('RIFF', 0);
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(rate, 24);
  wav.writeUInt32LE(rate * 2, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write('data', 36);
  wav.writeUInt32LE(samples * 2, 40);
  for (let i = 0; i < samples; i++)
    wav.writeInt16LE(
      Math.round(Math.sin((2 * Math.PI * 220 * i) / rate) * 1000),
      44 + i * 2,
    );
  return wav;
}

export async function open_home(page: Page, unavailable?: string) {
  const previews = new Set(music.map((track) => track.previewUrl));
  const wav = preview_audio();
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (url === unavailable) return route.abort('failed');
    if (previews.has(url))
      return route.fulfill({ contentType: 'audio/wav', body: wav });
    return new URL(url).origin === 'http://127.0.0.1:4173'
      ? route.continue()
      : route.abort();
  });
  await page.goto('/');
  // ImageStatus changes this attribute after hydration, including cached loads.
  await expect(page.locator('.arrival-scene')).toHaveAttribute(
    'data-image-state',
    'loaded',
  );
  await page.evaluate(() => document.fonts.ready);
}

export async function expect_loaded_images(page: Page, selector: string) {
  await expect
    .poll(() =>
      page
        .locator(selector)
        .evaluateAll(
          (images) =>
            images.length > 0 &&
            images.every(
              (image) =>
                image instanceof HTMLImageElement &&
                image.complete &&
                image.naturalWidth > 0,
            ),
        ),
    )
    .toBe(true);
}
