import { test, expect } from '@playwright/test';
import film_data from '../../content/nyc_film_locations.json' with { type: 'json' };

const film_places = (film_id: string) =>
  film_data.locations.filter((place) =>
    place.scenes.some((scene) => scene.film_id === film_id),
  );
const woody_ids = new Set(
  film_data.films
    .filter((film) => film.director === 'Woody Allen')
    .map((film) => film.id),
);
const woody_count = film_data.locations.filter((place) =>
  place.scenes.some((scene) => woody_ids.has(scene.film_id)),
).length;
const scene_summary = (name: string) =>
  `summary.cinema-place-button[aria-label*="${name}"]`;

test.beforeEach(async ({ page }) => {
  await page.route('https://www.google.com/maps/embed/**', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><title>Map preview fixture</title>',
    }),
  );
});

test('film selection connects Google map, keyboard scene controls and real frames', async ({
  page,
}) => {
  await page.goto('/portfolio/nyc-film-map');
  await page.getByRole('button', { name: 'Pause film scrolling' }).click();
  const chooser = page.getByRole('combobox', {
    name: 'Choose a filming location',
  });
  const frame = page.locator('iframe.cinema-google-map');
  await expect(frame).toHaveCount(1);
  await expect(page.locator('.leaflet-container')).toHaveCount(0);
  await expect(page.locator('.cinema-place-list > li')).toHaveCount(
    film_data.locations.length,
  );
  await expect(chooser.locator('option')).toHaveCount(
    film_data.locations.length,
  );
  await chooser.selectOption('plaza');
  await expect(frame).toHaveAttribute('title', 'Google Maps: The Plaza Hotel');
  const plaza = page.getByRole('region', {
    name: 'Details for The Plaza Hotel',
  });
  await expect(plaza.locator('.cinema-still img')).toHaveCount(2);
  expect(
    await plaza
      .locator('.cinema-still img')
      .evaluateAll(
        (images) =>
          new Set(images.map((image) => image.getAttribute('src'))).size,
      ),
  ).toBe(2);
  await page
    .getByRole('button', { name: "You've Got Mail 1998", exact: true })
    .click();
  await expect(page.locator('.cinema-place-list > li')).toHaveCount(
    film_places('youve-got-mail').length,
  );
  await page
    .locator(scene_summary('The Shop Around the Corner'))
    .press('Enter');
  await page.locator(scene_summary('Café Lalo')).press('Enter');
  const details = page.getByRole('region', { name: 'Details for Café Lalo' });
  await expect(frame).toHaveAttribute('title', 'Google Maps: Café Lalo');
  await expect(chooser).toHaveValue('cafe-lalo');
  await expect(details).toContainText('vacated this address in 2024');
  await details.locator('.cinema-still img').scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      details
        .locator('.cinema-still img')
        .evaluate((image: HTMLImageElement) => image.naturalWidth),
    )
    .toBeGreaterThan(0);
  expect(
    new URL(
      (await details
        .getByRole('link', { name: 'Open in Google Maps' })
        .getAttribute('href'))!,
    ).searchParams.get('query'),
  ).toContain('201 West 83rd');
  await details.getByRole('button', { name: 'Show Café Lalo on map' }).click();
  await expect(
    page.getByRole('region', { name: 'Filming location map', exact: true }),
  ).toBeFocused();
  await details.getByRole('button', { name: 'Close location details' }).click();
  await expect(details).toBeHidden();
  await expect(frame).toHaveAttribute('title', 'Google Maps: Café Lalo');
  await page.locator(scene_summary('Café Lalo')).press('Space');
  await expect(details).toBeVisible();
  await page.getByRole('button', { name: 'Anora 2024', exact: true }).click();
  await expect(page.locator('.cinema-place-list > li')).toHaveCount(
    film_places('anora').length,
  );
  await expect(details).toHaveCount(0);
  await chooser.selectOption('tatiana');
  const tatiana = page.getByRole('region', {
    name: 'Details for Tatiana Restaurant & Nightclub',
  });
  await expect(tatiana).toContainText('3152 Brighton 6th Street');
  await expect(tatiana).toContainText(
    'A matching frame has not yet been confirmed',
  );
  await expect(tatiana.locator('.cinema-still img')).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('film filters, sequential locations, search reset and reduced motion remain usable', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/portfolio/nyc-film-map');
  const search = page.getByRole('searchbox', {
    name: 'Search films, directors or places',
  });
  const chooser = page.getByRole('combobox', {
    name: 'Choose a filming location',
  });
  const frame = page.locator('iframe.cinema-google-map');
  await search.fill('Woody Allen');
  await expect(page.locator('.cinema-place-list > li')).toHaveCount(
    woody_count,
  );
  await page
    .getByRole('button', { name: 'Manhattan 1979', exact: true })
    .click();
  await expect(chooser.locator('option')).toHaveCount(
    film_places('manhattan').length,
  );
  const manhattan_places = film_places('manhattan');
  await expect(chooser).toHaveValue(manhattan_places[0].id);
  await expect(
    page.getByRole('button', {
      name: 'Previous filming location',
      exact: true,
    }),
  ).toBeDisabled();
  await chooser.selectOption('sutton-square');
  await page.getByRole('button', { name: 'View scene', exact: true }).click();
  const sutton = page.getByRole('region', {
    name: 'Details for Sutton Square',
  });
  await expect(sutton).toBeFocused();
  await expect(sutton.locator('.cinema-still img')).toBeVisible();
  await expect(
    sutton.getByRole('link', { name: 'Frame source' }),
  ).toHaveAttribute('href', 'https://onthesetofnewyork.com/manhattan.html');
  await expect(sutton).toHaveCSS('animation-name', 'none');
  await page
    .getByRole('button', { name: 'Next filming location', exact: true })
    .click();
  const sutton_index = manhattan_places.findIndex(
    (place) => place.id === 'sutton-square',
  );
  await expect(chooser).toHaveValue(manhattan_places[sutton_index + 1].id);
  await page.goBack();
  await expect(chooser).toHaveValue('sutton-square');
  await expect(frame).toHaveAttribute('title', 'Google Maps: Sutton Square');
  const last = film_places('manhattan').at(-1)!;
  await chooser.selectOption(last.id);
  await expect(
    page.getByRole('button', { name: 'Next filming location', exact: true }),
  ).toBeDisabled();
  await search.fill('no such filming location');
  await expect(page.locator('.cinema-place-list > li')).toHaveCount(0);
  await expect(page.getByText('No places match this search.')).toBeVisible();
  await expect(frame).toHaveCount(0);
  await expect(
    page.locator('.cinema-map-panel .cinema-google-link'),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Explore all films' }).click();
  await expect(page.locator('.cinema-place-list > li')).toHaveCount(
    film_data.locations.length,
  );
  await expect(frame).toHaveCount(1);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('unavailable Google frame and scene image retain destinations and references', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('https://www.google.com/maps/embed/**', (route) =>
    route.abort(),
  );
  await page.route('**/images/film-map/*shop-around-corner*', (route) =>
    route.abort(),
  );
  await page.goto(
    '/portfolio/nyc-film-map?film=youve-got-mail&place=shop-around-corner',
  );
  const details = page.getByRole('region', {
    name: 'Details for The Shop Around the Corner',
  });
  await expect(details).toContainText('106 West 69th Street');
  await details.locator('.cinema-still').scrollIntoViewIfNeeded();
  await expect(details).toContainText(
    'Image unavailable. The filming reference is linked below.',
  );
  await expect(
    details.getByRole('link', { name: 'Open in Google Maps' }),
  ).toBeVisible();
  await expect(
    details.getByRole('link', { name: 'Filming reference' }),
  ).toHaveAttribute('href', 'https://onthesetofnewyork.com/youvegotmail.html');
  await expect(
    page.locator('.cinema-map-panel .cinema-google-link'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Reload map', exact: true }).click();
  await expect(page.locator('iframe.cinema-google-map')).toHaveCount(1);
});

test('the primary film map uses one free embed, no OSM requests and a keyless matching link', async ({
  page,
}) => {
  const osm_requests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('tile.openstreetmap.org'))
      osm_requests.push(request.url());
  });
  await page.goto('/portfolio/nyc-film-map');
  const frames = page.locator('iframe.cinema-google-map');
  await expect(frames).toHaveCount(1);
  expect(new URL(page.url()).searchParams.has('place')).toBe(false);
  const frame_url = new URL((await frames.getAttribute('src'))!);
  expect(frame_url.origin).toBe('https://www.google.com');
  expect(frame_url.pathname).toBe('/maps/embed/v1/place');
  expect(frame_url.searchParams.get('key')).toBe('maps-embed-test-only');
  expect(frame_url.searchParams.get('zoom')).toBe('16');
  const link_url = new URL(
    (await page
      .locator('.cinema-map-panel .cinema-google-link')
      .getAttribute('href'))!,
  );
  expect(link_url.searchParams.has('key')).toBe(false);
  expect(link_url.searchParams.get('query')).toBe(
    frame_url.searchParams.get('q'),
  );
  await page
    .getByRole('combobox', { name: 'Choose a filming location' })
    .selectOption('cafe-lalo');
  await expect(frames).toHaveCount(1);
  const selected_src = await frames.getAttribute('src');
  await page
    .locator('details[open]')
    .getByRole('button', { name: 'Close location details' })
    .click();
  await expect(frames).toHaveCount(1);
  await expect(frames).toHaveAttribute('src', selected_src!);
  expect(new URL(page.url()).searchParams.get('place')).toBe('cafe-lalo');
  await page.getByRole('searchbox').fill('zzzz-no-location');
  await expect(frames).toHaveCount(0);
  expect(osm_requests).toEqual([]);
});

test('film shelf motion pauses explicitly and place counts stay attached to films', async ({
  page,
}) => {
  await page.goto('/portfolio/nyc-film-map');
  await expect(
    page.getByRole('button', { name: 'Manhattan 1979', exact: true }),
  ).toContainText(`${film_places('manhattan').length} places`);
  const shelf = page.locator('.cinema-filmstrip');
  await expect
    .poll(() => shelf.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(10);
  await page.getByRole('button', { name: 'Pause film scrolling' }).click();
  const stopped = await shelf.evaluate((element) => element.scrollLeft);
  await page.waitForTimeout(350);
  expect(await shelf.evaluate((element) => element.scrollLeft)).toBeCloseTo(
    stopped,
    0,
  );
  await page.getByRole('button', { name: 'More films' }).click();
  await expect
    .poll(() => shelf.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(stopped + 100);
  await expect(
    page.getByRole('button', { name: 'Resume film scrolling' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Resume film scrolling' }).click();
  await expect(
    page.getByRole('button', { name: 'Pause film scrolling' }),
  ).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(
    page.getByRole('button', { name: 'Resume film scrolling' }),
  ).toBeDisabled();
});
