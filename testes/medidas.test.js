import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ATE_CICLO, ATE_CAMINHO, LADOS_DA_GRADE, NOMEADOS,
  linhaCiclo, linhaCaminho, linhaGrade, linhaToro, linhaCubo, linhaNomeado,
  contaDaPeneira, linhaForcaBruta, ondeNaGrade,
} from '../js/medidas.js';
import { ciclo, grade, cubo, toro, petersen } from '../js/nucleo.js';

// Os numeros do README, presos. O Q7 esta em `pesados.test.js`.

const MINUTOS = 10 * 60 * 1000;

/* ------------------------------------------------------- ciclos e caminhos */

test('o ciclo so tem codigo quando 3 divide n, e ai sao 3 codigos', { timeout: MINUTOS }, () => {
  const comCodigo = [];
  for (let n = 3; n <= ATE_CICLO; n++) {
    const r = linhaCiclo(n);
    assert.equal(r.bate, true, 'C' + n + ' divergiu da conta');
    assert.equal(r.existe, n % 3 === 0, 'C' + n);
    if (r.existe) {
      assert.equal(r.quantos, 3, 'C' + n);
      assert.deepEqual(r.tamanhos, [n / 3], 'C' + n);
      comCodigo.push(n);
    }
  }
  assert.deepEqual(comCodigo, [3, 6, 9, 12, 15, 18, 21, 24]);
});

test('o caminho SEMPRE tem codigo, e sao 2 quando n deixa resto 2', { timeout: MINUTOS }, () => {
  for (let n = 1; n <= ATE_CAMINHO; n++) {
    const r = linhaCaminho(n);
    assert.equal(r.bate, true, 'P' + n);
    assert.equal(r.existe, true, 'P' + n + ' ficou sem codigo');
    assert.equal(r.quantos, n % 3 === 2 ? 2 : 1, 'P' + n);
  }
});

/* ------------------------------------------------------------- as grades */

test('nas 36 grades ate 8x8, so 12 tem codigo', { timeout: MINUTOS }, () => {
  const tem = ondeNaGrade();
  assert.equal(LADOS_DA_GRADE, 8);
  assert.equal(tem.length, 12);
  assert.deepEqual(tem.map((x) => x.m + 'x' + x.n),
    ['1x1', '1x2', '1x3', '1x4', '1x5', '1x6', '1x7', '1x8', '2x3', '2x5', '2x7', '4x4']);
});

test('a faixa 2 x n so tem codigo com n impar; a 3 x n so tem no 3 x 2', { timeout: MINUTOS }, () => {
  // Eu tinha escrito "a 3 x n NUNCA tem", lendo a tabela que so mostra
  // n >= m. A grade 3 x 2 e a 2 x 3 deitada, e tem dois codigos: a tabela
  // truncada escondia justamente a coluna que derrubava a frase.
  for (let n = 2; n <= 8; n++) {
    assert.equal(linhaGrade(2, n).existe, n % 2 === 1, '2x' + n);
  }
  assert.equal(linhaGrade(2, 3).existe, true, 'a 3 x 2 deitada');
  for (let n = 3; n <= 8; n++) {
    assert.equal(linhaGrade(3, n).existe, false, '3x' + n);
  }
});

test('o 4x4 e a unica grade quadrada de lado 2 a 8 com codigo', { timeout: MINUTOS }, () => {
  const quadradas = [];
  for (let k = 2; k <= 8; k++) if (linhaGrade(k, k).existe) quadradas.push(k);
  assert.deepEqual(quadradas, [4]);
  const r = linhaGrade(4, 4);
  assert.equal(r.quantos, 2);
  assert.deepEqual(r.tamanhos, [4]);
});

/* -------------------------------------------------------------- os toros */

test('de todos os toros ate 8x8, so o 5x5 tem codigo', { timeout: MINUTOS }, () => {
  const tem = [];
  for (let m = 3; m <= 8; m++) {
    for (let n = m; n <= 8; n++) if (linhaToro(m, n).existe) tem.push(m + 'x' + n);
  }
  assert.deepEqual(tem, ['5x5']);
  const r = linhaToro(5, 5);
  assert.equal(r.quantos, 10);
  assert.deepEqual(r.tamanhos, [5]);
  assert.equal(r.forcado, 5);
});

