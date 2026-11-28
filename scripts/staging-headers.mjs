// On the staging site (STAGING=1) tell search engines not to index anything,
// so staging never competes with zanzibiz.com in search results.
import { appendFileSync } from 'node:fs';
if (process.env.STAGING === '1') {
  appendFileSync('dist/_headers', '\n/*\n  X-Robots-Tag: noindex, nofollow\n');
  console.log('staging: added noindex header');
}
