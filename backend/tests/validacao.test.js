import { test } from 'node:test';
import assert from 'node:assert/strict';
import { senhaForte, emailValido, nomeValido, telefoneValido, dataValida, horaValida, pick, paraMinutos, sha256 } from '../utils/validacao.js';

test('senhaForte: aceita senha boa e rejeita as fracas', () => {
  assert.equal(senhaForte('Barba!2026x'), null);
  assert.match(senhaForte('curta1'), /8 caracteres/);
  assert.match(senhaForte('somenteletras'), /letras e números/);
  assert.match(senhaForte('123456789012'), /letras e números/);
  assert.match(senhaForte('password123'), /comum/);
  assert.match(senhaForte('DEMO1234'), /comum/); // senha do seed não pode ser usada em contas reais
  assert.match(senhaForte('x'.repeat(40) + 'é'.repeat(20) + '1'), /72/); // limite do bcrypt é em BYTES
  assert.equal(senhaForte(undefined), 'A senha deve ter pelo menos 8 caracteres');
  assert.equal(senhaForte({ $gt: '' }), 'A senha deve ter pelo menos 8 caracteres'); // objeto malicioso
});

test('senhaForte: não aceita senha que contém o e-mail', () => {
  assert.match(senhaForte('joaosilva2026', { email: 'joaosilva@x.com' }), /e-mail/);
  assert.equal(senhaForte('OutraCoisa2026', { email: 'joaosilva@x.com' }), null);
});

test('emailValido', () => {
  assert.ok(emailValido('a@b.co'));
  assert.ok(!emailValido('sem-arroba'));
  assert.ok(!emailValido('a b@c.com'));
  assert.ok(!emailValido({ $ne: null })); // injeção NoSQL: objeto no lugar de string
  assert.ok(!emailValido('a@b.co' + 'x'.repeat(260)));
});

test('nomeValido rejeita caracteres de controle (injeção em logs/e-mails) e tamanhos extremos', () => {
  assert.ok(nomeValido('Carlos da Silva'));
  assert.ok(!nomeValido('A'));
  assert.ok(!nomeValido('Carlos\r\nBcc: x@y.com'));
  assert.ok(!nomeValido('x'.repeat(101)));
  assert.ok(!nomeValido(123));
});

test('telefoneValido', () => {
  assert.ok(telefoneValido('(11) 98765-4321'));
  assert.ok(!telefoneValido('123'));
  assert.ok(!telefoneValido('1'.repeat(31)));
});

test('data e hora', () => {
  assert.ok(dataValida('2026-10-31'));
  assert.ok(!dataValida('31/10/2026'));
  assert.ok(!dataValida({ $gt: '' }));
  assert.ok(horaValida('09:30'));
  assert.ok(!horaValida('24:00'));
  assert.equal(paraMinutos('10:30'), 630);
});

test('pick só copia as chaves permitidas (anti mass assignment)', () => {
  const r = pick({ nome: 'x', barbeariaId: 'ATACANTE', _id: 'y' }, ['nome']);
  assert.deepEqual(r, { nome: 'x' });
});

test('sha256 é determinístico', () => {
  assert.equal(sha256('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});
