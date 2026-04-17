import * as migration_20260417_053937_initial from './20260417_053937_initial';

export const migrations = [
  {
    up: migration_20260417_053937_initial.up,
    down: migration_20260417_053937_initial.down,
    name: '20260417_053937_initial'
  },
];
