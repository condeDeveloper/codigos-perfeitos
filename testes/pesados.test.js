import test from 'node:test';
import assert from 'node:assert/strict';

import { NOMEADOS, linhaCubo, linhaNomeado } from '../js/medidas.js';
import { cubo, ehCodigoPerfeito, contaBits } from '../js/nucleo.js';
import { codigos } from '../js/busca.js';

// O Q7 tem 128 vertices. A forca bruta precisaria de 2^128 subconjuntos;
// a cobertura exata acha os 240 codigos em 24.392 nos.

const MINUTOS = 10 * 60 * 1000;

test('Q7 tem 240 codigos perfeitos, todos de 16 vertices', { timeout: MINUTOS }, () => {
  const r = linhaCubo(7);
  assert.equal(r.n, 128);
  assert.equal(r.peneira, true);
  assert.equal(r.forcado, 16);
  assert.equal(r.quantos, 240);
  assert.deepEqual(r.tamanhos, [16]);
});

test('o codigo de Hamming e um dos 240, e esta longe de ser o unico', { timeout: MINUTOS }, () => {
  const r = linhaCubo(7);
  assert.equal(r.temHamming, true);
  assert.equal(r.tamanhoDeHamming, 16);
  assert.equal(r.hammingEstaLa, true);
  assert.equal(r.quantos, 240);
});

test('todos os 240 cobrem o cubo exatamente uma vez, e nenhum sai repetido', { timeout: MINUTOS }, () => {
  const g = cubo(7);
  const lista = codigos(g).codigos;
  assert.equal(lista.length, 240);
  for (const c of lista) {
    assert.equal(contaBits(c), 16);
    assert.ok(ehCodigoPerfeito(g, c));
  }
  assert.equal(new Set(lista.map(String)).size, 240);
});

test('a busca do Q7 custa 24.392 nos', { timeout: MINUTOS }, () => {
  const r = codigos(cubo(7));
  assert.equal(r.nos, 24392);
  assert.equal(r.quantos, 240);
});

test('Q6, com 64 vertices, nao tem nenhum, e a peneira ja sabia', { timeout: MINUTOS }, () => {
  const r = linhaCubo(6);
  assert.equal(r.n, 64);
  assert.equal(r.peneira, false);
  assert.equal(r.quantos, 0);
});

const CATALOGO = {
  K5: [true, 5], K8: [true, 8], 'cubo Q3': [true, 4],
  Petersen: [false, 0], Heawood: [false, 0], 'Mobius-Kantor': [true, 4],
  Pappus: [false, 0], Desargues: [true, 0], Nauru: [true, 4], Dyck: [true, 16],
};

test('o catalogo de nome proprio: quem passa na peneira e quem tem codigo', { timeout: MINUTOS }, () => {
  assert.equal(NOMEADOS.length, 10);
  for (const [nome, faz] of NOMEADOS) {
    const [peneira, quantos] = CATALOGO[nome];
    const r = linhaNomeado(nome, faz);
    assert.equal(r.peneira, peneira, nome + ' peneira');
    assert.equal(r.quantos, quantos, nome + ' codigos');
  }
});

test('o Desargues e o contraexemplo: passa na peneira e nao tem nada', { timeout: MINUTOS }, () => {
  const r = linhaNomeado('Desargues', NOMEADOS.find(([n]) => n === 'Desargues')[1]);
  assert.equal(r.n, 20);
  assert.equal(r.grau, 3);
  assert.equal(r.peneira, true);
  assert.equal(r.forcado, 5, 'se existisse, teria 5 vertices');
  assert.equal(r.quantos, 0);
});

test('o Dyck, com 32 vertices, tem 16 codigos de 8 vertices', { timeout: MINUTOS }, () => {
  const r = linhaNomeado('Dyck', NOMEADOS.find(([n]) => n === 'Dyck')[1]);
  assert.equal(r.n, 32);
  assert.equal(r.grau, 3);
  assert.equal(r.quantos, 16);
  assert.deepEqual(r.tamanhos, [8]);
});
