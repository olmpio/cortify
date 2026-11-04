import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lerDataUrl } from '../utils/imagem.js';

const dataUrl = (tipo, bytes) => `data:${tipo};base64,${Buffer.from(bytes).toString('base64')}`;
const JPEG = [0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0];
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

test('aceita JPEG e PNG reais', () => {
  assert.equal(lerDataUrl(dataUrl('image/jpeg', JPEG)).tipo, 'image/jpeg');
  assert.equal(lerDataUrl(dataUrl('image/png', PNG)).tipo, 'image/png');
});

test('rejeita SVG (pode conter script) e outros tipos', () => {
  assert.throws(() => lerDataUrl(dataUrl('image/svg+xml', Buffer.from('<svg onload=alert(1)>'))), /Formato inválido/);
  assert.throws(() => lerDataUrl(dataUrl('text/html', Buffer.from('<script>'))), /Formato inválido/);
});

test('rejeita arquivo com tipo mentiroso (HTML disfarçado de JPEG)', () => {
  assert.throws(() => lerDataUrl(dataUrl('image/jpeg', Buffer.from('<script>alert(1)</script>'))), /não parece/);
});

test('rejeita imagem acima de 700 KB e entradas inválidas', () => {
  assert.throws(() => lerDataUrl(dataUrl('image/jpeg', [...JPEG, ...new Array(800 * 1024).fill(0)])), /muito grande/);
  assert.throws(() => lerDataUrl(undefined), /imagem válida/);
  assert.throws(() => lerDataUrl({ $gt: '' }), /imagem válida/);
  assert.throws(() => lerDataUrl('data:image/jpeg;base64,@@@'), /Formato inválido/);
});