/* -------------------------------------------------------------- a peneira */

test('a peneira passa em 13 casos, e em 6 deles nao existe codigo', { timeout: MINUTOS }, () => {
  const c = contaDaPeneira();
  assert.equal(c.passam, 13);
  assert.equal(c.tem, 7);
  assert.equal(c.naoTem, 6);
  assert.deepEqual(c.casos.filter((x) => !x.existe).map((x) => x.qual),
    ['toro 3x5', 'toro 4x5', 'toro 5x6', 'toro 5x7', 'toro 5x8', 'Desargues']);
});

test('quando a peneira barra, a busca nunca acha nada', { timeout: MINUTOS }, () => {
  let barrados = 0;
  for (const [nome, faz] of NOMEADOS) {
    const r = linhaNomeado(nome, faz);
    if (r.peneira === false) { barrados++; assert.equal(r.existe, false, nome); }
  }
  assert.equal(barrados, 3, 'Petersen, Heawood e Pappus');
});

/* --------------------------------------------------------------- os cubos */

const CUBO = { 1: [2, 1], 2: [0, null], 3: [4, 2], 4: [0, null], 5: [0, null], 6: [0, null] };

test('os cubos ate Q6, um a um', { timeout: MINUTOS }, () => {
  for (const d of Object.keys(CUBO)) {
    const [quantos, tamanho] = CUBO[d];
    const r = linhaCubo(Number(d));
    assert.equal(r.quantos, quantos, 'Q' + d);
    if (tamanho !== null) assert.deepEqual(r.tamanhos, [tamanho], 'Q' + d);
  }
});

test('o cubo so passa na peneira quando d e 2^r - 1', { timeout: MINUTOS }, () => {
  const passam = [];
  for (let d = 1; d <= 6; d++) if (linhaCubo(d).peneira) passam.push(d);
  assert.deepEqual(passam, [1, 3]);
});

test('o codigo de Hamming esta entre os que a busca acha, em Q1 e Q3', { timeout: MINUTOS }, () => {
  for (const d of [1, 3]) {
    const r = linhaCubo(d);
    assert.equal(r.temHamming, true, 'Q' + d);
    assert.equal(r.hammingEstaLa, true, 'Q' + d);
    assert.equal(r.tamanhoDeHamming, r.tamanhos[0], 'Q' + d);
  }
});

/* --------------------------------------------------------------- o preco */

const PRECO = {
  'C12': [12, 3, 30, 4096],
  'grade 4x4': [16, 2, 45, 65536],
  'Q4': [16, 0, 80, 65536],
  'toro 4x5': [20, 0, 130, 1048576],
};

test('a cobertura exata contra a forca bruta, grafo a grafo', { timeout: MINUTOS }, () => {
  const casos = {
    'C12': ciclo(12), 'grade 4x4': grade(4, 4), 'Q4': cubo(4), 'toro 4x5': toro(4, 5),
  };
  for (const nome of Object.keys(PRECO)) {
    const [n, quantos, nos, testados] = PRECO[nome];
    const r = linhaForcaBruta(nome, casos[nome]);
    assert.equal(r.n, n, nome);
    assert.equal(r.pelaCobertura, quantos, nome);
    assert.equal(r.pelaForcaBruta, quantos, nome);
    assert.equal(r.bate, true, nome);
    assert.equal(r.nosDaCobertura, nos, nome);
    assert.equal(r.testadosPelaBruta, testados, nome);
  }
});

test('a vantagem da cobertura exata cresce com o grafo', { timeout: MINUTOS }, () => {
  const pequeno = linhaForcaBruta('C9', ciclo(9));
  const grande = linhaForcaBruta('toro 4x5', toro(4, 5));
  assert.ok(pequeno.razao < 30, 'C9 deu ' + pequeno.razao);
  assert.ok(grande.razao > 8000, 'toro 4x5 deu ' + grande.razao);
});

test('no Petersen a busca morre em 20 nos, e nao nos 1.024 subconjuntos', { timeout: MINUTOS }, () => {
  const r = linhaForcaBruta('Petersen', petersen());
  assert.equal(r.pelaCobertura, 0);
  assert.equal(r.nosDaCobertura, 20);
  assert.equal(r.testadosPelaBruta, 1024);
});
