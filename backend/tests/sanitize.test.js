import { test } from 'node:test';
import assert from 'node:assert/strict';
import { limpar, sanitizar } from '../middleware/sanitize.js';

test('remove operadores do MongoDB do corpo (login com {"$gt":""})', () => {
  const body = { email: { $gt: '' }, senha: { $ne: null }, ok: 'valor', aninhado: { a: { $where: '1' }, b: 2 } };
  limpar(body);
  assert.deepEqual(body.email, {});
  assert.deepEqual(body.senha, {});
  assert.equal(body.ok, 'valor');
  assert.deepEqual(body.aninhado, { a: {}, b: 2 });
});

test('remove chaves com ponto e prototype pollution', () => {
  const body = JSON.parse('{"a.b": 1, "__proto__": {"admin": true}, "constructor": {"x": 1}, "limpo": 1}');
  limpar(body);
  assert.deepEqual(Object.keys(body), ['limpo']);
  assert.equal({}.admin, undefined);
});

test('middleware: query duplicada vira o último valor e operadores somem', () => {
  const req = { query: { data: ['2026-01-01', '2026-02-02'], 'status[$ne]': 'x', $where: 'y' }, body: { $or: [] } };
  let seguiu = false;
  sanitizar(req, {}, () => { seguiu = true; });
  assert.ok(seguiu);
  assert.equal(req.query.data, '2026-02-02');
  assert.equal(req.query.$where, undefined);
  assert.deepEqual(req.body, {});
});

test('profundidade excessiva é cortada (evita DoS por objeto gigante)', () => {
  let o = {};
  const raiz = o;
  for (let i = 0; i < 50; i++) { o.x = {}; o = o.x; }
  assert.doesNotThrow(() => limpar(raiz));
});
