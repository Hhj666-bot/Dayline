import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validate, occurs, overlaps } from '../dist/model.mjs';
const base = {
  id: '1',
  title: '课程 / Course',
  category: 'course',
  date: '2026-09-10',
  start: '09:00',
  end: '10:00',
  repeat: true,
  until: '2026-12-10',
  location: '',
  notes: '',
};
test('重复范围与星期 / Recurrence bounds and weekday', () => {
  assert(occurs(base, '2026-09-17'));
  assert(!occurs(base, '2026-09-18'));
  assert(!occurs(base, '2026-09-03'));
  assert(!occurs(base, '2026-12-17'));
});
test('一次性与重复安排冲突 / Single and recurring overlap', () => {
  assert(
    overlaps(base, {
      ...base,
      id: '2',
      date: '2026-09-17',
      repeat: false,
      start: '09:30',
    }),
  );
  assert(!overlaps(base, { ...base, id: '2', start: '10:00', end: '11:00' }));
  assert(!overlaps(base, { ...base, id: '2', date: '2026-09-18' }));
  assert(!overlaps(base, { ...base, id: '2', date: '2027-01-07', until: '2027-02-01' }));
});
test('输入校验 / Input validation', () => {
  assert.throws(() => validate({ ...base, date: '2026-02-30' }));
  assert.throws(() => validate({ ...base, end: '08:00' }));
  assert.throws(() => validate({ ...base, until: '2026-01-01' }));
  assert.throws(() => validate({ ...base, title: ' ' }));
  assert.equal(validate(base), base);
});

import { layoutEvents, weekDates, exportWeek } from '../dist/model.mjs';
test('并排冲突与相邻时段 / Overlap lanes and adjacent events', () => {
  const items = layoutEvents([
    base,
    { ...base, id: '2', start: '09:30', end: '11:00' },
    { ...base, id: '3', start: '11:00', end: '12:00' },
  ]);
  assert.deepEqual(
    items.map((e) => [e.lane, e.columns]),
    [
      [0, 2],
      [1, 2],
      [0, 1],
    ],
  );
});
test('跨年周范围 / Week spanning years', () =>
  assert.deepEqual(weekDates('2027-01-01'), [
    '2026-12-28',
    '2026-12-29',
    '2026-12-30',
    '2026-12-31',
    '2027-01-01',
    '2027-01-02',
    '2027-01-03',
  ]));
test('日历导出范围、转义、中文折行 / Calendar scope, escaping and UTF-8 folding', () => {
  const output = exportWeek(
    [
      { ...base, title: '中文'.repeat(60), notes: 'a,b;c\nnext' },
      { ...base, id: '2', date: '2026-09-18', repeat: false },
    ],
    '2026-09-17',
    new Date('2026-01-01T00:00:00Z'),
  );
  assert.equal((output.match(/BEGIN:VEVENT/g) || []).length, 2);
  assert(output.includes('DTSTART:20260917T090000'));
  assert(!output.includes('RRULE'));
  assert(output.includes('DESCRIPTION:a\\,b\\;c\\nnext'));
  assert(output.split('\r\n').every((line) => Buffer.byteLength(line) <= 75));
  assert(output.replace(/\r\n /g, '').includes('SUMMARY:' + '中文'.repeat(60)));
});
