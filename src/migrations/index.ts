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
import * as migration_20260429_135751 from './20260429_135751';
import * as migration_20260429_165221 from './20260429_165221';
import * as migration_20260429_165721 from './20260429_165721';
import * as migration_20260429_170049 from './20260429_170049';
import * as migration_20260501_133613 from './20260501_133613';
import * as migration_20260501_140643 from './20260501_140643';
import * as migration_20260501_142806 from './20260501_142806';
import * as migration_20260510_171623_add_legal_pages from './20260510_171623_add_legal_pages';
import * as migration_20260510_172312_add_contact_legal from './20260510_172312_add_contact_legal';
import * as migration_20260510_174507_add_legal_link_label from './20260510_174507_add_legal_link_label';
import * as migration_20260511_080953_description_to_textarea from './20260511_080953_description_to_textarea';
import * as migration_20260516_122032_digital_delivery from './20260516_122032_digital_delivery';
import * as migration_20260516_132215 from './20260516_132215';
import * as migration_20260517_125241_digital_assets_collection from './20260517_125241_digital_assets_collection';
import * as migration_20260517_140000_drop_download_count_fields from './20260517_140000_drop_download_count_fields';
import * as migration_20260517_150000_add_inventory_policy from './20260517_150000_add_inventory_policy';
import * as migration_20260517_191348_check_drift from './20260517_191348_check_drift';

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
    name: '20260429_120000_drop_hero_media',
  },
  {
    up: migration_20260429_135751.up,
    down: migration_20260429_135751.down,
    name: '20260429_135751',
  },
  {
    up: migration_20260429_165221.up,
    down: migration_20260429_165221.down,
    name: '20260429_165221',
  },
  {
    up: migration_20260429_165721.up,
    down: migration_20260429_165721.down,
    name: '20260429_165721',
  },
  {
    up: migration_20260429_170049.up,
    down: migration_20260429_170049.down,
    name: '20260429_170049',
  },
  {
    up: migration_20260501_133613.up,
    down: migration_20260501_133613.down,
    name: '20260501_133613',
  },
  {
    up: migration_20260501_140643.up,
    down: migration_20260501_140643.down,
    name: '20260501_140643',
  },
  {
    up: migration_20260501_142806.up,
    down: migration_20260501_142806.down,
    name: '20260501_142806',
  },
  {
    up: migration_20260510_171623_add_legal_pages.up,
    down: migration_20260510_171623_add_legal_pages.down,
    name: '20260510_171623_add_legal_pages',
  },
  {
    up: migration_20260510_172312_add_contact_legal.up,
    down: migration_20260510_172312_add_contact_legal.down,
    name: '20260510_172312_add_contact_legal',
  },
  {
    up: migration_20260510_174507_add_legal_link_label.up,
    down: migration_20260510_174507_add_legal_link_label.down,
    name: '20260510_174507_add_legal_link_label',
  },
  {
    up: migration_20260511_080953_description_to_textarea.up,
    down: migration_20260511_080953_description_to_textarea.down,
    name: '20260511_080953_description_to_textarea',
  },
  {
    up: migration_20260516_122032_digital_delivery.up,
    down: migration_20260516_122032_digital_delivery.down,
    name: '20260516_122032_digital_delivery',
  },
  {
    up: migration_20260516_132215.up,
    down: migration_20260516_132215.down,
    name: '20260516_132215',
  },
  {
    up: migration_20260517_125241_digital_assets_collection.up,
    down: migration_20260517_125241_digital_assets_collection.down,
    name: '20260517_125241_digital_assets_collection',
  },
  {
    up: migration_20260517_140000_drop_download_count_fields.up,
    down: migration_20260517_140000_drop_download_count_fields.down,
    name: '20260517_140000_drop_download_count_fields',
  },
  {
    up: migration_20260517_150000_add_inventory_policy.up,
    down: migration_20260517_150000_add_inventory_policy.down,
    name: '20260517_150000_add_inventory_policy',
  },
  {
    up: migration_20260517_191348_check_drift.up,
    down: migration_20260517_191348_check_drift.down,
    name: '20260517_191348_check_drift'
  },
];
