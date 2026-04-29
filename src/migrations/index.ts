import * as migration_20260417_053937_initial from './20260417_053937_initial';
import * as migration_20260417_071129 from './20260417_071129';
import * as migration_20260417_080512_site_schema_rich from './20260417_080512_site_schema_rich';
import * as migration_20260418_093504_hero_media_and_galleries from './20260418_093504_hero_media_and_galleries';
import * as migration_20260420_075551 from './20260420_075551';
import * as migration_20260427_065344_camp_food_slide_theme_orientation from './20260427_065344_camp_food_slide_theme_orientation';
import * as migration_20260429_110034 from './20260429_110034';
import * as migration_20260429_112256 from './20260429_112256';
import * as migration_20260429_112839 from './20260429_112839';
import * as migration_20260429_113419 from './20260429_113419';
import * as migration_20260429_120000_drop_hero_media from './20260429_120000_drop_hero_media';

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
    name: '20260420_075551',
  },
  {
    up: migration_20260427_065344_camp_food_slide_theme_orientation.up,
    down: migration_20260427_065344_camp_food_slide_theme_orientation.down,
    name: '20260427_065344_camp_food_slide_theme_orientation',
  },
  {
    up: migration_20260429_110034.up,
    down: migration_20260429_110034.down,
    name: '20260429_110034',
  },
  {
    up: migration_20260429_112256.up,
    down: migration_20260429_112256.down,
    name: '20260429_112256',
  },
  {
    up: migration_20260429_112839.up,
    down: migration_20260429_112839.down,
    name: '20260429_112839',
  },
  {
    up: migration_20260429_113419.up,
    down: migration_20260429_113419.down,
    name: '20260429_113419',
  },
  {
    up: migration_20260429_120000_drop_hero_media.up,
    down: migration_20260429_120000_drop_hero_media.down,
    name: '20260429_120000_drop_hero_media'
  },
];
