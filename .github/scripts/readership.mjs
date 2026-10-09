// Reads the public Flag Counter statistics for this site and writes readership.json.
// Runs hourly in GitHub Actions; the page reads the JSON from the same site.
// If anything goes wrong, it exits non-zero and the workflow keeps the last good file.
import { writeFileSync } from 'node:fs';

const SOURCE = process.env.FC_SOURCE || 'http://s01.flagcounter.com/countries/8r6o/';
const OUT = process.argv[2] || 'readership.json';

const html = SOURCE.startsWith('http')
  ? await (await fetch(SOURCE, { headers: { 'User-Agent': 'Mozilla/5.0 (readership snapshot for nishkeni.github.io)' } })).text()
  : (await import('node:fs')).readFileSync(SOURCE, 'utf8');

const now = new Date();
// "9 minutes ago", "3 hours ago", "October 2, 2026"
function whenOf(text) {
  const t = text.trim();
  const rel = t.match(/^(\d+)\s+(second|minute|hour|day)s?\s+ago$/i);
  if (rel) {
    const ms = { second: 1e3, minute: 6e4, hour: 36e5, day: 864e5 }[rel[2].toLowerCase()];
    return { at: new Date(now - rel[1] * ms).toISOString(), exact: true };
  }
  if (/^yesterday$/i.test(t)) return { at: new Date(now - 864e5).toISOString(), exact: false };
  const d = new Date(t + ' 12:00 UTC');
  return isNaN(d) ? null : { at: d.toISOString(), exact: false };
}

const rowRe = /<a href=\/factbook\/(\w+)\/8r6o[^>]*><u>([^<]+)<\/u><\/a><\/font><\/td><td width=1%><font face=arial size=2>([\d,]+)<\/font><\/td>.*?<td>([^<]*?)<\/td><\/tr>/gs;
const rows = [...html.matchAll(rowRe)].map(m => ({ code: m[1], name: m[2].trim(), readers: +m[3].replace(/,/g, ''), last: whenOf(m[4]) }));

if (rows.length < 10) { console.error(`Parsed only ${rows.length} countries; page layout may have changed.`); process.exit(1); }

const latest = rows.filter(r => r.last).sort((a, b) => b.last.at.localeCompare(a.last.at))[0];
const data = {
  updated: now.toISOString(),
  since: '2023-01',
  readers: rows.reduce((s, r) => s + r.readers, 0),
  countries: rows.length,
  top: rows.slice().sort((a, b) => b.readers - a.readers).slice(0, 5).map(({ name, readers }) => ({ name, readers })),
  last: latest ? { country: latest.name, at: latest.last.at, exact: latest.last.exact } : null,
};
writeFileSync(OUT, JSON.stringify(data, null, 2) + '\n');
console.log(`readership: ${data.readers} readers, ${data.countries} countries, last from ${data.last?.country}`);
