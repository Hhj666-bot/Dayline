import { test } from 'node:test';
import assert from 'node:assert/strict';
import { singlePagePdf } from '../dist/pdf.mjs';

test('单页 PDF 交叉引用与页面尺寸 / PDF offsets and page dimensions', async () => {
  const blob = singlePagePdf(new Uint8Array([255, 216, 255, 217]), 2526, 1786);
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const text = new TextDecoder('latin1').decode(bytes);
  assert.equal(blob.type, 'application/pdf');
  assert.match(text, /\/Count 1/);
  assert.match(text, /\/MediaBox \[0 0 841.89 595.28\]/);
  const xref = Number(text.match(/startxref\n(\d+)/)[1]);
  assert.equal(new TextDecoder().decode(bytes.slice(xref, xref + 4)), 'xref');
  const entries = text.slice(text.indexOf('0000000000 65535 f')).split('\n');
  for (let id = 1; id <= 5; id++) {
    const offset = Number(entries[id].slice(0, 10));
    assert.equal(new TextDecoder().decode(bytes.slice(offset, offset + 7)), `${id} 0 obj`);
  }
  assert.throws(() => singlePagePdf(new Uint8Array([0]), 10, 10));
});
