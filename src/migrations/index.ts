import * as migration_20260417_053937_initial from './20260417_053937_initial';
import * as migration_20260417_071129 from './20260417_071129';
import * as migration_20260417_080512_site_schema_rich from './20260417_080512_site_schema_rich';
import * as migration_20260418_093504_hero_media_and_galleries from './20260418_093504_hero_media_and_galleries';
import * as migration_20260420_075551 from './20260420_075551';

export const migrations = [
  {
    up: migration_20260417_053937_initial.up,
    down: migration_20260417_053937_initial.down,
    name: '20260417_053937_initial',
  },
  {
    up: migration_20260417_071129.up,
    down: migration_20260417_071129.down,
    name: '20260417_071129',
  },
  {
    up: migration_20260417_080512_site_schema_rich.up,
    down: migration_20260417_080512_site_schema_rich.down,
    name: '20260417_080512_site_schema_rich',
  },
  {
    up: migration_20260418_093504_hero_media_and_galleries.up,
    down: migration_20260418_093504_hero_media_and_galleries.down,
    name: '20260418_093504_hero_media_and_galleries',
  },
  {
    up: migration_20260420_075551.up,
    down: migration_20260420_075551.down,
    name: '20260420_075551'
  },
];
