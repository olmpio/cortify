import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lerCookie } from '../utils/cookies.js';

test('lê cookie pelo nome', () => {
  const req = { headers: { cookie: 'a=1; cortify_rt_admin=abc%20def; b=2' } };
  assert.equal(lerCookie(req, 'cortify_rt_admin'), 'abc def');
  assert.equal(lerCookie(req, 'b'), '2');
  assert.equal(lerCookie(req, 'nao_existe'), null);
});

test('sem header ou com valor malformado não lança erro', () => {
  assert.equal(lerCookie({ headers: {} }, 'x'), null);
  assert.equal(lerCookie({ headers: { cookie: 'x=%E0%A4%A' } }, 'x'), null);
});

test('não confunde cookies com nomes parecidos', () => {
  assert.equal(lerCookie({ headers: { cookie: 'xcortify_rt_admin=ruim' } }, 'cortify_rt_admin'), null);
});
