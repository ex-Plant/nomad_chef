import * as migration_20260417_053937_initial from './20260417_053937_initial';
import * as migration_20260417_071129 from './20260417_071129';
import * as migration_20260417_080512_site_schema_rich from './20260417_080512_site_schema_rich';

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
    name: '20260417_080512_site_schema_rich'
  },
];
